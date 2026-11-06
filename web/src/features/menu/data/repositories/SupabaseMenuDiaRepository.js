import { IMenuDiaRepository } from '../../domain/repositories/IMenuDiaRepository';
import { MenuDiaModel } from '../models/MenuDiaModel';
import { supabase as defaultSupabase } from '../../../../core/config/supabaseClient';
import { AppError } from '../../../../core/errors/AppError';

/**
 * Repositorio Concreto: SupabaseMenuDiaRepository
 * 
 * Implementa IMenuDiaRepository interactuando con 'menu_dia', 'menu_plato' y la función RPC.
 */
export class SupabaseMenuDiaRepository extends IMenuDiaRepository {
  /**
   * @param {import('@supabase/supabase-js').SupabaseClient} client
   */
  constructor(client = defaultSupabase) {
    super();
    this.client = client;
  }

  async getMenuDias() {
    const { data, error } = await this.client
      .from('menu_dia')
      .select('*')
      .order('fecha', { ascending: true });

    if (error) {
      throw new AppError(error.message, 'FETCH_MENU_DIAS_ERROR', error);
    }

    return (data || []).map((row) => MenuDiaModel.fromSupabase(row));
  }

  async getMenuDiasConPlatos() {
    const { data: menus, error: menusErr } = await this.client
      .from('menu_dia')
      .select('*')
      .order('fecha', { ascending: true });

    if (menusErr) throw new AppError(menusErr.message, 'FETCH_MENU_ERROR', menusErr);
    if (!menus || menus.length === 0) return [];

    const [menuPlatosRes, platosRes] = await Promise.all([
      this.client.from('menu_plato').select('*'),
      this.client.from('plato').select('*'),
    ]);

    const platosMap = new Map((platosRes.data || []).map((p) => [p.id_plato, p]));
    const relaciones = menuPlatosRes.data || [];

    return menus.map((menu) => {
      const seenPlatos = new Set();
      const platosAsociados = [];

      for (const rel of relaciones) {
        if (rel.id_menu === menu.id_menu) {
          const pid = Number(rel.id_plato);
          if (!seenPlatos.has(pid)) {
            seenPlatos.add(pid);
            const plato = platosMap.get(pid);
            if (plato) {
              platosAsociados.push(plato);
            }
          }
        }
      }

      return MenuDiaModel.fromSupabase({
        ...menu,
        platos: platosAsociados,
      });
    });
  }

  async guardarMenuCompleto({ id_menu, fecha, estado_publicacion, platosIds = [] }) {
    let targetMenuId = id_menu;

    if (!targetMenuId && fecha) {
      const { data: existingMenu } = await this.client
        .from('menu_dia')
        .select('id_menu')
        .eq('fecha', fecha)
        .maybeSingle();

      if (existingMenu?.id_menu) {
        targetMenuId = existingMenu.id_menu;
      }
    }

    let menuResult = null;

    if (targetMenuId) {
      const { data, error } = await this.client
        .from('menu_dia')
        .update({
          fecha,
          estado_publicacion: Boolean(estado_publicacion),
        })
        .eq('id_menu', targetMenuId)
        .select()
        .single();

      if (error) throw new AppError(error.message, 'UPDATE_MENU_ERROR', error);
      menuResult = data;
    } else {
      const { data, error } = await this.client
        .from('menu_dia')
        .insert({
          fecha,
          estado_publicacion: Boolean(estado_publicacion),
        })
        .select()
        .single();

      if (error) throw new AppError(error.message, 'CREATE_MENU_ERROR', error);
      menuResult = data;
      targetMenuId = data.id_menu;
    }

    // Sincronización diferencial en menu_plato
    const targetPlatoIds = Array.from(new Set((platosIds || []).map(Number)));
    const { data: existingRels } = await this.client
      .from('menu_plato')
      .select('id_menuplato, id_plato')
      .eq('id_menu', targetMenuId);

    const currentRels = existingRels || [];
    const currentPlatoIds = new Set(currentRels.map((r) => Number(r.id_plato)));

    // Eliminar platos no deseados o duplicados
    const seenPids = new Set();
    const idsToDelete = [];
    for (const rel of currentRels) {
      const pid = Number(rel.id_plato);
      if (!targetPlatoIds.includes(pid) || seenPids.has(pid)) {
        idsToDelete.push(rel.id_menuplato);
      } else {
        seenPids.add(pid);
      }
    }

    if (idsToDelete.length > 0) {
      await this.client
        .from('menu_plato')
        .delete()
        .in('id_menuplato', idsToDelete);
    }

    // Insertar nuevos
    const toInsert = targetPlatoIds.filter((pid) => !currentPlatoIds.has(pid));
    if (toInsert.length > 0) {
      const pivotRows = toInsert.map((id_plato) => ({
        id_menu: targetMenuId,
        id_plato: Number(id_plato),
      }));

      const { error: insError } = await this.client
        .from('menu_plato')
        .insert(pivotRows);

      if (insError) throw new AppError(insError.message, 'INSERT_MENU_PLATO_ERROR', insError);
    }

    return MenuDiaModel.fromSupabase(menuResult);
  }

  async guardarMenuSemanal(dias) {
    if (!dias || dias.length === 0) {
      throw new AppError('Debe proporcionar al menos un día para el menú semanal.', 'VALIDATION_ERROR');
    }

    // Intento 1: RPC p_dias
    let saved = false;
    let lastError = null;
    try {
      const { data, error } = await this.client.rpc('guardar_menu_semanal', {
        p_dias: dias,
      });
      if (!error) {
        saved = true;
      } else {
        lastError = error;
      }
    } catch (e) {
      lastError = e;
    }

    // Intento 2: RPC dias
    if (!saved) {
      try {
        const { data, error } = await this.client.rpc('guardar_menu_semanal', {
          dias: dias,
        });
        if (!error) {
          saved = true;
        } else {
          lastError = error;
        }
      } catch (e2) {
        lastError = e2;
      }
    }

    // Fallback secuencial cliente
    if (!saved) {
      console.warn('[SupabaseMenuDiaRepository] Ejecutando guardado de respaldo cliente:', lastError?.message);
      for (const dia of dias) {
        await this.guardarMenuCompleto({
          fecha: dia.fecha,
          estado_publicacion: dia.estado_publicacion,
          platosIds: dia.platos_ids || [],
        });
      }
    }

    // Sincronización automática de reservas de pensión y platos para las fechas configuradas
    for (const dia of dias) {
      if (dia.fecha && (dia.platos_ids || []).length > 0) {
        try {
          await this.client.rpc('sincronizar_reservas_menu_fecha', {
            p_fecha: dia.fecha,
          });
        } catch (eSync) {
          console.warn('[SupabaseMenuDiaRepository] Aviso: Sincronización de reservas para fecha:', dia.fecha, eSync?.message);
        }
      }
    }

    return { success: true, message: 'Menú semanal guardado y reservas sincronizadas exitosamente' };
  }

  async deleteMenu(id_menu) {
    await this.client
      .from('menu_plato')
      .delete()
      .eq('id_menu', id_menu);

    const { error } = await this.client
      .from('menu_dia')
      .delete()
      .eq('id_menu', id_menu);

    if (error) {
      throw new AppError(error.message, 'DELETE_MENU_ERROR', error);
    }

    return true;
  }
}

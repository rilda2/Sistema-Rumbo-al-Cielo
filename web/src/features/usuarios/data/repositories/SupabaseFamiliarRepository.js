import { IFamiliarRepository } from '../../domain/repositories/IFamiliarRepository';
import { FamiliarModel } from '../models/FamiliarModel';
import { supabase as defaultSupabase } from '../../../../core/config/supabaseClient';
import { AppError } from '../../../../core/errors/AppError';

/**
 * Repositorio Concreto: SupabaseFamiliarRepository
 * 
 * Implementa IFamiliarRepository para interactuar con las tablas 'familiar' y 'persona'.
 */
export class SupabaseFamiliarRepository extends IFamiliarRepository {
  /**
   * @param {import('@supabase/supabase-js').SupabaseClient} client
   */
  constructor(client = defaultSupabase) {
    super();
    this.client = client;
  }

  async getFamiliaresByUsuario(id_usuario) {
    // 1. Intentar join directo
    const { data, error } = await this.client
      .from('familiar')
      .select(`
        *,
        persona:id_persona (
          id_persona,
          nombre,
          apellidos,
          telefono
        )
      `)
      .eq('id_usuario', id_usuario);

    // Fallback si no está configurada la FK en PostgREST
    if (error) {
      const { data: fData, error: fErr } = await this.client
        .from('familiar')
        .select('*')
        .eq('id_usuario', id_usuario);

      if (fErr) throw new AppError(fErr.message, 'FETCH_FAMILIARES_ERROR', fErr);
      if (!fData || fData.length === 0) return [];

      const personaIds = fData.map((f) => f.id_persona).filter(Boolean);
      if (personaIds.length === 0) return fData.map((f) => FamiliarModel.fromSupabase(f));

      const { data: personasData } = await this.client
        .from('persona')
        .select('*')
        .in('id_persona', personaIds);

      return fData.map((f) => {
        const p = personasData?.find((item) => item.id_persona === f.id_persona);
        return FamiliarModel.fromSupabase({ ...f, persona: p });
      });
    }

    return (data || []).map((row) => FamiliarModel.fromSupabase(row));
  }

  async registerFamiliar({ id_usuario, parentesco, nombre, apellidos, telefono }) {
    // 1. Crear persona
    const { data: personaData, error: personaErr } = await this.client
      .from('persona')
      .insert([
        {
          nombre: nombre.trim(),
          apellidos: apellidos.trim(),
          telefono: telefono ? telefono.trim() : null,
        },
      ])
      .select()
      .single();

    if (personaErr || !personaData) {
      throw new AppError(personaErr?.message || 'Error al registrar persona familiar', 'CREATE_PERSONA_ERROR', personaErr);
    }

    // 2. Asociar en tabla familiar
    const { data: familiarData, error: familiarErr } = await this.client
      .from('familiar')
      .insert([
        {
          id_persona: personaData.id_persona,
          id_usuario,
          parentesco,
        },
      ])
      .select()
      .single();

    if (familiarErr) {
      // Revertir persona creada si falla el vínculo
      await this.client.from('persona').delete().eq('id_persona', personaData.id_persona);
      throw new AppError(familiarErr.message || 'Error al vincular el familiar con el empleado', 'LINK_FAMILIAR_ERROR', familiarErr);
    }

    return FamiliarModel.fromSupabase({
      ...familiarData,
      persona: personaData,
    });
  }

  async deleteFamiliar(id_persona, id_usuario) {
    const { error: fErr } = await this.client
      .from('familiar')
      .delete()
      .eq('id_persona', id_persona)
      .eq('id_usuario', id_usuario);

    if (fErr) {
      throw new AppError(fErr.message, 'DELETE_FAMILIAR_ERROR', fErr);
    }

    // Limpieza opcional de la persona asociada
    await this.client.from('persona').delete().eq('id_persona', id_persona);
  }
}

import { IPensionRepository } from '../../domain/repositories/IPensionRepository';
import { PensionModel } from '../models/PensionModel';
import { supabase as defaultSupabase } from '../../../../core/config/supabaseClient';
import { AppError } from '../../../../core/errors/AppError';

const TABLA = 'pension';
const pad = (n) => String(n).padStart(2, '0');
const nombreDe = (p) => `${p?.nombre || ''} ${p?.apellidos || ''}`.trim();

/**
 * Repositorio Concreto: SupabasePensionRepository
 * Tabla 'pension' + RPC confirmar_pension / cancelar_pension (ver migración SQL).
 */
export class SupabasePensionRepository extends IPensionRepository {
    /** @param {import('@supabase/supabase-js').SupabaseClient} client */
    constructor(client = defaultSupabase) {
        super();
        this.client = client;
    }

    _filtrarComensal(query, idFamiliar) {
        return idFamiliar ? query.eq('id_familiar', idFamiliar) : query.is('id_familiar', null);
    }

    /** Agrega nombre del titular y del beneficiario (familiar) a las filas. */
    async _conNombres(rows) {
        if (!rows.length) return [];

        const idsUsuario = [...new Set(rows.map((r) => r.id_usuario))];
        const idsFamiliar = [...new Set(rows.map((r) => r.id_familiar).filter(Boolean))];

        const { data: usuarios, error: errUsuarios } = await this.client
            .from('vista_usuarios')
            .select('id_usuario, nombre_completo')
            .in('id_usuario', idsUsuario);
        if (errUsuarios) throw new AppError(errUsuarios.message, 'FETCH_PENSION_NOMBRES_ERROR', errUsuarios);

        let familiares = [];
        if (idsFamiliar.length > 0) {
            const { data, error } = await this.client
                .from('familiar')
                .select('id_familiar, parentesco, persona(nombre, apellidos)')
                .in('id_familiar', idsFamiliar);
            if (error) throw new AppError(error.message, 'FETCH_PENSION_FAMILIARES_ERROR', error);
            familiares = data || [];
        }

        const mapaUsuarios = new Map((usuarios || []).map((u) => [u.id_usuario, u.nombre_completo]));
        const mapaFamiliares = new Map(
            familiares.map((f) => {
                const p = Array.isArray(f.persona) ? f.persona[0] : f.persona;
                return [f.id_familiar, `${nombreDe(p) || 'Familiar'} (${f.parentesco})`];
            })
        );

        return rows.map((row) => {
            const titularNombre = mapaUsuarios.get(row.id_usuario) || 'Usuario';
            const beneficiarioNombre = row.id_familiar
                ? mapaFamiliares.get(row.id_familiar) || 'Familiar'
                : titularNombre;
            return PensionModel.fromSupabase(row, { titularNombre, beneficiarioNombre });
        });
    }

    async getPension({ idUsuario, idFamiliar = null, year, mes }) {
        let query = this.client
            .from(TABLA)
            .select('*')
            .eq('id_usuario', idUsuario)
            .eq('year', year)
            .eq('mes', mes);
        query = this._filtrarComensal(query, idFamiliar);

        const { data, error } = await query.maybeSingle();
        if (error) throw new AppError(error.message, 'FETCH_PENSION_ERROR', error);
        return PensionModel.fromSupabase(data);
    }

    async getPensionPorId(idPension) {
        const { data, error } = await this.client
            .from(TABLA)
            .select('*')
            .eq('id_pension', idPension)
            .maybeSingle();

        if (error) throw new AppError(error.message, 'FETCH_PENSION_ERROR', error);
        return PensionModel.fromSupabase(data);
    }

    async getPensionesDeUsuario({ idUsuario, year, mes }) {
        const { data, error } = await this.client
            .from(TABLA)
            .select('*')
            .eq('id_usuario', idUsuario)
            .eq('year', year)
            .eq('mes', mes)
            .order('id_pension', { ascending: true });

        if (error) throw new AppError(error.message, 'FETCH_PENSIONES_ERROR', error);
        return this._conNombres(data || []);
    }

    async getPensionesAdmin({ year, mes, estado = null }) {
        let query = this.client
            .from(TABLA)
            .select('*')
            .eq('year', year)
            .eq('mes', mes)
            .order('fecha_solicitud', { ascending: true });
        if (estado) query = query.eq('estado', estado);

        const { data, error } = await query;
        if (error) throw new AppError(error.message, 'FETCH_PENSIONES_ADMIN_ERROR', error);
        return this._conNombres(data || []);
    }

    async solicitarPension({ idUsuario, idFamiliar = null, year, mes }) {
        // El índice único (usuario, familiar, mes, año) no admite duplicados:
        // si hubo una solicitud Cancelada/Rechazada se reutiliza la misma fila.
        const existente = await this.getPension({ idUsuario, idFamiliar, year, mes });

        if (existente) {
            const { data, error } = await this.client
                .from(TABLA)
                .update({
                    estado: 'Pendiente',
                    activo: false,
                    fecha_solicitud: new Date().toISOString(),
                    fecha_confirmacion: null,
                    confirmado_por: null,
                })
                .eq('id_pension', existente.id)
                .select('*')
                .single();
            if (error) throw new AppError(error.message, 'REQUEST_PENSION_ERROR', error);
            return PensionModel.fromSupabase(data);
        }

        const { data, error } = await this.client
            .from(TABLA)
            .insert({
                id_usuario: idUsuario,
                id_familiar: idFamiliar,
                year,
                mes,
                estado: 'Pendiente',
                activo: false, // pasa a true cuando el administrador confirma
            })
            .select('*')
            .single();

        if (error) throw new AppError(error.message, 'REQUEST_PENSION_ERROR', error);
        return PensionModel.fromSupabase(data);
    }

    async cancelarPension(idPension) {
        const { data, error } = await this.client.rpc('cancelar_pension', {
            p_id_pension: Number(idPension),
        });
        if (error) throw new AppError(error.message, 'CANCEL_PENSION_ERROR', error);
        if (data && data.success === false) {
            throw new AppError(data.message || 'No se pudo cancelar la pensión.', 'VALIDATION_ERROR');
        }
        return true;
    }

    async confirmarPension(idPension) {
        const { data, error } = await this.client.rpc('confirmar_pension', {
            p_id_pension: Number(idPension),
        });
        if (error) throw new AppError(error.message, 'CONFIRM_PENSION_ERROR', error);
        if (data && data.success === false) {
            throw new AppError(data.message || 'No se pudo confirmar la pensión.', 'VALIDATION_ERROR');
        }
        return { reservasCreadas: Number(data?.reservas_creadas ?? 0) };
    }

    async rechazarPension(idPension) {
        const { error } = await this.client
            .from(TABLA)
            .update({ estado: 'Rechazada', activo: false })
            .eq('id_pension', idPension)
            .eq('estado', 'Pendiente');

        if (error) throw new AppError(error.message, 'REJECT_PENSION_ERROR', error);
        return true;
    }

    async contarAlmuerzosVigentes({ idUsuario, idFamiliar = null, year, mes }) {
        const desde = `${year}-${pad(mes)}-01`;
        const siguiente = new Date(year, mes, 1); // mes es 1..12: esto da el día 1 del mes siguiente
        const hasta = `${siguiente.getFullYear()}-${pad(siguiente.getMonth() + 1)}-01`;

        let query = this.client
            .from('reserva')
            .select('id_reserva', { count: 'exact', head: true })
            .eq('id_usuario', idUsuario)
            .eq('es_pension', true)
            .neq('estado', 'cancelada')
            .gte('fecha', desde)
            .lt('fecha', hasta);
        query = this._filtrarComensal(query, idFamiliar);

        const { count, error } = await query;
        if (error) throw new AppError(error.message, 'COUNT_ALMUERZOS_ERROR', error);
        return count ?? 0;
    }
}
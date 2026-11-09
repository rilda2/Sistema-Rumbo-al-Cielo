import { IReservaRepository } from '../../domain/repositories/IReservaRepository';
import { ReservaModel } from '../models/ReservaModel';
import { supabase as defaultSupabase } from '../../../../core/config/supabaseClient';
import { AppError } from '../../../../core/errors/AppError';

const VISTA = 'vista_reservas_completas';

/**
 * Repositorio Concreto: SupabaseReservaRepository
 * Lee de la vista 'vista_reservas_completas' (ya trae nombres de empleado y familiar)
 * y escribe en la tabla 'reserva'. Las fechas viajan como texto 'YYYY-MM-DD'.
 */
export class SupabaseReservaRepository extends IReservaRepository {
    /** @param {import('@supabase/supabase-js').SupabaseClient} client */
    constructor(client = defaultSupabase) {
        super();
        this.client = client;
    }

    async asignarComboAReservasPension(fecha, combo) {
        const { data, error } = await this.client
            .from('reserva')
            .update({
                dish_name: combo.dishName,
                plato_principal: combo.platoPrincipal,
                sopa_nombre: combo.sopaNombre,
                entrada_nombre: combo.entradaNombre,
                es_almuerzo_completo: combo.esAlmuerzoCompleto,
                categoria_menu: combo.categoriaMenu,
            })
            .eq('fecha', fecha)
            .eq('es_pension', true)
            .eq('estado', 'confirmada')
            .is('dish_name', null)
            .select('id_reserva');

        if (error) throw new AppError(error.message, 'ASSIGN_PLATOS_PENSION_ERROR', error);
        return (data || []).length;
    }

    async getReservasDeUsuario(idUsuario) {
        const { data, error } = await this.client
            .from(VISTA)
            .select('*')
            .eq('id_usuario', idUsuario)
            .order('fecha', { ascending: false })
            .order('id_reserva', { ascending: false });

        if (error) throw new AppError(error.message, 'FETCH_RESERVAS_ERROR', error);
        return (data || []).map((row) => ReservaModel.fromSupabase(row));
    }

    async getReservasPorFecha(fecha) {
        const { data, error } = await this.client
            .from(VISTA)
            .select('*')
            .eq('fecha', fecha)
            .order('id_reserva', { ascending: true });

        if (error) throw new AppError(error.message, 'FETCH_RESERVAS_FECHA_ERROR', error);
        return (data || []).map((row) => ReservaModel.fromSupabase(row));
    }

    async getReservaById(idReserva) {
        const { data, error } = await this.client
            .from(VISTA)
            .select('*')
            .eq('id_reserva', idReserva)
            .maybeSingle();

        if (error) throw new AppError(error.message, 'FETCH_RESERVA_ERROR', error);
        return data ? ReservaModel.fromSupabase(data) : null;
    }

    async getFamiliaresDeUsuario(idUsuario) {
        const { data, error } = await this.client
            .from('familiar')
            .select('id_familiar, parentesco, persona(nombre, apellidos)')
            .eq('id_usuario', idUsuario)
            .order('id_familiar', { ascending: true });

        if (error) throw new AppError(error.message, 'FETCH_FAMILIARES_ERROR', error);

        return (data || []).map((row) => {
            const p = Array.isArray(row.persona) ? row.persona[0] : row.persona;
            const nombre = `${p?.nombre || ''} ${p?.apellidos || ''}`.trim();
            return {
                idFamiliar: row.id_familiar,
                parentesco: row.parentesco,
                nombre: nombre || 'Familiar sin nombre',
            };
        });
    }

    async getTarifas() {
        const { data, error } = await this.client
            .from('configuracion')
            .select('precio_esporadico, precio_pension')
            .order('id_config', { ascending: true })
            .limit(1)
            .maybeSingle();

        if (error) throw new AppError(error.message, 'FETCH_TARIFAS_ERROR', error);

        return {
            precioEsporadico: Number(data?.precio_esporadico ?? 18),
            precioPension: Number(data?.precio_pension ?? 15),
        };
    }

    async tienePensionActiva(idUsuario, fecha, idFamiliar = null) {
        const [anio, mes] = String(fecha).split('-').map(Number);

        let query = this.client
            .from('pension')
            .select('id_pension')
            .eq('id_usuario', idUsuario)
            .eq('year', anio)
            .eq('mes', mes)
            .eq('estado', 'Confirmada')
            .eq('activo', true);

        query = idFamiliar ? query.eq('id_familiar', idFamiliar) : query.is('id_familiar', null);

        const { data, error } = await query.limit(1);
        if (error) throw new AppError(error.message, 'CHECK_PENSION_ERROR', error);
        return (data || []).length > 0;
    }

    async existeReservaActiva({ idUsuario, idFamiliar, fecha }) {
        let query = this.client
            .from('reserva')
            .select('id_reserva')
            .eq('id_usuario', idUsuario)
            .eq('fecha', fecha)
            .neq('estado', 'cancelada');

        query = idFamiliar ? query.eq('id_familiar', idFamiliar) : query.is('id_familiar', null);

        const { data, error } = await query.limit(1);
        if (error) throw new AppError(error.message, 'CHECK_RESERVA_ERROR', error);
        return (data || []).length > 0;
    }

    async crearReserva(datos) {
        const { data, error } = await this.client
            .from('reserva')
            .insert(ReservaModel.toInsertRow(datos))
            .select('id_reserva')
            .single();

        if (error) throw new AppError(error.message, 'CREATE_RESERVA_ERROR', error);
        return await this.getReservaById(data.id_reserva);
    }

    async cancelarReserva(idReserva) {
        const { error } = await this.client
            .from('reserva')
            .update({ estado: 'cancelada' })
            .eq('id_reserva', idReserva);

        if (error) throw new AppError(error.message, 'CANCEL_RESERVA_ERROR', error);
        return true;
    }

    async marcarEntrega(idReserva) {
        const { error } = await this.client
            .from('reserva')
            .update({ estado: 'entregada', recogido: true })
            .eq('id_reserva', idReserva);

        if (error) throw new AppError(error.message, 'DELIVER_RESERVA_ERROR', error);
        return true;
    }
}
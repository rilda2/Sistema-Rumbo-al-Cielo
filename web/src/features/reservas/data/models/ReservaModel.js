import { ReservaEntity } from '../../domain/entities/ReservaEntity';

/**
 * Modelo de Datos: ReservaModel
 * Convierte filas de 'vista_reservas_completas' / 'reserva' en ReservaEntity
 * y arma la fila a insertar al crear una reserva.
 */
export class ReservaModel {
    static fromSupabase(row) {
        if (!row) return null;

        return new ReservaEntity({
            id: row.id_reserva ?? row.id,
            idUsuario: row.id_usuario,
            idFamiliar: row.id_familiar ?? null,
            fecha: String(row.fecha || row.reservation_date || '').split('T')[0],
            dishName: row.dish_name || '',
            platoPrincipal: row.plato_principal ?? null,
            sopaNombre: row.sopa_nombre ?? null,
            entradaNombre: row.entrada_nombre ?? null,
            esAlmuerzoCompleto: row.es_almuerzo_completo !== false,
            categoriaMenu: row.categoria_menu || 'almuerzo_completo',
            estado: String(row.estado || 'confirmada').toLowerCase(),
            tipo: String(row.tipo || 'diaria').toLowerCase(),
            esPension: row.es_pension === true,
            costoAplicado: Number(row.costo_aplicado ?? 0),
            recogido: row.recogido === true,
            notas: row.notas ?? null,
            createdAt: row.created_at ?? null,
            empleadoNombre: row.empleado_nombre || '',
            empleadoCi: row.ci_codigo || '',
            beneficiarioNombre: row.beneficiary_name || '',
        });
    }

    /** Fila para insertar en la tabla 'reserva'. */
    static toInsertRow(datos) {
        return {
            id_usuario: datos.idUsuario,
            id_familiar: datos.idFamiliar ?? null,
            fecha: datos.fecha,
            dish_name: datos.dishName,
            plato_principal: datos.platoPrincipal,
            sopa_nombre: datos.sopaNombre,
            entrada_nombre: datos.entradaNombre,
            es_almuerzo_completo: datos.esAlmuerzoCompleto,
            categoria_menu: datos.categoriaMenu,
            estado: 'confirmada',
            tipo: datos.tipo,
            es_pension: datos.esPension,
            costo_aplicado: datos.costoAplicado,
            notas: datos.notas ?? null,
        };
    }
}
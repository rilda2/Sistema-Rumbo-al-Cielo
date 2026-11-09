import { PensionEntity } from '../../domain/entities/PensionEntity';

/** Convierte una fila de la tabla 'pension' en PensionEntity. */
export class PensionModel {
    static fromSupabase(row, extra = {}) {
        if (!row) return null;

        return new PensionEntity({
            id: row.id_pension,
            idUsuario: row.id_usuario,
            idFamiliar: row.id_familiar ?? null,
            mes: row.mes,
            year: row.year,
            estado: row.estado || 'Pendiente',
            activo: row.activo !== false,
            fechaSolicitud: row.fecha_solicitud ?? row.created_at ?? null,
            fechaConfirmacion: row.fecha_confirmacion ?? null,
            confirmadoPor: row.confirmado_por ?? null,
            titularNombre: extra.titularNombre || '',
            beneficiarioNombre: extra.beneficiarioNombre || '',
        });
    }
}
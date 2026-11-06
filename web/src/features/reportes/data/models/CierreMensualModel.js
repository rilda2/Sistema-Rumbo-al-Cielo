import { CierreMensualEntity } from '../../domain/entities/CierreMensualEntity';

/**
 * Modelo de Datos: CierreMensualModel
 * Mapea entre la tabla Supabase 'cierre_mensual' y la entidad CierreMensualEntity.
 */
export class CierreMensualModel {
  static toEntity(record) {
    if (!record) return null;
    return new CierreMensualEntity({
      id_cierre: record.id_cierre,
      mes: record.mes,
      year: record.year,
      fecha_generacion: record.fecha_generacion,
      total_general: record.total_general,
      cerrado: record.cerrado,
      created_at: record.created_at,
    });
  }

  static toDatabase(entity) {
    const payload = {
      mes: entity.mes,
      year: entity.year,
      fecha_generacion: entity.fecha_generacion,
      total_general: entity.total_general,
      cerrado: entity.cerrado,
    };
    if (entity.id_cierre) {
      payload.id_cierre = entity.id_cierre;
    }
    return payload;
  }
}

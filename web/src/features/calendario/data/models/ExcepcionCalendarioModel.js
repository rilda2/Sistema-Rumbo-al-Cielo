import { ExcepcionCalendarioEntity } from '../../domain/entities/ExcepcionCalendarioEntity';

/**
 * Modelo de Datos: ExcepcionCalendarioModel
 * 
 * Regla de Clean Architecture:
 * - Mapea las filas de la tabla 'excepcion_calendario' de Supabase hacia ExcepcionCalendarioEntity.
 */
export class ExcepcionCalendarioModel {
  static fromSupabase(row) {
    if (!row) return null;

    return new ExcepcionCalendarioEntity({
      id_excepcion: row.id_excepcion || row.id || row.fecha,
      fecha: row.fecha,
      motivo: row.motivo,
      id_encargado: row.id_encargado,
      created_at: row.created_at,
      is_activo: row.is_activo !== false,
    });
  }

  static toSupabase(entity) {
    return {
      fecha: entity.fecha,
      motivo: entity.motivo,
      id_encargado: entity.id_encargado,
      is_activo: entity.is_activo !== undefined ? entity.is_activo : true,
    };
  }
}

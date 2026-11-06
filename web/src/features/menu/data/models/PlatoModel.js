import { PlatoEntity } from '../../domain/entities/PlatoEntity';

/**
 * Modelo de Datos: PlatoModel
 * 
 * Mapea las filas de la tabla 'plato' de Supabase hacia PlatoEntity.
 */
export class PlatoModel {
  static fromSupabase(row) {
    if (!row) return null;

    return new PlatoEntity({
      id_plato: row.id_plato,
      nombre: row.nombre,
      descripcion: row.descripcion,
      imagen_url: row.imagen_url,
      created_at: row.created_at,
    });
  }

  static toSupabase(entity) {
    return {
      nombre: entity.nombre,
      descripcion: entity.descripcion,
      imagen_url: entity.imagen_url,
    };
  }
}

import { MenuDiaEntity } from '../../domain/entities/MenuDiaEntity';
import { PlatoModel } from './PlatoModel';

/**
 * Modelo de Datos: MenuDiaModel
 * 
 * Mapea las filas de 'menu_dia' con sus platos asociados hacia MenuDiaEntity.
 */
export class MenuDiaModel {
  static fromSupabase(row) {
    if (!row) return null;

    const platosEntities = (row.platos || []).map((p) => PlatoModel.fromSupabase(p));

    return new MenuDiaEntity({
      id_menu: row.id_menu,
      fecha: row.fecha,
      estado_publicacion: row.estado_publicacion,
      platos: platosEntities,
      created_at: row.created_at,
    });
  }

  static toSupabase(entity) {
    return {
      fecha: entity.fecha,
      estado_publicacion: entity.estado_publicacion,
    };
  }
}

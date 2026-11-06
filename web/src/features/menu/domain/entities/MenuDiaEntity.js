/**
 * Entidad de Dominio: MenuDiaEntity
 * 
 * Regla de Clean Architecture:
 * - Modela el menú del día programado para una fecha, su estado de publicación y sus platos asignados.
 */
export class MenuDiaEntity {
  constructor({
    id_menu,
    fecha,
    estado_publicacion = false,
    platos = [],
    created_at = null,
  }) {
    this.id_menu = id_menu;
    this.fecha = fecha ? fecha.split('T')[0] : '';
    this.estado_publicacion = Boolean(estado_publicacion);
    this.platos = platos || [];
    this.created_at = created_at;
  }

  get id() {
    return this.id_menu;
  }

  isPublicado() {
    return this.estado_publicacion === true;
  }

  hasPlatos() {
    return this.platos.length > 0;
  }

  totalPlatos() {
    return this.platos.length;
  }
}

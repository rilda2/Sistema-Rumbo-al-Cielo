/**
 * Entidad de Dominio: PlatoEntity
 * 
 * Regla de Clean Architecture:
 * - Cero dependencias externas.
 * - Modela las reglas e invariantes de un plato o alimento del catálogo del restaurante.
 */
export class PlatoEntity {
  constructor({
    id_plato,
    nombre = '',
    descripcion = '',
    imagen_url = null,
    created_at = null,
  }) {
    this.id_plato = id_plato;
    this.nombre = (nombre || '').trim();
    this.descripcion = (descripcion || '').trim();
    this.imagen_url = imagen_url || null;
    this.created_at = created_at;
  }

  get id() {
    return this.id_plato;
  }

  hasImagen() {
    return Boolean(this.imagen_url);
  }
}

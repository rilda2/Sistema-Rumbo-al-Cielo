/**
 * Entidad de Dominio: FamiliarEntity
 * 
 * Regla de Clean Architecture:
 * - Modela los dependientes/familiares de un empleado del restaurante.
 * - Libre de dependencias externas.
 */
export const PARENTESCOS_VALIDOS = ['Esposa', 'Esposo', 'Hijo', 'Hija'];

export class FamiliarEntity {
  constructor({
    id_persona,
    id_usuario,
    parentesco,
    nombre = '',
    apellidos = '',
    telefono = '',
  }) {
    this.id_persona = id_persona;
    this.id_usuario = id_usuario;
    this.parentesco = parentesco;
    this.nombre = nombre;
    this.apellidos = apellidos;
    this.telefono = telefono;
  }

  get nombreCompleto() {
    return `${this.nombre} ${this.apellidos}`.trim();
  }

  static isValidParentesco(parentesco) {
    return PARENTESCOS_VALIDOS.includes(parentesco);
  }
}

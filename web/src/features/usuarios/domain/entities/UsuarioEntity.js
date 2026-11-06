/**
 * Entidad de Dominio: UsuarioEntity
 * 
 * Regla de Clean Architecture:
 * - Cero dependencias externas.
 * - Modela las reglas e invariantes del negocio para los usuarios del restaurante.
 */
export class UsuarioEntity {
  constructor({
    id_usuario,
    email,
    nombres = '',
    apellidos = '',
    ci_codigo = '',
    telefono = '',
    rol = 'Empleado',
    activo = true,
    created_at = null,
  }) {
    this.id_usuario = id_usuario;
    this.email = email;
    this.nombres = nombres;
    this.apellidos = apellidos;
    this.ci_codigo = ci_codigo;
    this.telefono = telefono;
    this.rol = rol;
    this.activo = activo;
    this.created_at = created_at;
  }

  get nombreCompleto() {
    const full = `${this.nombres} ${this.apellidos}`.trim();
    return full || this.email || 'Usuario';
  }

  // Compatibilidad con props de componentes
  get nombre() {
    return this.nombres;
  }

  get nombre_completo() {
    return this.nombreCompleto;
  }

  isAdmin() {
    return this.rol?.toLowerCase() === 'administrador';
  }

  isEmpleado() {
    return this.rol?.toLowerCase() === 'empleado';
  }

  isInstitucion() {
    return this.rol?.toLowerCase() === 'institucion';
  }

  isActivo() {
    return Boolean(this.activo);
  }
}

/**
 * Entidad de Dominio: PerfilEntity
 * 
 * Regla de Clean Architecture:
 * - Cero dependencias externas.
 * - Modela los datos personales del usuario logueado en "Mi Cuenta".
 */
export class PerfilEntity {
  constructor({
    id_usuario,
    email,
    nombres = '',
    apellidos = '',
    ci_codigo = '',
    telefono = '',
    rol = 'Empleado',
    notificaciones = true,
  }) {
    this.id_usuario = id_usuario;
    this.email = email;
    this.nombres = (nombres || '').trim();
    this.apellidos = (apellidos || '').trim();
    this.ci_codigo = (ci_codigo || '').trim();
    this.telefono = (telefono || '').trim();
    this.rol = rol;
    this.notificaciones = notificaciones;
  }

  get nombreCompleto() {
    return `${this.nombres} ${this.apellidos}`.trim() || this.email;
  }

  isAdmin() {
    return this.rol?.toLowerCase() === 'administrador';
  }
}

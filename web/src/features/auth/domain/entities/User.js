/**
 * Entidad de Dominio: User
 * 
 * Regla de Clean Architecture: 
 * - CERO dependencias de frameworks (React) o proveedores externos (Supabase, Firebase).
 * - Representa el modelo puro del negocio y sus invariantes/reglas internas.
 */
export class User {
  constructor({
    id,
    email,
    nombres = '',
    apellidos = '',
    ciCodigo = '',
    telefono = '',
    rol = 'Empleado',
    activo = true,
    createdAt = null,
  }) {
    this.id = id;
    this.email = email;
    this.nombres = nombres;
    this.apellidos = apellidos;
    this.ciCodigo = ciCodigo;
    this.telefono = telefono;
    this.rol = rol;
    this.activo = activo;
    this.createdAt = createdAt;
  }

  // Compatibilidad con vistas y código existente
  get ci_codigo() {
    return this.ciCodigo;
  }

  get created_at() {
    return this.createdAt;
  }

  get nombre() {
    return this.nombres;
  }

  get nombre_completo() {
    return this.nombreCompleto;
  }

  get id_usuario() {
    return this.id;
  }

  get nombreCompleto() {
    const full = `${this.nombres} ${this.apellidos}`.trim();
    return full || this.email || 'Usuario';
  }

  isAdmin() {
    return this.rol?.toLowerCase() === 'administrador';
  }

  isInstitucion() {
    return this.rol?.toLowerCase() === 'institucion';
  }

  isEmpleado() {
    return this.rol?.toLowerCase() === 'empleado';
  }

  tieneAccesoWeb() {
    const rolLower = this.rol?.toLowerCase();
    return (
      rolLower === 'administrador' ||
      rolLower === 'institucion' ||
      rolLower === 'empleado'
    );
  }

  isActivo() {
    return Boolean(this.activo);
  }
}

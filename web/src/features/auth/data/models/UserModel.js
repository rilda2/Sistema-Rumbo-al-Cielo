import { User } from '../../domain/entities/User';

/**
 * Modelo de Datos: UserModel
 * 
 * Regla de Clean Architecture:
 * - Responsable de mapear las respuestas de Supabase (tablas, auth, vistas como 'vista_usuarios')
 *   hacia las Entidades puras de Dominio (User).
 * - Protege al dominio si las columnas de Supabase cambian de nombre en la BD.
 */
export class UserModel {
  /**
   * Transforma una fila de PostgreSQL/Supabase (ej. vista_usuarios) + Auth en User Entity
   * @param {object} authUser - Objeto retornado por supabase.auth
   * @param {object} profileRow - Fila retornada por vista_usuarios
   * @returns {User}
   */
  static fromSupabase(authUser, profileRow = {}) {
    if (!authUser && !profileRow) return null;

    const metadata = authUser?.user_metadata || {};

    return new User({
      id: authUser?.id || profileRow?.id_usuario,
      email: authUser?.email || profileRow?.email || '',
      nombres: profileRow?.nombres || profileRow?.nombre || metadata.nombres || metadata.nombre || '',
      apellidos: profileRow?.apellidos || metadata.apellidos || '',
      ciCodigo: profileRow?.ci_codigo || metadata.ci_codigo || '',
      telefono: profileRow?.telefono || metadata.telefono || '',
      rol: profileRow?.rol || metadata.rol || 'Empleado',
      activo: profileRow?.activo !== undefined ? profileRow.activo : true,
      createdAt: profileRow?.created_at || authUser?.created_at || null,
    });
  }

  /**
   * Mapeo inverso si se requiere enviar a Supabase (DTO)
   */
  static toSupabase(userEntity) {
    return {
      nombres: userEntity.nombres,
      apellidos: userEntity.apellidos,
      ci_codigo: userEntity.ciCodigo,
      telefono: userEntity.telefono,
      rol: userEntity.rol,
      activo: userEntity.activo,
    };
  }
}

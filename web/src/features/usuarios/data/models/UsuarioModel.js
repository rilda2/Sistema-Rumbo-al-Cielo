import { UsuarioEntity } from '../../domain/entities/UsuarioEntity';

/**
 * Modelo de Datos: UsuarioModel
 * 
 * Mapea las filas de la vista SQL 'vista_usuarios' de Supabase hacia UsuarioEntity.
 */
export class UsuarioModel {
  static fromSupabase(row) {
    if (!row) return null;

    return new UsuarioEntity({
      id_usuario: row.id_usuario,
      email: row.email || '',
      nombres: row.nombres || row.nombre || '',
      apellidos: row.apellidos || '',
      ci_codigo: row.ci_codigo || '',
      telefono: row.telefono || '',
      rol: row.rol || 'Empleado',
      activo: row.activo !== undefined ? row.activo : true,
      created_at: row.created_at || null,
    });
  }

  static toSupabase(entity) {
    return {
      nombre: entity.nombres,
      apellidos: entity.apellidos,
      ci_codigo: entity.ci_codigo,
      telefono: entity.telefono,
      rol: entity.rol,
      activo: entity.activo,
    };
  }
}

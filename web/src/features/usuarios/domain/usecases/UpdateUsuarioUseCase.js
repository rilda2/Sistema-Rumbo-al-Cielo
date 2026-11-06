import { AppError } from '../../../../core/errors/AppError';

/**
 * Caso de Uso: UpdateUsuarioUseCase
 * 
 * Regla de Clean Architecture:
 * - Valida las reglas de negocio e invariantes para la actualización de datos personales de un usuario.
 * - Verifica completitud de nombres, apellidos y formato de datos.
 * - Valida disponibilidad/unicidad de CI y teléfono si han cambiado.
 */
export class UpdateUsuarioUseCase {
  /**
   * @param {import('../repositories/IUsuarioRepository').IUsuarioRepository} usuarioRepository
   */
  constructor(usuarioRepository) {
    if (!usuarioRepository) {
      throw new Error('UpdateUsuarioUseCase requiere IUsuarioRepository');
    }
    this.usuarioRepository = usuarioRepository;
  }

  async execute(id_usuario, userData) {
    if (!id_usuario) {
      throw new AppError('Se requiere el identificador de usuario.', 'VALIDATION_ERROR');
    }

    const { nombre, nombres, apellidos, ci_codigo, telefono, rol } = userData;
    const cleanNombre = (nombres || nombre || '').trim();
    const cleanApellidos = (apellidos || '').trim();
    const cleanCi = (ci_codigo || '').trim();
    const cleanTelefono = (telefono || '').trim();
    const validRoles = ['Administrador', 'Empleado', 'Institucion'];

    if (!cleanNombre) {
      throw new AppError('El nombre del usuario es obligatorio.', 'VALIDATION_ERROR');
    }

    if (!cleanApellidos) {
      throw new AppError('Los apellidos del usuario son obligatorios.', 'VALIDATION_ERROR');
    }

    if (!cleanCi) {
      throw new AppError('El número de C.I. es obligatorio.', 'VALIDATION_ERROR');
    }

    if (rol && !validRoles.includes(rol)) {
      throw new AppError(`El rol debe ser uno de los siguientes: ${validRoles.join(', ')}`, 'VALIDATION_ERROR');
    }

    // Validar unicidad de CI y teléfono excluyendo al usuario actual si la implementación lo soporta
    if (this.usuarioRepository.checkUniqueness) {
      const uniqueness = await this.usuarioRepository.checkUniqueness({
        ci_codigo: cleanCi,
        telefono: cleanTelefono,
        excludeUserId: id_usuario,
      });

      if (uniqueness.isCiAvailable === false) {
        throw new AppError(`El número de C.I. "${cleanCi}" ya se encuentra registrado por otro usuario.`, 'DUPLICATE_CI');
      }

      if (cleanTelefono && uniqueness.isPhoneAvailable === false) {
        throw new AppError(`El teléfono "${cleanTelefono}" ya se encuentra registrado por otro usuario.`, 'DUPLICATE_PHONE');
      }
    }

    return await this.usuarioRepository.updateUsuario(id_usuario, {
      nombre: cleanNombre,
      nombres: cleanNombre,
      apellidos: cleanApellidos,
      ci_codigo: cleanCi,
      telefono: cleanTelefono,
      rol,
    });
  }
}


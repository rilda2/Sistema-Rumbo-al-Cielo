import { AppError } from '../../../../core/errors/AppError';

/**
 * Caso de Uso: CambiarPasswordUsuarioUseCase
 * 
 * Regla de Clean Architecture:
 * - Valida reglas de negocio (longitud mínima, identificador de usuario válido).
 * - Delega la actualización segura al repositorio sin acoplamiento a Supabase.
 */
export class CambiarPasswordUsuarioUseCase {
  /**
   * @param {import('../repositories/IUsuarioRepository').IUsuarioRepository} usuarioRepository
   */
  constructor(usuarioRepository) {
    if (!usuarioRepository) {
      throw new Error('CambiarPasswordUsuarioUseCase requiere una instancia de IUsuarioRepository');
    }
    this.usuarioRepository = usuarioRepository;
  }

  /**
   * @param {string} id_usuario
   * @param {string} nuevo_password
   */
  async execute(id_usuario, nuevo_password) {
    if (!id_usuario) {
      throw new AppError('El identificador del usuario es obligatorio.', 'VALIDATION_ERROR');
    }

    const cleanPassword = (nuevo_password || '').trim();
    if (!cleanPassword) {
      throw new AppError('La nueva contraseña no puede estar vacía.', 'VALIDATION_ERROR');
    }

    if (cleanPassword.length < 6) {
      throw new AppError('La nueva contraseña debe tener al menos 6 caracteres.', 'VALIDATION_ERROR');
    }

    return await this.usuarioRepository.cambiarPasswordUsuario(id_usuario, cleanPassword);
  }
}

import { AppError } from '../../../../core/errors/AppError';

/**
 * Caso de Uso: DeleteUsuarioUseCase
 */
export class DeleteUsuarioUseCase {
  /**
   * @param {import('../repositories/IUsuarioRepository').IUsuarioRepository} usuarioRepository
   */
  constructor(usuarioRepository) {
    if (!usuarioRepository) {
      throw new Error('DeleteUsuarioUseCase requiere IUsuarioRepository');
    }
    this.usuarioRepository = usuarioRepository;
  }

  async execute(id_usuario) {
    if (!id_usuario) {
      throw new AppError('El ID del usuario es requerido para eliminarlo.', 'VALIDATION_ERROR');
    }
    return await this.usuarioRepository.deleteUsuario(id_usuario);
  }
}

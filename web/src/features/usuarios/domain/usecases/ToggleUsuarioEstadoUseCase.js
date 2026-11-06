import { AppError } from '../../../../core/errors/AppError';

/**
 * Caso de Uso: ToggleUsuarioEstadoUseCase
 */
export class ToggleUsuarioEstadoUseCase {
  /**
   * @param {import('../repositories/IUsuarioRepository').IUsuarioRepository} usuarioRepository
   */
  constructor(usuarioRepository) {
    if (!usuarioRepository) {
      throw new Error('ToggleUsuarioEstadoUseCase requiere IUsuarioRepository');
    }
    this.usuarioRepository = usuarioRepository;
  }

  async execute(id_usuario, nuevoEstado) {
    if (!id_usuario) {
      throw new AppError('El ID del usuario es requerido para cambiar su estado.', 'VALIDATION_ERROR');
    }
    return await this.usuarioRepository.toggleEstado(id_usuario, Boolean(nuevoEstado));
  }
}

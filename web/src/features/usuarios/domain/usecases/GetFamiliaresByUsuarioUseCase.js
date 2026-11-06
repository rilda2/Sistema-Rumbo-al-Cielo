import { AppError } from '../../../../core/errors/AppError';

/**
 * Caso de Uso: GetFamiliaresByUsuarioUseCase
 */
export class GetFamiliaresByUsuarioUseCase {
  /**
   * @param {import('../repositories/IFamiliarRepository').IFamiliarRepository} familiarRepository
   */
  constructor(familiarRepository) {
    if (!familiarRepository) {
      throw new Error('GetFamiliaresByUsuarioUseCase requiere IFamiliarRepository');
    }
    this.familiarRepository = familiarRepository;
  }

  async execute(id_usuario) {
    if (!id_usuario) {
      throw new AppError('El ID del empleado es requerido para obtener sus familiares.', 'VALIDATION_ERROR');
    }
    return await this.familiarRepository.getFamiliaresByUsuario(id_usuario);
  }
}

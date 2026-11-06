import { AppError } from '../../../../core/errors/AppError';

/**
 * Caso de Uso: DeleteFamiliarUseCase
 */
export class DeleteFamiliarUseCase {
  /**
   * @param {import('../repositories/IFamiliarRepository').IFamiliarRepository} familiarRepository
   */
  constructor(familiarRepository) {
    if (!familiarRepository) {
      throw new Error('DeleteFamiliarUseCase requiere IFamiliarRepository');
    }
    this.familiarRepository = familiarRepository;
  }

  async execute(id_persona, id_usuario) {
    if (!id_persona || !id_usuario) {
      throw new AppError('Se requiere el id de persona e id de usuario para eliminar al familiar.', 'VALIDATION_ERROR');
    }
    return await this.familiarRepository.deleteFamiliar(id_persona, id_usuario);
  }
}

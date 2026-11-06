import { AppError } from '../../../../core/errors/AppError';

/**
 * Caso de Uso: DeletePlatoUseCase
 */
export class DeletePlatoUseCase {
  /**
   * @param {import('../repositories/IPlatoRepository').IPlatoRepository} platoRepository
   */
  constructor(platoRepository) {
    if (!platoRepository) {
      throw new Error('DeletePlatoUseCase requiere IPlatoRepository');
    }
    this.platoRepository = platoRepository;
  }

  async execute(id_plato, currentImageUrl = null) {
    if (!id_plato) {
      throw new AppError('El ID del plato es obligatorio para eliminar.', 'VALIDATION_ERROR');
    }
    return await this.platoRepository.deletePlato(id_plato, currentImageUrl);
  }
}

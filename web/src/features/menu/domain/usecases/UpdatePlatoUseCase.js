import { AppError } from '../../../../core/errors/AppError';

/**
 * Caso de Uso: UpdatePlatoUseCase
 */
export class UpdatePlatoUseCase {
  /**
   * @param {import('../repositories/IPlatoRepository').IPlatoRepository} platoRepository
   */
  constructor(platoRepository) {
    if (!platoRepository) {
      throw new Error('UpdatePlatoUseCase requiere IPlatoRepository');
    }
    this.platoRepository = platoRepository;
  }

  async execute(id_plato, updateData, newImageFile = null, removeCurrentImage = false, currentImageUrl = null) {
    if (!id_plato) {
      throw new AppError('El ID del plato es obligatorio para actualizar.', 'VALIDATION_ERROR');
    }

    const cleanNombre = (updateData?.nombre || '').trim();
    if (!cleanNombre) {
      throw new AppError('El nombre del plato no puede estar vacío.', 'VALIDATION_ERROR');
    }

    return await this.platoRepository.updatePlato(
      id_plato,
      {
        nombre: cleanNombre,
        descripcion: (updateData?.descripcion || '').trim(),
      },
      newImageFile,
      removeCurrentImage,
      currentImageUrl
    );
  }
}

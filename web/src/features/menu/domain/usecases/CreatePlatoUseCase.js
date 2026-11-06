import { AppError } from '../../../../core/errors/AppError';

/**
 * Caso de Uso: CreatePlatoUseCase
 * 
 * Regla de Clean Architecture:
 * - Valida las reglas de negocio de un nuevo plato en el restaurante.
 */
export class CreatePlatoUseCase {
  /**
   * @param {import('../repositories/IPlatoRepository').IPlatoRepository} platoRepository
   */
  constructor(platoRepository) {
    if (!platoRepository) {
      throw new Error('CreatePlatoUseCase requiere IPlatoRepository');
    }
    this.platoRepository = platoRepository;
  }

  async execute(platoData, imageFile = null) {
    const cleanNombre = (platoData?.nombre || '').trim();
    const cleanDescripcion = (platoData?.descripcion || '').trim();

    if (!cleanNombre) {
      throw new AppError('El nombre del plato es obligatorio.', 'VALIDATION_ERROR');
    }

    if (cleanNombre.length < 3) {
      throw new AppError('El nombre del plato debe tener al menos 3 caracteres.', 'VALIDATION_ERROR');
    }

    return await this.platoRepository.createPlato(
      {
        nombre: cleanNombre,
        descripcion: cleanDescripcion,
      },
      imageFile
    );
  }
}

import { AppError } from '../../../../core/errors/AppError';

/**
 * Caso de Uso: SaveMenuSemanalUseCase
 * 
 * Regla de Clean Architecture:
 * - Valida que existan días modificados con fechas válidas.
 * - Si un día está publicado, debe contener al menos un plato.
 */
export class SaveMenuSemanalUseCase {
  /**
   * @param {import('../repositories/IMenuDiaRepository').IMenuDiaRepository} menuDiaRepository
   */
  constructor(menuDiaRepository) {
    if (!menuDiaRepository) {
      throw new Error('SaveMenuSemanalUseCase requiere IMenuDiaRepository');
    }
    this.menuDiaRepository = menuDiaRepository;
  }

  async execute(dias) {
    if (!dias || !Array.isArray(dias) || dias.length === 0) {
      throw new AppError('Debe proporcionar al menos un día para guardar en el menú semanal.', 'VALIDATION_ERROR');
    }

    // Validar formato de fechas e integridad de negocio
    for (const dia of dias) {
      if (!dia.fecha) {
        throw new AppError('Cada día del menú debe tener una fecha válida.', 'VALIDATION_ERROR');
      }

      const platosIds = dia.platos_ids || [];
      if (dia.estado_publicacion && platosIds.length === 0) {
        throw new AppError(`El día ${dia.fecha} no puede publicarse sin tener platos asignados.`, 'VALIDATION_ERROR');
      }
    }

    return await this.menuDiaRepository.guardarMenuSemanal(dias);
  }
}

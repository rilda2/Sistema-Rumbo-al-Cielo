import { AppError } from '../../../../core/errors/AppError';

/**
 * Caso de Uso: DeleteExcepcionUseCase
 */
export class DeleteExcepcionUseCase {
  /**
   * @param {import('../repositories/ICalendarioRepository').ICalendarioRepository} calendarioRepository
   */
  constructor(calendarioRepository) {
    if (!calendarioRepository) {
      throw new Error('DeleteExcepcionUseCase requiere ICalendarioRepository');
    }
    this.calendarioRepository = calendarioRepository;
  }

  async execute(excepcion) {
    if (!excepcion || (!excepcion.id_excepcion && !excepcion.id && !excepcion.fecha)) {
      throw new AppError('Se requiere un identificador o fecha válida para eliminar la excepción.', 'VALIDATION_ERROR');
    }
    return await this.calendarioRepository.deleteExcepcion(excepcion);
  }
}

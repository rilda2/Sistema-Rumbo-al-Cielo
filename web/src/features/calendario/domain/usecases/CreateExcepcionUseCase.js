import { AppError } from '../../../../core/errors/AppError';

/**
 * Caso de Uso: CreateExcepcionUseCase
 * 
 * Regla de Clean Architecture:
 * - Contiene las reglas de negocio para marcar días no laborables o festivos.
 * - Valida completitud, formato de fecha, y previene duplicidades en la agenda.
 */
export class CreateExcepcionUseCase {
  /**
   * @param {import('../repositories/ICalendarioRepository').ICalendarioRepository} calendarioRepository
   */
  constructor(calendarioRepository) {
    if (!calendarioRepository) {
      throw new Error('CreateExcepcionUseCase requiere ICalendarioRepository');
    }
    this.calendarioRepository = calendarioRepository;
  }

  async execute({ fecha, motivo, id_encargado }) {
    const cleanFecha = (fecha || '').split('T')[0].trim();
    const cleanMotivo = (motivo || '').trim();

    if (!cleanFecha) {
      throw new AppError('Debes seleccionar una fecha para la excepción.', 'VALIDATION_ERROR');
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(cleanFecha)) {
      throw new AppError('El formato de la fecha debe ser YYYY-MM-DD.', 'VALIDATION_ERROR');
    }

    if (!cleanMotivo) {
      throw new AppError('Debes ingresar el motivo de no atención.', 'VALIDATION_ERROR');
    }

    // Verificar si ya existe una excepción para esa fecha
    const alreadyExists = await this.calendarioRepository.checkExcepcionExists(cleanFecha);
    if (alreadyExists) {
      throw new AppError(`Ya existe un día de excepción registrado para la fecha ${cleanFecha}.`, 'DUPLICATE_DATE');
    }

    return await this.calendarioRepository.createExcepcion({
      fecha: cleanFecha,
      motivo: cleanMotivo,
      id_encargado: id_encargado || null,
    });
  }
}

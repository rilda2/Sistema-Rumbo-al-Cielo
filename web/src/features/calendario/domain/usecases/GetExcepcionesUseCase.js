/**
 * Caso de Uso: GetExcepcionesUseCase
 */
export class GetExcepcionesUseCase {
  /**
   * @param {import('../repositories/ICalendarioRepository').ICalendarioRepository} calendarioRepository
   */
  constructor(calendarioRepository) {
    if (!calendarioRepository) {
      throw new Error('GetExcepcionesUseCase requiere ICalendarioRepository');
    }
    this.calendarioRepository = calendarioRepository;
  }

  async execute() {
    return await this.calendarioRepository.getExcepciones();
  }
}

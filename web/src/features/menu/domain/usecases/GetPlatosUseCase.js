/**
 * Caso de Uso: GetPlatosUseCase
 */
export class GetPlatosUseCase {
  /**
   * @param {import('../repositories/IPlatoRepository').IPlatoRepository} platoRepository
   */
  constructor(platoRepository) {
    if (!platoRepository) {
      throw new Error('GetPlatosUseCase requiere IPlatoRepository');
    }
    this.platoRepository = platoRepository;
  }

  async execute() {
    return await this.platoRepository.getPlatos();
  }
}

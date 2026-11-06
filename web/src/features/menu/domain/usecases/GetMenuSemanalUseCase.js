/**
 * Caso de Uso: GetMenuSemanalUseCase
 */
export class GetMenuSemanalUseCase {
  /**
   * @param {import('../repositories/IMenuDiaRepository').IMenuDiaRepository} menuDiaRepository
   */
  constructor(menuDiaRepository) {
    if (!menuDiaRepository) {
      throw new Error('GetMenuSemanalUseCase requiere IMenuDiaRepository');
    }
    this.menuDiaRepository = menuDiaRepository;
  }

  async execute() {
    return await this.menuDiaRepository.getMenuDiasConPlatos();
  }
}

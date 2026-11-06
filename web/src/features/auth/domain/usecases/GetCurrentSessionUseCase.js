/**
 * Caso de Uso: GetCurrentSessionUseCase
 */
export class GetCurrentSessionUseCase {
  /**
   * @param {import('../repositories/IAuthRepository').IAuthRepository} authRepository
   */
  constructor(authRepository) {
    if (!authRepository) {
      throw new Error('GetCurrentSessionUseCase requiere una instancia de IAuthRepository');
    }
    this.authRepository = authRepository;
  }

  async execute() {
    return await this.authRepository.getCurrentSession();
  }
}

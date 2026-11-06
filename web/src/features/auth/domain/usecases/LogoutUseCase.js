/**
 * Caso de Uso: LogoutUseCase
 */
export class LogoutUseCase {
  /**
   * @param {import('../repositories/IAuthRepository').IAuthRepository} authRepository
   */
  constructor(authRepository) {
    if (!authRepository) {
      throw new Error('LogoutUseCase requiere una instancia de IAuthRepository');
    }
    this.authRepository = authRepository;
  }

  async execute() {
    return await this.authRepository.logout();
  }
}

/**
 * Caso de Uso: SubscribeToAuthChangesUseCase
 */
export class SubscribeToAuthChangesUseCase {
  /**
   * @param {import('../repositories/IAuthRepository').IAuthRepository} authRepository
   */
  constructor(authRepository) {
    if (!authRepository) {
      throw new Error('SubscribeToAuthChangesUseCase requiere una instancia de IAuthRepository');
    }
    this.authRepository = authRepository;
  }

  execute(callback) {
    return this.authRepository.onAuthStateChange(callback);
  }
}

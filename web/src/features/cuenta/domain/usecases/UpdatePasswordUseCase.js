import { AppError } from '../../../../core/errors/AppError';

/**
 * Caso de Uso: UpdatePasswordUseCase
 */
export class UpdatePasswordUseCase {
  /**
   * @param {import('../repositories/ICuentaRepository').ICuentaRepository} cuentaRepository
   */
  constructor(cuentaRepository) {
    if (!cuentaRepository) {
      throw new Error('UpdatePasswordUseCase requiere ICuentaRepository');
    }
    this.cuentaRepository = cuentaRepository;
  }

  async execute(newPassword, confirmPassword) {
    if (!newPassword || newPassword.length < 6) {
      throw new AppError('La nueva contraseña debe tener al menos 6 caracteres.', 'VALIDATION_ERROR');
    }

    if (newPassword !== confirmPassword) {
      throw new AppError('Las contraseñas ingresadas no coinciden.', 'VALIDATION_ERROR');
    }

    return await this.cuentaRepository.updatePassword(newPassword);
  }
}

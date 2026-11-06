import { AppError } from '../../../../core/errors/AppError';

/**
 * Caso de Uso: LoginUseCase
 * 
 * Regla de Clean Architecture:
 * - Contiene la lógica pura de negocio para el inicio de sesión.
 * - Recibe el repositorio por Inyección de Dependencias (DIP).
 * - No depende de React, Hooks, JSX ni librerías de Supabase.
 */
export class LoginUseCase {
  /**
   * @param {import('../repositories/IAuthRepository').IAuthRepository} authRepository
   */
  constructor(authRepository) {
    if (!authRepository) {
      throw new Error('LoginUseCase requiere una instancia de IAuthRepository');
    }
    this.authRepository = authRepository;
  }

  /**
   * Ejecuta el caso de uso con las validaciones de negocio
   * @param {string} email
   * @param {string} password
   */
  async execute(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    // 1. Validaciones de dominio / reglas de negocio
    if (!cleanEmail) {
      throw new AppError('El correo electrónico es obligatorio.', 'VALIDATION_ERROR');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      throw new AppError('El formato del correo electrónico no es válido.', 'VALIDATION_ERROR');
    }

    if (!cleanPassword) {
      throw new AppError('La contraseña es obligatoria.', 'VALIDATION_ERROR');
    }

    if (cleanPassword.length < 6) {
      throw new AppError('La contraseña debe tener al menos 6 caracteres.', 'VALIDATION_ERROR');
    }

    // 2. Delegar a la abstracción del repositorio
    const result = await this.authRepository.login(cleanEmail, cleanPassword);

    // 3. Regla de negocio: si el usuario existe pero está inactivo, bloquear
    if (result.user && !result.user.isActivo()) {
      await this.authRepository.logout();
      throw new AppError('Esta cuenta ha sido desactivada. Comuníquese con el administrador.', 'ACCOUNT_INACTIVE_ERROR');
    }

    // 4. Regla de negocio institucional:
    // La plataforma web está restringida exclusivamente a roles 'Administrador' e 'Institución'.
    // Los empleados utilizan la app móvil / canal de reservas y no tienen acceso al portal web administrativo.
    if (result.user && !result.user.tieneAccesoWeb()) {
      await this.authRepository.logout();
      throw new AppError(
        'Acceso restringido para el encargado.',
        'ACCESS_DENIED_ERROR'
      );
    }

    return result;
  }
}

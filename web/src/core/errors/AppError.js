/**
 * Error base para la aplicación independiente de librerías externas
 */
export class AppError extends Error {
  constructor(message, code = 'APP_ERROR', originalError = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.originalError = originalError;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Credenciales inválidas o sesión expirada', originalError = null) {
    super(message, 'AUTH_ERROR', originalError);
    this.name = 'AuthenticationError';
  }
}

export class AccountInactiveError extends AppError {
  constructor(message = 'Esta cuenta se encuentra desactivada. Contacte al administrador.') {
    super(message, 'ACCOUNT_INACTIVE_ERROR');
    this.name = 'AccountInactiveError';
  }
}

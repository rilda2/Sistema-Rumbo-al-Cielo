/**
 * Public API del Módulo Auth
 */

// Presentación
export { AuthProvider, AuthContext } from './presentation/context/AuthContext';
export { useAuth } from './presentation/hooks/useAuth';
export { default as LoginPage } from './presentation/pages/LoginPage';
export { LoginForm } from './presentation/components/LoginForm';

// Dominio (para tipado o reglas)
export { User } from './domain/entities/User';
export { IAuthRepository } from './domain/repositories/IAuthRepository';
export { LoginUseCase } from './domain/usecases/LoginUseCase';
export { LogoutUseCase } from './domain/usecases/LogoutUseCase';

// Casos de uso instanciados (DI)
export { 
  loginUseCase, 
  logoutUseCase, 
  getCurrentSessionUseCase, 
  subscribeToAuthChangesUseCase 
} from './di';

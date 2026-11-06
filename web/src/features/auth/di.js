import { SupabaseAuthRepository } from './data/repositories/SupabaseAuthRepository';
import { LoginUseCase } from './domain/usecases/LoginUseCase';
import { LogoutUseCase } from './domain/usecases/LogoutUseCase';
import { GetCurrentSessionUseCase } from './domain/usecases/GetCurrentSessionUseCase';
import { SubscribeToAuthChangesUseCase } from './domain/usecases/SubscribeToAuthChangesUseCase';

/**
 * Contenedor de Inyección de Dependencias (Composition Root) para el módulo Auth.
 * 
 * Aquí se instancian las implementaciones de DATA y se inyectan en los CASOS DE USO de DOMINIO.
 * La capa de PRESENTACIÓN solo interactúa con los casos de uso expuestos aquí.
 */
const authRepository = new SupabaseAuthRepository();

export const loginUseCase = new LoginUseCase(authRepository);
export const logoutUseCase = new LogoutUseCase(authRepository);
export const getCurrentSessionUseCase = new GetCurrentSessionUseCase(authRepository);
export const subscribeToAuthChangesUseCase = new SubscribeToAuthChangesUseCase(authRepository);

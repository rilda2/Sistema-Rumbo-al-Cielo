import { SupabaseCuentaRepository } from './data/repositories/SupabaseCuentaRepository';
import { UpdatePerfilUseCase } from './domain/usecases/UpdatePerfilUseCase';
import { UpdatePasswordUseCase } from './domain/usecases/UpdatePasswordUseCase';

/**
 * Composition Root para el Módulo Cuenta
 */
const cuentaRepository = new SupabaseCuentaRepository();

export const updatePerfilUseCase = new UpdatePerfilUseCase(cuentaRepository);
export const updatePasswordUseCase = new UpdatePasswordUseCase(cuentaRepository);

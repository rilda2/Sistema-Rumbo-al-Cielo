import { SupabaseUsuarioRepository } from './data/repositories/SupabaseUsuarioRepository';
import { SupabaseFamiliarRepository } from './data/repositories/SupabaseFamiliarRepository';

import { GetUsuariosUseCase } from './domain/usecases/GetUsuariosUseCase';
import { RegisterUsuarioUseCase } from './domain/usecases/RegisterUsuarioUseCase';
import { UpdateUsuarioUseCase } from './domain/usecases/UpdateUsuarioUseCase';
import { ToggleUsuarioEstadoUseCase } from './domain/usecases/ToggleUsuarioEstadoUseCase';
import { DeleteUsuarioUseCase } from './domain/usecases/DeleteUsuarioUseCase';

import { GetFamiliaresByUsuarioUseCase } from './domain/usecases/GetFamiliaresByUsuarioUseCase';
import { RegisterFamiliarUseCase } from './domain/usecases/RegisterFamiliarUseCase';
import { DeleteFamiliarUseCase } from './domain/usecases/DeleteFamiliarUseCase';

import { GetSolicitudesRecuperacionUseCase } from './domain/usecases/GetSolicitudesRecuperacionUseCase';
import { CambiarPasswordUsuarioUseCase } from './domain/usecases/CambiarPasswordUsuarioUseCase';

/**
 * Composition Root / Contenedor de Inyección de Dependencias para el Módulo de Usuarios
 */
const usuarioRepository = new SupabaseUsuarioRepository();
const familiarRepository = new SupabaseFamiliarRepository();

export const getUsuariosUseCase = new GetUsuariosUseCase(usuarioRepository);
export const registerUsuarioUseCase = new RegisterUsuarioUseCase(usuarioRepository);
export const updateUsuarioUseCase = new UpdateUsuarioUseCase(usuarioRepository);
export const toggleUsuarioEstadoUseCase = new ToggleUsuarioEstadoUseCase(usuarioRepository);
export const deleteUsuarioUseCase = new DeleteUsuarioUseCase(usuarioRepository);
export const getSolicitudesRecuperacionUseCase = new GetSolicitudesRecuperacionUseCase(usuarioRepository);
export const cambiarPasswordUsuarioUseCase = new CambiarPasswordUsuarioUseCase(usuarioRepository);

export const getFamiliaresByUsuarioUseCase = new GetFamiliaresByUsuarioUseCase(familiarRepository);
export const registerFamiliarUseCase = new RegisterFamiliarUseCase(familiarRepository);
export const deleteFamiliarUseCase = new DeleteFamiliarUseCase(familiarRepository);


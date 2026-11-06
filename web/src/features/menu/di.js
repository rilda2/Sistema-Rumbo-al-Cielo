import { SupabasePlatoRepository } from './data/repositories/SupabasePlatoRepository';
import { SupabaseMenuDiaRepository } from './data/repositories/SupabaseMenuDiaRepository';

import { GetPlatosUseCase } from './domain/usecases/GetPlatosUseCase';
import { CreatePlatoUseCase } from './domain/usecases/CreatePlatoUseCase';
import { UpdatePlatoUseCase } from './domain/usecases/UpdatePlatoUseCase';
import { DeletePlatoUseCase } from './domain/usecases/DeletePlatoUseCase';

import { GetMenuSemanalUseCase } from './domain/usecases/GetMenuSemanalUseCase';
import { SaveMenuSemanalUseCase } from './domain/usecases/SaveMenuSemanalUseCase';

/**
 * Composition Root / Contenedor de Inyección de Dependencias para el Módulo Menú
 */
const platoRepository = new SupabasePlatoRepository();
const menuDiaRepository = new SupabaseMenuDiaRepository();

export const getPlatosUseCase = new GetPlatosUseCase(platoRepository);
export const createPlatoUseCase = new CreatePlatoUseCase(platoRepository);
export const updatePlatoUseCase = new UpdatePlatoUseCase(platoRepository);
export const deletePlatoUseCase = new DeletePlatoUseCase(platoRepository);

export const getMenuSemanalUseCase = new GetMenuSemanalUseCase(menuDiaRepository);
export const saveMenuSemanalUseCase = new SaveMenuSemanalUseCase(menuDiaRepository);

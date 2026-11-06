import { SupabaseCalendarioRepository } from './data/repositories/SupabaseCalendarioRepository';
import { GetExcepcionesUseCase } from './domain/usecases/GetExcepcionesUseCase';
import { CreateExcepcionUseCase } from './domain/usecases/CreateExcepcionUseCase';
import { DeleteExcepcionUseCase } from './domain/usecases/DeleteExcepcionUseCase';

/**
 * Composition Root / Contenedor de Inyección de Dependencias para el Módulo Calendario
 */
const calendarioRepository = new SupabaseCalendarioRepository();

export const getExcepcionesUseCase = new GetExcepcionesUseCase(calendarioRepository);
export const createExcepcionUseCase = new CreateExcepcionUseCase(calendarioRepository);
export const deleteExcepcionUseCase = new DeleteExcepcionUseCase(calendarioRepository);

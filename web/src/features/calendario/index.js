/**
 * Public API del Módulo Calendario
 */

// Presentación
export { default as CalendarioPage } from './presentation/pages/CalendarioPage';
export { useCalendario } from './presentation/hooks/useCalendario';
export { default as CalendarioGrid } from './presentation/components/CalendarioGrid';
export { default as ExcepcionCreateModal } from './presentation/components/ExcepcionCreateModal';
export { default as ExcepcionDeleteModal } from './presentation/components/ExcepcionDeleteModal';

// Dominio
export { ExcepcionCalendarioEntity } from './domain/entities/ExcepcionCalendarioEntity';
export { ICalendarioRepository } from './domain/repositories/ICalendarioRepository';

// Casos de uso
export {
  getExcepcionesUseCase,
  createExcepcionUseCase,
  deleteExcepcionUseCase,
} from './di';

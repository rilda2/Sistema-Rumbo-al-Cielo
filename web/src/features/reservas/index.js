/**
 * Public API del Módulo Reservas
 */

// Presentación
export { useReservas } from './presentation/hooks/useReservas';
export { default as ReservarModal } from './presentation/components/ReservarModal';
export { default as MisReservasPage } from './presentation/pages/MisReservasPage';
export { useReservasAdmin } from './presentation/hooks/useReservasAdmin';
export { default as ReservasDelDiaPage } from './presentation/pages/ReservasDelDiaPage';

// Dominio
export { ReservaEntity } from './domain/entities/ReservaEntity';
export { ReservaPolicy } from './domain/policies/ReservaPolicy';
export { armarCombo } from './domain/policies/armarCombo';
export { IReservaRepository } from './domain/repositories/IReservaRepository';

// Casos de uso
export {
    getMisReservasUseCase,
    getReservasPorFechaUseCase,
    crearReservaUseCase,
    cancelarReservaUseCase,
    marcarEntregaUseCase,
    asignarPlatosReservasPensionUseCase,
    obtenerFamiliares,
} from './di';
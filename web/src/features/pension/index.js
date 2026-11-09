/**
 * Public API del Módulo Pensión
 */

// Presentación
export { usePension } from './presentation/hooks/usePension';
export { usePensionesAdmin } from './presentation/hooks/usePensionesAdmin';
export { default as MiPensionPage } from './presentation/pages/MiPensionPage';
export { default as PensionesAdminPage } from './presentation/pages/PensionesAdminPage';

// Dominio
export { PensionEntity } from './domain/entities/PensionEntity';
export { PensionPolicy } from './domain/policies/PensionPolicy';
export { IPensionRepository } from './domain/repositories/IPensionRepository';

// Casos de uso
export {
    pensionPolicy,
    solicitarPensionUseCase,
    cancelarPensionUseCase,
    getMiPensionUseCase,
    getPensionesAdminUseCase,
    confirmarPensionUseCase,
    rechazarPensionUseCase,
} from './di';
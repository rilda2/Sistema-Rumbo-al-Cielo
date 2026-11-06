/**
 * Public API del Módulo Menú
 */

// Presentación
export { default as MenuPage } from './presentation/pages/MenuPage';
export { useMenu } from './presentation/hooks/useMenu';
export { default as MenuSemanalView } from './presentation/components/MenuSemanalView';
export { default as MenuSemanalModal } from './presentation/components/MenuSemanalModal';
export { default as PlatosCatalogo } from './presentation/components/PlatosCatalogo';

// Dominio
export { PlatoEntity } from './domain/entities/PlatoEntity';
export { MenuDiaEntity } from './domain/entities/MenuDiaEntity';
export { IPlatoRepository } from './domain/repositories/IPlatoRepository';
export { IMenuDiaRepository } from './domain/repositories/IMenuDiaRepository';

// Casos de uso
export {
  getPlatosUseCase,
  createPlatoUseCase,
  updatePlatoUseCase,
  deletePlatoUseCase,
  getMenuSemanalUseCase,
  saveMenuSemanalUseCase,
} from './di';

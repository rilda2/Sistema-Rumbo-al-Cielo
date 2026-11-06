/**
 * Public API del Módulo Usuarios
 */

// Presentación
export { default as UsuariosPage } from './presentation/pages/UsuariosPage';
export { useUsuarios } from './presentation/hooks/useUsuarios';
export { useFamiliares } from './presentation/hooks/useFamiliares';

// Componentes
export { default as UsuariosTable } from './presentation/components/UsuariosTable';
export { default as UsuarioRow } from './presentation/components/UsuarioRow';
export { default as UsuariosStats } from './presentation/components/UsuariosStats';
export { default as UsuariosFilter } from './presentation/components/UsuariosFilter';
export { default as UsuarioRoleBadge } from './presentation/components/UsuarioRoleBadge';
export { default as UsuarioCreateModal } from './presentation/components/UsuarioCreateModal';
export { default as UsuarioDetailsModal } from './presentation/components/UsuarioDetailsModal';
export { default as UsuarioDeleteModal } from './presentation/components/UsuarioDeleteModal';
export { default as UsuarioFamiliarModal } from './presentation/components/UsuarioFamiliarModal';

// Dominio
export { UsuarioEntity } from './domain/entities/UsuarioEntity';
export { FamiliarEntity, PARENTESCOS_VALIDOS } from './domain/entities/FamiliarEntity';
export { IUsuarioRepository } from './domain/repositories/IUsuarioRepository';
export { IFamiliarRepository } from './domain/repositories/IFamiliarRepository';

// Casos de uso
export {
  getUsuariosUseCase,
  registerUsuarioUseCase,
  toggleUsuarioEstadoUseCase,
  deleteUsuarioUseCase,
  getFamiliaresByUsuarioUseCase,
  registerFamiliarUseCase,
  deleteFamiliarUseCase,
} from './di';

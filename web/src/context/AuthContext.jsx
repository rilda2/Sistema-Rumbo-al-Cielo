/**
 * Bridge de compatibilidad: Redirige hacia el módulo de Clean Architecture (src/features/auth).
 * Esto garantiza que todos los componentes compartan la misma instancia de AuthContext.
 */
export { AuthProvider, AuthContext, useAuth } from '../features/auth';


import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  loginUseCase as defaultLoginUseCase, 
  logoutUseCase as defaultLogoutUseCase, 
  getCurrentSessionUseCase as defaultGetCurrentSessionUseCase, 
  subscribeToAuthChangesUseCase as defaultSubscribeUseCase 
} from '../../di';

export const AuthContext = createContext(null);

/**
 * AuthProvider (Capa de Presentación)
 * 
 * Cumple con la regla de Clean Architecture:
 * - NO importa supabase ni nada de '@supabase/supabase-js'.
 * - Solo se comunica con los Casos de Uso del Dominio (inyección por props o default DI).
 */
export function AuthProvider({ 
  children,
  loginUseCase = defaultLoginUseCase,
  logoutUseCase = defaultLogoutUseCase,
  getCurrentSessionUseCase = defaultGetCurrentSessionUseCase,
  subscribeUseCase = defaultSubscribeUseCase,
}) {
  const [currentUser, setCurrentUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        setLoading(true);
        const { user, session } = await getCurrentSessionUseCase.execute();
        if (isMounted) {
          if (user && !user.tieneAccesoWeb()) {
            await logoutUseCase.execute();
            setCurrentUser(null);
            setSession(null);
            setError('Acceso restringido: Los usuarios con rol Empleado no tienen acceso a esta plataforma web.');
          } else {
            setCurrentUser(user);
            setSession(session);
          }
        }
      } catch (err) {
        console.error('[AuthProvider] Error al inicializar sesión:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initSession();

    // Suscripción a cambios de sesión a través del caso de uso
    const subscription = subscribeUseCase.execute(async ({ user, session }) => {
      if (isMounted) {
        if (user && !user.tieneAccesoWeb()) {
          await logoutUseCase.execute();
          setCurrentUser(null);
          setSession(null);
          setError('Acceso restringido: Los usuarios con rol Empleado no tienen acceso a esta plataforma web.');
        } else {
          setCurrentUser(user);
          setSession(session);
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [getCurrentSessionUseCase, subscribeUseCase]);

  const login = async (email, password) => {
    setError(null);
    try {
      const result = await loginUseCase.execute(email, password);
      setCurrentUser(result.user);
      setSession(result.session);
      return result;
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await logoutUseCase.execute();
      setCurrentUser(null);
      setSession(null);
    } catch (err) {
      console.error('[AuthProvider] Error en logout:', err);
      throw err;
    }
  };

  const refreshProfile = async () => {
    try {
      const { user } = await getCurrentSessionUseCase.execute();
      setCurrentUser(user);
    } catch (err) {
      console.warn('[AuthProvider] Error al refrescar perfil:', err);
    }
  };

  const value = useMemo(() => ({
    user: currentUser,
    profile: currentUser,
    session,
    role: currentUser?.rol || 'Empleado',
    isAdmin: currentUser ? currentUser.isAdmin() : false,
    loading,
    error,
    authError: error,
    login,
    logout,
    refreshProfile,
    setProfile: setCurrentUser,
  }), [currentUser, session, loading, error]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

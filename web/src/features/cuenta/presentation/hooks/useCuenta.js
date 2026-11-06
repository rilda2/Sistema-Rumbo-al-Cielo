import { useState } from 'react';
import { updatePerfilUseCase, updatePasswordUseCase } from '../../di';

/**
 * Hook de Presentación: useCuenta
 * 
 * Regla de Clean Architecture:
 * - NO importa Supabase.
 * - Consume los Casos de Uso del Dominio (UpdatePerfilUseCase, UpdatePasswordUseCase).
 */
export function useCuenta() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const savePerfil = async (id_usuario, profileData) => {
    setLoading(true);
    setError(null);
    try {
      await updatePerfilUseCase.execute(id_usuario, profileData);
    } catch (err) {
      setError(err.message || 'Error al actualizar perfil');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (newPassword, confirmPassword) => {
    setLoading(true);
    setError(null);
    try {
      await updatePasswordUseCase.execute(newPassword, confirmPassword);
    } catch (err) {
      setError(err.message || 'Error al actualizar contraseña');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    savePerfil,
    changePassword,
  };
}

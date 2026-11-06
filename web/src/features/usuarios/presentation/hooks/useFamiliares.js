import { useState, useCallback } from 'react';
import { 
  getFamiliaresByUsuarioUseCase, 
  registerFamiliarUseCase, 
  deleteFamiliarUseCase 
} from '../../di';

/**
 * Hook de Presentación: useFamiliares
 * 
 * Regla de Clean Architecture:
 * - Gestiona el estado y operaciones de familiares usando solo Casos de Uso del Dominio.
 */
export function useFamiliares(defaultEmployeeId = null) {
  const [familiares, setFamiliares] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadFamiliares = useCallback(async (id_usuario) => {
    const targetId = id_usuario || defaultEmployeeId;
    if (!targetId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getFamiliaresByUsuarioUseCase.execute(targetId);
      setFamiliares(data || []);
      return data;
    } catch (err) {
      console.error('[useFamiliares] Error al cargar familiares:', err);
      setError(err.message || 'Error al cargar dependientes.');
    } finally {
      setLoading(false);
    }
  }, [defaultEmployeeId]);

  const addFamiliar = async (familiarData) => {
    const newFamiliar = await registerFamiliarUseCase.execute(familiarData);
    setFamiliares((prev) => [...prev, newFamiliar]);
    return newFamiliar;
  };

  const removeFamiliar = async (id_persona, id_usuario) => {
    await deleteFamiliarUseCase.execute(id_persona, id_usuario);
    setFamiliares((prev) => prev.filter((f) => f.id_persona !== id_persona));
  };

  return {
    familiares,
    loading,
    error,
    loadFamiliares,
    addFamiliar,
    removeFamiliar,
    setFamiliares,
  };
}

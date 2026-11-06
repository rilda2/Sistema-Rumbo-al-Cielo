import { useState, useEffect, useCallback } from 'react';
import { 
  getPlatosUseCase, 
  createPlatoUseCase, 
  updatePlatoUseCase, 
  deletePlatoUseCase, 
  getMenuSemanalUseCase, 
  saveMenuSemanalUseCase 
} from '../../di';

/**
 * Hook de Presentación: useMenu
 * 
 * Regla de Clean Architecture:
 * - NO importa Supabase.
 * - Solo consume los Casos de Uso del Dominio para el catálogo y menús semanales.
 */
export function useMenu() {
  const [platos, setPlatos] = useState([]);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [platosData, menusData] = await Promise.all([
        getPlatosUseCase.execute(),
        getMenuSemanalUseCase.execute(),
      ]);

      setPlatos(platosData || []);
      setMenus(menusData || []);
    } catch (err) {
      console.error('[useMenu] Error al cargar datos:', err);
      setError(err.message || 'Error al cargar catálogo de platos y menús.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveMenuSemanal = async (dias) => {
    const result = await saveMenuSemanalUseCase.execute(dias);
    await loadData();
    return result;
  };

  const createPlato = async (platoData, imageFile = null) => {
    const newPlato = await createPlatoUseCase.execute(platoData, imageFile);
    await loadData();
    return newPlato;
  };

  const updatePlato = async (id_plato, updateData, newImageFile = null, removeCurrentImage = false, currentImageUrl = null) => {
    const updated = await updatePlatoUseCase.execute(id_plato, updateData, newImageFile, removeCurrentImage, currentImageUrl);
    await loadData();
    return updated;
  };

  const deletePlato = async (id_plato, currentImageUrl = null) => {
    await deletePlatoUseCase.execute(id_plato, currentImageUrl);
    setPlatos((prev) => prev.filter((p) => p.id_plato !== id_plato));
  };

  return {
    platos,
    menus,
    loading,
    error,
    loadData,
    saveMenuSemanal,
    createPlato,
    updatePlato,
    deletePlato,
  };
}

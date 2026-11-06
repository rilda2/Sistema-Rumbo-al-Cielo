import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  getExcepcionesUseCase, 
  createExcepcionUseCase, 
  deleteExcepcionUseCase 
} from '../../di';

/**
 * Hook de Presentación: useCalendario
 * 
 * Regla de Clean Architecture:
 * - NO importa Supabase.
 * - Solo consume los Casos de Uso del Dominio (GetExcepcionesUseCase, CreateExcepcionUseCase, DeleteExcepcionUseCase).
 */
export function useCalendario() {
  const [excepciones, setExcepciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const loadExcepciones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getExcepcionesUseCase.execute();
      setExcepciones(data || []);
    } catch (err) {
      console.error('[useCalendario] Error al cargar excepciones:', err);
      setError(err.message || 'No se pudieron cargar los días de excepción.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExcepciones();
  }, [loadExcepciones]);

  const addExcepcion = async ({ fecha, motivo, id_encargado }) => {
    const newExcepcion = await createExcepcionUseCase.execute({ fecha, motivo, id_encargado });
    await loadExcepciones();
    return newExcepcion;
  };

  const removeExcepcion = async (excepcion) => {
    await deleteExcepcionUseCase.execute(excepcion);
    setExcepciones((prev) => prev.filter((e) => e.fecha !== excepcion.fecha && e.id_excepcion !== excepcion.id_excepcion));
  };

  // Controles de navegación de meses
  const handlePrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  // Próximas excepciones a partir de hoy
  const proximasExcepciones = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return excepciones
      .filter((e) => e.fecha >= todayStr)
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  }, [excepciones]);

  return {
    excepciones,
    proximasExcepciones,
    loading,
    error,
    currentMonth,
    setCurrentMonth,
    loadExcepciones,
    addExcepcion,
    removeExcepcion,
    handlePrevMonth,
    handleNextMonth,
    handleToday,
  };
}

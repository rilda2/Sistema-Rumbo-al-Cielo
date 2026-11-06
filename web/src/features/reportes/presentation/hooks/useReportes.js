import { useState, useEffect, useCallback } from 'react';
import {
  generarReporteDescuentosUseCase,
  guardarCierreMensualUseCase,
  aplicarDescuentoManualUseCase,
  generarReporteConsumoMensualUseCase,
  generarReporteDetalleEmpleadoUseCase,
  getHistorialAsistenciaUseCase,
  supabaseReportesRepository,
} from '../../di';

/**
 * Hook de Presentación: useReportes
 * Conecta los Casos de Uso del Dominio con los componentes de la interfaz de usuario.
 */
export function useReportes() {
  const currentDate = new Date();
  const [mes, setMes] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Lista de usuarios y métricas generales reales
  const [usuarios, setUsuarios] = useState([]);
  const [metricasGenerales, setMetricasGenerales] = useState({
    totalUsuarios: 0,
    usuarios: [],
    almuerzosSemana: 0,
    tasaAsistencia: 100,
  });

  // HU14: Cierre y Descuentos
  const [reporteDescuentos, setReporteDescuentos] = useState(null);
  const [reporteDescuentosGenerado, setReporteDescuentosGenerado] = useState(false);
  const [guardandoCierre, setGuardandoCierre] = useState(false);

  // HU15: Reporte Mensual de Consumo
  const [reporteConsumo, setReporteConsumo] = useState(null);
  const [agruparPorArea, setAgruparPorArea] = useState(false);

  // HU16: Reporte Detallado por Empleado
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState('');
  const [reporteEmpleado, setReporteEmpleado] = useState(null);

  // Registro y Reporte de Asistencias
  const [asistencias, setAsistencias] = useState([]);
  const [filtroFechaAsistencia, setFiltroFechaAsistencia] = useState('');
  const [cargandoAsistencias, setCargandoAsistencias] = useState(false);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ mensaje: msg, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Cargar métricas y usuarios al inicio
  useEffect(() => {
    async function loadData() {
      try {
        const metrics = await supabaseReportesRepository.getMetricasGenerales();
        setMetricasGenerales(metrics);
        setUsuarios(metrics.usuarios || []);
      } catch (err) {
        console.error('[useReportes] Error al cargar métricas generales:', err);
      }
    }
    loadData();
  }, []);

  /**
   * HU14: Generar reporte de cobros y descuentos
   */
  const generarReporteDescuentos = async (customMes = mes, customYear = year) => {
    setError(null);
    try {
      setLoading(true);
      const resultado = await generarReporteDescuentosUseCase.execute({
        mes: customMes,
        year: customYear,
      });
      setReporteDescuentos(resultado);
      setReporteDescuentosGenerado(true);
      return resultado;
    } catch (err) {
      console.error('[useReportes] Error al generar reporte HU14:', err);
      setError(err.message);
      setReporteDescuentos(null);
      setReporteDescuentosGenerado(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * HU14: Aplicar descuento manual
   */
  const aplicarDescuentoManual = (detalleIndex, nuevoTotal) => {
    if (!reporteDescuentos || !reporteDescuentos.detalles[detalleIndex]) return;
    try {
      const detalle = reporteDescuentos.detalles[detalleIndex];
      const res = aplicarDescuentoManualUseCase.execute({ detalle, nuevoTotal });

      // Recalcular el total general del cierre
      const nuevosDetalles = [...reporteDescuentos.detalles];
      nuevosDetalles[detalleIndex] = res.detalle;

      const nuevoTotalGeneral = nuevosDetalles.reduce(
        (sum, item) => sum + (Number(item.total_descontar) || 0),
        0
      );

      setReporteDescuentos((prev) => ({
        ...prev,
        cierre: {
          ...prev.cierre,
          total_general: nuevoTotalGeneral,
        },
        detalles: nuevosDetalles,
      }));

      showToast(res.mensaje, 'success');
      return res;
    } catch (err) {
      console.error('[useReportes] Error en descuento manual:', err);
      setError(err.message);
      showToast(err.message, 'error');
      throw err;
    }
  };

  /**
   * HU14: Guardar cierre mensual
   */
  const guardarCierre = async () => {
    if (!reporteDescuentos) return;
    try {
      setGuardandoCierre(true);
      const res = await guardarCierreMensualUseCase.execute({
        cierre: reporteDescuentos.cierre,
        detalles: reporteDescuentos.detalles,
      });
      showToast(res.mensaje || 'Cierre guardado correctamente.');
      return res;
    } catch (err) {
      console.error('[useReportes] Error al guardar cierre:', err);
      setError(err.message);
      showToast(err.message || 'Error al guardar el cierre.', 'error');
      throw err;
    } finally {
      setGuardandoCierre(false);
    }
  };

  /**
   * HU15: Generar reporte de consumo mensual
   */
  const generarReporteConsumo = async (customMes = mes, customYear = year, customAgrupar = agruparPorArea) => {
    setError(null);
    try {
      setLoading(true);
      const data = await generarReporteConsumoMensualUseCase.execute({
        mes: customMes,
        year: customYear,
        agrupadoPorArea: customAgrupar,
      });
      setReporteConsumo(data);
      return data;
    } catch (err) {
      console.error('[useReportes] Error al generar consumo HU15:', err);
      setError(err.message);
      setReporteConsumo(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * HU16: Generar reporte detallado por empleado
   */
  const generarReporteEmpleado = async (customEmpleadoId = empleadoSeleccionado, customMes = mes, customYear = year) => {
    setError(null);
    try {
      setLoading(true);
      const data = await generarReporteDetalleEmpleadoUseCase.execute({
        id_usuario: customEmpleadoId,
        mes: customMes,
        year: customYear,
      });
      setReporteEmpleado(data);
      return data;
    } catch (err) {
      console.error('[useReportes] Error al generar reporte individual HU16:', err);
      setError(err.message);
      setReporteEmpleado(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar tabla de asistencia de los usuarios ordenada por fecha
   */
  const cargarHistorialAsistencia = async (params = {}) => {
    setError(null);
    try {
      setCargandoAsistencias(true);
      const data = await getHistorialAsistenciaUseCase.execute(params);
      setAsistencias(data || []);
      return data;
    } catch (err) {
      console.error('[useReportes] Error al cargar asistencias:', err);
      setError(err.message);
      setAsistencias([]);
      throw err;
    } finally {
      setCargandoAsistencias(false);
    }
  };

  return {
    mes,
    setMes,
    year,
    setYear,
    loading,
    error,
    setError,
    toast,
    showToast,
    usuarios,
    metricasGenerales,

    // HU14
    reporteDescuentos,
    reporteDescuentosGenerado,
    generarReporteDescuentos,
    aplicarDescuentoManual,
    guardarCierre,
    guardandoCierre,

    // HU15
    reporteConsumo,
    agruparPorArea,
    setAgruparPorArea,
    generarReporteConsumo,

    // HU16
    empleadoSeleccionado,
    setEmpleadoSeleccionado,
    reporteEmpleado,
    generarReporteEmpleado,

    // Asistencias
    asistencias,
    cargandoAsistencias,
    filtroFechaAsistencia,
    setFiltroFechaAsistencia,
    cargarHistorialAsistencia,
  };
}

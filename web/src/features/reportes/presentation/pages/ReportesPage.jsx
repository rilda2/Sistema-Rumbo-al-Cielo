import React, { useState } from 'react';
import {
  BarChart3,
  Calculator,
  Building2,
  UserCheck,
  PieChart,
  ClipboardCheck,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useReportes } from '../hooks/useReportes';
import ReporteDescuentosHU14 from '../components/ReporteDescuentosHU14';
import ReporteConsumoHU15 from '../components/ReporteConsumoHU15';
import ReporteEmpleadoHU16 from '../components/ReporteEmpleadoHU16';
import ReporteMetricasGenerales from '../components/ReporteMetricasGenerales';
import TablaAsistenciasUsuarios from '../components/TablaAsistenciasUsuarios';

export default function ReportesPage() {
  const [subTab, setSubTab] = useState('hu14'); // 'hu14' | 'hu15' | 'hu16' | 'metricas'

  const {
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
    cargarHistorialAsistencia,
  } = useReportes();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl flex items-center space-x-2 text-sm font-semibold animate-slide-up ${toast.type === 'error'
              ? 'bg-rose-600 text-white'
              : 'bg-emerald-600 text-white'
            }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{toast.mensaje}</span>
        </div>
      )}

      {/* Header Principal */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 no-print">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
            <BarChart3 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Reportes Contables y de Consumo
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Gestión automatizada de liquidaciones mensuales, cobros institucionales y auditoría individual de almuerzos.
            </p>
          </div>
        </div>

        {/* Sub-navegación de reportes */}
        <div className="flex flex-wrap items-center gap-2 mt-6 border-b border-slate-100 pb-2 no-print">
          <button
            onClick={() => {
              setSubTab('hu14');
              setError(null);
            }}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${subTab === 'hu14'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Cierre y Descuentos</span>
          </button>

          {/* <button
            onClick={() => {
              setSubTab('hu15');
              setError(null);
            }}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
              subTab === 'hu15'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Consumo Institucional</span>
          </button>*/}

          <button
            onClick={() => {
              setSubTab('hu16');
              setError(null);
            }}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${subTab === 'hu16'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Detalle por Empleado</span>
          </button>

          <button
            onClick={() => {
              setSubTab('asistencias');
              setError(null);
            }}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${subTab === 'asistencias'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Asistencia de Usuarios</span>
          </button>

          <button
            onClick={() => {
              setSubTab('metricas');
              setError(null);
            }}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${subTab === 'metricas'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Métricas Generales</span>
          </button>
        </div>
      </div>

      {/* Error Banner Global */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Contenido de la Sub-Pestaña Activa */}
      {subTab === 'hu14' && (
        <ReporteDescuentosHU14
          mes={mes}
          setMes={setMes}
          year={year}
          setYear={setYear}
          loading={loading}
          error={error}
          setError={setError}
          toast={toast}
          showToast={showToast}
          reporteDescuentos={reporteDescuentos}
          reporteDescuentosGenerado={reporteDescuentosGenerado}
          generarReporteDescuentos={generarReporteDescuentos}
          aplicarDescuentoManual={aplicarDescuentoManual}
          guardarCierre={guardarCierre}
          guardandoCierre={guardandoCierre}
        />
      )}

      {/* {subTab === 'hu15' && (
        <ReporteConsumoHU15
          mes={mes}
          setMes={setMes}
          year={year}
          setYear={setYear}
          loading={loading}
          error={error}
          setError={setError}
          reporteConsumo={reporteConsumo}
          agruparPorArea={agruparPorArea}
          setAgruparPorArea={setAgruparPorArea}
          generarReporteConsumo={generarReporteConsumo}
        />
      )} */}

      {subTab === 'hu16' && (
        <ReporteEmpleadoHU16
          mes={mes}
          setMes={setMes}
          year={year}
          setYear={setYear}
          loading={loading}
          error={error}
          setError={setError}
          usuarios={usuarios}
          empleadoSeleccionado={empleadoSeleccionado}
          setEmpleadoSeleccionado={setEmpleadoSeleccionado}
          reporteEmpleado={reporteEmpleado}
          generarReporteEmpleado={generarReporteEmpleado}
        />
      )}

      {subTab === 'asistencias' && (
        <TablaAsistenciasUsuarios
          asistencias={asistencias}
          cargando={cargandoAsistencias}
          cargarHistorialAsistencia={cargarHistorialAsistencia}
          usuarios={usuarios}
        />
      )}

      {subTab === 'metricas' && (
        <ReporteMetricasGenerales usuarios={usuarios} metricas={metricasGenerales} />
      )}
    </div>
  );
}

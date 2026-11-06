import React, { useState } from 'react';
import { 
  UserCheck, 
  Calendar, 
  Download, 
  Printer, 
  Users, 
  AlertCircle, 
  Utensils, 
  Clock, 
  Sparkles,
  Heart
} from 'lucide-react';
import { exportToCSV, printReport } from '../utils/exportUtils';

export default function ReporteEmpleadoHU16({
  mes,
  setMes,
  year,
  setYear,
  loading,
  error,
  setError,
  usuarios,
  empleadoSeleccionado,
  setEmpleadoSeleccionado,
  reporteEmpleado,
  generarReporteEmpleado,
}) {
  const [generado, setGenerado] = useState(false);

  const meses = [
    { num: 1, nombre: 'Enero' },
    { num: 2, nombre: 'Febrero' },
    { num: 3, nombre: 'Marzo' },
    { num: 4, nombre: 'Abril' },
    { num: 5, nombre: 'Mayo' },
    { num: 6, nombre: 'Junio' },
    { num: 7, nombre: 'Julio' },
    { num: 8, nombre: 'Agosto' },
    { num: 9, nombre: 'Septiembre' },
    { num: 10, nombre: 'Octubre' },
    { num: 11, nombre: 'Noviembre' },
    { num: 12, nombre: 'Diciembre' },
  ];

  const handleGenerar = async () => {
    if (!empleadoSeleccionado) {
      setError('Debe seleccionar un empleado');
      return;
    }
    try {
      await generarReporteEmpleado(empleadoSeleccionado, mes, year);
      setGenerado(true);
    } catch {
      // Error manejado en hook
    }
  };

  const handleExportar = () => {
    if (!reporteEmpleado || !reporteEmpleado.reservas.length) return;
    const data = reporteEmpleado.reservas.map((r) => ({
      Fecha: new Date(r.fecha).toLocaleDateString(),
      Beneficiario: r.beneficiario,
      Plato: r.plato_nombre,
      Tipo: r.plato_tipo,
      'Es Pensión': r.es_pension ? 'SÍ' : 'NO',
      'Costo (Bs)': r.costo,
    }));
    exportToCSV(`Detalle_${reporteEmpleado.empleado_nombre}_${mes}_${year}`, data);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado visible únicamente en Impresión / PDF */}
      <div className="hidden print:block border-b border-slate-300 pb-2 mb-4">
        <h1 className="text-xl font-black text-slate-900">Restaurante Institucional "Rumbo al Cielo"</h1>
        <p className="text-xs text-slate-600">Reporte Detallado de Consumo por Empleado — Período: {mes}/{year}</p>
      </div>

      {/* Controles de Selección (ocultos al imprimir) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center md:justify-between gap-4 no-print">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-teal-600" />
            Reporte Detallado por Empleado
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Desglose individual de cada plato consumido por el empleado y sus familiares en el período.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-teal-500"
            >
              {meses.map((m) => (
                <option key={m.num} value={m.num}>
                  {m.nombre}
                </option>
              ))}
            </select>

            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-teal-500"
            >
              {[2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-slate-400" />
            <select
              value={empleadoSeleccionado}
              onChange={(e) => setEmpleadoSeleccionado(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-teal-500 max-w-[200px]"
            >
              <option value="">-- Seleccionar Empleado --</option>
              {usuarios.map((u) => (
                <option key={u.id_usuario} value={u.id_usuario}>
                  {u.nombre_completo || `${u.nombre || ''} ${u.apellidos || ''}`.trim()} ({u.ci_codigo})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGenerar}
            disabled={loading}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Consultando...' : 'Generar reporte'}</span>
          </button>
        </div>
      </div>

      {/* Resultados de Detalle */}
      {generado && reporteEmpleado && (
        <div className="space-y-4">
          {/* Header de Resumen del Empleado */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                Desglose Individual de Facturación
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                {reporteEmpleado.empleado_nombre}
              </h3>
              <p className="text-slate-500 text-xs">
                CI: <span className="font-mono font-semibold text-slate-700">{reporteEmpleado.empleado_ci}</span> • Rol: {reporteEmpleado.rol}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={printReport}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border border-slate-200"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir</span>
              </button>
              <button
                onClick={handleExportar}
                className="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border border-teal-200"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar (Excel/CSV)</span>
              </button>
            </div>
          </div>

          {/* Cards de Métricas del Empleado */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <p className="text-xs text-slate-500 font-semibold uppercase">Consumos Titular</p>
              <p className="text-xl font-black text-slate-900 mt-1">
                {reporteEmpleado.resumen.total_titular}{' '}
                <span className="text-xs text-slate-500 font-normal">
                  (Bs {reporteEmpleado.resumen.monto_titular.toFixed(2)})
                </span>
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <p className="text-xs text-indigo-600 font-semibold uppercase">Consumos Familiares</p>
              <p className="text-xl font-black text-indigo-700 mt-1">
                {reporteEmpleado.resumen.total_familiares}{' '}
                <span className="text-xs text-indigo-400 font-normal">
                  (Bs {reporteEmpleado.resumen.monto_familiares.toFixed(2)})
                </span>
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <p className="text-xs text-emerald-600 font-semibold uppercase">Total General a Cobrar</p>
              <p className="text-xl font-black text-emerald-700 mt-1">
                Bs {reporteEmpleado.resumen.monto_total.toFixed(2)}{' '}
                <span className="text-xs text-emerald-500 font-normal">
                  ({reporteEmpleado.resumen.total_almuerzos} almuerzos)
                </span>
              </p>
            </div>
          </div>

          {/* Tabla de Reservas y Platos */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4">Beneficiario</th>
                    <th className="py-3 px-4">Plato Servido</th>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4 text-center">Modalidad</th>
                    <th className="py-3 px-4 text-right">Costo Aplicado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {reporteEmpleado.reservas.map((res, i) => (
                    <tr key={res.id_reserva || i} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {new Date(res.fecha).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {res.es_familiar ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md text-[11px]">
                            <Heart className="w-3 h-3 text-indigo-500" />
                            {res.beneficiario}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                            Titular
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {res.plato_nombre}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {res.plato_tipo}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            res.es_pension
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {res.es_pension ? 'Pensión' : 'Esporádico'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-900">
                        Bs {res.costo.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

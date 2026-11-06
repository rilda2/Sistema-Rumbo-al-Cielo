import React, { useState } from 'react';
import { 
  Building2, 
  Download, 
  Printer, 
  Users, 
  Calendar, 
  Layers, 
  Sparkles,
  HeartHandshake
} from 'lucide-react';
import { exportToCSV, printReport } from '../utils/exportUtils';

export default function ReporteConsumoHU15({
  mes,
  setMes,
  year,
  setYear,
  loading,
  error,
  setError,
  reporteConsumo,
  agruparPorArea,
  setAgruparPorArea,
  generarReporteConsumo,
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
    if (!mes) {
      setError('Debe seleccionar un mes');
      return;
    }
    try {
      await generarReporteConsumo(mes, year, agruparPorArea);
      setGenerado(true);
    } catch {
      // Error manejado en hook
    }
  };

  const handleExportar = () => {
    if (!reporteConsumo) return;

    let items = [];
    if (agruparPorArea && typeof reporteConsumo === 'object' && !Array.isArray(reporteConsumo)) {
      Object.keys(reporteConsumo).forEach((area) => {
        reporteConsumo[area].forEach((row) => {
          items.push({ Area: area, ...row });
        });
      });
    } else if (Array.isArray(reporteConsumo)) {
      items = reporteConsumo;
    }

    if (!items.length) return;

    const exportRows = items.map((r) => ({
      Área: r.area || 'General',
      Empleado: r.empleado_nombre,
      CI: r.empleado_ci,
      'Rol Institucional': r.rol,
      'Almuerzos Titular': r.consumos_titular,
      'Monto Titular (Bs)': r.monto_titular,
      'Almuerzos Familiares': r.consumos_familiares,
      'Monto Familiares (Bs)': r.monto_familiares,
      'Total Almuerzos': r.total_almuerzos,
      'Monto Total (Bs)': r.monto_total,
      'Detalle Familiares': r.familiares?.map((f) => `${f.nombre} (${f.parentesco}): ${f.cantidad}`).join('; ') || 'Ninguno',
    }));

    exportToCSV(`Reporte_Consumo_Mensual_${mes}_${year}`, exportRows);
  };

  const renderFila = (item) => (
    <tr key={item.id_usuario} className="hover:bg-slate-50/80 transition text-xs">
      <td className="py-3 px-4">
        <p className="font-bold text-slate-900">{item.empleado_nombre}</p>
        <p className="text-[11px] text-slate-400 font-mono">CI: {item.empleado_ci}</p>
      </td>
      <td className="py-3 px-4">
        <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
          {item.area}
        </span>
      </td>
      <td className="py-3 px-4 text-center font-bold text-slate-800">
        {item.consumos_titular} <span className="text-[10px] text-slate-400 font-normal">({item.monto_titular} Bs)</span>
      </td>
      <td className="py-3 px-4">
        <div className="text-center font-bold text-indigo-700">
          {item.consumos_familiares} <span className="text-[10px] text-indigo-400 font-normal">({item.monto_familiares} Bs)</span>
        </div>
        {item.familiares && item.familiares.length > 0 && (
          <div className="mt-1 space-y-0.5">
            {item.familiares.map((f, i) => (
              <span key={i} className="block text-[10px] text-slate-500">
                • {f.nombre} ({f.parentesco}): <strong>{f.cantidad} alm.</strong>
              </span>
            ))}
          </div>
        )}
      </td>
      <td className="py-3 px-4 text-center font-black text-slate-900">
        {item.total_almuerzos}
      </td>
      <td className="py-3 px-4 text-right font-black text-emerald-700">
        Bs {item.monto_total.toFixed(2)}
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      {/* Encabezado visible únicamente en Impresión / PDF */}
      <div className="hidden print:block border-b border-slate-300 pb-2 mb-4">
        <h1 className="text-xl font-black text-slate-900">Restaurante Institucional "Rumbo al Cielo"</h1>
        <p className="text-xs text-slate-600">Reporte Mensual de Consumo Institucional — Período: {mes}/{year}</p>
      </div>

      {/* Controles de Selección (ocultos al imprimir) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center md:justify-between gap-4 no-print">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            Reporte Mensual de Consumo para la Institución
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Genera consumos discriminados entre empleados y sus familiares registrados, con opción de desglose por área.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-indigo-500"
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
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-indigo-500"
            >
              {[2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={agruparPorArea}
              onChange={(e) => setAgruparPorArea(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              Desglose por Área
            </span>
          </label>

          <button
            onClick={handleGenerar}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Generando...' : 'Generar reporte'}</span>
          </button>
        </div>
      </div>

      {/* Resultados de Consumo */}
      {generado && reporteConsumo && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Users className="w-4 h-4 text-slate-400" />
              <span>Consumos correspondientes al período seleccionado</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={printReport}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border border-slate-200"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir</span>
              </button>
              <button
                onClick={handleExportar}
                className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border border-indigo-200"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar (Excel/CSV)</span>
              </button>
            </div>
          </div>

          {/* Si está agrupado por área */}
          {agruparPorArea && typeof reporteConsumo === 'object' && !Array.isArray(reporteConsumo) ? (
            <div className="space-y-6">
              {Object.keys(reporteConsumo).map((areaNombre) => (
                <div key={areaNombre} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-600" />
                      Área: {areaNombre}
                    </h3>
                    <span className="text-xs font-semibold text-slate-500">
                      {reporteConsumo[areaNombre].length} empleados
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50/50 text-slate-700 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
                        <tr>
                          <th className="py-3 px-4">Empleado</th>
                          <th className="py-3 px-4">Área</th>
                          <th className="py-3 px-4 text-center">Consumos Titular</th>
                          <th className="py-3 px-4 text-center">Consumos Familiares</th>
                          <th className="py-3 px-4 text-center">Total Almuerzos</th>
                          <th className="py-3 px-4 text-right">Monto Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {reporteConsumo[areaNombre].map(renderFila)}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Lista plana */
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4">Empleado / CI</th>
                      <th className="py-3.5 px-4">Área</th>
                      <th className="py-3.5 px-4 text-center">Consumos Titular</th>
                      <th className="py-3.5 px-4 text-center">Consumos Familiares</th>
                      <th className="py-3.5 px-4 text-center">Total Almuerzos</th>
                      <th className="py-3.5 px-4 text-right">Monto Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {Array.isArray(reporteConsumo) && reporteConsumo.length > 0 ? (
                      reporteConsumo.map(renderFila)
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          Sin consumos registrados en este período.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

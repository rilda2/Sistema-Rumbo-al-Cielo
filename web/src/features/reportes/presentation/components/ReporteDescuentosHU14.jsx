import React, { useState } from 'react';
import { 
  Calculator, 
  Save, 
  Download, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Award,
  Sparkles,
  Calendar,
  DollarSign
} from 'lucide-react';
import { exportToCSV } from '../utils/exportUtils';

export default function ReporteDescuentosHU14({
  mes,
  setMes,
  year,
  setYear,
  loading,
  error,
  setError,
  toast,
  showToast,
  reporteDescuentos,
  reporteDescuentosGenerado,
  generarReporteDescuentos,
  aplicarDescuentoManual,
  guardarCierre,
  guardandoCierre,
}) {
  const [modalManualOpen, setModalManualOpen] = useState(false);
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);
  const [detalleIndex, setDetalleIndex] = useState(-1);
  const [nuevoMonto, setNuevoMonto] = useState('');

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
    if (!mes || !year) {
      setError('Debe seleccionar un período válido');
      return;
    }
    try {
      await generarReporteDescuentos(mes, year);
    } catch {
      // Error manejado en hook
    }
  };

  const abrirModalDescuento = (detalle, index) => {
    setDetalleSeleccionado(detalle);
    setDetalleIndex(index);
    setNuevoMonto(detalle.total_descontar.toString());
    setModalManualOpen(true);
  };

  const handleConfirmarDescuentoManual = () => {
    if (!nuevoMonto || isNaN(Number(nuevoMonto)) || Number(nuevoMonto) < 0) {
      showToast('Ingrese un monto válido.', 'error');
      return;
    }
    try {
      aplicarDescuentoManual(detalleIndex, Number(nuevoMonto));
      setModalManualOpen(false);
      setDetalleSeleccionado(null);
    } catch {
      // Error manejado en hook
    }
  };

  const handleExportar = () => {
    if (!reporteDescuentos || !reporteDescuentos.detalles.length) return;
    const data = reporteDescuentos.detalles.map((d) => ({
      'Empleado': d.empleado_nombre,
      'CI': d.empleado_ci,
      'Modalidad': d.tipo_reserva === 'pension' ? 'Pensionado' : 'Esporádico',
      'Cumple Antigüedad': d.cumple_antiguedad ? 'SÍ' : 'NO',
      'Almuerzos Cobrables': d.cantidad_cobrable,
      'Precio Unitario (Bs)': d.precio_unitario,
      'Descuento Manual (Bs)': d.descuento_manual,
      'Total a Descontar (Bs)': d.total_descontar,
      'Estado': d.estado_descuento,
    }));
    exportToCSV(`Cierre_Descuentos_${mes}_${year}`, data);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`p-4 rounded-2xl flex items-center space-x-2 text-sm font-semibold shadow-sm ${
            toast.type === 'error'
              ? 'bg-rose-50 border border-rose-200 text-rose-800'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          )}
          <span>{toast.mensaje}</span>
        </div>
      )}

      {/* Encabezado visible únicamente en Impresión / PDF */}
      <div className="hidden print:block border-b border-slate-300 pb-2 mb-4">
        <h1 className="text-xl font-black text-slate-900">Restaurante Institucional "Rumbo al Cielo"</h1>
        <p className="text-xs text-slate-600">Cierre Contable y Descuentos Mensuales — Período: {mes}/{year}</p>
      </div>

      {/* Controles del Período (ocultos al imprimir) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center md:justify-between gap-4 no-print">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            Reporte de Descuentos y Cobros al Cierre de Mes
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Calcula cobros según antigüedad del pensionado (Tarifa $15 con beneficio vs Tarifa normal $18).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-blue-500"
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
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-blue-500"
            >
              {[2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGenerar}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Calculando...' : 'Generar reporte'}</span>
          </button>
        </div>
      </div>

      {/* Estado: Reporte no generado */}
      {!reporteDescuentosGenerado && !loading && (
        <div className="p-8 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-center space-y-2">
          <Info className="w-8 h-8 text-amber-600 mx-auto" />
          <h3 className="font-bold text-amber-900 text-base">Reporte no generado</h3>
          <p className="text-amber-700 text-xs max-w-md mx-auto">
            Seleccione el mes y año deseados y presione <strong>"Generar reporte"</strong> para calcular automáticamente los cobros y validar las reglas de antigüedad de pensionados.
          </p>
        </div>
      )}

      {/* Resultados del Cierre */}
      {reporteDescuentosGenerado && reporteDescuentos && (
        <div className="space-y-4">
          {/* Header de Resumen y Acciones */}
          <div className="bg-gradient-to-r from-slate-900 to-blue-950 p-6 rounded-2xl text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="text-blue-300 font-semibold text-xs tracking-wider uppercase">
                Resumen de Liquidación Mensual
              </span>
              <h3 className="text-2xl font-black mt-1">
                Total a Descontar: Bs {reporteDescuentos.cierre.total_general.toFixed(2)}
              </h3>
              <p className="text-slate-300 text-xs mt-0.5">
                {reporteDescuentos.detalles.length} empleados con consumos activos en el período.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleExportar}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium transition flex items-center gap-2 border border-white/20"
              >
                <Download className="w-4 h-4" />
                <span>Exportar CSV</span>
              </button>

              <button
                onClick={guardarCierre}
                disabled={guardandoCierre}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{guardandoCierre ? 'Guardando...' : 'Confirmar y Guardar Cierre'}</span>
              </button>
            </div>
          </div>

          {/* Tabla de Cobros y Descuentos */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Empleado / CI</th>
                    <th className="py-3.5 px-4">Modalidad</th>
                    <th className="py-3.5 px-4 text-center">Almuerzos</th>
                    <th className="py-3.5 px-4 text-center">Tarifa Unit.</th>
                    <th className="py-3.5 px-4 text-center">Antigüedad</th>
                    <th className="py-3.5 px-4 text-right">Total a Descontar</th>
                    <th className="py-3.5 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {reporteDescuentos.detalles.map((detalle, idx) => (
                    <tr key={detalle.id_empleado || idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{detalle.empleado_nombre}</p>
                        <p className="text-[11px] text-slate-400 font-mono">CI: {detalle.empleado_ci}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                            detalle.tipo_reserva === 'pension'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {detalle.tipo_reserva === 'pension' ? 'Pensionado' : 'Esporádico'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                        {detalle.cantidad_cobrable}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                        Bs {detalle.precio_unitario.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {detalle.cumple_antiguedad ? (
                          <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] font-semibold border border-emerald-200">
                            <Award className="w-3 h-3 mr-1" />
                            Cumple ({detalle.antiguedad_meses} reg.)
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-[11px] font-semibold border border-amber-200">
                            Tarifa Normal
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900 text-sm">
                        Bs {detalle.total_descontar.toFixed(2)}
                        {detalle.descuento_manual > 0 && (
                          <span className="block text-[10px] text-emerald-600 font-semibold">
                            Desc. manual: -Bs {detalle.descuento_manual.toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => abrirModalDescuento(detalle, idx)}
                          title="Aplicar descuento manual"
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition inline-flex items-center gap-1 font-semibold text-[11px]"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Ajustar</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Descuento Manual (HU14) */}
      {modalManualOpen && detalleSeleccionado && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scale-in space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Aplicar Descuento Manualmente
              </h3>
              <button
                onClick={() => setModalManualOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              <p>
                <strong>Empleado:</strong> {detalleSeleccionado.empleado_nombre}
              </p>
              <p>
                <strong>Almuerzos consumidos:</strong> {detalleSeleccionado.cantidad_cobrable}
              </p>
              <p>
                <strong>Tarifa aplicada:</strong> Bs {detalleSeleccionado.precio_unitario} / almuerzo
              </p>
              <p className="text-slate-500">
                Total calculado inicialmente: Bs{' '}
                {(detalleSeleccionado.cantidad_cobrable * detalleSeleccionado.precio_unitario).toFixed(2)}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nuevo Monto Total a Cobrar (Bs):
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={nuevoMonto}
                onChange={(e) => setNuevoMonto(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm font-bold focus:ring-2 focus:ring-emerald-500"
                placeholder="Ej. 120"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                La diferencia se registrará automáticamente como descuento manual otorgado.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalManualOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarDescuentoManual}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

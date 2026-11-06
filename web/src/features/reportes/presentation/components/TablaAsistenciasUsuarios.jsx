import React, { useEffect, useState } from 'react';
import { 
  ClipboardCheck, 
  Calendar, 
  Clock, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Download, 
  Printer, 
  RotateCw,
  User
} from 'lucide-react';
import { exportToCSV, printReport } from '../utils/exportUtils';

export default function TablaAsistenciasUsuarios({
  asistencias = [],
  cargando,
  cargarHistorialAsistencia,
  usuarios = [],
}) {
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos'); // 'todos' | 'asistio' | 'falto'
  const [filtroFecha, setFiltroFecha] = useState('');

  useEffect(() => {
    cargarHistorialAsistencia();
  }, []);

  // Filtrado reactivo en cliente (los datos ya vienen ordenados por fecha desc desde el backend)
  const asistenciasFiltradas = asistencias.filter((a) => {
    if (filtroUsuario && a.id_usuario !== filtroUsuario) {
      return false;
    }
    if (filtroEstado === 'asistio' && !a.asistio) {
      return false;
    }
    if (filtroEstado === 'falto' && a.asistio) {
      return false;
    }
    if (filtroFecha && a.fecha !== filtroFecha) {
      return false;
    }
    return true;
  });

  const handleExportar = () => {
    if (!asistenciasFiltradas.length) return;
    const data = asistenciasFiltradas.map((a) => ({
      Fecha: a.fecha,
      'Hora Marcado': a.hora_marcado,
      Empleado: a.empleado_nombre,
      CI: a.empleado_ci,
      Rol: a.rol,
      Asistencia: a.asistio ? 'ASISTIÓ' : 'NO ASISTIÓ',
      Observación: a.observacion || 'Ninguna',
    }));
    exportToCSV(`Reporte_Asistencias_${new Date().toISOString().split('T')[0]}`, data);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado visible únicamente en Impresión / PDF */}
      <div className="hidden print:block border-b border-slate-300 pb-2 mb-4">
        <h1 className="text-xl font-black text-slate-900">Restaurante Institucional "Rumbo al Cielo"</h1>
        <p className="text-xs text-slate-600">
          Reporte de Registro de Asistencia de Usuarios — Generado el: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Controles de Filtrado y Acción (ocultos al imprimir) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center md:justify-between gap-4 no-print">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-emerald-600" />
            Tabla de Asistencia de Usuarios
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Historial de marcaciones de asistencia ordenadas cronológicamente por fecha y hora de registro.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filtro Fecha */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              className="bg-transparent text-slate-800 text-xs focus:outline-none"
            />
            {filtroFecha && (
              <button
                onClick={() => setFiltroFecha('')}
                className="text-[10px] text-slate-400 hover:text-slate-600 font-bold ml-1"
                title="Limpiar fecha"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtro Empleado */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filtroUsuario}
              onChange={(e) => setFiltroUsuario(e.target.value)}
              className="bg-transparent text-slate-800 text-xs focus:outline-none max-w-[150px]"
            >
              <option value="">Todos los empleados</option>
              {usuarios.map((u) => (
                <option key={u.id_usuario} value={u.id_usuario}>
                  {u.nombre_completo || `${u.nombre || ''} ${u.apellidos || ''}`.trim()}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Estado */}
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-2.5 py-2 font-medium focus:ring-2 focus:ring-emerald-500"
          >
            <option value="todos">Todos los estados</option>
            <option value="asistio">Asistió</option>
            <option value="falto">No asistió</option>
          </select>

          {/* Botón Refrescar */}
          <button
            onClick={() => cargarHistorialAsistencia()}
            disabled={cargando}
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            title="Recargar asistencias"
          >
            <RotateCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Barra de Acciones y Resumen */}
      <div className="flex items-center justify-between no-print">
        <div className="text-xs text-slate-500 font-medium">
          Mostrando <strong className="text-slate-800">{asistenciasFiltradas.length}</strong> registros de asistencia
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
            disabled={!asistenciasFiltradas.length}
            className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border border-emerald-200 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Tabla de Asistencias */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Hora Marcado</th>
                <th className="py-3 px-4">Empleado / Beneficiario</th>
                <th className="py-3 px-4">CI</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4">Observación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {cargando ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                      <span>Cargando registro de asistencias...</span>
                    </div>
                  </td>
                </tr>
              ) : asistenciasFiltradas.length > 0 ? (
                asistenciasFiltradas.map((a) => (
                  <tr key={a.id_asistencia} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono text-sm font-bold text-slate-800">
                      {a.fecha}
                    </td>
                    <td className="py-3 px-4 font-mono text-sm text-slate-600 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {a.hora_marcado}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-sm text-slate-900">{a.empleado_nombre}</p>
                      <span className="text-[12px] text-slate-400">{a.rol}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {a.empleado_ci}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {a.asistio ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] font-semibold border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Asistió
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full text-[11px] font-semibold border border-rose-200">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          No asistió
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {a.observacion || <span className="text-slate-300 italic">Sin observación</span>}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No se encontraron registros de asistencia con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

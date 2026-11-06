import React, { useState } from 'react';
import { 
  X, 
  KeyRound, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  RefreshCw,
  Search,
  ShieldAlert
} from 'lucide-react';
import UsuarioRoleBadge from './UsuarioRoleBadge';

/**
 * Modal: SolicitudesPasswordModal
 * Muestra el historial y lista de solicitudes de cambio de contraseña enviadas por empleados.
 */
export default function SolicitudesPasswordModal({
  isOpen,
  onClose,
  solicitudes = [],
  loading = false,
  onRefresh,
  onOpenResetPasswordForUser,
}) {
  const [filter, setFilter] = useState('PENDIENTES'); // 'PENDIENTES' | 'TODAS'
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredList = (solicitudes || []).filter((s) => {
    const matchFilter = filter === 'ALL' || (filter === 'PENDIENTES' ? s.estado === 'Pendiente' : true);
    const searchLower = search.toLowerCase().trim();
    const matchSearch =
      !searchLower ||
      (s.email && s.email.toLowerCase().includes(searchLower)) ||
      (s.nombre_completo && s.nombre_completo.toLowerCase().includes(searchLower)) ||
      (s.ci_codigo && s.ci_codigo.toLowerCase().includes(searchLower));

    return matchFilter && matchSearch;
  });

  const pendingCount = (solicitudes || []).filter((s) => s.estado === 'Pendiente').length;

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('es-BO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-md border border-white/20">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold">Solicitudes de Contraseña</h3>
                {pendingCount > 0 && (
                  <span className="bg-white text-amber-900 text-xs font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                    {pendingCount} pendientes
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-100 font-medium">
                Peticiones enviadas por empleados desde la aplicación móvil
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
              title="Refrescar solicitudes"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-1.5 bg-slate-200/70 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setFilter('PENDIENTES')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === 'PENDIENTES'
                  ? 'bg-white text-amber-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pendientes ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === 'ALL'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Historial Completo ({solicitudes.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por correo o nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Lista de solicitudes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-slate-100">
          {filteredList.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-400 mb-2 opacity-80" />
              <p className="text-sm font-semibold text-slate-700">No hay solicitudes pendientes</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {filter === 'PENDIENTES'
                  ? 'Todas las peticiones de contraseña han sido atendidas.'
                  : 'No se encontraron registros con los filtros actuales.'}
              </p>
            </div>
          ) : (
            filteredList.map((sol) => {
              const isPendiente = sol.estado === 'Pendiente';
              return (
                <div
                  key={sol.id_solicitud}
                  className={`pt-2.5 first:pt-0 p-3 rounded-xl transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isPendiente ? 'bg-amber-50/50 border border-amber-200/60' : 'bg-slate-50/50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900">{sol.nombre_completo}</span>
                      <UsuarioRoleBadge rol={sol.rol} />
                      {isPendiente ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1 animate-pulse" />
                          Pendiente
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Atendida
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      <span className="font-mono text-slate-500">{sol.email}</span>
                      <span>• C.I.: {sol.ci_codigo}</span>
                      <span className="flex items-center space-x-1 text-slate-400 text-[11px]">
                        <Clock className="w-3 h-3" />
                        <span>Solicitado: {formatDate(sol.fecha_solicitud)}</span>
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 w-full sm:w-auto flex justify-end">
                    <button
                      type="button"
                      onClick={() => onOpenResetPasswordForUser(sol)}
                      className={`w-full sm:w-auto px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-xs ${
                        isPendiente
                          ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
                          : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                      }`}
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>{isPendiente ? 'Atender y Cambiar Clave' : 'Cambiar Clave'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Total registradas: {solicitudes.length}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

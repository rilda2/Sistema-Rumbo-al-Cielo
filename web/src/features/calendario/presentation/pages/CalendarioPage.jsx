import React, { useState } from 'react';
import { useAuth } from '../../../auth';
import { useCalendario } from '../hooks/useCalendario';
import { formatLocalDate } from '../../../../lib/dateUtils';
import { 
  CalendarDays, 
  CalendarPlus, 
  RefreshCw, 
  CalendarX, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Sparkles, 
  Trash2 
} from 'lucide-react';

import CalendarioGrid from '../components/CalendarioGrid';
import ExcepcionCreateModal from '../components/ExcepcionCreateModal';
import ExcepcionDeleteModal from '../components/ExcepcionDeleteModal';

/**
 * Página Principal: CalendarioPage
 * 
 * Capa de Presentación:
 * - Orquesta la vista del calendario institucional y los días de no atención.
 * - Consume useCalendario (que interactúa con Casos de Uso del Dominio).
 */
export default function CalendarioPage() {
  const { user, isAdmin } = useAuth();
  const {
    excepciones,
    proximasExcepciones,
    loading,
    error,
    currentMonth,
    loadExcepciones,
    addExcepcion,
    removeExcepcion,
    handlePrevMonth,
    handleNextMonth,
    handleToday,
  } = useCalendario();

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDateForCreate, setSelectedDateForCreate] = useState('');
  const [excepcionToDelete, setExcepcionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSelectDate = (dateStr, excepcion) => {
    if (excepcion) {
      if (isAdmin) {
        setExcepcionToDelete(excepcion);
      }
    } else if (isAdmin) {
      setSelectedDateForCreate(dateStr);
      setShowCreateModal(true);
    }
  };

  const handleConfirmDelete = async (excepcion) => {
    try {
      setIsDeleting(true);
      await removeExcepcion(excepcion);
      showToast(`Excepción del ${excepcion.fecha} eliminada.`);
      setExcepcionToDelete(null);
    } catch (err) {
      console.error('[CalendarioPage] Error al eliminar excepción:', err);
      alert('Error al eliminar la excepción.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Toast Notificación */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-2 text-sm font-semibold animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 mb-1">
            <CalendarDays className="w-6 h-6" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Calendario de Atención & Excepciones
            </h1>
          </div>
          <p className="text-slate-500 text-sm">
            Gestión institucional de días feriados, de no atención y pausas de servicio de almuerzos.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={loadExcepciones}
            disabled={loading}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition shadow-2xs hover:text-slate-900 cursor-pointer"
            title="Recargar excepciones"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setSelectedDateForCreate('');
                setShowCreateModal(true);
              }}
              className="flex items-center space-x-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-rose-500/20 transition cursor-pointer"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Registrar Día de No Atención</span>
            </button>
          )}
        </div>
      </div>

      {/* Tarjeta de Advertencia / Lista de Próximos Días Inhábiles */}
      {proximasExcepciones.length > 0 ? (
        <div className="bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50 border border-rose-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center space-x-2.5 mb-3">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-900">
                Próximas Fechas sin Atención Programadas ({proximasExcepciones.length})
              </h4>
              <p className="text-xs text-rose-700">
                En estas fechas los empleados no podrán registrar reservas en el portal.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {proximasExcepciones.slice(0, 4).map((ex) => (
              <div
                key={ex.fecha}
                className="bg-white/90 backdrop-blur-xs p-3 rounded-xl border border-rose-200 shadow-2xs flex items-center justify-between"
              >
                <div className="overflow-hidden pr-2">
                  <div className="flex items-center space-x-1.5 text-rose-900 font-bold text-xs">
                    <Clock className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                    <span>{ex.fecha}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 truncate mt-0.5" title={ex.motivo}>
                    {ex.motivo}
                  </p>
                </div>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setExcepcionToDelete(ex)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Eliminar excepción"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-2xl p-4 flex items-center space-x-3 text-emerald-800 text-xs font-medium">
          <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>No hay días festivos ni pausas de atención registradas para las próximas semanas. El servicio funciona normalmente.</span>
        </div>
      )}

      {/* Main Interactive Grid */}
      <CalendarioGrid
        currentMonth={currentMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        excepciones={excepciones}
        isAdmin={isAdmin}
        onSelectDate={handleSelectDate}
        onDeleteExcepcion={(ex) => setExcepcionToDelete(ex)}
      />

      {/* Modal Registrar Excepción */}
      <ExcepcionCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        initialDate={selectedDateForCreate}
        adminUser={user}
        onCreateExcepcion={addExcepcion}
        showToast={showToast}
      />

      {/* Modal Confirmar Eliminación */}
      <ExcepcionDeleteModal
        isOpen={Boolean(excepcionToDelete)}
        excepcion={excepcionToDelete}
        onClose={() => setExcepcionToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}

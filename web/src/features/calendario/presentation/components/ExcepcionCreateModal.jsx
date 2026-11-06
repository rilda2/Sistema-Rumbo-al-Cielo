import React, { useState, useEffect } from 'react';
import Modal from '../../../../components/Modal';
import { formatLocalDate } from '../../../../lib/dateUtils';
import { CalendarX, Calendar, AlertCircle, Check, Shield } from 'lucide-react';

/**
 * Componente Visual: ExcepcionCreateModal
 * 
 * Capa de Presentación:
 * - Cero imports de Supabase.
 * - Invoca la función onCreateExcepcion delegada al Caso de Uso de Dominio.
 */
export default function ExcepcionCreateModal({
  isOpen,
  onClose,
  initialDate,
  adminUser,
  onCreateExcepcion,
  showToast,
}) {
  const [fecha, setFecha] = useState('');
  const [motivo, setMotivo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialDate) {
      setFecha(initialDate);
    } else {
      const today = formatLocalDate(new Date());
      setFecha(today);
    }
    setMotivo('');
    setError(null);
  }, [initialDate, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!fecha) {
      setError('Debes seleccionar una fecha.');
      return;
    }
    if (!motivo.trim()) {
      setError('Debes ingresar el motivo de no atención.');
      return;
    }

    try {
      setSubmitting(true);
      const adminId = adminUser?.id || adminUser?.id_usuario;
      await onCreateExcepcion({
        fecha,
        motivo: motivo.trim(),
        id_encargado: adminId,
      });

      showToast?.(`Día de excepción registrado para el ${fecha}.`);
      onClose();
    } catch (err) {
      console.error('[ExcepcionCreateModal] Error al crear excepción:', err);
      setError(err.message || 'Error al registrar el día de excepción.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Día de No Atención"
      subtitle="Suspender el servicio para empleados en una fecha determinada"
      icon={CalendarX}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2.5 text-rose-700 text-xs animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
            <div className="leading-snug">
              <span className="font-semibold block">Error:</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Campo Fecha */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Fecha de No Atención *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Calendar className="w-4 h-4" />
            </div>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            En esta fecha ningún empleado podrá seleccionar menú ni realizar reservas.
          </p>
        </div>

        {/* Campo Motivo */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Motivo / Razón *
          </label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            required
            rows={3}
            placeholder="Ej. Feriado Nacional, Fumigación, Mantenimiento preventivo..."
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition resize-none"
          />
        </div>

        {/* Mensaje Informativo Admin */}
        <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-start space-x-2.5 text-blue-900 text-xs">
          <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p>
            Esta acción se registrará en la auditoría del sistema bajo la firma de tu cuenta administradora.
          </p>
        </div>

        {/* Botones de Acción */}
        <div className="mt-6 flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center space-x-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-500/20 transition disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Confirmar Excepción</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

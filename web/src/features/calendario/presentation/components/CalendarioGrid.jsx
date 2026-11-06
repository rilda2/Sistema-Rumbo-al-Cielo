import React, { useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Info 
} from 'lucide-react';

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Componente Visual: CalendarioGrid
 */
export default function CalendarioGrid({
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onToday,
  excepciones = [],
  isAdmin,
  onSelectDate,
  onDeleteExcepcion,
}) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Diccionario de excepciones por fecha string 'YYYY-MM-DD'
  const excepcionesMap = useMemo(() => {
    const map = new Map();
    excepciones.forEach((e) => {
      if (e.fecha) {
        const dateStr = e.fecha.split('T')[0];
        map.set(dateStr, e);
      }
    });
    return map;
  }, [excepciones]);

  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  // Construcción de la matriz de días del mes
  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado. Ajustamos para que Lunes = 0 y Domingo = 6
    const firstDayIndex = (firstDayOfMonth.getDay() + 6) % 7;

    const cells = [];

    // Días del mes anterior para rellenar
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      cells.push({
        dayNumber: prevMonthLastDay - i,
        isCurrentMonth: false,
        isWeekend: false,
        dateStr: null,
      });
    }

    // Días del mes en curso
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const dayOfWeek = (dateObj.getDay() + 6) % 7; // 0..6 (Lun..Dom)
      const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Sábado o Domingo

      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const excepcion = excepcionesMap.get(dateStr);

      cells.push({
        dayNumber: d,
        isCurrentMonth: true,
        isWeekend,
        dateStr,
        excepcion,
        isToday: dateStr === todayStr,
      });
    }

    // Días del siguiente mes para completar las semanas en la cuadrícula
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        dayNumber: i,
        isCurrentMonth: false,
        isWeekend: false,
        dateStr: null,
      });
    }

    return cells;
  }, [year, month, excepcionesMap, todayStr]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
      {/* Barra de Controles del Mes */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/10 rounded-xl">
            <Calendar className="w-5 h-5 text-blue-200" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg sm:text-xl tracking-tight">
              {MONTH_NAMES[month]} {year}
            </h3>
            <p className="text-xs text-blue-100">
              {isAdmin
                ? 'Haz clic en cualquier día laboral para marcar una excepción de no atención.'
                : 'Calendario de atención y días no laborables.'}
            </p>
          </div>
        </div>

        {/* Botones de Navegación */}
        <div className="flex items-center space-x-1.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={onToday}
            className="px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={onPrevMonth}
            className="p-1.5 bg-white/15 hover:bg-white/25 rounded-xl transition cursor-pointer"
            title="Mes anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            className="p-1.5 bg-white/15 hover:bg-white/25 rounded-xl transition cursor-pointer"
            title="Mes siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Días de la Semana Encabezado */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center text-xs font-bold uppercase tracking-wider text-slate-600">
        {WEEKDAYS.map((w, idx) => (
          <div
            key={w}
            className={`py-3 ${idx >= 5 ? 'text-slate-400 bg-slate-100/50' : ''}`}
          >
            {w}
          </div>
        ))}
      </div>

      {/* Cuadrícula de Días */}
      <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
        {calendarCells.map((cell, idx) => {
          if (!cell.isCurrentMonth) {
            return (
              <div
                key={`other-${idx}`}
                className="min-h-[90px] sm:min-h-[105px] p-2 bg-slate-50/40 text-slate-300 text-xs font-medium select-none"
              >
                <span>{cell.dayNumber}</span>
              </div>
            );
          }

          const hasExcepcion = Boolean(cell.excepcion);
          const isClickable = isAdmin && cell.isCurrentMonth && !cell.isWeekend;

          return (
            <div
              key={cell.dateStr}
              onClick={() => {
                if (isClickable) {
                  onSelectDate?.(cell.dateStr, cell.excepcion);
                }
              }}
              className={`min-h-[90px] sm:min-h-[105px] p-2 flex flex-col justify-between transition group relative ${
                cell.isWeekend
                  ? 'bg-slate-50/60 text-slate-400 cursor-not-allowed'
                  : hasExcepcion
                  ? 'bg-rose-50/50 hover:bg-rose-50'
                  : isClickable
                  ? 'bg-white hover:bg-blue-50/30 cursor-pointer'
                  : 'bg-white'
              }`}
            >
              {/* Encabezado del Día */}
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full ${
                    cell.isToday
                      ? 'bg-blue-600 text-white shadow-xs'
                      : hasExcepcion
                      ? 'text-rose-700 font-extrabold'
                      : cell.isWeekend
                      ? 'text-slate-400'
                      : 'text-slate-700'
                  }`}
                >
                  {cell.dayNumber}
                </span>

                {/* Botón flotante para Administrador si no tiene excepción */}
                {isClickable && !hasExcepcion && (
                  <button
                    type="button"
                    className="opacity-0 group-hover:opacity-100 p-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition shadow-2xs"
                    title="Marcar día de no atención"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Contenido / Estado del Día */}
              <div className="mt-1 flex-1 flex flex-col justify-end">
                {hasExcepcion ? (
                  <div className="p-1.5 bg-rose-100/90 border border-rose-200 rounded-lg text-rose-800 text-[11px] leading-tight flex items-start justify-between space-x-1 shadow-2xs">
                    <div className="overflow-hidden">
                      <div className="flex items-center space-x-1 font-bold text-rose-900">
                        <AlertCircle className="w-3 h-3 text-rose-600 flex-shrink-0" />
                        <span className="truncate">Sin Atención</span>
                      </div>
                      <p className="text-[10px] text-rose-700 font-medium truncate mt-0.5" title={cell.excepcion.motivo}>
                        {cell.excepcion.motivo}
                      </p>
                    </div>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteExcepcion?.(cell.excepcion);
                        }}
                        className="opacity-80 hover:opacity-100 p-0.5 text-rose-700 hover:text-rose-900 transition"
                        title="Eliminar excepción"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ) : cell.isWeekend ? (
                  <span className="text-[10px] text-slate-400 font-medium italic">
                    Fin de semana
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Leyenda Footer */}
      <div className="bg-slate-50 px-4 sm:px-6 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
            <span>Hoy</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-md bg-rose-100 border border-rose-300 inline-block" />
            <span>Día de No Atención (Excepción)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-md bg-slate-100 inline-block" />
            <span>Fin de semana (Cerrado)</span>
          </div>
        </div>

        {isAdmin && (
          <div className="flex items-center space-x-1 text-slate-600 font-medium">
            <Info className="w-3.5 h-3.5 text-blue-600" />
            <span>Clic en día hábil para agregar excepción.</span>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  ChefHat,
  Clock,
  AlertCircle,
  CheckCircle2,
  UtensilsCrossed,
  Sparkles,
  CalendarPlus
} from 'lucide-react';

import {
  getMondayOfWeek,
  generateWeekDays,
  formatLocalDate,
  parseLocalDate
} from '../../../../lib/dateUtils';
import { useReservas, ReservarModal } from '../../../reservas';

/**
 * Componente Visual: MenuSemanalView
 */
export default function MenuSemanalView({
  menus = [],
  isAdmin,
  onOpenCreateWeekModal,
  onRefresh,
  loading,
}) {
  const [selectedMonday, setSelectedMonday] = useState(() => getMondayOfWeek(new Date()));
  const { familiares, activasPorFecha, evaluarReserva, reservar } = useReservas({ enabled: !isAdmin });
  const [diaAReservar, setDiaAReservar] = useState(null); // { fecha, etiqueta, menu }

  // Navegación de semana con cálculos de fecha local segura
  const handlePrevWeek = () => {
    const monday = parseLocalDate(selectedMonday);
    monday.setDate(monday.getDate() - 7);
    setSelectedMonday(formatLocalDate(monday));
  };

  const handleNextWeek = () => {
    const monday = parseLocalDate(selectedMonday);
    monday.setDate(monday.getDate() + 7);
    setSelectedMonday(formatLocalDate(monday));
  };

  const handleCurrentWeek = () => {
    setSelectedMonday(getMondayOfWeek(new Date()));
  };

  // Generación de los 5 días hábiles (Lunes a Viernes) para la semana seleccionada
  // const weekDays = useMemo(() => {eturn generateWeekDays(selectedMonday);}, [selectedMonday]);
  const weekDays = useMemo(() => generateWeekDays(selectedMonday).slice(0, 4), [selectedMonday]);

  // Diccionario rápido de menús por fecha string 'YYYY-MM-DD'
  const menusMap = useMemo(() => {
    const map = new Map();
    menus.forEach((m) => {
      if (m.fecha) {
        const dateStr = m.fecha.split('T')[0];
        map.set(dateStr, m);
      }
    });
    return map;
  }, [menus]);

  // Rango de fechas para el encabezado (ej. "14 Oct - 18 Oct 2026")
  const weekRangeLabel = useMemo(() => {
    if (weekDays.length === 0) return '';
    const first = weekDays[0].dateObj;
    const last = weekDays[weekDays.length - 1].dateObj;
    const firstStr = first.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    const lastStr = last.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${firstStr} – ${lastStr}`;
  }, [weekDays]);

  const todayStr = useMemo(() => formatLocalDate(new Date()), []);

  return (
    <div className="space-y-6">
      {/* Barra de Navegación de Semanas */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 capitalize">
              Semana del {weekRangeLabel}
            </h2>
            <p className="text-xs text-slate-500">
              Programación de almuerzos de lunes a jueves
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Botones de navegación semanal */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={handlePrevWeek}
              className="p-1.5 hover:bg-white text-slate-600 hover:text-slate-900 rounded-lg transition shadow-2xs cursor-pointer"
              title="Semana anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleCurrentWeek}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-white rounded-lg transition shadow-2xs cursor-pointer"
            >
              Semana Actual
            </button>
            <button
              type="button"
              onClick={handleNextWeek}
              className="p-1.5 hover:bg-white text-slate-600 hover:text-slate-900 rounded-lg transition shadow-2xs cursor-pointer"
              title="Semana siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Botón Administrador: Crear / Editar Menú Semanal */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => onOpenCreateWeekModal?.(selectedMonday)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition cursor-pointer"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Configurar Menú Semanal</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid de los 5 días de la semana */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {weekDays.map((day) => {
          const menuDia = menusMap.get(day.dateStr);
          const isToday = day.dateStr === todayStr;
          const isPublished = menuDia ? (typeof menuDia.isPublicado === 'function' ? menuDia.isPublicado() : Boolean(menuDia.estado_publicacion)) : false;
          const platosDelDia = menuDia?.platos || [];

          return (
            <div
              key={day.dateStr}
              className={`bg-white rounded-2xl shadow-sm border flex flex-col transition-all duration-200 overflow-hidden ${isToday
                ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                : 'border-slate-200/80 hover:border-slate-300'
                }`}
            >
              {/* Encabezado de la Tarjeta del Día */}
              <div
                className={`p-3.5 border-b text-center relative ${isToday
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                  : 'bg-slate-50 text-slate-800 border-slate-100'
                  }`}
              >
                {isToday && (
                  <span className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-200 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                  </span>
                )}
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider block ${isToday ? 'text-blue-100' : 'text-slate-500'
                    }`}
                >
                  {day.dayName}
                </span>
                <span className="text-base font-extrabold block mt-0.5">
                  {day.displayDate}
                </span>

                {/* Badge de Publicación */}
                <div className="mt-2 flex items-center justify-center">
                  {isPublished ? (
                    <span
                      className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${isToday
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-100 text-emerald-800'
                        }`}
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Publicado
                    </span>
                  ) : (
                    <span
                      className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${isToday
                        ? 'bg-black/20 text-blue-100'
                        : 'bg-amber-100 text-amber-800'
                        }`}
                    >
                      <Clock className="w-3 h-3 mr-1" /> Borrador / Pendiente
                    </span>
                  )}
                </div>
              </div>

              {/* Contenido / Lista de Platos para este día */}
              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                {platosDelDia.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 my-auto">
                    <ChefHat className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="text-xs font-semibold text-slate-500">Sin platos asignados</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isAdmin ? 'Haz clic en configurar para asignar platos.' : 'Aún no disponible.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {platosDelDia.map((plato) => (
                      <div
                        key={plato.id_plato}
                        className="p-2.5 bg-slate-50/80 hover:bg-slate-100/80 rounded-xl border border-slate-100 transition group flex items-start space-x-2.5"
                      >
                        {/* Miniatura del Plato */}
                        <div className="w-12 h-12 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0 relative border border-slate-200/80">
                          {plato.imagen_url ? (
                            <img
                              src={plato.imagen_url}
                              alt={plato.nombre}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                              <UtensilsCrossed className="w-4 h-4 opacity-50" />
                            </div>
                          )}
                        </div>

                        {/* Detalles */}
                        <div className="overflow-hidden flex-1">
                          <h4 className="text-xs font-bold text-slate-800 truncate" title={plato.nombre}>
                            {plato.nombre}
                          </h4>
                          {plato.descripcion && (
                            <p
                              className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug"
                              title={plato.descripcion}
                            >
                              {plato.descripcion}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reservas (solo empleados, solo días publicados con platos) */}
                {!isAdmin && isPublished && platosDelDia.length > 0 && (
                  <div className="space-y-2">
                    {(activasPorFecha[day.dateStr] || []).map((r) => (
                      <p
                        key={r.id}
                        className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1"
                      >
                        ✓ Reservado: {r.esParaFamiliar ? r.nombreBeneficiario : 'Tú'}
                      </p>
                    ))}
                    <button
                      type="button"
                      disabled={day.dateStr < todayStr}
                      onClick={() =>
                        setDiaAReservar({
                          fecha: day.dateStr,
                          etiqueta: `${day.dayName} ${day.displayDate}`,
                          menu: {
                            estado_publicacion: isPublished,
                            platos: platosDelDia.map((p) => ({
                              id_plato: p.id_plato,
                              nombre: p.nombre,
                              categoria: p.categoria,
                            })),
                          },
                        })
                      }
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Reservar
                    </button>
                    <p className="text-[10px] text-slate-400 text-center">
                      Reservas hasta las 09:00 del mismo día
                    </p>
                  </div>
                )}

                {/* Footer de la tarjeta con acción rápida */}
                {isAdmin && (
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => onOpenCreateWeekModal?.(selectedMonday, day.index)}
                      className="w-full py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 font-semibold text-[11px] rounded-lg transition cursor-pointer"
                    >
                      {platosDelDia.length > 0 ? 'Editar este día' : '+ Asignar platos'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {!isAdmin && diaAReservar && (
        <ReservarModal
          isOpen
          onClose={() => setDiaAReservar(null)}
          fecha={diaAReservar.fecha}
          etiquetaDia={diaAReservar.etiqueta}
          menu={diaAReservar.menu}
          familiares={familiares}
          reservasActivasDia={activasPorFecha[diaAReservar.fecha] || []}
          evaluacion={evaluarReserva(diaAReservar.fecha)}
          onConfirmar={reservar}
        />
      )}
    </div>
  );
}

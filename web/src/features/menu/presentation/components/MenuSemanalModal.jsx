import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Modal from '../../../../components/Modal';
import { saveMenuSemanalUseCase } from '../../di';
import { 
  CalendarDays, 
  Calendar, 
  Check, 
  AlertCircle, 
  Search, 
  Trash2, 
  RotateCcw, 
  Save, 
  Clock, 
  ChefHat,
  Sparkles
} from 'lucide-react';

import { 
  getMondayOfWeek, 
  generateWeekDays, 
  formatLocalDate, 
  parseLocalDate 
} from '../../../../lib/dateUtils';

const DRAFT_STORAGE_KEY = 'restaurante_menu_semanal_draft';

/**
 * Componente Visual: MenuSemanalModal
 * 
 * Capa de Presentación:
 * - Gestiona la configuración semanal completa de almuerzos (Lunes a Viernes).
 * - Cero acoplamiento a Supabase (usa Caso de Uso SaveMenuSemanalUseCase o callback).
 */
export default function MenuSemanalModal({
  isOpen,
  onClose,
  platos = [],
  menus = [],
  initialMonday,
  initialDayIndex = 0,
  onMenuCreated,
  onSaveMenuSemanal,
  showToast,
}) {
  const [startMonday, setStartMonday] = useState(() => initialMonday || getMondayOfWeek());
  const weekDays = useMemo(() => generateWeekDays(startMonday), [startMonday]);
  const [activeDayIndex, setActiveDayIndex] = useState(initialDayIndex || 0);
  const [selectedPlatosByDate, setSelectedPlatosByDate] = useState({});
  const [publicarSemana, setPublicarSemana] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [searchPlato, setSearchPlato] = useState('');

  const [draftSavedAt, setDraftSavedAt] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [originalWeekData, setOriginalWeekData] = useState({ platosByDate: {}, isPublished: true });

  const getExistingWeekData = useCallback((mondayStr) => {
    const days = generateWeekDays(mondayStr);
    const data = {};
    let anyPublished = false;
    let hasAnyMenu = false;

    days.forEach((d) => {
      const m = menus.find((item) => item.fecha && item.fecha.split('T')[0] === d.dateStr);
      if (m) {
        hasAnyMenu = true;
        const isPub = typeof m.isPublicado === 'function' ? m.isPublicado() : (m.estado_publicacion === true || m.estado_publicacion === 'Publicado');
        if (isPub) {
          anyPublished = true;
        }
        data[d.dateStr] = Array.from(new Set((m.platos || []).map((p) => p.id_plato || p.id)));
      } else {
        data[d.dateStr] = [];
      }
    });

    return {
      platosByDate: data,
      isPublished: hasAnyMenu ? anyPublished : true,
      hasAnyMenu,
    };
  }, [menus]);

  useEffect(() => {
    if (!isOpen) {
      setIsInitialized(false);
      return;
    }

    const targetMonday = initialMonday || getMondayOfWeek();
    setStartMonday(targetMonday);
    setActiveDayIndex(initialDayIndex || 0);
    setSearchPlato('');
    setFormError(null);

    const existing = getExistingWeekData(targetMonday);
    setOriginalWeekData(existing);

    let loadedFromDraft = false;
    try {
      const rawDraft = localStorage.getItem(`${DRAFT_STORAGE_KEY}_${targetMonday}`);
      if (rawDraft) {
        const draft = JSON.parse(rawDraft);
        if (draft.selectedPlatosByDate && Object.keys(draft.selectedPlatosByDate).length > 0) {
          setSelectedPlatosByDate(draft.selectedPlatosByDate);
          if (typeof draft.publicarSemana === 'boolean') setPublicarSemana(draft.publicarSemana);
          if (draft.savedAt) setDraftSavedAt(new Date(draft.savedAt).toLocaleTimeString());
          loadedFromDraft = true;
        }
      }
    } catch (err) {
      console.warn('Error leyendo borrador local:', err);
    }

    if (!loadedFromDraft) {
      setSelectedPlatosByDate(existing.platosByDate);
      setPublicarSemana(existing.isPublished);
      setDraftSavedAt(null);
    }

    setIsInitialized(true);
  }, [isOpen, initialMonday, initialDayIndex, getExistingWeekData]);

  const saveDraftLocally = useCallback(() => {
    if (!isOpen || !startMonday || !isInitialized) return;
    try {
      const now = new Date();
      const draftData = {
        startMonday,
        selectedPlatosByDate,
        publicarSemana,
        savedAt: now.toISOString(),
      };
      localStorage.setItem(`${DRAFT_STORAGE_KEY}_${startMonday}`, JSON.stringify(draftData));
      setDraftSavedAt(now.toLocaleTimeString());
    } catch (err) {
      console.warn('No se pudo guardar borrador local:', err);
    }
  }, [startMonday, selectedPlatosByDate, publicarSemana, isOpen, isInitialized]);

  useEffect(() => {
    if (isOpen && isInitialized && Object.keys(selectedPlatosByDate).length > 0) {
      saveDraftLocally();
    }
  }, [selectedPlatosByDate, startMonday, publicarSemana, isOpen, isInitialized, saveDraftLocally]);

  const handleClearDraft = () => {
    if (window.confirm('¿Deseas descartar los cambios temporales y restaurar los platos guardados en el sistema?')) {
      try {
        localStorage.removeItem(`${DRAFT_STORAGE_KEY}_${startMonday}`);
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (err) {}
      setDraftSavedAt(null);
      const existing = getExistingWeekData(startMonday);
      setOriginalWeekData(existing);
      setSelectedPlatosByDate(existing.platosByDate);
      setPublicarSemana(existing.isPublished);
      showToast?.('Borrador descartado. Se restauraron los datos del menú guardado.');
    }
  };

  const activeDay = weekDays[activeDayIndex] || weekDays[0];
  const activeDayPlatos = selectedPlatosByDate[activeDay.dateStr] || [];

  const togglePlatoForActiveDay = (platoId) => {
    setSelectedPlatosByDate((prev) => {
      const currentList = prev[activeDay.dateStr] || [];
      const pidStr = String(platoId);
      const isSelected = currentList.some((id) => String(id) === pidStr);

      // Ahora solo se permite seleccionar UN plato por día al crear un menú
      const nextList = isSelected ? [] : [Number(platoId)];

      return {
        ...prev,
        [activeDay.dateStr]: nextList,
      };
    });
  };

  const handleClearActiveDay = () => {
    setSelectedPlatosByDate((prev) => ({
      ...prev,
      [activeDay.dateStr]: [],
    }));
  };

  const filteredPlatos = useMemo(() => {
    if (!searchPlato.trim()) return platos;
    const term = searchPlato.toLowerCase();
    return platos.filter(
      (p) =>
        p.nombre?.toLowerCase().includes(term) ||
        p.descripcion?.toLowerCase().includes(term)
    );
  }, [platos, searchPlato]);

  const handleSaveWeek = async (e) => {
    e.preventDefault();
    setFormError(null);

    const totalSelected = Object.values(selectedPlatosByDate).reduce(
      (acc, arr) => acc + (arr ? arr.length : 0),
      0
    );

    if (totalSelected === 0) {
      setFormError('Debes asignar al menos un plato a los días de la semana.');
      return;
    }

    const diasModificados = weekDays.filter((d) => {
      const prevPlatos = (originalWeekData?.platosByDate?.[d.dateStr] || [])
        .map(Number)
        .sort((a, b) => a - b);
      const currentPlatos = Array.from(new Set((selectedPlatosByDate[d.dateStr] || []).map(Number)))
        .sort((a, b) => a - b);

      const platosChanged =
        prevPlatos.length !== currentPlatos.length ||
        prevPlatos.some((id, idx) => id !== currentPlatos[idx]);

      if (platosChanged) return true;

      const estadoChanged =
        typeof originalWeekData?.isPublished === 'boolean' &&
        publicarSemana !== originalWeekData.isPublished;
      const hasContent = currentPlatos.length > 0 || prevPlatos.length > 0;
      if (estadoChanged && hasContent) return true;

      return false;
    });

    if (diasModificados.length === 0) {
      showToast?.('No se detectaron modificaciones en el menú de la semana.');
      onClose();
      return;
    }

    const diasPayload = diasModificados.map((d) => ({
      fecha: d.dateStr,
      estado_publicacion: publicarSemana,
      platos_ids: Array.from(new Set((selectedPlatosByDate[d.dateStr] || []).map(Number))),
    }));

    try {
      setSubmitting(true);
      if (onSaveMenuSemanal) {
        await onSaveMenuSemanal(diasPayload);
      } else {
        await saveMenuSemanalUseCase.execute(diasPayload);
      }

      try {
        localStorage.removeItem(`${DRAFT_STORAGE_KEY}_${startMonday}`);
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (err) {}
      setDraftSavedAt(null);

      const nombresDias = diasModificados.map((d) => d.dayName).join(', ');
      showToast?.(`Menú actualizado exitosamente para: ${nombresDias}.`);

      onClose();
      await onMenuCreated?.();
    } catch (err) {
      console.error('[MenuSemanalModal] Error al guardar menú:', err);
      setFormError(err.message || 'Error al guardar el menú semanal.');
    } finally {
      setSubmitting(false);
    }
  };

  const hasExistingData = originalWeekData?.hasAnyMenu;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configuración de Menú Semanal"
      subtitle="Programa y publica los platos para cada día de la semana laboral"
      icon={CalendarDays}
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSaveWeek} className="space-y-5">
        {formError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start space-x-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
            <div className="leading-snug">
              <span className="font-semibold block">Error al procesar:</span>
              <span>{formError}</span>
            </div>
          </div>
        )}

        {/* Encabezado con selector de semana y estado de sincronización */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-700 uppercase">
              Semana: {weekDays[0]?.displayDate} – {weekDays[weekDays.length - 1]?.displayDate}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {draftSavedAt ? (
              <span className="inline-flex items-center text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <Save className="w-3 h-3 mr-1" />
                Cambios en borrador ({draftSavedAt})
              </span>
            ) : hasExistingData ? (
              <span className="inline-flex items-center text-[11px] font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                <Check className="w-3 h-3 mr-1" />
                Sincronizado con sistema
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">Sin programación previa</span>
            )}
            <button
              type="button"
              onClick={handleClearDraft}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
              title="Restaurar a datos originales del sistema"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Pestañas de Días de la Semana */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Selecciona el día para ver y asignar sus platos:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {weekDays.map((d, idx) => {
              const count = (selectedPlatosByDate[d.dateStr] || []).length;
              const isActive = activeDayIndex === idx;

              return (
                <button
                  key={d.dateStr}
                  type="button"
                  onClick={() => setActiveDayIndex(idx)}
                  className={`p-3 rounded-xl border text-left transition relative flex flex-col justify-between cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div>
                    <span className={`text-[10px] uppercase font-bold block ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                      {d.dayName}
                    </span>
                    <span className="text-xs font-bold block">{d.displayDate}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                        count > 0
                          ? isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-emerald-100 text-emerald-800'
                          : isActive
                          ? 'bg-white/10 text-blue-200'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {count > 0 ? '1 plato' : 'Sin plato'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Área de Selección de Plato para el Día Activo */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-2">
            <div className="flex items-center space-x-2">
              <ChefHat className="w-4 h-4 text-blue-600" />
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  Plato del Día para el {activeDay.dayName} ({activeDay.displayDate})
                </h4>
                <p className="text-[11px] text-slate-500">
                  Selecciona el plato único de almuerzo (el menú es informativo para los comensales).
                </p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                activeDayPlatos.length > 0
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {activeDayPlatos.length > 0 ? '1 seleccionado' : 'Sin asignar'}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {activeDayPlatos.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearActiveDay}
                  className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                >
                  Quitar plato
                </button>
              )}
              {/* Buscador de platos */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchPlato}
                  onChange={(e) => setSearchPlato(e.target.value)}
                  placeholder="Buscar plato en catálogo..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Listado con Selector Radio de Platos */}
          {filteredPlatos.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-xs">
              No hay platos en el catálogo que coincidan con la búsqueda.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto p-1">
              {filteredPlatos.map((plato) => {
                const isSelected = activeDayPlatos.some((id) => String(id) === String(plato.id_plato || plato.id));

                return (
                  <div
                    key={plato.id_plato || plato.id}
                    onClick={() => togglePlatoForActiveDay(plato.id_plato || plato.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition select-none flex items-start space-x-2.5 ${
                      isSelected
                        ? 'bg-blue-50/90 border-blue-500 text-blue-950 shadow-xs ring-2 ring-blue-300'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="mt-0.5">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition ${
                        isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold truncate">{plato.nombre}</p>
                        {isSelected && (
                          <span className="text-[10px] font-extrabold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded-full">
                            Asignado
                          </span>
                        )}
                      </div>
                      {plato.descripcion && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {plato.descripcion}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Interruptor de publicación global para la semana */}
        <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-800">
                Publicar menú para toda la semana
              </p>
              <p className="text-[11px] text-slate-500">
                Al activar, todos los días quedarán como "Publicado" para que los empleados los visualicen y reserven.
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={publicarSemana}
              onChange={(e) => setPublicarSemana(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Botones de acción */}
        <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{hasExistingData ? "Actualizar Menú de la Semana" : "Guardar Menú de la Semana"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

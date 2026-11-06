import React, { useState } from 'react';
import { useAuth } from '../../../auth';
import { useMenu } from '../hooks/useMenu';
import { getMondayOfWeek } from '../../../../lib/dateUtils';
import { 
  UtensilsCrossed, 
  CalendarDays, 
  ChefHat, 
  CheckCircle2, 
  RefreshCw 
} from 'lucide-react';

import MenuSemanalView from '../components/MenuSemanalView';
import MenuSemanalModal from '../components/MenuSemanalModal';
import PlatosCatalogo from '../components/PlatosCatalogo';

/**
 * Página Principal: MenuPage
 * 
 * Capa de Presentación:
 * - Orquesta la vista del Menú Semanal y el Catálogo de Platos.
 * - Consume useMenu (Casos de Uso del Dominio).
 */
export default function MenuPage() {
  const { isAdmin } = useAuth();
  const {
    platos,
    menus,
    loading,
    error,
    loadData,
    saveMenuSemanal,
    createPlato,
    updatePlato,
    deletePlato,
  } = useMenu();

  const [activeTab, setActiveTabState] = useState(() => {
    return localStorage.getItem('crearmenu_active_subtab') || 'menu';
  });

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    localStorage.setItem('crearmenu_active_subtab', tab);
  };

  const [toastMessage, setToastMessage] = useState(null);
  const [isWeekModalOpen, setIsWeekModalOpen] = useState(false);
  const [selectedWeekMonday, setSelectedWeekMonday] = useState(() => getMondayOfWeek());
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenCreateWeekModal = (mondayStr, dayIndex = 0) => {
    setSelectedWeekMonday(mondayStr);
    setSelectedDayIndex(dayIndex);
    setIsWeekModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center space-x-3 border border-slate-700 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isAdmin ? 'Gestión de Menús y Catálogo de Platos' : 'Menú Semanal de Almuerzos'}
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {isAdmin
                ? 'Crea menús completos para toda la semana y administra el catálogo de platos disponibles.'
                : 'Consulta la programación semanal de almuerzos para planificar tus reservas institucionales.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            title="Sincronizar datos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => handleOpenCreateWeekModal(getMondayOfWeek())}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-md transition transform active:scale-95 text-sm cursor-pointer"
            >
              <CalendarDays className="w-4 h-4" />
              <span>Configurar Menú Semanal</span>
            </button>
          )}
        </div>
      </div>

      {/* Barra de Subpestañas para Administradores */}
      {isAdmin && (
        <div className="flex items-center space-x-2 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('menu')}
            className={`flex items-center space-x-2 px-5 py-3 border-b-2 font-bold text-sm transition cursor-pointer ${
              activeTab === 'menu'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Programación Semanal</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('platos')}
            className={`flex items-center space-x-2 px-5 py-3 border-b-2 font-bold text-sm transition cursor-pointer ${
              activeTab === 'platos'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>Catálogo de Platos ({platos.length})</span>
          </button>
        </div>
      )}

      {/* Mensaje de Error si ocurre */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Contenido según la pestaña seleccionada */}
      {activeTab === 'menu' || !isAdmin ? (
        <MenuSemanalView
          menus={menus}
          isAdmin={isAdmin}
          onOpenCreateWeekModal={handleOpenCreateWeekModal}
          onRefresh={loadData}
          loading={loading}
        />
      ) : (
        <PlatosCatalogo
          platos={platos}
          onRefresh={loadData}
          showToast={showToast}
          onCreatePlato={createPlato}
          onUpdatePlato={updatePlato}
          onDeletePlato={deletePlato}
        />
      )}

      {/* Modal de Configuración Semanal */}
      {isAdmin && (
        <MenuSemanalModal
          isOpen={isWeekModalOpen}
          onClose={() => setIsWeekModalOpen(false)}
          platos={platos}
          menus={menus}
          initialMonday={selectedWeekMonday}
          initialDayIndex={selectedDayIndex}
          onMenuCreated={loadData}
          onSaveMenuSemanal={saveMenuSemanal}
          showToast={showToast}
        />
      )}
    </div>
  );
}

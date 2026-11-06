import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../auth';
import { useCuenta } from '../hooks/useCuenta';
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Phone, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Shield, 
  Save,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';

/**
 * Página Principal: MiCuentaPage
 * 
 * Capa de Presentación:
 * - Desacoplada de Supabase.
 * - Consume useAuth y useCuenta (Casos de Uso del Dominio).
 */
export default function MiCuentaPage() {
  const { user, profile, role, refreshProfile, setProfile } = useAuth();
  const { savePerfil, changePassword } = useCuenta();

  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [telefono, setTelefono] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [notificaciones, setNotificaciones] = useState('on');

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (profile || user) {
      const data = profile || user;
      setNombres(data.nombres || data.nombre || '');
      setApellidos(data.apellidos || '');
      setTelefono(data.telefono || '');
    }
  }, [profile, user]);

  const showToast = (msg) => {
    setSuccessMessage(msg);
    setErrorMessage(null);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!nombres.trim()) {
      setErrorMessage('El nombre no puede estar vacío.');
      return;
    }

    try {
      setSavingProfile(true);
      const userId = user?.id || user?.id_usuario;
      if (userId) {
        await savePerfil(userId, {
          nombres: nombres.trim(),
          apellidos: apellidos.trim(),
          telefono: telefono.trim(),
        });
        setProfile?.((prev) => ({
          ...prev,
          nombre: nombres.trim(),
          nombres: nombres.trim(),
          apellidos: apellidos.trim(),
          telefono: telefono.trim(),
        }));
        await refreshProfile?.();
        showToast('Datos personales actualizados correctamente.');
      }
    } catch (err) {
      console.error('[MiCuentaPage] Error al actualizar perfil:', err);
      setErrorMessage(err.message || 'Error al actualizar el perfil.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      setSavingPassword(true);
      await changePassword(newPassword, confirmPassword);
      setNewPassword('');
      setConfirmPassword('');
      showToast('Contraseña actualizada con éxito.');
    } catch (err) {
      console.error('[MiCuentaPage] Error al cambiar contraseña:', err);
      setErrorMessage(err.message || 'Error al actualizar la contraseña.');
    } finally {
      setSavingPassword(false);
    }
  };

  const displayName = nombres || user?.email || 'Usuario';
  const displayCi = profile?.ci_codigo || user?.ci_codigo || 'N/A';
  const displayEmail = user?.email || profile?.email || 'N/A';
  const displayRole = role || profile?.rol || 'Empleado';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Toast Notificación */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center space-x-2 text-sm font-semibold animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 mb-1">
            <User className="w-6 h-6" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Mi Cuenta</h1>
          </div>
          <p className="text-slate-500 text-sm">
            Administra tus datos personales, preferencias y credenciales de acceso institucional.
          </p>
        </div>

        <div className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 self-start sm:self-auto">
          <Shield className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
          <span>Rol: {displayRole}</span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Formulario 1: Datos Personales */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-slate-100">
              <User className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-800">Información Personal</h2>
            </div>

            <form onSubmit={handleProfileSubmit} id="profile-form" className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nombres *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={nombres}
                    onChange={(e) => setNombres(e.target.value)}
                    required
                    placeholder="Ej. Juan Carlos"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Apellidos
                </label>
                <input
                  type="text"
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  placeholder="Ej. Pérez Gómez"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Cédula / C.I. (Solo Lectura)
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={displayCi}
                    disabled
                    className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm font-mono text-slate-500 cursor-not-allowed select-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Teléfono de Contacto
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Ej. 70012345"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={displayEmail}
                    disabled
                    className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm font-mono text-slate-500 cursor-not-allowed select-none"
                  />
                </div>
              </div>
            </form>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-6">
            <button
              type="submit"
              form="profile-form"
              disabled={savingProfile}
              className="w-full flex items-center justify-center space-x-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              {savingProfile ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Datos Personales</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Formulario 2: Seguridad y Notificaciones */}
        <div className="space-y-6">
          {/* Tarjeta Contraseña */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
            <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-slate-100">
              <KeyRound className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-800">Cambiar Contraseña</h2>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nueva Contraseña *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confirmar Contraseña *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repita la nueva contraseña"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingPassword}
                className="w-full flex items-center justify-center space-x-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                {savingPassword ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Actualizar Contraseña</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Tarjeta Preferencias */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
            <div className="flex items-center space-x-2 mb-3 pb-3 border-b border-slate-100">
              <Bell className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold text-slate-800">Notificaciones & Preferencias</h2>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">Recordatorios de Almuerzo</p>
                <p className="text-[11px] text-slate-400">
                  Notificar en el sistema cuando el menú de la semana sea publicado.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notificaciones === 'on'}
                onChange={(e) => setNotificaciones(e.target.checked ? 'on' : 'off')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

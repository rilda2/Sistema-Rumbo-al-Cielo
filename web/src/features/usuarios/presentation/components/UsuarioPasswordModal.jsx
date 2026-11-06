import React, { useState } from 'react';
import { 
  X, 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ShieldCheck
} from 'lucide-react';
import UsuarioRoleBadge from './UsuarioRoleBadge';

/**
 * Modal: UsuarioPasswordModal
 * Permite al Administrador cambiar/restablecer la contraseña de un usuario directamente.
 */
export default function UsuarioPasswordModal({
  user,
  hasPendingRequest = false,
  isOpen,
  onClose,
  onSavePassword,
}) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Por favor ingresa la nueva contraseña.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    try {
      await onSavePassword(user.id_usuario, password);
      setPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err) {
      setError(err.message || 'Error al actualizar la contraseña.');
    } finally {
      setIsLoading(false);
    }
  };

  const displayName = user.nombreCompleto || user.nombre_completo || `${user.nombres || ''} ${user.apellidos || ''}`.trim() || 'Usuario';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-md border border-white/20">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Cambiar Contraseña</h3>
              <p className="text-xs text-blue-100 font-medium">Panel Administrativo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info del usuario */}
        <div className="p-5 bg-slate-50/70 border-b border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Usuario</span>
              <span className="text-sm font-bold text-slate-900">{displayName}</span>
            </div>
            <UsuarioRoleBadge rol={user.rol} />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
            <span><strong>C.I.:</strong> {user.ci_codigo || '—'}</span>
            <span className="font-mono text-slate-500">{user.email}</span>
          </div>

          {hasPendingRequest && (
            <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center space-x-2 text-amber-800 text-xs font-medium">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Este usuario solicitó restablecimiento desde la aplicación móvil.</span>
            </div>
          )}
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nueva Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoFocus
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-9 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                placeholder="Repite la nueva contraseña"
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-blue-500/20 transition flex items-center space-x-1.5 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Guardar Contraseña</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

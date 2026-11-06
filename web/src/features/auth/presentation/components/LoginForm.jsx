import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  LogIn, 
  AlertCircle 
} from 'lucide-react';

/**
 * Componente Visual Reutilizable: LoginForm
 * 
 * Capa de Presentación:
 * - Solo maneja interacción con el usuario, formularios y eventos visuales.
 * - Invoca la función onLogin proporcionada sin saber qué pasa detrás ni qué API se llama.
 */
export function LoginForm({ onLogin, isLoading = false, externalError = null }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!email.trim() || !password) {
      setValidationError('Por favor completa todos los campos.');
      return;
    }

    try {
      await onLogin(email.trim(), password);
    } catch (err) {
      // El error de dominio/infra es procesado y capturado por el contenedor o hook
    }
  };

  const activeError = validationError || externalError;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {activeError && (
        <div className="p-3.5 bg-rose-500/25 border border-rose-400/40 backdrop-blur-md rounded-xl flex items-start space-x-2.5 text-rose-100 text-sm animate-fade-in shadow-inner">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-300" />
          <div className="leading-snug">
            <span className="font-semibold block text-rose-200">Error:</span>
            <span>{activeError}</span>
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-stone-200 uppercase tracking-wider mb-1.5">
          Correo Electrónico
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-300">
            <Mail className="w-5 h-5" />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
            placeholder="usuario@rumboalcielo.com"
            className="w-full pl-11 pr-4 py-3 bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 focus:border-blue-400 rounded-xl text-white placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 backdrop-blur-md transition shadow-inner disabled:opacity-60"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-200 uppercase tracking-wider mb-1.5">
          Contraseña
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-300">
            <Lock className="w-5 h-5" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
            placeholder="••••••••"
            className="w-full pl-11 pr-11 py-3 bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 focus:border-blue-400 rounded-xl text-white placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 backdrop-blur-md transition shadow-inner disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-300 hover:text-white transition"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-black/30 border border-white/20 flex items-center justify-center space-x-2 transition transform active:scale-[0.98] disabled:opacity-60 cursor-pointer"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <LogIn className="w-5 h-5" />
            <span>Ingresar al Sistema</span>
          </>
        )}
      </button>
    </form>
  );
}

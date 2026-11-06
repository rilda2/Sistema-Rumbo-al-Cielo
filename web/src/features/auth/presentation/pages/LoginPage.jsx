import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoginForm } from '../components/LoginForm';
import { UtensilsCrossed } from 'lucide-react';

/**
 * Página Principal: LoginPage
 * 
 * Capa de Presentación:
 * - Orquesta la vista completa de autenticación.
 * - Conecta el hook useAuth (que consume los casos de uso) con los componentes visuales.
 */
export default function LoginPage() {
  const { login, error: authContextError } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (email, password) => {
    setLoginError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setLoginError(err.message || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="relative min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat selection:bg-blue-400 selection:text-white"
      style={{
        backgroundImage: "url('/bg-restaurante.jpg')"
      }}
    >
      {/* Overlay sutil con viñeta para destacar el efecto cristal */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" />

      {/* Tarjeta de Login con Efecto Cristal Transparente (Glassmorphism) */}
      <div className="relative z-10 w-full max-w-md bg-stone-900/40 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.65)] overflow-hidden border border-white/20">
        <div className="bg-gradient-to-r from-blue-700/60 via-blue-600/60 to-indigo-700/60 backdrop-blur-md text-white p-6 sm:p-8 text-center relative border-b border-white/10">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner border border-white/25 transform transition hover:scale-105">
            <UtensilsCrossed className="w-8 h-8 text-white drop-shadow" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow">Rumbo al Cielo</h2>
          <p className="text-stone-200 text-sm mt-1 font-medium">Sistema de Gestión & Administración</p>

          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white/20 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-0.5 rounded-full shadow-sm border border-white/30">
            Acceso al Sistema
          </div>
        </div>

        <div className="p-6 sm:p-8 pt-7 bg-black/20 backdrop-blur-md">
          <LoginForm 
            onLogin={handleLogin} 
            isLoading={loading} 
            externalError={loginError || authContextError} 
          />

          <div className="mt-6 text-center text-xs text-stone-300/80">
            ¿Problemas para acceder? Contacte a soporte o administración institucional.
          </div>
        </div>
      </div>
    </div>
  );
}

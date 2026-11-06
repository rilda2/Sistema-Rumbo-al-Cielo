import React, { useState } from 'react';
import Modal from '../../../../components/Modal';
import {
  UserPlus,
  User,
  CreditCard,
  Phone,
  Mail,
  Lock,
  AlertCircle,
  Check
} from 'lucide-react';

/**
 * Componente Visual: UsuarioCreateModal
 * 
 * Capa de Presentación:
 * - NO importa supabase ni dependencias de datos.
 * - Invoca la función onCreateUser delegando la acción al Caso de Uso.
 */
export default function UsuarioCreateModal({
  isOpen,
  onClose,
  onCreateUser,
  showToast,
}) {
  const initialFormState = {
    nombre: '',
    apellidos: '',
    ci_codigo: '',
    telefono: '',
    email: '',
    password: '',
    rol: 'Empleado',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Validaciones de UI preliminares
    if (!formData.nombre.trim()) {
      setFormError('El nombre es obligatorio.');
      return;
    }
    if (!formData.apellidos.trim()) {
      setFormError('Los apellidos son obligatorios.');
      return;
    }
    if (!formData.ci_codigo.trim()) {
      setFormError('El número de CI es obligatorio.');
      return;
    }
    if (!formData.telefono.trim()) {
      setFormError('El teléfono es obligatorio.');
      return;
    }
    if (!formData.email.trim()) {
      setFormError('El correo electrónico es obligatorio.');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setFormError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      setFormSubmitting(true);
      await onCreateUser({
        ...formData,
        nombre: formData.nombre.trim(),
        nombres: formData.nombre.trim(),
        apellidos: formData.apellidos.trim(),
        ci_codigo: formData.ci_codigo.trim(),
        telefono: formData.telefono.trim(),
      });

      showToast?.(`Usuario ${formData.nombre} ${formData.apellidos} registrado exitosamente.`);
      setFormData(initialFormState);
      onClose();
    } catch (err) {
      console.error('[UsuarioCreateModal] Error al crear usuario:', err);
      setFormError(err.message || 'Error al crear el usuario.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setFormError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Registrar Nuevo Usuario"
      subtitle="Complete los datos para dar de alta a un usuario en el restaurante"
      icon={UserPlus}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2.5 text-rose-700 text-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
            <div className="leading-snug">
              <span className="font-semibold block">Error de registro:</span>
              <span>{formError}</span>
            </div>
          </div>
        )}

        {/* Nombres y Apellidos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nombres *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
                placeholder="Ej. Juan Carlos"
                className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Apellidos *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleInputChange}
                required
                placeholder="Ej. Pérez Gómez"
                className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* CI y Teléfono */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Cédula / C.I. *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <CreditCard className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="ci_codigo"
                value={formData.ci_codigo}
                onChange={handleInputChange}
                required
                placeholder="Ej. 1234567"
                className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Teléfono *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                required
                placeholder="Ej. 70012345"
                className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* Correo y Contraseña */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Correo Electrónico *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="ejemplo@rumboalcielo.com"
                className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Contraseña Inicial *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* Rol Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Rol en el Sistema *
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'Empleado', label: 'Empleado' },
              { id: 'Administrador', label: 'Administrador' },
              /*  { id: 'Institucion', label: 'Institución' },*/
            ].map((r) => (
              <label
                key={r.id}
                className={`flex items-center justify-center p-3 rounded-xl border text-sm font-semibold cursor-pointer transition ${formData.rol === r.id
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
              >
                <input
                  type="radio"
                  name="rol"
                  value={r.id}
                  checked={formData.rol === r.id}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <span>{r.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="mt-6 flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleModalClose}
            disabled={formSubmitting}
            className="px-4 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={formSubmitting}
            className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 transition disabled:opacity-50 cursor-pointer"
          >
            {formSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Registrar Integrante</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

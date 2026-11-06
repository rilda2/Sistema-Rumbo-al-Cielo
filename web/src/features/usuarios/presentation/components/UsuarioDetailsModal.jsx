import React, { useState, useEffect } from 'react';
import Modal from '../../../../components/Modal';
import { 
  User, 
  Clock, 
  Users, 
  Edit3, 
  Save, 
  X, 
  Phone, 
  CreditCard, 
  Mail, 
  AlertCircle,
  Shield
} from 'lucide-react';
import UsuarioRoleBadge from './UsuarioRoleBadge';

/**
 * Componente Visual: UsuarioDetailsModal
 * 
 * Capa de Presentación:
 * - Permite visualizar los detalles del usuario.
 * - Permite al Administrador activar el modo de edición para actualizar datos personales
 *   (nombres, apellidos, teléfono, CI y rol).
 * - Delega la actualización a través de onUpdateUser (conectado al Caso de Uso de Dominio).
 */
export default function UsuarioDetailsModal({ 
  isOpen, 
  user, 
  onClose, 
  onOpenFamiliares,
  onUpdateUser,
  showToast 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    ci_codigo: '',
    telefono: '',
    rol: 'Empleado',
  });

  // Sincronizar estado cuando cambia el usuario seleccionado o se abre el modal
  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombres || user.nombre || '',
        apellidos: user.apellidos || '',
        ci_codigo: user.ci_codigo || '',
        telefono: user.telefono || '',
        rol: user.rol || 'Empleado',
      });
      setIsEditing(false);
      setFormError(null);
    }
  }, [user, isOpen]);

  if (!user) return null;

  const isUserActive = user.isActivo ? user.isActivo() : user.activo !== false;
  const firstName = user.nombres || user.nombre || '';
  const lastName = user.apellidos || '';
  const fullName = user.nombreCompleto || `${firstName} ${lastName}`.trim() || 'Sin Nombre';
  const initials = `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`.toUpperCase() || (user.email?.charAt(0) || 'U').toUpperCase();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStartEditing = () => {
    setFormData({
      nombre: user.nombres || user.nombre || '',
      apellidos: user.apellidos || '',
      ci_codigo: user.ci_codigo || '',
      telefono: user.telefono || '',
      rol: user.rol || 'Empleado',
    });
    setFormError(null);
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.nombre.trim()) {
      setFormError('El nombre es obligatorio.');
      return;
    }
    if (!formData.apellidos.trim()) {
      setFormError('Los apellidos son obligatorios.');
      return;
    }
    if (!formData.ci_codigo.trim()) {
      setFormError('El número de C.I. es obligatorio.');
      return;
    }

    try {
      setSaving(true);
      await onUpdateUser?.(user.id_usuario, {
        nombre: formData.nombre.trim(),
        nombres: formData.nombre.trim(),
        apellidos: formData.apellidos.trim(),
        ci_codigo: formData.ci_codigo.trim(),
        telefono: formData.telefono.trim(),
        rol: formData.rol,
      });

      showToast?.('Datos personales actualizados correctamente.');
      setIsEditing(false);
    } catch (err) {
      console.error('[UsuarioDetailsModal] Error updating user:', err);
      setFormError(err.message || 'Error al actualizar los datos del usuario.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setIsEditing(false);
        setFormError(null);
        onClose();
      }}
      title={isEditing ? 'Editar Datos del Usuario' : 'Detalles del Usuario'}
      subtitle={
        isEditing 
          ? 'Actualice la información personal y asignación de rol' 
          : 'Información institucional y datos de contacto'
      }
      icon={User}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Banner de Error */}
        {formError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2.5 text-rose-800 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-medium">{formError}</span>
          </div>
        )}

        {/* User Card Header */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center relative">
          {!isEditing && (
            <button
              type="button"
              onClick={handleStartEditing}
              className="absolute top-3 right-3 p-1.5 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 rounded-lg text-xs font-semibold transition flex items-center space-x-1 shadow-2xs cursor-pointer"
              title="Editar datos personales"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
          )}

          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 font-bold text-xl flex items-center justify-center mb-2 border-2 border-blue-200 shadow-xs">
            {initials}
          </div>
          <h3 className="text-lg font-bold text-slate-900">{fullName}</h3>
          <div className="mt-1.5">
            <UsuarioRoleBadge rol={user.rol} />
          </div>
        </div>

        {/* CONTENIDO: Formulario de Edición o Vista Detalle */}
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-sm">
            {/* Nombres y Apellidos */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombres *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    placeholder="Ej. Juan"
                    disabled={saving}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Apellidos *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleInputChange}
                    placeholder="Ej. Pérez"
                    disabled={saving}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Cédula de Identidad */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cédula / C.I. *
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  name="ci_codigo"
                  value={formData.ci_codigo}
                  onChange={handleInputChange}
                  placeholder="Ej. 1234567"
                  disabled={saving}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition"
                  required
                />
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Teléfono
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  placeholder="Ej. 70012345"
                  disabled={saving}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition"
                />
              </div>
            </div>

            {/* Rol */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rol Institucional *
              </label>
              <div className="relative">
                <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <select
                  name="rol"
                  value={formData.rol}
                  onChange={handleInputChange}
                  disabled={saving}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition"
                >
                  <option value="Empleado">Empleado (Beneficiario)</option>
                  <option value="Administrador">Administrador (Total)</option>
                </select>
              </div>
            </div>

            {/* Correo (Informativo, no editable directamente) */}
            <div className="pt-1">
              <span className="text-[11px] text-slate-400 flex items-center">
                <Mail className="w-3.5 h-3.5 mr-1" />
                El correo ({user.email}) está vinculado a las credenciales de autenticación.
              </span>
            </div>

            {/* Botones de Guardar / Cancelar */}
            <div className="pt-3 flex space-x-2">
              <button
                type="button"
                onClick={handleCancelEditing}
                disabled={saving}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Cancelar</span>
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center space-x-1.5 shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* User Fields List (Modo Lectura) */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Estado de cuenta</span>
                <span>
                  {isUserActive ? (
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-xs">
                      Activo
                    </span>
                  ) : (
                    <span className="text-rose-700 font-bold bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 text-xs">
                      Inactivo / Bloqueado
                    </span>
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Cédula / C.I.</span>
                <span className="font-mono font-semibold text-slate-800">{user.ci_codigo || 'N/A'}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Teléfono</span>
                <span className="font-semibold text-slate-800">{user.telefono || '—'}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Correo electrónico</span>
                <span className="font-mono text-xs font-semibold text-slate-800">{user.email}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Fecha de registro</span>
                <span className="text-xs text-slate-600 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              {user.rol === 'Empleado' && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenFamiliares?.(user);
                  }}
                  className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl text-sm transition flex items-center justify-center space-x-2 border border-indigo-200 cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>Gestionar Familiares (Hijos, Cónyuge)</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-sm transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

import React from 'react';
import { Eye, UserX, UserCheck, Trash2, Users, KeyRound } from 'lucide-react';
import UsuarioRoleBadge from './UsuarioRoleBadge';

/**
 * Componente Visual: UsuarioRow
 */
export default function UsuarioRow({
  user,
  isLoadingAction,
  hasPendingPasswordRequest = false,
  onSelectDetails,
  onToggleStatus,
  onDeleteClick,
  onManageFamiliares,
  onRequestChangePassword,
}) {
  const isUserActive = user.isActivo ? user.isActivo() : user.activo !== false;
  const firstName = user.nombres || user.nombre || '';
  const lastName = user.apellidos || '';
  const fullName = user.nombreCompleto || `${firstName} ${lastName}`.trim() || 'Sin Nombre';
  const initials = `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`.toUpperCase() || (user.email?.charAt(0) || 'U').toUpperCase();

  return (
    <tr className="hover:bg-slate-50/80 transition-colors duration-150 group">
      {/* Name with Avatar */}
      <td className="py-3.5 px-4 sm:px-6 overflow-hidden">
        <div className="flex items-center space-x-3 min-w-0">
          <div
            className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
              user.rol === 'Administrador'
                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                : user.rol === 'Institucion'
                ? 'bg-amber-100 text-amber-700 border border-amber-200'
                : 'bg-blue-100 text-blue-700 border border-blue-200'
            }`}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-1.5">
              <span className="font-semibold text-slate-900 truncate block" title={fullName}>
                {fullName}
              </span>
              {hasPendingPasswordRequest && (
                <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1 animate-pulse" />
                  Pide clave
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* CI / Código */}
      <td className="py-3.5 px-4 whitespace-nowrap overflow-hidden">
        <span className="inline-flex items-center font-mono text-xs bg-slate-100 px-2 py-1 rounded-md text-slate-700 font-medium truncate max-w-full">
          {user.ci_codigo || 'N/A'}
        </span>
      </td>

      {/* Teléfono */}
      <td className="py-3.5 px-4 whitespace-nowrap overflow-hidden">
        <span className="text-slate-600 font-medium truncate block">{user.telefono || '—'}</span>
      </td>

      {/* Correo Electrónico */}
      <td className="py-3.5 px-4 whitespace-nowrap overflow-hidden">
        <span className="text-slate-600 font-mono text-xs truncate block" title={user.email}>{user.email}</span>
      </td>

      {/* Rol */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        <UsuarioRoleBadge rol={user.rol} />
      </td>

      {/* Estado */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        {isUserActive ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" /> Activo
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5" /> Inactivo
          </span>
        )}
      </td>

      {/* Acciones */}
      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
        <div className="inline-grid grid-cols-4 gap-1.5 items-center justify-end">
          {/* Familiares (solo para empleados, invisible si no es empleado para reservar el espacio) */}
          {user.rol === 'Empleado' ? (
            <button
              type="button"
              onClick={() => onManageFamiliares?.(user)}
              className="w-8 h-8 flex items-center justify-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition shrink-0"
              title="Gestionar familiares"
            >
              <Users className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-8 h-8 invisible pointer-events-none" aria-hidden="true" />
          )}

          {/* Ver Detalles */}
          <button
            type="button"
            onClick={() => onSelectDetails(user)}
            className="w-8 h-8 flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition shrink-0"
            title="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Cambiar contraseña */}
          <button
            type="button"
            onClick={() => onRequestChangePassword(user)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition shrink-0 ${
              hasPendingPasswordRequest
                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title={hasPendingPasswordRequest ? 'Usuario solicitó nueva contraseña' : 'Cambiar contraseña'}
          >
            <KeyRound className="w-4 h-4" />
          </button>

          {/* Anular acceso / Activar */}
          <button
            type="button"
            onClick={() => onToggleStatus(user)}
            disabled={isLoadingAction}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition shrink-0 ${
              isUserActive
                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
            }`}
            title={isUserActive ? 'Anular acceso' : 'Reactivar acceso'}
          >
            {isUserActive ? (
              <UserX className="w-4 h-4" />
            ) : (
              <UserCheck className="w-4 h-4" />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
}

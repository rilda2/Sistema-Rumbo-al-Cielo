import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  getUsuariosUseCase, 
  toggleUsuarioEstadoUseCase, 
  deleteUsuarioUseCase,
  registerUsuarioUseCase,
  updateUsuarioUseCase,
  getSolicitudesRecuperacionUseCase,
  cambiarPasswordUsuarioUseCase 
} from '../../di';

/**
 * Hook de Presentación: useUsuarios
 * 
 * Regla de Clean Architecture:
 * - NO importa Supabase.
 * - Solo consume los Casos de Uso del Dominio (GetUsuariosUseCase, ToggleUsuarioEstadoUseCase, etc.).
 */
export function useUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadSolicitudes = useCallback(async () => {
    try {
      setLoadingSolicitudes(true);
      const data = await getSolicitudesRecuperacionUseCase.execute();
      setSolicitudes(data || []);
    } catch (err) {
      console.warn('[useUsuarios] Error al cargar solicitudes de recuperación:', err);
    } finally {
      setLoadingSolicitudes(false);
    }
  }, []);

  const loadUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsuariosUseCase.execute();
      setUsuarios(data);
    } catch (err) {
      console.error('[useUsuarios] Error al cargar usuarios:', err);
      setError(err.message || 'No se pudieron cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsuarios();
    loadSolicitudes();
  }, [loadUsuarios, loadSolicitudes]);

  const toggleStatus = async (user) => {
    const nextState = !user.activo;
    try {
      setActionLoadingId(user.id_usuario);
      await toggleUsuarioEstadoUseCase.execute(user.id_usuario, nextState);
      setUsuarios((prev) =>
        prev.map((u) => {
          if (u.id_usuario === user.id_usuario) {
            u.activo = nextState;
          }
          return u;
        })
      );
      return nextState;
    } finally {
      setActionLoadingId(null);
    }
  };

  const deleteUser = async (id_usuario) => {
    await deleteUsuarioUseCase.execute(id_usuario);
    setUsuarios((prev) => prev.filter((u) => u.id_usuario !== id_usuario));
  };

  const registerUser = async (userData) => {
    const newUser = await registerUsuarioUseCase.execute(userData);
    await loadUsuarios(); // Refrescar lista completa
    return newUser;
  };

  const updateUser = async (id_usuario, userData) => {
    const updatedUser = await updateUsuarioUseCase.execute(id_usuario, userData);
    await loadUsuarios(); // Refrescar lista completa
    return updatedUser;
  };

  const filteredUsuarios = useMemo(() => {
    return usuarios.filter((u) => {
      // Filtro de búsqueda
      const search = searchTerm.toLowerCase().trim();
      const matchSearch =
        !search ||
        u.nombreCompleto.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search) ||
        u.ci_codigo.toLowerCase().includes(search) ||
        u.telefono.toLowerCase().includes(search);

      // Filtro de rol
      const matchRole =
        roleFilter === 'ALL' || u.rol?.toUpperCase() === roleFilter.toUpperCase();

      // Filtro de estado
      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVO' && u.activo) ||
        (statusFilter === 'INACTIVO' && !u.activo);

      return matchSearch && matchRole && matchStatus;
    });
  }, [usuarios, searchTerm, roleFilter, statusFilter]);

  const cambiarPassword = async (id_usuario, nuevo_password) => {
    setActionLoadingId(id_usuario);
    try {
      const res = await cambiarPasswordUsuarioUseCase.execute(id_usuario, nuevo_password);
      await loadSolicitudes(); // Actualizar estado de solicitudes atendidas
      return res;
    } finally {
      setActionLoadingId(null);
    }
  };

  // Mapa de solicitudes pendientes indexado por email y por id_usuario
  const pendingRequestsMap = useMemo(() => {
    const map = new Map();
    (solicitudes || []).forEach((s) => {
      if (s.estado === 'Pendiente') {
        const emailKey = (s.email || '').trim().toLowerCase();
        if (emailKey) map.set(emailKey, s);
        if (s.id_usuario) map.set(s.id_usuario, s);
      }
    });
    return map;
  }, [solicitudes]);

  const pendingRequestsCount = useMemo(() => {
    return (solicitudes || []).filter((s) => s.estado === 'Pendiente').length;
  }, [solicitudes]);

  return {
    usuarios,
    filteredUsuarios,
    solicitudes,
    loadingSolicitudes,
    pendingRequestsMap,
    pendingRequestsCount,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    actionLoadingId,
    loadUsuarios,
    loadSolicitudes,
    cambiarPassword,
    toggleStatus,
    deleteUser,
    registerUser,
    updateUser,
  };
}


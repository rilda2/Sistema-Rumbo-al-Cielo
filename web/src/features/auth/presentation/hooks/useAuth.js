import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom Hook: useAuth
 * 
 * Expone el estado y las operaciones del módulo Auth para cualquier componente de UI.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}

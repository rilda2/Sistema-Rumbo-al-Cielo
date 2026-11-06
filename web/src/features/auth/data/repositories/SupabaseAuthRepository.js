import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { UserModel } from '../models/UserModel';
import { supabase as defaultSupabase } from '../../../../core/config/supabaseClient';
import { AuthenticationError, AppError } from '../../../../core/errors/AppError';

/**
 * Repositorio Concreto: SupabaseAuthRepository
 * 
 * Implementa el contrato IAuthRepository usando Supabase y la vista 'vista_usuarios'.
 * Convierte cualquier respuesta cruda de Supabase en Entidades de Dominio (User).
 */
export class SupabaseAuthRepository extends IAuthRepository {
  /**
   * @param {import('@supabase/supabase-js').SupabaseClient} client
   */
  constructor(client = defaultSupabase) {
    super();
    this.client = client;
  }

  async login(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();

    // 1. Verificar bloqueo por intentos fallidos en el backend (Supabase RPC)
    try {
      const { data: lockoutCheck, error: lockoutErr } = await this.client.rpc('check_login_lockout', {
        p_email: cleanEmail,
      });

      if (!lockoutErr && lockoutCheck?.bloqueado) {
        const mins = lockoutCheck.minutos_restantes || 5;
        throw new AuthenticationError(
          `Cuenta bloqueada temporalmente por múltiples intentos fallidos. Intente nuevamente en ${mins} minuto${mins > 1 ? 's' : ''}.`
        );
      }
    } catch (err) {
      if (err instanceof AuthenticationError) throw err;
      console.warn('[SupabaseAuthRepository] Error al verificar estado de bloqueo:', err);
    }

    // 2. Intentar autenticación con Supabase Auth
    const { data, error } = await this.client.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      // Registrar intento fallido en Supabase RPC
      let failureInfo = null;
      try {
        const { data: failRes } = await this.client.rpc('record_login_failure', {
          p_email: cleanEmail,
        });
        failureInfo = failRes;
      } catch (rpcErr) {
        console.warn('[SupabaseAuthRepository] Error al registrar intento fallido:', rpcErr);
      }

      if (failureInfo?.bloqueado) {
        const mins = failureInfo.minutos_restantes || 5;
        throw new AuthenticationError(
          `Ha superado los 3 intentos fallidos permitidos. Su cuenta ha sido bloqueada por ${mins} minutos.`
        );
      }

      if (error.message?.includes('Invalid login credentials')) {
        const intentos = failureInfo?.intentos_fallidos || 1;
        const restantes = Math.max(0, 3 - intentos);
        throw new AuthenticationError(
          `Credenciales inválidas. Intento ${intentos} de 3. Le queda${restantes === 1 ? '' : 'n'} ${restantes} intento${restantes === 1 ? '' : 's'}.`
        );
      }

      throw new AuthenticationError(error.message, error);
    }

    // 3. Inicio exitoso: restablecer contador de intentos en Supabase RPC
    try {
      await this.client.rpc('record_login_success', {
        p_email: cleanEmail,
      });
    } catch (rpcErr) {
      console.warn('[SupabaseAuthRepository] Error al restablecer intentos de login:', rpcErr);
    }

    const profile = await this.getProfile(data.user.id);
    const domainUser = UserModel.fromSupabase(data.user, profile);

    return {
      user: domainUser,
      session: data.session,
    };
  }

  async logout() {
    const { error } = await this.client.auth.signOut();
    if (error) {
      throw new AppError(error.message, 'LOGOUT_ERROR', error);
    }
  }

  async getCurrentSession() {
    const { data: { session }, error } = await this.client.auth.getSession();
    if (error || !session?.user) {
      return { user: null, session: null };
    }

    const profile = await this.getProfile(session.user.id);
    const domainUser = UserModel.fromSupabase(session.user, profile);

    return {
      user: domainUser,
      session,
    };
  }

  async getProfile(userId) {
    try {
      const { data, error } = await this.client
        .from('vista_usuarios')
        .select('*')
        .eq('id_usuario', userId)
        .maybeSingle();

      if (error) {
        console.warn('[SupabaseAuthRepository] Error al obtener vista_usuarios:', error.message);
        return null;
      }

      return data;
    } catch (err) {
      console.warn('[SupabaseAuthRepository] Excepción al obtener perfil:', err);
      return null;
    }
  }

  onAuthStateChange(callback) {
    const { data: { subscription } } = this.client.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await this.getProfile(session.user.id);
        const domainUser = UserModel.fromSupabase(session.user, profile);
        callback({ user: domainUser, session });
      } else {
        callback({ user: null, session: null });
      }
    });

    return {
      unsubscribe: () => subscription?.unsubscribe(),
    };
  }
}

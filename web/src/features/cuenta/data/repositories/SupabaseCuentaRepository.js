import { ICuentaRepository } from '../../domain/repositories/ICuentaRepository';
import { supabase as defaultSupabase } from '../../../../core/config/supabaseClient';
import { AppError } from '../../../../core/errors/AppError';

/**
 * Repositorio Concreto: SupabaseCuentaRepository
 * 
 * Implementa ICuentaRepository interactuando con Supabase Auth y las tablas 'persona' y 'usuario'.
 */
export class SupabaseCuentaRepository extends ICuentaRepository {
  /**
   * @param {import('@supabase/supabase-js').SupabaseClient} client
   */
  constructor(client = defaultSupabase) {
    super();
    this.client = client;
  }

  async updatePerfil(id_usuario, { nombres, apellidos, telefono }) {
    // 1. Obtener id_persona asociado si existe
    const { data: userRow } = await this.client
      .from('usuario')
      .select('id_persona')
      .eq('id_usuario', id_usuario)
      .maybeSingle();

    const personaId = userRow?.id_persona || id_usuario;

    // 2. Intentar actualizar en tabla persona
    const { error: pError } = await this.client
      .from('persona')
      .update({
        nombre: nombres,
        apellidos: apellidos,
        telefono: telefono || null,
      })
      .eq('id_persona', personaId);

    // Si da error o no existe persona, actualizar tabla usuario directamente
    if (pError) {
      const { error: uError } = await this.client
        .from('usuario')
        .update({
          nombres,
          apellidos,
          telefono: telefono || null,
        })
        .eq('id_usuario', id_usuario);

      if (uError) {
        throw new AppError(uError.message, 'UPDATE_PROFILE_ERROR', uError);
      }
    }
  }

  async updatePassword(newPassword) {
    const { error } = await this.client.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new AppError(error.message, 'UPDATE_PASSWORD_ERROR', error);
    }
  }
}

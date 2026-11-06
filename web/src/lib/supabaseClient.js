import { createClient } from '@supabase/supabase-js';
import { supabase, supabaseUrl, supabaseAnonKey } from './supabase';

export { supabase, supabaseUrl, supabaseAnonKey };

/**
 * Inicio de sesión usando la función nativa de supabase-js
 */
export async function loginWithEmail(email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();

  // 1. Verificar bloqueo por intentos fallidos en el backend
  try {
    const { data: lockoutCheck, error: lockoutErr } = await supabase.rpc('check_login_lockout', {
      p_email: cleanEmail,
    });
    if (!lockoutErr && lockoutCheck?.bloqueado) {
      const mins = lockoutCheck.minutos_restantes || 5;
      throw new Error(`Cuenta bloqueada temporalmente por múltiples intentos fallidos. Intente nuevamente en ${mins} minuto${mins > 1 ? 's' : ''}.`);
    }
  } catch (err) {
    if (err.message?.includes('Cuenta bloqueada')) throw err;
    console.warn('Error al verificar bloqueo:', err);
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password,
  });

  if (error) {
    let failureInfo = null;
    try {
      const { data: failRes } = await supabase.rpc('record_login_failure', {
        p_email: cleanEmail,
      });
      failureInfo = failRes;
    } catch (rpcErr) {
      console.warn('Error al registrar fallo de login:', rpcErr);
    }

    if (failureInfo?.bloqueado) {
      const mins = failureInfo.minutos_restantes || 5;
      throw new Error(`Ha superado los 3 intentos fallidos permitidos. Su cuenta ha sido bloqueada por ${mins} minutos.`);
    }

    if (error.message?.includes('Invalid login credentials')) {
      const intentos = failureInfo?.intentos_fallidos || 1;
      const restantes = Math.max(0, 3 - intentos);
      throw new Error(`Credenciales inválidas. Intento ${intentos} de 3. Le queda${restantes === 1 ? '' : 'n'} ${restantes} intento${restantes === 1 ? '' : 's'}.`);
    }
    throw error;
  }

  // Éxito: restablecer intentos
  try {
    await supabase.rpc('record_login_success', { p_email: cleanEmail });
  } catch (rpcErr) {
    console.warn('Error al restablecer intentos de login:', rpcErr);
  }

  // Obtener perfil complementario desde la vista creada vista_usuarios
  if (data?.user) {
    const { data: profile, error: profileErr } = await supabase
      .from('vista_usuarios')
      .select('*')
      .eq('id_usuario', data.user.id)
      .single();

    if (!profileErr && profile) {
      if (profile.activo === false) {
        await supabase.auth.signOut();
        throw new Error('Esta cuenta ha sido desactivada. Comuníquese con el administrador.');
      }
      return { user: data.user, profile, session: data.session };
    }
  }

  return { user: data?.user, profile: data?.user?.user_metadata, session: data?.session };
}

/**
 * Cerrar sesión
 */
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Listar usuarios registrados desde la vista vista_usuarios
 * Contiene datos combinados de usuario y persona (nombre, apellidos, telefono, rol, email, ci_codigo, activo, etc.)
 */
export async function fetchUsuarios() {
  const { data, error } = await supabase
    .from('vista_usuarios')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Registro de nuevos integrantes:
 * Utiliza un cliente secundario aislado (persistSession: false) para registrar
 * la nueva cuenta vía auth.signUp sin alterar la sesión del Administrador logueado.
 * La información de persona y usuario se procesa en Supabase.
 */
export async function createAdminUser(userData) {
  const { email, password, nombres, nombre, apellidos, ci_codigo, telefono, rol } = userData;
  const firstName = (nombre || nombres || '').trim();

  // 1. Validación previa de unicidad consultando vista_usuarios
  const { data: existingCi } = await supabase
    .from('vista_usuarios')
    .select('id_usuario, ci_codigo')
    .eq('ci_codigo', ci_codigo.trim())
    .maybeSingle();

  if (existingCi) {
    throw new Error(`El número de C.I. "${ci_codigo}" ya se encuentra registrado en el sistema.`);
  }

  const { data: existingEmail } = await supabase
    .from('vista_usuarios')
    .select('id_usuario, email')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle();

  if (existingEmail) {
    throw new Error(`El correo electrónico "${email}" ya está en uso.`);
  }

  const { data: existingPhone } = await supabase
    .from('vista_usuarios')
    .select('id_usuario, telefono')
    .eq('telefono', telefono.trim())
    .maybeSingle();

  if (existingPhone) {
    throw new Error(`El teléfono "${telefono}" ya se encuentra registrado.`);
  }

  // 2. Cliente aislado sin persistencia de sesión para que el Admin continúe logueado
  const tempAuthClient = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-anon-key',
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );

  // 3. Registro con user_metadata para activar los triggers de persona y usuario en Supabase
  const { data, error } = await tempAuthClient.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: {
        nombre: firstName,
        nombres: firstName,
        apellidos: apellidos.trim(),
        ci_codigo: ci_codigo.trim(),
        telefono: telefono.trim(),
        rol, // 'Administrador' | 'Empleado' | 'Institucion'
      },
    },
  });

  if (error) {
    throw new Error(error.message || 'Error al registrar el usuario en Supabase');
  }

  return data;
}

/**
 * Anular o reactivar acceso (HU4 - Dar de baja usuarios)
 */
export async function toggleUserStatus(id_usuario, nuevoEstado) {
  const { data, error } = await supabase
    .from('usuario')
    .update({ activo: nuevoEstado })
    .eq('id_usuario', id_usuario)
    .select();

  if (error) throw error;
  return data;
}

/**
 * Actualizar perfil de usuario (HU2 - Mi Cuenta)
 * Actualiza los datos personales (nombre, apellidos, telefono) en la tabla persona
 */
export async function updateUserProfile(id_usuario, updateData) {
  const { nombres, nombre, apellidos, telefono } = updateData;
  const firstName = (nombre || nombres || '').trim();

  // Obtener id_persona asociado al usuario si existe la relación
  const { data: userRow } = await supabase
    .from('usuario')
    .select('id_persona')
    .eq('id_usuario', id_usuario)
    .maybeSingle();

  const personaId = userRow?.id_persona || id_usuario;

  // Actualizar tabla persona
  const { data, error } = await supabase
    .from('persona')
    .update({
      nombre: firstName,
      apellidos: apellidos?.trim(),
      telefono: telefono?.trim(),
    })
    .eq('id_persona', personaId)
    .select();

  // Si no se encuentra persona o da error, intentar actualizar usuario como respaldo
  if (error) {
    console.warn('Actualizando tabla usuario como respaldo:', error.message);
    const { data: uData, error: uError } = await supabase
      .from('usuario')
      .update({
        nombres: firstName,
        apellidos: apellidos?.trim(),
        telefono: telefono?.trim(),
      })
      .eq('id_usuario', id_usuario)
      .select();

    if (uError) throw error;
    return uData;
  }

  return data;
}

/**
 * Cambiar contraseña de la cuenta actual (HU2)
 */
export async function updatePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
  return data;
}

/**
 * Eliminar usuario permanentemente
 */
export async function deleteUserPermanently(id_usuario) {
  // Eliminar de public.usuario
  const { error } = await supabase.from('usuario').delete().eq('id_usuario', id_usuario);
  if (error) throw error;
}

/**
 * ========================================================
 * SECCIÓN CALENDARIO: excepcion_calendario
 * Días de no atención para empleados gestionados por admin
 * Columnas: fecha, motivo, id_encargado
 * ========================================================
 */

/**
 * Listar todas las excepciones de calendario registradas
 */
export async function fetchExcepcionesCalendario() {
  const { data, error } = await supabase
    .from('excepcion_calendario')
    .select('*')
    .eq('is_activo', true)
    .order('fecha', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Registrar un nuevo día de excepción (no atención)
 */
export async function createExcepcionCalendario({ fecha, motivo, id_encargado }) {
  // Verificar si ya existe una excepción registrada para la fecha
  const { data: existing } = await supabase
    .from('excepcion_calendario')
    .select('*')
    .eq('fecha', fecha)
    .maybeSingle();

  if (existing) {
    if (existing.is_activo) {
      throw new Error(`Ya existe un día de excepción registrado para la fecha ${fecha}.`);
    } else {
      // Reactivar excepción previamente desactivada
      const { data, error } = await supabase
        .from('excepcion_calendario')
        .update({
          is_activo: true,
          motivo: motivo.trim(),
          id_encargado,
        })
        .eq('id_excepcion', existing.id_excepcion)
        .select();

      if (error) throw error;
      return data;
    }
  }

  const { data, error } = await supabase
    .from('excepcion_calendario')
    .insert([
      {
        fecha,
        motivo: motivo.trim(),
        id_encargado,
        is_activo: true,
      },
    ])
    .select();

  if (error) throw error;
  return data;
}

/**
 * Eliminar un día de excepción (Soft delete con is_activo = false)
 */
export async function deleteExcepcionCalendario(excepcion) {
  let query = supabase.from('excepcion_calendario').update({ is_activo: false });

  if (excepcion?.id_excepcion) {
    query = query.eq('id_excepcion', excepcion.id_excepcion);
  } else if (excepcion?.id) {
    query = query.eq('id', excepcion.id);
  } else if (excepcion?.fecha) {
    query = query.eq('fecha', excepcion.fecha);
  } else {
    throw new Error('Identificador de excepción no válido.');
  }

  const { error } = await query;
  if (error) throw error;
}

/**
 * ========================================================
 * SECCIÓN USUARIOS: familiar
 * Registrar familiares asociados a usuarios con rol 'Empleado'
 * Columnas familiar: id_persona, id_usuario, parentesco ('Esposa','Esposo','Hijo','Hija')
 * Columnas persona: id_persona, nombre, apellidos, telefono
 * ========================================================
 */

/**
 * Listar familiares vinculados a un usuario empleado
 */
export async function fetchFamiliaresByUsuario(id_usuario) {
  // 1. Intentar consulta con join relacional
  const { data, error } = await supabase
    .from('familiar')
    .select(`
      *,
      persona:id_persona (
        id_persona,
        nombre,
        apellidos,
        telefono
      )
    `)
    .eq('id_usuario', id_usuario);

  // Si el join automático no está configurado en el esquema de PostgREST, hacer fallback manual
  if (error) {
    const { data: fData, error: fErr } = await supabase
      .from('familiar')
      .select('*')
      .eq('id_usuario', id_usuario);

    if (fErr) throw fErr;
    if (!fData || fData.length === 0) return [];

    const personaIds = fData.map((f) => f.id_persona).filter(Boolean);
    if (personaIds.length === 0) return fData;

    const { data: personasData } = await supabase
      .from('persona')
      .select('*')
      .in('id_persona', personaIds);

    return fData.map((f) => ({
      ...f,
      persona: personasData?.find((p) => p.id_persona === f.id_persona) || null,
    }));
  }

  return data || [];
}

/**
 * Registrar un nuevo familiar para un usuario empleado
 */
export async function createFamiliar({ id_usuario, parentesco, nombre, apellidos, telefono }) {
  const allowedParentescos = ['Esposa', 'Esposo', 'Hijo', 'Hija'];
  if (!allowedParentescos.includes(parentesco)) {
    throw new Error(`El parentesco debe ser uno de: ${allowedParentescos.join(', ')}`);
  }

  // 1. Crear el registro en persona
  const { data: personaData, error: personaErr } = await supabase
    .from('persona')
    .insert([
      {
        nombre: nombre.trim(),
        apellidos: apellidos.trim(),
        telefono: telefono ? telefono.trim() : null,
      },
    ])
    .select()
    .single();

  if (personaErr || !personaData) {
    throw new Error(personaErr?.message || 'Error al registrar la persona familiar.');
  }

  // 2. Vincular en la tabla familiar con el id_usuario del empleado
  const { data: familiarData, error: familiarErr } = await supabase
    .from('familiar')
    .insert([
      {
        id_persona: personaData.id_persona,
        id_usuario,
        parentesco,
      },
    ])
    .select()
    .single();

  if (familiarErr) {
    // Si falla el vínculo, intentar limpiar la persona creada
    await supabase.from('persona').delete().eq('id_persona', personaData.id_persona);
    throw new Error(familiarErr.message || 'Error al vincular el familiar con el empleado.');
  }

  return {
    ...familiarData,
    persona: personaData,
  };
}

/**
 * Eliminar un familiar
 */
export async function deleteFamiliar(id_persona, id_usuario) {
  const { error: fErr } = await supabase
    .from('familiar')
    .delete()
    .eq('id_persona', id_persona)
    .eq('id_usuario', id_usuario);

  if (fErr) throw fErr;

  // Intentar limpiar la persona asociada
  await supabase.from('persona').delete().eq('id_persona', id_persona);
}

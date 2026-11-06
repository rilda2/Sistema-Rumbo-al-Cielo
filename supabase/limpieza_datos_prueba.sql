-- ==============================================================================
-- LIMPIEZA DE DATOS Y REGISTROS DE PRUEBA
-- Restaurante Institucional: Supabase Database
-- Borra registros de prueba correspondientes a:
--   1. "empleado"      (demo-user-123, demo-emp-*, juan.empleado@institucion.gob.bo, etc.)
--   2. "administrador" (demo-admin-789, admin.rrhh@institucion.gob.bo, etc.)
--   3. "cocina"        (demo-chef-456, carlos.chef@restaurante.com, etc.)
-- ==============================================================================

-- Función PL/pgSQL para ejecución segura y repetible
CREATE OR REPLACE FUNCTION public.limpiar_datos_prueba()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    deleted_reservas INT := 0;
    deleted_reservations INT := 0;
    deleted_familiares INT := 0;
    deleted_suscripciones INT := 0;
    deleted_monthly_sub INT := 0;
    deleted_menu INT := 0;
    deleted_usuarios INT := 0;
    deleted_profiles INT := 0;
    deleted_auth_users INT := 0;

    test_ids TEXT[] := ARRAY[
        'demo-user-123',
        'demo-admin-789',
        'demo-chef-456',
        'demo-emp-002',
        'demo-emp-003',
        'demo-emp-004'
    ];

    test_emails TEXT[] := ARRAY[
        'juan.empleado@institucion.gob.bo',
        'roberto.flores@institucion.gob.bo',
        'claudia.gutierrez@institucion.gob.bo',
        'gonzalo.mamani@institucion.gob.bo',
        'admin.rrhh@institucion.gob.bo',
        'admin@institucion.gob.bo',
        'admin.rrhh@test.com',
        'carlos.chef@restaurante.com',
        'chef@restaurante.com',
        'cocina.turno@test.com',
        'maria.empleado@test.com'
    ];
BEGIN
    -- 1. Eliminar reservas asociadas (ambas tablas: reservas y reservations)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reservas') THEN
        WITH del AS (
            DELETE FROM public.reservas
            WHERE empleado_id::text = ANY(test_ids)
               OR empleado_id IN (SELECT id FROM public.usuarios WHERE email = ANY(test_emails))
            RETURNING 1
        )
        SELECT count(*) INTO deleted_reservas FROM del;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reservations') THEN
        WITH del AS (
            DELETE FROM public.reservations
            WHERE user_id::text = ANY(test_ids)
               OR user_id IN (SELECT id FROM public.profiles WHERE email = ANY(test_emails))
            RETURNING 1
        )
        SELECT count(*) INTO deleted_reservations FROM del;
    END IF;

    -- 2. Eliminar familiares asociados a los empleados de prueba
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'familiares') THEN
        WITH del AS (
            DELETE FROM public.familiares
            WHERE empleado_id::text = ANY(test_ids)
               OR empleado_id IN (SELECT id FROM public.usuarios WHERE email = ANY(test_emails))
            RETURNING 1
        )
        SELECT count(*) INTO deleted_familiares FROM del;
    END IF;

    -- 3. Eliminar suscripciones / pensiones de prueba
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'suscripciones') THEN
        WITH del AS (
            DELETE FROM public.suscripciones
            WHERE empleado_id::text = ANY(test_ids)
               OR empleado_id IN (SELECT id FROM public.usuarios WHERE email = ANY(test_emails))
            RETURNING 1
        )
        SELECT count(*) INTO deleted_suscripciones FROM del;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'monthly_subscriptions') THEN
        WITH del AS (
            DELETE FROM public.monthly_subscriptions
            WHERE user_id::text = ANY(test_ids)
               OR user_id IN (SELECT id FROM public.profiles WHERE email = ANY(test_emails))
            RETURNING 1
        )
        SELECT count(*) INTO deleted_monthly_sub FROM del;
    END IF;

    -- 4. Eliminar menú semanal planificado por cuentas demo de cocina/admin
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'menu_semanal') THEN
        WITH del AS (
            DELETE FROM public.menu_semanal
            WHERE creado_por::text = ANY(test_ids)
               OR creado_por IN (SELECT id FROM public.usuarios WHERE email = ANY(test_emails))
            RETURNING 1
        )
        SELECT count(*) INTO deleted_menu FROM del;
    END IF;

    -- 5. Eliminar usuarios de public.usuarios
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usuarios') THEN
        WITH del AS (
            DELETE FROM public.usuarios
            WHERE id::text = ANY(test_ids)
               OR email = ANY(test_emails)
            RETURNING 1
        )
        SELECT count(*) INTO deleted_usuarios FROM del;
    END IF;

    -- 6. Eliminar perfiles de public.profiles
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        WITH del AS (
            DELETE FROM public.profiles
            WHERE id::text = ANY(test_ids)
               OR email = ANY(test_emails)
            RETURNING 1
        )
        SELECT count(*) INTO deleted_profiles FROM del;
    END IF;

    -- 7. Eliminar usuarios de auth.users si existen en Supabase Auth
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        BEGIN
            WITH del AS (
                DELETE FROM auth.users
                WHERE id::text = ANY(test_ids)
                   OR email = ANY(test_emails)
                RETURNING 1
            )
            SELECT count(*) INTO deleted_auth_users FROM del;
        EXCEPTION WHEN OTHERS THEN
            -- Ignorar si los permisos de RLS o contexto no permiten borrar directamente auth.users
            deleted_auth_users := 0;
        END;
    END IF;

    RETURN jsonb_build_object(
        'status', 'ok',
        'message', 'Limpieza de datos de prueba completada exitosamente',
        'detalles', jsonb_build_object(
            'reservas_eliminadas', deleted_reservas + deleted_reservations,
            'familiares_eliminados', deleted_familiares,
            'suscripciones_eliminadas', deleted_suscripciones + deleted_monthly_sub,
            'menu_semanal_eliminado', deleted_menu,
            'usuarios_eliminados', deleted_usuarios,
            'profiles_eliminados', deleted_profiles,
            'auth_users_eliminados', deleted_auth_users
        )
    );
END;
$$;

-- Otorgar permisos de ejecución para roles autenticados y de servicio
GRANT EXECUTE ON FUNCTION public.limpiar_datos_prueba() TO authenticated;
GRANT EXECUTE ON FUNCTION public.limpiar_datos_prueba() TO service_role;
GRANT EXECUTE ON FUNCTION public.limpiar_datos_prueba() TO anon;

-- Ejecutar la limpieza inmediatamente
SELECT public.limpiar_datos_prueba();

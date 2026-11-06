-- ==============================================================================
-- SISTEMA RESTAURANTE INSTITUCIONAL - ESQUEMA COMPLETO DE BASE DE DATOS
-- Compatible con: Aplicación Web (React + Vite) y Aplicación Móvil (Flutter)
-- ==============================================================================
-- INSTRUCCIONES:
-- 1. Ve a tu panel de Supabase: https://supabase.com/dashboard/project/skucskajnqiitaezrkai
-- 2. En el menú lateral izquierdo, haz clic en "SQL Editor".
-- 3. Haz clic en "New query".
-- 4. Copia y pega TODO este archivo y haz clic en "Run" (o presiona Ctrl+Enter).
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLAS PRINCIPALES
-- ==============================================================================

-- A. Personas (Datos personales compartidos entre usuarios y familiares)
CREATE TABLE IF NOT EXISTS public.persona (
    id_persona BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre TEXT NOT NULL CHECK (btrim(nombre) <> ''),
    apellidos TEXT NOT NULL CHECK (btrim(apellidos) <> ''),
    telefono TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- B. Usuarios (Vinculado a auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.usuario (
    id_usuario UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    id_persona BIGINT REFERENCES public.persona(id_persona) ON DELETE SET NULL,
    ci_codigo TEXT UNIQUE,
    nombres TEXT,
    apellidos TEXT,
    email TEXT,
    telefono TEXT,
    rol TEXT NOT NULL DEFAULT 'Empleado'
        CHECK (rol IN ('Administrador', 'Empleado', 'Institucion', 'Cocina', 'Encargado', 'ADMIN', 'EMPLEADO', 'INSTITUCION', 'COCINA', 'ENCARGADO', 'empleado', 'encargado', 'institucion', 'cocina')),
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- C. Perfiles (Compatibilidad directa con Flutter)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'empleado',
    department TEXT DEFAULT 'Administración Central',
    is_pensioner BOOLEAN DEFAULT false,
    monthly_expense NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- D. Familiares asociados a usuarios Empleados
CREATE TABLE IF NOT EXISTS public.familiar (
    id_familiar BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_persona BIGINT NOT NULL REFERENCES public.persona(id_persona) ON DELETE CASCADE,
    id_usuario UUID NOT NULL REFERENCES public.usuario(id_usuario) ON DELETE CASCADE,
    parentesco TEXT NOT NULL CHECK (parentesco IN ('Esposa', 'Esposo', 'Hijo', 'Hija', 'Padre', 'Madre', 'Hermano', 'Hermana', 'Familiar')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- E. Platos del Menú
CREATE TABLE IF NOT EXISTS public.plato (
    id_plato BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE CHECK (btrim(nombre) <> ''),
    descripcion TEXT,
    categoria TEXT NOT NULL DEFAULT 'Segundo' CHECK (categoria IN ('Segundo', 'Plato Fuerte', 'Sopa', 'Entrada', 'Vegetariano', 'Especial', 'Postre', 'Bebida')),
    precio NUMERIC(10, 2) NOT NULL DEFAULT 18.00 CHECK (precio >= 0),
    imagen_url TEXT,
    calorias INT DEFAULT 600,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- F. Menú del Día
CREATE TABLE IF NOT EXISTS public.menu_dia (
    id_menu BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fecha DATE NOT NULL UNIQUE,
    estado_publicacion BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- G. Relación N:M entre Menú del Día y Platos
CREATE TABLE IF NOT EXISTS public.menu_plato (
    id_menuplato BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_menu BIGINT NOT NULL REFERENCES public.menu_dia(id_menu) ON DELETE CASCADE,
    id_plato BIGINT NOT NULL REFERENCES public.plato(id_plato) ON DELETE CASCADE,
    CONSTRAINT unique_menu_plato UNIQUE (id_menu, id_plato)
);

-- H. Excepciones de Calendario (Feriados y días de no atención)
CREATE TABLE IF NOT EXISTS public.excepcion_calendario (
    id_excepcion BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fecha DATE NOT NULL UNIQUE,
    motivo TEXT NOT NULL,
    id_encargado UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- I. Reservas
CREATE TABLE IF NOT EXISTS public.reserva (
    id_reserva BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario UUID NOT NULL REFERENCES public.usuario(id_usuario) ON DELETE CASCADE,
    id_familiar BIGINT REFERENCES public.familiar(id_familiar) ON DELETE SET NULL,
    fecha DATE NOT NULL,
    dish_name TEXT,
    plato_principal TEXT,
    sopa_nombre TEXT,
    entrada_nombre TEXT,
    es_almuerzo_completo BOOLEAN NOT NULL DEFAULT true,
    categoria_menu TEXT NOT NULL DEFAULT 'almuerzo_completo',
    estado TEXT NOT NULL DEFAULT 'confirmada' CHECK (lower(estado) IN ('confirmada', 'cancelada', 'entregada', 'activa')),
    tipo TEXT NOT NULL DEFAULT 'diaria' CHECK (lower(tipo) IN ('diaria', 'pension')),
    es_pension BOOLEAN NOT NULL DEFAULT false,
    costo_aplicado NUMERIC(10, 2) NOT NULL DEFAULT 18.00 CHECK (costo_aplicado >= 0),
    recogido BOOLEAN NOT NULL DEFAULT false,
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- J. Control de Asistencia en Cocina
CREATE TABLE IF NOT EXISTS public.asistencia (
    id_asistencia BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_reserva BIGINT REFERENCES public.reserva(id_reserva) ON DELETE CASCADE,
    id_usuario UUID REFERENCES public.usuario(id_usuario) ON DELETE CASCADE,
    fecha_hora TIMESTAMPTZ NOT NULL DEFAULT now(),
    asistio BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- K. Membresía / Modalidad Pensión Mensual
CREATE TABLE IF NOT EXISTS public.pension (
    id_pension BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario UUID NOT NULL REFERENCES public.usuario(id_usuario) ON DELETE CASCADE,
    mes INT NOT NULL CHECK (mes BETWEEN 1 AND 12),
    year INT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_user_pension UNIQUE (id_usuario, mes, year)
);

-- L. Configuración General del Sistema
CREATE TABLE IF NOT EXISTS public.configuracion (
    id_config INT PRIMARY KEY DEFAULT 1,
    precio_esporadico NUMERIC(10, 2) NOT NULL DEFAULT 18.00,
    precio_pension NUMERIC(10, 2) NOT NULL DEFAULT 15.00,
    dias_minimos INT NOT NULL DEFAULT 10,
    hora_limite_reserva TIME DEFAULT '09:00:00',
    hora_limite_cancelacion TIME DEFAULT '08:59:00',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- M. Cierres Mensuales y Liquidaciones
CREATE TABLE IF NOT EXISTS public.cierre_mensual (
    id_cierre BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    mes INT NOT NULL CHECK (mes BETWEEN 1 AND 12),
    year INT NOT NULL,
    fecha_generacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    total_general NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    cerrado BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_cierre_mes_year UNIQUE (mes, year)
);

-- N. Detalle del Cierre Mensual por Empleado
CREATE TABLE IF NOT EXISTS public.detalle_cierre (
    id_detalle BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_cierre BIGINT NOT NULL REFERENCES public.cierre_mensual(id_cierre) ON DELETE CASCADE,
    id_empleado UUID NOT NULL REFERENCES public.usuario(id_usuario) ON DELETE CASCADE,
    tipo_reserva TEXT NOT NULL DEFAULT 'esporadico',
    cantidad_cobrable INT NOT NULL DEFAULT 0,
    precio_unitario NUMERIC(10, 2) NOT NULL DEFAULT 18.00,
    total_descontar NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    estado_descuento TEXT NOT NULL DEFAULT 'Pendiente',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- O. Solicitudes de Recuperación de Contraseña
CREATE TABLE IF NOT EXISTS public.solicitud_recuperacion (
    id_solicitud BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario UUID REFERENCES public.usuario(id_usuario) ON DELETE SET NULL,
    email TEXT NOT NULL,
    ci_codigo TEXT,
    estado TEXT NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'ATENDIDA', 'RECHAZADA')),
    fecha_solicitud TIMESTAMPTZ DEFAULT now()
);

-- P. Control de Intentos de Login y Bloqueo Temporal
CREATE TABLE IF NOT EXISTS public.intentos_login (
    email TEXT PRIMARY KEY,
    intentos INT NOT NULL DEFAULT 0,
    ultimo_intento TIMESTAMPTZ NOT NULL DEFAULT now(),
    bloqueado_hasta TIMESTAMPTZ
);

-- ==============================================================================
-- 3. VISTAS DEL SISTEMA (VIEWS)
-- ==============================================================================

-- Vista 1: vista_usuarios (Utilizada por Auth, Gestión de Usuarios y Reportes)
CREATE OR REPLACE VIEW public.vista_usuarios AS
SELECT
    u.id_usuario,
    p.id_persona,
    COALESCE(p.nombre, u.nombres, '') AS nombre,
    COALESCE(u.nombres, p.nombre, '') AS nombres,
    COALESCE(p.apellidos, u.apellidos, '') AS apellidos,
    TRIM(CONCAT(COALESCE(p.nombre, u.nombres, ''), ' ', COALESCE(p.apellidos, u.apellidos, ''))) AS nombre_completo,
    COALESCE(u.email, au.email, '') AS email,
    u.ci_codigo,
    COALESCE(p.telefono, u.telefono, '') AS telefono,
    u.rol,
    u.activo,
    u.created_at
FROM public.usuario u
LEFT JOIN public.persona p ON u.id_persona = p.id_persona
LEFT JOIN auth.users au ON u.id_usuario = au.id;

-- Vista 2: vista_menu_con_platos (Menú del día con platos agregados en JSON)
CREATE OR REPLACE VIEW public.vista_menu_con_platos AS
SELECT
    m.id_menu,
    m.fecha,
    m.estado_publicacion,
    COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id_plato', p.id_plato,
                'id', p.id_plato,
                'nombre', p.nombre,
                'descripcion', p.descripcion,
                'categoria', p.categoria,
                'precio', p.precio,
                'imagen_url', p.imagen_url,
                'imagen_path', p.imagen_url,
                'calorias', p.calorias,
                'activo', p.activo
            )
        ) FILTER (WHERE p.id_plato IS NOT NULL),
        '[]'::jsonb
    ) AS platos
FROM public.menu_dia m
LEFT JOIN public.menu_plato mp ON m.id_menu = mp.id_menu
LEFT JOIN public.plato p ON mp.id_plato = p.id_plato AND p.activo = true
GROUP BY m.id_menu, m.fecha, m.estado_publicacion;

-- Vista 3: vista_reservas_completas (Historial, cocina y reportes consolidados)
CREATE OR REPLACE VIEW public.vista_reservas_completas AS
SELECT
    r.id_reserva,
    r.id_reserva AS id,
    r.id_usuario,
    r.id_usuario AS empleado_id,
    r.id_usuario AS user_id,
    r.id_familiar,
    r.id_familiar AS familiar_id,
    r.fecha,
    r.fecha AS reservation_date,
    r.dish_name,
    r.dish_name AS plato_nombre,
    r.plato_principal,
    r.sopa_nombre,
    r.entrada_nombre,
    r.es_almuerzo_completo,
    r.categoria_menu,
    r.categoria_menu AS menu_category,
    r.estado,
    r.estado AS status,
    r.tipo,
    r.tipo AS type,
    r.es_pension,
    r.costo_aplicado,
    r.costo_aplicado AS precio,
    r.costo_aplicado AS price,
    r.recogido,
    r.notas,
    r.notas AS notes,
    r.created_at,
    -- Datos del usuario
    TRIM(CONCAT(COALESCE(pu.nombre, u.nombres, ''), ' ', COALESCE(pu.apellidos, u.apellidos, ''))) AS empleado_nombre,
    TRIM(CONCAT(COALESCE(pu.nombre, u.nombres, ''), ' ', COALESCE(pu.apellidos, u.apellidos, ''))) AS user_name,
    u.ci_codigo,
    -- Datos del familiar
    TRIM(CONCAT(pf.nombre, ' ', pf.apellidos)) AS familiar_nombre,
    f.parentesco AS familiar_parentesco,
    -- Beneficiario resuelto
    CASE
        WHEN r.id_familiar IS NOT NULL THEN
            TRIM(CONCAT(pf.nombre, ' ', pf.apellidos, ' (', f.parentesco, ')'))
        ELSE
            TRIM(CONCAT(COALESCE(pu.nombre, u.nombres, ''), ' ', COALESCE(pu.apellidos, u.apellidos, '')))
    END AS beneficiary_name
FROM public.reserva r
JOIN public.usuario u ON r.id_usuario = u.id_usuario
LEFT JOIN public.persona pu ON u.id_persona = pu.id_persona
LEFT JOIN public.familiar f ON r.id_familiar = f.id_familiar
LEFT JOIN public.persona pf ON f.id_persona = pf.id_persona;

-- Vistas de compatibilidad cruzada (Flutter y nombres plurales)
CREATE OR REPLACE VIEW public.platos AS
SELECT
    id_plato AS id,
    id_plato,
    nombre,
    descripcion,
    categoria,
    precio,
    imagen_url,
    imagen_url AS imagen_path,
    imagen_url AS image_url,
    calorias,
    activo,
    created_at
FROM public.plato;

CREATE OR REPLACE VIEW public.platos_catalogo AS
SELECT
    id_plato AS id,
    id_plato,
    nombre,
    descripcion,
    categoria,
    'Nacional'::text AS region,
    precio,
    imagen_url,
    activo,
    created_at AS creado_en
FROM public.plato;

CREATE OR REPLACE VIEW public.holidays AS
SELECT
    id_excepcion::text AS id,
    fecha AS date,
    motivo AS name,
    motivo AS description
FROM public.excepcion_calendario
WHERE is_activo = true;

CREATE OR REPLACE VIEW public.reservas AS
SELECT
    id_reserva AS id,
    id_reserva,
    id_usuario AS empleado_id,
    id_usuario AS user_id,
    id_usuario,
    id_familiar AS familiar_id,
    id_familiar,
    fecha,
    dish_name,
    plato_principal,
    sopa_nombre,
    entrada_nombre,
    es_almuerzo_completo,
    categoria_menu AS menu_category,
    categoria_menu,
    estado,
    tipo,
    es_pension,
    costo_aplicado AS precio,
    costo_aplicado,
    recogido,
    notas,
    created_at,
    created_at AS creado_en
FROM public.reserva;

CREATE OR REPLACE VIEW public.reservations AS
SELECT * FROM public.reservas;

CREATE OR REPLACE VIEW public.monthly_subscriptions AS
SELECT
    id_pension AS id,
    id_usuario AS user_id,
    year,
    mes AS month,
    20 AS total_days,
    15.00 AS price_per_day,
    300.00 AS total_price,
    CASE WHEN activo THEN 'activa' ELSE 'cancelada' END AS status,
    created_at
FROM public.pension;

-- ==============================================================================
-- 4. FUNCIONES RPC
-- ==============================================================================

-- A. Verificar bloqueo de inicio de sesión
CREATE OR REPLACE FUNCTION public.check_login_lockout(p_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_clean_email TEXT := LOWER(TRIM(p_email));
    v_record RECORD;
    v_minutos INT;
BEGIN
    SELECT * INTO v_record FROM public.intentos_login WHERE email = v_clean_email;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('bloqueado', false, 'intentos_fallidos', 0, 'minutos_restantes', 0);
    END IF;

    IF v_record.bloqueado_hasta IS NOT NULL AND v_record.bloqueado_hasta > now() THEN
        v_minutos := CEIL(EXTRACT(EPOCH FROM (v_record.bloqueado_hasta - now())) / 60);
        RETURN jsonb_build_object('bloqueado', true, 'intentos_fallidos', v_record.intentos, 'minutos_restantes', GREATEST(v_minutos, 1));
    END IF;

    IF v_record.bloqueado_hasta IS NOT NULL AND v_record.bloqueado_hasta <= now() THEN
        UPDATE public.intentos_login
        SET intentos = 0, bloqueado_hasta = NULL, ultimo_intento = now()
        WHERE email = v_clean_email;
        RETURN jsonb_build_object('bloqueado', false, 'intentos_fallidos', 0, 'minutos_restantes', 0);
    END IF;

    RETURN jsonb_build_object('bloqueado', false, 'intentos_fallidos', v_record.intentos, 'minutos_restantes', 0);
END;
$$;

-- B. Registrar fallo de login (bloqueo tras 3 intentos)
CREATE OR REPLACE FUNCTION public.record_login_failure(p_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_clean_email TEXT := LOWER(TRIM(p_email));
    v_intentos INT;
    v_bloqueado BOOLEAN := false;
    v_minutos INT := 0;
    v_bloqueado_hasta TIMESTAMPTZ := NULL;
BEGIN
    INSERT INTO public.intentos_login (email, intentos, ultimo_intento)
    VALUES (v_clean_email, 1, now())
    ON CONFLICT (email) DO UPDATE
    SET intentos = public.intentos_login.intentos + 1,
        ultimo_intento = now()
    RETURNING intentos INTO v_intentos;

    IF v_intentos >= 3 THEN
        v_bloqueado := true;
        v_minutos := 5;
        v_bloqueado_hasta := now() + interval '5 minutes';
        UPDATE public.intentos_login
        SET bloqueado_hasta = v_bloqueado_hasta
        WHERE email = v_clean_email;
    END IF;

    RETURN jsonb_build_object(
        'bloqueado', v_bloqueado,
        'intentos_fallidos', v_intentos,
        'minutos_restantes', v_minutos
    );
END;
$$;

-- C. Restablecer contador tras login exitoso
CREATE OR REPLACE FUNCTION public.record_login_success(p_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_clean_email TEXT := LOWER(TRIM(p_email));
BEGIN
    DELETE FROM public.intentos_login WHERE email = v_clean_email;
END;
$$;

-- D. Guardar Menú Semanal Atómicamente
CREATE OR REPLACE FUNCTION public.guardar_menu_semanal(p_dias JSONB DEFAULT NULL, dias JSONB DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_dias JSONB;
    v_item JSONB;
    v_fecha DATE;
    v_estado BOOLEAN;
    v_menu_id BIGINT;
    v_plato_id_json JSONB;
    v_plato_id BIGINT;
BEGIN
    v_dias := COALESCE(p_dias, dias);
    IF v_dias IS NULL OR jsonb_array_length(v_dias) = 0 THEN
        RETURN jsonb_build_object('success', false, 'message', 'No se proporcionaron días para el menú.');
    END IF;

    FOR v_item IN SELECT * FROM jsonb_array_elements(v_dias)
    LOOP
        v_fecha := (v_item->>'fecha')::DATE;
        v_estado := COALESCE((v_item->>'estado_publicacion')::BOOLEAN, false);

        INSERT INTO public.menu_dia (fecha, estado_publicacion)
        VALUES (v_fecha, v_estado)
        ON CONFLICT (fecha) DO UPDATE
        SET estado_publicacion = EXCLUDED.estado_publicacion
        RETURNING id_menu INTO v_menu_id;

        DELETE FROM public.menu_plato WHERE id_menu = v_menu_id;

        IF v_item ? 'platos_ids' AND jsonb_typeof(v_item->'platos_ids') = 'array' THEN
            FOR v_plato_id_json IN SELECT * FROM jsonb_array_elements(v_item->'platos_ids')
            LOOP
                v_plato_id := v_plato_id_json::text::bigint;
                INSERT INTO public.menu_plato (id_menu, id_plato)
                VALUES (v_menu_id, v_plato_id)
                ON CONFLICT (id_menu, id_plato) DO NOTHING;
            END LOOP;
        END IF;
    END LOOP;

    RETURN jsonb_build_object('success', true, 'message', 'Menú semanal guardado exitosamente.');
END;
$$;

-- E. Obtener Solicitudes de Recuperación con datos del usuario
CREATE OR REPLACE FUNCTION public.obtener_solicitudes_recuperacion()
RETURNS TABLE (
    id_solicitud BIGINT,
    id_usuario UUID,
    email TEXT,
    ci_codigo TEXT,
    estado TEXT,
    fecha_solicitud TIMESTAMPTZ,
    nombre_completo TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT
        s.id_solicitud,
        s.id_usuario,
        s.email,
        s.ci_codigo,
        s.estado,
        s.fecha_solicitud,
        v.nombre_completo
    FROM public.solicitud_recuperacion s
    LEFT JOIN public.vista_usuarios v ON s.id_usuario = v.id_usuario
    ORDER BY s.fecha_solicitud DESC;
$$;

-- F. Cambiar contraseña administrativamente desde el panel
CREATE OR REPLACE FUNCTION public.admin_cambiar_password_usuario(p_id_usuario UUID, p_nuevo_password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE auth.users
    SET encrypted_password = crypt(p_nuevo_password, gen_salt('bf'))
    WHERE id = p_id_usuario;

    RETURN jsonb_build_object('success', true, 'message', 'Contraseña actualizada con éxito.');
END;
$$;

-- ==============================================================================
-- 5. TRIGGER: CREACIÓN AUTOMÁTICA DE USUARIO Y PERFIL EN REGISTRO (AUTH.USERS)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_persona_id BIGINT;
    v_nombre TEXT;
    v_apellidos TEXT;
    v_ci TEXT;
    v_telefono TEXT;
    v_rol TEXT;
BEGIN
    v_nombre := COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.raw_user_meta_data->>'nombres', 'Usuario');
    v_apellidos := COALESCE(NEW.raw_user_meta_data->>'apellidos', '');
    v_ci := NEW.raw_user_meta_data->>'ci_codigo';
    v_telefono := NEW.raw_user_meta_data->>'telefono';
    v_rol := COALESCE(NEW.raw_user_meta_data->>'rol', NEW.raw_user_meta_data->>'role', 'Empleado');

    -- Normalizar rol
    IF lower(v_rol) LIKE '%admin%' THEN
        v_rol := 'Administrador';
    ELSIF lower(v_rol) LIKE '%institucion%' THEN
        v_rol := 'Institucion';
    ELSIF lower(v_rol) LIKE '%cocina%' OR lower(v_rol) LIKE '%encargado%' THEN
        v_rol := 'Cocina';
    ELSE
        v_rol := 'Empleado';
    END IF;

    -- 1. Crear persona
    INSERT INTO public.persona (nombre, apellidos, telefono)
    VALUES (v_nombre, v_apellidos, v_telefono)
    RETURNING id_persona INTO v_persona_id;

    -- 2. Crear usuario
    INSERT INTO public.usuario (id_usuario, id_persona, ci_codigo, nombres, apellidos, email, telefono, rol, activo)
    VALUES (NEW.id, v_persona_id, v_ci, v_nombre, v_apellidos, NEW.email, v_telefono, v_rol, true)
    ON CONFLICT (id_usuario) DO UPDATE
    SET id_persona = EXCLUDED.id_persona,
        ci_codigo = COALESCE(EXCLUDED.ci_codigo, public.usuario.ci_codigo),
        nombres = EXCLUDED.nombres,
        apellidos = EXCLUDED.apellidos,
        email = EXCLUDED.email,
        telefono = EXCLUDED.telefono,
        rol = EXCLUDED.rol;

    -- 3. Crear profile compatible con Flutter
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (NEW.id, NEW.email, TRIM(CONCAT(v_nombre, ' ', v_apellidos)), LOWER(v_rol))
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 6. STORAGE BUCKET PARA IMÁGENES DE PLATOS
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('imagenes', 'imagenes', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ==============================================================================
-- 7. PERMISOS Y ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Otorgar permisos sobre el esquema public a los roles de Supabase
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- Habilitar RLS en todas las tablas
ALTER TABLE public.persona ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.familiar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plato ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_dia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_plato ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.excepcion_calendario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reserva ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asistencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pension ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cierre_mensual ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detalle_cierre ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitud_recuperacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intentos_login ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública (Menú, Platos, Excepciones, Configuración)
CREATE POLICY "Lectura abierta platos" ON public.plato FOR SELECT USING (true);
CREATE POLICY "Gestión platos authenticated" ON public.plato FOR ALL TO authenticated USING (true);

CREATE POLICY "Lectura abierta menu_dia" ON public.menu_dia FOR SELECT USING (true);
CREATE POLICY "Gestión menu_dia authenticated" ON public.menu_dia FOR ALL TO authenticated USING (true);

CREATE POLICY "Lectura abierta menu_plato" ON public.menu_plato FOR SELECT USING (true);
CREATE POLICY "Gestión menu_plato authenticated" ON public.menu_plato FOR ALL TO authenticated USING (true);

CREATE POLICY "Lectura abierta excepcion_calendario" ON public.excepcion_calendario FOR SELECT USING (true);
CREATE POLICY "Gestión excepcion_calendario authenticated" ON public.excepcion_calendario FOR ALL TO authenticated USING (true);

CREATE POLICY "Lectura abierta configuracion" ON public.configuracion FOR SELECT USING (true);
CREATE POLICY "Gestión configuracion authenticated" ON public.configuracion FOR ALL TO authenticated USING (true);

-- Políticas de personas y usuarios
CREATE POLICY "Acceso total personas autenticados" ON public.persona FOR ALL TO authenticated USING (true);
CREATE POLICY "Lectura pública personas" ON public.persona FOR SELECT USING (true);

CREATE POLICY "Acceso total usuario autenticados" ON public.usuario FOR ALL TO authenticated USING (true);
CREATE POLICY "Lectura pública usuario" ON public.usuario FOR SELECT USING (true);

CREATE POLICY "Acceso total profiles autenticados" ON public.profiles FOR ALL TO authenticated USING (true);
CREATE POLICY "Lectura pública profiles" ON public.profiles FOR SELECT USING (true);

-- Políticas de familiares
CREATE POLICY "Acceso familiares autenticados" ON public.familiar FOR ALL TO authenticated USING (true);
CREATE POLICY "Lectura familiares" ON public.familiar FOR SELECT USING (true);

-- Políticas de reservas y asistencias
CREATE POLICY "Acceso reservas autenticados" ON public.reserva FOR ALL TO authenticated USING (true);
CREATE POLICY "Acceso asistencias autenticados" ON public.asistencia FOR ALL TO authenticated USING (true);
CREATE POLICY "Acceso pensiones autenticados" ON public.pension FOR ALL TO authenticated USING (true);
CREATE POLICY "Acceso cierre_mensual autenticados" ON public.cierre_mensual FOR ALL TO authenticated USING (true);
CREATE POLICY "Acceso detalle_cierre autenticados" ON public.detalle_cierre FOR ALL TO authenticated USING (true);

-- Políticas de solicitudes de recuperación
CREATE POLICY "Insertar solicitud recuperación anon" ON public.solicitud_recuperacion FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Gestión solicitudes authenticated" ON public.solicitud_recuperacion FOR ALL TO authenticated USING (true);

-- Políticas de intentos de login
CREATE POLICY "Acceso intentos_login anon y authenticated" ON public.intentos_login FOR ALL TO anon, authenticated USING (true);

-- Políticas de Storage para el bucket 'imagenes'
DROP POLICY IF EXISTS "Lectura pública de imágenes" ON storage.objects;
CREATE POLICY "Lectura pública de imágenes" ON storage.objects FOR SELECT USING (bucket_id = 'imagenes');

DROP POLICY IF EXISTS "Subida de imágenes" ON storage.objects;
CREATE POLICY "Subida de imágenes" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'imagenes');

DROP POLICY IF EXISTS "Actualización de imágenes" ON storage.objects;
CREATE POLICY "Actualización de imágenes" ON storage.objects FOR UPDATE TO anon, authenticated USING (bucket_id = 'imagenes');

DROP POLICY IF EXISTS "Eliminación de imágenes" ON storage.objects;
CREATE POLICY "Eliminación de imágenes" ON storage.objects FOR DELETE TO anon, authenticated USING (bucket_id = 'imagenes');

-- ==============================================================================
-- 8. DATOS SEMILLA INICIALES (SEED DATA)
-- ==============================================================================

-- Configuración inicial por defecto
INSERT INTO public.configuracion (id_config, precio_esporadico, precio_pension, dias_minimos)
VALUES (1, 18.00, 15.00, 10)
ON CONFLICT (id_config) DO NOTHING;

-- Catálogo de Gastronomía Boliviana y Platos
INSERT INTO public.plato (nombre, descripcion, categoria, precio, calorias, imagen_url, activo) VALUES
('Silpancho Cochabambino', 'Carne apanada sobre cama de arroz blanco y papas doradas con huevo frito y sarza fresca.', 'Segundo', 18.00, 780, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500', true),
('Pique Macho Especial', 'Trozos de lomo de res saltados con salchichas, papas fritas, huevo duro, tomate y locoto.', 'Segundo', 18.00, 890, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500', true),
('Majadito Cruceño con Huevo y Plátano', 'Arroz tostado con charque desmenuzado, plátano frito y huevo criollo.', 'Segundo', 18.00, 680, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500', true),
('Sopa de Maní Tradicional', 'Sopa espesa y cremosa a base de maní licuado, verduras selectas, carne tierna y fideos tostados.', 'Sopa', 18.00, 520, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500', true),
('Falso Conejo', 'Carne apanada en ají amarillo suave con arvejas, fideo tostado y papas.', 'Segundo', 18.00, 620, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500', true),
('Saice Tarijeño', 'Guiso tradicional de carne picada, ají colorado, arvejas, cebolla picada y chuño.', 'Segundo', 18.00, 640, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500', true),
('Chairo Paceño', 'Sopa tradicional andina con chuño picado, carne de res, trigo pelado, papas y hierbabuena.', 'Sopa', 18.00, 480, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500', true),
('Picante Mixto', 'Combinación de pollo al ají amarillo y carne tierna con ají rojo, chuño phuti y ensalada.', 'Segundo', 18.00, 750, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500', true),
('Mondongo Chuquisaqueño', 'Carne de cerdo en salsa de ají colorado acompañada de mote amarillo y papas.', 'Segundo', 18.00, 810, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500', true),
('Trucha del Titicaca al Limón', 'Filete de trucha fresca a la plancha con arroz blanco y ensalada fresca.', 'Segundo', 18.00, 510, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500', true),
('Plato Saludable Vegetariano', 'Quinua real perlada con verduras salteadas al wok, palta fresca y champiñones grillados.', 'Vegetariano', 18.00, 460, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500', true),
('Budín de Pan Casero', 'Tradicional budín horneado bañado en caramelo dorado con un toque de canela.', 'Postre', 7.00, 320, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500', true)
ON CONFLICT (nombre) DO NOTHING;

-- Feriados Oficiales y Excepciones del Calendario (2026)
INSERT INTO public.excepcion_calendario (fecha, motivo, is_activo) VALUES
('2026-01-01', 'Año Nuevo', true),
('2026-01-22', 'Día del Estado Plurinacional', true),
('2026-02-16', 'Carnaval (Lunes)', true),
('2026-02-17', 'Carnaval (Martes)', true),
('2026-04-03', 'Viernes Santo', true),
('2026-05-01', 'Día del Trabajo', true),
('2026-06-04', 'Corpus Christi', true),
('2026-08-06', 'Día de la Independencia', true),
('2026-11-02', 'Día de Todos los Santos', true),
('2026-12-25', 'Navidad', true)
ON CONFLICT (fecha) DO NOTHING;

-- Menús publicados para la semana actual (Noviembre 2026)
INSERT INTO public.menu_dia (fecha, estado_publicacion) VALUES
('2026-11-02', true),
('2026-11-03', true),
('2026-11-04', true),
('2026-11-05', true),
('2026-11-06', true)
ON CONFLICT (fecha) DO NOTHING;

-- Asociar platos a los menús de la semana
DO $$
DECLARE
    v_m1 BIGINT; v_m2 BIGINT; v_m3 BIGINT; v_m4 BIGINT; v_m5 BIGINT;
    v_p1 BIGINT; v_p2 BIGINT; v_p3 BIGINT; v_p4 BIGINT; v_p5 BIGINT;
BEGIN
    SELECT id_menu INTO v_m1 FROM public.menu_dia WHERE fecha = '2026-11-02';
    SELECT id_menu INTO v_m2 FROM public.menu_dia WHERE fecha = '2026-11-03';
    SELECT id_menu INTO v_m3 FROM public.menu_dia WHERE fecha = '2026-11-04';
    SELECT id_menu INTO v_m4 FROM public.menu_dia WHERE fecha = '2026-11-05';
    SELECT id_menu INTO v_m5 FROM public.menu_dia WHERE fecha = '2026-11-06';

    SELECT id_plato INTO v_p1 FROM public.plato WHERE nombre = 'Silpancho Cochabambino';
    SELECT id_plato INTO v_p2 FROM public.plato WHERE nombre = 'Sopa de Maní Tradicional';
    SELECT id_plato INTO v_p3 FROM public.plato WHERE nombre = 'Majadito Cruceño con Huevo y Plátano';
    SELECT id_plato INTO v_p4 FROM public.plato WHERE nombre = 'Pique Macho Especial';
    SELECT id_plato INTO v_p5 FROM public.plato WHERE nombre = 'Plato Saludable Vegetariano';

    IF v_m3 IS NOT NULL AND v_p1 IS NOT NULL THEN
        INSERT INTO public.menu_plato (id_menu, id_plato) VALUES (v_m3, v_p1) ON CONFLICT DO NOTHING;
    END IF;
    IF v_m3 IS NOT NULL AND v_p2 IS NOT NULL THEN
        INSERT INTO public.menu_plato (id_menu, id_plato) VALUES (v_m3, v_p2) ON CONFLICT DO NOTHING;
    END IF;
    IF v_m4 IS NOT NULL AND v_p3 IS NOT NULL THEN
        INSERT INTO public.menu_plato (id_menu, id_plato) VALUES (v_m4, v_p3) ON CONFLICT DO NOTHING;
    END IF;
    IF v_m5 IS NOT NULL AND v_p4 IS NOT NULL THEN
        INSERT INTO public.menu_plato (id_menu, id_plato) VALUES (v_m5, v_p4) ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Recargar la caché de PostgREST para reflejar los cambios de inmediato
NOTIFY pgrst, 'reload schema';

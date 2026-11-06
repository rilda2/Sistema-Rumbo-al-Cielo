-- ==============================================================================
-- Migración: Acceso Público y Visualización de Imágenes de Platos desde Supabase
-- Archivo: 20261020_grant_public_menu_and_images.sql
-- ==============================================================================

-- 1. Otorgar permisos de uso de esquema a los roles anon y authenticated
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon, authenticated;

-- 2. Asegurar que las columnas de imágenes existan en la tabla platos
ALTER TABLE public.platos
  ADD COLUMN IF NOT EXISTS imagen_path TEXT,
  ADD COLUMN IF NOT EXISTS imagen_url TEXT;

-- 3. Habilitar RLS y crear políticas permisivas de lectura para anon y authenticated
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['platos', 'menu_dias', 'menu_dia_platos', 'platos_catalogo', 'menu_semanal', 'dishes', 'usuarios', 'reservas', 'reservations', 'calendario', 'tarifas', 'familiares']
  LOOP
    IF to_regclass(format('public.%I', tbl)) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
      EXECUTE format('DROP POLICY IF EXISTS "Lectura publica %I" ON public.%I', tbl, tbl);
      EXECUTE format('CREATE POLICY "Lectura publica %I" ON public.%I FOR SELECT TO anon, authenticated USING (true)', tbl, tbl);
    END IF;
  END LOOP;
END $$;

-- 4. Recargar el caché del esquema de PostgREST para que los endpoints respondan inmediatamente
NOTIFY pgrst, 'reload schema';

-- 5. Hacer públicas las imágenes usadas por el menú del empleado
INSERT INTO storage.buckets (id, name, public)
VALUES ('platos', 'platos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Lectura publica imagenes platos" ON storage.objects;
CREATE POLICY "Lectura publica imagenes platos"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'platos');

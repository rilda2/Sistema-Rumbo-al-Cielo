-- Permite que la aplicación consulte el menú publicado con la clave pública.
-- Las tablas menu_dias/menu_dia_platos/platos pertenecen al esquema legado
-- que todavía utiliza SupabaseMenuRepository.

DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['menu_dias', 'menu_dia_platos', 'platos']
  LOOP
    IF to_regclass(format('public.%I', table_name)) IS NOT NULL THEN
      EXECUTE format('GRANT SELECT ON TABLE public.%I TO anon, authenticated', table_name);
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);

      EXECUTE format(
        'DROP POLICY IF EXISTS "Lectura pública del menú" ON public.%I',
        table_name
      );
      EXECUTE format(
        'CREATE POLICY "Lectura pública del menú" ON public.%I
         FOR SELECT TO anon, authenticated USING (true)',
        table_name
      );
    END IF;
  END LOOP;
END
$$;

-- El enum de parentesco puede variar entre instancias de Supabase.
-- La aplicación muestra y valida las opciones permitidas, por lo que esta
-- columna no debe depender de las etiquetas de un enum antiguo.
--
-- v_reservas_detalle puede depender del tipo de esta columna. PostgreSQL no
-- permite cambiarlo mientras la vista exista, así que se conserva su
-- definición, se elimina temporalmente y se recrea después del cambio.
DO $migration$
DECLARE
  view_definition text;
BEGIN
  IF to_regclass('public.v_reservas_detalle') IS NOT NULL THEN
    SELECT pg_get_viewdef('public.v_reservas_detalle'::regclass, true)
      INTO view_definition;

    DROP VIEW public.v_reservas_detalle;
  END IF;

  ALTER TABLE public.familiares
    ALTER COLUMN parentesco TYPE TEXT
    USING parentesco::TEXT;

  ALTER TABLE public.familiares
    ALTER COLUMN parentesco SET NOT NULL;

  IF view_definition IS NOT NULL THEN
    EXECUTE 'CREATE VIEW public.v_reservas_detalle AS ' || view_definition;
  END IF;
END
$migration$;

NOTIFY pgrst, 'reload schema';

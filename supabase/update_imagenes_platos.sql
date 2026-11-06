-- ==============================================================================
-- Migración SQL: Configuración de recursos multimedia para la tabla platos
-- Archivo: update_imagenes_platos.sql
-- ==============================================================================

-- 1. Asegurar la existencia de la columna imagen_path con tipo TEXT (soporta longitudes arbitrarias)
ALTER TABLE public.platos
  ADD COLUMN IF NOT EXISTS imagen_path TEXT;

-- 2. Sentencias UPDATE para vincular cada plato con su recurso de imagen correspondiente
update platos set imagen_path = '01_silpancho.jpg' where id = 1;
update platos set imagen_path = '02_pique_macho.jpg' where id = 2;
update platos set imagen_path = '03_charque_kan.jpg' where id = 3;
update platos set imagen_path = '04_sopa_de_mani.jpg' where id = 4;
update platos set imagen_path = '05_chicharron.jpg' where id = 5;
update platos set imagen_path = '06_fricase.jpg' where id = 6;
update platos set imagen_path = '07_milanesa_de_soya.jpg' where id = 7;
update platos set imagen_path = '08_crema_de_quinua.jpg' where id = 8;
update platos set imagen_path = '09_locro_de_zapallo.jpg' where id = 9;
update platos set imagen_path = '10_aji_de_fideo_sin_carne.jpg' where id = 10;
update platos set imagen_path = '11_tortilla_de_verduras.jpg' where id = 11;

-- 3. Verificación de integridad de los registros actualizados
DO $$
DECLARE
  missing_count INT;
BEGIN
  SELECT count(*) INTO missing_count
  FROM public.platos
  WHERE id BETWEEN 1 AND 11 AND imagen_path IS NULL;

  IF missing_count > 0 THEN
    RAISE WARNING 'Advertencia: % platos con ID entre 1 y 11 no recibieron imagen_path.', missing_count;
  ELSE
    RAISE NOTICE 'Integridad validada con éxito: Los 11 platos poseen imagen_path configurado.';
  END IF;
END $$;

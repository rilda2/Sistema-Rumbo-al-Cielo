-- ==============================================================================
-- Migración Supabase: Soporte de Almuerzo Completo (Plato Principal + Sopa Boliviana)
-- Archivo: 20261023_almuerzo_completo_combo.sql
-- ==============================================================================

-- 1. Extensión de columnas en public.reservations (Esquema en inglés / principal)
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS dish_name TEXT,
  ADD COLUMN IF NOT EXISTS entrada_nombre TEXT,
  ADD COLUMN IF NOT EXISTS ensalada_nombre TEXT,
  ADD COLUMN IF NOT EXISTS plato_principal TEXT,
  ADD COLUMN IF NOT EXISTS sopa_nombre TEXT,
  ADD COLUMN IF NOT EXISTS es_almuerzo_completo BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS menu_category TEXT NOT NULL DEFAULT 'almuerzo_completo';

-- 2. Extensión de columnas en public.reservas (Esquema DDL relacional en español)
ALTER TABLE public.reservas
  ADD COLUMN IF NOT EXISTS dish_name TEXT,
  ADD COLUMN IF NOT EXISTS entrada_nombre TEXT,
  ADD COLUMN IF NOT EXISTS ensalada_nombre TEXT,
  ADD COLUMN IF NOT EXISTS plato_principal TEXT,
  ADD COLUMN IF NOT EXISTS sopa_nombre TEXT,
  ADD COLUMN IF NOT EXISTS es_almuerzo_completo BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS menu_category TEXT NOT NULL DEFAULT 'almuerzo_completo';

-- 3. Asegurar catálogo de Sopas de la Gastronomía Boliviana en platos_catalogo
INSERT INTO public.platos_catalogo (nombre, descripcion, categoria, region, precio, imagen_url)
VALUES
  ('Sopa de Maní Tradicional', 'Sopa cremosa tradicional a base de maní molido, costilla de res, verduras y papas al hilo.', 'Sopa', 'Cochabamba / Nacional', 18.00, 'assets/images/04_sopa_de_mani.jpg'),
  ('Chairo Paceño', 'Sopa andina sustanciosa con chuño machacado, chalona, carne de res, trigo pelado y hierbabuena.', 'Sopa', 'La Paz', 18.00, 'assets/images/08_crema_de_quinua.jpg'),
  ('Crema de Quinua Real', 'Crema nutritiva de quinua real andina con verduras frescas, queso criollo y un toque de cilantro.', 'Sopa', 'Potosí / Oruro', 18.00, 'assets/images/08_crema_de_quinua.jpg'),
  ('Locro de Gallina Tradicional', 'Caldo aromático del oriente boliviano con presa de gallina criolla, arroz graneado y yuca.', 'Sopa', 'Santa Cruz', 18.00, 'assets/images/09_locro_de_zapallo.jpg'),
  ('Caldo de Costilla Criollo', 'Reconfortante caldo cocinado a fuego lento con costilla jugosa de res, papas y verduras de la huerta.', 'Sopa', 'Nacional', 18.00, 'assets/images/04_sopa_de_mani.jpg')
ON CONFLICT (nombre) DO UPDATE SET
  categoria = EXCLUDED.categoria,
  descripcion = EXCLUDED.descripcion,
  region = EXCLUDED.region,
  imagen_url = EXCLUDED.imagen_url;

INSERT INTO public.platos_catalogo (nombre, descripcion, categoria, region, precio, imagen_url)
VALUES
  ('Ensalada Fresca del Día', 'Ensalada de hojas verdes, tomate, zanahoria y aderezo de la casa.', 'Entrada', 'Nacional', 18.00, NULL),
  ('Ensalada Rusa', 'Papa, zanahoria, arvejas y mayonesa casera.', 'Entrada', 'Nacional', 18.00, NULL)
ON CONFLICT (nombre) DO UPDATE SET
  categoria = EXCLUDED.categoria,
  descripcion = EXCLUDED.descripcion,
  region = EXCLUDED.region;

-- 4. Notificar a PostgREST para recarga en caliente del esquema
NOTIFY pgrst, 'reload schema';

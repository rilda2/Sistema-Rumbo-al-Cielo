-- ==============================================================================
-- Migración Supabase: Catálogo de Gastronomía Boliviana, Menú Semanal y Tarifas
-- Fecha: 17 de Octubre de 2026
-- ==============================================================================

-- 1. Tabla: Catálogo de Gastronomía Boliviana (platos_catalogo)
CREATE TABLE IF NOT EXISTS public.platos_catalogo (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre text NOT NULL UNIQUE CHECK (btrim(nombre) <> ''),
  descripcion text,
  categoria text NOT NULL DEFAULT 'Segundo', -- 'Entrada', 'Sopa', 'Segundo', 'Vegetariano', 'Especial', 'Postre'
  region text,                               -- 'Cochabamba', 'Santa Cruz', 'La Paz', 'Tarija', 'Chuquisaca', etc.
  precio numeric NOT NULL DEFAULT 18.00 CHECK (precio >= 0),
  imagen_url text,
  activo boolean NOT NULL DEFAULT true,
  creado_en timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT platos_catalogo_pkey PRIMARY KEY (id)
);

-- Habilitar RLS en platos_catalogo
ALTER TABLE public.platos_catalogo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de catálogo para usuarios autenticados"
  ON public.platos_catalogo FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Administradores y Cocina gestionan catálogo"
  ON public.platos_catalogo FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND rol IN ('ADMIN', 'COCINA', 'INSTITUCION', 'ENCARGADO')
    )
  );

-- 2. Semillas iniciales de Gastronomía Boliviana
INSERT INTO public.platos_catalogo (nombre, descripcion, categoria, region, precio, imagen_url)
VALUES
  ('Silpancho Cochabambino', 'Carne apanada tierna sobre arroz y papas doradas, con huevo frito y sarza criolla', 'Segundo', 'Cochabamba', 18.00, 'assets/silpancho.png'),
  ('Pique Macho Especial', 'Trozos de lomo de res, salchichas, papas fritas, huevo duro, cebolla, tomate y locoto', 'Segundo', 'Cochabamba', 18.00, 'assets/silpancho.png'),
  ('Majadito Cruceño con Huevo y Plátano', 'Arroz tostado con charque de res desmenuzado, plátano frito y huevo criollo', 'Segundo', 'Santa Cruz', 18.00, 'assets/silpancho.png'),
  ('Sopa de Maní Tradicional', 'Sopa cremosa a base de maní molido, costilla de res, verduras y papas al hilo', 'Sopa', 'Nacional', 18.00, 'assets/silpancho.png'),
  ('Falso Conejo', 'Carne molida apanada en ají amarillo con arvejas, servido con arroz y fideo tostado', 'Segundo', 'La Paz', 18.00, 'assets/silpancho.png'),
  ('Saice Tarijeño', 'Guiso tradicional de carne picada, ají colorado, arvejas, cebolla picada y chuchusmuti', 'Segundo', 'Tarija', 18.00, 'assets/silpancho.png'),
  ('Chairo Paceño', 'Sopa tradicional andina con chuño picado, chalona, carne de res, trigo pelado y papas', 'Sopa', 'La Paz', 18.00, 'assets/silpancho.png'),
  ('Picante Mixto', 'Combinación de pollo al ají amarillo y lengua de res con ají rojo, chuño phuti y ensalada', 'Segundo', 'Cochabamba / Chuquisaca', 18.00, 'assets/silpancho.png'),
  ('Mondongo Chuquisaqueño', 'Carne de cerdo en salsa de ají colorado acompañada de mote amarillo y papas', 'Segundo', 'Chuquisaca', 18.00, 'assets/silpancho.png'),
  ('Trucha del Titicaca al Limón', 'Filete de trucha fresca a la plancha, servida con guarnición de arroz y papas', 'Segundo', 'La Paz', 18.00, 'assets/silpancho.png'),
  ('Ají de Papalisa', 'Guiso aromático de papalisa con carne picada, ají colorado y huevo duro', 'Segundo', 'Potosí / Cochabamba', 18.00, 'assets/silpancho.png'),
  ('Pastel de Fideo Tradicional', 'Pastel horneado de fideos con queso criollo boliviano y huevo', 'Segundo', 'Nacional', 18.00, 'assets/silpancho.png')
ON CONFLICT (nombre) DO NOTHING;

-- 3. Tabla: Menú Semanal (menu_semanal)
CREATE TABLE IF NOT EXISTS public.menu_semanal (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  fecha date NOT NULL,
  dia_semana text NOT NULL, -- 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'
  plato_catalogo_id bigint NOT NULL,
  tipo_plato text NOT NULL DEFAULT 'Segundo', -- 'Entrada', 'Sopa', 'Segundo', 'Vegetariano', 'Especial', 'Postre'
  estado text NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'publicado')),
  creado_por uuid,
  creado_en timestamp with time zone NOT NULL DEFAULT now(),
  actualizado_en timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT menu_semanal_pkey PRIMARY KEY (id),
  CONSTRAINT menu_semanal_plato_catalogo_id_fkey FOREIGN KEY (plato_catalogo_id) REFERENCES public.platos_catalogo(id) ON DELETE CASCADE,
  CONSTRAINT menu_semanal_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES public.usuarios(id)
);

-- Índices para búsqueda rápida de menú
CREATE INDEX IF NOT EXISTS idx_menu_semanal_fecha ON public.menu_semanal(fecha);
CREATE INDEX IF NOT EXISTS idx_menu_semanal_estado ON public.menu_semanal(estado);

-- RLS para menu_semanal
ALTER TABLE public.menu_semanal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comensales pueden ver menú publicado"
  ON public.menu_semanal FOR SELECT
  TO authenticated
  USING (
    estado = 'publicado' OR
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND rol IN ('ADMIN', 'COCINA', 'INSTITUCION', 'ENCARGADO')
    )
  );

CREATE POLICY "Cocina y Admin gestionan menú semanal"
  ON public.menu_semanal FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND rol IN ('ADMIN', 'COCINA', 'INSTITUCION', 'ENCARGADO')
    )
  );

-- 4. Extensión de Reglas de Tarifas y Reservas
-- Tarifas del Sistema:
-- - 15 Bs para comensales bajo Plan Mensual
-- - 18 Bs para comensales particulares / sin plan mensual
INSERT INTO public.tarifas (tipo, consumidor, precio, vigente_desde)
VALUES
  ('MENSUAL', 'EMPLEADO', 15.00, '2025-01-01'),
  ('DIARIO', 'EMPLEADO', 18.00, '2025-01-01'),
  ('MENSUAL', 'FAMILIAR', 15.00, '2025-01-01'),
  ('DIARIO', 'FAMILIAR', 18.00, '2025-01-01')
ON CONFLICT DO NOTHING;

-- Asegurar columnas en public.reservas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reservas' AND column_name = 'tipo_tarifa'
  ) THEN
    ALTER TABLE public.reservas ADD COLUMN tipo_tarifa text NOT NULL DEFAULT 'PARTICULAR' CHECK (tipo_tarifa IN ('PLAN_MENSUAL', 'PARTICULAR'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reservas' AND column_name = 'notas'
  ) THEN
    ALTER TABLE public.reservas ADD COLUMN notas text;
  END IF;
END $$;

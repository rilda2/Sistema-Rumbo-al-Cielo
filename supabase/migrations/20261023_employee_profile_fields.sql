-- Campos adicionales del padrón de empleados usados por la aplicación.
ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS departamento TEXT NOT NULL DEFAULT 'Administración General',
  ADD COLUMN IF NOT EXISTS has_monthly_plan BOOLEAN NOT NULL DEFAULT true;

-- Fuerza a PostgREST a reconocer las columnas nuevas inmediatamente.
NOTIFY pgrst, 'reload schema';

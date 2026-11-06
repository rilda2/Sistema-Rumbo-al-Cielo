-- Sincroniza cuentas ya creadas en Supabase Auth con public.profiles.
-- Ejecutar en el SQL Editor con permisos de propietario/service_role.
-- No crea contraseñas ni cuentas nuevas: solo hace visibles las cuentas
-- existentes para la aplicación.

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT 'Empleado',
  role TEXT NOT NULL DEFAULT 'empleado',
  department TEXT NOT NULL DEFAULT 'Administración Central',
  is_pensioner BOOLEAN NOT NULL DEFAULT false,
  monthly_expense NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios ven sus propios perfiles" ON public.profiles;
CREATE POLICY "Usuarios ven sus propios perfiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuarios actualizan sus propios perfiles" ON public.profiles;
CREATE POLICY "Usuarios actualizan sus propios perfiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

INSERT INTO public.profiles (id, email, full_name, role)
SELECT
  u.id,
  lower(u.email),
  COALESCE(
    NULLIF(u.raw_user_meta_data->>'full_name', ''),
    split_part(u.email, '@', 1)
  ),
  CASE lower(COALESCE(u.raw_user_meta_data->>'role', 'empleado'))
    WHEN 'admin' THEN 'institucion'
    WHEN 'administrador' THEN 'institucion'
    WHEN 'institucion' THEN 'institucion'
    WHEN 'cocina' THEN 'encargado'
    WHEN 'encargado' THEN 'encargado'
    ELSE 'empleado'
  END
FROM auth.users AS u
WHERE u.email IS NOT NULL
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    lower(NEW.email),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), 'Empleado'),
    CASE lower(COALESCE(NEW.raw_user_meta_data->>'role', 'empleado'))
      WHEN 'admin' THEN 'institucion'
      WHEN 'administrador' THEN 'institucion'
      WHEN 'institucion' THEN 'institucion'
      WHEN 'cocina' THEN 'encargado'
      WHEN 'encargado' THEN 'encargado'
      ELSE 'empleado'
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_profile();

NOTIFY pgrst, 'reload schema';

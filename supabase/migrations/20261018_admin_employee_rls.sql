-- Permite que administradores autenticados registren empleados y familiares.
-- Los empleados gestionados por RR. HH. no necesitan una cuenta de auth.users
-- para existir en el padrón institucional.

ALTER TABLE public.usuarios
  DROP CONSTRAINT IF EXISTS usuarios_id_fkey;

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.familiares ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin_actor()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.usuarios
    WHERE id = auth.uid()
      AND rol IN ('ADMINISTRADOR', 'ENCARGADO', 'INSTITUCION')
      AND activo = true
  );
$$;

DROP POLICY IF EXISTS "Administradores pueden consultar usuarios" ON public.usuarios;
CREATE POLICY "Administradores pueden consultar usuarios"
  ON public.usuarios
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR public.is_admin_actor()
  );

DROP POLICY IF EXISTS "Administradores pueden registrar usuarios" ON public.usuarios;
CREATE POLICY "Administradores pueden registrar usuarios"
  ON public.usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin_actor()
  );

DROP POLICY IF EXISTS "Administradores pueden actualizar usuarios" ON public.usuarios;
CREATE POLICY "Administradores pueden actualizar usuarios"
  ON public.usuarios
  FOR UPDATE
  TO authenticated
  USING (
    public.is_admin_actor()
  )
  WITH CHECK (true);

DROP POLICY IF EXISTS "Administradores pueden consultar familiares" ON public.familiares;
CREATE POLICY "Administradores pueden consultar familiares"
  ON public.familiares
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin_actor()
  );

DROP POLICY IF EXISTS "Administradores pueden registrar familiares" ON public.familiares;
CREATE POLICY "Administradores pueden registrar familiares"
  ON public.familiares
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin_actor()
  );

DROP POLICY IF EXISTS "Administradores pueden actualizar familiares" ON public.familiares;
CREATE POLICY "Administradores pueden actualizar familiares"
  ON public.familiares
  FOR UPDATE
  TO authenticated
  USING (
    public.is_admin_actor()
  )
  WITH CHECK (true);

DROP POLICY IF EXISTS "Administradores pueden eliminar familiares" ON public.familiares;
CREATE POLICY "Administradores pueden eliminar familiares"
  ON public.familiares
  FOR DELETE
  TO authenticated
  USING (
    public.is_admin_actor()
  );

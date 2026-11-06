-- Permite que el administrador autenticado gestione el padrón aunque su
-- identidad esté registrada en profiles y no en usuarios.
CREATE OR REPLACE FUNCTION public.is_admin_actor()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_in_usuarios boolean;
  admin_in_profiles boolean := false;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.usuarios
    WHERE id = auth.uid()
      AND rol::text IN ('ADMINISTRADOR', 'ENCARGADO', 'INSTITUCION')
      AND activo = true
  ) INTO admin_in_usuarios;

  IF to_regclass('public.profiles') IS NOT NULL THEN
    EXECUTE $query$
      SELECT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = $1
          AND lower(role) IN ('admin', 'administrador', 'encargado', 'institucion')
      )
    $query$
    INTO admin_in_profiles
    USING auth.uid();
  END IF;

  RETURN admin_in_usuarios OR admin_in_profiles;
END;
$$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.usuarios TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.familiares TO authenticated;

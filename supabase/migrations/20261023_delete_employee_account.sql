-- Elimina completamente una cuenta gestionada por administración.
-- La operación se ejecuta en Supabase porque el cliente Flutter no puede
-- administrar auth.users usando la clave pública.
CREATE OR REPLACE FUNCTION public.delete_employee_account(p_employee_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT public.is_admin_actor() THEN
    RAISE EXCEPTION 'Solo un administrador puede eliminar empleados';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.usuarios
    WHERE id = p_employee_id
      AND upper(coalesce(rol::text, '')) NOT IN (
        'ADMIN', 'ADMINISTRADOR', 'INSTITUCION', 'ENCARGADO', 'COCINA'
      )
  ) THEN
    RAISE EXCEPTION 'El empleado no existe o no puede ser eliminado';
  END IF;

  DELETE FROM public.familiares WHERE empleado_id = p_employee_id;

  IF to_regclass('public.reservas') IS NOT NULL THEN
    EXECUTE 'DELETE FROM public.reservas WHERE empleado_id = $1'
      USING p_employee_id;
  END IF;
  IF to_regclass('public.reservations') IS NOT NULL THEN
    EXECUTE 'DELETE FROM public.reservations WHERE user_id = $1'
      USING p_employee_id;
  END IF;
  IF to_regclass('public.suscripciones') IS NOT NULL THEN
    EXECUTE 'DELETE FROM public.suscripciones WHERE empleado_id = $1'
      USING p_employee_id;
  END IF;
  IF to_regclass('public.monthly_subscriptions') IS NOT NULL THEN
    EXECUTE 'DELETE FROM public.monthly_subscriptions WHERE user_id = $1'
      USING p_employee_id;
  END IF;

  DELETE FROM public.usuarios WHERE id = p_employee_id;
  IF to_regclass('public.profiles') IS NOT NULL THEN
    EXECUTE 'DELETE FROM public.profiles WHERE id = $1'
      USING p_employee_id;
  END IF;
  DELETE FROM auth.users WHERE id = p_employee_id;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_employee_account(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_employee_account(UUID) TO authenticated;

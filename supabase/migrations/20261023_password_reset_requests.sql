-- Solicitudes de reinicio atendidas por administradores desde la aplicación.
CREATE TABLE IF NOT EXISTS public.password_reset_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (status IN ('pendiente', 'atendida', 'rechazada')),
  handled_by UUID REFERENCES auth.users(id),
  handled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.password_reset_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cualquiera puede solicitar reinicio" ON public.password_reset_requests;
CREATE POLICY "Cualquiera puede solicitar reinicio"
  ON public.password_reset_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (length(trim(email)) > 3);

DROP POLICY IF EXISTS "Administradores gestionan solicitudes de reinicio" ON public.password_reset_requests;
CREATE POLICY "Administradores gestionan solicitudes de reinicio"
  ON public.password_reset_requests FOR ALL
  TO authenticated
  USING (public.is_admin_actor())
  WITH CHECK (public.is_admin_actor());

GRANT INSERT ON public.password_reset_requests TO anon, authenticated;
GRANT SELECT, UPDATE ON public.password_reset_requests TO authenticated;

CREATE INDEX IF NOT EXISTS idx_password_reset_requests_status_created
  ON public.password_reset_requests(status, created_at DESC);

NOTIFY pgrst, 'reload schema';

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.attend_password_reset_request(
  p_request_id UUID,
  p_new_password TEXT DEFAULT '123456'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  request_email TEXT;
  target_user_id UUID;
BEGIN
  IF NOT public.is_admin_actor() THEN
    RAISE EXCEPTION 'Solo un administrador puede atender solicitudes';
  END IF;
  IF length(coalesce(trim(p_new_password), '')) < 6 THEN
    RAISE EXCEPTION 'La contraseña debe tener al menos 6 caracteres';
  END IF;

  SELECT email INTO request_email
  FROM public.password_reset_requests
  WHERE id = p_request_id AND status = 'pendiente'
  FOR UPDATE;
  IF request_email IS NULL THEN
    RAISE EXCEPTION 'La solicitud no existe o ya fue atendida';
  END IF;

  SELECT id INTO target_user_id
  FROM auth.users
  WHERE lower(email) = lower(trim(request_email))
  LIMIT 1;
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'No existe una cuenta Auth para ese correo';
  END IF;

  UPDATE auth.users
  SET encrypted_password = crypt(p_new_password, gen_salt('bf')),
      updated_at = now()
  WHERE id = target_user_id;

  UPDATE public.password_reset_requests
  SET status = 'atendida',
      handled_by = auth.uid(),
      handled_at = now()
  WHERE id = p_request_id;
END;
$$;

REVOKE ALL ON FUNCTION public.attend_password_reset_request(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.attend_password_reset_request(UUID, TEXT) TO authenticated;

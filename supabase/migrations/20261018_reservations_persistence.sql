-- Permite guardar reservas individuales y conjuntas desde la aplicación.
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS familiar_id TEXT,
  ADD COLUMN IF NOT EXISTS beneficiary_name TEXT NOT NULL DEFAULT 'Empleado',
  ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2) NOT NULL DEFAULT 18.00;

ALTER TABLE public.reservations
  DROP CONSTRAINT IF EXISTS unique_user_reservation_per_day;

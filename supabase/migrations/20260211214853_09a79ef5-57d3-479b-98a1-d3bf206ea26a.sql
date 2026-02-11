
-- 1. Drop the public "Anyone can view appointments" policy
DROP POLICY IF EXISTS "Anyone can view appointments" ON appointments;

-- 2. Create a policy so only admins can view all appointments
CREATE POLICY "Admins can view appointments"
ON appointments FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- 3. Create a secure RPC function to check slot availability
-- This function returns only date, time, and barber_id (no customer data)
CREATE OR REPLACE FUNCTION public.get_booked_slots(p_barber_id uuid, p_service_duration integer)
RETURNS TABLE(appointment_date date, appointment_time time, barber_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    a.appointment_date,
    a.appointment_time,
    a.barber_id
  FROM appointments a
  WHERE a.barber_id = p_barber_id
    AND a.status != 'cancelled'
  ORDER BY a.appointment_date, a.appointment_time;
$$;

-- 4. Grant execute permission to anon (public) users
GRANT EXECUTE ON FUNCTION public.get_booked_slots(uuid, integer) TO anon;

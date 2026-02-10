
-- Drop the overly permissive insert policy
DROP POLICY "Anyone can create appointments" ON public.appointments;

-- Create a more scoped insert policy: anyone can insert but only with pending status
CREATE POLICY "Public can create pending appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (status = 'pending');

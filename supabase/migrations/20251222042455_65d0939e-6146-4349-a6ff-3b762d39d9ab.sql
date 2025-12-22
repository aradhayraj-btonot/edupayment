-- Allow admins to verify (update) payments
-- Existing policy allows admins SELECT only, which causes approve/reject to affect 0 rows.

CREATE POLICY "Admins can update payments"
ON public.payments
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

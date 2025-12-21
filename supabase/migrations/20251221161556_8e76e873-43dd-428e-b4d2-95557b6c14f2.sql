-- Create storage bucket for payment screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-screenshots', 'payment-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for payment screenshots
CREATE POLICY "Authenticated users can upload screenshots"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payment-screenshots');

CREATE POLICY "Anyone can view payment screenshots"
ON storage.objects
FOR SELECT
USING (bucket_id = 'payment-screenshots');

CREATE POLICY "Users can update own uploads"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'payment-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can delete payment screenshots"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'payment-screenshots' AND public.has_role(auth.uid(), 'admin'));

-- Add screenshot_url column to payments table for storing proof of payment
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS screenshot_url TEXT;
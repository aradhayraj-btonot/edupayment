-- Create storage bucket for school assets (QR codes, logos)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('school-assets', 'school-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for public read access
CREATE POLICY "School assets are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'school-assets');

-- Create policy for admin upload access
CREATE POLICY "Admins can upload school assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'school-assets' AND public.has_role(auth.uid(), 'admin'));

-- Create policy for admin update access
CREATE POLICY "Admins can update school assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'school-assets' AND public.has_role(auth.uid(), 'admin'));

-- Create policy for admin delete access
CREATE POLICY "Admins can delete school assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'school-assets' AND public.has_role(auth.uid(), 'admin'));
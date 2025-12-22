-- Make the payment-screenshots bucket private
UPDATE storage.buckets SET public = false WHERE id = 'payment-screenshots';

-- Drop the existing public SELECT policy
DROP POLICY IF EXISTS "Anyone can view payment screenshots" ON storage.objects;

-- Create a new policy that only allows authenticated users who are the owner or admin to view screenshots
CREATE POLICY "Owners and admins can view payment screenshots"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-screenshots' 
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR public.has_role(auth.uid(), 'admin')
  )
);
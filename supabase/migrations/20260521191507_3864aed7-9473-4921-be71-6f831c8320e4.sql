
-- 1. Restrict payment-screenshots uploads to the user's own folder
DROP POLICY IF EXISTS "Authenticated users can upload screenshots" ON storage.objects;

CREATE POLICY "Users can upload screenshots to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-screenshots'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. Fix blog_poll_votes INSERT to be null-safe and require an identifier
DROP POLICY IF EXISTS "One vote per poll per user or IP" ON public.blog_poll_votes;

CREATE POLICY "One vote per poll per identity"
ON public.blog_poll_votes FOR INSERT
WITH CHECK (
  -- Authenticated voters must use their own auth.uid()
  (
    auth.uid() IS NOT NULL
    AND voter_id = auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM public.blog_poll_votes bpv
      WHERE bpv.poll_id = blog_poll_votes.poll_id
        AND bpv.voter_id = auth.uid()
    )
  )
  OR
  -- Anonymous voters must supply a non-null voter_ip and not have voted yet (null-safe)
  (
    auth.uid() IS NULL
    AND voter_ip IS NOT NULL
    AND length(voter_ip) > 0
    AND NOT EXISTS (
      SELECT 1 FROM public.blog_poll_votes bpv
      WHERE bpv.poll_id = blog_poll_votes.poll_id
        AND bpv.voter_ip IS NOT DISTINCT FROM blog_poll_votes.voter_ip
    )
  )
);

-- 3. Hide Razorpay payment gateway IDs from non-service callers (column-level)
REVOKE SELECT (razorpay_payment_id, razorpay_subscription_id)
  ON public.school_subscriptions FROM anon, authenticated;

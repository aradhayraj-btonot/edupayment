
-- Fix security definer view
ALTER VIEW public.blog_poll_vote_counts SET (security_invoker = on);

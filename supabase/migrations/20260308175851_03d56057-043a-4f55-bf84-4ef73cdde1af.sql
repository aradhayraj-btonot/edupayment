
-- Add category and tags columns to blog_posts
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS category text DEFAULT 'general';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Add view_count for analytics
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;

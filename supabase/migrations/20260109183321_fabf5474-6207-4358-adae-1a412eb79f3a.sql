-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content JSONB NOT NULL DEFAULT '[]',
  cover_image_url TEXT,
  author_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMP WITH TIME ZONE,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blog_polls table for embedded polls
CREATE TABLE public.blog_polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blog_poll_votes table
CREATE TABLE public.blog_poll_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.blog_polls(id) ON DELETE CASCADE,
  option_index INTEGER NOT NULL,
  voter_id UUID,
  voter_ip TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(poll_id, voter_id),
  UNIQUE(poll_id, voter_ip)
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_poll_votes ENABLE ROW LEVEL SECURITY;

-- Blog posts policies
CREATE POLICY "Anyone can view published blog posts"
ON public.blog_posts FOR SELECT
USING (status = 'published');

CREATE POLICY "Team can view all blog posts"
ON public.blog_posts FOR SELECT
USING (has_team_role(auth.uid()));

CREATE POLICY "Team can manage blog posts"
ON public.blog_posts FOR ALL
USING (has_team_role(auth.uid()))
WITH CHECK (has_team_role(auth.uid()));

-- Blog polls policies
CREATE POLICY "Anyone can view polls"
ON public.blog_polls FOR SELECT
USING (true);

CREATE POLICY "Team can manage polls"
ON public.blog_polls FOR ALL
USING (has_team_role(auth.uid()))
WITH CHECK (has_team_role(auth.uid()));

-- Poll votes policies
CREATE POLICY "Anyone can view vote counts"
ON public.blog_poll_votes FOR SELECT
USING (true);

CREATE POLICY "Anyone can vote once"
ON public.blog_poll_votes FOR INSERT
WITH CHECK (true);

-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true);

-- Storage policies for blog images
CREATE POLICY "Anyone can view blog images"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

CREATE POLICY "Team can upload blog images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'blog-images' AND has_team_role(auth.uid()));

CREATE POLICY "Team can update blog images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'blog-images' AND has_team_role(auth.uid()));

CREATE POLICY "Team can delete blog images"
ON storage.objects FOR DELETE
USING (bucket_id = 'blog-images' AND has_team_role(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();
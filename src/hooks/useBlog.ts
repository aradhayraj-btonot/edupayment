import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BlogBlock {
  id: string;
  type: 'paragraph' | 'heading' | 'image' | 'poll' | 'table';
  content?: string;
  level?: number; // for headings
  src?: string; // for images
  alt?: string; // for images
  pollId?: string; // for polls
  rows?: string[][]; // for tables
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: BlogBlock[];
  cover_image_url: string | null;
  author_id: string;
  status: 'draft' | 'published';
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPoll {
  id: string;
  post_id: string | null;
  question: string;
  options: { text: string; votes: number }[];
  created_at: string;
}

export function useBlogPosts(status?: 'draft' | 'published') {
  return useQuery({
    queryKey: ['blog-posts', status],
    queryFn: async () => {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as unknown) as BlogPost[];
    },
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return (data as unknown) as BlogPost;
    },
    enabled: !!slug,
  });
}

export function useBlogPolls(postId?: string) {
  return useQuery({
    queryKey: ['blog-polls', postId],
    queryFn: async () => {
      let query = supabase.from('blog_polls').select('*');
      if (postId) {
        query = query.eq('post_id', postId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as BlogPoll[];
    },
  });
}

export function useBlogMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const generateSEO = (title: string, content: BlogBlock[]) => {
    // Extract text content for description
    const textBlocks = content
      .filter((b) => b.type === 'paragraph' || b.type === 'heading')
      .map((b) => b.content || '')
      .join(' ');

    const excerpt = textBlocks.slice(0, 160).trim();
    const metaDescription = textBlocks.slice(0, 155).trim() + (textBlocks.length > 155 ? '...' : '');

    // Extract keywords from title and first paragraphs
    const words = (title + ' ' + textBlocks.slice(0, 500))
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 4)
      .filter((w, i, arr) => arr.indexOf(w) === i)
      .slice(0, 10);

    return {
      excerpt,
      meta_title: title.slice(0, 60),
      meta_description: metaDescription,
      meta_keywords: words,
    };
  };

  const createPost = useMutation({
    mutationFn: async (data: {
      title: string;
      content: BlogBlock[];
      cover_image_url?: string;
      author_id: string;
    }) => {
      const slug = generateSlug(data.title) + '-' + Date.now().toString(36);
      const seo = generateSEO(data.title, data.content);

      const { data: post, error } = await supabase
        .from('blog_posts')
        .insert([{
          title: data.title,
          slug,
          content: JSON.parse(JSON.stringify(data.content)),
          cover_image_url: data.cover_image_url || null,
          author_id: data.author_id,
          status: 'draft' as const,
          excerpt: seo.excerpt,
          meta_title: seo.meta_title,
          meta_description: seo.meta_description,
          meta_keywords: seo.meta_keywords,
        }])
        .select()
        .single();

      if (error) throw error;
      return post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast({ title: 'Draft saved', description: 'Your blog post has been saved as a draft.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updatePost = useMutation({
    mutationFn: async (data: {
      id: string;
      title?: string;
      content?: BlogBlock[];
      cover_image_url?: string;
      status?: 'draft' | 'published';
    }) => {
      const updates: Record<string, unknown> = {};

      if (data.title) {
        updates.title = data.title;
      }
      if (data.content) {
        updates.content = JSON.parse(JSON.stringify(data.content));
        const seo = generateSEO(data.title || '', data.content);
        Object.assign(updates, seo);
      }
      if (data.cover_image_url !== undefined) {
        updates.cover_image_url = data.cover_image_url;
      }
      if (data.status) {
        updates.status = data.status;
        if (data.status === 'published') {
          updates.published_at = new Date().toISOString();
        }
      }

      const { data: post, error } = await supabase
        .from('blog_posts')
        .update(updates)
        .eq('id', data.id)
        .select()
        .single();

      if (error) throw error;
      return post;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      if (variables.status === 'published') {
        toast({ title: 'Published!', description: 'Your blog post is now live.' });
      } else {
        toast({ title: 'Saved', description: 'Changes saved successfully.' });
      }
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deletePost = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast({ title: 'Deleted', description: 'Blog post has been deleted.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const createPoll = useMutation({
    mutationFn: async (data: { question: string; options: string[]; postId?: string }) => {
      const { data: poll, error } = await supabase
        .from('blog_polls')
        .insert({
          question: data.question,
          options: data.options.map((text) => ({ text, votes: 0 })),
          post_id: data.postId || null,
        })
        .select()
        .single();

      if (error) throw error;
      return poll;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-polls'] });
    },
  });

  const votePoll = useMutation({
    mutationFn: async (data: { pollId: string; optionIndex: number }) => {
      // Get current user or use IP-based voting
      const { data: userData } = await supabase.auth.getUser();

      const { error } = await supabase.from('blog_poll_votes').insert({
        poll_id: data.pollId,
        option_index: data.optionIndex,
        voter_id: userData?.user?.id || null,
        voter_ip: null, // Will be null for logged-in users
      });

      if (error) {
        if (error.code === '23505') {
          throw new Error('You have already voted in this poll');
        }
        throw error;
      }

      // Update the poll options count
      const { data: votes } = await supabase
        .from('blog_poll_votes')
        .select('option_index')
        .eq('poll_id', data.pollId);

      const voteCounts: Record<number, number> = {};
      votes?.forEach((v) => {
        voteCounts[v.option_index] = (voteCounts[v.option_index] || 0) + 1;
      });

      return voteCounts;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-polls'] });
    },
    onError: (error) => {
      toast({ title: 'Vote failed', description: error.message, variant: 'destructive' });
    },
  });

  return {
    createPost,
    updatePost,
    deletePost,
    createPoll,
    votePoll,
    generateSlug,
    generateSEO,
  };
}

export async function uploadBlogImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error } = await supabase.storage
    .from('blog-images')
    .upload(fileName, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from('blog-images')
    .getPublicUrl(fileName);

  return data.publicUrl;
}

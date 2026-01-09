import { useParams, Link } from 'react-router-dom';
import { useBlogPost } from '@/hooks/useBlog';
import { BlogRenderer } from '@/components/blog/BlogRenderer';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/hooks/use-toast';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = useBlogPost(slug || '');
  const { toast } = useToast();

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.meta_description || '',
          url,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copied', description: 'Blog post URL copied to clipboard' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-12">
          <div className="max-w-3xl mx-auto space-y-6">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="aspect-video rounded-lg" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <div className="space-y-4 mt-8">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-12">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Post not found</h1>
            <p className="text-muted-foreground mb-6">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/blog">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const readingTime = Math.ceil(JSON.stringify(post.content).length / 1000);

  // JSON-LD structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.meta_description,
    image: post.cover_image_url,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Organization',
      name: 'EduPay',
    },
    publisher: {
      '@type': 'Organization',
      name: 'EduPay',
      logo: {
        '@type': 'ImageObject',
        url: `${window.location.origin}/favicon.ico`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': window.location.href,
    },
  };

  return (
    <>
      <Helmet>
        <title>{post.meta_title || post.title} | EduPay Blog</title>
        <meta name="description" content={post.meta_description || post.excerpt || ''} />
        {post.meta_keywords && (
          <meta name="keywords" content={post.meta_keywords.join(', ')} />
        )}
        <link rel="canonical" href={window.location.href} />

        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.meta_description || post.excerpt || ''} />
        {post.cover_image_url && <meta property="og:image" content={post.cover_image_url} />}
        <meta property="og:url" content={window.location.href} />
        <meta property="article:published_time" content={post.published_at || ''} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.meta_description || post.excerpt || ''} />
        {post.cover_image_url && <meta name="twitter:image" content={post.cover_image_url} />}

        {/* JSON-LD */}
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <article className="container py-12">
            <div className="max-w-3xl mx-auto">
              {/* Back link */}
              <Link to="/blog" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Link>

              {/* Cover image */}
              {post.cover_image_url && (
                <div className="aspect-video rounded-lg overflow-hidden mb-8">
                  <img
                    src={post.cover_image_url}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Title and meta */}
              <header className="mb-8">
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  {post.meta_keywords?.slice(0, 3).map((keyword) => (
                    <Badge key={keyword} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
                <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
                <div className="flex items-center gap-6 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(post.published_at || post.created_at), 'MMMM d, yyyy')}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {readingTime} min read
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </header>

              {/* Content */}
              <BlogRenderer content={post.content} postId={post.id} />
            </div>
          </article>
        </main>
        <Footer />
      </div>
    </>
  );
}

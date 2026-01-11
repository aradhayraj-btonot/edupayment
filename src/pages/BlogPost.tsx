import { useParams, Link } from 'react-router-dom';
import { useBlogPost } from '@/hooks/useBlog';
import { BlogRenderer } from '@/components/blog/BlogRenderer';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, Share2, User } from 'lucide-react';
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
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1">
          <div className="container max-w-4xl py-8 md:py-16">
            <Skeleton className="h-6 w-32 mb-8" />
            <Skeleton className="aspect-[2/1] rounded-2xl mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <div className="flex gap-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
            <div className="mt-12 space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="container max-w-md text-center py-20">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <ArrowLeft className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Post not found</h1>
            <p className="text-muted-foreground mb-8">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/blog">
              <Button size="lg">
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

      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1">
          <article>
            {/* Hero Section with Cover Image */}
            {post.cover_image_url && (
              <div className="relative w-full aspect-[3/1] md:aspect-[3/1] bg-muted overflow-hidden">
                <img
                  src={post.cover_image_url}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              </div>
            )}

            <div className="container max-w-4xl py-8 md:py-12">
              {/* Back Link */}
              <Link 
                to="/blog" 
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Blog
              </Link>

              {/* Article Header */}
              <header className="mb-10">
                {/* Keywords */}
                {post.meta_keywords && post.meta_keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.meta_keywords.slice(0, 3).map((keyword) => (
                      <Badge key={keyword} variant="secondary" className="rounded-full">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Title */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                  {post.title}
                </h1>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-primary/10">
                      <User className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span>EduPay Team</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <time dateTime={post.published_at || post.created_at}>
                      {format(new Date(post.published_at || post.created_at), 'MMMM d, yyyy')}
                    </time>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{readingTime} min read</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleShare}
                    className="gap-2 ml-auto"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              </header>

              {/* Excerpt/Lead */}
              {post.excerpt && (
                <p className="text-xl text-muted-foreground leading-relaxed mb-10 border-l-4 border-primary pl-6">
                  {post.excerpt}
                </p>
              )}

              {/* Article Content */}
              <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed prose-img:rounded-xl">
                <BlogRenderer content={post.content} postId={post.id} />
              </div>

              {/* Article Footer */}
              <footer className="mt-16 pt-8 border-t">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Published on {format(new Date(post.published_at || post.created_at), 'MMMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={handleShare} className="gap-2">
                      <Share2 className="h-4 w-4" />
                      Share this article
                    </Button>
                    <Link to="/blog">
                      <Button variant="ghost" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        More articles
                      </Button>
                    </Link>
                  </div>
                </div>
              </footer>
            </div>
          </article>
        </main>
        <Footer />
      </div>
    </>
  );
}

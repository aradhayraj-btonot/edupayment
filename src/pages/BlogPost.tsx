import { useParams, Link } from 'react-router-dom';
import { useBlogPost, useBlogPosts } from '@/hooks/useBlog';
import { BlogRenderer } from '@/components/blog/BlogRenderer';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  User,
  ChevronRight,
  Tag,
} from 'lucide-react';
import { format } from 'date-fns';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/hooks/use-toast';
import { BlogPostCard } from '@/components/blog/BlogPostCard';
import { motion } from 'framer-motion';

const categoryLabels: Record<string, string> = {
  general: 'General',
  'school-management': 'School Management',
  'payment-solutions': 'Payment Solutions',
  'education-technology': 'EdTech',
  'tips-and-guides': 'Tips & Guides',
  'product-updates': 'Product Updates',
};

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = useBlogPost(slug || '');
  const { data: allPosts } = useBlogPosts('published');
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
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copied', description: 'Blog post URL copied to clipboard' });
    }
  };

  // Related posts: same category, excluding current
  const relatedPosts =
    allPosts
      ?.filter((p) => p.id !== post?.id && p.category === post?.category)
      .slice(0, 3) || [];

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
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
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
    keywords: post.meta_keywords?.join(', '),
    articleSection: post.category || 'general',
    wordCount: JSON.stringify(post.content).split(/\s+/).length,
  };

  // BreadcrumbList structured data
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: window.location.origin },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${window.location.origin}/blog`,
      },
      { '@type': 'ListItem', position: 3, name: post.title },
    ],
  };

  return (
    <>
      <Helmet>
        <title>{post.meta_title || post.title} | EduPay Blog</title>
        <meta name="description" content={post.meta_description || post.excerpt || ''} />
        {post.meta_keywords && (
          <meta name="keywords" content={post.meta_keywords.join(', ')} />
        )}
        <link rel="canonical" href={`${window.location.origin}/blog/${post.slug}`} />

        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta
          property="og:description"
          content={post.meta_description || post.excerpt || ''}
        />
        {post.cover_image_url && (
          <meta property="og:image" content={post.cover_image_url} />
        )}
        <meta property="og:url" content={`${window.location.origin}/blog/${post.slug}`} />
        <meta property="article:published_time" content={post.published_at || ''} />
        <meta property="article:section" content={post.category || 'general'} />
        {post.tags?.map((tag) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta
          name="twitter:description"
          content={post.meta_description || post.excerpt || ''}
        />
        {post.cover_image_url && (
          <meta name="twitter:image" content={post.cover_image_url} />
        )}

        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbData)}</script>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1">
          <article>
            {/* Cover Image */}
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
              {/* Breadcrumbs */}
              <nav
                aria-label="Breadcrumb"
                className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8"
              >
                <Link to="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <Link to="/blog" className="hover:text-foreground transition-colors">
                  Blog
                </Link>
                {post.category && (
                  <>
                    <ChevronRight className="h-3.5 w-3.5" />
                    <span className="text-foreground">
                      {categoryLabels[post.category] || post.category}
                    </span>
                  </>
                )}
              </nav>

              {/* Header */}
              <motion.header
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-10"
              >
                {/* Category & Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.category && (
                    <Badge variant="default" className="rounded-full">
                      {categoryLabels[post.category] || post.category}
                    </Badge>
                  )}
                  {post.tags?.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="rounded-full">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                  {post.title}
                </h1>

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
                      {format(
                        new Date(post.published_at || post.created_at),
                        'MMMM d, yyyy'
                      )}
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
              </motion.header>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-xl text-muted-foreground leading-relaxed mb-10 border-l-4 border-primary pl-6">
                  {post.excerpt}
                </p>
              )}

              {/* Content */}
              <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed prose-img:rounded-xl">
                <BlogRenderer content={post.content} postId={post.id} />
              </div>

              {/* Footer */}
              <footer className="mt-16 pt-8 border-t">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Published on{' '}
                      {format(
                        new Date(post.published_at || post.created_at),
                        'MMMM d, yyyy'
                      )}
                    </p>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs rounded-full">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={handleShare} className="gap-2">
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                    <Link to="/blog">
                      <Button variant="ghost" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        All articles
                      </Button>
                    </Link>
                  </div>
                </div>
              </footer>
            </div>
          </article>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="border-t bg-muted/30">
              <div className="container py-16">
                <h2 className="text-2xl font-bold mb-8 text-center">Related Articles</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {relatedPosts.map((p) => (
                    <BlogPostCard key={p.id} post={p} />
                  ))}
                </div>
              </div>
            </section>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}

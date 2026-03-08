import { useState, useMemo } from 'react';
import { useBlogPosts, BLOG_CATEGORIES } from '@/hooks/useBlog';
import { BlogPostCard } from '@/components/blog/BlogPostCard';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { Helmet } from 'react-helmet-async';
import { BookOpen, Search, Tag, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const categoryLabels: Record<string, string> = {
  general: 'General',
  'school-management': 'School Management',
  'payment-solutions': 'Payment Solutions',
  'education-technology': 'EdTech',
  'tips-and-guides': 'Tips & Guides',
  'product-updates': 'Product Updates',
};

export default function Blog() {
  const { data: posts, isLoading } = useBlogPosts('published');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    let filtered = posts;
    if (activeCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.excerpt && p.excerpt.toLowerCase().includes(q)) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }
    return filtered;
  }, [posts, search, activeCategory]);

  const featuredPost = filteredPosts[0];
  const remainingPosts = filteredPosts.slice(1);

  // Collect all unique tags
  const allTags = useMemo(() => {
    if (!posts) return [];
    const tags = new Set<string>();
    posts.forEach((p) => p.tags?.forEach((t) => tags.add(t)));
    return Array.from(tags).slice(0, 12);
  }, [posts]);

  // JSON-LD for blog listing
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'EduPay Blog',
    description:
      'Expert insights on school fee management, education technology, and payment solutions.',
    url: `${window.location.origin}/blog`,
    publisher: {
      '@type': 'Organization',
      name: 'EduPay',
      logo: { '@type': 'ImageObject', url: `${window.location.origin}/favicon.ico` },
    },
  };

  return (
    <>
      <Helmet>
        <title>EduPay Blog — School Fee Management Insights & EdTech Tips</title>
        <meta
          name="description"
          content="Expert tips, industry insights, and the latest updates about school fee management, education technology, and payment solutions from EduPay."
        />
        <meta
          name="keywords"
          content="school fees, education technology, edtech blog, school management tips, payment solutions, EduPay"
        />
        <link rel="canonical" href={`${window.location.origin}/blog`} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="EduPay Blog — School Fee Management Insights" />
        <meta
          property="og:description"
          content="Expert tips and updates about school fee management and education technology."
        />
        <meta property="og:url" content={`${window.location.origin}/blog`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="EduPay Blog" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1">
          {/* Hero */}
          <section className="relative py-16 md:py-24 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
            <div className="container relative">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-3xl mx-auto text-center"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                  <BookOpen className="h-4 w-4" />
                  EduPay Blog
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                  Insights & Updates
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                  Expert tips, industry insights, and the latest updates about school fee
                  management and education technology.
                </p>

                {/* Search */}
                <div className="relative max-w-lg mx-auto">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search articles..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-11 h-12 rounded-full border-muted-foreground/20 bg-card"
                  />
                </div>
              </motion.div>
            </div>
          </section>

          {/* Category Filters */}
          <section className="container pb-4">
            <div className="flex flex-wrap items-center gap-2 justify-center">
              <Badge
                variant={activeCategory === 'all' ? 'default' : 'outline'}
                className="cursor-pointer rounded-full px-4 py-1.5 text-sm transition-colors"
                onClick={() => setActiveCategory('all')}
              >
                All Posts
              </Badge>
              {BLOG_CATEGORIES.map((cat) => (
                <Badge
                  key={cat}
                  variant={activeCategory === cat ? 'default' : 'outline'}
                  className="cursor-pointer rounded-full px-4 py-1.5 text-sm transition-colors"
                  onClick={() => setActiveCategory(cat)}
                >
                  {categoryLabels[cat] || cat}
                </Badge>
              ))}
            </div>
          </section>

          {/* Content */}
          <section className="container pb-16 md:pb-24">
            {isLoading ? (
              <div className="space-y-8">
                {/* Featured skeleton */}
                <div className="grid md:grid-cols-2 gap-8">
                  <Skeleton className="aspect-[16/10] rounded-2xl" />
                  <div className="space-y-4 flex flex-col justify-center">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="aspect-[16/10] rounded-xl" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="space-y-12">
                {/* Featured Post */}
                {featuredPost && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Link
                      to={`/blog/${featuredPost.slug}`}
                      className="group grid md:grid-cols-2 gap-8 bg-card rounded-2xl border overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all duration-300"
                    >
                      <div className="relative aspect-[16/10] md:aspect-auto overflow-hidden bg-muted">
                        {featuredPost.cover_image_url ? (
                          <img
                            src={featuredPost.cover_image_url}
                            alt={featuredPost.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 min-h-[280px]">
                            <span className="text-6xl font-bold text-primary/20">
                              {featuredPost.title.charAt(0)}
                            </span>
                          </div>
                        )}
                        <Badge className="absolute top-4 left-4 rounded-full">Featured</Badge>
                      </div>
                      <div className="flex flex-col justify-center p-6 md:p-8">
                        {featuredPost.category && (
                          <Badge variant="secondary" className="w-fit rounded-full mb-3 text-xs">
                            {categoryLabels[featuredPost.category] || featuredPost.category}
                          </Badge>
                        )}
                        <h2 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                          {featuredPost.title}
                        </h2>
                        <p className="text-muted-foreground mb-4 line-clamp-3">
                          {featuredPost.excerpt || featuredPost.meta_description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            {format(
                              new Date(featuredPost.published_at || featuredPost.created_at),
                              'MMM d, yyyy'
                            )}
                          </span>
                          <span>
                            {Math.ceil(JSON.stringify(featuredPost.content).length / 1000)} min read
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-primary mt-4 group-hover:gap-2 transition-all">
                          Read article <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                )}

                {/* Grid */}
                {remainingPosts.length > 0 && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {remainingPosts.map((post, i) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                      >
                        <BlogPostCard post={post} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold mb-3">
                  {search || activeCategory !== 'all' ? 'No matching posts' : 'No posts yet'}
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {search || activeCategory !== 'all'
                    ? 'Try adjusting your search or category filter.'
                    : "We're working on great content. Check back soon!"}
                </p>
              </div>
            )}
          </section>

          {/* Tags Cloud */}
          {allTags.length > 0 && (
            <section className="container pb-16">
              <div className="bg-card rounded-2xl border p-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-4 text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  <span className="text-sm font-medium uppercase tracking-wider">Popular Topics</span>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {allTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="rounded-full cursor-pointer hover:bg-primary/10 transition-colors"
                      onClick={() => setSearch(tag)}
                    >
                      #{tag}
                    </Badge>
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

import { useBlogPosts } from '@/hooks/useBlog';
import { BlogPostCard } from '@/components/blog/BlogPostCard';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { Helmet } from 'react-helmet-async';
import { BookOpen } from 'lucide-react';

export default function Blog() {
  const { data: posts, isLoading } = useBlogPosts('published');

  return (
    <>
      <Helmet>
        <title>Blog | EduPay - School Fee Management Insights</title>
        <meta
          name="description"
          content="Read the latest insights, tips, and updates about school fee management, education technology, and more from EduPay."
        />
        <meta name="keywords" content="school fees, education, edtech, school management, payment solutions" />
        <link rel="canonical" href={`${window.location.origin}/blog`} />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative py-16 md:py-24 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
            <div className="container relative">
              <div className="max-w-3xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                  <BookOpen className="h-4 w-4" />
                  Our Blog
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                  Insights & Updates
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Expert tips, industry insights, and the latest updates about school fee management and education technology.
                </p>
              </div>
            </div>
          </section>

          {/* Blog Posts Grid */}
          <section className="container pb-16 md:pb-24">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-[16/10] rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : posts && posts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {posts.map((post) => (
                  <BlogPostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold mb-3">No posts yet</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  We're working on some great content. Check back soon for articles about school fee management and education technology.
                </p>
              </div>
            )}
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}

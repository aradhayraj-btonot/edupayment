import { useBlogPosts } from '@/hooks/useBlog';
import { BlogPostCard } from '@/components/blog/BlogPostCard';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { Helmet } from 'react-helmet-async';

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

      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-12">
          <div className="max-w-4xl mx-auto mb-12 text-center">
            <h1 className="text-4xl font-bold mb-4">EduPay Blog</h1>
            <p className="text-xl text-muted-foreground">
              Insights, tips, and updates about school fee management
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-video rounded-lg" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground">No blog posts yet. Check back soon!</p>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}

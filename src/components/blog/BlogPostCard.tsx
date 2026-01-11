import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { BlogPost } from '@/hooks/useBlog';

interface BlogPostCardProps {
  post: BlogPost;
  showStatus?: boolean;
}

export function BlogPostCard({ post, showStatus }: BlogPostCardProps) {
  const readingTime = Math.ceil(
    JSON.stringify(post.content).length / 1000
  );

  return (
    <Link to={`/blog/${post.slug}`} className="group block h-full">
      <article className="h-full flex flex-col bg-card rounded-2xl border overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300">
        {/* Cover Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {post.cover_image_url ? (
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <span className="text-4xl font-bold text-primary/20">
                {post.title.charAt(0)}
              </span>
            </div>
          )}
          {showStatus && (
            <Badge 
              variant={post.status === 'published' ? 'default' : 'secondary'} 
              className="absolute top-3 left-3"
            >
              {post.status}
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-5 flex flex-col">
          {/* Keywords */}
          {post.meta_keywords && post.meta_keywords.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              {post.meta_keywords.slice(0, 2).map((keyword) => (
                <Badge key={keyword} variant="secondary" className="text-xs font-normal rounded-full">
                  {keyword}
                </Badge>
              ))}
            </div>
          )}

          {/* Title */}
          <h3 className="text-lg font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
            {post.excerpt || post.meta_description || 'No description available'}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(post.published_at || post.created_at), 'MMM d, yyyy')}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {readingTime} min
              </div>
            </div>
            <span className="text-xs font-medium text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Read more
              <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

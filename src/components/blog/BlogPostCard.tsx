import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User } from 'lucide-react';
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
    <Link to={`/blog/${post.slug}`}>
      <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden group">
        {post.cover_image_url && (
          <div className="aspect-video overflow-hidden">
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            {showStatus && (
              <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                {post.status}
              </Badge>
            )}
            {post.meta_keywords?.slice(0, 2).map((keyword) => (
              <Badge key={keyword} variant="outline" className="text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
          <h3 className="text-xl font-semibold line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground line-clamp-3">
            {post.excerpt || post.meta_description || 'No description available'}
          </p>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {format(new Date(post.published_at || post.created_at), 'MMM d, yyyy')}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {readingTime} min read
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

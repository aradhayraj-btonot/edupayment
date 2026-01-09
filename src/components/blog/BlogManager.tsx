import { useState } from 'react';
import { useBlogPosts, useBlogMutations, BlogPost } from '@/hooks/useBlog';
import { BlogEditor } from './BlogEditor';
import { BlogPostCard } from './BlogPostCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Eye, ArrowLeft, FileText, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export function BlogManager() {
  const { user } = useAuth();
  const { data: posts, isLoading } = useBlogPosts();
  const { createPost, updatePost, deletePost } = useBlogMutations();
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  const handleCreate = async (data: { title: string; content: any[]; coverImage?: string }) => {
    if (!user) return;
    await createPost.mutateAsync({
      title: data.title,
      content: data.content,
      cover_image_url: data.coverImage,
      author_id: user.id,
    });
    setView('list');
  };

  const handlePublish = async (data: { title: string; content: any[]; coverImage?: string }) => {
    if (!user) return;
    
    if (editingPost) {
      await updatePost.mutateAsync({
        id: editingPost.id,
        title: data.title,
        content: data.content,
        cover_image_url: data.coverImage,
        status: 'published',
      });
    } else {
      const post = await createPost.mutateAsync({
        title: data.title,
        content: data.content,
        cover_image_url: data.coverImage,
        author_id: user.id,
      });
      await updatePost.mutateAsync({
        id: post.id,
        status: 'published',
      });
    }
    setView('list');
    setEditingPost(null);
  };

  const handleSaveEdit = async (data: { title: string; content: any[]; coverImage?: string }) => {
    if (!editingPost) return;
    await updatePost.mutateAsync({
      id: editingPost.id,
      title: data.title,
      content: data.content,
      cover_image_url: data.coverImage,
    });
    setView('list');
    setEditingPost(null);
  };

  const handleDelete = async (id: string) => {
    await deletePost.mutateAsync(id);
  };

  const startEdit = (post: BlogPost) => {
    setEditingPost(post);
    setView('edit');
  };

  if (view === 'create') {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setView('list')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Posts
        </Button>
        <BlogEditor
          onSave={handleCreate}
          onPublish={handlePublish}
          isSaving={createPost.isPending}
          isPublishing={createPost.isPending || updatePost.isPending}
        />
      </div>
    );
  }

  if (view === 'edit' && editingPost) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => { setView('list'); setEditingPost(null); }}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Posts
        </Button>
        <BlogEditor
          initialTitle={editingPost.title}
          initialContent={editingPost.content}
          initialCoverImage={editingPost.cover_image_url || ''}
          onSave={handleSaveEdit}
          onPublish={handlePublish}
          isSaving={updatePost.isPending}
          isPublishing={updatePost.isPending}
        />
      </div>
    );
  }

  const drafts = posts?.filter((p) => p.status === 'draft') || [];
  const published = posts?.filter((p) => p.status === 'published') || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Blog Management</h2>
          <p className="text-muted-foreground">Create and manage blog posts</p>
        </div>
        <Button onClick={() => setView('create')}>
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({posts?.length || 0})</TabsTrigger>
          <TabsTrigger value="published">Published ({published.length})</TabsTrigger>
          <TabsTrigger value="drafts">Drafts ({drafts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <PostList posts={posts || []} isLoading={isLoading} onEdit={startEdit} onDelete={handleDelete} />
        </TabsContent>

        <TabsContent value="published" className="mt-6">
          <PostList posts={published} isLoading={isLoading} onEdit={startEdit} onDelete={handleDelete} />
        </TabsContent>

        <TabsContent value="drafts" className="mt-6">
          <PostList posts={drafts} isLoading={isLoading} onEdit={startEdit} onDelete={handleDelete} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PostList({
  posts,
  isLoading,
  onEdit,
  onDelete,
}: {
  posts: BlogPost[];
  isLoading: boolean;
  onEdit: (post: BlogPost) => void;
  onDelete: (id: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <Skeleton className="h-24 w-40 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No posts found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id}>
          <CardContent className="p-4">
            <div className="flex gap-4">
              {post.cover_image_url ? (
                <img
                  src={post.cover_image_url}
                  alt={post.title}
                  className="h-24 w-40 object-cover rounded"
                />
              ) : (
                <div className="h-24 w-40 bg-muted rounded flex items-center justify-center">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{post.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                      {post.excerpt || post.meta_description || 'No description'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                        {post.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(post.updated_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {post.status === 'published' && (
                      <Link to={`/blog/${post.slug}`} target="_blank">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => onEdit(post)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete post?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the blog post.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(post.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

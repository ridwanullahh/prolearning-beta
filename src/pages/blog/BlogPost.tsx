import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Eye, User, ArrowLeft } from 'lucide-react';
import { db } from '@/lib/github-sdk';

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);

  useEffect(() => {
    if (slug) {
      loadBlogPost();
    }
  }, [slug]);

  const loadBlogPost = async () => {
    try {
      const posts = await db.queryBuilder('blogPosts')
        .where((post: any) => post.status === 'published' && (post.slug === slug || generateSlug(post.title) === slug))
        .exec();

      if (posts.length > 0) {
        const currentPost = posts[0];
        setPost(currentPost);

        // Update view count
        await db.update('blogPosts', currentPost.id, {
          viewCount: (currentPost.viewCount || 0) + 1
        });

        // Load related posts
        const related = await db.queryBuilder('blogPosts')
          .where((p: any) => p.status === 'published' && p.category === currentPost.category && p.id !== currentPost.id)
          .limit(3)
          .exec();
        
        setRelatedPosts(related);
      }
    } catch (error) {
      console.error('Error loading blog post:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
            <Link to="/blog">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link to="/blog" className="inline-block mb-6">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>

          {/* Article */}
          <article className="mb-12">
            <Card>
              {post.featuredImage && (
                <div className="aspect-video">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                  </div>
                  {post.viewCount && (
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {post.viewCount} views
                    </div>
                  )}
                  {post.author && (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {post.author}
                    </div>
                  )}
                </div>
                <CardTitle className="text-3xl mb-4">{post.title}</CardTitle>
                {post.excerpt && (
                  <p className="text-lg text-gray-600 mb-4">{post.excerpt}</p>
                )}
                <div className="flex gap-2">
                  {post.category && (
                    <Badge variant="secondary">{post.category}</Badge>
                  )}
                  {post.tags && JSON.parse(post.tags).map((tag: string) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-lg max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </div>
              </CardContent>
            </Card>
          </article>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Related Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {relatedPosts.map((relatedPost) => (
                    <div key={relatedPost.id} className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">
                        <Link
                          to={`/blog/${relatedPost.slug || generateSlug(relatedPost.title)}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {relatedPost.title}
                        </Link>
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {relatedPost.excerpt || relatedPost.content.substring(0, 100) + '...'}
                      </p>
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(relatedPost.publishedAt || relatedPost.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
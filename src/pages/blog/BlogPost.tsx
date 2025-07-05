
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, ArrowLeft, Calendar, User } from 'lucide-react';
import { db } from '@/lib/github-sdk';
import ReactMarkdown from 'react-markdown';

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadBlogPost();
    }
  }, [slug]);

  const loadBlogPost = async () => {
    try {
      // First try to find by slug
      let posts = await db.queryBuilder('blogPosts')
        .where((post: any) => post.slug === slug && post.status === 'published')
        .exec();

      // If not found by slug, try to generate slug from title
      if (posts.length === 0) {
        const allPosts = await db.queryBuilder('blogPosts')
          .where((post: any) => post.status === 'published')
          .exec();
        
        const matchedPost = allPosts.find((post: any) => 
          generateSlug(post.title) === slug
        );
        
        if (matchedPost) {
          posts = [matchedPost];
        }
      }

      if (posts.length === 0) {
        setLoading(false);
        return;
      }

      const foundPost = posts[0];
      setPost(foundPost);

      // Increment view count
      await db.update('blogPosts', foundPost.id, {
        viewCount: (foundPost.viewCount || 0) + 1
      });

      // Load related posts by category
      if (foundPost.category) {
        const related = await db.queryBuilder('blogPosts')
          .where((post: any) => 
            post.category === foundPost.category && 
            post.id !== foundPost.id && 
            post.status === 'published'
          )
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
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Post Not Found</h1>
            <p className="text-xl text-gray-600 mb-8">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
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
          <div className="mb-6">
            <Link to="/blog">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Button>
            </Link>
          </div>

          {/* Blog Post */}
          <Card className="mb-8">
            {post.featuredImage && (
              <div className="aspect-video">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-full object-cover rounded-t-lg"
                />
              </div>
            )}
            <CardContent className="p-8">
              {/* Post Header */}
              <div className="mb-6">
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {post.viewCount || 0} views
                  </div>
                  {post.author && (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {post.author}
                    </div>
                  )}
                </div>

                <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
                
                <div className="flex gap-2 mb-6">
                  <Badge variant="secondary">{post.category}</Badge>
                  {post.tags && JSON.parse(post.tags).map((tag: string) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>

                {post.excerpt && (
                  <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>
                )}
              </div>

              {/* Post Content */}
              <div className="prose max-w-none">
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Posts</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Card key={relatedPost.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">
                        <Link
                          to={`/blog/${relatedPost.slug || generateSlug(relatedPost.title)}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {relatedPost.title}
                        </Link>
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {relatedPost.excerpt || relatedPost.content.substring(0, 100) + '...'}
                      </p>
                      <div className="mt-2">
                        <Badge variant="outline">{relatedPost.category}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogPost;

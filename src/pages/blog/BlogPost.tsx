import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Eye, User, ArrowLeft, Share2, Twitter, Linkedin, Facebook, BookOpen } from 'lucide-react';
import { db } from '@/lib/github-sdk';
import { motion } from 'framer-motion';
import Footer from '@/components/layout/Footer';
import SmartHeader from '@/components/layout/SmartHeader';


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

        await db.update('blogPosts', currentPost.id, { viewCount: (currentPost.viewCount || 0) + 1 });

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <SmartHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading blog post...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <SmartHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Post Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">The blog post you're looking for doesn't exist.</p>
            <Button asChild>
              <Link to="/blog">Back to Blog</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <SmartHeader />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}}>
                <Link to="/blog" className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-green-600 transition-colors mb-8">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to all articles
                </Link>
            </motion.div>
            
            <div className="max-w-4xl mx-auto">
                <motion.article initial={{opacity:0, y:20}} animate={{opacity:1, y:0}}>
                    <div className="mb-8">
                        <Badge variant="secondary">{post.category || 'General'}</Badge>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mt-4">{post.title}</h1>
                        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-2"><User className="h-4 w-4"/><span>{post.author || 'ProLearning Team'}</span></div>
                            <div className="flex items-center gap-2"><Calendar className="h-4 w-4"/><span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span></div>
                            <div className="flex items-center gap-2"><Eye className="h-4 w-4"/><span>{post.viewCount || 1} views</span></div>
                        </div>
                    </div>

                    {post.featuredImage && (
                        <img src={post.featuredImage} alt={post.title} className="w-full h-auto max-h-[500px] object-cover rounded-2xl shadow-lg mb-12"/>
                    )}

                    <div className="prose dark:prose-invert prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />

                    <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                        <h4 className="font-semibold">Share this article:</h4>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm"><Twitter className="h-4 w-4 mr-2"/>Twitter</Button>
                            <Button variant="outline" size="sm"><Linkedin className="h-4 w-4 mr-2"/>LinkedIn</Button>
                            <Button variant="outline" size="sm"><Facebook className="h-4 w-4 mr-2"/>Facebook</Button>
                        </div>
                    </div>
                </motion.article>

                {relatedPosts.length > 0 && (
                    <div className="mt-20">
                        <h2 className="text-3xl font-bold mb-8">Related Articles</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {relatedPosts.map(related => (
                                <Link to={`/blog/${related.slug || generateSlug(related.title)}`} key={related.id}>
                                    <Card className="h-full overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
                                        <img src={related.featuredImage || `https://source.unsplash.com/random/500x300?learning,${related.id}`} alt={related.title} className="w-full h-40 object-cover"/>
                                        <CardContent className="p-4">
                                            <Badge variant="secondary" className="mb-2">{related.category}</Badge>
                                            <h3 className="font-bold text-lg line-clamp-2">{related.title}</h3>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

        <Footer />
    </div>
  );
};

export default BlogPost;
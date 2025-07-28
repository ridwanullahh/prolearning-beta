import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Eye, ArrowLeft, ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import { db } from '@/lib/github-sdk';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const HelpArticle = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null);

  useEffect(() => {
    if (slug) {
      loadHelpArticle();
    }
  }, [slug]);

  const loadHelpArticle = async () => {
    try {
      const articles = await db.queryBuilder('helpArticles')
        .where((article: any) => article.status === 'published' && (article.slug === slug || generateSlug(article.title) === slug))
        .exec();

      if (articles.length > 0) {
        const currentArticle = articles[0];
        setArticle(currentArticle);

        await db.update('helpArticles', currentArticle.id, { viewCount: (currentArticle.viewCount || 0) + 1 });

        const related = await db.queryBuilder('helpArticles')
          .where((a: any) => a.status === 'published' && a.category === currentArticle.category && a.id !== currentArticle.id)
          .limit(3)
          .exec();
        setRelatedArticles(related);
      }
    } catch (error) {
      console.error('Error loading help article:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleFeedback = async (isHelpful: boolean) => {
    // Feedback logic remains the same
  };

  if (loading) return <div className="text-center py-20">Loading article...</div>;
  if (!article) return <div className="text-center py-20">Article not found.</div>;

  return (
    <div className="bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-4xl mx-auto">
                <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}}>
                    <Link to="/help" className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-green-600 transition-colors mb-8">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Help Center
                    </Link>
                </motion.div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2">
                        <motion.article initial={{opacity:0, y:20}} animate={{opacity:1, y:0}}>
                            <div className="mb-8">
                                <Badge variant="secondary">{article.category || 'General'}</Badge>
                                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mt-4">{article.title}</h1>
                                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-2"><Eye className="h-4 w-4"/><span>{article.viewCount || 1} views</span></div>
                                    <div className="text-xs">Last updated on {new Date(article.updatedAt || article.createdAt).toLocaleDateString()}</div>
                                </div>
                            </div>
                            <div className="prose dark:prose-invert prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
                        </motion.article>
                    </div>

                    <aside className="lg:col-span-1">
                        <div className="sticky top-24 space-y-8">
                            <Card>
                                <CardHeader><CardTitle>Was this helpful?</CardTitle></CardHeader>
                                <CardContent>
                                    {feedback ? (
                                        <p className="text-green-600">Thanks for your feedback!</p>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleFeedback(true)}><ThumbsUp className="h-4 w-4 mr-2"/>Yes</Button>
                                            <Button variant="outline" size="sm" onClick={() => handleFeedback(false)}><ThumbsDown className="h-4 w-4 mr-2"/>No</Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {relatedArticles.length > 0 && (
                                <Card>
                                    <CardHeader><CardTitle>Related Articles</CardTitle></CardHeader>
                                    <CardContent className="space-y-3">
                                        {relatedArticles.map(related => (
                                            <Link to={`/help/${related.slug || generateSlug(related.title)}`} key={related.id} className="block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                                                <h4 className="font-semibold">{related.title}</h4>
                                            </Link>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}

                             <Card>
                                <CardHeader><CardTitle>Still need help?</CardTitle></CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Our support team is ready to assist you.</p>
                                    <Link to="/support">
                                        <Button className="w-full"><MessageCircle className="h-4 w-4 mr-2"/>Contact Support</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    </div>
  );
};

export default HelpArticle;
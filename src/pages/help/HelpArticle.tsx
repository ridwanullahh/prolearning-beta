import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Eye, ArrowLeft, ThumbsUp, ThumbsDown } from 'lucide-react';
import { db } from '@/lib/github-sdk';
import { toast } from 'sonner';

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

        // Update view count
        await db.update('helpArticles', currentArticle.id, {
          viewCount: (currentArticle.viewCount || 0) + 1
        });

        // Load related articles
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
    try {
      const feedbackType = isHelpful ? 'helpful' : 'not-helpful';
      setFeedback(feedbackType);
      
      // Update article feedback
      const currentHelpful = article.helpfulCount || 0;
      const currentNotHelpful = article.notHelpfulCount || 0;
      
      await db.update('helpArticles', article.id, {
        helpfulCount: isHelpful ? currentHelpful + 1 : currentHelpful,
        notHelpfulCount: !isHelpful ? currentNotHelpful + 1 : currentNotHelpful
      });

      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    }
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

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
            <Link to="/help">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Help Center
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
          <Link to="/help" className="inline-block mb-6">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Help Center
            </Button>
          </Link>

          {/* Article */}
          <article className="mb-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {article.category}
                  </div>
                  {article.viewCount && (
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {article.viewCount} views
                    </div>
                  )}
                </div>
                <CardTitle className="text-3xl mb-4">{article.title}</CardTitle>
                <div className="flex gap-2">
                  {article.tags && JSON.parse(article.tags).map((tag: string) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-lg max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: article.content }} />
                </div>
              </CardContent>
            </Card>
          </article>

          {/* Feedback Section */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">Was this article helpful?</h3>
                {feedback ? (
                  <div className="text-green-600">
                    Thank you for your feedback!
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => handleFeedback(true)}
                      className="flex items-center gap-2"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Yes, it was helpful
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleFeedback(false)}
                      className="flex items-center gap-2"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      No, it wasn't helpful
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Related Articles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {relatedArticles.map((relatedArticle) => (
                    <div key={relatedArticle.id} className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">
                        <Link
                          to={`/help/${relatedArticle.slug || generateSlug(relatedArticle.title)}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {relatedArticle.title}
                        </Link>
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {relatedArticle.content?.substring(0, 100) + '...'}
                      </p>
                      <div className="text-xs text-gray-500 mt-2">
                        {relatedArticle.category}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Still Need Help */}
          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">Still need help?</p>
            <Link to="/support">
              <Button>Contact Support</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpArticle;
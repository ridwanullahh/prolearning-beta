import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, ArrowLeft, ThumbsUp, ThumbsDown } from 'lucide-react';
import { db } from '@/lib/github-sdk';
import ReactMarkdown from 'react-markdown';

const HelpArticle = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    if (slug) {
      loadHelpArticle();
    }
  }, [slug]);

  const loadHelpArticle = async () => {
    try {
      // First try to find by slug
      let articles = await db.queryBuilder('helpArticles')
        .where((article: any) => article.slug === slug && article.status === 'published')
        .exec();

      // If not found by slug, try to generate slug from title
      if (articles.length === 0) {
        const allArticles = await db.queryBuilder('helpArticles')
          .where((article: any) => article.status === 'published')
          .exec();
        
        const matchedArticle = allArticles.find((article: any) => 
          generateSlug(article.title) === slug
        );
        
        if (matchedArticle) {
          articles = [matchedArticle];
        }
      }

      if (articles.length === 0) {
        setLoading(false);
        return;
      }

      const foundArticle = articles[0];
      setArticle(foundArticle);

      // Increment view count
      await db.update('helpArticles', foundArticle.id, {
        viewCount: (foundArticle.viewCount || 0) + 1
      });

      // Load related articles by category
      if (foundArticle.category) {
        const related = await db.queryBuilder('helpArticles')
          .where((article: any) => 
            article.category === foundArticle.category && 
            article.id !== foundArticle.id && 
            article.status === 'published'
          )
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

  const handleVote = async (helpful: boolean) => {
    if (!article || hasVoted) return;

    try {
      const updateField = helpful ? 'helpful' : 'notHelpful';
      const currentCount = article[updateField] || 0;
      
      await db.update('helpArticles', article.id, {
        [updateField]: currentCount + 1
      });

      setArticle(prev => ({
        ...prev,
        [updateField]: currentCount + 1
      }));
      
      setHasVoted(true);
    } catch (error) {
      console.error('Error voting on article:', error);
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
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Article Not Found</h1>
            <p className="text-xl text-gray-600 mb-8">
              The help article you're looking for doesn't exist or has been removed.
            </p>
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
          <div className="mb-6">
            <Link to="/help">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Help Center
              </Button>
            </Link>
          </div>

          {/* Article */}
          <Card className="mb-8">
            <CardContent className="p-8">
              {/* Article Header */}
              <div className="mb-6">
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {article.viewCount || 0} views
                  </div>
                </div>

                <h1 className="text-4xl font-bold text-gray-900 mb-4">{article.title}</h1>
                
                <div className="flex gap-2 mb-6">
                  <Badge variant="secondary">{article.category}</Badge>
                  {article.tags && JSON.parse(article.tags).map((tag: string) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>

              {/* Article Content */}
              <div className="prose max-w-none mb-8">
                <ReactMarkdown>{article.content}</ReactMarkdown>
              </div>

              {/* Feedback Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Was this article helpful?</h3>
                <div className="flex gap-4 items-center">
                  <Button
                    variant={hasVoted ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => handleVote(true)}
                    disabled={hasVoted}
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Yes ({article.helpful || 0})
                  </Button>
                  <Button
                    variant={hasVoted ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => handleVote(false)}
                    disabled={hasVoted}
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    No ({article.notHelpful || 0})
                  </Button>
                  {hasVoted && (
                    <span className="text-sm text-gray-600">Thank you for your feedback!</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((relatedArticle) => (
                  <Card key={relatedArticle.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">
                        <Link
                          to={`/help/${relatedArticle.slug || generateSlug(relatedArticle.title)}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {relatedArticle.title}
                        </Link>
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {relatedArticle.content.substring(0, 100) + '...'}
                      </p>
                      <div className="mt-2">
                        <Badge variant="outline">{relatedArticle.category}</Badge>
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

export default HelpArticle;

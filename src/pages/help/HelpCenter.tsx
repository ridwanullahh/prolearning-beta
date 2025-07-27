import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, MessageCircle, ArrowRight } from 'lucide-react';
import { db } from '@/lib/github-sdk';
import { motion } from 'framer-motion';

const HelpCenter: React.FC = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHelpArticles();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [articles, searchTerm]);

  const loadHelpArticles = async () => {
    try {
      const publishedArticles = await db.queryBuilder('helpArticles')
        .where((article: any) => article.status === 'published')
        .orderBy('createdAt', 'desc')
        .exec();
      setArticles(publishedArticles);
      const uniqueCategories = [...new Set(publishedArticles.map((article: any) => article.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error loading help articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterArticles = () => {
    let filtered = articles.filter(article =>
        (article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
         (article.content || '').toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredArticles(filtered);
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  if (loading) {
    return <div className="text-center py-20">Loading help center...</div>;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">Help Center</h1>
                <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    How can we help you today?
                </p>
                <div className="mt-8 max-w-2xl mx-auto">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                          placeholder="Search for articles..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-12 h-14 rounded-full text-lg"
                        />
                    </div>
                </div>
            </motion.div>

            {categories.map(category => (
                <div key={category} className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">{category}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredArticles.filter(a => a.category === category).map((article, index) => (
                             <motion.div key={article.id} initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: index * 0.1}}>
                                <Link to={`/help/${article.slug || generateSlug(article.title)}`}>
                                    <Card className="h-full flex flex-col overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 group">
                                        <CardHeader>
                                            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center mb-4">
                                                <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400"/>
                                            </div>
                                            <CardTitle className="text-xl group-hover:text-green-600 transition-colors">{article.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex-grow">
                                            <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3">{article.content?.substring(0, 150)}...</p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            ))}

            <div className="text-center mt-16">
                <h3 className="text-2xl font-semibold">Can't find what you're looking for?</h3>
                <p className="text-gray-500 mt-2">Our support team is here to help.</p>
                <Link to="/support">
                    <Button className="mt-6 rounded-full"><MessageCircle className="mr-2 h-4 w-4"/> Contact Support</Button>
                </Link>
            </div>
        </div>
    </div>
  );
};

export default HelpCenter;

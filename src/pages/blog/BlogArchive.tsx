import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, Eye, User, ArrowRight } from 'lucide-react';
import { db } from '@/lib/github-sdk';
import { motion } from 'framer-motion';

const BlogArchive = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlogPosts();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [posts, searchTerm, selectedCategory]);

  const loadBlogPosts = async () => {
    try {
      const publishedPosts = await db.queryBuilder('blogPosts')
        .where((post: any) => post.status === 'published')
        .orderBy('publishedAt', 'desc')
        .exec();
      setPosts(publishedPosts);
      const uniqueCategories = [...new Set(publishedPosts.map((post: any) => post.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error loading blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = () => {
    let filtered = posts.filter(post =>
        (post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
         post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedCategory === '' || post.category === selectedCategory)
    );
    setFilteredPosts(filtered);
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  if (loading) {
    return <div className="text-center py-20">Loading posts...</div>;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">ProLearning Blog</h1>
                <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Your source for the latest in education technology, learning science, and platform updates.
                </p>
            </motion.div>

            <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-grow w-full md:w-auto">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="Search articles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 rounded-full"
                    />
                </div>
                <div className="flex gap-2 flex-wrap justify-center">
                    <Button variant={selectedCategory === '' ? 'default' : 'outline'} onClick={() => setSelectedCategory('')} className="rounded-full">All</Button>
                    {categories.map(category => (
                      <Button key={category} variant={selectedCategory === category ? 'default' : 'outline'} onClick={() => setSelectedCategory(category)} className="rounded-full">{category}</Button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, index) => (
                <motion.div key={post.id} initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: index * 0.1}}>
                    <Card className="h-full flex flex-col overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="p-0">
                            <Link to={`/blog/${post.slug || generateSlug(post.title)}`}>
                                <img src={post.featuredImage || `https://source.unsplash.com/random/500x300?education,${index}`} alt={post.title} className="w-full h-48 object-cover"/>
                            </Link>
                        </CardHeader>
                        <CardContent className="p-6 flex-grow flex flex-col">
                            <div className="mb-2">
                                <Badge variant="secondary">{post.category || 'General'}</Badge>
                            </div>
                            <CardTitle className="text-xl mb-2 flex-grow">
                                <Link to={`/blog/${post.slug || generateSlug(post.title)}`} className="hover:text-green-600 transition-colors">{post.title}</Link>
                            </CardTitle>
                            <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 mb-4">{post.excerpt}</p>
                            <div className="text-xs text-gray-500 flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                                </div>
                                <Link to={`/blog/${post.slug || generateSlug(post.title)}`} className="font-semibold text-green-600 hover:text-green-700 flex items-center">
                                    Read More <ArrowRight className="h-4 w-4 ml-1"/>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
              ))}
            </div>

            {filteredPosts.length === 0 && (
                <div className="text-center py-20 col-span-full">
                    <h3 className="text-2xl font-semibold">No posts found</h3>
                    <p className="text-gray-500 mt-2">Try a different search or category.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default BlogArchive;

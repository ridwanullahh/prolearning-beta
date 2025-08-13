import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Eye, 
  Save, 
  Trash2,
  FileText,
  Calendar,
  User,
  Tag,
  Search,
  Filter,
  BarChart3,
  Globe,
  Clock,
  Heart,
  MessageSquare,
  Share2,
  TrendingUp
} from 'lucide-react';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  stats: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  postCount: number;
}

const BlogManagementPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '', color: '#16a34a' });
  const { toast } = useToast();
  const currentUser = authService.getCurrentUser();

  const defaultPost: BlogPost = {
    id: '',
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    author: {
      id: currentUser?.id || '',
      name: currentUser?.name || 'Admin',
      avatar: currentUser?.avatar
    },
    category: '',
    tags: [],
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: []
    },
    stats: {
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0
    }
  };

  useEffect(() => {
    loadPosts();
    loadCategories();
  }, []);

  const loadPosts = async () => {
    try {
      const postsData = await db.get('blogPosts') || [];
      setPosts(postsData);
    } catch (error) {
      console.error('Error loading blog posts:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await db.get('blogCategories') || [];
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading blog categories:', error);
    }
  };

  const savePost = async (post: BlogPost) => {
    setIsLoading(true);
    try {
      const slug = post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const updatedPost = {
        ...post,
        slug,
        updatedAt: new Date().toISOString(),
        publishedAt: post.status === 'published' && !post.publishedAt ? new Date().toISOString() : post.publishedAt
      };

      if (post.id) {
        await db.update('blogPosts', post.id, updatedPost);
        setPosts(prev => prev.map(p => p.id === post.id ? updatedPost : p));
      } else {
        const newPost = await db.insert('blogPosts', {
          ...updatedPost,
          id: `post_${Date.now()}`,
          createdAt: new Date().toISOString()
        });
        setPosts(prev => [...prev, newPost]);
      }

      toast({
        title: "Post Saved",
        description: "Your blog post has been saved successfully.",
      });

      setIsEditing(false);
      setSelectedPost(null);
    } catch (error) {
      console.error('Error saving blog post:', error);
      toast({
        title: "Error",
        description: "Failed to save blog post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      await db.delete('blogPosts', id);
      setPosts(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Post Deleted",
        description: "The blog post has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting blog post:', error);
      toast({
        title: "Error",
        description: "Failed to delete blog post. Please try again.",
        variant: "destructive"
      });
    }
  };

  const createCategory = async () => {
    if (!newCategory.name.trim()) return;

    try {
      const category: BlogCategory = {
        id: `cat_${Date.now()}`,
        name: newCategory.name,
        slug: newCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: newCategory.description,
        color: newCategory.color,
        postCount: 0
      };

      await db.insert('blogCategories', category);
      setCategories(prev => [...prev, category]);
      setNewCategory({ name: '', description: '', color: '#16a34a' });
      setShowCategoryDialog(false);

      toast({
        title: "Category Created",
        description: "New blog category has been created successfully.",
      });
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Error",
        description: "Failed to create category. Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-600';
      case 'draft': return 'bg-yellow-600';
      case 'archived': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const renderPostList = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Blog Posts</h2>
          <p className="text-gray-600">Manage your blog content and engage with your audience</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Tag className="h-4 w-4 mr-2" />
                Manage Categories
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                  <Input
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter category name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <Textarea
                    value={newCategory.description}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter category description"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <Input
                    type="color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                  />
                </div>
                <Button onClick={createCategory} className="w-full bg-green-600 hover:bg-green-700">
                  Create Category
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            onClick={() => {
              setSelectedPost({ ...defaultPost, id: `post_${Date.now()}` });
              setIsEditing(true);
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Posts Grid */}
      <div className="grid gap-6">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                    <Badge className={getStatusColor(post.status)}>
                      {post.status}
                    </Badge>
                    {post.category && (
                      <Badge variant="outline" style={{ 
                        borderColor: categories.find(c => c.id === post.category)?.color,
                        color: categories.find(c => c.id === post.category)?.color
                      }}>
                        {categories.find(c => c.id === post.category)?.name}
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3 line-clamp-2">{post.excerpt || post.content.substring(0, 150) + '...'}</p>
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{post.author.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{post.stats.views} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span>{post.stats.likes} likes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{post.stats.comments} comments</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedPost(post);
                      setIsEditing(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deletePost(post.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredPosts.length === 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Blog Posts Found</h3>
              <p className="text-gray-600 mb-4">Create your first blog post to start engaging with your audience.</p>
              <Button
                onClick={() => {
                  setSelectedPost({ ...defaultPost, id: `post_${Date.now()}` });
                  setIsEditing(true);
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Post
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-3xl p-8 text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-2xl">
            <FileText className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">Blog Management</h1>
            <p className="text-green-100">Create and manage engaging blog content for your platform</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Posts</p>
                <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Globe className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Published</p>
                <p className="text-2xl font-bold text-gray-900">{posts.filter(p => p.status === 'published').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Edit className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Drafts</p>
                <p className="text-2xl font-bold text-gray-900">{posts.filter(p => p.status === 'draft').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{posts.reduce((acc, p) => acc + p.stats.views, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="posts">
        <TabsList className="bg-white/80 backdrop-blur-sm">
          <TabsTrigger value="posts" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <FileText className="h-4 w-4 mr-2" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <Tag className="h-4 w-4 mr-2" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          {renderPostList()}
        </TabsContent>

        <TabsContent value="categories">
          <div className="text-center py-12">
            <p className="text-gray-600">Categories Management - Implementation continues</p>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="text-center py-12">
            <p className="text-gray-600">Blog Analytics - Implementation continues</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Post Editor Modal */}
      {isEditing && selectedPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedPost.id ? 'Edit Post' : 'Create New Post'}
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <Input
                  value={selectedPost.title}
                  onChange={(e) => setSelectedPost(prev => prev ? { ...prev, title: e.target.value } : null)}
                  placeholder="Enter post title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <Textarea
                  value={selectedPost.content}
                  onChange={(e) => setSelectedPost(prev => prev ? { ...prev, content: e.target.value } : null)}
                  placeholder="Write your blog post content..."
                  rows={12}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <Select
                    value={selectedPost.category}
                    onValueChange={(value) => setSelectedPost(prev => prev ? { ...prev, category: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <Select
                    value={selectedPost.status}
                    onValueChange={(value: any) => setSelectedPost(prev => prev ? { ...prev, status: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t flex gap-3">
              <Button
                onClick={() => selectedPost && savePost(selectedPost)}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Post'}
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedPost(null);
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagementPage;

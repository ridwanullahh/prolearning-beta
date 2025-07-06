import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/github-sdk';
import { Plus, Edit, Trash2, Eye, Search } from 'lucide-react';
import RichTextEditor from '@/components/shared/RichTextEditor';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  viewCount: number;
  helpful: number;
  notHelpful: number;
  createdAt: string;
  updatedAt: string;
}

const HelpCMS = () => {
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<HelpArticle | null>(null);
  const { toast } = useToast();

  const [articleForm, setArticleForm] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    status: 'draft' as 'draft' | 'published' | 'archived'
  });

  const categories = [
    'Getting Started',
    'Account Management',
    'Courses',
    'Payments',
    'Technical Support',
    'Troubleshooting'
  ];

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const data = await db.get('helpArticles');
      setArticles(data.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    } catch (error) {
      console.error('Error loading help articles:', error);
      toast({
        title: "Error",
        description: "Failed to load help articles.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleSaveArticle = async () => {
    try {
      if (!articleForm.title || !articleForm.content || !articleForm.category) {
        toast({
          title: "Error",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return;
      }

      const slug = generateSlug(articleForm.title);
      const tagsArray = articleForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

      const articleData = {
        title: articleForm.title,
        content: articleForm.content,
        category: articleForm.category,
        slug,
        status: articleForm.status,
        tags: JSON.stringify(tagsArray),
        viewCount: editingArticle?.viewCount || 0,
        helpful: editingArticle?.helpful || 0,
        notHelpful: editingArticle?.notHelpful || 0
      };

      if (editingArticle) {
        await db.update('helpArticles', editingArticle.id, articleData);
        toast({
          title: "Success",
          description: "Article updated successfully!"
        });
      } else {
        await db.insert('helpArticles', articleData);
        toast({
          title: "Success",
          description: "Article created successfully!"
        });
      }

      setIsDialogOpen(false);
      setEditingArticle(null);
      setArticleForm({
        title: '',
        content: '',
        category: '',
        tags: '',
        status: 'draft'
      });
      loadArticles();
    } catch (error) {
      console.error('Error saving article:', error);
      toast({
        title: "Error",
        description: "Failed to save article.",
        variant: "destructive"
      });
    }
  };

  const handleEditArticle = (article: HelpArticle) => {
    setEditingArticle(article);
    setArticleForm({
      title: article.title,
      content: article.content,
      category: article.category,
      tags: typeof article.tags === 'string' ? JSON.parse(article.tags || '[]').join(', ') : (article.tags || []).join(', '),
      status: article.status
    });
    setIsDialogOpen(true);
  };

  const handleDeleteArticle = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await db.delete('helpArticles', id);
        toast({
          title: "Success",
          description: "Article deleted successfully!"
        });
        loadArticles();
      } catch (error) {
        console.error('Error deleting article:', error);
        toast({
          title: "Error",
          description: "Failed to delete article.",
          variant: "destructive"
        });
      }
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || article.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Help Articles Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingArticle(null);
              setArticleForm({
                title: '',
                content: '',
                category: '',
                tags: '',
                status: 'draft'
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              New Article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingArticle ? 'Edit Article' : 'Create New Article'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={articleForm.title}
                  onChange={(e) => setArticleForm({...articleForm, title: e.target.value})}
                  placeholder="Enter article title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={articleForm.category} onValueChange={(value) => setArticleForm({...articleForm, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={articleForm.status} onValueChange={(value: any) => setArticleForm({...articleForm, status: value})}>
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

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={articleForm.tags}
                  onChange={(e) => setArticleForm({...articleForm, tags: e.target.value})}
                  placeholder="e.g., beginner, setup, account"
                />
              </div>

              <div className="space-y-2">
                <Label>Content *</Label>
                <RichTextEditor
                  value={articleForm.content}
                  onChange={(content) => setArticleForm({...articleForm, content})}
                  placeholder="Write your help article content here..."
                  height="400px"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveArticle}>
                  {editingArticle ? 'Update' : 'Create'} Article
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Articles List */}
      <div className="grid gap-4">
        {filteredArticles.map((article) => (
          <Card key={article.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold">{article.title}</h3>
                    <Badge variant={
                      article.status === 'published' ? 'default' :
                      article.status === 'draft' ? 'secondary' : 'outline'
                    }>
                      {article.status}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-2">{article.category}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {article.viewCount || 0} views
                    </span>
                    <span>👍 {article.helpful || 0}</span>
                    <span>👎 {article.notHelpful || 0}</span>
                    <span>Updated {new Date(article.updatedAt).toLocaleDateString()}</span>
                  </div>
                  {(typeof article.tags === 'string' ? JSON.parse(article.tags || '[]') : (article.tags || [])).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(typeof article.tags === 'string' ? JSON.parse(article.tags || '[]') : (article.tags || [])).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditArticle(article)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteArticle(article.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No articles found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HelpCMS;
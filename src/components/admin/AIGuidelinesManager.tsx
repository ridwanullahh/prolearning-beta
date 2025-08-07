import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  BookOpen, 
  AlertTriangle,
  CheckCircle,
  Search,
  Filter
} from 'lucide-react';
import { db } from '@/lib/github-sdk';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface AIGuideline {
  id: string;
  title: string;
  description: string;
  category: 'content' | 'curriculum' | 'assessment' | 'general';
  priority: 'high' | 'medium' | 'low';
  guideline: string;
  isActive: boolean;
  appliesTo: string[];
  tags: string[];
  examples: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const AIGuidelinesManager: React.FC = () => {
  const [guidelines, setGuidelines] = useState<AIGuideline[]>([]);
  const [filteredGuidelines, setFilteredGuidelines] = useState<AIGuideline[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingGuideline, setEditingGuideline] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const categories = [
    { value: 'content', label: 'Content Guidelines', icon: BookOpen },
    { value: 'curriculum', label: 'Curriculum Guidelines', icon: Shield },
    { value: 'assessment', label: 'Assessment Guidelines', icon: CheckCircle },
    { value: 'general', label: 'General Guidelines', icon: AlertTriangle }
  ];

  const priorities = [
    { value: 'high', label: 'High Priority', color: 'bg-red-100 text-red-800' },
    { value: 'medium', label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'low', label: 'Low Priority', color: 'bg-green-100 text-green-800' }
  ];

  const contentTypes = [
    { value: 'courses', label: 'Courses' },
    { value: 'lessons', label: 'Lessons' },
    { value: 'quizzes', label: 'Quizzes' },
    { value: 'flashcards', label: 'Flashcards' },
    { value: 'mindmaps', label: 'Mind Maps' },
    { value: 'keypoints', label: 'Key Points' }
  ];

  useEffect(() => {
    loadGuidelines();
  }, []);

  useEffect(() => {
    filterGuidelines();
  }, [guidelines, searchTerm, filterCategory, filterPriority]);

  const loadGuidelines = async () => {
    try {
      setLoading(true);
      const data = await db.get('aiGuidelines');
      setGuidelines(data);
    } catch (error) {
      console.error('Error loading AI guidelines:', error);
      toast({
        title: 'Error',
        description: 'Failed to load AI guidelines',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterGuidelines = () => {
    let filtered = guidelines;

    if (searchTerm) {
      filtered = filtered.filter(g => 
        g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.guideline.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(g => g.category === filterCategory);
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(g => g.priority === filterPriority);
    }

    setFilteredGuidelines(filtered);
  };

  const handleCreateGuideline = async (guidelineData: Partial<AIGuideline>) => {
    try {
      const newGuideline = await db.insert('aiGuidelines', {
        ...guidelineData,
        createdBy: 'admin', // TODO: Get from auth context
        isActive: true,
        tags: [],
        examples: []
      });
      
      setGuidelines([...guidelines, newGuideline]);
      setIsCreating(false);
      toast({
        title: 'Success',
        description: 'AI guideline created successfully'
      });
    } catch (error) {
      console.error('Error creating guideline:', error);
      toast({
        title: 'Error',
        description: 'Failed to create guideline',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateGuideline = async (id: string, updates: Partial<AIGuideline>) => {
    try {
      await db.update('aiGuidelines', id, updates);
      setGuidelines(guidelines.map(g => g.id === id ? { ...g, ...updates } : g));
      setEditingGuideline(null);
      toast({
        title: 'Success',
        description: 'Guideline updated successfully'
      });
    } catch (error) {
      console.error('Error updating guideline:', error);
      toast({
        title: 'Error',
        description: 'Failed to update guideline',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteGuideline = async (id: string) => {
    if (!confirm('Are you sure you want to delete this guideline?')) {
      return;
    }

    try {
      await db.delete('aiGuidelines', id);
      setGuidelines(guidelines.filter(g => g.id !== id));
      toast({
        title: 'Success',
        description: 'Guideline deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting guideline:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete guideline',
        variant: 'destructive'
      });
    }
  };

  const toggleGuidelineStatus = async (id: string, isActive: boolean) => {
    await handleUpdateGuideline(id, { isActive });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              AI Content Guidelines
            </CardTitle>
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Guideline
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Manage AI content generation guidelines to ensure appropriate and compliant content creation.
          </p>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search guidelines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {priorities.map(priority => (
                  <SelectItem key={priority.value} value={priority.value}>{priority.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Guidelines List */}
          <div className="space-y-4">
            {filteredGuidelines.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No guidelines found matching your criteria.</p>
              </div>
            ) : (
              filteredGuidelines.map((guideline) => (
                <GuidelineCard
                  key={guideline.id}
                  guideline={guideline}
                  isEditing={editingGuideline === guideline.id}
                  onEdit={() => setEditingGuideline(guideline.id)}
                  onSave={(updates) => handleUpdateGuideline(guideline.id, updates)}
                  onCancel={() => setEditingGuideline(null)}
                  onDelete={() => handleDeleteGuideline(guideline.id)}
                  onToggleStatus={(isActive) => toggleGuidelineStatus(guideline.id, isActive)}
                  categories={categories}
                  priorities={priorities}
                  contentTypes={contentTypes}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {isCreating && (
        <CreateGuidelineForm
          onSave={handleCreateGuideline}
          onCancel={() => setIsCreating(false)}
          categories={categories}
          priorities={priorities}
          contentTypes={contentTypes}
        />
      )}
    </div>
  );
};

interface GuidelineCardProps {
  guideline: AIGuideline;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (updates: Partial<AIGuideline>) => void;
  onCancel: () => void;
  onDelete: () => void;
  onToggleStatus: (isActive: boolean) => void;
  categories: any[];
  priorities: any[];
  contentTypes: any[];
}

const GuidelineCard: React.FC<GuidelineCardProps> = ({
  guideline,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onToggleStatus,
  categories,
  priorities,
  contentTypes
}) => {
  const [editForm, setEditForm] = useState({
    title: guideline.title,
    description: guideline.description,
    category: guideline.category,
    priority: guideline.priority,
    guideline: guideline.guideline,
    appliesTo: guideline.appliesTo
  });

  const handleSave = () => {
    onSave(editForm);
  };

  const categoryInfo = categories.find(c => c.value === guideline.category);
  const priorityInfo = priorities.find(p => p.value === guideline.priority);

  return (
    <Card className={`${guideline.isActive ? 'border-green-200' : 'border-gray-200 opacity-75'}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <Input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="Guideline title"
                />
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Brief description"
                  rows={2}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    value={editForm.category}
                    onValueChange={(value) => setEditForm({ ...editForm, category: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={editForm.priority}
                    onValueChange={(value) => setEditForm({ ...editForm, priority: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map(priority => (
                        <SelectItem key={priority.value} value={priority.value}>{priority.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  value={editForm.guideline}
                  onChange={(e) => setEditForm({ ...editForm, guideline: e.target.value })}
                  placeholder="Detailed guideline text"
                  rows={4}
                />
                <div className="space-y-2">
                  <Label>Applies To:</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {contentTypes.map(type => (
                      <div key={type.value} className="flex items-center space-x-2">
                        <Checkbox
                          checked={editForm.appliesTo.includes(type.value)}
                          onCheckedChange={(checked) => {
                            const newAppliesTo = checked
                              ? [...editForm.appliesTo, type.value]
                              : editForm.appliesTo.filter(t => t !== type.value);
                            setEditForm({ ...editForm, appliesTo: newAppliesTo });
                          }}
                        />
                        <Label className="text-sm">{type.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave}>Save</Button>
                  <Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {categoryInfo && <categoryInfo.icon className="h-5 w-5 text-gray-500" />}
                  <h3 className="font-semibold text-lg">{guideline.title}</h3>
                  <div className="flex gap-2">
                    <Badge className={priorityInfo?.color}>
                      {priorityInfo?.label}
                    </Badge>
                    <Badge variant="outline">
                      {categoryInfo?.label}
                    </Badge>
                  </div>
                </div>
                <p className="text-gray-600">{guideline.description}</p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-mono">{guideline.guideline}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {guideline.appliesTo.map(type => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {contentTypes.find(ct => ct.value === type)?.label || type}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 ml-4">
            <Switch
              checked={guideline.isActive}
              onCheckedChange={onToggleStatus}
            />
            {!isEditing && (
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={onEdit}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={onDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface CreateGuidelineFormProps {
  onSave: (guidelineData: Partial<AIGuideline>) => void;
  onCancel: () => void;
  categories: any[];
  priorities: any[];
  contentTypes: any[];
}

const CreateGuidelineForm: React.FC<CreateGuidelineFormProps> = ({
  onSave,
  onCancel,
  categories,
  priorities,
  contentTypes
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'content' as const,
    priority: 'medium' as const,
    guideline: '',
    appliesTo: ['courses', 'lessons']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.guideline.trim()) return;
    onSave(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Create New AI Guideline</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter guideline title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the guideline"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>{priority.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="guideline">Guideline Text</Label>
              <Textarea
                id="guideline"
                value={formData.guideline}
                onChange={(e) => setFormData({ ...formData, guideline: e.target.value })}
                placeholder="Enter the detailed guideline that AI should follow"
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Applies To:</Label>
              <div className="grid grid-cols-3 gap-2">
                {contentTypes.map(type => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.appliesTo.includes(type.value)}
                      onCheckedChange={(checked) => {
                        const newAppliesTo = checked
                          ? [...formData.appliesTo, type.value]
                          : formData.appliesTo.filter(t => t !== type.value);
                        setFormData({ ...formData, appliesTo: newAppliesTo });
                      }}
                    />
                    <Label className="text-sm">{type.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Create Guideline
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AIGuidelinesManager;

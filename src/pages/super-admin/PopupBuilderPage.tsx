import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Eye, 
  Save, 
  Trash2, 
  Copy,
  Settings,
  Target,
  Calendar,
  Users,
  BarChart3,
  Palette,
  Layout,
  Zap,
  Globe,
  Clock,
  MousePointer
} from 'lucide-react';
import { db } from '@/lib/github-sdk';
import { useToast } from '@/hooks/use-toast';

interface PopupRule {
  id: string;
  type: 'page' | 'time' | 'scroll' | 'exit' | 'user' | 'date';
  condition: string;
  value: string;
}

interface PopupDesign {
  template: 'modal' | 'banner' | 'slide' | 'corner';
  size: 'small' | 'medium' | 'large' | 'fullscreen';
  position: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  animation: 'fade' | 'slide' | 'bounce' | 'zoom' | 'flip';
  colors: {
    background: string;
    text: string;
    primary: string;
    secondary: string;
  };
  typography: {
    titleSize: string;
    bodySize: string;
    fontFamily: string;
  };
  spacing: {
    padding: string;
    margin: string;
    borderRadius: string;
  };
  overlay: {
    enabled: boolean;
    color: string;
    opacity: number;
  };
}

interface Popup {
  id: string;
  name: string;
  title: string;
  content: string;
  buttonText: string;
  buttonAction: 'close' | 'redirect' | 'custom';
  buttonUrl?: string;
  design: PopupDesign;
  rules: PopupRule[];
  isActive: boolean;
  priority: number;
  frequency: 'once' | 'session' | 'daily' | 'always';
  createdAt: string;
  updatedAt: string;
  stats: {
    views: number;
    clicks: number;
    conversions: number;
  };
}

const PopupBuilderPage: React.FC = () => {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [selectedPopup, setSelectedPopup] = useState<Popup | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const defaultPopup: Popup = {
    id: '',
    name: 'New Popup',
    title: 'Welcome to ProLearning!',
    content: 'Discover amazing courses and start your learning journey today.',
    buttonText: 'Get Started',
    buttonAction: 'close',
    design: {
      template: 'modal',
      size: 'medium',
      position: 'center',
      animation: 'fade',
      colors: {
        background: '#ffffff',
        text: '#1f2937',
        primary: '#16a34a',
        secondary: '#10b981'
      },
      typography: {
        titleSize: '24px',
        bodySize: '16px',
        fontFamily: 'Inter, sans-serif'
      },
      spacing: {
        padding: '32px',
        margin: '16px',
        borderRadius: '16px'
      },
      overlay: {
        enabled: true,
        color: '#000000',
        opacity: 0.5
      }
    },
    rules: [],
    isActive: false,
    priority: 1,
    frequency: 'once',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: {
      views: 0,
      clicks: 0,
      conversions: 0
    }
  };

  useEffect(() => {
    loadPopups();
  }, []);

  const loadPopups = async () => {
    try {
      const popupsData = await db.get('popups') || [];
      setPopups(popupsData);
    } catch (error) {
      console.error('Error loading popups:', error);
    }
  };

  const savePopup = async (popup: Popup) => {
    setIsLoading(true);
    try {
      const updatedPopup = {
        ...popup,
        updatedAt: new Date().toISOString()
      };

      if (popup.id) {
        await db.update('popups', popup.id, updatedPopup);
        setPopups(prev => prev.map(p => p.id === popup.id ? updatedPopup : p));
      } else {
        const newPopup = await db.insert('popups', {
          ...updatedPopup,
          id: `popup_${Date.now()}`,
          createdAt: new Date().toISOString()
        });
        setPopups(prev => [...prev, newPopup]);
      }

      toast({
        title: "Popup Saved",
        description: "Your popup has been saved successfully.",
      });

      setIsEditing(false);
      setSelectedPopup(null);
    } catch (error) {
      console.error('Error saving popup:', error);
      toast({
        title: "Error",
        description: "Failed to save popup. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deletePopup = async (id: string) => {
    if (!confirm('Are you sure you want to delete this popup?')) return;

    try {
      await db.delete('popups', id);
      setPopups(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Popup Deleted",
        description: "The popup has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting popup:', error);
      toast({
        title: "Error",
        description: "Failed to delete popup. Please try again.",
        variant: "destructive"
      });
    }
  };

  const duplicatePopup = async (popup: Popup) => {
    const duplicated = {
      ...popup,
      id: `popup_${Date.now()}`,
      name: `${popup.name} (Copy)`,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: { views: 0, clicks: 0, conversions: 0 }
    };

    try {
      const newPopup = await db.insert('popups', duplicated);
      setPopups(prev => [...prev, newPopup]);
      toast({
        title: "Popup Duplicated",
        description: "The popup has been duplicated successfully.",
      });
    } catch (error) {
      console.error('Error duplicating popup:', error);
    }
  };

  const togglePopupStatus = async (id: string, isActive: boolean) => {
    try {
      await db.update('popups', id, { isActive, updatedAt: new Date().toISOString() });
      setPopups(prev => prev.map(p => p.id === id ? { ...p, isActive } : p));
      toast({
        title: isActive ? "Popup Activated" : "Popup Deactivated",
        description: `The popup has been ${isActive ? 'activated' : 'deactivated'}.`,
      });
    } catch (error) {
      console.error('Error updating popup status:', error);
    }
  };

  const renderPopupPreview = (popup: Popup) => {
    const { design } = popup;
    
    const getPositionClasses = () => {
      switch (design.position) {
        case 'top': return 'top-4 left-1/2 transform -translate-x-1/2';
        case 'bottom': return 'bottom-4 left-1/2 transform -translate-x-1/2';
        case 'left': return 'left-4 top-1/2 transform -translate-y-1/2';
        case 'right': return 'right-4 top-1/2 transform -translate-y-1/2';
        case 'top-left': return 'top-4 left-4';
        case 'top-right': return 'top-4 right-4';
        case 'bottom-left': return 'bottom-4 left-4';
        case 'bottom-right': return 'bottom-4 right-4';
        default: return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      }
    };

    const getSizeClasses = () => {
      switch (design.size) {
        case 'small': return 'max-w-sm';
        case 'large': return 'max-w-2xl';
        case 'fullscreen': return 'w-full h-full max-w-none';
        default: return 'max-w-md';
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {design.overlay.enabled && (
          <div 
            className="absolute inset-0"
            style={{ 
              backgroundColor: design.overlay.color,
              opacity: design.overlay.opacity
            }}
          />
        )}
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`relative ${getSizeClasses()} mx-4`}
          style={{
            backgroundColor: design.colors.background,
            color: design.colors.text,
            padding: design.spacing.padding,
            borderRadius: design.spacing.borderRadius,
            fontFamily: design.typography.fontFamily
          }}
        >
          <div className="space-y-4">
            <h2 
              className="font-bold"
              style={{ 
                fontSize: design.typography.titleSize,
                color: design.colors.text
              }}
            >
              {popup.title}
            </h2>
            
            <p 
              style={{ 
                fontSize: design.typography.bodySize,
                color: design.colors.text
              }}
            >
              {popup.content}
            </p>
            
            <div className="flex gap-3">
              <Button
                style={{
                  backgroundColor: design.colors.primary,
                  color: '#ffffff',
                  borderRadius: design.spacing.borderRadius
                }}
              >
                {popup.buttonText}
              </Button>
              <Button
                variant="outline"
                onClick={() => setPreviewMode(false)}
                style={{ borderRadius: design.spacing.borderRadius }}
              >
                Close Preview
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderPopupList = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Popup Campaigns</h2>
          <p className="text-gray-600">Manage your popup campaigns and track performance</p>
        </div>
        <Button
          onClick={() => {
            setSelectedPopup({ ...defaultPopup, id: `popup_${Date.now()}` });
            setIsEditing(true);
            setActiveTab('editor');
          }}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Popup
        </Button>
      </div>

      <div className="grid gap-6">
        {popups.map((popup) => (
          <Card key={popup.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{popup.name}</h3>
                    <Badge variant={popup.isActive ? 'default' : 'secondary'} className={popup.isActive ? 'bg-green-600' : ''}>
                      {popup.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">Priority {popup.priority}</Badge>
                  </div>
                  <p className="text-gray-600 mb-3">{popup.title}</p>
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{popup.stats.views} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MousePointer className="h-4 w-4" />
                      <span>{popup.stats.clicks} clicks</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      <span>{popup.stats.conversions} conversions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Updated {new Date(popup.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedPopup(popup);
                      setPreviewMode(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedPopup(popup);
                      setIsEditing(true);
                      setActiveTab('editor');
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => duplicatePopup(popup)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Switch
                    checked={popup.isActive}
                    onCheckedChange={(checked) => togglePopupStatus(popup.id, checked)}
                    className="data-[state=checked]:bg-green-600"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deletePopup(popup.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {popups.length === 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Layout className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Popups Created</h3>
              <p className="text-gray-600 mb-4">Create your first popup campaign to engage with your users.</p>
              <Button
                onClick={() => {
                  setSelectedPopup({ ...defaultPopup, id: `popup_${Date.now()}` });
                  setIsEditing(true);
                  setActiveTab('editor');
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Popup
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
            <Layout className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">Popup Builder</h1>
            <p className="text-green-100">Create and manage engaging popup campaigns with advanced targeting</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/80 backdrop-blur-sm">
          <TabsTrigger value="list" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <Layout className="h-4 w-4 mr-2" />
            Campaigns
          </TabsTrigger>
          {isEditing && (
            <TabsTrigger value="editor" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <Edit className="h-4 w-4 mr-2" />
              Editor
            </TabsTrigger>
          )}
          <TabsTrigger value="analytics" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          {renderPopupList()}
        </TabsContent>

        <TabsContent value="editor">
          {selectedPopup && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Editor Panel */}
              <div className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Basic Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
                      <Input
                        value={selectedPopup.name}
                        onChange={(e) => setSelectedPopup(prev => prev ? { ...prev, name: e.target.value } : null)}
                        placeholder="Enter campaign name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <Input
                        value={selectedPopup.title}
                        onChange={(e) => setSelectedPopup(prev => prev ? { ...prev, title: e.target.value } : null)}
                        placeholder="Enter popup title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                      <Textarea
                        value={selectedPopup.content}
                        onChange={(e) => setSelectedPopup(prev => prev ? { ...prev, content: e.target.value } : null)}
                        placeholder="Enter popup content"
                        rows={4}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
                        <Input
                          value={selectedPopup.buttonText}
                          onChange={(e) => setSelectedPopup(prev => prev ? { ...prev, buttonText: e.target.value } : null)}
                          placeholder="Button text"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                        <Select
                          value={selectedPopup.priority.toString()}
                          onValueChange={(value) => setSelectedPopup(prev => prev ? { ...prev, priority: parseInt(value) } : null)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">High (1)</SelectItem>
                            <SelectItem value="2">Medium (2)</SelectItem>
                            <SelectItem value="3">Low (3)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Design Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
                        <Select
                          value={selectedPopup.design.template}
                          onValueChange={(value: any) => setSelectedPopup(prev => prev ? {
                            ...prev,
                            design: { ...prev.design, template: value }
                          } : null)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="modal">Modal</SelectItem>
                            <SelectItem value="banner">Banner</SelectItem>
                            <SelectItem value="slide">Slide-in</SelectItem>
                            <SelectItem value="corner">Corner</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                        <Select
                          value={selectedPopup.design.size}
                          onValueChange={(value: any) => setSelectedPopup(prev => prev ? {
                            ...prev,
                            design: { ...prev.design, size: value }
                          } : null)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                            <SelectItem value="fullscreen">Fullscreen</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                        <Input
                          type="color"
                          value={selectedPopup.design.colors.primary}
                          onChange={(e) => setSelectedPopup(prev => prev ? {
                            ...prev,
                            design: {
                              ...prev.design,
                              colors: { ...prev.design.colors, primary: e.target.value }
                            }
                          } : null)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                        <Input
                          type="color"
                          value={selectedPopup.design.colors.background}
                          onChange={(e) => setSelectedPopup(prev => prev ? {
                            ...prev,
                            design: {
                              ...prev.design,
                              colors: { ...prev.design.colors, background: e.target.value }
                            }
                          } : null)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button
                    onClick={() => selectedPopup && savePopup(selectedPopup)}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save Popup'}
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedPopup(selectedPopup);
                      setPreviewMode(true);
                    }}
                    variant="outline"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </div>

              {/* Live Preview */}
              <div className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Live Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative bg-gray-100 rounded-lg p-8 min-h-[400px] overflow-hidden">
                      <div className="absolute inset-4 bg-white rounded-lg shadow-lg flex items-center justify-center">
                        <div
                          className="max-w-sm mx-4 p-6 rounded-lg shadow-xl"
                          style={{
                            backgroundColor: selectedPopup.design.colors.background,
                            color: selectedPopup.design.colors.text,
                            borderRadius: selectedPopup.design.spacing.borderRadius
                          }}
                        >
                          <h3
                            className="font-bold mb-3"
                            style={{
                              fontSize: selectedPopup.design.typography.titleSize,
                              color: selectedPopup.design.colors.text
                            }}
                          >
                            {selectedPopup.title}
                          </h3>
                          <p
                            className="mb-4"
                            style={{
                              fontSize: selectedPopup.design.typography.bodySize,
                              color: selectedPopup.design.colors.text
                            }}
                          >
                            {selectedPopup.content}
                          </p>
                          <Button
                            size="sm"
                            style={{
                              backgroundColor: selectedPopup.design.colors.primary,
                              color: '#ffffff'
                            }}
                          >
                            {selectedPopup.buttonText}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          {/* Analytics will be implemented in the next part */}
          <div className="text-center py-12">
            <p className="text-gray-600">Analytics Dashboard - Implementation continues in next part</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewMode && selectedPopup && renderPopupPreview(selectedPopup)}
      </AnimatePresence>
    </div>
  );
};

export default PopupBuilderPage;

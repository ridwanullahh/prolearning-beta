import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  BellOff, 
  Settings, 
  Users, 
  BarChart3,
  Edit,
  Save,
  Eye,
  Send,
  Globe,
  Shield,
  Zap
} from 'lucide-react';
import { db } from '@/lib/github-sdk';
import { useToast } from '@/hooks/use-toast';

interface GlobalNotificationSettings {
  enabled: boolean;
  consentModalEnabled: boolean;
  consentModalConfig: {
    title: string;
    description: string;
    benefits: string[];
    design: {
      primaryColor: string;
      accentColor: string;
      borderRadius: string;
    };
  };
  defaultSettings: {
    courseUpdates: boolean;
    aiGeneration: boolean;
    messages: boolean;
    achievements: boolean;
    marketing: boolean;
  };
}

const NotificationManagementPage: React.FC = () => {
  const [globalSettings, setGlobalSettings] = useState<GlobalNotificationSettings>({
    enabled: true,
    consentModalEnabled: true,
    consentModalConfig: {
      title: 'Stay Updated with ProLearning',
      description: 'Get notified about course progress, new messages, and important updates to enhance your learning experience.',
      benefits: [
        'Course completion alerts',
        'New message notifications',
        'Achievement unlocks',
        'Important announcements'
      ],
      design: {
        primaryColor: '#16a34a',
        accentColor: '#10b981',
        borderRadius: '12px'
      }
    },
    defaultSettings: {
      courseUpdates: true,
      aiGeneration: true,
      messages: true,
      achievements: true,
      marketing: false
    }
  });
  const [stats, setStats] = useState({
    totalUsers: 0,
    enabledUsers: 0,
    disabledUsers: 0,
    consentRate: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
    loadStats();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await db.getItem('systemSettings', 'notifications');
      if (settings) {
        setGlobalSettings(prev => ({ ...prev, ...settings }));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const loadStats = async () => {
    try {
      const users = await db.get('users');
      const totalUsers = users.length;
      const enabledUsers = users.filter((u: any) => u.notificationConsent === true).length;
      const disabledUsers = totalUsers - enabledUsers;
      const consentRate = totalUsers > 0 ? Math.round((enabledUsers / totalUsers) * 100) : 0;

      setStats({
        totalUsers,
        enabledUsers,
        disabledUsers,
        consentRate
      });
    } catch (error) {
      console.error('Error loading notification stats:', error);
    }
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      await db.upsert('systemSettings', 'notifications', {
        ...globalSettings,
        updatedAt: new Date().toISOString()
      });

      toast({
        title: "Settings Saved",
        description: "Global notification settings have been updated.",
      });
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast({
        title: "Error",
        description: "Failed to save notification settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      // Send test notification to all users with consent
      const users = await db.get('users');
      const consentedUsers = users.filter((u: any) => u.notificationConsent === true);

      // This would integrate with your push notification service
      toast({
        title: "Test Notification Sent",
        description: `Test notification sent to ${consentedUsers.length} users.`,
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: "Error",
        description: "Failed to send test notification.",
        variant: "destructive"
      });
    }
  };

  const renderConsentModalPreview = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
        <div className="text-center space-y-6">
          <div 
            className="mx-auto w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: globalSettings.consentModalConfig.design.primaryColor }}
          >
            <Bell className="h-8 w-8 text-white" />
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {globalSettings.consentModalConfig.title}
            </h2>
            <p className="text-gray-600">
              {globalSettings.consentModalConfig.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left">
            {globalSettings.consentModalConfig.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: globalSettings.consentModalConfig.design.accentColor }}
                />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              className="flex-1"
              style={{ 
                backgroundColor: globalSettings.consentModalConfig.design.primaryColor,
                borderRadius: globalSettings.consentModalConfig.design.borderRadius
              }}
            >
              Allow Notifications
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              style={{ borderRadius: globalSettings.consentModalConfig.design.borderRadius }}
            >
              Customize
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-3xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl">
              <Settings className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Notification Management</h1>
              <p className="text-green-100">Configure global notification settings and consent modal</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setPreviewMode(true)}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview Modal
            </Button>
            <Button
              onClick={sendTestNotification}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Test
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Bell className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Enabled</p>
                <p className="text-2xl font-bold text-gray-900">{stats.enabledUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <BellOff className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Disabled</p>
                <p className="text-2xl font-bold text-gray-900">{stats.disabledUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Consent Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.consentRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="global" className="space-y-6">
        <TabsList className="bg-white/80 backdrop-blur-sm">
          <TabsTrigger value="global" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            Global Settings
          </TabsTrigger>
          <TabsTrigger value="modal" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            Consent Modal
          </TabsTrigger>
          <TabsTrigger value="defaults" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            Default Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-green-600" />
                Global Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Enable Notifications System</h4>
                  <p className="text-sm text-gray-600">Master switch for all notifications</p>
                </div>
                <Switch
                  checked={globalSettings.enabled}
                  onCheckedChange={(checked) => 
                    setGlobalSettings(prev => ({ ...prev, enabled: checked }))
                  }
                  className="data-[state=checked]:bg-green-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Show Consent Modal</h4>
                  <p className="text-sm text-gray-600">Display consent modal to new users</p>
                </div>
                <Switch
                  checked={globalSettings.consentModalEnabled}
                  onCheckedChange={(checked) => 
                    setGlobalSettings(prev => ({ ...prev, consentModalEnabled: checked }))
                  }
                  className="data-[state=checked]:bg-green-600"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modal" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-green-600" />
                Consent Modal Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Modal Title</label>
                    <Input
                      value={globalSettings.consentModalConfig.title}
                      onChange={(e) => setGlobalSettings(prev => ({
                        ...prev,
                        consentModalConfig: {
                          ...prev.consentModalConfig,
                          title: e.target.value
                        }
                      }))}
                      placeholder="Enter modal title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <Textarea
                      value={globalSettings.consentModalConfig.description}
                      onChange={(e) => setGlobalSettings(prev => ({
                        ...prev,
                        consentModalConfig: {
                          ...prev.consentModalConfig,
                          description: e.target.value
                        }
                      }))}
                      placeholder="Enter modal description"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Benefits (one per line)</label>
                    <Textarea
                      value={globalSettings.consentModalConfig.benefits.join('\n')}
                      onChange={(e) => setGlobalSettings(prev => ({
                        ...prev,
                        consentModalConfig: {
                          ...prev.consentModalConfig,
                          benefits: e.target.value.split('\n').filter(b => b.trim())
                        }
                      }))}
                      placeholder="Enter benefits, one per line"
                      rows={4}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                    <Input
                      type="color"
                      value={globalSettings.consentModalConfig.design.primaryColor}
                      onChange={(e) => setGlobalSettings(prev => ({
                        ...prev,
                        consentModalConfig: {
                          ...prev.consentModalConfig,
                          design: {
                            ...prev.consentModalConfig.design,
                            primaryColor: e.target.value
                          }
                        }
                      }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                    <Input
                      type="color"
                      value={globalSettings.consentModalConfig.design.accentColor}
                      onChange={(e) => setGlobalSettings(prev => ({
                        ...prev,
                        consentModalConfig: {
                          ...prev.consentModalConfig,
                          design: {
                            ...prev.consentModalConfig.design,
                            accentColor: e.target.value
                          }
                        }
                      }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Border Radius</label>
                    <Input
                      value={globalSettings.consentModalConfig.design.borderRadius}
                      onChange={(e) => setGlobalSettings(prev => ({
                        ...prev,
                        consentModalConfig: {
                          ...prev.consentModalConfig,
                          design: {
                            ...prev.consentModalConfig.design,
                            borderRadius: e.target.value
                          }
                        }
                      }))}
                      placeholder="e.g., 12px"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="defaults" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Default User Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(globalSettings.defaultSettings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Default setting for new users
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => 
                      setGlobalSettings(prev => ({
                        ...prev,
                        defaultSettings: {
                          ...prev.defaultSettings,
                          [key]: checked
                        }
                      }))
                    }
                    className="data-[state=checked]:bg-green-600"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={saveSettings}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 text-white px-8"
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* Preview Modal */}
      {previewMode && (
        <>
          {renderConsentModalPreview()}
          <Button
            onClick={() => setPreviewMode(false)}
            className="fixed top-4 right-4 z-50"
            variant="outline"
          >
            Close Preview
          </Button>
        </>
      )}
    </div>
  );
};

export default NotificationManagementPage;

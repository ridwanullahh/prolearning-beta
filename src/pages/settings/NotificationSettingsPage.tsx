import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  BellOff, 
  Sparkles, 
  BookOpen, 
  MessageSquare, 
  Award,
  Zap,
  Shield,
  Smartphone,
  Mail,
  Globe,
  Clock,
  Volume2,
  VolumeX
} from 'lucide-react';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface NotificationSettings {
  courseUpdates: boolean;
  aiGeneration: boolean;
  messages: boolean;
  achievements: boolean;
  marketing: boolean;
  email: boolean;
  push: boolean;
  sound: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const NotificationSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    courseUpdates: true,
    aiGeneration: true,
    messages: true,
    achievements: true,
    marketing: false,
    email: true,
    push: true,
    sound: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default');
  const currentUser = authService.getCurrentUser();
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
    setBrowserPermission(Notification.permission);
  }, []);

  const loadSettings = async () => {
    if (!currentUser) return;

    try {
      const user = await db.getItem('users', currentUser.id);
      if (user?.notificationSettings) {
        setSettings(prev => ({ ...prev, ...user.notificationSettings }));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const saveSettings = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      await db.update('users', currentUser.id, {
        notificationSettings: settings,
        updatedAt: new Date().toISOString()
      });

      toast({
        title: "Settings Saved",
        description: "Your notification preferences have been updated.",
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

  const requestBrowserPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);
      
      if (permission === 'granted') {
        setSettings(prev => ({ ...prev, push: true }));
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive push notifications from ProLearning.",
        });
      } else {
        setSettings(prev => ({ ...prev, push: false }));
        toast({
          title: "Notifications Blocked",
          description: "Push notifications are disabled. You can enable them in your browser settings.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const testNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('ProLearning Test', {
        body: 'This is a test notification to verify your settings.',
        icon: '/favicon.ico'
      });
    } else {
      toast({
        title: "Cannot Send Test",
        description: "Please enable browser notifications first.",
        variant: "destructive"
      });
    }
  };

  const notificationTypes = [
    {
      key: 'courseUpdates' as keyof NotificationSettings,
      title: 'Course Updates',
      description: 'New lessons, announcements, and course progress',
      icon: BookOpen,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      key: 'aiGeneration' as keyof NotificationSettings,
      title: 'AI Generation',
      description: 'Course generation progress and completion alerts',
      icon: Sparkles,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      key: 'messages' as keyof NotificationSettings,
      title: 'Messages & Forum',
      description: 'Direct messages and forum discussions',
      icon: MessageSquare,
      color: 'bg-green-100 text-green-600'
    },
    {
      key: 'achievements' as keyof NotificationSettings,
      title: 'Achievements',
      description: 'Badges, certificates, and milestones',
      icon: Award,
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      key: 'marketing' as keyof NotificationSettings,
      title: 'Updates & Offers',
      description: 'Platform updates and special offers',
      icon: Zap,
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-3xl p-8 text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-2xl">
            <Bell className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">Notification Settings</h1>
            <p className="text-green-100">Manage how and when you receive notifications</p>
          </div>
        </div>
      </div>

      {/* Browser Permission Status */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-green-600" />
            Browser Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Push Notification Status</p>
              <p className="text-sm text-gray-600">
                {browserPermission === 'granted' && 'Notifications are enabled'}
                {browserPermission === 'denied' && 'Notifications are blocked'}
                {browserPermission === 'default' && 'Permission not requested'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={browserPermission === 'granted' ? 'default' : 'destructive'}
                className={browserPermission === 'granted' ? 'bg-green-600' : ''}
              >
                {browserPermission === 'granted' && 'Enabled'}
                {browserPermission === 'denied' && 'Blocked'}
                {browserPermission === 'default' && 'Not Set'}
              </Badge>
              {browserPermission !== 'granted' && (
                <Button onClick={requestBrowserPermission} size="sm">
                  Enable
                </Button>
              )}
              {browserPermission === 'granted' && (
                <Button onClick={testNotification} variant="outline" size="sm">
                  Test
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-green-600" />
            Notification Types
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {notificationTypes.map((type, index) => (
            <div key={type.key}>
              <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${type.color}`}>
                    <type.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{type.title}</h4>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>
                </div>
                <Switch
                  checked={settings[type.key] as boolean}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, [type.key]: checked }))
                  }
                  className="data-[state=checked]:bg-green-600"
                />
              </div>
              {index < notificationTypes.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Delivery Methods */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-green-600" />
            Delivery Methods
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Email Notifications</h4>
                <p className="text-sm text-gray-600">Receive notifications via email</p>
              </div>
            </div>
            <Switch
              checked={settings.email}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, email: checked }))
              }
              className="data-[state=checked]:bg-green-600"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 text-green-600">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Push Notifications</h4>
                <p className="text-sm text-gray-600">Receive instant browser notifications</p>
              </div>
            </div>
            <Switch
              checked={settings.push && browserPermission === 'granted'}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, push: checked }))
              }
              disabled={browserPermission !== 'granted'}
              className="data-[state=checked]:bg-green-600"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                {settings.sound ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Sound Alerts</h4>
                <p className="text-sm text-gray-600">Play sound with notifications</p>
              </div>
            </div>
            <Switch
              checked={settings.sound}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, sound: checked }))
              }
              className="data-[state=checked]:bg-green-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={saveSettings}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 text-white px-8"
        >
          {isLoading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;

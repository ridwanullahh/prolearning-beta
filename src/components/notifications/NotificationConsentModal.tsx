import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  BellOff, 
  Sparkles, 
  BookOpen, 
  MessageSquare, 
  Award,
  X,
  Check,
  Settings,
  Shield,
  Zap
} from 'lucide-react';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';

interface NotificationConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConsent: (granted: boolean) => void;
}

interface NotificationSettings {
  courseUpdates: boolean;
  aiGeneration: boolean;
  messages: boolean;
  achievements: boolean;
  marketing: boolean;
}

const NotificationConsentModal: React.FC<NotificationConsentModalProps> = ({
  isOpen,
  onClose,
  onConsent
}) => {
  const [step, setStep] = useState<'intro' | 'customize' | 'confirm'>('intro');
  const [settings, setSettings] = useState<NotificationSettings>({
    courseUpdates: true,
    aiGeneration: true,
    messages: true,
    achievements: true,
    marketing: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const currentUser = authService.getCurrentUser();

  const notificationTypes = [
    {
      key: 'courseUpdates' as keyof NotificationSettings,
      title: 'Course Updates',
      description: 'New lessons, announcements, and course progress',
      icon: BookOpen,
      color: 'bg-blue-100 text-blue-600',
      examples: ['New lesson available', 'Course completed', 'Assignment due']
    },
    {
      key: 'aiGeneration' as keyof NotificationSettings,
      title: 'AI Generation',
      description: 'Course generation progress and completion alerts',
      icon: Sparkles,
      color: 'bg-purple-100 text-purple-600',
      examples: ['Course generation started', 'Generation completed', 'Generation failed']
    },
    {
      key: 'messages' as keyof NotificationSettings,
      title: 'Messages & Forum',
      description: 'Direct messages and forum discussions',
      icon: MessageSquare,
      color: 'bg-green-100 text-green-600',
      examples: ['New message received', 'Forum reply', 'Mention in discussion']
    },
    {
      key: 'achievements' as keyof NotificationSettings,
      title: 'Achievements',
      description: 'Badges, certificates, and milestones',
      icon: Award,
      color: 'bg-yellow-100 text-yellow-600',
      examples: ['Badge earned', 'Certificate ready', 'Milestone reached']
    },
    {
      key: 'marketing' as keyof NotificationSettings,
      title: 'Updates & Offers',
      description: 'Platform updates and special offers',
      icon: Zap,
      color: 'bg-orange-100 text-orange-600',
      examples: ['New features', 'Special discounts', 'Platform updates']
    }
  ];

  const handleAllow = async () => {
    setIsLoading(true);
    try {
      // Save notification preferences
      if (currentUser) {
        await db.update('users', currentUser.id, {
          notificationSettings: settings,
          notificationConsent: true,
          notificationConsentDate: new Date().toISOString()
        });
      }

      // Request browser permission
      const permission = await Notification.requestPermission();
      onConsent(permission === 'granted');
      onClose();
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      onConsent(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeny = async () => {
    setIsLoading(true);
    try {
      if (currentUser) {
        await db.update('users', currentUser.id, {
          notificationSettings: {
            courseUpdates: false,
            aiGeneration: false,
            messages: false,
            achievements: false,
            marketing: false
          },
          notificationConsent: false,
          notificationConsentDate: new Date().toISOString()
        });
      }
      onConsent(false);
      onClose();
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomize = () => {
    setStep('customize');
  };

  const handleSaveCustom = async () => {
    setIsLoading(true);
    try {
      if (currentUser) {
        await db.update('users', currentUser.id, {
          notificationSettings: settings,
          notificationConsent: Object.values(settings).some(Boolean),
          notificationConsentDate: new Date().toISOString()
        });
      }

      if (Object.values(settings).some(Boolean)) {
        const permission = await Notification.requestPermission();
        onConsent(permission === 'granted');
      } else {
        onConsent(false);
      }
      onClose();
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderIntroStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center space-y-6"
    >
      <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
        <Bell className="h-10 w-10 text-white" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Stay Updated with ProLearning</h2>
        <p className="text-gray-600 text-lg">
          Get notified about course progress, new messages, and important updates to enhance your learning experience.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-left">
        {notificationTypes.slice(0, 4).map((type) => (
          <div key={type.key} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className={`p-2 rounded-lg ${type.color}`}>
              <type.icon className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-900">{type.title}</h4>
              <p className="text-xs text-gray-600">{type.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Shield className="h-4 w-4" />
        <span>We respect your privacy. You can change these settings anytime.</span>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleAllow}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          disabled={isLoading}
        >
          <Check className="h-4 w-4 mr-2" />
          Allow Notifications
        </Button>
        <Button
          onClick={handleCustomize}
          variant="outline"
          className="flex-1"
          disabled={isLoading}
        >
          <Settings className="h-4 w-4 mr-2" />
          Customize
        </Button>
        <Button
          onClick={handleDeny}
          variant="ghost"
          className="px-4"
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );

  const renderCustomizeStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Customize Your Notifications</h2>
        <p className="text-gray-600">Choose which notifications you'd like to receive</p>
      </div>

      <div className="space-y-4">
        {notificationTypes.map((type) => (
          <div key={type.key} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
            <div className="flex items-start gap-3 flex-1">
              <div className={`p-2 rounded-lg ${type.color}`}>
                <type.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900">{type.title}</h4>
                  {type.key === 'marketing' && (
                    <Badge variant="secondary" className="text-xs">Optional</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                <div className="flex flex-wrap gap-1">
                  {type.examples.map((example, index) => (
                    <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <Switch
              checked={settings[type.key]}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, [type.key]: checked }))
              }
              className="data-[state=checked]:bg-green-600"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => setStep('intro')}
          variant="outline"
          className="flex-1"
          disabled={isLoading}
        >
          Back
        </Button>
        <Button
          onClick={handleSaveCustom}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          disabled={isLoading}
        >
          Save Preferences
        </Button>
      </div>
    </motion.div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6">
          <AnimatePresence mode="wait">
            {step === 'intro' && renderIntroStep()}
            {step === 'customize' && renderCustomizeStep()}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationConsentModal;

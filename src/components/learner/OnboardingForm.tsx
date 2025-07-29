import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../lib/github-sdk';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { useToast } from '../ui/use-toast';
import { Checkbox } from '../ui/checkbox';

const OnboardingForm: React.FC = () => {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    learningGoals: '',
    interests: [] as string[],
    notifications: {
      newCourses: true,
      promotions: true,
      updates: true,
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInterestChange = (interest: string) => {
    setFormData(prev => {
      const interests = prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests };
    });
  };

  const handleNotificationChange = (key: string) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key as keyof typeof prev.notifications]
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const updatedProfile = {
        profile: {
          ...user.profile,
          ...formData,
        },
        onboardingCompleted: true,
      };

      await db.update('users', user.id, updatedProfile);

      const updatedUser = { ...user, ...updatedProfile };
      setUser(updatedUser);

      toast({
        title: 'Onboarding Complete',
        description: 'Your profile has been updated.',
      });
    } catch (error) {
      console.error('Failed to submit onboarding form:', error);
      toast({
        title: 'Submission Failed',
        description: 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const interestsOptions = ['Web Development', 'Data Science', 'Marketing', 'Design', 'Business'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="learningGoals" className="block text-sm font-medium text-gray-700">
          What are your learning goals?
        </label>
        <Textarea
          id="learningGoals"
          name="learningGoals"
          rows={5}
          value={formData.learningGoals}
          onChange={(e) => setFormData({ ...formData, learningGoals: e.target.value })}
          placeholder="e.g., I want to learn React to build web applications."
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          What are your interests?
        </label>
        <div className="flex flex-wrap gap-2 mt-2">
          {interestsOptions.map(interest => (
            <Button
              key={interest}
              type="button"
              variant={formData.interests.includes(interest) ? 'default' : 'outline'}
              onClick={() => handleInterestChange(interest)}
            >
              {interest}
            </Button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Notification Preferences
        </label>
        <div className="space-y-2 mt-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="newCourses"
              checked={formData.notifications.newCourses}
              onCheckedChange={() => handleNotificationChange('newCourses')}
            />
            <label htmlFor="newCourses">New course recommendations</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="promotions"
              checked={formData.notifications.promotions}
              onCheckedChange={() => handleNotificationChange('promotions')}
            />
            <label htmlFor="promotions">Promotions and special offers</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="updates"
              checked={formData.notifications.updates}
              onCheckedChange={() => handleNotificationChange('updates')}
            />
            <label htmlFor="updates">Product updates and announcements</label>
          </div>
        </div>
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save and Continue'}
      </Button>
    </form>
  );
};

export default OnboardingForm;
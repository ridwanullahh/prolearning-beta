import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../lib/github-sdk';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useToast } from '../ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const OnboardingForm: React.FC = () => {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [qualifications, setQualifications] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    headline: '',
    bio: '',
    qualificationId: '',
    experience: '',
    linkedIn: '',
    website: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchQualifications = async () => {
      const quals = await db.get('qualifications');
      setQualifications(quals);
    };
    fetchQualifications();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleQualificationChange = (value: string) => {
    setFormData({ ...formData, qualificationId: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { qualificationId, ...instructorProfile } = formData;

      await db.insert('instructorQualifications', {
        instructorId: user.id,
        qualificationId,
        status: 'pending',
        documentUrl: '', // TODO: Add document upload
      });

      const updatedProfile = {
        instructorProfile,
        onboardingCompleted: true,
      };

      await db.update('users', user.id, updatedProfile);
      
      const updatedUser = { ...user, ...updatedProfile };
      setUser(updatedUser);

      toast({
        title: 'Onboarding Complete',
        description: 'Your profile has been submitted for review.',
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <Input
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="headline" className="block text-sm font-medium text-gray-700">
          Professional Headline
        </label>
        <Input
          id="headline"
          name="headline"
          value={formData.headline}
          onChange={handleChange}
          placeholder="e.g., Senior Software Engineer | AI Enthusiast"
          required
        />
      </div>
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
          Biography
        </label>
        <Textarea
          id="bio"
          name="bio"
          rows={5}
          value={formData.bio}
          onChange={handleChange}
          placeholder="Tell us about your professional background and expertise."
          required
        />
      </div>
      <div>
        <label htmlFor="qualificationId" className="block text-sm font-medium text-gray-700">
          Highest Qualification
        </label>
        <Select onValueChange={handleQualificationChange} defaultValue={formData.qualificationId}>
          <SelectTrigger>
            <SelectValue placeholder="Select your highest qualification" />
          </SelectTrigger>
          <SelectContent>
            {qualifications.map(q => (
              <SelectItem key={q.id} value={q.id}>
                {q.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
          Teaching Experience
        </label>
        <Textarea
          id="experience"
          name="experience"
          rows={5}
          value={formData.experience}
          onChange={handleChange}
          placeholder="Describe your teaching experience, both online and offline."
          required
        />
      </div>
      <div>
        <label htmlFor="linkedIn" className="block text-sm font-medium text-gray-700">
          LinkedIn Profile (Optional)
        </label>
        <Input
          id="linkedIn"
          name="linkedIn"
          type="url"
          value={formData.linkedIn}
          onChange={handleChange}
          placeholder="https://www.linkedin.com/in/your-profile"
        />
      </div>
      <div>
        <label htmlFor="website" className="block text-sm font-medium text-gray-700">
          Website/Portfolio (Optional)
        </label>
        <Input
          id="website"
          name="website"
          type="url"
          value={formData.website}
          onChange={handleChange}
          placeholder="https://your-website.com"
        />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit for Review'}
      </Button>
    </form>
  );
};

export default OnboardingForm;
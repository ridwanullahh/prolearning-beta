import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from 'lucide-react';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';

interface CreateThreadModalProps {
  courseId: string;
  lessonId?: string;
  onThreadCreated: () => void;
  children: React.ReactNode;
}

const CreateThreadModal: React.FC<CreateThreadModalProps> = ({
  courseId,
  lessonId,
  onThreadCreated,
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('general');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentUser = authService.getCurrentUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      // Ensure forum exists for the course
      let forum = await db.queryBuilder('forums')
        .where((f: any) => f.courseId === courseId)
        .exec();
      
      if (forum.length === 0) {
        const course = await db.getItem('courses', courseId);
        await db.insert('forums', {
          courseId,
          title: `${course?.title || 'Course'} Forum`,
          description: `Discussion forum for ${course?.title || 'this course'}`,
          isActive: true
        });
      }

      // Create the thread
      await db.insert('forumThreads', {
        forumId: courseId, // Using courseId as forumId for simplicity
        courseId,
        lessonId: lessonId || null,
        userId: currentUser.id,
        title: title.trim(),
        content: content.trim(),
        type,
        isPinned: false,
        isLocked: false,
        isAnswered: false,
        tags,
        viewCount: 0,
        lastActivityAt: new Date().toISOString(),
        lastActivityUserId: currentUser.id
      });

      // Reset form
      setTitle('');
      setContent('');
      setType('general');
      setTags([]);
      setNewTag('');
      setIsOpen(false);
      
      onThreadCreated();
    } catch (error) {
      console.error('Error creating thread:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 5) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Start New Discussion
            {lessonId && <span className="text-sm font-normal text-muted-foreground ml-2">(Lesson-specific)</span>}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="thread-type">Discussion Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select discussion type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Discussion</SelectItem>
                <SelectItem value="question">Question</SelectItem>
                <SelectItem value="discussion">Course Discussion</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="thread-title">Title</Label>
            <Input
              id="thread-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter discussion title..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thread-content">Content</Label>
            <Textarea
              id="thread-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, ask questions, or start a discussion..."
              rows={6}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thread-tags">Tags (optional)</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                id="thread-tags"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag..."
                disabled={tags.length >= 5}
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={addTag}
                disabled={!newTag.trim() || tags.includes(newTag.trim()) || tags.length >= 5}
              >
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Press Enter to add tags. Maximum 5 tags allowed.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!title.trim() || !content.trim() || isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Discussion'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateThreadModal;

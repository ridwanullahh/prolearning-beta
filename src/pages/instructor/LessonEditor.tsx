
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Upload, Trash2 } from 'lucide-react';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import RichTextEditor from '@/components/shared/RichTextEditor';

const LessonEditor = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(!!lessonId);
  const [loading, setLoading] = useState(false);
  const [lesson, setLesson] = useState({
    title: '',
    description: '',
    content: '',
    order: 1,
    duration: 30,
    type: 'text',
    videoUrl: '',
    isRequired: true,
    releaseType: 'immediate',
    scheduledReleaseDate: '',
    dripDays: 0,
    attachments: '[]'
  });
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (lessonId) {
      loadLesson();
    }
  }, [lessonId]);

  const loadLesson = async () => {
    try {
      const lessonData = await db.getItem('lessons', lessonId!);
      if (lessonData) {
        setLesson({
          title: lessonData.title || '',
          description: lessonData.description || '',
          content: lessonData.content || '',
          order: lessonData.order || 1,
          duration: lessonData.duration || 30,
          type: lessonData.type || 'text',
          videoUrl: lessonData.videoUrl || '',
          isRequired: lessonData.isRequired !== false,
          releaseType: lessonData.releaseType || 'immediate',
          scheduledReleaseDate: lessonData.scheduledReleaseDate || '',
          dripDays: lessonData.dripDays || 0,
          attachments: lessonData.attachments || '[]'
        });
      }
    } catch (error) {
      console.error('Error loading lesson:', error);
    }
  };

  const saveLesson = async () => {
    if (!user || !courseId) return;

    try {
      setLoading(true);

      const lessonData = {
        ...lesson,
        courseId: courseId,
        creatorId: user.id,
        updatedAt: new Date().toISOString()
      };

      if (isEditing && lessonId) {
        await db.update('lessons', lessonId, lessonData);
      } else {
        await db.insert('lessons', lessonData);
      }

      toast({
        title: 'Success',
        description: 'Lesson saved successfully',
      });

      navigate(`/instruct/courses/${courseId}/edit`);
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast({
        title: 'Error',
        description: 'Failed to save lesson',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (content: string) => {
    setLesson(prev => ({ ...prev, content }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(`/instruct/courses/${courseId}/edit`)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Course
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit Lesson' : 'Create New Lesson'}
              </h1>
              <p className="text-gray-600">
                {isEditing ? 'Update your lesson content' : 'Add a new lesson to your course'}
              </p>
            </div>
            
            <Button onClick={saveLesson} disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              Save Lesson
            </Button>
          </div>
        </div>

        {/* Lesson Editor */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Lesson Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Lesson Title</Label>
                    <Input
                      id="title"
                      value={lesson.title}
                      onChange={(e) => setLesson(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter lesson title"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="order">Lesson Order</Label>
                    <Input
                      id="order"
                      type="number"
                      value={lesson.order}
                      onChange={(e) => setLesson(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={lesson.description}
                    onChange={(e) => setLesson(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the lesson"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Lesson Content</Label>
                  <RichTextEditor
                    value={lesson.content}
                    onChange={handleContentChange}
                    placeholder="Enter your lesson content here..."
                  />
                </div>

                {lesson.type === 'video' && (
                  <div>
                    <Label htmlFor="videoUrl">Video URL</Label>
                    <Input
                      id="videoUrl"
                      value={lesson.videoUrl}
                      onChange={(e) => setLesson(prev => ({ ...prev, videoUrl: e.target.value }))}
                      placeholder="Enter video URL"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Lesson Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="type">Content Type</Label>
                  <select
                    id="type"
                    value={lesson.type}
                    onChange={(e) => setLesson(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="text">Text/Article</option>
                    <option value="video">Video</option>
                    <option value="quiz">Quiz</option>
                    <option value="assignment">Assignment</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={lesson.duration}
                    onChange={(e) => setLesson(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    min="1"
                  />
                </div>

                <div>
                  <Label htmlFor="releaseType">Release Type</Label>
                  <select
                    id="releaseType"
                    value={lesson.releaseType}
                    onChange={(e) => setLesson(prev => ({ ...prev, releaseType: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="immediate">Immediate</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="drip">Drip Content</option>
                  </select>
                </div>

                {lesson.releaseType === 'scheduled' && (
                  <div>
                    <Label htmlFor="scheduledDate">Release Date</Label>
                    <Input
                      id="scheduledDate"
                      type="datetime-local"
                      value={lesson.scheduledReleaseDate}
                      onChange={(e) => setLesson(prev => ({ ...prev, scheduledReleaseDate: e.target.value }))}
                    />
                  </div>
                )}

                {lesson.releaseType === 'drip' && (
                  <div>
                    <Label htmlFor="dripDays">Release After (days)</Label>
                    <Input
                      id="dripDays"
                      type="number"
                      value={lesson.dripDays}
                      onChange={(e) => setLesson(prev => ({ ...prev, dripDays: parseInt(e.target.value) }))}
                      min="0"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isRequired"
                    checked={lesson.isRequired}
                    onChange={(e) => setLesson(prev => ({ ...prev, isRequired: e.target.checked }))}
                  />
                  <Label htmlFor="isRequired">Required Lesson</Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonEditor;

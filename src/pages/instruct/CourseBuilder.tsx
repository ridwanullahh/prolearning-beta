
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Save, Eye, Trash2, Edit3 } from 'lucide-react';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';

interface Lesson {
  id: string;
  title: string;
  content: string;
  order: number;
  videoUrl?: string;
  resources?: string[];
}

interface Course {
  id?: string;
  title: string;
  description: string;
  level: string;
  subject: string;
  difficulty: string;
  price: number;
  lessons: Lesson[];
  published: boolean;
}

const CourseBuilder = () => {
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course>({
    title: '',
    description: '',
    level: 'undergraduate',
    subject: '',
    difficulty: 'beginner',
    price: 0,
    lessons: [],
    published: false
  });
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const academicLevels = [
    'Early Childhood', 'Primary School', 'Junior Secondary', 
    'Senior Secondary', 'Undergraduate', 'Postgraduate'
  ];

  const difficultyLevels = ['beginner', 'intermediate', 'advanced'];

  const handleSaveCourse = async () => {
    if (!course.title || !course.description || !course.subject) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      const user = authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const courseData = {
        ...course,
        userId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (course.id) {
        await db.updateCourse(course.id, courseData);
        toast({
          title: "Course Updated",
          description: "Your course has been updated successfully"
        });
      } else {
        const newCourse = await db.createCourse(courseData);
        setCourse({ ...course, id: newCourse.id });
        toast({
          title: "Course Created",
          description: "Your course has been created successfully"
        });
      }
    } catch (error) {
      console.error('Error saving course:', error);
      toast({
        title: "Error",
        description: "Failed to save course",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddLesson = () => {
    setCurrentLesson({
      id: `lesson-${Date.now()}`,
      title: '',
      content: '',
      order: course.lessons.length + 1
    });
    setShowLessonForm(true);
  };

  const handleSaveLesson = () => {
    if (!currentLesson?.title || !currentLesson?.content) {
      toast({
        title: "Missing Information",
        description: "Please fill in lesson title and content",
        variant: "destructive"
      });
      return;
    }

    const updatedLessons = currentLesson.id.startsWith('lesson-')
      ? [...course.lessons, currentLesson]
      : course.lessons.map(l => l.id === currentLesson.id ? currentLesson : l);

    setCourse({ ...course, lessons: updatedLessons });
    setCurrentLesson(null);
    setShowLessonForm(false);
    
    toast({
      title: "Lesson Saved",
      description: "Lesson has been added to your course"
    });
  };

  const handleDeleteLesson = (lessonId: string) => {
    const updatedLessons = course.lessons.filter(l => l.id !== lessonId);
    setCourse({ ...course, lessons: updatedLessons });
    
    toast({
      title: "Lesson Deleted",
      description: "Lesson has been removed from your course"
    });
  };

  const handlePublish = async () => {
    if (course.lessons.length === 0) {
      toast({
        title: "Cannot Publish",
        description: "Please add at least one lesson before publishing",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      const updatedCourse = { ...course, published: true };
      
      if (course.id) {
        await db.updateCourse(course.id, updatedCourse);
        setCourse(updatedCourse);
        toast({
          title: "Course Published",
          description: "Your course is now live and available to students"
        });
      } else {
        toast({
          title: "Save First",
          description: "Please save your course before publishing",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error publishing course:', error);
      toast({
        title: "Error",
        description: "Failed to publish course",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Builder</h1>
            <p className="text-gray-600">Create and manage your course content</p>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={handleSaveCourse}
              disabled={saving}
              variant="outline"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={handlePublish}
              disabled={saving || !course.id}
              className="bg-green-600 hover:bg-green-700"
            >
              <Eye className="mr-2 h-4 w-4" />
              {course.published ? 'Published' : 'Publish'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    value={course.title}
                    onChange={(e) => setCourse({ ...course, title: e.target.value })}
                    placeholder="Enter course title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={course.description}
                    onChange={(e) => setCourse({ ...course, description: e.target.value })}
                    placeholder="Describe your course"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={course.subject}
                      onChange={(e) => setCourse({ ...course, subject: e.target.value })}
                      placeholder="e.g., Mathematics, Physics"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={course.price}
                      onChange={(e) => setCourse({ ...course, price: Number(e.target.value) })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="level">Academic Level</Label>
                    <select
                      id="level"
                      value={course.level}
                      onChange={(e) => setCourse({ ...course, level: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-md"
                    >
                      {academicLevels.map(level => (
                        <option key={level} value={level.toLowerCase().replace(' ', '_')}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <select
                      id="difficulty"
                      value={course.difficulty}
                      onChange={(e) => setCourse({ ...course, difficulty: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-md"
                    >
                      {difficultyLevels.map(level => (
                        <option key={level} value={level}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lessons */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Course Lessons ({course.lessons.length})</CardTitle>
                  <Button onClick={handleAddLesson}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Lesson
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {course.lessons.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No lessons added yet. Click "Add Lesson" to get started.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {course.lessons.map((lesson, index) => (
                      <div key={lesson.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">
                              Lesson {index + 1}: {lesson.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {lesson.content.substring(0, 100)}...
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setCurrentLesson(lesson);
                                setShowLessonForm(true);
                              }}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteLesson(lesson.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status:</span>
                    <Badge variant={course.published ? "default" : "secondary"}>
                      {course.published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Lessons:</span>
                    <span className="text-sm font-medium">{course.lessons.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Price:</span>
                    <span className="text-sm font-medium">${course.price}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/instruct')}
                >
                  Back to Dashboard
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={!course.published}
                >
                  Preview Course
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Lesson Form Modal */}
      {showLessonForm && currentLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {currentLesson.id.startsWith('lesson-') ? 'Add New Lesson' : 'Edit Lesson'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="lesson-title">Lesson Title</Label>
                <Input
                  id="lesson-title"
                  value={currentLesson.title}
                  onChange={(e) => setCurrentLesson({ 
                    ...currentLesson, 
                    title: e.target.value 
                  })}
                  placeholder="Enter lesson title"
                />
              </div>
              
              <div>
                <Label htmlFor="lesson-content">Lesson Content</Label>
                <Textarea
                  id="lesson-content"
                  value={currentLesson.content}
                  onChange={(e) => setCurrentLesson({ 
                    ...currentLesson, 
                    content: e.target.value 
                  })}
                  placeholder="Enter lesson content"
                  rows={10}
                />
              </div>

              <div>
                <Label htmlFor="video-url">Video URL (Optional)</Label>
                <Input
                  id="video-url"
                  value={currentLesson.videoUrl || ''}
                  onChange={(e) => setCurrentLesson({ 
                    ...currentLesson, 
                    videoUrl: e.target.value 
                  })}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentLesson(null);
                    setShowLessonForm(false);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveLesson}>
                  Save Lesson
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CourseBuilder;

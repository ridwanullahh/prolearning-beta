
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Eye, 
  Upload,
  BookOpen,
  Settings,
  Users
} from 'lucide-react';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';

interface Lesson {
  id?: string;
  title: string;
  description: string;
  content: string;
  order: number;
  duration: number;
  type: string;
}

const CourseBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(!!id);
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState({
    title: '',
    description: '',
    objectives: '',
    prerequisites: '',
    difficulty: 'beginner',
    duration: 1,
    price: 0,
    currency: 'USD',
    academicLevelId: '',
    subjectId: '',
    isPublished: false
  });
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [academicLevels, setAcademicLevels] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const user = authService.getCurrentUser();

  useEffect(() => {
    loadFormData();
    if (id) {
      loadCourse(id);
    }
  }, [id]);

  const loadFormData = async () => {
    try {
      const [levelsData, subjectsData] = await Promise.all([
        db.get('academicLevels'),
        db.get('subjects')
      ]);
      setAcademicLevels(levelsData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error loading form data:', error);
    }
  };

  const loadCourse = async (courseId: string) => {
    try {
      setLoading(true);
      const [courseData, lessonsData] = await Promise.all([
        db.getItem('courses', courseId),
        db.queryBuilder('lessons')
          .where((l: any) => l.courseId === courseId)
          .sort('order', 'asc')
          .exec()
      ]);

      if (courseData) {
        setCourse(courseData);
        setLessons(lessonsData || []);
      }
    } catch (error) {
      console.error('Error loading course:', error);
      toast({
        title: 'Error',
        description: 'Failed to load course data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveCourse = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const courseData = {
        ...course,
        creatorId: user.id,
        creatorType: 'instructor',
        isAiGenerated: false,
        updatedAt: new Date().toISOString()
      };

      let savedCourse;
      if (isEditing && id) {
        savedCourse = await db.update('courses', id, courseData);
      } else {
        savedCourse = await db.insert('courses', courseData);
        setIsEditing(true);
      }

      // Save lessons
      for (const lesson of lessons) {
        const lessonData = {
          ...lesson,
          courseId: savedCourse.id
        };

        if (lesson.id) {
          await db.update('lessons', lesson.id, lessonData);
        } else {
          await db.insert('lessons', lessonData);
        }
      }

      toast({
        title: 'Success',
        description: 'Course saved successfully',
      });

      if (!isEditing) {
        navigate(`/instruct/courses/${savedCourse.id}/edit`);
      }
    } catch (error) {
      console.error('Error saving course:', error);
      toast({
        title: 'Error',
        description: 'Failed to save course',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const publishCourse = async () => {
    try {
      setLoading(true);
      
      if (!id) {
        await saveCourse();
        return;
      }

      await db.update('courses', id, {
        isPublished: !course.isPublished,
        updatedAt: new Date().toISOString()
      });

      setCourse(prev => ({ ...prev, isPublished: !prev.isPublished }));
      
      toast({
        title: 'Success',
        description: `Course ${course.isPublished ? 'unpublished' : 'published'} successfully`,
      });
    } catch (error) {
      console.error('Error publishing course:', error);
      toast({
        title: 'Error',
        description: 'Failed to update course status',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addLesson = () => {
    const newLesson: Lesson = {
      title: '',
      description: '',
      content: '',
      order: lessons.length + 1,
      duration: 30,
      type: 'text'
    };
    setLessons([...lessons, newLesson]);
  };

  const updateLesson = (index: number, field: string, value: any) => {
    const updatedLessons = [...lessons];
    updatedLessons[index] = { ...updatedLessons[index], [field]: value };
    setLessons(updatedLessons);
  };

  const removeLesson = (index: number) => {
    const updatedLessons = lessons.filter((_, i) => i !== index);
    setLessons(updatedLessons);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/instruct/courses')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Courses
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditing ? 'Edit Course' : 'Create New Course'}
                </h1>
                <p className="text-gray-600">
                  {isEditing ? 'Update your course content' : 'Build your course from scratch'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isEditing && (
                <>
                  <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                    {course.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                  <Button
                    variant="outline"
                    onClick={publishCourse}
                    disabled={loading}
                  >
                    {course.isPublished ? 'Unpublish' : 'Publish'}
                  </Button>
                </>
              )}
              <Button onClick={saveCourse} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                Save Course
              </Button>
            </div>
          </div>
        </div>

        {/* Course Builder */}
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="lessons" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Lessons
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Course Title</Label>
                    <Input
                      id="title"
                      value={course.title}
                      onChange={(e) => setCourse(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter course title"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <select
                      id="difficulty"
                      value={course.difficulty}
                      onChange={(e) => setCourse(prev => ({ ...prev, difficulty: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={course.description}
                    onChange={(e) => setCourse(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what students will learn in this course"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="academicLevel">Academic Level</Label>
                    <select
                      id="academicLevel"
                      value={course.academicLevelId}
                      onChange={(e) => setCourse(prev => ({ ...prev, academicLevelId: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Academic Level</option>
                      {academicLevels.map(level => (
                        <option key={level.id} value={level.id}>
                          {level.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <select
                      id="subject"
                      value={course.subjectId}
                      onChange={(e) => setCourse(prev => ({ ...prev, subjectId: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Subject</option>
                      {subjects.map(subject => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="duration">Duration (hours)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={course.duration}
                      onChange={(e) => setCourse(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      min="1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      value={course.price}
                      onChange={(e) => setCourse(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <select
                      id="currency"
                      value={course.currency}
                      onChange={(e) => setCourse(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="USD">USD</option>
                      <option value="NGN">NGN</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="objectives">Learning Objectives</Label>
                  <Textarea
                    id="objectives"
                    value={course.objectives}
                    onChange={(e) => setCourse(prev => ({ ...prev, objectives: e.target.value }))}
                    placeholder="What will students achieve after completing this course?"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="prerequisites">Prerequisites</Label>
                  <Textarea
                    id="prerequisites"
                    value={course.prerequisites}
                    onChange={(e) => setCourse(prev => ({ ...prev, prerequisites: e.target.value }))}
                    placeholder="What should students know before taking this course?"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lessons" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Course Lessons</CardTitle>
                  <Button onClick={addLesson}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Lesson
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {lessons.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No lessons yet</h3>
                    <p className="text-gray-600 mb-4">Start building your course by adding lessons</p>
                    <Button onClick={addLesson}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Lesson
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lessons.map((lesson, index) => (
                      <Card key={index} className="border-l-4 border-l-blue-600">
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">Lesson {lesson.order}</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeLesson(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label>Lesson Title</Label>
                                <Input
                                  value={lesson.title}
                                  onChange={(e) => updateLesson(index, 'title', e.target.value)}
                                  placeholder="Enter lesson title"
                                />
                              </div>
                              
                              <div>
                                <Label>Duration (minutes)</Label>
                                <Input
                                  type="number"
                                  value={lesson.duration}
                                  onChange={(e) => updateLesson(index, 'duration', parseInt(e.target.value))}
                                  min="1"
                                />
                              </div>
                            </div>

                            <div>
                              <Label>Description</Label>
                              <Textarea
                                value={lesson.description}
                                onChange={(e) => updateLesson(index, 'description', e.target.value)}
                                placeholder="Brief description of the lesson"
                                rows={2}
                              />
                            </div>

                            <div>
                              <Label>Content</Label>
                              <Textarea
                                value={lesson.content}
                                onChange={(e) => updateLesson(index, 'content', e.target.value)}
                                placeholder="Lesson content (supports HTML)"
                                rows={6}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Publishing Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Course Visibility</h4>
                        <p className="text-sm text-gray-600">
                          {course.isPublished ? 'Your course is visible to students' : 'Your course is in draft mode'}
                        </p>
                      </div>
                      <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Course Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">0</div>
                        <p className="text-sm text-gray-600">Enrolled Students</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">0%</div>
                        <p className="text-sm text-gray-600">Completion Rate</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-600">0</div>
                        <p className="text-sm text-gray-600">Average Rating</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CourseBuilder;

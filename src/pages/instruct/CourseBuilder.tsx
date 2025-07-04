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
  Users,
  Edit,
  Calendar,
  Clock
} from 'lucide-react';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface Lesson {
  id?: string;
  title: string;
  description: string;
  order: number;
  duration: number;
  type: string;
  isRequired: boolean;
  releaseType: string;
  scheduledReleaseDate?: string;
  dripDays: number;
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
    isPublished: false,
    prerequisiteCourses: [] as string[]
  });
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [academicLevels, setAcademicLevels] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const { toast } = useToast();
  const user = authService.getCurrentUser();

  useEffect(() => {
    loadFormData();
    if (id) {
      loadCourse(id);
    }
  }, [id]);

  const loadFormData = async () => {
    try {
      const [levelsData, subjectsData, coursesData] = await Promise.all([
        db.get('academicLevels'),
        db.get('subjects'),
        db.queryBuilder('courses')
          .where((c: any) => c.creatorId !== user?.id && c.isPublished)
          .exec()
      ]);
      setAcademicLevels(levelsData);
      setSubjects(subjectsData);
      setAvailableCourses(coursesData);
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
        setCourse({
          title: courseData.title || '',
          description: courseData.description || '',
          objectives: courseData.objectives || '',
          prerequisites: courseData.prerequisites || '',
          difficulty: courseData.difficulty || 'beginner',
          duration: courseData.duration || 1,
          price: courseData.price || 0,
          currency: courseData.currency || 'USD',
          academicLevelId: courseData.academicLevelId || '',
          subjectId: courseData.subjectId || '',
          isPublished: courseData.isPublished || false,
          prerequisiteCourses: JSON.parse(courseData.prerequisiteCourses || '[]')
        });
        
        const mappedLessons: Lesson[] = lessonsData.map((lesson: any) => ({
          id: lesson.id,
          title: lesson.title || '',
          description: lesson.description || '',
          order: lesson.order || 1,
          duration: lesson.duration || 30,
          type: lesson.type || 'text',
          isRequired: lesson.isRequired !== false,
          releaseType: lesson.releaseType || 'immediate',
          scheduledReleaseDate: lesson.scheduledReleaseDate,
          dripDays: lesson.dripDays || 0
        }));
        setLessons(mappedLessons);
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
        prerequisiteCourses: JSON.stringify(course.prerequisiteCourses),
        updatedAt: new Date().toISOString()
      };

      let savedCourse;
      if (isEditing && id) {
        savedCourse = await db.update('courses', id, courseData);
        savedCourse.id = id;
      } else {
        savedCourse = await db.insert('courses', courseData);
        setIsEditing(true);
        navigate(`/instruct/courses/${savedCourse.id}/edit`, { replace: true });
      }

      toast({
        title: 'Success',
        description: 'Course saved successfully',
      });

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

  const createNewLesson = () => {
    if (!id) {
      toast({
        title: 'Save Course First',
        description: 'Please save your course before adding lessons',
        variant: 'destructive'
      });
      return;
    }
    navigate(`/instruct/courses/${id}/lessons/new`);
  };

  const editLesson = (lessonId: string) => {
    navigate(`/instruct/courses/${id}/lessons/${lessonId}/edit`);
  };

  const deleteLesson = async (lessonId: string) => {
    try {
      await db.delete('lessons', lessonId);
      setLessons(prev => prev.filter(l => l.id !== lessonId));
      toast({
        title: 'Success',
        description: 'Lesson deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete lesson',
        variant: 'destructive'
      });
    }
  };

  const togglePrerequisiteCourse = (courseId: string) => {
    setCourse(prev => ({
      ...prev,
      prerequisiteCourses: prev.prerequisiteCourses.includes(courseId)
        ? prev.prerequisiteCourses.filter(id => id !== courseId)
        : [...prev.prerequisiteCourses, courseId]
    }));
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

                {/* Prerequisite Courses */}
                <div>
                  <Label>Prerequisite Courses (Optional)</Label>
                  <p className="text-sm text-gray-600 mb-3">
                    Select courses that students must complete before taking this course
                  </p>
                  <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
                    {availableCourses.map(availableCourse => (
                      <div key={availableCourse.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`prereq-${availableCourse.id}`}
                          checked={course.prerequisiteCourses.includes(availableCourse.id)}
                          onChange={() => togglePrerequisiteCourse(availableCourse.id)}
                          className="rounded border-gray-300"
                        />
                        <label 
                          htmlFor={`prereq-${availableCourse.id}`}
                          className="text-sm flex-1 cursor-pointer"
                        >
                          {availableCourse.title}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lessons" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Course Lessons</CardTitle>
                  <Button onClick={createNewLesson}>
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
                    <Button onClick={createNewLesson}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Lesson
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lessons.map((lesson) => (
                      <Card key={lesson.id} className="border-l-4 border-l-blue-600">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">Lesson {lesson.order}: {lesson.title}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {lesson.duration} min
                                </Badge>
                                {lesson.releaseType === 'scheduled' && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    Scheduled
                                  </Badge>
                                )}
                                {lesson.releaseType === 'drip' && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Drip: Day {lesson.dripDays}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{lesson.description}</p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => editLesson(lesson.id!)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteLesson(lesson.id!)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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

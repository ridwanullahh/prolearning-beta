import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  Clock, 
  Users, 
  Star,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';
import EnhancedLessonViewer from './EnhancedLessonViewer';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  duration: number;
  difficulty: string;
  rating: number;
  enrollmentCount: number;
  objectives: string;
  prerequisites: string;
  instructor: string;
  lessons?: any[];
}

const CourseViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (id) {
      loadCourse(id);
    }
  }, [id]);

  const loadCourse = async (courseId: string) => {
    try {
      setLoading(true);
      const [courseData, lessonsData, userProgressData] = await Promise.all([
        db.getItem('courses', courseId),
        db.queryBuilder('lessons')
          .where((lesson: any) => lesson.courseId === courseId)
          .orderBy('order', 'asc')
          .exec(),
        user ? db.queryBuilder('userProgress')
          .where((p: any) => p.userId === user.id && p.courseId === courseId)
          .exec() : Promise.resolve([])
      ]);

      if (courseData) {
        setCourse(courseData);
        setLessons(lessonsData);
        
        // Load user progress
        if (userProgressData.length > 0) {
          const progress = userProgressData[0];
          setProgress(progress.progressPercentage || 0);
          setCompletedLessons(JSON.parse(progress.completedLessons || '[]'));
        }
        
        if (lessonsData.length > 0) {
          setCurrentLesson(lessonsData[0]);
        }
      }
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonComplete = async (lessonId: string) => {
    if (!user || !course) return;

    try {
      const newCompletedLessons = [...completedLessons];
      if (!newCompletedLessons.includes(lessonId)) {
        newCompletedLessons.push(lessonId);
      }

      const newProgress = (newCompletedLessons.length / lessons.length) * 100;
      setProgress(newProgress);
      setCompletedLessons(newCompletedLessons);

      // Update progress in database
      const existingProgress = await db.queryBuilder('userProgress')
        .where((p: any) => p.userId === user.id && p.courseId === course.id)
        .exec();

      if (existingProgress.length > 0) {
        await db.update('userProgress', existingProgress[0].id, {
          progressPercentage: newProgress,
          completedLessons: JSON.stringify(newCompletedLessons),
          lastAccessedAt: new Date().toISOString(),
          completedAt: newProgress === 100 ? new Date().toISOString() : undefined
        });
      } else {
        await db.insert('userProgress', {
          userId: user.id,
          courseId: course.id,
          lessonId,
          progressPercentage: newProgress,
          completedLessons: JSON.stringify(newCompletedLessons),
          lastAccessedAt: new Date().toISOString(),
          totalTimeSpent: 0
        });
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const goToNextLesson = () => {
    const currentIndex = lessons.findIndex(l => l.id === currentLesson?.id);
    if (currentIndex < lessons.length - 1) {
      setCurrentLesson(lessons[currentIndex + 1]);
    }
  };

  const goToPreviousLesson = () => {
    const currentIndex = lessons.findIndex(l => l.id === currentLesson?.id);
    if (currentIndex > 0) {
      setCurrentLesson(lessons[currentIndex - 1]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h2>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {course.title}
                </h1>
                <p className="text-gray-600 mb-4">{course.description}</p>
                
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{course.duration} hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{course.enrollmentCount} students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">{course.rating}/5</span>
                  </div>
                  <Badge variant="secondary">{course.difficulty}</Badge>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Lesson Content */}
          <div className="lg:col-span-3">
            {currentLesson ? (
              <EnhancedLessonViewer
                lessonId={currentLesson.id}
                courseId={course.id}
                onComplete={() => handleLessonComplete(currentLesson.id)}
                onNext={goToNextLesson}
                onPrevious={goToPreviousLesson}
                hasNext={lessons.findIndex(l => l.id === currentLesson.id) < lessons.length - 1}
                hasPrevious={lessons.findIndex(l => l.id === currentLesson.id) > 0}
              />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No lessons available</h3>
                  <p className="text-gray-600">This course doesn't have any lessons yet.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Lesson List Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Course Content
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {lessons.map((lesson, index) => (
                    <button
                      key={lesson.id}
                      onClick={() => setCurrentLesson(lesson)}
                      className={`w-full text-left p-3 hover:bg-gray-50 border-b transition-colors ${
                        currentLesson?.id === lesson.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {completedLessons.includes(lesson.id) ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Play className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {index + 1}. {lesson.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {lesson.duration} min
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseViewer;

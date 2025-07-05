
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle } from 'lucide-react';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const LessonPage = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [course, setCourse] = useState<any>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (courseId && lessonId) {
      loadLessonData();
    }
  }, [courseId, lessonId]);

  const loadLessonData = async () => {
    try {
      const [courseData, lessonData, lessonsData, userProgress] = await Promise.all([
        db.getItem('courses', courseId!),
        db.getItem('lessons', lessonId!),
        db.queryBuilder('lessons')
          .where((l: any) => l.courseId === courseId)
          .orderBy('order', 'asc')
          .exec(),
        db.queryBuilder('userProgress')
          .where((p: any) => p.userId === user?.id && p.courseId === courseId && p.lessonId === lessonId)
          .exec()
      ]);

      setCourse(courseData);
      setLesson(lessonData);
      setLessons(lessonsData);

      if (userProgress.length > 0) {
        setProgress(userProgress[0].progressPercentage || 0);
        setCompleted(userProgress[0].progressPercentage === 100);
      }
    } catch (error) {
      console.error('Error loading lesson data:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsCompleted = async () => {
    if (!user || !courseId || !lessonId) return;

    try {
      // Update or create progress record
      const existingProgress = await db.queryBuilder('userProgress')
        .where((p: any) => p.userId === user.id && p.courseId === courseId && p.lessonId === lessonId)
        .exec();

      if (existingProgress.length > 0) {
        await db.update('userProgress', existingProgress[0].id, {
          progressPercentage: 100,
          completedAt: new Date().toISOString(),
          lastAccessedAt: new Date().toISOString()
        });
      } else {
        await db.insert('userProgress', {
          userId: user.id,
          courseId: courseId,
          lessonId: lessonId,
          progressPercentage: 100,
          completedAt: new Date().toISOString(),
          lastAccessedAt: new Date().toISOString()
        });
      }

      setCompleted(true);
      setProgress(100);
      
      toast({
        title: 'Success',
        description: 'Lesson marked as completed!',
      });
    } catch (error) {
      console.error('Error marking lesson as completed:', error);
    }
  };

  const navigateToLesson = (targetLessonId: string) => {
    navigate(`/course/${courseId}/lesson/${targetLessonId}`);
  };

  const getCurrentLessonIndex = () => {
    return lessons.findIndex(l => l.id === lessonId);
  };

  const getNextLesson = () => {
    const currentIndex = getCurrentLessonIndex();
    return currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
  };

  const getPreviousLesson = () => {
    const currentIndex = getCurrentLessonIndex();
    return currentIndex > 0 ? lessons[currentIndex - 1] : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lesson not found</h2>
          <Button onClick={() => navigate('/my-courses')}>
            Back to My Courses
          </Button>
        </div>
      </div>
    );
  }

  const nextLesson = getNextLesson();
  const previousLesson = getPreviousLesson();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(`/course/${courseId}`)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Course
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
              <p className="text-gray-600">{course.title}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Lesson {lesson.order} of {lessons.length}
              </div>
              {completed && (
                <CheckCircle className="h-6 w-6 text-green-600" />
              )}
            </div>
          </div>
          
          <div className="mt-4">
            <Progress value={(lesson.order / lessons.length) * 100} className="w-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {lesson.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-600 mb-6">{lesson.description}</p>
                  
                  {lesson.content && (
                    <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                  )}
                  
                  {lesson.videoUrl && (
                    <div className="mb-6">
                      <video controls className="w-full rounded-lg">
                        <source src={lesson.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                  
                  {lesson.attachments && JSON.parse(lesson.attachments).length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">Attachments</h3>
                      <div className="space-y-2">
                        {JSON.parse(lesson.attachments).map((attachment: any, index: number) => (
                          <a
                            key={index}
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-2 border rounded hover:bg-gray-50"
                          >
                            {attachment.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {!completed && (
                  <div className="mt-8 pt-6 border-t">
                    <Button onClick={markAsCompleted} className="w-full">
                      Mark as Completed
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Course Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lessons.map((l) => (
                    <div
                      key={l.id}
                      className={`p-2 rounded cursor-pointer border ${
                        l.id === lessonId ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => navigateToLesson(l.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium line-clamp-1">
                          {l.order}. {l.title}
                        </span>
                        {l.completed && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <div>
            {previousLesson && (
              <Button
                variant="outline"
                onClick={() => navigateToLesson(previousLesson.id)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous: {previousLesson.title}
              </Button>
            )}
          </div>
          
          <div>
            {nextLesson && (
              <Button onClick={() => navigateToLesson(nextLesson.id)}>
                Next: {nextLesson.title}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPage;

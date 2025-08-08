import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator.tsx';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  Clock, 
  Users, 
  Star,
  ArrowLeft,
  ArrowRight,
  Trophy,
  Target,
  BarChart3,
  FileText,
  Video,
  Award,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Share2,
  Download,
  Volume2,
  VolumeX,
  Settings,
  Maximize,
  Menu,
  X
} from 'lucide-react';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';
import EnhancedLessonViewer from './EnhancedLessonViewer';
import { motion, AnimatePresence } from 'framer-motion';

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
  // Support both routes: /my-course/:id and /dashboard/course/:courseId/view
  const { id, courseId } = useParams();
  const effectiveCourseId = id || courseId;
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (effectiveCourseId) {
      loadCourse(effectiveCourseId);
    }
  }, [effectiveCourseId]);

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

      if (newProgress === 100) {
        // Could add confetti or celebration animation here
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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Course</h3>
          <p className="text-gray-600">Preparing your learning experience...</p>
        </motion.div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white rounded-full p-6 mb-6 shadow-lg">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h2>
          <p className="text-gray-600 mb-6">The course you're looking for doesn't exist or has been removed.</p>
          <Button 
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  const currentLessonIndex = lessons.findIndex(l => l.id === currentLesson?.id);
  const completedCount = completedLessons.length;
  const totalLessons = lessons.length;

  const SidebarContent = () => (
    <div className="space-y-6 sticky top-24">
      {/* Course Progress Overview */}
      <Card className="bg-white/90 backdrop-blur-sm border-green-200 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  className="stroke-green-100"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  className="stroke-green-600"
                  strokeWidth="3"
                  strokeDasharray={`${progress}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-green-700">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-green-800">
                {completedCount} of {totalLessons} lessons completed
              </p>
              <p className="text-xs text-green-600 mt-1">
                Keep up the great work! 🚀
              </p>
            </div>
          </div>

          {progress === 100 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 text-center"
            >
              <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="font-bold text-green-800 mb-1">
                🎉 Course Completed!
              </p>
              <p className="text-sm text-green-700">
                Congratulations on finishing this course
              </p>
            </motion.div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-blue-700">{Math.round((completedCount / totalLessons) * 100)}%</div>
              <div className="text-xs text-blue-600">Complete</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-yellow-700">{totalLessons - completedCount}</div>
              <div className="text-xs text-yellow-600">Remaining</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Curriculum */}
      <Card className="bg-white/90 backdrop-blur-sm border-green-200 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              Course Curriculum
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {totalLessons} lessons
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-80 overflow-y-auto">
            <div className="space-y-1 p-4 pt-0">
              {lessons.map((lesson, index) => (
                <motion.button
                  key={lesson.id}
                  onClick={() => setCurrentLesson(lesson)}
                  className={`w-full text-left p-4 rounded-lg hover:bg-green-50 transition-all duration-200 border ${
                    currentLesson?.id === lesson.id 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm' 
                      : 'border-transparent hover:border-green-100'
                  }`}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {completedLessons.includes(lesson.id) ? (
                        <div className="bg-green-600 rounded-full p-1.5">
                          <CheckCircle className="h-3 w-3 text-white" />
                        </div>
                      ) : currentLesson?.id === lesson.id ? (
                        <div className="bg-blue-600 rounded-full p-1.5">
                          <Play className="h-3 w-3 text-white" />
                        </div>
                      ) : (
                        <div className="border-2 border-gray-300 rounded-full p-1.5">
                          <div className="w-3 h-3 bg-gray-200 rounded-full" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-500">
                          Lesson {index + 1}
                        </span>
                        {completedLessons.includes(lesson.id) && (
                          <Badge className="bg-green-100 text-green-800 text-xs px-1.5 py-0">
                            Complete
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1 leading-tight">
                        {lesson.title}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{lesson.duration} min</span>
                        </div>
                        {lesson.type && (
                          <Badge variant="outline" className="text-xs px-1.5 py-0 h-4">
                            {lesson.type}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Information */}
      <Card className="bg-white/90 backdrop-blur-sm border-green-200 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            Course Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Instructor</span>
              <span className="font-medium text-gray-900">{course.instructor}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total Duration</span>
              <span className="font-medium text-gray-900">{course.duration}h</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Students Enrolled</span>
              <span className="font-medium text-gray-900">{course.enrollmentCount}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Course Rating</span>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="font-medium text-gray-900">{course.rating}/5</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Additional Actions */}
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full border-green-200 hover:bg-green-50">
              <Bookmark className="h-4 w-4 mr-2" />
              Bookmark Course
            </Button>
            <Button variant="outline" size="sm" className="w-full border-green-200 hover:bg-green-50">
              <Share2 className="h-4 w-4 mr-2" />
              Share Progress
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Top Navigation Bar */}
      <motion.div 
        className="bg-white/95 backdrop-blur-sm border-b border-green-100 sticky top-0 z-40"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-green-700"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Courses
              </Button>
              
              <div className="hidden md:block">
                <h1 className="text-lg font-semibold text-gray-900 truncate max-w-md">
                  {course.title}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getDifficultyColor(course.difficulty)}>
                    {course.difficulty}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {completedCount}/{totalLessons} lessons completed
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2">
                <Progress value={progress} className="w-24 h-2" />
                <span className="text-sm font-medium text-gray-700 min-w-[3rem]">
                  {Math.round(progress)}%
                </span>
              </div>
              
              <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 bg-white p-0">
                  <SidebarContent />
                </SheetContent>
              </Sheet>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="hidden md:flex"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile Progress */}
          <div className="mt-3 sm:hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Progress</span>
              <span className="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </motion.div>

      <div className="flex h-full">
        <div className="hidden md:flex md:w-80 flex-col p-6">
            <SidebarContent />
        </div>
        <div className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-6">
                <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                >
                {currentLesson ? (
                    <div className="space-y-4">
                    {/* Lesson Header */}
                    <Card className="bg-white/80 backdrop-blur-sm border-green-200">
                        <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                            <CardTitle className="text-xl text-gray-900">
                                Lesson {currentLessonIndex + 1}: {currentLesson.title}
                            </CardTitle>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Clock className="h-4 w-4" />
                                {currentLesson.duration} min
                                </div>
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Video className="h-4 w-4" />
                                {currentLesson.type || 'Video'}
                                </div>
                                {completedLessons.includes(currentLesson.id) && (
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Completed
                                </Badge>
                                )}
                            </div>
                            </div>
                            <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                                <Bookmark className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                                <Share2 className="h-4 w-4" />
                            </Button>
                            </div>
                        </div>
                        </CardHeader>
                    </Card>

                    {/* Enhanced Lesson Viewer */}
                    <EnhancedLessonViewer
                        lessonId={currentLesson.id}
                        courseId={course.id}
                        onComplete={() => handleLessonComplete(currentLesson.id)}
                        onNext={goToNextLesson}
                        onPrevious={goToPreviousLesson}
                        hasNext={currentLessonIndex < lessons.length - 1}
                        hasPrevious={currentLessonIndex > 0}
                    />

                    {/* Navigation Controls */}
                    <Card className="bg-white/80 backdrop-blur-sm border-green-200">
                        <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <Button
                            variant="outline"
                            onClick={goToPreviousLesson}
                            disabled={currentLessonIndex === 0}
                            className="border-green-200 hover:bg-green-50"
                            >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Previous
                            </Button>

                            <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">
                                {currentLessonIndex + 1} of {totalLessons}
                            </span>
                            {!completedLessons.includes(currentLesson.id) && (
                                <Button
                                onClick={() => handleLessonComplete(currentLesson.id)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark Complete
                                </Button>
                            )}
                            </div>

                            <Button
                            onClick={goToNextLesson}
                            disabled={currentLessonIndex === lessons.length - 1}
                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                            >
                            Next
                            <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                        </CardContent>
                    </Card>
                    </div>
                ) : (
                    <Card className="bg-white/80 backdrop-blur-sm border-green-200">
                    <CardContent className="p-12 text-center">
                        <div className="bg-green-50 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No lessons available</h3>
                        <p className="text-gray-600 mb-6">This course doesn't have any lessons yet. Check back later!</p>
                        <Button
                        onClick={() => navigate('/dashboard')}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                        >
                        Browse More Courses
                        </Button>
                    </CardContent>
                    </Card>
                )}
                </motion.div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CourseViewer;

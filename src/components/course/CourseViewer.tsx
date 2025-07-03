
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Play, BookOpen, Clock, Users, Star } from 'lucide-react';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';
import LessonViewer from './LessonViewer';

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  subject: string;
  difficulty: string;
  lessons: Lesson[];
  createdAt: string;
  userId: string;
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  order: number;
  quizzes: any[];
  flashcards: any[];
  mindmap: any;
  keypoints: string[];
}

const CourseViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const courseData = await db.getCourse(id);
      
      if (!courseData) {
        setError('Course not found');
        return;
      }

      setCourse(courseData);
      
      // Set first lesson as current
      if (courseData.lessons && courseData.lessons.length > 0) {
        setCurrentLesson(courseData.lessons[0]);
      }
      
      // Calculate progress (mock for now)
      setProgress(0);
    } catch (err) {
      console.error('Error loading course:', err);
      setError('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setCurrentLesson(lesson);
  };

  const handleNextLesson = () => {
    if (!course || !currentLesson) return;
    
    const currentIndex = course.lessons.findIndex(l => l.id === currentLesson.id);
    if (currentIndex < course.lessons.length - 1) {
      setCurrentLesson(course.lessons[currentIndex + 1]);
      // Update progress
      const newProgress = ((currentIndex + 1) / course.lessons.length) * 100;
      setProgress(newProgress);
    }
  };

  const handlePreviousLesson = () => {
    if (!course || !currentLesson) return;
    
    const currentIndex = course.lessons.findIndex(l => l.id === currentLesson.id);
    if (currentIndex > 0) {
      setCurrentLesson(course.lessons[currentIndex - 1]);
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

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-8">
            <p className="text-red-600 mb-4">{error || 'Course not found'}</p>
            <Button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentLesson) {
    return (
      <LessonViewer
        lesson={currentLesson}
        course={course}
        onNext={handleNextLesson}
        onPrevious={handlePreviousLesson}
        onBack={() => setCurrentLesson(null)}
        progress={progress}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Info */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{course.title}</CardTitle>
                    <p className="text-gray-600 mb-4">{course.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{course.level}</Badge>
                      <Badge variant="outline">{course.subject}</Badge>
                      <Badge variant="outline">{course.difficulty}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-gray-600">
                      {course.lessons.length} Lessons
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-600">
                      ~{course.lessons.length * 15} minutes
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm text-gray-600">4.8 Rating</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <Button
                  onClick={() => handleLessonSelect(course.lessons[0])}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Start Learning
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Lesson List */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {course.lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="border-b last:border-b-0 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleLessonSelect(lesson)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {lesson.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            ~15 minutes
                          </p>
                        </div>
                        <Play className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
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

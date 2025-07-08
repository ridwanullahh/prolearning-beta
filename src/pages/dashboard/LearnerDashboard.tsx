
import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { authService } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Brain, Target, TrendingUp, Plus, Users, Clock, Star, Lightbulb } from 'lucide-react';
import { db } from '@/lib/github-sdk';
import CourseGenerationWizard from '@/components/course/CourseGenerationWizard';
import MobileNav from '@/components/layout/MobileNav';
import MyCourses from './MyCourses';
import WalletDashboard from '@/components/wallet/WalletDashboard';
import TicketSystem from '@/components/support/TicketSystem';

const LearnerDashboard = () => {
  const [showCourseGenerator, setShowCourseGenerator] = useState(false);
  const [stats, setStats] = useState({
    coursesInProgress: 0,
    completedLessons: 0,
    studyHours: 0,
    aiGenerationsLeft: 3
  });
  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = authService.getCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get user enrollments and progress
      const [enrollments, progress, usage] = await Promise.all([
        db.queryBuilder('enrollments')
          .where((e: any) => e.userId === user?.id && e.status === 'active')
          .exec(),
        db.queryBuilder('userProgress')
          .where((p: any) => p.userId === user?.id)
          .exec(),
        db.queryBuilder('aiGenerationUsage')
          .where((u: any) => u.userId === user?.id && u.month === new Date().toISOString().substring(0, 7))
          .exec()
      ]);

      // Calculate stats
      const coursesInProgress = enrollments.filter((e: any) => {
        const courseProgress = progress.find((p: any) => p.courseId === e.courseId);
        return !courseProgress || courseProgress.progressPercentage < 100;
      }).length;

      const completedLessons = progress.filter((p: any) => p.progressPercentage === 100).length;
      const totalStudyHours = progress.reduce((acc: number, p: any) => acc + (p.totalTimeSpent || 0), 0);
      const currentUsage = usage.length > 0 ? usage[0] : null;
      const generationsUsed = currentUsage ? currentUsage.freeGenerationsUsed : 0;

      setStats({
        coursesInProgress,
        completedLessons,
        studyHours: Math.round(totalStudyHours / 60), // Convert minutes to hours
        aiGenerationsLeft: Math.max(0, 3 - generationsUsed)
      });

      // Get recent courses
      const recentEnrollments = enrollments.slice(0, 3);
      const coursesData = await Promise.all(
        recentEnrollments.map(async (enrollment: any) => {
          const course = await db.getItem('courses', enrollment.courseId);
          const courseProgress = progress.find((p: any) => p.courseId === enrollment.courseId);
          return {
            ...course,
            progress: courseProgress?.progressPercentage || 0,
            lastAccessed: courseProgress?.lastAccessedAt || enrollment.enrolledAt
          };
        })
      );

      setRecentCourses(coursesData.filter(Boolean));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseGenerated = (course: any) => {
    setShowCourseGenerator(false);
    loadDashboardData(); // Refresh data
    navigate(`/my-course/${course.id}`);
  };

  if (showCourseGenerator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="container mx-auto py-8">
          <div className="mb-4">
            <Button
              variant="outline"
              onClick={() => setShowCourseGenerator(false)}
            >
              ← Back to Dashboard
            </Button>
          </div>
          <CourseGenerationWizard onCourseGenerated={handleCourseGenerated} />
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/courses" element={<MyCourses />} />
      <Route path="/wallet" element={<WalletDashboard />} />
      <Route path="/support" element={<TicketSystem />} />
      <Route path="/" element={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="container mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <MobileNav />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {user?.name}!
                  </h1>
                  <p className="text-gray-600">Continue your learning journey</p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Courses in Progress</CardTitle>
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.coursesInProgress}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.coursesInProgress === 0 ? 'Start learning today' : 'Keep up the great work!'}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Lessons</CardTitle>
                  <Target className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.completedLessons}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.completedLessons === 0 ? 'Generate your first course' : 'Lessons completed'}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Study Hours</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{stats.studyHours}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.studyHours === 0 ? 'Track your progress' : 'Hours of focused learning'}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AI Generations Left</CardTitle>
                  <Brain className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats.aiGenerationsLeft}</div>
                  <p className="text-xs text-muted-foreground">Free monthly limit</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Recent Courses */}
                {recentCourses.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Continue Learning</CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate('/dashboard/courses')}
                        >
                          View All
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentCourses.map((course) => (
                          <div
                            key={course.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => navigate(`/my-course/${course.id}`)}
                          >
                            <div className="flex-1">
                              <h3 className="font-semibold line-clamp-1">{course.title}</h3>
                              <p className="text-sm text-gray-600 line-clamp-1">{course.description}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  {course.duration}h
                                </div>
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Star className="h-3 w-3" />
                                  {course.rating || 'New'}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">{Math.round(course.progress)}%</div>
                              <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${course.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Get Started</CardTitle>
                      <CardDescription>Create your first AI-powered course</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Brain className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
                        <p className="text-gray-600 mb-4">
                          Generate your first AI-powered course tailored to your learning needs
                        </p>
                        <Button
                          onClick={() => setShowCourseGenerator(true)}
                          className="bg-blue-600 hover:bg-blue-700"
                          disabled={stats.aiGenerationsLeft === 0}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          {stats.aiGenerationsLeft === 0 ? 'No Generations Left' : 'Generate Your First Course'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      className="w-full"
                      size="sm"
                      onClick={() => setShowCourseGenerator(true)}
                      disabled={stats.aiGenerationsLeft === 0}
                    >
                      <Brain className="mr-2 h-4 w-4" />
                      Generate New Course
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      size="sm"
                      onClick={() => navigate('/marketplace')}
                    >
                      Browse Marketplace
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      size="sm"
                      onClick={() => navigate('/dashboard/courses')}
                    >
                      View My Courses
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      size="sm"
                      onClick={() => navigate('/dashboard/wallet')}
                    >
                      Manage Wallet
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      size="sm"
                      onClick={() => navigate('/dashboard/support')}
                    >
                      Get Support
                    </Button>
                  </CardContent>
                </Card>

                {/* Learning Tips */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      Learning Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Set a daily learning goal</li>
                      <li>• Take notes while studying</li>
                      <li>• Practice regularly with flashcards</li>
                      <li>• Join study groups</li>
                      <li>• Review previous lessons</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      } />
    </Routes>
  );
};

export default LearnerDashboard;

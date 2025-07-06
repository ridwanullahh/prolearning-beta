
import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { authService } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Brain, Target, TrendingUp, Plus, Clock, Star, Lightbulb, ArrowUpRight, Play, CheckCircle2, Zap, Award, Calendar, BarChart3, Users, ChevronRight, Sparkles, Timer, Trophy } from 'lucide-react';
import { db } from '@/lib/github-sdk';
import CourseGenerationWizard from '@/components/course/CourseGenerationWizard';
import MobileNav from '@/components/shared/MobileNav';
import MyCourses from './MyCourses';

const LearnerDashboard = () => {
  const [showCourseGenerator, setShowCourseGenerator] = useState(false);
  const [stats, setStats] = useState({
    coursesInProgress: 0,
    completedLessons: 0,
    studyHours: 0,
    aiGenerationsLeft: 3,
    streak: 0,
    totalCertificates: 0,
    weeklyGoalProgress: 0
  });
  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<any[]>([]);
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

      // Calculate learning streak (mock data for demo)
      const streak = Math.floor(Math.random() * 15) + 1;
      const weeklyGoalProgress = Math.min(100, (completedLessons / 7) * 100);

      setStats({
        coursesInProgress,
        completedLessons,
        studyHours: Math.round(totalStudyHours / 60), // Convert minutes to hours
        aiGenerationsLeft: Math.max(0, 3 - generationsUsed),
        streak,
        totalCertificates: Math.floor(completedLessons / 5), // 1 certificate per 5 completed lessons
        weeklyGoalProgress: Math.round(weeklyGoalProgress)
      });

      // Get recent courses
      const recentEnrollments = enrollments.slice(0, 4);
      const coursesData = await Promise.all(
        recentEnrollments.map(async (enrollment: any) => {
          const course = await db.getItem('courses', enrollment.courseId);
          const courseProgress = progress.find((p: any) => p.courseId === enrollment.courseId);
          return {
            ...course,
            progress: courseProgress?.progressPercentage || 0,
            lastAccessed: courseProgress?.lastAccessedAt || enrollment.enrolledAt,
            timeSpent: courseProgress?.totalTimeSpent || 0
          };
        })
      );

      setRecentCourses(coursesData.filter(Boolean));

      // Generate recent achievements
      const achievements = [
        { id: 1, title: 'First Course Started', description: 'Welcome to your learning journey!', icon: Play, color: 'text-blue-600', bg: 'bg-blue-100' },
        { id: 2, title: 'Lesson Completed', description: 'Great progress on your studies', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        { id: 3, title: 'Study Streak', description: `${streak} days in a row!`, icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-100' },
        { id: 4, title: 'Certificate Earned', description: 'Course mastery achieved', icon: Award, color: 'text-purple-600', bg: 'bg-purple-100' }
      ].slice(0, completedLessons > 0 ? 3 : 1);

      setRecentAchievements(achievements);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin absolute top-2 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-800">Loading Your Dashboard</h3>
            <p className="text-gray-600">Preparing your personalized learning insights...</p>
          </div>
        </div>
      </div>
    );
  }

  if (showCourseGenerator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-4">
        <div className="container mx-auto py-8">
          <div className="mb-4">
            <Button
              variant="outline"
              onClick={() => setShowCourseGenerator(false)}
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
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
      <Route path="/" element={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
          {/* Mobile Header */}
          <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-sm">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MobileNav />
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-gray-900 leading-none">Learning Hub</h1>
                      <p className="text-xs text-gray-600">Hey {user?.name?.split(' ')[0]}! 👋</p>
                    </div>
                  </div>
                </div>
                
                {stats.streak > 0 && (
                  <div className="flex items-center gap-1 bg-gradient-to-r from-amber-100 to-orange-100 px-2 py-1 rounded-full">
                    <Trophy className="w-3 h-3 text-amber-600" />
                    <span className="text-xs font-semibold text-amber-700">{stats.streak} day streak</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-4 py-6 space-y-6">
            {/* Quick Stats Grid - Mobile First */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
              <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200/50 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">In Progress</p>
                      <p className="text-2xl font-bold text-blue-900">{stats.coursesInProgress}</p>
                      <p className="text-xs text-blue-600 mt-1">Active courses</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-blue-600/10 rounded-full"></div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200/50 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide">Completed</p>
                      <p className="text-2xl font-bold text-emerald-900">{stats.completedLessons}</p>
                      <p className="text-xs text-emerald-600 mt-1">Lessons done</p>
                    </div>
                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-emerald-600/10 rounded-full"></div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200/50 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-purple-700 uppercase tracking-wide">Study Time</p>
                      <p className="text-2xl font-bold text-purple-900">{stats.studyHours}h</p>
                      <p className="text-xs text-purple-600 mt-1">Total hours</p>
                    </div>
                    <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                      <Timer className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-purple-600/10 rounded-full"></div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200/50 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-amber-700 uppercase tracking-wide">AI Credits</p>
                      <p className="text-2xl font-bold text-amber-900">{stats.aiGenerationsLeft}</p>
                      <p className="text-xs text-amber-600 mt-1">Left this month</p>
                    </div>
                    <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-amber-600/10 rounded-full"></div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content - Mobile Responsive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Course Progress - Mobile First */}
              <div className="lg:col-span-2 space-y-6">
                {recentCourses.length > 0 ? (
                  <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Play className="w-5 h-5 text-blue-600" />
                            Continue Learning
                          </CardTitle>
                          <CardDescription className="text-gray-600">Pick up where you left off</CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate('/dashboard/courses')}
                          className="flex items-center gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          View All <ArrowUpRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentCourses.map((course) => (
                          <div
                            key={course.id}
                            className="group p-4 rounded-xl border border-gray-100 hover:border-blue-200 bg-gradient-to-r from-white to-gray-50/50 hover:shadow-md transition-all duration-300 cursor-pointer"
                            onClick={() => navigate(`/my-course/${course.id}`)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-900 transition-colors">
                                    {course.title}
                                  </h3>
                                  <Badge 
                                    variant={course.progress === 100 ? 'default' : 'secondary'}
                                    className={course.progress === 100 ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : ''}
                                  >
                                    {course.progress === 100 ? (
                                      <>
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        Complete
                                      </>
                                    ) : (
                                      <>
                                        <Play className="w-3 h-3 mr-1" />
                                        {Math.round(course.progress)}%
                                      </>
                                    )}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-1 mb-3">{course.description}</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4 text-blue-500" />
                                    {course.duration}h total
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Timer className="h-4 w-4 text-purple-500" />
                                    {Math.round((course.timeSpent || 0) / 60)}h spent
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 text-amber-500" />
                                    {course.rating || 'New'}
                                  </div>
                                </div>
                                <div className="mt-3">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium text-gray-700">Progress</span>
                                    <span className="text-xs text-gray-600">{Math.round(course.progress)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                                      style={{ width: `${course.progress}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors ml-4" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                    <CardContent className="p-12 text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Brain className="h-10 w-10 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-gray-900">Ready to learn something new?</h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Generate your first AI-powered course tailored to your learning style and goals
                      </p>
                      <Button
                        onClick={() => setShowCourseGenerator(true)}
                        disabled={stats.aiGenerationsLeft === 0}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        {stats.aiGenerationsLeft === 0 ? 'No Credits Left' : 'Generate Your First Course'}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Weekly Goal Progress */}
                {stats.completedLessons > 0 && (
                  <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-50 to-teal-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Target className="w-5 h-5 text-emerald-600" />
                        Weekly Goal
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">Complete 7 lessons this week</span>
                        <span className="text-sm font-bold text-emerald-600">{Math.min(stats.completedLessons, 7)}/7</span>
                      </div>
                      <div className="w-full bg-emerald-100 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-emerald-600 to-teal-600 h-3 rounded-full transition-all duration-1000" 
                          style={{ width: `${Math.min(stats.weeklyGoalProgress, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-emerald-600 mt-2">
                        {stats.weeklyGoalProgress >= 100 ? '🎉 Goal achieved!' : `${Math.round(stats.weeklyGoalProgress)}% complete`}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Recent Achievements */}
                {recentAchievements.length > 0 && (
                  <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-600" />
                        Recent Achievements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {recentAchievements.map((achievement) => (
                          <div key={achievement.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/50">
                            <div className={`w-10 h-10 ${achievement.bg} rounded-xl flex items-center justify-center`}>
                              <achievement.icon className={`w-5 h-5 ${achievement.color}`} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900">{achievement.title}</p>
                              <p className="text-xs text-gray-600">{achievement.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar - Mobile Responsive */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-purple-600" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg justify-start"
                      onClick={() => setShowCourseGenerator(true)}
                      disabled={stats.aiGenerationsLeft === 0}
                    >
                      <Brain className="mr-3 h-4 w-4" />
                      Generate New Course
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-blue-200 text-blue-700 hover:bg-blue-50"
                      onClick={() => navigate('/marketplace')}
                    >
                      <BookOpen className="mr-3 h-4 w-4" />
                      Browse Marketplace
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      onClick={() => navigate('/dashboard/courses')}
                    >
                      <Play className="mr-3 h-4 w-4" />
                      My Courses
                    </Button>
                  </CardContent>
                </Card>

                {/* Learning Stats */}
                <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-pink-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                      Your Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{stats.streak}</div>
                        <div className="text-xs text-gray-600">Day Streak</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-600">{stats.totalCertificates}</div>
                        <div className="text-xs text-gray-600">Certificates</div>
                      </div>
                    </div>
                    <div className="pt-2 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Study Hours</span>
                        <span className="font-semibold text-purple-600">{stats.studyHours}h</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Lessons Done</span>
                        <span className="font-semibold text-emerald-600">{stats.completedLessons}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Learning Tips */}
                <Card className="shadow-lg border-0 bg-gradient-to-br from-amber-50 to-orange-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-amber-600" />
                      Learning Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { icon: Target, text: "Set daily learning goals", color: "text-blue-600" },
                        { icon: Clock, text: "Study in 25-minute focused sessions", color: "text-purple-600" },
                        { icon: Brain, text: "Take notes while learning", color: "text-emerald-600" },
                        { icon: Users, text: "Join study groups for motivation", color: "text-amber-600" }
                      ].map((tip, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <tip.icon className={`h-4 w-4 mt-0.5 ${tip.color}`} />
                          <span className="text-sm text-gray-700">{tip.text}</span>
                        </div>
                      ))}
                    </div>
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


import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { authService } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, DollarSign, TrendingUp, Plus, Eye, Edit, BarChart3, Target, Clock, Star, ArrowUpRight, ChevronRight, Zap, Award, Calendar, MessageSquare } from 'lucide-react';
import { db } from '@/lib/github-sdk';
import MobileNav from '@/components/shared/MobileNav';
import InstructorCourses from './InstructorCourses';
import CourseBuilder from './CourseBuilder';

const InstructorDashboard = () => {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    revenue: 0,
    avgRating: 0,
    thisMonthRevenue: 0,
    completionRate: 0
  });
  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
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
      
      // Get instructor's courses
      const courses = await db.queryBuilder('courses')
        .where((c: any) => c.creatorId === user?.id)
        .exec();

      // Get enrollments for instructor's courses
      const courseIds = courses.map((c: any) => c.id);
      const enrollments = await db.queryBuilder('enrollments')
        .where((e: any) => courseIds.includes(e.courseId) && e.status === 'active')
        .exec();

      // Get user progress for completion rate
      const userProgress = await db.queryBuilder('userProgress')
        .where((p: any) => courseIds.includes(p.courseId))
        .exec();

      // Calculate stats
      const totalStudents = enrollments.length;
      const revenue = enrollments.reduce((acc: number, e: any) => acc + (e.amount || 0), 0);
      const thisMonthRevenue = enrollments
        .filter((e: any) => new Date(e.createdAt).getMonth() === new Date().getMonth())
        .reduce((acc: number, e: any) => acc + (e.amount || 0), 0);
      
      const avgRating = courses.length > 0 
        ? courses.reduce((acc: number, c: any) => acc + (c.rating || 0), 0) / courses.length 
        : 0;

      const completedLessons = userProgress.filter((p: any) => p.progressPercentage === 100).length;
      const totalLessons = userProgress.length;
      const completionRate = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

      setStats({
        totalCourses: courses.length,
        totalStudents,
        revenue,
        avgRating: Math.round(avgRating * 10) / 10,
        thisMonthRevenue,
        completionRate: Math.round(completionRate)
      });

      // Get recent courses with enrollment data
      const recentCoursesData = courses
        .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 4)
        .map((course: any) => ({
          ...course,
          enrollmentCount: enrollments.filter((e: any) => e.courseId === course.id).length,
          revenue: enrollments
            .filter((e: any) => e.courseId === course.id)
            .reduce((acc: number, e: any) => acc + (e.amount || 0), 0)
        }));

      setRecentCourses(recentCoursesData);

      // Generate recent activity
      const activities = [
        ...enrollments.slice(-3).map((e: any) => ({
          id: e.id,
          type: 'enrollment',
          message: 'New student enrolled',
          course: courses.find((c: any) => c.id === e.courseId)?.title || 'Unknown Course',
          time: new Date(e.createdAt).toLocaleString(),
          amount: e.amount
        })),
        ...courses.slice(-2).map((c: any) => ({
          id: c.id,
          type: 'course',
          message: c.isPublished ? 'Course published' : 'Course updated',
          course: c.title,
          time: new Date(c.updatedAt).toLocaleString()
        }))
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

      setRecentActivity(activities);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin absolute top-2 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-800">Loading Dashboard</h3>
            <p className="text-gray-600">Preparing your instructor insights...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/courses" element={<InstructorCourses />} />
      <Route path="/courses/new" element={<CourseBuilder />} />
      <Route path="/courses/:id/edit" element={<CourseBuilder />} />
      <Route path="/" element={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          {/* Mobile Header */}
          <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-sm">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MobileNav />
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <Award className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-gray-900 leading-none">Instructor Hub</h1>
                      <p className="text-xs text-gray-600">Welcome back, {user?.name}</p>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={() => navigate('/instruct/courses/new')}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Create</span>
                </Button>
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
                      <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Courses</p>
                      <p className="text-2xl font-bold text-blue-900">{stats.totalCourses}</p>
                      <p className="text-xs text-blue-600 mt-1">Total created</p>
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
                      <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide">Students</p>
                      <p className="text-2xl font-bold text-emerald-900">{stats.totalStudents}</p>
                      <p className="text-xs text-emerald-600 mt-1">Enrolled</p>
                    </div>
                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-emerald-600/10 rounded-full"></div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200/50 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-amber-700 uppercase tracking-wide">Revenue</p>
                      <p className="text-2xl font-bold text-amber-900">${stats.revenue.toFixed(0)}</p>
                      <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                        +${stats.thisMonthRevenue.toFixed(0)} <span className="text-amber-500">this month</span>
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-amber-600/10 rounded-full"></div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200/50 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-purple-700 uppercase tracking-wide">Rating</p>
                      <p className="text-2xl font-bold text-purple-900">{stats.avgRating || '—'}</p>
                      <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" /> Average
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-purple-600/10 rounded-full"></div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content - Mobile Responsive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Course Management - Mobile First */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-blue-600" />
                          Your Courses
                        </CardTitle>
                        <CardDescription className="text-gray-600">Manage and track your course performance</CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/instruct/courses')}
                        className="flex items-center gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        View All <ArrowUpRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {recentCourses.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <BookOpen className="h-10 w-10 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2 text-gray-900">Ready to teach?</h3>
                        <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                          Create your first course and start sharing your expertise with students worldwide
                        </p>
                        <Button 
                          onClick={() => navigate('/instruct/courses/new')}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Create Your First Course
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {recentCourses.map((course) => (
                          <div
                            key={course.id}
                            className="group p-4 rounded-xl border border-gray-100 hover:border-blue-200 bg-gradient-to-r from-white to-gray-50/50 hover:shadow-md transition-all duration-300"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-900 transition-colors">
                                    {course.title}
                                  </h3>
                                  <div className="flex items-center gap-2">
                                    {course.isPublished ? (
                                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                                        <Zap className="w-3 h-3 mr-1" />
                                        Live
                                      </Badge>
                                    ) : (
                                      <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                                        <Clock className="w-3 h-3 mr-1" />
                                        Draft
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4 text-blue-500" />
                                    {course.enrollmentCount} students
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="h-4 w-4 text-emerald-500" />
                                    ${course.revenue || 0}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 text-amber-500" />
                                    {course.rating || 'New'}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => navigate(`/course/${course.id}`)}
                                  className="h-8 w-8 p-0 hover:bg-blue-100"
                                >
                                  <Eye className="h-4 w-4 text-blue-600" />
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => navigate(`/instruct/courses/${course.id}/edit`)}
                                  className="h-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                {recentActivity.length > 0 && (
                  <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-green-600" />
                        Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {recentActivity.map((activity) => (
                          <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/50">
                            <div className={`w-2 h-2 rounded-full ${
                              activity.type === 'enrollment' ? 'bg-emerald-500' : 'bg-blue-500'
                            }`}></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                              <p className="text-xs text-gray-600 truncate">{activity.course}</p>
                            </div>
                            <div className="text-right">
                              {activity.amount && (
                                <p className="text-sm font-semibold text-emerald-600">+${activity.amount}</p>
                              )}
                              <p className="text-xs text-gray-500">{new Date(activity.time).toLocaleTimeString()}</p>
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
                      <Target className="w-5 h-5 text-purple-600" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg justify-start"
                      onClick={() => navigate('/instruct/courses/new')}
                    >
                      <Plus className="mr-3 h-4 w-4" />
                      Create New Course
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-blue-200 text-blue-700 hover:bg-blue-50"
                      onClick={() => navigate('/instruct/courses')}
                    >
                      <BookOpen className="mr-3 h-4 w-4" />
                      Manage Courses
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    >
                      <BarChart3 className="mr-3 h-4 w-4" />
                      View Analytics
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start border-amber-200 text-amber-700 hover:bg-amber-50"
                    >
                      <DollarSign className="mr-3 h-4 w-4" />
                      Withdraw Earnings
                    </Button>
                  </CardContent>
                </Card>

                {/* Performance Insights */}
                <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-pink-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Award className="w-5 h-5 text-purple-600" />
                      Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Course Completion</span>
                      <span className="text-sm font-bold text-purple-600">{stats.completionRate}%</span>
                    </div>
                    <div className="w-full bg-purple-100 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-1000" 
                        style={{ width: `${stats.completionRate}%` }}
                      ></div>
                    </div>
                    <div className="pt-2 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Total Revenue</span>
                        <span className="font-semibold text-emerald-600">${stats.revenue.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">This Month</span>
                        <span className="font-semibold text-blue-600">${stats.thisMonthRevenue.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Teaching Tips */}
                <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-50 to-teal-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-emerald-600" />
                      Pro Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { icon: Target, text: "Set clear learning objectives", color: "text-blue-600" },
                        { icon: Clock, text: "Keep lessons concise (5-15 min)", color: "text-purple-600" },
                        { icon: Users, text: "Engage with student questions", color: "text-emerald-600" },
                        { icon: Star, text: "Add interactive elements", color: "text-amber-600" }
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

export default InstructorDashboard;

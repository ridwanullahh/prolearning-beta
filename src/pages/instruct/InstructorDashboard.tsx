
import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { authService } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, DollarSign, TrendingUp, Plus, Eye, Edit } from 'lucide-react';
import { db } from '@/lib/github-sdk';
import MobileNav from '@/components/layout/MobileNav';
import InstructorCourses from './InstructorCourses';
import CourseBuilder from './CourseBuilder';

const InstructorDashboard = () => {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    revenue: 0,
    avgRating: 0
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
      
      // Get instructor's courses
      const courses = await db.queryBuilder('courses')
        .where((c: any) => c.creatorId === user?.id)
        .exec();

      // Get enrollments for instructor's courses
      const courseIds = courses.map((c: any) => c.id);
      const enrollments = await db.queryBuilder('enrollments')
        .where((e: any) => courseIds.includes(e.courseId) && e.status === 'active')
        .exec();

      // Calculate stats
      const totalStudents = enrollments.length;
      const revenue = enrollments.reduce((acc: number, e: any) => acc + (e.amount || 0), 0);
      const avgRating = courses.length > 0 
        ? courses.reduce((acc: number, c: any) => acc + (c.rating || 0), 0) / courses.length 
        : 0;

      setStats({
        totalCourses: courses.length,
        totalStudents,
        revenue,
        avgRating: Math.round(avgRating * 10) / 10
      });

      // Get recent courses with enrollment data
      const recentCoursesData = courses
        .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5)
        .map((course: any) => ({
          ...course,
          enrollmentCount: enrollments.filter((e: any) => e.courseId === course.id).length
        }));

      setRecentCourses(recentCoursesData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Routes>
      <Route path="/courses" element={<InstructorCourses />} />
      <Route path="/courses/new" element={<CourseBuilder />} />
      <Route path="/courses/:id/edit" element={<CourseBuilder />} />
      <Route path="/" element={
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
          <div className="container mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <MobileNav />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Instructor Dashboard
                  </h1>
                  <p className="text-gray-600">Welcome back, {user?.name}!</p>
                </div>
              </div>
              
              <Button
                onClick={() => navigate('/instruct/courses/new')}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Course
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.totalCourses}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalCourses === 0 ? 'Create your first course' : `+${Math.floor(Math.random() * 3)} this month`}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalStudents === 0 ? 'Publish courses to get students' : 'Enrolled across all courses'}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">${stats.revenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.revenue === 0 ? 'Start earning from courses' : '+12% from last month'}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Course Rating</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{stats.avgRating || '—'}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.avgRating === 0 ? 'No ratings yet' : 'Average rating'}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Course Management */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Course Management</CardTitle>
                        <CardDescription>Manage your courses and content</CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/instruct/courses')}
                      >
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {recentCourses.length === 0 ? (
                      <div className="text-center py-8">
                        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
                        <p className="text-gray-600 mb-4">
                          Start creating courses to share your knowledge with students
                        </p>
                        <Button onClick={() => navigate('/instruct/courses/new')}>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Your First Course
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recentCourses.map((course) => (
                          <div
                            key={course.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold line-clamp-1">{course.title}</h3>
                                <div className="flex items-center gap-2">
                                  {course.isPublished ? (
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                      Published
                                    </span>
                                  ) : (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                                      Draft
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-gray-600">
                                {course.enrollmentCount} students • ${course.price || 'Free'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/course/${course.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => navigate(`/instruct/courses/${course.id}/edit`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      className="w-full"
                      size="sm"
                      onClick={() => navigate('/instruct/courses/new')}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create New Course
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      size="sm"
                      onClick={() => navigate('/instruct/courses')}
                    >
                      Manage Courses
                    </Button>
                    <Button variant="outline" className="w-full" size="sm">
                      View Analytics
                    </Button>
                    <Button variant="outline" className="w-full" size="sm">
                      Withdraw Earnings
                    </Button>
                  </CardContent>
                </Card>

                {/* Teaching Tips */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      Teaching Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Keep lessons concise and focused</li>
                      <li>• Add interactive elements</li>
                      <li>• Provide clear learning objectives</li>
                      <li>• Include practice exercises</li>
                      <li>• Respond to student questions</li>
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

export default InstructorDashboard;


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Users, DollarSign, TrendingUp, Plus, BarChart3, Star, Eye, PlayCircle } from 'lucide-react';
import { authService } from '@/lib/auth';
import { db } from '@/lib/github-sdk';
import { Link } from 'react-router-dom';
import InstructorEarnings from '@/components/instructor/InstructorEarnings';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  currency: string;
  status: string;
  enrollmentCount: number;
  rating: number;
  totalRevenue: number;
}

interface Stats {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

const InstructorDashboard = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    monthlyRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  const user = authService.getCurrentUser();

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      // Load instructor's courses
      const instructorCourses = await db.queryBuilder('courses')
        .where(item => item.creatorId === user!.id)
        .exec();

      // Get enrollment data for each course
      const coursesWithStats = await Promise.all(
        instructorCourses.map(async (course: any) => {
          const enrollments = await db.queryBuilder('enrollments')
            .where(item => item.courseId === course.id && item.status === 'active')
            .exec();

          const earnings = await db.queryBuilder('earnings')
            .where(item => item.courseId === course.id && item.instructorId === user!.id)
            .exec();

          const totalRevenue = earnings.reduce((sum, earning) => sum + earning.netAmount, 0);

          return {
            ...course,
            enrollmentCount: enrollments.length,
            totalRevenue,
            rating: course.rating || 4.5
          };
        })
      );

      setCourses(coursesWithStats);

      // Calculate stats
      const totalStudents = coursesWithStats.reduce((sum, course) => sum + course.enrollmentCount, 0);
      const totalRevenue = coursesWithStats.reduce((sum, course) => sum + course.totalRevenue, 0);
      
      // Calculate monthly revenue
      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthlyEarnings = await db.queryBuilder('earnings')
        .where(item => item.instructorId === user!.id && item.createdAt.startsWith(currentMonth))
        .exec();
      const monthlyRevenue = monthlyEarnings.reduce((sum, earning) => sum + earning.netAmount, 0);

      setStats({
        totalCourses: coursesWithStats.length,
        totalStudents,
        totalRevenue,
        monthlyRevenue
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Instructor Dashboard 🎓
              </h1>
              <p className="text-lg text-gray-600 mt-2">Manage your courses and track your teaching success</p>
            </div>
            <div className="flex gap-3">
              <Link to="/instruct/course-builder">
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </Button>
              </Link>
              <Link to="/instruct/courses">
                <Button variant="outline" className="px-6 py-2.5 rounded-xl border-2 hover:bg-gray-50">
                  <BookOpen className="h-4 w-4 mr-2" />
                  My Courses
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Courses</CardTitle>
              <BookOpen className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalCourses}</div>
              <p className="text-xs text-gray-500 mt-1">Published courses</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalStudents}</div>
              <p className="text-xs text-gray-500 mt-1">Enrolled learners</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
              <DollarSign className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalRevenue, user?.currency || 'USD')}
              </div>
              <p className="text-xs text-gray-500 mt-1">All time earnings</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
              <TrendingUp className="h-5 w-5 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.monthlyRevenue, user?.currency || 'USD')}
              </div>
              <p className="text-xs text-gray-500 mt-1">Monthly revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm rounded-xl p-1">
            <TabsTrigger value="courses" className="rounded-lg">My Courses</TabsTrigger>
            <TabsTrigger value="earnings" className="rounded-lg">Earnings</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Course Management</CardTitle>
                <CardDescription>Manage and monitor your published courses</CardDescription>
              </CardHeader>
              <CardContent>
                {courses.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses yet</h3>
                    <p className="text-gray-500 mb-6">Create your first course to start teaching</p>
                    <Link to="/instruct/course-builder">
                      <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Course
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                      <Card key={course.id} className="border-0 shadow-md hover:shadow-lg transition-all duration-200 group">
                        <div className="relative overflow-hidden rounded-t-lg">
                          <img 
                            src={course.thumbnail || '/api/placeholder/300/200'} 
                            alt={course.title}
                            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute top-3 right-3">
                            <Badge className={`${
                              course.status === 'published' ? 'bg-green-500' : 
                              course.status === 'draft' ? 'bg-yellow-500' : 'bg-gray-500'
                            } text-white`}>
                              {course.status}
                            </Badge>
                          </div>
                          <div className="absolute bottom-3 left-3">
                            <Badge className="bg-white/90 text-gray-900">
                              {formatCurrency(course.price, course.currency)}
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <Users className="h-4 w-4 text-blue-600" />
                                <span className="font-semibold text-gray-900">{course.enrollmentCount}</span>
                              </div>
                              <p className="text-xs text-gray-500">Students</p>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="font-semibold text-gray-900">{course.rating}</span>
                              </div>
                              <p className="text-xs text-gray-500">Rating</p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-gray-600">Revenue</span>
                              <span className="font-semibold text-green-600">
                                {formatCurrency(course.totalRevenue, course.currency)}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Link to={`/course/${course.id}`} className="flex-1">
                              <Button variant="outline" className="w-full">
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                            </Link>
                            <Link to={`/instruct/course/${course.id}/edit`} className="flex-1">
                              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                                Edit
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <InstructorEarnings />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  Course Analytics
                </CardTitle>
                <CardDescription>Detailed insights into your course performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {courses.map((course) => (
                    <div key={course.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{course.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">{course.description}</p>
                        </div>
                        <Badge className={`ml-4 ${
                          course.status === 'published' ? 'bg-green-100 text-green-800' : 
                          course.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {course.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                          <div className="font-semibold text-gray-900">{course.enrollmentCount}</div>
                          <div className="text-xs text-gray-500">Enrollments</div>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 rounded-lg">
                          <Star className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
                          <div className="font-semibold text-gray-900">{course.rating}</div>
                          <div className="text-xs text-gray-500">Rating</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-1" />
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(course.totalRevenue, course.currency)}
                          </div>
                          <div className="text-xs text-gray-500">Revenue</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <PlayCircle className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(course.price, course.currency)}
                          </div>
                          <div className="text-xs text-gray-500">Price</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InstructorDashboard;

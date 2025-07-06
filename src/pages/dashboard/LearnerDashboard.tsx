
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Clock, Trophy, TrendingUp, Star, Play, Wallet, Plus } from 'lucide-react';
import { authService } from '@/lib/auth';
import { db } from '@/lib/github-sdk';
import { Link } from 'react-router-dom';
import WalletBalance from '@/components/wallet/WalletBalance';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  level: string;
  duration: number;
  progress?: number;
  instructor: string;
  rating: number;
}

interface Stats {
  totalCourses: number;
  completedCourses: number;
  hoursLearned: number;
  certificatesEarned: number;
}

const LearnerDashboard = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalCourses: 0,
    completedCourses: 0,
    hoursLearned: 0,
    certificatesEarned: 0
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
      // Load enrolled courses
      const enrollments = await db.queryBuilder('enrollments')
        .where(item => item.userId === user!.id && item.status === 'active')
        .exec();

      const courses = await Promise.all(
        enrollments.map(async (enrollment: any) => {
          const course = await db.getItem('courses', enrollment.courseId);
          const progress = await db.queryBuilder('userProgress')
            .where(item => item.userId === user!.id && item.courseId === enrollment.courseId)
            .exec();
          
          const instructor = await db.getItem('users', course?.creatorId);
          
          return {
            ...course,
            progress: progress.length > 0 ? progress[0].completionPercentage : 0,
            instructor: instructor?.name || 'Unknown Instructor'
          };
        })
      );

      setEnrolledCourses(courses.filter(Boolean));
      setRecentCourses(courses.slice(0, 3));

      // Calculate stats
      const completedCount = courses.filter(course => course.progress === 100).length;
      const totalHours = courses.reduce((sum, course) => sum + (course.duration || 0), 0);

      setStats({
        totalCourses: courses.length,
        completedCourses: completedCount,
        hoursLearned: Math.round(totalHours / 60), // Convert minutes to hours
        certificatesEarned: completedCount
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-lg text-gray-600 mt-2">Ready to continue your learning journey?</p>
            </div>
            <div className="flex gap-3">
              <Link to="/marketplace">
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="h-4 w-4 mr-2" />
                  Browse Courses
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Enrolled Courses</CardTitle>
              <BookOpen className="h-5 w-5 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalCourses}</div>
              <p className="text-xs text-gray-500 mt-1">Active enrollments</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
              <Trophy className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.completedCourses}</div>
              <p className="text-xs text-gray-500 mt-1">Courses finished</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Hours Learned</CardTitle>
              <Clock className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.hoursLearned}</div>
              <p className="text-xs text-gray-500 mt-1">Time invested</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Certificates</CardTitle>
              <Star className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.certificatesEarned}</div>
              <p className="text-xs text-gray-500 mt-1">Achievements</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm rounded-xl p-1">
            <TabsTrigger value="courses" className="rounded-lg">My Courses</TabsTrigger>
            <TabsTrigger value="wallet" className="rounded-lg">Wallet</TabsTrigger>
            <TabsTrigger value="progress" className="rounded-lg">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <div className="space-y-6">
              {/* Continue Learning */}
              {recentCourses.length > 0 && (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-indigo-600" />
                      Continue Learning
                    </CardTitle>
                    <CardDescription>Pick up where you left off</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {recentCourses.map((course) => (
                        <Card key={course.id} className="border-0 shadow-md hover:shadow-lg transition-all duration-200 group">
                          <div className="relative overflow-hidden rounded-t-lg">
                            <img 
                              src={course.thumbnail || '/api/placeholder/300/200'} 
                              alt={course.title}
                              className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                              <Play className="h-8 w-8 text-white" />
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                            <div className="flex items-center justify-between mb-3">
                              <Badge variant="secondary" className="text-xs">
                                {course.level}
                              </Badge>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                <span className="text-xs text-gray-600">{course.rating}</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Progress</span>
                                <span className="font-medium">{course.progress}%</span>
                              </div>
                              <Progress value={course.progress} className="h-2" />
                            </div>
                            <Link 
                              to={`/course/${course.id}`}
                              className="block mt-4"
                            >
                              <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                                Continue Learning
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* All Courses */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>All My Courses</CardTitle>
                  <CardDescription>Manage your enrolled courses</CardDescription>
                </CardHeader>
                <CardContent>
                  {enrolledCourses.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses yet</h3>
                      <p className="text-gray-500 mb-6">Start your learning journey by enrolling in a course</p>
                      <Link to="/marketplace">
                        <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                          Browse Courses
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {enrolledCourses.map((course) => (
                        <Card key={course.id} className="border-0 shadow-md hover:shadow-lg transition-all duration-200 group">
                          <div className="relative overflow-hidden rounded-t-lg">
                            <img 
                              src={course.thumbnail || '/api/placeholder/300/200'} 
                              alt={course.title}
                              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            <div className="absolute top-3 right-3">
                              <Badge className="bg-white/90 text-gray-900">
                                {course.progress}% Complete
                              </Badge>
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm text-gray-500">By {course.instructor}</span>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="text-sm text-gray-600">{course.rating}</span>
                              </div>
                            </div>
                            <Progress value={course.progress} className="h-2 mb-4" />
                            <Link to={`/course/${course.id}`}>
                              <Button className="w-full" variant="outline">
                                {course.progress === 100 ? 'Review Course' : 'Continue Learning'}
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="wallet">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-green-600" />
                  Wallet Management
                </CardTitle>
                <CardDescription>Manage your wallet balance and transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <WalletBalance />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
                <CardDescription>Track your learning achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {enrolledCourses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{course.title}</h3>
                        <p className="text-sm text-gray-500">By {course.instructor}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{course.progress}%</div>
                          <Progress value={course.progress} className="w-24 h-2" />
                        </div>
                        <Badge variant={course.progress === 100 ? "default" : "secondary"}>
                          {course.progress === 100 ? "Completed" : "In Progress"}
                        </Badge>
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

export default LearnerDashboard;

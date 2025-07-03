
import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { authService } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, DollarSign, TrendingUp, Plus, PlusCircle } from 'lucide-react';
import MobileNav from '@/components/layout/MobileNav';
import CourseBuilder from './CourseBuilder';
import InstructorCourses from './InstructorCourses';

const InstructorDashboard = () => {
  const user = authService.getCurrentUser();
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/course-builder" element={<CourseBuilder />} />
      <Route path="/courses" element={<InstructorCourses />} />
      <Route path="/*" element={
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
          {/* Mobile Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-4 md:hidden">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">ProLearning Instructor</h1>
              <MobileNav userRole="instructor" />
            </div>
          </div>

          <div className="container mx-auto px-4 py-8">
            {/* Desktop Header */}
            <div className="mb-8 hidden md:block">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Instructor Dashboard
              </h1>
              <p className="text-gray-600">Welcome back, {user?.name}!</p>
            </div>

            {/* Mobile Welcome */}
            <div className="mb-6 md:hidden">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Welcome, {user?.name?.split(' ')[0]}!
              </h2>
              <p className="text-gray-600 text-sm">Manage your courses and students</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium">Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Published</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium">Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Enrolled</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium">Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">$0</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium">Rating</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">--</div>
                  <p className="text-xs text-muted-foreground">Average</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <PlusCircle className="h-5 w-5 text-green-600" />
                      <span>Course Creation</span>
                    </CardTitle>
                    <CardDescription>Create and manage your course content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Create Your First Course</h3>
                      <p className="text-gray-600 mb-6 text-sm md:text-base">
                        Use our advanced course builder to create engaging content
                      </p>
                      <Button
                        onClick={() => navigate('/instruct/course-builder')}
                        className="bg-green-600 hover:bg-green-700 w-full md:w-auto"
                        size="lg"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Course
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div>
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      className="w-full justify-start bg-green-600 hover:bg-green-700"
                      size="sm"
                      onClick={() => navigate('/instruct/course-builder')}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Course
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      size="sm"
                      onClick={() => navigate('/instruct/courses')}
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      My Courses
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      size="sm"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Students
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      size="sm"
                    >
                      <DollarSign className="mr-2 h-4 w-4" />
                      Earnings
                    </Button>
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

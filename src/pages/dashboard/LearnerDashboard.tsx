
import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { authService } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Brain, Target, TrendingUp, Plus, Menu } from 'lucide-react';
import CourseGenerationWizard from '@/components/course/CourseGenerationWizard';
import MobileNav from '@/components/layout/MobileNav';
import MyCourses from './MyCourses';

const LearnerDashboard = () => {
  const [showCourseGenerator, setShowCourseGenerator] = useState(false);
  const user = authService.getCurrentUser();
  const navigate = useNavigate();

  const handleCourseGenerated = (course: any) => {
    setShowCourseGenerator(false);
    navigate(`/my-course/${course.id}`);
  };

  if (showCourseGenerator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Mobile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 md:hidden">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">ProLearning</h1>
            <MobileNav userRole="learner" />
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
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
      <Route path="/my-courses" element={<MyCourses />} />
      <Route path="/*" element={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          {/* Mobile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 md:hidden">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">ProLearning</h1>
              <MobileNav userRole="learner" />
            </div>
          </div>

          <div className="container mx-auto px-4 py-8">
            {/* Desktop Header */}
            <div className="mb-8 hidden md:block">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-gray-600">Continue your learning journey</p>
            </div>

            {/* Mobile Welcome */}
            <div className="mb-6 md:hidden">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Welcome back, {user?.name?.split(' ')[0]}!
              </h2>
              <p className="text-gray-600 text-sm">Continue your learning journey</p>
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
                  <p className="text-xs text-muted-foreground">Start learning</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium">Lessons</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium">Hours</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Studied</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium">AI Credits</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">Free monthly</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="h-5 w-5 text-blue-600" />
                      <span>AI Course Generator</span>
                    </CardTitle>
                    <CardDescription>Create personalized courses with AI</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Brain className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Ready to Learn?</h3>
                      <p className="text-gray-600 mb-6 text-sm md:text-base">
                        Generate your first AI-powered course tailored to your needs
                      </p>
                      <Button
                        onClick={() => setShowCourseGenerator(true)}
                        className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
                        size="lg"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Generate Course
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
                      className="w-full justify-start"
                      size="sm"
                      onClick={() => setShowCourseGenerator(true)}
                    >
                      <Brain className="mr-2 h-4 w-4" />
                      Generate Course
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      size="sm"
                      onClick={() => navigate('/marketplace')}
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      Browse Marketplace
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      size="sm"
                      onClick={() => navigate('/dashboard/my-courses')}
                    >
                      <Target className="mr-2 h-4 w-4" />
                      My Courses
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      size="sm"
                    >
                      <TrendingUp className="mr-2 h-4 w-4" />
                      View Progress
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

export default LearnerDashboard;

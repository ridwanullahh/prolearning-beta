
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PlayCircle, BookOpen, Brain, Map } from 'lucide-react';

const CoursePage = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Advanced Mathematics Course
          </h1>
          <p className="text-gray-600">Master advanced mathematical concepts with AI-powered learning</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Course Progress</CardTitle>
                <CardDescription>Track your learning journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>65%</span>
                  </div>
                  <Progress value={65} className="w-full" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Lessons Completed:</span>
                      <span className="ml-2 font-semibold">13/20</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Time Spent:</span>
                      <span className="ml-2 font-semibold">24.5 hours</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Lessons</CardTitle>
                <CardDescription>Navigate through your learning path</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((lesson) => (
                    <div key={lesson} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <PlayCircle className="h-5 w-5 text-blue-600" />
                        <div>
                          <h3 className="font-semibold">Lesson {lesson}: Calculus Fundamentals</h3>
                          <p className="text-sm text-gray-600">Duration: 45 minutes</p>
                        </div>
                      </div>
                      <Button size="sm" variant={lesson <= 3 ? "default" : "outline"}>
                        {lesson <= 3 ? "Continue" : "Start"}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Learning Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" size="sm" variant="outline">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Flashcards
                </Button>
                <Button className="w-full" size="sm" variant="outline">
                  <Brain className="h-4 w-4 mr-2" />
                  Quiz Practice
                </Button>
                <Button className="w-full" size="sm" variant="outline">
                  <Map className="h-4 w-4 mr-2" />
                  Mind Map
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Level:</span>
                  <span className="ml-2 font-semibold">Advanced</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Duration:</span>
                  <span className="ml-2 font-semibold">15 hours</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Lessons:</span>
                  <span className="ml-2 font-semibold">20</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Generated:</span>
                  <span className="ml-2 font-semibold">AI-Powered</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePage;

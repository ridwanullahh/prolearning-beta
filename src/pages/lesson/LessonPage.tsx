
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, BookOpen, Brain, Map, Key } from 'lucide-react';

const LessonPage = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Lesson 3: Derivatives and Applications
              </h1>
              <p className="text-gray-600">Advanced Mathematics Course</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button size="sm">
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Lesson Progress</span>
              <span>45%</span>
            </div>
            <Progress value={45} className="w-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Lesson Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <h3>Understanding Derivatives</h3>
                  <p>
                    Derivatives are one of the fundamental concepts in calculus. They represent the rate of change
                    of a function with respect to its variable. In this lesson, we'll explore the concept of derivatives
                    and their practical applications.
                  </p>
                  
                  <h4>Key Concepts:</h4>
                  <ul>
                    <li>Definition of a derivative</li>
                    <li>Geometric interpretation</li>
                    <li>Rules of differentiation</li>
                    <li>Applications in real-world problems</li>
                  </ul>

                  <div className="bg-blue-50 p-4 rounded-lg mt-4">
                    <h5 className="font-semibold text-blue-900">Formula:</h5>
                    <p className="text-blue-800">f'(x) = lim(h→0) [f(x+h) - f(x)] / h</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2" />
                    Quick Quiz
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">Test your understanding with 5 questions</p>
                  <Button className="w-full" size="sm">Start Quiz</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Flashcards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">Review key terms and concepts</p>
                  <Button className="w-full" size="sm" variant="outline">View Cards</Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Learning Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" size="sm" variant="outline">
                  <Map className="h-4 w-4 mr-2" />
                  Mind Map
                </Button>
                <Button className="w-full" size="sm" variant="outline">
                  <Key className="h-4 w-4 mr-2" />
                  Key Points
                </Button>
                <Button className="w-full" size="sm" variant="outline">
                  <Brain className="h-4 w-4 mr-2" />
                  AI Tutor
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lesson Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Duration:</span>
                  <span className="ml-2">45 minutes</span>
                </div>
                <div>
                  <span className="text-gray-600">Difficulty:</span>
                  <span className="ml-2">Advanced</span>
                </div>
                <div>
                  <span className="text-gray-600">Prerequisites:</span>
                  <span className="ml-2">Limits, Functions</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPage;

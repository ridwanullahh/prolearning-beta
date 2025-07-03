
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, Users, Clock, BookOpen, Award, Play } from 'lucide-react';

const CourseDetailsPage = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="aspect-video bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg mb-6 flex items-center justify-center">
              <Play className="h-16 w-16 text-white" />
            </div>

            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Advanced Physics: From Basics to Quantum Mechanics
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                Master the fundamental principles of physics and explore the fascinating world of quantum mechanics
              </p>
              
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span>4.8 (1,234 reviews)</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>5,678 students</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>24 hours</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" />
                  <span>32 lessons</span>
                </div>
              </div>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>What you'll learn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    "Master fundamental physics principles",
                    "Understand quantum mechanics basics",
                    "Apply physics concepts to real-world problems",
                    "Solve complex physics equations",
                    "Analyze wave-particle duality",
                    "Explore modern physics applications"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center">
                      <Award className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
                <CardDescription>32 lessons • 24 hours total</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((section) => (
                    <div key={section} className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Section {section}: Classical Mechanics</h3>
                      <div className="space-y-2">
                        {[1, 2, 3].map((lesson) => (
                          <div key={lesson} className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                              <Play className="h-3 w-3 text-gray-400 mr-2" />
                              <span>Lesson {lesson}: Newton's Laws of Motion</span>
                            </div>
                            <span className="text-gray-500">12:34</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About the Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
                  <div>
                    <h3 className="font-semibold text-lg">Dr. Sarah Johnson</h3>
                    <p className="text-gray-600 mb-2">Ph.D. in Theoretical Physics, MIT</p>
                    <p className="text-sm text-gray-600">
                      Dr. Johnson has over 15 years of experience teaching physics at the university level
                      and has published numerous research papers in quantum mechanics and theoretical physics.
                    </p>
                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                      <span>⭐ 4.9 instructor rating</span>
                      <span>👥 12,456 students</span>
                      <span>📚 8 courses</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900 mb-2">$49.99</div>
                  <div className="text-sm text-gray-500">One-time purchase</div>
                </div>

                <Button className="w-full mb-4" size="lg">
                  Enroll Now
                </Button>
                
                <Button variant="outline" className="w-full mb-6">
                  Add to Cart
                </Button>

                <Separator className="mb-6" />

                <div className="space-y-4">
                  <h3 className="font-semibold">This course includes:</h3>
                  <div className="space-y-2 text-sm">
                    {[
                      "24 hours of video content",
                      "32 downloadable lessons",
                      "Interactive quizzes",
                      "Course completion certificate",
                      "Lifetime access",
                      "Mobile and desktop access"
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <Award className="h-4 w-4 text-green-500 mr-2" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-2">
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline">Physics</Badge>
                    <Badge variant="outline">Advanced</Badge>
                    <Badge variant="outline">University Level</Badge>
                    <Badge variant="outline">Quantum Mechanics</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPage;

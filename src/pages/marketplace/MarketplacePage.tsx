
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Star, Users, Clock } from 'lucide-react';

const MarketplacePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Marketplace</h1>
          <p className="text-gray-600">Discover courses created by expert instructors</p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search for courses..."
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((course) => (
            <Card key={course} className="hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gradient-to-r from-blue-400 to-purple-500 rounded-t-lg"></div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Advanced Physics Course</CardTitle>
                    <CardDescription>By Dr. Sarah Johnson</CardDescription>
                  </div>
                  <Badge variant="secondary">$49.99</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Master the fundamentals of physics with comprehensive lessons and practical examples.
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span>4.8</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>1,234 students</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>12 hours</span>
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  <Badge variant="outline" className="text-xs">Physics</Badge>
                  <Badge variant="outline" className="text-xs">Advanced</Badge>
                  <Badge variant="outline" className="text-xs">University</Badge>
                </div>

                <Button className="w-full" size="sm">View Details</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button variant="outline">Load More Courses</Button>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;

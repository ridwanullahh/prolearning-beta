
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { BookOpen, Clock, Search, Filter, Star } from 'lucide-react';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  subject: string;
  difficulty: string;
  lessons: any[];
  createdAt: string;
  progress?: number;
}

const MyCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, selectedFilter]);

  const loadCourses = async () => {
    try {
      const user = authService.getCurrentUser();
      if (!user) return;

      const userCourses = await db.getUserCourses(user.id);
      setCourses(userCourses || []);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(course => course.difficulty === selectedFilter);
    }

    setFilteredCourses(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="container mx-auto py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your courses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
          <p className="text-gray-600">Continue your learning journey</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('all')}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={selectedFilter === 'beginner' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('beginner')}
              size="sm"
            >
              Beginner
            </Button>
            <Button
              variant={selectedFilter === 'intermediate' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('intermediate')}
              size="sm"
            >
              Intermediate
            </Button>
            <Button
              variant={selectedFilter === 'advanced' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('advanced')}
              size="sm"
            >
              Advanced
            </Button>
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No courses found</h3>
              <p className="text-gray-600 mb-4">
                {courses.length === 0 
                  ? "You haven't generated any courses yet." 
                  : "No courses match your search criteria."
                }
              </p>
              <Link to="/dashboard">
                <Button>Generate Your First Course</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 line-clamp-2">
                        {course.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                        {course.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{course.level}</Badge>
                        <Badge variant="outline">{course.subject}</Badge>
                        <Badge variant="outline">{course.difficulty}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{course.lessons?.length || 0} lessons</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>~{(course.lessons?.length || 0) * 15}m</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>4.8</span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-gray-600">
                          {course.progress || 0}%
                        </span>
                      </div>
                      <Progress value={course.progress || 0} className="h-2" />
                    </div>

                    <div className="flex space-x-2">
                      <Link to={`/my-course/${course.id}`} className="flex-1">
                        <Button className="w-full" size="sm">
                          Continue Learning
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;


import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Users, 
  DollarSign, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Search,
  MoreVertical
} from 'lucide-react';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  subject: string;
  difficulty: string;
  price: number;
  published: boolean;
  lessons: any[];
  createdAt: string;
  enrollments?: number;
  revenue?: number;
}

const InstructorCourses = () => {
  const navigate = useNavigate();
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

      const instructorCourses = await db.getInstructorCourses(user.id);
      setCourses(instructorCourses || []);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(course => {
        switch (selectedFilter) {
          case 'published':
            return course.published;
          case 'draft':
            return !course.published;
          case 'free':
            return course.price === 0;
          case 'paid':
            return course.price > 0;
          default:
            return true;
        }
      });
    }

    setFilteredCourses(filtered);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      await db.deleteCourse(courseId);
      setCourses(courses.filter(c => c.id !== courseId));
      toast({
        title: "Course Deleted",
        description: "Course has been deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive"
      });
    }
  };

  const handleTogglePublish = async (course: Course) => {
    try {
      const updatedCourse = { ...course, published: !course.published };
      await db.updateCourse(course.id, updatedCourse);
      setCourses(courses.map(c => c.id === course.id ? updatedCourse : c));
      
      toast({
        title: course.published ? "Course Unpublished" : "Course Published",
        description: course.published 
          ? "Course is now hidden from students" 
          : "Course is now visible to students"
      });
    } catch (error) {
      console.error('Error updating course:', error);
      toast({
        title: "Error",
        description: "Failed to update course",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="container mx-auto py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your courses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
            <p className="text-gray-600">Manage your course content and students</p>
          </div>
          <Button 
            onClick={() => navigate('/instruct/course-builder')}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Button>
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
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('all')}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={selectedFilter === 'published' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('published')}
              size="sm"
            >
              Published
            </Button>
            <Button
              variant={selectedFilter === 'draft' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('draft')}
              size="sm"
            >
              Draft
            </Button>
            <Button
              variant={selectedFilter === 'paid' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('paid')}
              size="sm"
            >
              Paid
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
                  ? "You haven't created any courses yet." 
                  : "No courses match your search criteria."
                }
              </p>
              <Button 
                onClick={() => navigate('/instruct/course-builder')}
                className="bg-green-600 hover:bg-green-700"
              >
                Create Your First Course
              </Button>
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
                        <Badge variant={course.published ? "default" : "secondary"}>
                          {course.published ? "Published" : "Draft"}
                        </Badge>
                        <Badge variant="outline">{course.subject}</Badge>
                        <Badge variant="outline">${course.price}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="flex items-center justify-center space-x-1 text-sm text-gray-600">
                          <BookOpen className="h-4 w-4" />
                          <span>{course.lessons?.length || 0}</span>
                        </div>
                        <p className="text-xs text-gray-500">Lessons</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center space-x-1 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>{course.enrollments || 0}</span>
                        </div>
                        <p className="text-xs text-gray-500">Students</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center space-x-1 text-sm text-gray-600">
                          <DollarSign className="h-4 w-4" />
                          <span>{course.revenue || 0}</span>
                        </div>
                        <p className="text-xs text-gray-500">Revenue</p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => navigate(`/instruct/course-builder?id=${course.id}`)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTogglePublish(course)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteCourse(course.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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

export default InstructorCourses;

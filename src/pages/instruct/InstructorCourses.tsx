
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  Trash2,
  Users,
  DollarSign,
  Calendar,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';
import MobileNav from '@/components/layout/MobileNav';

const InstructorCourses = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (user) {
      loadCourses();
    }
  }, [user]);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, statusFilter]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      
      // Get instructor's courses
      const coursesData = await db.queryBuilder('courses')
        .where((c: any) => c.creatorId === user?.id)
        .sort('updatedAt', 'desc')
        .exec();

      // Get enrollment data for each course
      const coursesWithStats = await Promise.all(
        coursesData.map(async (course: any) => {
          const enrollments = await db.queryBuilder('enrollments')
            .where((e: any) => e.courseId === course.id && e.status === 'active')
            .exec();

          const lessons = await db.queryBuilder('lessons')
            .where((l: any) => l.courseId === course.id)
            .exec();

          return {
            ...course,
            enrollmentCount: enrollments.length,
            lessonCount: lessons.length,
            totalRevenue: enrollments.reduce((acc: number, e: any) => acc + (e.amount || 0), 0)
          };
        })
      );

      setCourses(coursesWithStats);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load courses',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      if (statusFilter === 'published') {
        filtered = filtered.filter(course => course.isPublished);
      } else if (statusFilter === 'draft') {
        filtered = filtered.filter(course => !course.isPublished);
      }
    }

    setFilteredCourses(filtered);
  };

  const togglePublishStatus = async (courseId: string, currentStatus: boolean) => {
    try {
      await db.update('courses', courseId, {
        isPublished: !currentStatus,
        updatedAt: new Date().toISOString()
      });

      setCourses(prev => 
        prev.map(course => 
          course.id === courseId 
            ? { ...course, isPublished: !currentStatus }
            : course
        )
      );

      toast({
        title: 'Success',
        description: `Course ${currentStatus ? 'unpublished' : 'published'} successfully`
      });
    } catch (error) {
      console.error('Error updating course status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update course status',
        variant: 'destructive'
      });
    }
  };

  const deleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      // Delete related data
      await Promise.all([
        db.queryBuilder('lessons').where((l: any) => l.courseId === courseId).exec()
          .then(lessons => Promise.all(lessons.map((l: any) => db.delete('lessons', l.id)))),
        db.queryBuilder('quizzes').where((q: any) => q.courseId === courseId).exec()
          .then(quizzes => Promise.all(quizzes.map((q: any) => db.delete('quizzes', q.id)))),
        db.queryBuilder('flashcards').where((f: any) => f.courseId === courseId).exec()
          .then(flashcards => Promise.all(flashcards.map((f: any) => db.delete('flashcards', f.id)))),
      ]);

      // Delete the course
      await db.delete('courses', courseId);

      setCourses(prev => prev.filter(course => course.id !== courseId));
      
      toast({
        title: 'Success',
        description: 'Course deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete course',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <MobileNav />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
              <p className="text-gray-600">Manage and create your courses</p>
            </div>
          </div>
          
          <Button
            onClick={() => navigate('/instruct/courses/new')}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'published' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('published')}
            >
              Published
            </Button>
            <Button
              variant={statusFilter === 'draft' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('draft')}
            >
              Draft
            </Button>
          </div>
        </div>

        {/* Courses */}
        {filteredCourses.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {courses.length === 0 ? 'No courses yet' : 'No courses found'}
              </h3>
              <p className="text-gray-600 mb-4">
                {courses.length === 0 
                  ? "Start creating courses to share your knowledge with students"
                  : "No courses match your current filters."
                }
              </p>
              {courses.length === 0 && (
                <Button onClick={() => navigate('/instruct/courses/new')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Course
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2 mb-2">
                        {course.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {course.description}
                      </p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => navigate(`/course/${course.id}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate(`/instruct/courses/${course.id}/edit`)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => togglePublishStatus(course.id, course.isPublished)}
                        >
                          {course.isPublished ? 'Unpublish' : 'Publish'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteCourse(course.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                    <Badge variant="outline">
                      {course.difficulty}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-blue-600">
                          {course.enrollmentCount}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                          <Users className="h-3 w-3" />
                          Students
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-green-600">
                          ${course.totalRevenue.toFixed(0)}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          Revenue
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-purple-600">
                          {course.lessonCount}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          Lessons
                        </div>
                      </div>
                    </div>

                    {/* Course Info */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>${course.price || 'Free'}</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(course.updatedAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => navigate(`/course/${course.id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate(`/instruct/courses/${course.id}/edit`)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
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

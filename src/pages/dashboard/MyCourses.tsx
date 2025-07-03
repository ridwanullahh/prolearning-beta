
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Clock, 
  Star, 
  Search,
  Filter,
  Play,
  CheckCircle
} from 'lucide-react';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';
import MobileNav from '@/components/layout/MobileNav';

interface EnrolledCourse {
  id: string;
  course: any;
  progress: number;
  lastAccessed: string;
  status: string;
}

const MyCourses = () => {
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<EnrolledCourse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (user) {
      loadEnrolledCourses();
    }
  }, [user]);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, filterStatus]);

  const loadEnrolledCourses = async () => {
    try {
      setLoading(true);
      
      // Get user enrollments
      const enrollments = await db.queryBuilder('enrollments')
        .where((e: any) => e.userId === user?.id && e.status === 'active')
        .exec();

      // Get course details and progress for each enrollment
      const enrolledCourses = await Promise.all(
        enrollments.map(async (enrollment: any) => {
          const [course, progress] = await Promise.all([
            db.getItem('courses', enrollment.courseId),
            db.queryBuilder('userProgress')
              .where((p: any) => p.userId === user?.id && p.courseId === enrollment.courseId)
              .exec()
          ]);

          const latestProgress = progress.length > 0 ? progress[progress.length - 1] : null;

          return {
            id: enrollment.id,
            course,
            progress: latestProgress?.progressPercentage || 0,
            lastAccessed: latestProgress?.lastAccessedAt || enrollment.enrolledAt,
            status: latestProgress?.progressPercentage === 100 ? 'completed' : 'in-progress'
          };
        })
      );

      setCourses(enrolledCourses.filter(ec => ec.course));
    } catch (error) {
      console.error('Error loading enrolled courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(ec =>
        ec.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ec.course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(ec => ec.status === filterStatus);
    }

    setFilteredCourses(filtered);
  };

  const continueCourse = (courseId: string) => {
    navigate(`/my-course/${courseId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <MobileNav />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
              <p className="text-gray-600">Continue your learning journey</p>
            </div>
          </div>
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
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
            >
              All
            </Button>
            <Button
              variant={filterStatus === 'in-progress' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('in-progress')}
            >
              In Progress
            </Button>
            <Button
              variant={filterStatus === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('completed')}
            >
              Completed
            </Button>
          </div>
        </div>

        {/* Course Grid */}
        {filteredCourses.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No courses found</h3>
              <p className="text-gray-600 mb-4">
                {courses.length === 0 
                  ? "You haven't enrolled in any courses yet."
                  : "No courses match your current filters."
                }
              </p>
              <Button onClick={() => navigate('/marketplace')}>
                Browse Marketplace
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((enrolledCourse) => (
              <Card key={enrolledCourse.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">
                        {enrolledCourse.course.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {enrolledCourse.course.description}
                      </p>
                    </div>
                    <Badge 
                      variant={enrolledCourse.status === 'completed' ? 'default' : 'secondary'}
                      className="ml-2"
                    >
                      {enrolledCourse.status === 'completed' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <Play className="h-3 w-3 mr-1" />
                      )}
                      {enrolledCourse.status === 'completed' ? 'Completed' : 'In Progress'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-gray-600">
                          {Math.round(enrolledCourse.progress)}%
                        </span>
                      </div>
                      <Progress value={enrolledCourse.progress} className="w-full" />
                    </div>

                    {/* Course Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {enrolledCourse.course.duration}h
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {enrolledCourse.course.rating || 'New'}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {enrolledCourse.course.difficulty}
                      </Badge>
                    </div>

                    {/* Last Accessed */}
                    <p className="text-xs text-gray-500">
                      Last accessed: {new Date(enrolledCourse.lastAccessed).toLocaleDateString()}
                    </p>

                    {/* Continue Button */}
                    <Button
                      onClick={() => continueCourse(enrolledCourse.course.id)}
                      className="w-full"
                      variant={enrolledCourse.status === 'completed' ? 'outline' : 'default'}
                    >
                      {enrolledCourse.status === 'completed' ? 'Review Course' : 'Continue Learning'}
                    </Button>
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

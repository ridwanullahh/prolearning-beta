
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authService } from '@/lib/auth';
import { db } from '@/lib/github-sdk';
import {
  BookOpen,
  CheckCircle,
  Clock,
  Calendar,
  Play,
  PlusCircle,
  Star,
  Trophy,
  Target,
  TrendingUp,
  Filter,
  Search,
  MoreVertical,
  Trash2,
  UserMinus,
  ExternalLink
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from 'framer-motion';

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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (user) {
      loadEnrolledCourses();
    }
  }, [user]);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, activeTab]);

  const loadEnrolledCourses = async () => {
    try {
      setLoading(true);

      const enrollments = await db
        .queryBuilder('enrollments')
        .where((e: any) => e.userId === user?.id && e.status === 'active')
        .exec();

      const enrolledCourses = await Promise.all(
        enrollments.map(async (enrollment: any) => {
          const [course, progress] = await Promise.all([
            db.getItem('courses', enrollment.courseId),
            db
              .queryBuilder('userProgress')
              .where(
                (p: any) =>
                  p.userId === user?.id && p.courseId === enrollment.courseId
              )
              .exec(),
          ]);

          const latestProgress =
            progress.length > 0 ? progress[progress.length - 1] : null;

          return {
            id: enrollment.id,
            course,
            progress: latestProgress?.progressPercentage || 0,
            lastAccessed:
              latestProgress?.lastAccessedAt || enrollment.enrolledAt,
            status:
              latestProgress?.progressPercentage === 100
                ? 'completed'
                : 'in-progress',
          };
        })
      );

      setCourses(enrolledCourses.filter((ec) => ec.course));
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
      filtered = filtered.filter(course =>
        course.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (activeTab !== 'all') {
      filtered = filtered.filter(course => course.status === activeTab);
    }

    setFilteredCourses(filtered);
  };

  const continueCourse = (courseId: string) => {
    navigate(`/my-course/${courseId}`);
  };

  const handleUnenrollCourse = async (enrollmentId: string) => {
    try {
      await db.update('enrollments', enrollmentId, { status: 'inactive' });
      loadEnrolledCourses();
    } catch (error) {
      console.error('Error unenrolling from course:', error);
      alert('Failed to unenroll from course.');
    }
  };

  const handleDeleteCourse = async (enrollmentId: string) => {
    try {
      await db.delete('enrollments', enrollmentId);
      loadEnrolledCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course.');
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 70) return 'bg-green-400';
    if (progress >= 40) return 'bg-yellow-400';
    return 'bg-blue-400';
  };

  const getStatusIcon = (status: string) => {
    return status === 'completed' ? (
      <Trophy className="h-4 w-4 text-green-600" />
    ) : (
      <Target className="h-4 w-4 text-blue-600" />
    );
  };

  const CourseCard = ({ enrolledCourse }: { enrolledCourse: EnrolledCourse }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="group"
      >
        <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-green-50/50 hover:from-green-50/50 hover:to-green-100/50 relative overflow-hidden">
          {/* Progress indicator bar at top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
            <div 
              className={`h-full transition-all duration-500 ${getProgressColor(enrolledCourse.progress)}`}
              style={{ width: `${enrolledCourse.progress}%` }}
            />
          </div>

          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-bold text-gray-800 group-hover:text-green-700 transition-colors">
                  {enrolledCourse.course.title}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {enrolledCourse.course.description}
                </CardDescription>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => continueCourse(enrolledCourse.course.id)}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Continue Learning
                  </DropdownMenuItem>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <UserMinus className="h-4 w-4 mr-2" />
                        Unenroll
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Unenroll from Course?</AlertDialogTitle>
                        <AlertDialogDescription>
                          You will lose access to this course content. You can re-enroll later if needed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleUnenrollCourse(enrolledCourse.id)}>
                          Unenroll
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Course Permanently?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. All your progress will be lost.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteCourse(enrolledCourse.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2 mt-3">
              <Badge
                variant={enrolledCourse.status === 'completed' ? 'default' : 'secondary'}
                className={`flex items-center gap-1 ${
                  enrolledCourse.status === 'completed' 
                    ? 'bg-green-100 text-green-700 border-green-200' 
                    : 'bg-blue-100 text-blue-700 border-blue-200'
                }`}
              >
                {getStatusIcon(enrolledCourse.status)}
                {enrolledCourse.status === 'completed' ? 'Completed' : 'In Progress'}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {/* Course Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>{enrolledCourse.course.rating || 'New'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{enrolledCourse.course.duration}h</span>
              </div>
            </div>

            {/* Progress Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-semibold text-gray-800">
                  {Math.round(enrolledCourse.progress)}%
                </span>
              </div>
              
              <Progress 
                value={enrolledCourse.progress} 
                className="h-2 bg-gray-200"
              />

              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>Last accessed: {new Date(enrolledCourse.lastAccessed).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Action Button */}
            <Button 
              onClick={() => continueCourse(enrolledCourse.course.id)}
              className="w-full mt-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium group/btn"
            >
              {enrolledCourse.status === 'completed' ? (
                <>
                  <Trophy className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                  Review Course
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                  Continue Learning
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const EmptyState = ({ type }: { type: string }) => {
    const getEmptyStateContent = () => {
      switch (type) {
        case 'in-progress':
          return {
            icon: <Target className="h-16 w-16 text-blue-400" />,
            title: "No Courses in Progress",
            description: "Start learning by enrolling in a course from our marketplace.",
          };
        case 'completed':
          return {
            icon: <Trophy className="h-16 w-16 text-green-400" />,
            title: "No Completed Courses",
            description: "Complete your enrolled courses to see them here.",
          };
        default:
          return {
            icon: <BookOpen className="h-16 w-16 text-gray-400" />,
            title: "No Courses Yet",
            description: "Start your learning journey by exploring our course marketplace.",
          };
      }
    };

    const content = getEmptyStateContent();

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 px-4"
      >
        <div className="text-center max-w-md">
          {content.icon}
          <h3 className="text-xl font-semibold text-gray-800 mt-4">
            {content.title}
          </h3>
          <p className="text-gray-600 mt-2 mb-6">
            {content.description}
          </p>
          <Button
            onClick={() => navigate('/marketplace')}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Browse Courses
          </Button>
        </div>
      </motion.div>
    );
  };

  // Stats calculation
  const stats = {
    total: courses.length,
    inProgress: courses.filter(c => c.status === 'in-progress').length,
    completed: courses.filter(c => c.status === 'completed').length,
    avgProgress: courses.length > 0 
      ? Math.round(courses.reduce((acc, c) => acc + c.progress, 0) / courses.length)
      : 0
  };

  return (
    <div>
      <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-gray-50 to-green-50/30">
        <div> 
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          </div>
          <main className="flex-1 p-4 sm:px-6">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
                  <p className="text-gray-600 mt-1">Track your learning progress and continue your journey</p>
                </div>
                <Button
                  onClick={() => navigate('/marketplace')}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Browse More Courses
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                        <p className="text-sm text-blue-600">Total Courses</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Target className="h-8 w-8 text-yellow-600" />
                      <div>
                        <p className="text-2xl font-bold text-yellow-900">{stats.inProgress}</p>
                        <p className="text-sm text-yellow-600">In Progress</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Trophy className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
                        <p className="text-sm text-green-600">Completed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                      <div>
                        <p className="text-2xl font-bold text-purple-900">{stats.avgProgress}%</p>
                        <p className="text-sm text-purple-600">Avg Progress</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Search and Filter Section */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search your courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-gray-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Tabs Section */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-white border border-gray-200 p-1">
                <TabsTrigger value="all" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                  All Courses ({stats.total})
                </TabsTrigger>
                <TabsTrigger value="in-progress" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                  In Progress ({stats.inProgress})
                </TabsTrigger>
                <TabsTrigger value="completed" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                  Completed ({stats.completed})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="h-80 animate-pulse">
                        <CardHeader>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="h-3 bg-gray-200 rounded"></div>
                            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                            <div className="h-8 bg-gray-200 rounded"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredCourses.length === 0 ? (
                  <EmptyState type="all" />
                ) : (
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    layout
                  >
                    <AnimatePresence>
                      {filteredCourses.map((course) => (
                        <CourseCard key={course.id} enrolledCourse={course} />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </TabsContent>

              <TabsContent value="in-progress">
                {filteredCourses.length === 0 ? (
                  <EmptyState type="in-progress" />
                ) : (
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    layout
                  >
                    <AnimatePresence>
                      {filteredCourses.map((course) => (
                        <CourseCard key={course.id} enrolledCourse={course} />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </TabsContent>

              <TabsContent value="completed">
                {filteredCourses.length === 0 ? (
                  <EmptyState type="completed" />
                ) : (
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    layout
                  >
                    <AnimatePresence>
                      {filteredCourses.map((course) => (
                        <CourseCard key={course.id} enrolledCourse={course} />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </div>
  );
};

export default MyCourses;
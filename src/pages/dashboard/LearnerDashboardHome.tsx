import {
  BookOpen,
  Brain,
  Clock,
  Lightbulb,
  Plus,
  Star,
  Target,
  TrendingUp,
  Award,
  Calendar,
  ChevronRight,
  Play,
  BarChart3,
  Zap,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { authService } from '@/lib/auth';
import { db } from '@/lib/github-sdk';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CourseGenerationWizard from '@/components/course/CourseGenerationWizard';
import { motion } from 'framer-motion';

const LearnerDashboardHome = () => {
  const [showCourseGenerator, setShowCourseGenerator] = useState(false);
  const [stats, setStats] = useState({
    coursesInProgress: 0,
    completedLessons: 0,
    studyHours: 0,
    aiGenerationsLeft: 3,
  });
  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = authService.getCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [enrollments, progress, usage] = await Promise.all([
        db
          .queryBuilder('enrollments')
          .where((e: any) => e.userId === user?.id && e.status === 'active')
          .exec(),
        db
          .queryBuilder('userProgress')
          .where((p: any) => p.userId === user?.id)
          .exec(),
        db
          .queryBuilder('aiGenerationUsage')
          .where(
            (u: any) =>
              u.userId === user?.id &&
              u.month === new Date().toISOString().substring(0, 7)
          )
          .exec(),
      ]);

      const coursesInProgress = enrollments.filter((e: any) => {
        const courseProgress = progress.find(
          (p: any) => p.courseId === e.courseId
        );
        return !courseProgress || courseProgress.progressPercentage < 100;
      }).length;

      const completedLessons = progress.filter(
        (p: any) => p.progressPercentage === 100
      ).length;
      const totalStudyHours = progress.reduce(
        (acc: number, p: any) => acc + (p.totalTimeSpent || 0),
        0
      );
      const currentUsage = usage.length > 0 ? usage[0] : null;
      const generationsUsed = currentUsage ? currentUsage.freeGenerationsUsed : 0;

      setStats({
        coursesInProgress,
        completedLessons,
        studyHours: Math.round(totalStudyHours / 60),
        aiGenerationsLeft: Math.max(0, 3 - generationsUsed),
      });

      const recentEnrollments = enrollments.slice(0, 3);
      const coursesData = await Promise.all(
        recentEnrollments.map(async (enrollment: any) => {
          const course = await db.getItem('courses', enrollment.courseId);
          const courseProgress = progress.find(
            (p: any) => p.courseId === enrollment.courseId
          );
          return {
            ...course,
            progress: courseProgress?.progressPercentage || 0,
            lastAccessed:
              courseProgress?.lastAccessedAt || enrollment.enrolledAt,
          };
        })
      );

      setRecentCourses(coursesData.filter(Boolean));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseGenerated = (course: any) => {
    setShowCourseGenerator(false);
    loadDashboardData();
    navigate(`/my-course/${course.id}`);
  };

  if (showCourseGenerator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-950 dark:via-green-950 dark:to-teal-950">
        <div className="p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Button
              variant="outline"
              onClick={() => setShowCourseGenerator(false)}
              className="mb-4 rounded-full px-6 py-2 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gray-50"
            >
              ← Back to Dashboard
            </Button>
          </motion.div>
          <CourseGenerationWizard onCourseGenerated={handleCourseGenerated} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-3xl p-6 lg:p-8 text-white shadow-xl shadow-green-600/25"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
              Welcome back, {user?.name?.split(' ')[0] || 'Learner'}! 👋
            </h1>
            <p className="text-green-100 text-lg">
              Ready to continue your learning journey today?
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowCourseGenerator(true)}
              disabled={stats.aiGenerationsLeft === 0}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm rounded-full px-6 py-3 font-medium transition-all duration-200"
              variant="outline"
            >
              <Zap className="mr-2 h-4 w-4" />
              {stats.aiGenerationsLeft === 0 ? 'No Generations Left' : 'Generate Course'}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: 'Active Courses',
            value: stats.coursesInProgress,
            subtitle: 'Keep learning!',
            icon: BookOpen,
            color: 'from-green-500 to-emerald-500',
            bgColor: 'bg-green-50 dark:bg-green-950/20',
          },
          {
            title: 'Completed Lessons',
            value: stats.completedLessons,
            subtitle: 'Great progress',
            icon: Target,
            color: 'from-green-500 to-emerald-500',
            bgColor: 'bg-green-50 dark:bg-green-950/20',
          },
          {
            title: 'Study Hours',
            value: stats.studyHours,
            subtitle: 'This month',
            icon: Clock,
            color: 'from-orange-500 to-red-500',
            bgColor: 'bg-orange-50 dark:bg-orange-950/20',
          },
          {
            title: 'AI Generations',
            value: stats.aiGenerationsLeft,
            subtitle: 'Left this month',
            icon: Brain,
            color: 'from-green-500 to-emerald-500',
            bgColor: 'bg-green-50 dark:bg-green-950/20',
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              <CardContent className="p-6">
                <div className={`absolute top-0 right-0 w-20 h-20 ${stat.bgColor} rounded-full -translate-y-8 translate-x-8 opacity-50`} />
                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {stat.subtitle}
                    </p>
                  </div>
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
        {/* Continue Learning Section */}
        <div className="lg:col-span-2 space-y-6">
          {recentCourses.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                        Continue Learning
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Pick up where you left off
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/dashboard/courses')}
                      className="rounded-full px-4 py-2 text-sm font-medium"
                    >
                      View All
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentCourses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                      className="group p-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-green-200 dark:hover:border-green-800 hover:bg-gradient-to-r hover:from-green-50/50 hover:to-emerald-50/50 dark:hover:from-green-950/20 dark:hover:to-emerald-950/20 transition-all duration-200 cursor-pointer"
                      onClick={() => navigate(`/my-course/${course.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                              <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                {course.title}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {course.description}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 mb-3">
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <Clock className="h-3 w-3" />
                              {course.duration}h
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <Star className="h-3 w-3" />
                              {course.rating || 'New'}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <Users className="h-3 w-3" />
                              {course.enrollmentCount || 0} enrolled
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Progress</span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {Math.round(course.progress)}%
                              </span>
                            </div>
                            <Progress value={course.progress} className="h-2" />
                          </div>
                        </div>

                        <div className="ml-4 flex items-center">
                          <Button
                            size="sm"
                            className="rounded-full bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-600/25"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="border-0 shadow-xl">
                <CardContent className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Brain className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Start Your Learning Journey
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Generate your first AI-powered course tailored to your learning goals and interests
                  </p>
                  <Button
                    onClick={() => setShowCourseGenerator(true)}
                    disabled={stats.aiGenerationsLeft === 0}
                    className="rounded-full px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium shadow-lg shadow-green-600/25"
                    size="lg"
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    {stats.aiGenerationsLeft === 0
                      ? 'No Generations Left'
                      : 'Generate Your First Course'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => setShowCourseGenerator(true)}
                  disabled={stats.aiGenerationsLeft === 0}
                  className="w-full rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-3 shadow-lg shadow-green-600/25"
                >
                  <Brain className="mr-2 h-4 w-4" />
                  Generate Course
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/marketplace')}
                  className="w-full rounded-2xl py-3 font-medium border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Browse Marketplace
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/achievements')}
                  className="w-full rounded-2xl py-3 font-medium border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Award className="mr-2 h-4 w-4" />
                  View Achievements
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Learning Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                    <Lightbulb className="h-4 w-4 text-white" />
                  </div>
                  Learning Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    'Set daily learning goals',
                    'Take regular breaks',
                    'Practice with flashcards',
                    'Join study communities',
                    'Review previous lessons',
                  ].map((tip, index) => (
                    <div key={tip} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-xs font-bold text-white">
                        {index + 1}
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{tip}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Study Streak */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  Study Streak
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-4">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">7</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">days in a row</div>
                </div>
                <Badge className="bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400">
                  Keep it up! 🔥
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LearnerDashboardHome;
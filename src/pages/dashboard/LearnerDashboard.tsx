import { SidebarProvider } from '@/components/ui/sidebar';
import { AppHeader, AppSidebar } from '@/components/layout/Sidebar';
import {
  BookOpen,
  Brain,
  Clock,
  Lightbulb,
  Plus,
  Star,
  Target,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { authService } from '@/lib/auth';
import { db } from '@/lib/github-sdk';
import { useEffect, useState } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import CourseGenerationWizard from '@/components/course/CourseGenerationWizard';
import FloatingToolbar from '@/components/global/FloatingToolbar';
import { motion } from 'framer-motion';

const LearnerDashboard = () => {
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950">
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
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-row bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/20">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <AppHeader />
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
              <Outlet />
            </div>
          </main>
        </div>
        <FloatingToolbar />
      </div>
    </SidebarProvider>
  );
};

export default LearnerDashboard;
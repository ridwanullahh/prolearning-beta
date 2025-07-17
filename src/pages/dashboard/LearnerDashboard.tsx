
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppHeader, AppSidebar } from '@/components/layout/Sidebar'; // Forces re-evaluation of imports
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
			<div className="p-4 sm:p-6 lg:p-8">
				<Button
					variant="outline"
					onClick={() => setShowCourseGenerator(false)}
					className="mb-4"
				>
					← Back to Dashboard
				</Button>
				<CourseGenerationWizard onCourseGenerated={handleCourseGenerated} />
			</div>
		);
	}

	return (
		<SidebarProvider>
			<div className="flex min-h-screen w-full flex-row bg-muted/40">
				<AppSidebar />
				<div className="flex flex-col sm:gap-4">
					<AppHeader />
					<main className="grid flex-1 items-start gap-4 p-4 sm:px-6 md:gap-8">
						<Outlet />
					</main>
				</div>
			</div>
		</SidebarProvider>
	);
};

export default LearnerDashboard;

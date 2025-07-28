
import { AppHeader, AppSidebar } from '@/components/layout/Sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { authService } from '@/lib/auth';
import { db } from '@/lib/github-sdk';
import {
	BookOpen,
	DollarSign,
	Edit,
	Eye,
	Plus,
	TrendingUp,
	Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';

const InstructorDashboard = () => {
	const [stats, setStats] = useState({
		totalCourses: 0,
		totalStudents: 0,
		revenue: 0,
		avgRating: 0,
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

			const courses = await db
				.queryBuilder('courses')
				.where((c: any) => c.creatorId === user?.id)
				.exec();

			const courseIds = courses.map((c: any) => c.id);
			const enrollments = await db
				.queryBuilder('enrollments')
				.where(
					(e: any) => courseIds.includes(e.courseId) && e.status === 'active'
				)
				.exec();

			const totalStudents = enrollments.length;
			const revenue = enrollments.reduce(
				(acc: number, e: any) => acc + (e.amount || 0),
				0
			);
			const avgRating =
				courses.length > 0
					? courses.reduce((acc: number, c: any) => acc + (c.rating || 0), 0) /
					  courses.length
					: 0;

			setStats({
				totalCourses: courses.length,
				totalStudents,
				revenue,
				avgRating: Math.round(avgRating * 10) / 10,
			});

			const recentCoursesData = courses
				.sort(
					(a: any, b: any) =>
						new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
				)
				.slice(0, 5)
				.map((course: any) => ({
					...course,
					enrollmentCount: enrollments.filter(
						(e: any) => e.courseId === course.id
					).length,
				}));

			setRecentCourses(recentCoursesData);
		} catch (error) {
			console.error('Error loading dashboard data:', error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<SidebarProvider>
			<div className="flex min-h-screen w-full flex-row bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/20">
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

export default InstructorDashboard;

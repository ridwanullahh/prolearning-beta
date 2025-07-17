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
import { Link, useNavigate } from 'react-router-dom';

const InstructorDashboardHome = () => {
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
		<>
			<div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Courses
						</CardTitle>
						<BookOpen className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalCourses}</div>
						<p className="text-xs text-muted-foreground">
							{`+${Math.floor(Math.random() * 3)} this month`}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Students
						</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalStudents}</div>
						<p className="text-xs text-muted-foreground">
							Enrolled across all courses
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Revenue</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							${stats.revenue.toFixed(2)}
						</div>
						<p className="text-xs text-muted-foreground">
							+12% from last month
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Course Rating
						</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{stats.avgRating || '—'}
						</div>
						<p className="text-xs text-muted-foreground">Average rating</p>
					</CardContent>
				</Card>
			</div>
			<div>
				<Card>
					<CardHeader className="flex flex-row items-center">
						<div className="grid gap-2">
							<CardTitle>Course Management</CardTitle>
							<CardDescription>
								Manage your courses and content
							</CardDescription>
						</div>
						<Button
							asChild
							size="sm"
							className="ml-auto gap-1"
							onClick={() => navigate('/instruct/courses/new')}
						>
							<Link to="/instruct/courses/new">
								Create Course
								<Plus className="h-4 w-4" />
							</Link>
						</Button>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Course</TableHead>
									<TableHead className="hidden md:table-cell">
										Status
									</TableHead>
									<TableHead className="hidden md:table-cell">
										Students
									</TableHead>
									<TableHead className="hidden md:table-cell">
										Price
									</TableHead>
									<TableHead>
										<span className="sr-only">Actions</span>
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{recentCourses.map((course) => (
									<TableRow key={course.id}>
										<TableCell>
											<div className="font-medium">{course.title}</div>
										</TableCell>
										<TableCell className="hidden md:table-cell">
											<Badge
												variant={
													course.isPublished ? 'default' : 'secondary'
												}
											>
												{course.isPublished ? 'Published' : 'Draft'}
											</Badge>
										</TableCell>
										<TableCell className="hidden md:table-cell">
											{course.enrollmentCount}
										</TableCell>
										<TableCell className="hidden md:table-cell">
											${course.price || 'Free'}
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<Button
													size="sm"
													variant="outline"
													onClick={() => navigate(`/course/${course.id}`)}
												>
													<Eye className="h-4 w-4" />
												</Button>
												<Button
													size="sm"
													onClick={() =>
														navigate(
															`/instruct/courses/${course.id}/edit`
														)
													}
												>
													<Edit className="h-4 w-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>
		</>
	);
};

export default InstructorDashboardHome;
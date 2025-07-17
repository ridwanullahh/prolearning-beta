
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppHeader, AppSidebar } from '@/components/layout/Sidebar';
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authService } from '@/lib/auth';
import { db } from '@/lib/github-sdk';
import {
	BookOpen,
	CheckCircle,
	Clock,
	ListFilter,
	Play,
	PlusCircle,
	Star,
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
} from "@/components/ui/alert-dialog"

interface EnrolledCourse {
	id: string;
	course: any;
	progress: number;
	lastAccessed: string;
	status: string;
}

const MyCourses = () => {
	const [courses, setCourses] = useState<EnrolledCourse[]>([]);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();
	const user = authService.getCurrentUser();

	useEffect(() => {
		if (user) {
			loadEnrolledCourses();
		}
	}, [user]);

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

	const continueCourse = (courseId: string) => {
		navigate(`/my-course/${courseId}`);
	};

	const CourseRow = ({ enrolledCourse }: { enrolledCourse: EnrolledCourse }) => {
		const [open, setOpen] = useState(false);
		const [deleteOpen, setDeleteOpen] = useState(false);
		const navigate = useNavigate();

		const handleUnenrollCourse = async (enrollmentId: string) => {
			try {
				await db.update('enrollments', enrollmentId, { status: 'inactive' });
				loadEnrolledCourses(); // Refresh course list
			} catch (error) {
				console.error('Error unenrolling from course:', error);
				alert('Failed to unenroll from course.');
			}
		};

		const handleDeleteCourse = async (enrollmentId: string) => {
			try {
				await db.delete('enrollments', enrollmentId);
				loadEnrolledCourses(); // Refresh course list
			} catch (error) {
				console.error('Error deleting course:', error);
				alert('Failed to delete course.');
			}
		};

		return (
			<TableRow key={enrolledCourse.id}>
				<TableCell>
				<div className="font-medium">{enrolledCourse.course.title}</div>
				<div className="hidden text-sm text-muted-foreground md:inline">
					{enrolledCourse.course.description}
				</div>
			</TableCell>
			<TableCell>
				<Badge
					variant={
						enrolledCourse.status === 'completed' ? 'default' : 'secondary'
					}
				>
					{enrolledCourse.status === 'completed' ? (
						<CheckCircle className="h-3 w-3 mr-1" />
					) : (
						<Play className="h-3 w-3 mr-1" />
					)}
					{enrolledCourse.status === 'completed' ? 'Completed' : 'In Progress'}
				</Badge>
			</TableCell>
			<TableCell className="hidden md:table-cell">
				<div className="flex items-center gap-1">
					<Star className="h-4 w-4 text-yellow-500" />
					{enrolledCourse.course.rating || 'New'}
				</div>
			</TableCell>
			<TableCell className="hidden md:table-cell">
				<div className="flex items-center gap-1">
					<Clock className="h-4 w-4" />
					{enrolledCourse.course.duration}h
				</div>
			</TableCell>
			<TableCell>
				<Progress value={enrolledCourse.progress} className="w-full" />
				<span className="text-xs text-muted-foreground">
					{Math.round(enrolledCourse.progress)}%
				</span>
				<span className="text-xs text-muted-foreground">
					{Math.round(enrolledCourse.progress)}%
				</span>
			</TableCell>
			<TableCell>
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button variant="destructive" size="sm">
							Unenroll
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone. Are you sure you want to unenroll from this course?
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
						<Button variant="destructive" size="sm">
							Delete
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone. Are you sure you want to permanently delete
								this course from your account?
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction onClick={() => handleDeleteCourse(enrolledCourse.id)}>
								Delete
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</TableCell>
		</TableRow>
	);
	};

	const handleUnenrollCourse = async (enrollmentId: string) => {
		try {
			await db.update('enrollments', enrollmentId, { status: 'inactive' });
			loadEnrolledCourses(); // Refresh course list
		} catch (error) {
			console.error('Error unenrolling from course:', error);
			alert('Failed to unenroll from course.');
		}
	};

	const handleDeleteCourse = async (enrollmentId: string) => {
		try {
			await db.delete('enrollments', enrollmentId);
			loadEnrolledCourses(); // Refresh course list
		} catch (error) {
			console.error('Error deleting course:', error);
			alert('Failed to delete course.');
		}
	};

	return (
		<SidebarProvider>
			<div className="flex min-h-screen w-full flex-col bg-muted/40">
				<AppSidebar />
				<div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
					<AppHeader />
					<main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
						<Tabs defaultValue="all">
							<div className="flex items-center">
								<TabsList>
									<TabsTrigger value="all">All</TabsTrigger>
									<TabsTrigger value="in-progress">In Progress</TabsTrigger>
									<TabsTrigger value="completed">Completed</TabsTrigger>
								</TabsList>
								<div className="ml-auto flex items-center gap-2">
									<Button size="sm" variant="outline" className="h-8 gap-1">
										<ListFilter className="h-3.5 w-3.5" />
										<span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
											Filter
										</span>
									</Button>
									<Button
										size="sm"
										className="h-8 gap-1"
										onClick={() => navigate('/marketplace')}
									>
										<PlusCircle className="h-3.5 w-3.5" />
										<span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
											Browse Courses
										</span>
									</Button>
								</div>
							</div>
							<TabsContent value="all">
								<Card>
									<CardHeader>
										<CardTitle>My Courses</CardTitle>
										<CardDescription>
											Manage and track your enrolled courses.
										</CardDescription>
									</CardHeader>
									<CardContent>
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Course</TableHead>
													<TableHead>Status</TableHead>
													<TableHead className="hidden md:table-cell">
														Rating
													</TableHead>
													<TableHead className="hidden md:table-cell">
														Duration
													</TableHead>
													<TableHead>Progress</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{loading ? (
													<TableRow>
														<TableCell colSpan={5} className="text-center">
															Loading...
														</TableCell>
													</TableRow>
												) : courses.length === 0 ? (
													<TableRow>
														<TableCell colSpan={5} className="text-center">
															<div className="py-12">
																<BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
																<h3 className="text-lg font-semibold mt-4">
																	No Courses Yet
																</h3>
																<p className="text-muted-foreground mt-2">
																	You have not enrolled in any courses.
																</p>
																<Button
																	className="mt-4"
																	onClick={() => navigate('/marketplace')}
																>
																	Browse Marketplace
																</Button>
															</div>
														</TableCell>
													</TableRow>
												) : (
													courses.map((course) => <CourseRow enrolledCourse={course} key={course.id} />)
												)}
											</TableBody>
										</Table>
									</CardContent>
								</Card>
							</TabsContent>
							<TabsContent value="in-progress">
								<Card>
									<CardHeader>
										<CardTitle>In Progress</CardTitle>
										<CardDescription>
											Courses you are currently taking.
										</CardDescription>
									</CardHeader>
									<CardContent>
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Course</TableHead>
													<TableHead>Status</TableHead>
													<TableHead className="hidden md:table-cell">
														Rating
													</TableHead>
													<TableHead className="hidden md:table-cell">
														Duration
													</TableHead>
													<TableHead>Progress</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{courses
													.filter((c) => c.status === 'in-progress')
													.map((course) => <CourseRow enrolledCourse={course} key={course.id} />)}
											</TableBody>
										</Table>
									</CardContent>
								</Card>
							</TabsContent>
							<TabsContent value="completed">
								<Card>
									<CardHeader>
										<CardTitle>Completed</CardTitle>
										<CardDescription>
											Courses you have successfully completed.
										</CardDescription>
									</CardHeader>
									<CardContent>
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Course</TableHead>
													<TableHead>Status</TableHead>
													<TableHead className="hidden md:table-cell">
														Rating
													</TableHead>
													<TableHead className="hidden md:table-cell">
														Duration
													</TableHead>
													<TableHead>Progress</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{courses
													.filter((c) => c.status === 'completed')
													.map((course) => <CourseRow enrolledCourse={course} key={course.id} />)}
											</TableBody>
										</Table>
									</CardContent>
								</Card>
							</TabsContent>
						</Tabs>
					</main>
				</div>
			</div>
		</SidebarProvider>
	);
}

export default MyCourses;

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
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { authService } from '@/lib/auth';
import { db } from '@/lib/github-sdk';
import {
	BookOpen,
	DollarSign,
	Edit,
	Eye,
	ListFilter,
	MoreHorizontal,
	PlusCircle,
	Trash2,
	Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const InstructorCourses = () => {
	const [courses, setCourses] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();
	const user = authService.getCurrentUser();

	useEffect(() => {
		if (user) {
			loadCourses();
		}
	}, [user]);

	const loadCourses = async () => {
		if (!user) return;

		try {
			setLoading(true);
			const coursesData = await db
				.queryBuilder('courses')
				.where((course: any) => course.creatorId === user.id)
				.orderBy('createdAt', 'desc')
				.exec();
			setCourses(coursesData);
		} catch (error) {
			console.error('Error loading courses:', error);
		} finally {
			setLoading(false);
		}
	};

	const togglePublishStatus = async (
		courseId: string,
		currentStatus: boolean
	) => {
		try {
			await db.update('courses', courseId, {
				isPublished: !currentStatus,
				updatedAt: new Date().toISOString(),
			});

			setCourses((prev) =>
				prev.map((course) =>
					course.id === courseId
						? { ...course, isPublished: !currentStatus }
						: course
				)
			);

			toast({
				title: 'Success',
				description: `Course ${
					currentStatus ? 'unpublished' : 'published'
				} successfully`,
			});
		} catch (error) {
			console.error('Error updating course status:', error);
			toast({
				title: 'Error',
				description: 'Failed to update course status',
				variant: 'destructive',
			});
		}
	};

	const deleteCourse = async (courseId: string) => {
		if (
			!confirm(
				'Are you sure you want to delete this course? This action cannot be undone.'
			)
		) {
			return;
		}

		try {
			await Promise.all([
				db
					.queryBuilder('lessons')
					.where((l: any) => l.courseId === courseId)
					.exec()
					.then((lessons) =>
						Promise.all(lessons.map((l: any) => db.delete('lessons', l.id)))
					),
				db
					.queryBuilder('quizzes')
					.where((q: any) => q.courseId === courseId)
					.exec()
					.then((quizzes) =>
						Promise.all(quizzes.map((q: any) => db.delete('quizzes', q.id)))
					),
				db
					.queryBuilder('flashcards')
					.where((f: any) => f.courseId === courseId)
					.exec()
					.then((flashcards) =>
						Promise.all(
							flashcards.map((f: any) => db.delete('flashcards', f.id))
						)
					),
			]);

			await db.delete('courses', courseId);

			setCourses((prev) => prev.filter((course) => course.id !== courseId));

			toast({
				title: 'Success',
				description: 'Course deleted successfully',
			});
		} catch (error) {
			console.error('Error deleting course:', error);
			toast({
				title: 'Error',
				description: 'Failed to delete course',
				variant: 'destructive',
			});
		}
	};

	const renderCourseRow = (course: any) => (
		<TableRow key={course.id}>
			<TableCell className="font-medium">{course.title}</TableCell>
			<TableCell>
				<Badge variant={course.isPublished ? 'default' : 'secondary'}>
					{course.isPublished ? 'Published' : 'Draft'}
				</Badge>
			</TableCell>
			<TableCell className="hidden md:table-cell">
				{course.enrollmentCount || 0}
			</TableCell>
			<TableCell className="hidden md:table-cell">
				${course.price || 'Free'}
			</TableCell>
			<TableCell>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button aria-haspopup="true" size="icon" variant="ghost">
							<MoreHorizontal className="h-4 w-4" />
							<span className="sr-only">Toggle menu</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuItem
							onClick={() => navigate(`/instruct/courses/${course.id}/edit`)}
						>
							<Edit className="mr-2 h-4 w-4" />
							Edit
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => navigate(`/course/${course.id}`)}>
							<Eye className="mr-2 h-4 w-4" />
							Preview
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => togglePublishStatus(course.id, course.isPublished)}
						>
							{course.isPublished ? 'Unpublish' : 'Publish'}
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={() => deleteCourse(course.id)}
							className="text-red-600"
						>
							<Trash2 className="mr-2 h-4 w-4" />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</TableCell>
		</TableRow>
	);

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
									<TabsTrigger value="published">Published</TabsTrigger>
									<TabsTrigger value="draft">Draft</TabsTrigger>
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
										onClick={() => navigate('/instruct/courses/new')}
									>
										<PlusCircle className="h-3.5 w-3.5" />
										<span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
											Create Course
										</span>
									</Button>
								</div>
							</div>
							<TabsContent value="all">
								<Card>
									<CardHeader>
										<CardTitle>My Courses</CardTitle>
										<CardDescription>
											Manage and create your courses.
										</CardDescription>
									</CardHeader>
									<CardContent>
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Course</TableHead>
													<TableHead>Status</TableHead>
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
																	Start creating courses to share your
																	knowledge.
																</p>
																<Button
																	className="mt-4"
																	onClick={() =>
																		navigate('/instruct/courses/new')
																	}
																>
																	Create Your First Course
																</Button>
															</div>
														</TableCell>
													</TableRow>
												) : (
													courses.map(renderCourseRow)
												)}
											</TableBody>
										</Table>
									</CardContent>
								</Card>
							</TabsContent>
							{/* Add TabsContent for published and draft */}
						</Tabs>
					</main>
				</div>
			</div>
		</SidebarProvider>
	);
}

export default InstructorCourses;

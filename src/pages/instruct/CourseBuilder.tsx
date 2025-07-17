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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/lib/auth';
import { db } from '@/lib/github-sdk';
import {
	ArrowLeft,
	BookOpen,
	Calendar,
	Clock,
	Edit,
	Plus,
	Save,
	Settings,
	Trash2,
	Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface Lesson {
	id?: string;
	title: string;
	description: string;
	order: number;
	duration: number;
	type: string;
	isRequired: boolean;
	releaseType: string;
	scheduledReleaseDate?: string;
	dripDays: number;
}

const CourseBuilder = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [isEditing, setIsEditing] = useState(!!id);
	const [loading, setLoading] = useState(false);
	const [course, setCourse] = useState({
		title: '',
		description: '',
		objectives: '',
		prerequisites: '',
		difficulty: 'beginner',
		duration: 1,
		price: 0,
		currency: 'USD',
		academicLevelId: '',
		subjectId: '',
		isPublished: false,
		prerequisiteCourses: [] as string[],
	});
	const [lessons, setLessons] = useState<Lesson[]>([]);
	const [academicLevels, setAcademicLevels] = useState<any[]>([]);
	const [subjects, setSubjects] = useState<any[]>([]);
	const [availableCourses, setAvailableCourses] = useState<any[]>([]);
	const { toast } = useToast();
	const user = authService.getCurrentUser();

	useEffect(() => {
		loadFormData();
		if (id) {
			loadCourse(id);
		}
	}, [id]);

	const loadFormData = async () => {
		try {
			const [levelsData, subjectsData, coursesData] = await Promise.all([
				db.get('academicLevels'),
				db.get('subjects'),
				db
					.queryBuilder('courses')
					.where((c: any) => c.creatorId !== user?.id && c.isPublished)
					.exec(),
			]);
			setAcademicLevels(levelsData);
			setSubjects(subjectsData);
			setAvailableCourses(coursesData);
		} catch (error) {
			console.error('Error loading form data:', error);
		}
	};

	const loadCourse = async (courseId: string) => {
		try {
			const [courseData, lessonsData] = await Promise.all([
				db.getItem('courses', courseId),
				db
					.queryBuilder('lessons')
					.where((lesson: any) => lesson.courseId === courseId)
					.orderBy('order', 'asc')
					.exec(),
			]);

			if (courseData) {
				setCourse({
					title: courseData.title || '',
					description: courseData.description || '',
					objectives: courseData.objectives || '',
					prerequisites: courseData.prerequisites || '',
					difficulty: courseData.difficulty || 'beginner',
					duration: courseData.duration || 1,
					price: courseData.price || 0,
					currency: courseData.currency || 'USD',
					academicLevelId: courseData.academicLevelId || '',
					subjectId: courseData.subjectId || '',
					isPublished: courseData.isPublished || false,
					prerequisiteCourses: JSON.parse(
						courseData.prerequisiteCourses || '[]'
					),
				});

				const mappedLessons: Lesson[] = lessonsData.map((lesson: any) => ({
					id: lesson.id,
					title: lesson.title || '',
					description: lesson.description || '',
					order: lesson.order || 1,
					duration: lesson.duration || 30,
					type: lesson.type || 'text',
					isRequired: lesson.isRequired !== false,
					releaseType: lesson.releaseType || 'immediate',
					scheduledReleaseDate: lesson.scheduledReleaseDate,
					dripDays: lesson.dripDays || 0,
				}));
				setLessons(mappedLessons);
			}
		} catch (error) {
			console.error('Error loading course:', error);
		}
	};

	const saveCourse = async () => {
		if (!user) return;

		try {
			setLoading(true);

			const courseData = {
				...course,
				creatorId: user.id,
				creatorType: 'instructor',
				isAiGenerated: false,
				prerequisiteCourses: JSON.stringify(course.prerequisiteCourses),
				updatedAt: new Date().toISOString(),
			};

			let savedCourse;
			if (isEditing && id) {
				savedCourse = await db.update('courses', id, courseData);
				savedCourse.id = id;
			} else {
				savedCourse = await db.insert('courses', courseData);
				setIsEditing(true);
				navigate(`/instruct/courses/${savedCourse.id}/edit`, { replace: true });
			}

			toast({
				title: 'Success',
				description: 'Course saved successfully',
			});
		} catch (error) {
			console.error('Error saving course:', error);
			toast({
				title: 'Error',
				description: 'Failed to save course',
				variant: 'destructive',
			});
		} finally {
			setLoading(false);
		}
	};

	const publishCourse = async () => {
		try {
			setLoading(true);

			if (!id) {
				await saveCourse();
				return;
			}

			await db.update('courses', id, {
				isPublished: !course.isPublished,
				updatedAt: new Date().toISOString(),
			});

			setCourse((prev) => ({ ...prev, isPublished: !prev.isPublished }));

			toast({
				title: 'Success',
				description: `Course ${
					course.isPublished ? 'unpublished' : 'published'
				} successfully`,
			});
		} catch (error) {
			console.error('Error publishing course:', error);
			toast({
				title: 'Error',
				description: 'Failed to update course status',
				variant: 'destructive',
			});
		} finally {
			setLoading(false);
		}
	};

	const createNewLesson = () => {
		if (!id) {
			toast({
				title: 'Save Course First',
				description: 'Please save your course before adding lessons',
				variant: 'destructive',
			});
			return;
		}
		navigate(`/instruct/courses/${id}/lessons/new`);
	};

	const editLesson = (lessonId: string) => {
		navigate(`/instruct/courses/${id}/lessons/${lessonId}/edit`);
	};

	const deleteLesson = async (lessonId: string) => {
		try {
			await db.delete('lessons', lessonId);
			setLessons((prev) => prev.filter((l) => l.id !== lessonId));
			toast({
				title: 'Success',
				description: 'Lesson deleted successfully',
			});
		} catch (error) {
			console.error('Error deleting lesson:', error);
			toast({
				title: 'Error',
				description: 'Failed to delete lesson',
				variant: 'destructive',
			});
		}
	};

	const togglePrerequisiteCourse = (courseId: string) => {
		setCourse((prev) => ({
			...prev,
			prerequisiteCourses: prev.prerequisiteCourses.includes(courseId)
				? prev.prerequisiteCourses.filter((id) => id !== courseId)
				: [...prev.prerequisiteCourses, courseId],
		}));
	};

	return (
		<SidebarProvider>
			<div className="flex min-h-screen w-full flex-col bg-muted/40">
				<AppSidebar />
				<div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
					<AppHeader />
					<main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
						<div className="mx-auto grid w-full flex-1 auto-rows-max gap-4">
							<div className="flex items-center gap-4">
								<Button
									variant="outline"
									size="icon"
									className="h-7 w-7"
									onClick={() => navigate('/instruct/courses')}
								>
									<ArrowLeft className="h-4 w-4" />
									<span className="sr-only">Back</span>
								</Button>
								<h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
									{isEditing ? course.title : 'New Course'}
								</h1>
								<Badge
									variant={course.isPublished ? 'default' : 'secondary'}
									className="ml-auto sm:ml-0"
								>
									{course.isPublished ? 'Published' : 'Draft'}
								</Badge>
								<div className="hidden items-center gap-2 md:ml-auto md:flex">
									<Button
										variant="outline"
										onClick={publishCourse}
										disabled={loading}
									>
										{course.isPublished ? 'Unpublish' : 'Publish'}
									</Button>
									<Button onClick={saveCourse} disabled={loading}>
										<Save className="mr-2 h-4 w-4" />
										Save
									</Button>
								</div>
							</div>
							<div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
								<div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
									<Card>
										<CardHeader>
											<CardTitle>Course Details</CardTitle>
											<CardDescription>
												Basic information about your course.
											</CardDescription>
										</CardHeader>
										<CardContent className="space-y-4">
											<div className="space-y-2">
												<Label htmlFor="title">Course Title</Label>
												<Input
													id="title"
													value={course.title}
													onChange={(e) =>
														setCourse((prev) => ({ ...prev, title: e.target.value }))
													}
													placeholder="Enter course title"
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="description">Description</Label>
												<Textarea
													id="description"
													value={course.description}
													onChange={(e) =>
														setCourse((prev) => ({
															...prev,
															description: e.target.value,
														}))
													}
													placeholder="Describe what students will learn"
													rows={4}
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="objectives">Learning Objectives</Label>
												<Textarea
													id="objectives"
													value={course.objectives}
													onChange={(e) =>
														setCourse((prev) => ({
															...prev,
															objectives: e.target.value,
														}))
													}
													placeholder="List learning objectives (one per line)"
													rows={3}
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="prerequisites">Prerequisites</Label>
												<Textarea
													id="prerequisites"
													value={course.prerequisites}
													onChange={(e) =>
														setCourse((prev) => ({
															...prev,
															prerequisites: e.target.value,
														}))
													}
													placeholder="What should students know beforehand?"
													rows={3}
												/>
											</div>
										</CardContent>
									</Card>
									<Card>
										<CardHeader>
											<CardTitle>Lessons</CardTitle>
											<CardDescription>
												Organize your course content into lessons.
											</CardDescription>
										</CardHeader>
										<CardContent>
											{lessons.length === 0 ? (
												<div className="text-center py-8">
													<BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
													<h3 className="text-lg font-semibold mb-2">
														No lessons yet
													</h3>
													<p className="text-muted-foreground mb-4">
														Start building your course by adding lessons
													</p>
													<Button onClick={createNewLesson}>
														<Plus className="mr-2 h-4 w-4" />
														Add Lesson
													</Button>
												</div>
											) : (
												<div className="space-y-4">
													{lessons.map((lesson) => (
														<Card key={lesson.id}>
															<CardContent className="p-4">
																<div className="flex items-center justify-between">
																	<div className="flex-1">
																		<h4 className="font-medium">
																			Lesson {lesson.order}: {lesson.title}
																		</h4>
																		<p className="text-sm text-muted-foreground">
																			{lesson.description}
																		</p>
																	</div>
																	<div className="flex items-center gap-2">
																		<Button
																			variant="outline"
																			size="sm"
																			onClick={() => editLesson(lesson.id!)}
																		>
																			<Edit className="h-4 w-4" />
																		</Button>
																		<Button
																			variant="ghost"
																			size="sm"
																			onClick={() => deleteLesson(lesson.id!)}
																		>
																			<Trash2 className="h-4 w-4" />
																		</Button>
																	</div>
																</div>
															</CardContent>
														</Card>
													))}
												</div>
											)}
										</CardContent>
									</Card>
								</div>
								<div className="grid auto-rows-max items-start gap-4 lg:gap-8">
									<Card>
										<CardHeader>
											<CardTitle>Settings</CardTitle>
										</CardHeader>
										<CardContent className="grid gap-6">
											<div className="grid gap-3">
												<Label htmlFor="difficulty">Difficulty Level</Label>
												<Select
													value={course.difficulty}
													onValueChange={(value) =>
														setCourse((prev) => ({ ...prev, difficulty: value }))
													}
												>
													<SelectTrigger>
														<SelectValue placeholder="Select difficulty" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="beginner">Beginner</SelectItem>
														<SelectItem value="intermediate">
															Intermediate
														</SelectItem>
														<SelectItem value="advanced">Advanced</SelectItem>
													</SelectContent>
												</Select>
											</div>
											<div className="grid gap-3">
												<Label htmlFor="academicLevel">Academic Level</Label>
												<Select
													value={course.academicLevelId}
													onValueChange={(value) =>
														setCourse((prev) => ({
															...prev,
															academicLevelId: value,
														}))
													}
												>
													<SelectTrigger>
														<SelectValue placeholder="Select level" />
													</SelectTrigger>
													<SelectContent>
														{academicLevels.map((level) => (
															<SelectItem key={level.id} value={level.id}>
																{level.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>
											<div className="grid gap-3">
												<Label htmlFor="subject">Subject</Label>
												<Select
													value={course.subjectId}
													onValueChange={(value) =>
														setCourse((prev) => ({ ...prev, subjectId: value }))
													}
												>
													<SelectTrigger>
														<SelectValue placeholder="Select subject" />
													</SelectTrigger>
													<SelectContent>
														{subjects.map((subject) => (
															<SelectItem key={subject.id} value={subject.id}>
																{subject.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>
										</CardContent>
									</Card>
									<Card>
										<CardHeader>
											<CardTitle>Pricing</CardTitle>
										</CardHeader>
										<CardContent className="grid gap-6">
											<div className="grid gap-3">
												<Label htmlFor="price">Price</Label>
												<Input
													id="price"
													type="number"
													value={course.price}
													onChange={(e) =>
														setCourse((prev) => ({
															...prev,
															price: parseFloat(e.target.value),
														}))
													}
													min="0"
													step="0.01"
												/>
											</div>
											<div className="grid gap-3">
												<Label htmlFor="currency">Currency</Label>
												<Select
													value={course.currency}
													onValueChange={(value) =>
														setCourse((prev) => ({ ...prev, currency: value }))
													}
												>
													<SelectTrigger>
														<SelectValue placeholder="Select currency" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="USD">USD</SelectItem>
														<SelectItem value="NGN">NGN</SelectItem>
														<SelectItem value="EUR">EUR</SelectItem>
														<SelectItem value="GBP">GBP</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</CardContent>
									</Card>
								</div>
							</div>
							<div className="flex items-center justify-center gap-2 md:hidden">
								<Button
									variant="outline"
									size="sm"
									onClick={publishCourse}
									disabled={loading}
								>
									{course.isPublished ? 'Unpublish' : 'Publish'}
								</Button>
								<Button size="sm" onClick={saveCourse} disabled={loading}>
									Save
								</Button>
							</div>
						</div>
					</main>
				</div>
			</div>
		</SidebarProvider>
	);
};

export default CourseBuilder;

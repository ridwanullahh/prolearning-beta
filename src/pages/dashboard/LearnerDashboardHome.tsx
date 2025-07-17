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
import { Link, useNavigate } from 'react-router-dom';
import CourseGenerationWizard from '@/components/course/CourseGenerationWizard';

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
        <>
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Courses in Progress
                        </CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.coursesInProgress}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Keep up the great work!
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Completed Lessons
                        </CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.completedLessons}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Lessons completed
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Study Hours
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.studyHours}</div>
                        <p className="text-xs text-muted-foreground">
                            Hours of focused learning
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            AI Generations Left
                        </CardTitle>
                        <Brain className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.aiGenerationsLeft}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Free monthly limit
                        </p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                <div className="space-y-6 xl:col-span-2">
                    {recentCourses.length > 0 ? (
                        <Card>
                            <CardHeader className="flex flex-row items-center">
                                <div className="grid gap-2">
                                    <CardTitle>Continue Learning</CardTitle>
                                    <CardDescription>
                                        Pick up where you left off.
                                    </CardDescription>
                                </div>
                                <Button
                                    asChild
                                    size="sm"
                                    className="ml-auto gap-1"
                                    onClick={() => navigate('/dashboard/courses')}
                                >
                                    <Link to="/dashboard/courses">
                                        View All
                                        <BookOpen className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentCourses.map((course) => (
                                        <div
                                            key={course.id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                                            onClick={() => navigate(`/my-course/${course.id}`)}
                                        >
                                            <div className="flex-1">
                                                <h3 className="font-semibold line-clamp-1">
                                                    {course.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground line-clamp-1">
                                                    {course.description}
                                                </p>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                        <Clock className="h-3 w-3" />
                                                        {course.duration}h
                                                    </div>
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                        <Star className="h-3 w-3" />
                                                        {course.rating || 'New'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium">
                                                    {Math.round(course.progress)}%
                                                </div>
                                                <div className="w-20 bg-muted rounded-full h-2 mt-1">
                                                    <div
                                                        className="bg-primary h-2 rounded-full"
                                                        style={{
                                                            width: `${course.progress}%`,
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle>Get Started</CardTitle>
                                <CardDescription>
                                    Create your first AI-powered course
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8">
                                    <Brain className="h-16 w-16 text-primary mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">
                                        No courses yet
                                    </h3>
                                    <p className="text-muted-foreground mb-4">
                                        Generate your first AI-powered course tailored to
                                        your learning needs
                                    </p>
                                    <Button
                                        onClick={() => setShowCourseGenerator(true)}
                                        disabled={stats.aiGenerationsLeft === 0}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        {stats.aiGenerationsLeft === 0
                                            ? 'No Generations Left'
                                            : 'Generate Your First Course'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            <Button
                                onClick={() => setShowCourseGenerator(true)}
                                disabled={stats.aiGenerationsLeft === 0}
                            >
                                <Brain className="mr-2 h-4 w-4" />
                                Generate New Course
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => navigate('/marketplace')}
                            >
                                Browse Marketplace
                            </Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lightbulb className="h-5 w-5 text-yellow-500" />
                                Learning Tips
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-4">
                                <li>Set a daily learning goal</li>
                                <li>Take notes while studying</li>
                                <li>Practice regularly with flashcards</li>
                                <li>Join study groups</li>
                                <li>Review previous lessons</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
	);
};

export default LearnerDashboardHome;
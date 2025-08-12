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
    ArrowRight,
    BarChart3,
    CheckCircle2,
    Star
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

const StatCard = ({ icon: Icon, title, value, change, color }) => {
    const colors = {
        green: 'from-green-500 to-emerald-500',
        emerald: 'from-emerald-500 to-green-500',
        teal: 'from-teal-500 to-emerald-500',
        yellow: 'from-yellow-500 to-amber-500',
    }
    return (
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</CardTitle>
                <div className={`p-2 rounded-full bg-gradient-to-br ${colors[color]}`}>
                    <Icon className="h-4 w-4 text-white" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{change}</p>
            </CardContent>
        </Card>
    )
}

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

			const totalStudents = new Set(enrollments.map(e => e.userId)).size;
			const revenue = enrollments.reduce(
				(acc: number, e: any) => acc + (e.amount || 0),
				0
			);
			const avgRating =
				courses.length > 0
					? courses.reduce((acc: number, c: any) => acc + (c.rating || 0), 0) /
					  courses.filter(c => c.rating > 0).length
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
    
    const chartData = [
        { name: 'Jan', revenue: 4000, students: 2400 },
        { name: 'Feb', revenue: 3000, students: 1398 },
        { name: 'Mar', revenue: 5000, students: 9800 },
        { name: 'Apr', revenue: 4780, students: 3908 },
        { name: 'May', revenue: 5890, students: 4800 },
        { name: 'Jun', revenue: 6390, students: 3800 },
        { name: 'Jul', revenue: 7490, students: 4300 },
    ];

	if (loading) {
        return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-4"
              />
              <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Loading Instructor Dashboard...</p>
            </div>
          </div>
        );
    }

	return (
		<div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Instructor Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Welcome back, {user?.name?.split(' ')[0] || 'Instructor'}. Here's what's happening.
                    </p>
                </div>
                <Button onClick={() => navigate('/instruct/courses/new')} className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 py-3">
                    <Plus className="h-4 w-4 mr-2"/>
                    Create New Course
                </Button>
            </motion.div>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={BookOpen} title="Total Courses" value={stats.totalCourses} change="+2 this month" color="green" />
                <StatCard icon={Users} title="Total Students" value={stats.totalStudents} change="+150 this month" color="blue" />
                <StatCard icon={DollarSign} title="Total Revenue" value={`$${stats.revenue.toFixed(2)}`} change="+12% this month" color="purple" />
                <StatCard icon={Star} title="Avg. Rating" value={stats.avgRating || 'N/A'} change="Across all courses" color="yellow" />
			</div>
			
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 shadow-lg border-0 rounded-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-green-500"/>Revenue & Student Analytics</CardTitle>
                        <CardDescription>Overview of your monthly performance.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.1)" />
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--background))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '0.75rem'
                                    }}
                                />
                                <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#10B981" fill="url(#colorRevenue)" />
                                <Area yAxisId="right" type="monotone" dataKey="students" stroke="#3B82F6" fill="url(#colorStudents)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="shadow-lg border-0 rounded-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-green-500"/>Quick Actions</CardTitle>
                        <CardDescription>Jump right back in.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button variant="outline" className="w-full justify-start gap-2 rounded-lg" onClick={() => navigate('/instruct/courses')}>
                            <BookOpen className="h-4 w-4"/> View All Courses
                        </Button>
                        <Button variant="outline" className="w-full justify-start gap-2 rounded-lg" onClick={() => navigate('/instruct/students')}>
                            <Users className="h-4 w-4"/> Manage Students
                        </Button>
                        <Button variant="outline" className="w-full justify-start gap-2 rounded-lg" onClick={() => navigate('/instruct/analytics')}>
                            <BarChart3 className="h-4 w-4"/> View Analytics
                        </Button>
                        <Button variant="outline" className="w-full justify-start gap-2 rounded-lg" onClick={() => navigate('/profile-settings')}>
                            <Edit className="h-4 w-4"/> Edit Profile
                        </Button>
                    </CardContent>
                </Card>
            </div>

			<Card className="shadow-lg border-0 rounded-2xl">
                <CardHeader>
                    <CardTitle>Recent Courses</CardTitle>
                    <CardDescription>Your most recently updated courses.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Course</TableHead>
                                <TableHead className="hidden md:table-cell">Status</TableHead>
                                <TableHead className="hidden md:table-cell">Students</TableHead>
                                <TableHead className="hidden md:table-cell">Rating</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentCourses.map((course) => (
                                <TableRow key={course.id}>
                                    <TableCell>
                                        <div className="font-medium text-gray-900 dark:text-white">{course.title}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{course.category || "No Category"}</div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <Badge variant={course.isPublished ? 'default' : 'secondary'} className={course.isPublished ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" : ""}>
                                            {course.isPublished ? 'Published' : 'Draft'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">{course.enrollmentCount}</TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 text-yellow-400"/>
                                            {course.rating || 'N/A'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button size="sm" variant="outline" onClick={() => navigate(`/course/${course.id}`)}><Eye className="h-4 w-4" /></Button>
                                            <Button size="sm" onClick={() => navigate(`/instruct/courses/${course.id}/edit`)}><Edit className="h-4 w-4" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
		</div>
	);
};


export default InstructorDashboardHome;
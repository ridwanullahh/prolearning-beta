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
    Star,
    Grid,
    List,
    Search
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';

const InstructorCourses = () => {
	const [courses, setCourses] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
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
			
            const coursesWithEnrollments = await Promise.all(coursesData.map(async (course) => {
                const enrollments = await db.queryBuilder('enrollments').where((e: any) => e.courseId === course.id).exec();
                return { ...course, enrollmentCount: enrollments.length };
            }));

			setCourses(coursesWithEnrollments);
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
    
    const filteredCourses = useMemo(() => {
        return courses
            .filter(course => {
                if (filter === 'all') return true;
                if (filter === 'published') return course.isPublished;
                if (filter === 'draft') return !course.isPublished;
                return true;
            })
            .filter(course => 
                course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
    }, [courses, filter, searchQuery]);

	const containerVariants = {
        hidden: { opacity: 1 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
        },
    };

	return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-3xl p-8 text-white">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                    <div>
                        <p className="text-green-100 text-lg mb-4">An overview of all your creative work</p>
                        <div className="flex items-center gap-6 text-green-100">
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                <span>{courses.length} Courses</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                <span>{courses.reduce((acc, course) => acc + (course.enrollmentCount || 0), 0)} Students</span>
                            </div>
                        </div>
                    </div>
                    <Button
                        onClick={() => navigate('/instruct/courses/new')}
                        className="bg-white text-green-600 hover:bg-green-50 font-semibold px-6 py-3 rounded-2xl shadow-lg"
                    >
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Create New Course
                    </Button>
                </motion.div>
            </div>

            {/* Search and Filter Section */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="w-full md:w-auto flex-grow">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by title or description..."
                                    className="pl-10 w-full border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-xl"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Tabs value={filter} onValueChange={setFilter}>
                                <TabsList className="bg-green-50">
                                    <TabsTrigger value="all" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">All</TabsTrigger>
                                    <TabsTrigger value="published" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Published</TabsTrigger>
                                    <TabsTrigger value="draft" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Draft</TabsTrigger>
                                </TabsList>
                            </Tabs>
                            <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('grid')} className="bg-green-600 hover:bg-green-700"><Grid/></Button>
                            <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('list')} className="bg-green-600 hover:bg-green-700"><List/></Button>
                        </div>
                    </div>
                
                    {loading ? (
                        <div className="text-center py-20">Loading courses...</div>
                    ) : filteredCourses.length === 0 ? (
                        <div className="text-center py-20">
                            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-medium">No courses found</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Try adjusting your search or filters.
                            </p>
                        </div>
                    ) : (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className={`mt-6 ${
                                viewMode === 'grid' 
                                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6' 
                                : 'space-y-4'
                            }`}
                        >
                            {filteredCourses.map(course => (
                                <motion.div variants={itemVariants} key={course.id}>
                                    {viewMode === 'grid' ? (
                                        <CourseCard 
                                            course={course}
                                            onDelete={deleteCourse}
                                            onTogglePublish={togglePublishStatus}
                                            onNavigate={navigate}
                                        />
                                    ) : (
                                        <CourseListItem
                                            course={course}
                                            onDelete={deleteCourse}
                                            onTogglePublish={togglePublishStatus}
                                            onNavigate={navigate}
                                        />
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </CardContent>
            </Card>
		</div>
	);
}

const CourseCard = ({ course, onDelete, onTogglePublish, onNavigate }) => (
    <Card className="h-full flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <CardHeader className="p-0">
            <div className="aspect-video relative overflow-hidden rounded-t-lg">
                <img src={course.thumbnailUrl || `https://source.unsplash.com/random/400x225?course,${course.id}`} alt={course.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"/>
                <div className="absolute top-3 right-3">
                    <Badge variant={course.isPublished ? 'default' : 'secondary'} className={course.isPublished ? "bg-green-100 text-green-800" : ""}>{course.isPublished ? 'Published' : 'Draft'}</Badge>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-4 flex flex-col flex-grow">
            <h3 className="font-bold text-lg line-clamp-2">{course.title}</h3>
            <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                <div className="flex items-center gap-1"><Users className="h-4 w-4" /> {course.enrollmentCount}</div>
                <div className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-400" /> {course.rating || 'N/A'}</div>
                <div className="font-semibold">${course.price || 'Free'}</div>
            </div>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-3 flex-grow">{course.description}</p>
        </CardContent>
        <div className="p-4 pt-0 flex items-center justify-end gap-2">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onNavigate(`/instruct/courses/${course.id}/edit`)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate(`/course/${course.id}`)}><Eye className="mr-2 h-4 w-4" />Preview</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onTogglePublish(course.id, course.isPublished)}>
                        {course.isPublished ? 'Unpublish' : 'Publish'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onDelete(course.id)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" onClick={() => onNavigate(`/instruct/courses/${course.id}/edit`)}>Manage</Button>
        </div>
    </Card>
)

const CourseListItem = ({ course, onDelete, onTogglePublish, onNavigate } : any) => (
    <Card className="transition-all duration-300 hover:shadow-lg">
        <div className="flex items-center p-4">
            <img src={course.thumbnailUrl || `https://source.unsplash.com/random/100x100?course,${course.id}`} alt={course.title} className="w-20 h-20 object-cover rounded-lg mr-4"/>
            <div className="flex-grow grid grid-cols-5 gap-4 items-center">
                <div className="col-span-2">
                    <h3 className="font-bold">{course.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                </div>
                <div>
                    <Badge variant={course.isPublished ? 'default' : 'secondary'} className={course.isPublished ? "bg-green-100 text-green-800" : ""}>{course.isPublished ? 'Published' : 'Draft'}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1"><Users className="h-4 w-4" /> {course.enrollmentCount}</div>
                    <div className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-400" /> {course.rating || 'N/A'}</div>
                </div>
                <div className="flex justify-end items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onNavigate(`/instruct/courses/${course.id}/edit`)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onNavigate(`/course/${course.id}`)}><Eye className="mr-2 h-4 w-4" />Preview</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onTogglePublish(course.id, course.isPublished)}>
                                {course.isPublished ? 'Unpublish' : 'Publish'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onDelete(course.id)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button size="sm" onClick={() => onNavigate(`/instruct/courses/${course.id}/edit`)}>Manage</Button>
                </div>
            </div>
        </div>
    </Card>
);

export default InstructorCourses;

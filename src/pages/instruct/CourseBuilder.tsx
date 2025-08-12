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
import { forumService } from '@/lib/forum-service';
import ModuleManager from '@/components/course/ModuleManager';
import {
	ArrowLeft,
	BookOpen,
	Plus,
	Save,
	Settings,
	Trash2,
    Info,
    LayoutGrid,
    FileText,
    DollarSign,
    CheckCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface Lesson {
	id?: string;
	title: string;
	description: string;
	order: number;
}

const CourseBuilder = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [isEditing, setIsEditing] = useState(!!id);
	const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
	const [course, setCourse] = useState({
		title: '',
		description: '',
		objectives: '',
		prerequisites: '',
		difficulty: 'beginner',
		price: 0,
		academicLevelId: '',
		subjectId: '',
		level: '',
		grade: '',
		isPublished: false,
	});
	const [lessons, setLessons] = useState<Lesson[]>([]);
	const [academicLevels, setAcademicLevels] = useState<any[]>([]);
	const [subjects, setSubjects] = useState<any[]>([]);
	const [instructorMaxLevel, setInstructorMaxLevel] = useState(0);
	const { toast } = useToast();
	const user = authService.getCurrentUser();

	useEffect(() => {
		loadFormData();
		if (id) {
			loadCourse(id);
		}
	}, [id]);

	const loadFormData = async () => {
		if (!user) return;
		try {
			const [levelsData, subjectsData, instructorQualsData] = await Promise.all([
				db.get('academicLevels'),
				db.get('subjects'),
				db.queryBuilder('instructorQualifications').where((q: any) => q.instructorId === user.id && q.status === 'approved').exec(),
			]);
			
			const allQualifications = await db.get('qualifications');
			const maxLevel = instructorQualsData.reduce((max: number, iq: any) => {
				const qual = allQualifications.find((q: any) => q.id === iq.qualificationId);
				return qual ? Math.max(max, qual.level) : max;
			}, 0);

			setInstructorMaxLevel(maxLevel);
			setAcademicLevels(levelsData.filter((l: any) => l.order <= maxLevel));
			setSubjects(subjectsData);
		} catch (error) {
			console.error('Error loading form data:', error);
		}
	};

	const loadCourse = async (courseId: string) => {
		try {
			const [courseData, lessonsData] = await Promise.all([
				db.getItem('courses', courseId),
				db.queryBuilder('lessons').where((lesson: any) => lesson.courseId === courseId).orderBy('order', 'asc').exec(),
			]);

			if (courseData) {
				setCourse(courseData);
				setLessons(lessonsData);
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
				instructorId: user.id,
				updatedAt: new Date().toISOString()
			};

			let courseId = id;
			if (isEditing && id) {
				await db.update('courses', id, courseData);
			} else {
				const newCourse = await db.insert('courses', courseData);
				courseId = newCourse.id;
				setIsEditing(true);
                navigate(`/instruct/courses/${newCourse.id}/edit`, { replace: true });

				// Create forum hierarchy for new instructor-led course
				try {
					await forumService.createCourseForumHierarchy(courseId);
				} catch (forumError) {
					console.error('Error creating forum hierarchy:', forumError);
					// Don't fail course creation if forum creation fails
				}
			}

			toast({ title: 'Success', description: 'Course saved successfully' });
		} catch (error) {
			console.error('Error saving course:', error);
			toast({ title: 'Error', description: 'Failed to save course', variant: 'destructive' });
		} finally {
			setLoading(false);
		}
	};

    const handleNextStep = () => setStep(s => Math.min(s + 1, 4));
    const handlePrevStep = () => setStep(s => Math.max(s - 1, 1));

    const steps = [
        { id: 1, name: 'Course Info', icon: Info },
        { id: 2, name: 'Curriculum', icon: LayoutGrid },
        { id: 3, name: 'Details', icon: FileText },
        { id: 4, name: 'Pricing & Publish', icon: DollarSign },
    ];

	return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate('/instruct/courses')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{isEditing ? `Edit: ${course.title}` : 'Create New Course'}</h1>
                    <p className="text-muted-foreground">Follow the steps to build your course.</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <Button variant="outline" onClick={saveCourse} disabled={loading}>
                        <Save className="mr-2 h-4 w-4" /> Save Draft
                    </Button>
                    <Button onClick={saveCourse} disabled={loading}>
                        <CheckCircle className="mr-2 h-4 w-4" /> Publish Course
                    </Button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                <nav className="lg:w-64">
                    <ol className="space-y-4">
                        {steps.map((s) => (
                            <li key={s.id}>
                                <div
                                    onClick={() => setStep(s.id)}
                                    className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${step === s.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                                >
                                    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 ${step === s.id ? 'border-primary-foreground' : 'border-primary'}`}>
                                        <s.icon className={`h-5 w-5 ${step === s.id ? '' : 'text-primary'}`} />
                                    </div>
                                    <p className="font-medium">{s.name}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </nav>

                <div className="flex-1">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {step === 1 && <CourseInfoStep course={course} setCourse={setCourse} />}
                            {step === 2 && <CurriculumStep courseId={id} lessons={lessons} setLessons={setLessons} />}
                            {step === 3 && <DetailsStep course={course} setCourse={setCourse} academicLevels={academicLevels} subjects={subjects} />}
                            {step === 4 && <PricingStep course={course} setCourse={setCourse} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
  </div>
 );
};

const CourseInfoStep = ({ course, setCourse }: { course: any, setCourse: any }) => (
    <Card>
        <CardHeader>
            <CardTitle>Course Information</CardTitle>
            <CardDescription>Start with the basics. What is your course about?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input id="title" value={course.title} onChange={(e) => setCourse((p: any) => ({ ...p, title: e.target.value }))} placeholder="e.g., Introduction to Web Development" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Course Description</Label>
                <Textarea id="description" value={course.description} onChange={(e) => setCourse((p: any) => ({ ...p, description: e.target.value }))} placeholder="A brief summary of your course." rows={5}/>
            </div>
             <div className="space-y-2">
                <Label htmlFor="objectives">Learning Objectives</Label>
                <Textarea id="objectives" value={course.objectives} onChange={(e) => setCourse((p: any) => ({ ...p, objectives: e.target.value }))} placeholder="List what students will be able to do after completing the course (one per line)." rows={5}/>
            </div>
        </CardContent>
    </Card>
);

const CurriculumStep = ({ courseId, lessons, setLessons }: { courseId: any, lessons: any, setLessons: any }) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    
    const handleAddLesson = () => {
        if (!courseId) {
            toast({ title: "Save Course First", description: "Please save the course details before adding lessons.", variant: "destructive" });
            return;
        }
        navigate(`/instruct/courses/${courseId}/lessons/new`);
    };

    const handleEditLesson = (lessonId: any) => {
        navigate(`/instruct/courses/${courseId}/lessons/${lessonId}/edit`);
    };

    const handleDeleteLesson = async (lessonId: any) => {
        if (!confirm("Are you sure you want to delete this lesson?")) return;
        try {
            await db.delete('lessons', lessonId);
            setLessons((prev: any[]) => prev.filter(l => l.id !== lessonId));
            toast({ title: "Success", description: "Lesson deleted." });
        } catch (e) {
            toast({ title: "Error", description: "Could not delete lesson.", variant: "destructive" });
        }
    };

    const handleModuleSelect = (moduleId: string) => {
        navigate(`/instruct/courses/${courseId}/modules/${moduleId}/lessons/new`);
    };

    const handleLessonSelect = (lessonId: string) => {
        navigate(`/instruct/courses/${courseId}/lessons/${lessonId}/edit`);
    };

    if (!courseId) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Course Curriculum</CardTitle>
                    <CardDescription>Structure your course with modules and lessons.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                        <p>Please save the course details first to start building your curriculum.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <ModuleManager
                courseId={courseId}
                onModuleSelect={handleModuleSelect}
                onLessonSelect={handleLessonSelect}
            />

            {/* Legacy lesson support - will be migrated to modules */}
            {lessons.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Legacy Lessons</CardTitle>
                        <CardDescription>These lessons need to be organized into modules.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {lessons.map((lesson: any, index: number) => (
                                <div key={lesson.id || index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <div className="flex items-center gap-3">
                                        <BookOpen className="h-5 w-5 text-yellow-600"/>
                                        <div>
                                            <p className="font-semibold">Lesson {index + 1}: {lesson.title}</p>
                                            <p className="text-sm text-muted-foreground">{lesson.description}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleLessonSelect(lesson.id)}
                                    >
                                        <Settings className="h-4 w-4"/>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

const DetailsStep = ({ course, setCourse, academicLevels, subjects }: { course: any, setCourse: any, academicLevels: any[], subjects: any[] }) => (
    <Card>
        <CardHeader>
            <CardTitle>Additional Details</CardTitle>
            <CardDescription>Provide more context for your students.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
        	<div className="space-y-2">
        		<Label>Difficulty</Label>
        		<Select value={course.difficulty} onValueChange={(v) => setCourse((p: any) => ({...p, difficulty: v}))}>
        			<SelectTrigger><SelectValue/></SelectTrigger>
        			<SelectContent>
        				<SelectItem value="beginner">Beginner</SelectItem>
        				<SelectItem value="intermediate">Intermediate</SelectItem>
        				<SelectItem value="advanced">Advanced</SelectItem>
        			</SelectContent>
        		</Select>
        	</div>
        	<div className="space-y-2">
        		<Label>Academic Level</Label>
        		<Select value={course.academicLevelId} onValueChange={(v) => setCourse((p: any) => ({...p, academicLevelId: v, grade: ''}))}>
        			<SelectTrigger><SelectValue/></SelectTrigger>
        			<SelectContent>
        				{academicLevels.map(level => <SelectItem key={level.id} value={level.id}>{level.name}</SelectItem>)}
        			</SelectContent>
        		</Select>
        	</div>
        	<div className="space-y-2">
        		<Label>Grade</Label>
        		<Select value={course.grade} onValueChange={(v) => setCourse((p: any) => ({...p, grade: v}))}>
        			<SelectTrigger><SelectValue/></SelectTrigger>
        			<SelectContent>
        				{getGradesForLevel(course.academicLevelId, academicLevels).map(grade => <SelectItem key={grade} value={grade}>{grade}</SelectItem>)}
        			</SelectContent>
        		</Select>
        	</div>
        	<div className="space-y-2">
        		<Label>Subject</Label>
        		<Select value={course.subjectId} onValueChange={(v) => setCourse((p: any) => ({...p, subjectId: v}))}>
        			<SelectTrigger><SelectValue/></SelectTrigger>
        			<SelectContent>
        				{subjects.map(subject => <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>)}
        			</SelectContent>
        		</Select>
        	</div>
        	<div className="space-y-2">
        		<Label htmlFor="prerequisites">Prerequisites</Label>
        		<Textarea id="prerequisites" value={course.prerequisites} onChange={(e) => setCourse((p: any) => ({...p, prerequisites: e.target.value}))} placeholder="List any required skills or courses." rows={4}/>
        	</div>
        </CardContent>
       </Card>
      );
      
      const getGradesForLevel = (levelId: string, levels: any[]) => {
        const level = levels.find(l => l.id === levelId);
        if (!level) return [];
      
        switch (level.name) {
          case 'Elementary School':
            return ['Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'];
          case 'Middle School':
            return ['Grade 6', 'Grade 7', 'Grade 8'];
          case 'High School':
            return ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
          case 'University':
            return ['100 Level', '200 Level', '300 Level', '400 Level', '500 Level'];
          case 'Graduate':
            return ['Masters', 'PhD'];
          default:
            return [];
        }
      };

const PricingStep = ({ course, setCourse }: { course: any, setCourse: any }) => (
    <Card>
        <CardHeader>
            <CardTitle>Pricing and Publishing</CardTitle>
            <CardDescription>Set a price for your course and make it available to students.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="price">Price (USD)</Label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                    <Input id="price" type="number" value={course.price} onChange={(e) => setCourse((p: any) => ({...p, price: parseFloat(e.target.value) || 0}))} className="pl-10" placeholder="0.00"/>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <input type="checkbox" id="isPublished" checked={course.isPublished} onChange={(e) => setCourse((p: any) => ({...p, isPublished: e.target.checked}))} className="h-4 w-4"/>
                <Label htmlFor="isPublished" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Publish this course
                </Label>
            </div>
            <p className="text-sm text-muted-foreground">Once published, students will be able to enroll in your course.</p>
        </CardContent>
    </Card>
);

export default CourseBuilder;

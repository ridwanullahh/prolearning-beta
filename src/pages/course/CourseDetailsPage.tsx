import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Star,
  Users,
  Clock,
  BookOpen,
  Award,
  Play,
  ShoppingCart,
  Heart,
  ArrowLeft,
  CheckCircle,
  Globe,
  Download,
  MessageSquare,
  Trophy,
  Smartphone,
  Share2,
} from 'lucide-react';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useCart, CartItem } from '@/components/cart/Cart';
import { motion } from 'framer-motion';
import { Course } from '@/lib/types';

const CourseDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem } = useCart();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [instructor, setInstructor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (id) {
      loadCourseData(id);
    }
  }, [id, user]);

  const loadCourseData = async (courseId: string) => {
    try {
      setLoading(true);
      const courseData = await db.getItem('courses', courseId);
      if (!courseData) {
        toast({ title: 'Error', description: 'Course not found', variant: 'destructive' });
        navigate('/marketplace');
        return;
      }

      const [lessonsData, instructorData, enrollmentData] = await Promise.all([
        db.queryBuilder('lessons').where((l: any) => l.courseId === courseId).orderBy('order', 'asc').exec(),
        db.getItem('users', courseData.creatorId),
        user ? db.queryBuilder('enrollments').where((e: any) => e.userId === user.id && e.courseId === courseId).exec() : Promise.resolve([])
      ]);

      setCourse(courseData);
      setLessons(lessonsData || []);
      setInstructor(instructorData);
      setIsEnrolled(enrollmentData.length > 0);

    } catch (error) {
      console.error('Error loading course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollAction = () => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    if (isEnrolled) {
        navigate(`/my-course/${id}`);
        return;
    }
    if (course.price === 0) {
      // Handle free enrollment
    } else {
        const item: Omit<CartItem, 'quantity'> = {
            courseId: course.id,
            name: course.title,
            price: course.price,
        };
      addItem(item);
      navigate('/checkout');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!course) return <div>Course not found</div>;

  return (
    <div className="bg-gray-50 dark:bg-gray-950">
      {/* Header and Hero */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.2}}>
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 hover:bg-white/10"><ArrowLeft className="mr-2 h-4 w-4"/> Back</Button>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{course.title}</h1>
                <p className="mt-4 text-xl text-green-100 max-w-3xl">{course.description}</p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1"><Star className="h-5 w-5 text-yellow-300"/><span>{course.rating || 'N/A'}</span><span className="text-sm text-green-200">({course.reviewCount || 0} reviews)</span></div>
                    <div className="flex items-center gap-1"><Users className="h-5 w-5 text-green-200"/><span>{course.enrollmentCount || 0} students</span></div>
                </div>
                {instructor && <p className="mt-4 text-sm">Created by <span className="font-semibold">{instructor.name}</span></p>}
            </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-12">
            <WhatYouWillLearn objectives={course.objectives} />
            <CourseContent lessons={lessons} />
            <AboutInstructor instructor={instructor} />
          </div>

          {/* Right Column (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
                <CoursePurchaseCard course={course} isEnrolled={isEnrolled} onEnroll={handleEnrollAction} onAddToCart={() => addItem({courseId: course.id, name: course.title, price: course.price})} />
                <CourseIncludesCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const WhatYouWillLearn: React.FC<{ objectives: string }> = ({ objectives }) => (
    <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.4}}>
        <Card>
            <CardHeader><CardTitle className="text-2xl">What You'll Learn</CardTitle></CardHeader>
            <CardContent>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {objectives?.split('\n').filter(Boolean).map((obj: string, i: number) => (
                        <li key={i} className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0"/>
                            <span>{obj}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    </motion.div>
);

const CourseContent: React.FC<{ lessons: any[] }> = ({ lessons }) => (
    <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.6}}>
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Course Content</CardTitle>
                <CardDescription>{lessons.length} lessons</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {lessons.map((lesson, i) => (
                        <div key={lesson.id} className="p-4 border rounded-lg flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Play className="h-5 w-5 text-gray-400"/>
                                <span className="font-medium">{i+1}. {lesson.title}</span>
                            </div>
                            <span className="text-sm text-gray-500">{lesson.duration || 10} min</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    </motion.div>
);

const AboutInstructor: React.FC<{ instructor: any }> = ({ instructor }) => {
    if (!instructor) return null;
    return (
        <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.8}}>
            <Card>
                <CardHeader><CardTitle className="text-2xl">About the Instructor</CardTitle></CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <img src={instructor.avatar || `https://avatar.vercel.sh/${instructor.id}.png`} alt={instructor.name} className="w-24 h-24 rounded-full"/>
                        <div>
                            <h3 className="text-xl font-bold">{instructor.name}</h3>
                            <p className="text-green-600">{instructor.title || 'Expert Educator'}</p>
                        </div>
                    </div>
                    <p className="mt-4 text-gray-600">{instructor.bio || 'An expert in the field with years of experience.'}</p>
                </CardContent>
            </Card>
        </motion.div>
    );
};

const CoursePurchaseCard: React.FC<{ course: Course, isEnrolled: boolean, onEnroll: () => void, onAddToCart: () => void }> = ({ course, isEnrolled, onEnroll, onAddToCart }) => (
    <Card className="shadow-xl">
        <CardContent className="p-6">
            <img src={course.thumbnailUrl || `https://source.unsplash.com/random/400x225?education,${course.id}`} alt={course.title} className="w-full rounded-lg mb-4"/>
            <div className="text-center mb-4">
                <h2 className="text-4xl font-bold">{course.price === 0 ? 'Free' : `$${course.price}`}</h2>
            </div>
            <Button onClick={onEnroll} size="lg" className="w-full mb-2">{isEnrolled ? "Go to Course" : "Enroll Now"}</Button>
            {!isEnrolled && course.price > 0 && <Button onClick={onAddToCart} variant="outline" size="lg" className="w-full"><ShoppingCart className="mr-2 h-4 w-4"/>Add to Cart</Button>}
            <div className="flex justify-center gap-4 mt-4">
                <Button variant="ghost" size="sm"><Heart className="mr-2 h-4 w-4"/>Wishlist</Button>
                <Button variant="ghost" size="sm"><Share2 className="mr-2 h-4 w-4"/>Share</Button>
            </div>
        </CardContent>
    </Card>
);

const CourseIncludesCard: React.FC = () => (
    <Card>
        <CardHeader><CardTitle>This course includes:</CardTitle></CardHeader>
        <CardContent className="space-y-3">
            <div className="flex items-center gap-3"><Clock className="h-5 w-5 text-gray-500" /><span>On-demand video</span></div>
            <div className="flex items-center gap-3"><Download className="h-5 w-5 text-gray-500" /><span>Downloadable resources</span></div>
            <div className="flex items-center gap-3"><Smartphone className="h-5 w-5 text-gray-500" /><span>Access on mobile and TV</span></div>
            <div className="flex items-center gap-3"><Globe className="h-5 w-5 text-gray-500" /><span>Lifetime access</span></div>
            <div className="flex items-center gap-3"><Trophy className="h-5 w-5 text-gray-500" /><span>Certificate of completion</span></div>
        </CardContent>
    </Card>
)

export default CourseDetailsPage;
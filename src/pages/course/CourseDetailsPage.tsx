import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, Users, Clock, BookOpen, Award, Play, ShoppingCart, Heart } from 'lucide-react';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const CourseDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [instructor, setInstructor] = useState<any>(null);
  const [subject, setSubject] = useState<any>(null);
  const [academicLevel, setAcademicLevel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (id) {
      loadCourseData(id);
    }
  }, [id]);

  const loadCourseData = async (courseId: string) => {
    try {
      setLoading(true);
      const [courseData, lessonsData, reviewsData] = await Promise.all([
        db.getItem('courses', courseId),
        db.queryBuilder('lessons')
          .where((lesson: any) => lesson.courseId === courseId)
          .orderBy('order', 'asc')
          .exec(),
        db.queryBuilder('reviews')
          .where((review: any) => review.courseId === courseId)
          .orderBy('createdAt', 'desc')
          .exec()
      ]);

      if (!courseData) {
        toast({
          title: 'Error',
          description: 'Course not found',
          variant: 'destructive'
        });
        navigate('/marketplace');
        return;
      }

      setCourse(courseData);
      setLessons(lessonsData || []);

      // Load related data
      const [instructorData, subjectData, academicLevelData] = await Promise.all([
        db.getItem('users', courseData.creatorId),
        db.getItem('subjects', courseData.subjectId),
        db.getItem('academicLevels', courseData.academicLevelId)
      ]);

      setInstructor(instructorData);
      setSubject(subjectData);
      setAcademicLevel(academicLevelData);

      // Check if user is enrolled
      if (user) {
        const enrollment = await db.queryBuilder('enrollments')
          .where((e: any) => e.userId === user.id && e.courseId === courseId)
          .exec();
        setIsEnrolled(enrollment.length > 0);
      }

    } catch (error) {
      console.error('Error loading course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/auth/login');
      return;
    }

    if (!course) return;

    try {
      setEnrolling(true);

      // Check if it's a free course or paid
      if (course.price === 0) {
        // Free enrollment
        await db.insert('enrollments', {
          userId: user.id,
          courseId: course.id,
          enrolledAt: new Date().toISOString(),
          status: 'active',
          paymentStatus: 'free'
        });

        // Update course enrollment count
        await db.update('courses', course.id, {
          enrollmentCount: (course.enrollmentCount || 0) + 1
        });

        setIsEnrolled(true);
        toast({
          title: 'Success',
          description: 'Successfully enrolled in the course!',
        });

        // Navigate to course viewer
        navigate(`/my-course/${course.id}`);
      } else {
        // Paid course - redirect to checkout
        await addToCart();
        navigate('/checkout');
      }
    } catch (error) {
      console.error('Error enrolling:', error);
      toast({
        title: 'Error',
        description: 'Failed to enroll in course',
        variant: 'destructive'
      });
    } finally {
      setEnrolling(false);
    }
  };

  const addToCart = async () => {
    if (!user || !course) return;

    try {
      setAddingToCart(true);

      // Get or create user's cart
      let cart = await db.queryBuilder('carts')
        .where((c: any) => c.userId === user.id)
        .exec();

      let cartItems = [];
      if (cart.length > 0) {
        cartItems = JSON.parse(cart[0].items || '[]');
      }

      // Check if course is already in cart
      const existingItem = cartItems.find((item: any) => item.courseId === course.id);
      if (existingItem) {
        toast({
          title: 'Info',
          description: 'Course is already in your cart',
        });
        return;
      }

      // Add course to cart
      const newItem = {
        courseId: course.id,
        title: course.title,
        price: course.price,
        currency: course.currency,
        thumbnailUrl: course.thumbnailUrl
      };
      cartItems.push(newItem);

      const totalAmount = cartItems.reduce((sum: number, item: any) => sum + (item.price || 0), 0);

      if (cart.length > 0) {
        await db.update('carts', cart[0].id, {
          items: JSON.stringify(cartItems),
          totalAmount,
          updatedAt: new Date().toISOString()
        });
      } else {
        await db.insert('carts', {
          userId: user.id,
          items: JSON.stringify(cartItems),
          totalAmount,
          currency: course.currency
        });
      }

      toast({
        title: 'Success',
        description: 'Course added to cart!',
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to add course to cart',
        variant: 'destructive'
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const formatPrice = (price: number, currency: string = 'USD') => {
    if (price === 0) return 'Free';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h2>
          <Button onClick={() => navigate('/marketplace')}>
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="aspect-video bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg mb-6 flex items-center justify-center">
              {course.thumbnailUrl ? (
                <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <Play className="h-16 w-16 text-white" />
              )}
            </div>

            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {course.title}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                {course.description}
              </p>
              
              <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span>{course.rating || 0} ({course.reviewCount || 0} reviews)</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{course.enrollmentCount || 0} students</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{course.duration} hours</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" />
                  <span>{lessons.length} lessons</span>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <Badge variant="secondary">{course.difficulty}</Badge>
                {subject && <Badge variant="outline">{subject.name}</Badge>}
                {academicLevel && <Badge variant="outline">{academicLevel.name}</Badge>}
                {course.isAiGenerated && <Badge className="bg-purple-100 text-purple-800">AI Generated</Badge>}
              </div>
            </div>

            {course.objectives && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>What you'll learn</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {course.objectives.split('\n').filter(Boolean).map((objective: string, index: number) => (
                      <div key={index} className="flex items-center">
                        <Award className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-sm">{objective.trim()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
                <CardDescription>{lessons.length} lessons • {course.duration} hours total</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lessons.map((lesson, index) => (
                    <div key={lesson.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Play className="h-4 w-4 text-gray-400 mr-3" />
                          <div>
                            <h4 className="font-medium">Lesson {lesson.order}: {lesson.title}</h4>
                            <p className="text-sm text-gray-600">{lesson.description}</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{lesson.duration} min</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {instructor && (
              <Card>
                <CardHeader>
                  <CardTitle>About the Instructor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                      {instructor.avatar ? (
                        <img src={instructor.avatar} alt={instructor.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-white font-bold text-lg">
                          {instructor.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{instructor.name}</h3>
                      <p className="text-gray-600 mb-2">{instructor.role === 'instructor' ? 'Course Instructor' : 'Expert Educator'}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>⭐ {instructor.rating || 4.9} instructor rating</span>
                        <span>👥 {instructor.studentsCount || 0} students</span>
                        <span>📚 {instructor.coursesCount || 0} courses</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {formatPrice(course.price || 0, course.currency)}
                  </div>
                  {course.price > 0 && (
                    <div className="text-sm text-gray-500">One-time purchase</div>
                  )}
                </div>

                {isEnrolled ? (
                  <Button 
                    className="w-full mb-4" 
                    size="lg"
                    onClick={() => navigate(`/my-course/${course.id}`)}
                  >
                    Continue Learning
                  </Button>
                ) : (
                  <>
                    <Button 
                      className="w-full mb-4" 
                      size="lg"
                      onClick={handleEnroll}
                      disabled={enrolling}
                    >
                      {enrolling ? 'Enrolling...' : (course.price === 0 ? 'Enroll Free' : 'Enroll Now')}
                    </Button>
                    
                    {course.price > 0 && (
                      <Button 
                        variant="outline" 
                        className="w-full mb-6"
                        onClick={addToCart}
                        disabled={addingToCart}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {addingToCart ? 'Adding...' : 'Add to Cart'}
                      </Button>
                    )}
                  </>
                )}

                <Separator className="mb-6" />

                <div className="space-y-4">
                  <h3 className="font-semibold">This course includes:</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-green-500 mr-2" />
                      <span>{course.duration} hours of content</span>
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 text-green-500 mr-2" />
                      <span>{lessons.length} lessons</span>
                    </div>
                    {course.certificateEnabled && (
                      <div className="flex items-center">
                        <Award className="h-4 w-4 text-green-500 mr-2" />
                        <span>Certificate of completion</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Award className="h-4 w-4 text-green-500 mr-2" />
                      <span>Lifetime access</span>
                    </div>
                    <div className="flex items-center">
                      <Award className="h-4 w-4 text-green-500 mr-2" />
                      <span>Mobile and desktop access</span>
                    </div>
                    {course.forumEnabled && (
                      <div className="flex items-center">
                        <Award className="h-4 w-4 text-green-500 mr-2" />
                        <span>Course discussion forum</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-2">
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline">{course.difficulty}</Badge>
                    {subject && <Badge variant="outline">{subject.category}</Badge>}
                    {academicLevel && <Badge variant="outline">{academicLevel.category}</Badge>}
                    {course.language && <Badge variant="outline">{course.language.toUpperCase()}</Badge>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPage;

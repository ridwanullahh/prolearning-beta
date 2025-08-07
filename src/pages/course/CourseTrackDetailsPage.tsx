import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@/lib/github-sdk';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { courseTrackService } from '@/lib/course-track-service';
import SmartHeader from '@/components/layout/SmartHeader';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Clock,
  Users,
  Star,
  Award,
  ChevronRight,
  Play,
  CheckCircle,
  Target,
  TrendingUp
} from 'lucide-react';

const CourseTrackDetailsPage = () => {
  const { trackId } = useParams();
  const navigate = useNavigate();
  const [track, setTrack] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      // @ts-ignore
      const currentUser = await db.getCurrentUser(localStorage.getItem('sessionToken'));
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchTrackDetails = async () => {
      try {
        setLoading(true);
        if (trackId) {
          const trackData = await db.getItem('courseTracks', trackId);
          setTrack(trackData);

          const trackCourses = await db.queryBuilder('courseTrackCourses').where((c: any) => c.courseTrackId === trackId).exec();
          const courseIds = trackCourses.map((tc: any) => tc.courseId);

          const courseData = await db.queryBuilder('courses').where((c: any) => courseIds.includes(c.id)).exec();
          setCourses(courseData);
        }
      } catch (error) {
        console.error('Error fetching track details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrackDetails();
  }, [trackId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <SmartHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading course track...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!track) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <SmartHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Course Track Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">The course track you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/marketplace')}>
              Back to Marketplace
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const totalDuration = courses.reduce((sum, course) => sum + (course.duration || 0), 0);
  const totalLessons = courses.reduce((sum, course) => sum + (course.lessonCount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <SmartHeader />

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 text-white py-20"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-white/20 text-white border-white/30 mb-4">
              Course Track
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {track.title}
            </h1>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              {track.description}
            </p>

            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <span>{courses.length} Courses</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>{totalDuration} Hours</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                <span>{totalLessons} Lessons</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>{track.enrollmentCount || 0} Students</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-green-600 hover:bg-gray-100 font-semibold px-8 py-3"
                onClick={async () => {
                  if (user && trackId) {
                    await courseTrackService.enrollInCourseTrack(user.id, trackId);
                    alert('Enrolled successfully!');
                  } else {
                    navigate('/auth/login');
                  }
                }}
              >
                <Play className="h-5 w-5 mr-2" />
                Start Learning Journey
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                onClick={() => {
                  document.getElementById('course-list')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                View Courses
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Course List Section */}
      <section id="course-list" className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Your Learning Path
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Follow this carefully curated sequence of courses to master your subject step by step.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="mb-6"
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                              {course.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-3">
                              {course.description}
                            </p>
                          </div>
                          <Badge variant="outline" className="ml-4">
                            Course {index + 1}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-4 mb-4">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            {course.duration || 0} hours
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <BookOpen className="h-4 w-4" />
                            {course.lessonCount || 0} lessons
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Star className="h-4 w-4 text-yellow-400" />
                            {course.rating || 'New'}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Users className="h-4 w-4" />
                            {course.enrollmentCount || 0} students
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Included in track
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/course/${course.id}`)}
                          >
                            View Details
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
              <CardContent className="p-8">
                <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Ready to Start Your Journey?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Join thousands of learners who have transformed their skills with this comprehensive track.
                </p>
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={async () => {
                    if (user && trackId) {
                      await courseTrackService.enrollInCourseTrack(user.id, trackId);
                      alert('Enrolled successfully!');
                    } else {
                      navigate('/auth/login');
                    }
                  }}
                >
                  <Award className="h-5 w-5 mr-2" />
                  Enroll Now
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CourseTrackDetailsPage;
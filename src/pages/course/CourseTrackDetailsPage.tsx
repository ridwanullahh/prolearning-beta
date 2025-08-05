import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '@/lib/github-sdk';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { courseTrackService } from '@/lib/course-track-service';

const CourseTrackDetailsPage = () => {
  const { trackId } = useParams();
  const [track, setTrack] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

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
      if (trackId) {
        const trackData = await db.getItem('courseTracks', trackId);
        setTrack(trackData);

        const trackCourses = await db.queryBuilder('courseTrackCourses').where((c: any) => c.courseTrackId === trackId).exec();
        const courseIds = trackCourses.map((tc: any) => tc.courseId);
        
        const courseData = await db.queryBuilder('courses').where((c: any) => courseIds.includes(c.id)).exec();
        setCourses(courseData);
      }
    };
    fetchTrackDetails();
  }, [trackId]);

  if (!track) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>{track.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{track.description}</p>
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Courses in this Track</h3>
            <div className="space-y-4 mt-2">
              {courses.map((course) => (
                <Card key={course.id}>
                  <CardHeader>
                    <CardTitle>{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{course.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <Button className="mt-4" onClick={async () => {
            if (user && trackId) {
              await courseTrackService.enrollInCourseTrack(user.id, trackId);
              alert('Enrolled successfully!');
            }
          }}>Enroll in this Track</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseTrackDetailsPage;
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/github-sdk';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const MyCourseTracksPage = () => {
  const [enrolledTracks, setEnrolledTracks] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUserAndEnrolledTracks = async () => {
      // @ts-ignore
      const currentUser = await db.getCurrentUser(localStorage.getItem('sessionToken'));
      setUser(currentUser);
      if (currentUser) {
        const enrollments = await db.queryBuilder('courseTrackEnrollments').where((e: any) => e.userId === currentUser.id).exec();
        const trackIds = enrollments.map((e: any) => e.courseTrackId);
        const tracks = await db.queryBuilder('courseTracks').where((t: any) => trackIds.includes(t.id)).exec();
        setEnrolledTracks(tracks);
      }
    };
    fetchUserAndEnrolledTracks();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>My Enrolled Course Tracks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {enrolledTracks.map((track) => (
              <Link to={`/track/${track.id}`} key={track.id}>
                <Card>
                  <CardHeader>
                    <CardTitle>{track.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{track.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyCourseTracksPage;
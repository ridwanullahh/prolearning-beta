import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/github-sdk';
import { Link } from 'react-router-dom';

const ManageCourseTracksPage = () => {
  const [courseTracks, setCourseTracks] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUserAndCourseTracks = async () => {
      // @ts-ignore
      const currentUser = await db.getCurrentUser(localStorage.getItem('sessionToken'));
      setUser(currentUser);
      if (currentUser) {
        const tracks = await db.queryBuilder('courseTracks').where((track: any) => track.instructorId === currentUser.id).exec();
        setCourseTracks(tracks);
      }
    };
    fetchUserAndCourseTracks();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Manage Course Tracks</CardTitle>
          <Button asChild>
            <Link to="/instruct/track/new">Create New Track</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courseTracks.map((track) => (
              <div key={track.id} className="flex items-center justify-between border p-4 rounded">
                <Link to={`/instruct/track/${track.id}/edit`}>
                  <h3 className="text-lg font-semibold">{track.title}</h3>
                </Link>
                <div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/instruct/track/${track.id}/edit`}>Edit</Link>
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => {
                    db.delete('courseTracks', track.id);
                    setCourseTracks(courseTracks.filter((t) => t.id !== track.id));
                  }}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageCourseTracksPage;
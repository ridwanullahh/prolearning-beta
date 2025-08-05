import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { courseTrackService } from '@/lib/course-track-service';
import { db } from '@/lib/github-sdk';
import { useNavigate } from 'react-router-dom';

const CreateCourseTrackPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [level, setLevel] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndCourses = async () => {
      // @ts-ignore
      const currentUser = await db.getCurrentUser(localStorage.getItem('sessionToken'));
      setUser(currentUser);
      if (currentUser) {
        const instructorCourses = await db.queryBuilder('courses').where((course: any) => course.instructorId === currentUser.id).exec();
        setCourses(instructorCourses);
      }
    };
    fetchUserAndCourses();
  }, []);

  const handleCreateTrack = async () => {
    if (user) {
      await courseTrackService.createCourseTrack(
        user.id,
        title,
        description,
        price,
        tags,
        level,
        selectedCourses.map((course) => course.id)
      );
      navigate('/instruct/dashboard');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Create Course Track</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input placeholder="Track Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="Track Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <Input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
            <Input placeholder="Tags (comma-separated)" onChange={(e) => setTags(e.target.value.split(','))} />
            <Input placeholder="Level" value={level} onChange={(e) => setLevel(e.target.value)} />
            <div>
              <h3 className="text-lg font-semibold">Select Courses</h3>
              <div className="grid grid-cols-3 gap-4">
                {courses.map((course) => (
                  <div key={course.id} className="border p-2 rounded">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCourses([...selectedCourses, course]);
                        } else {
                          setSelectedCourses(selectedCourses.filter((c) => c.id !== course.id));
                        }
                      }}
                    />
                    <label>{course.title}</label>
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={handleCreateTrack}>Create Track</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateCourseTrackPage;
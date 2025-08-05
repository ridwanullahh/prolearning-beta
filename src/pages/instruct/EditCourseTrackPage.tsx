import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/github-sdk';
import { useNavigate, useParams } from 'react-router-dom';
import { courseTrackService } from '@/lib/course-track-service';

const EditCourseTrackPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [level, setLevel] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<any[]>([]);
  const { trackId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrack = async () => {
      if (trackId) {
        const track = await db.getItem('courseTracks', trackId);
        if (track) {
          setTitle(track.title);
          setDescription(track.description);
          setPrice(track.price);
          setTags(track.tags);
          setLevel(track.level);
        }
      }
    };
    fetchTrack();
  }, [trackId]);

  const handleUpdateTrack = async () => {
    if (trackId) {
      await courseTrackService.updateCourseTrack(trackId, {
        title,
        description,
        price,
        tags,
        level,
      });
      navigate('/instruct/tracks');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Edit Course Track</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input placeholder="Track Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="Track Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <Input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
            <Input placeholder="Tags (comma-separated)" value={tags.join(',')} onChange={(e) => setTags(e.target.value.split(','))} />
            <Input placeholder="Level" value={level} onChange={(e) => setLevel(e.target.value)} />
            <Button onClick={handleUpdateTrack}>Update Track</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditCourseTrackPage;
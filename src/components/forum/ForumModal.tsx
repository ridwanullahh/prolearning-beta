import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Users, TrendingUp, Clock } from 'lucide-react';
import ThreadList from './ThreadList';
import { db } from '@/lib/github-sdk';

interface ForumModalProps {
  courseId: string;
  lessonId?: string;
  children: React.ReactNode;
}

const ForumModal: React.FC<ForumModalProps> = ({ courseId, lessonId, children }) => {
  const [course, setCourse] = useState<any>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [forumStats, setForumStats] = useState({
    totalThreads: 0,
    totalPosts: 0,
    activeUsers: 0,
    recentActivity: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      if (courseId) {
        const courseData = await db.getItem('courses', courseId);
        setCourse(courseData);
      }

      if (lessonId) {
        const lessonData = await db.getItem('lessons', lessonId);
        setLesson(lessonData);
      }

      // Fetch forum statistics
      const threads = await db.queryBuilder('forumThreads')
        .where((t: any) => t.courseId === courseId)
        .exec();

      const posts = await db.queryBuilder('forumPosts')
        .where((p: any) => threads.some((t: any) => t.id === p.threadId))
        .exec();

      // Get recent activity (last 24 hours)
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const recentPosts = posts.filter((p: any) => p.createdAt > yesterday);

      setForumStats({
        totalThreads: threads.length,
        totalPosts: posts.length,
        activeUsers: new Set(posts.map((p: any) => p.userId)).size,
        recentActivity: recentPosts.length
      });
    };

    fetchData();
  }, [courseId, lessonId]);

  const getForumTitle = () => {
    if (lesson) {
      return `${lesson.title} - Discussion`;
    }
    return course ? `${course.title} - Forum` : 'Course Forum';
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-6xl h-[85vh] flex flex-col">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold">{getForumTitle()}</DialogTitle>
              {lesson && (
                <p className="text-sm text-muted-foreground mt-1">
                  Lesson-specific discussion
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {forumStats.totalThreads} threads
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {forumStats.activeUsers} users
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {forumStats.recentActivity} recent
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-grow overflow-hidden">
          <Tabs defaultValue="all" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Discussions</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="recent">Recent Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="flex-grow overflow-y-auto">
              <ThreadList courseId={courseId} lessonId={lessonId} />
            </TabsContent>

            <TabsContent value="questions" className="flex-grow overflow-y-auto">
              <ThreadList courseId={courseId} lessonId={lessonId} filterType="question" />
            </TabsContent>

            <TabsContent value="general" className="flex-grow overflow-y-auto">
              <ThreadList courseId={courseId} lessonId={lessonId} filterType="general" />
            </TabsContent>

            <TabsContent value="recent" className="flex-grow overflow-y-auto">
              <ThreadList courseId={courseId} lessonId={lessonId} sortBy="recent" />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ForumModal;
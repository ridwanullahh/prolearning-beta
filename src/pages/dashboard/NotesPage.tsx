import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Folder, 
  Star, 
  Clock, 
  TrendingUp,
  BookOpen,
  GraduationCap,
  BarChart3
} from 'lucide-react';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';
import NoteList from '@/components/notes/NoteList';

const NotesPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalNotes: 0,
    favoriteNotes: 0,
    lessonNotes: 0,
    courseNotes: 0,
    recentNotes: 0,
    totalFolders: 0
  });
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUser) return;

      try {
        const [notes, folders] = await Promise.all([
          db.queryBuilder('notes').where((n: any) => n.userId === currentUser.id).exec(),
          db.queryBuilder('noteFolders').where((f: any) => f.userId === currentUser.id).exec()
        ]);

        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        setStats({
          totalNotes: notes.length,
          favoriteNotes: notes.filter((n: any) => n.isFavorite).length,
          lessonNotes: notes.filter((n: any) => n.lessonId).length,
          courseNotes: notes.filter((n: any) => n.courseId && !n.lessonId).length,
          recentNotes: notes.filter((n: any) => new Date(n.createdAt) > weekAgo).length,
          totalFolders: folders.length
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [currentUser]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">My Notes</h1>
        <p className="text-muted-foreground">
          Keep track of your learning journey with organized notes and insights.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalNotes}</div>
            <p className="text-xs text-muted-foreground">
              All your learning notes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorite Notes</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.favoriteNotes}</div>
            <p className="text-xs text-muted-foreground">
              Your starred notes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lesson Notes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lessonNotes}</div>
            <p className="text-xs text-muted-foreground">
              Notes from lessons
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Course Notes</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.courseNotes}</div>
            <p className="text-xs text-muted-foreground">
              General course notes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Notes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentNotes}</div>
            <p className="text-xs text-muted-foreground">
              Created this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Folders</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFolders}</div>
            <p className="text-xs text-muted-foreground">
              Organization folders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tips for Students */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Note-Taking Tips for Better Learning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold">Active Note-Taking</h4>
              <p className="text-sm text-muted-foreground">
                Write notes in your own words and connect new information to what you already know.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Use Categories</h4>
              <p className="text-sm text-muted-foreground">
                Organize notes by subject, topic, or importance to find them easily later.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Review Regularly</h4>
              <p className="text-sm text-muted-foreground">
                Mark important notes as favorites and review them regularly to reinforce learning.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Contextual Notes</h4>
              <p className="text-sm text-muted-foreground">
                Take notes while studying lessons - they'll be automatically linked for easy reference.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes List */}
      <Card>
        <CardHeader>
          <CardTitle>All Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <NoteList />
        </CardContent>
      </Card>
    </div>
  );
};

export default NotesPage;

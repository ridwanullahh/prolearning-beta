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
  Sparkles,
  BarChart3
} from 'lucide-react';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';
import NoteList from '@/components/notes/NoteList';

const InstructorNotesPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalNotes: 0,
    favoriteNotes: 0,
    aiEnhancedNotes: 0,
    recentNotes: 0,
    totalFolders: 0,
    totalCategories: 0
  });
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUser) return;

      try {
        const [notes, folders, categories] = await Promise.all([
          db.queryBuilder('notes').where((n: any) => n.userId === currentUser.id).exec(),
          db.queryBuilder('noteFolders').where((f: any) => f.userId === currentUser.id).exec(),
          db.queryBuilder('noteCategories').where((c: any) => c.userId === currentUser.id).exec()
        ]);

        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        setStats({
          totalNotes: notes.length,
          favoriteNotes: notes.filter((n: any) => n.isFavorite).length,
          aiEnhancedNotes: notes.filter((n: any) => n.isAiEnhanced).length,
          recentNotes: notes.filter((n: any) => new Date(n.createdAt) > weekAgo).length,
          totalFolders: folders.length,
          totalCategories: categories.length
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [currentUser]);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-3xl p-8 text-white">
        <div>
          <h1 className="text-4xl font-bold mb-2">My Notes</h1>
          <p className="text-green-100 text-lg">
            Organize your thoughts, ideas, and teaching materials with our advanced note-taking system.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Notes</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalNotes}</div>
            <p className="text-xs text-gray-500">
              Across all folders and categories
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Favorite Notes</CardTitle>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.favoriteNotes}</div>
            <p className="text-xs text-gray-500">
              Your starred notes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">AI Enhanced</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.aiEnhancedNotes}</div>
            <p className="text-xs text-gray-500">
              Notes improved by AI
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
            <p className="text-xs text-muted-foreground">
              Note categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Features Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI-Powered Features for Instructors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold">AI Enhancement</h4>
              <p className="text-sm text-muted-foreground">
                Improve your notes with AI-powered suggestions for better clarity, structure, and educational value.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Contextual Organization</h4>
              <p className="text-sm text-muted-foreground">
                Notes are automatically linked to courses and lessons for better organization and quick access.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Rich Text Editor</h4>
              <p className="text-sm text-muted-foreground">
                Create comprehensive notes with markdown support, formatting, and multimedia attachments.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Version Control</h4>
              <p className="text-sm text-muted-foreground">
                Track changes and maintain version history of your important notes and teaching materials.
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

export default InstructorNotesPage;
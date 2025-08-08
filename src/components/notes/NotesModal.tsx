import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Folder,
  Star,
  Sparkles,
  BookOpen,
  GraduationCap,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';
import NoteList from './NoteList';

interface NotesModalProps {
  children: React.ReactNode;
}

const NotesModal: React.FC<NotesModalProps> = ({ children }) => {
  const [contextInfo, setContextInfo] = useState<any>(null);
  const [noteStats, setNoteStats] = useState({
    totalNotes: 0,
    favoriteNotes: 0,
    contextualNotes: 0,
    recentNotes: 0,
    aiEnhancedNotes: 0
  });
  const location = useLocation();
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    const fetchContextAndStats = async () => {
      if (!currentUser) return;

      // Get context information
      const courseRegex = /course\/([^/]+)/;
      const lessonRegex = /lesson\/([^/]+)/;
      const courseMatch = location.pathname.match(courseRegex);
      const lessonMatch = location.pathname.match(lessonRegex);

      let context: any = {};

      if (lessonMatch) {
        const lesson = await db.getItem('lessons', lessonMatch[1]);
        if (lesson) {
          context = { type: 'lesson', data: lesson };
        }
      } else if (courseMatch) {
        const course = await db.getItem('courses', courseMatch[1]);
        if (course) {
          context = { type: 'course', data: course };
        }
      } else {
        context = { type: 'general' };
      }

      setContextInfo(context);

      // Get note statistics
      try {
        const notes = await db.queryBuilder('notes')
          .where((n: any) => n.userId === currentUser.id)
          .exec();

        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        let contextualNotes = 0;
        if (lessonMatch) {
          contextualNotes = notes.filter((n: any) => n.lessonId === lessonMatch[1]).length;
        } else if (courseMatch) {
          contextualNotes = notes.filter((n: any) => n.courseId === courseMatch[1]).length;
        }

        setNoteStats({
          totalNotes: notes.length,
          favoriteNotes: notes.filter((n: any) => n.isFavorite).length,
          contextualNotes,
          recentNotes: notes.filter((n: any) => new Date(n.createdAt) > weekAgo).length,
          aiEnhancedNotes: notes.filter((n: any) => n.isAiEnhanced).length
        });
      } catch (error) {
        console.error('Error fetching note stats:', error);
      }
    };

    fetchContextAndStats();
  }, [location.pathname, currentUser]);

  const getContextTitle = () => {
    if (contextInfo?.type === 'lesson') {
      return `Notes - ${contextInfo.data.title}`;
    } else if (contextInfo?.type === 'course') {
      return `Notes - ${contextInfo.data.title}`;
    }
    return 'My Notes';
  };

  const getContextDescription = () => {
    const userRole = currentUser?.role || 'learner';

    if (contextInfo?.type === 'lesson') {
      return userRole === 'instructor'
        ? 'Manage your teaching notes and materials for this lesson.'
        : 'Take and organize notes while studying this lesson.';
    } else if (contextInfo?.type === 'course') {
      return userRole === 'instructor'
        ? 'Organize your course materials, teaching notes, and resources.'
        : 'Keep track of your learning progress and insights for this course.';
    }

    return userRole === 'instructor'
      ? 'Organize all your teaching materials, course notes, and educational resources.'
      : 'Organize your learning notes, insights, and study materials.';
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-[98vw] w-[98vw] sm:max-w-[95vw] sm:w-[95vw] lg:max-w-[88vw] lg:w-[88vw] h-[95vh] sm:h-[92vh] modal-content-enhanced">
        <DialogHeader className="modal-header">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                {getContextTitle()}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {getContextDescription()}
              </p>
            </div>
            <div className="flex gap-2">
              {contextInfo?.type && contextInfo.type !== 'general' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {contextInfo.type === 'lesson' && <BookOpen className="h-3 w-3" />}
                  {contextInfo.type === 'course' && <GraduationCap className="h-3 w-3" />}
                  {noteStats.contextualNotes} {contextInfo.type} notes
                </Badge>
              )}
              <Badge variant="outline" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {noteStats.totalNotes} total
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                {noteStats.favoriteNotes} favorites
              </Badge>
              {currentUser?.role === 'instructor' && noteStats.aiEnhancedNotes > 0 && (
                <Badge variant="outline" className="flex items-center gap-1 text-purple-600">
                  <Sparkles className="h-3 w-3" />
                  {noteStats.aiEnhancedNotes} AI enhanced
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="modal-body modal-scroll">
          <NoteList />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotesModal;
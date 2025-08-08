import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Brain, MessageSquare, TrendingUp } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';
import SessionList from './SessionList';

interface AIChatModalProps {
  children: React.ReactNode;
}

const AIChatModal: React.FC<AIChatModalProps> = ({ children }) => {
  const [contextInfo, setContextInfo] = useState<any>(null);
  const [sessionStats, setSessionStats] = useState({
    totalSessions: 0,
    activeSessions: 0,
    totalMessages: 0
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

      // Get session statistics
      try {
        const sessions = await db.queryBuilder('aiChatSessions')
          .where((s: any) => s.userId === currentUser.id)
          .exec();

        const activeSessions = sessions.filter((s: any) => s.isActive);

        let totalMessages = 0;
        for (const session of sessions) {
          const messages = await db.queryBuilder('aiChatMessages')
            .where((m: any) => m.sessionId === session.id)
            .exec();
          totalMessages += messages.length;
        }

        setSessionStats({
          totalSessions: sessions.length,
          activeSessions: activeSessions.length,
          totalMessages
        });
      } catch (error) {
        console.error('Error fetching session stats:', error);
      }
    };

    fetchContextAndStats();
  }, [location.pathname, currentUser]);

  const getContextTitle = () => {
    if (contextInfo?.type === 'lesson') {
      return `AI Support - ${contextInfo.data.title}`;
    } else if (contextInfo?.type === 'course') {
      return `AI Support - ${contextInfo.data.title}`;
    }
    return 'AI Support';
  };

  const getContextDescription = () => {
    const userRole = currentUser?.role || 'learner';

    if (contextInfo?.type === 'lesson') {
      return userRole === 'instructor'
        ? 'Get AI assistance for teaching this lesson, creating content, and educational strategies.'
        : 'Get contextual help understanding this lesson content and concepts.';
    } else if (contextInfo?.type === 'course') {
      return userRole === 'instructor'
        ? 'Get AI assistance for course development, curriculum design, and teaching strategies.'
        : 'Get help with course concepts, study strategies, and learning guidance.';
    }

    return userRole === 'instructor'
      ? 'AI-powered assistance for teaching, course creation, and educational best practices.'
      : 'AI-powered learning support to help you understand concepts and improve your studies.';
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
                <Sparkles className="h-5 w-5 text-purple-500" />
                {getContextTitle()}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {getContextDescription()}
              </p>
            </div>
            <div className="flex gap-2">
              {contextInfo?.type && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {contextInfo.type === 'lesson' && <Brain className="h-3 w-3" />}
                  {contextInfo.type === 'course' && <TrendingUp className="h-3 w-3" />}
                  {contextInfo.type === 'general' && <MessageSquare className="h-3 w-3" />}
                  {contextInfo.type === 'lesson' ? 'Lesson Context' :
                   contextInfo.type === 'course' ? 'Course Context' : 'General'}
                </Badge>
              )}
              <Badge variant="outline" className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {sessionStats.totalSessions} sessions
              </Badge>
              {currentUser?.role === 'instructor' && (
                <Badge variant="outline" className="text-purple-600">
                  Instructor Mode
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="modal-body modal-scroll">
          <SessionList />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIChatModal;
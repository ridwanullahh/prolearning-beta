import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Search,
  MessageSquare,
  Sparkles,
  Clock,
  BookOpen,
  GraduationCap,
  Trash2,
  MoreVertical
} from 'lucide-react';
import formatDistanceToNow from '@/lib/date-utils';
import { useLocation } from 'react-router-dom';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';
import ChatView from './ChatView';

const SessionList: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const currentUser = authService.getCurrentUser();
  const location = useLocation();

  const fetchSessions = async () => {
    if (!currentUser) return;

    try {
      const data = await db.queryBuilder('aiChatSessions')
        .where((s: any) => s.userId === currentUser.id)
        .orderBy('lastMessageAt', 'desc')
        .exec();
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [currentUser]);

  useEffect(() => {
    let filtered = [...sessions];

    if (searchQuery) {
      filtered = filtered.filter(session =>
        session.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredSessions(filtered);
  }, [sessions, searchQuery]);

  const createNewSession = async () => {
    if (!currentUser || isCreating) return;

    setIsCreating(true);
    try {
      // Get current context from URL
      const courseRegex = /course\/([^/]+)/;
      const lessonRegex = /lesson\/([^/]+)/;
      const courseMatch = location.pathname.match(courseRegex);
      const lessonMatch = location.pathname.match(lessonRegex);

      let context: any = {
        userRole: currentUser.role,
        createdFrom: location.pathname
      };

      let title = 'New AI Chat';

      if (lessonMatch) {
        const lesson = await db.getItem('lessons', lessonMatch[1]);
        if (lesson) {
          context.lessonId = lesson.id;
          context.type = 'lesson';
          title = `Chat: ${lesson.title}`;
        }
      } else if (courseMatch) {
        const course = await db.getItem('courses', courseMatch[1]);
        if (course) {
          context.courseId = course.id;
          context.type = 'course';
          title = `Chat: ${course.title}`;
        }
      } else {
        context.type = 'general';
        title = currentUser.role === 'instructor' ? 'Instructor Support Chat' : 'Learning Support Chat';
      }

      const newSession = await db.insert('aiChatSessions', {
        userId: currentUser.id,
        title,
        context,
        isActive: true,
        lastMessageAt: new Date().toISOString(),
        messageCount: 0,
        tags: []
      });

      await fetchSessions();
      setSelectedSession(newSession);
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this chat session?')) {
      return;
    }

    try {
      // Delete all messages in the session
      const messages = await db.queryBuilder('aiChatMessages')
        .where((m: any) => m.sessionId === sessionId)
        .exec();

      for (const message of messages) {
        await db.delete('aiChatMessages', message.id);
      }

      // Delete the session
      await db.delete('aiChatSessions', sessionId);

      await fetchSessions();

      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const getContextIcon = (context: any) => {
    if (context?.lessonId) {
      return <BookOpen className="h-4 w-4 text-blue-500" />;
    } else if (context?.courseId) {
      return <GraduationCap className="h-4 w-4 text-green-500" />;
    }
    return <Sparkles className="h-4 w-4 text-purple-500" />;
  };

  const getContextLabel = (context: any) => {
    if (context?.lessonId) return 'Lesson';
    if (context?.courseId) return 'Course';
    return 'General';
  };

  const safeFormatDistanceToNow = (dateString: string | undefined) => {
    if (!dateString) return 'No date';
    try {
      const date = new Date(dateString);
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  if (selectedSession) {
    return <ChatView session={selectedSession} onBack={() => setSelectedSession(null)} />;
  }

  return (
    <div className="space-y-4">
      {/* Header with search and create button */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search chat sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={createNewSession}
          disabled={isCreating}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {isCreating ? 'Creating...' : 'New Chat'}
        </Button>
      </div>

      {/* Session list */}
      <div className="space-y-3">
        {filteredSessions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No chat sessions yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Start a conversation with AI to get help with your {currentUser?.role === 'instructor' ? 'teaching' : 'learning'}!
              </p>
              <Button onClick={createNewSession} disabled={isCreating}>
                Start Your First Chat
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredSessions.map((session) => (
            <Card
              key={session.id}
              className="cursor-pointer hover:shadow-md transition-shadow group"
              onClick={() => setSelectedSession(session)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {getContextIcon(session.context)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {getContextLabel(session.context)}
                        </Badge>
                        {session.context?.userRole === 'instructor' && (
                          <Badge variant="outline" className="text-xs">
                            Instructor
                          </Badge>
                        )}
                      </div>

                      <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                        {session.title}
                      </h3>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {session.messageCount || 0} messages
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {safeFormatDistanceToNow(session.lastMessageAt || session.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDeleteSession(session.id, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default SessionList;

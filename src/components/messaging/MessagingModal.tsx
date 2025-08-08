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
  MessageCircle,
  Users,
  Clock,
  Send,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';
import ConversationList from './ConversationList';

interface MessagingModalProps {
  children: React.ReactNode;
}

const MessagingModal: React.FC<MessagingModalProps> = ({ children }) => {
  const [messageStats, setMessageStats] = useState({
    totalConversations: 0,
    unreadMessages: 0,
    activeConversations: 0,
    instructorChats: 0,
    recentActivity: 0
  });
  const [contextInfo, setContextInfo] = useState<any>(null);
  const location = useLocation();
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    const fetchContextAndStats = async () => {
      if (!currentUser) return;

      // Get context information
      const courseRegex = /course\/([^/]+)/;
      const courseMatch = location.pathname.match(courseRegex);

      let context: any = {};
      if (courseMatch) {
        const course = await db.getItem('courses', courseMatch[1]);
        if (course) {
          context = { type: 'course', data: course };
        }
      } else {
        context = { type: 'general' };
      }

      setContextInfo(context);

      // Get messaging statistics
      try {
        const conversations = await db.queryBuilder('conversations')
          .where((c: any) => c.participantIds.includes(currentUser.id))
          .exec();

        let unreadCount = 0;
        let instructorChats = 0;
        let recentActivity = 0;
        const now = new Date();
        const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        for (const conversation of conversations) {
          // Count unread messages
          const unreadMessages = await db.queryBuilder('messages')
            .where((m: any) =>
              m.conversationId === conversation.id &&
              m.senderId !== currentUser.id &&
              !m.isRead
            )
            .exec();
          unreadCount += unreadMessages.length;

          // Count instructor chats
          const otherParticipants = conversation.participantIds.filter((id: string) => id !== currentUser.id);
          for (const participantId of otherParticipants) {
            const participant = await db.getItem('users', participantId);
            if (participant?.role === 'instructor') {
              instructorChats++;
              break;
            }
          }

          // Count recent activity
          if (conversation.lastMessageAt && new Date(conversation.lastMessageAt) > dayAgo) {
            recentActivity++;
          }
        }

        const activeConversations = conversations.filter((c: any) =>
          c.lastMessageAt && new Date(c.lastMessageAt) > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        ).length;

        setMessageStats({
          totalConversations: conversations.length,
          unreadMessages: unreadCount,
          activeConversations,
          instructorChats,
          recentActivity
        });
      } catch (error) {
        console.error('Error fetching message stats:', error);
      }
    };

    fetchContextAndStats();

    // Set up real-time updates
    const interval = setInterval(fetchContextAndStats, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [location.pathname, currentUser]);

  const getContextTitle = () => {
    if (contextInfo?.type === 'course') {
      return `Messages - ${contextInfo.data.title}`;
    }
    return 'Messages';
  };

  const getContextDescription = () => {
    const userRole = currentUser?.role || 'learner';

    if (contextInfo?.type === 'course') {
      return userRole === 'instructor'
        ? 'Communicate with students enrolled in this course.'
        : 'Connect with instructors and fellow students in this course.';
    }

    return userRole === 'instructor'
      ? 'Communicate with your students and fellow instructors.'
      : 'Connect with instructors for help and guidance.';
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
                <MessageCircle className="h-5 w-5 text-green-500" />
                {getContextTitle()}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {getContextDescription()}
              </p>
            </div>
            <div className="flex gap-2">
              {messageStats.unreadMessages > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <Circle className="h-3 w-3 fill-current" />
                  {messageStats.unreadMessages} unread
                </Badge>
              )}
              <Badge variant="outline" className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {messageStats.totalConversations} chats
              </Badge>
              {messageStats.instructorChats > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {messageStats.instructorChats} with instructors
                </Badge>
              )}
              {messageStats.recentActivity > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {messageStats.recentActivity} active today
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="modal-body modal-scroll">
          <ConversationList />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessagingModal;
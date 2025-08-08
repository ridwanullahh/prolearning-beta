import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  MessageSquare,
  Bot,
  Notebook,
  MessageCircle,
  ChevronUp,
  ChevronDown,
  Users,
  Sparkles,
  FileText,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ForumModal from '../forum/ForumModal';
import AIChatModal from '../ai-chat/AIChatModal';
import NotesModal from '../notes/NotesModal';
import MessagingModal from '../messaging/MessagingModal';
// Inline panels for sidebar (sheets)
import ThreadList from '../forum/ThreadList';
import SessionList from '../ai-chat/SessionList';
import NoteList from '../notes/NoteList';
import ConversationList from '../messaging/ConversationList';

import { authService } from '@/lib/auth';
import { db } from '@/lib/github-sdk';

interface ToolbarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  isVisible: boolean;
  badge?: number;
}

const FloatingToolbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [isAllowed, setIsAllowed] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({
    messages: 0,
    forum: 0,
    ai: 0
  });
  const location = useLocation();
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    const checkPermissions = async () => {
      const courseRegex = /course\/([^/]+)/;
      const courseMatch = location.pathname.match(courseRegex);
      const currentCourseId = courseMatch ? courseMatch[1] : null;
      setCourseId(currentCourseId);

      const lessonRegex = /lesson\/([^/]+)/;
      const lessonMatch = location.pathname.match(lessonRegex);
      setLessonId(lessonMatch ? lessonMatch[1] : null);

      if (!currentUser) {
        setIsAllowed(false);
        return;
      }

      // Allow access on dashboard pages
      if (location.pathname.includes('/dashboard') || location.pathname.includes('/instruct')) {
        setIsAllowed(true);
        return;
      }

      if (!currentCourseId) {
        setIsAllowed(false);
        return;
      }

      const course = await db.getItem('courses', currentCourseId);
      if (course?.instructorId === currentUser.id) {
        setIsAllowed(true);
        return;
      }

      const enrollments = await db.queryBuilder('enrollments')
        .where((e: any) => e.userId === currentUser.id && e.courseId === currentCourseId)
        .exec();
      setIsAllowed(enrollments.length > 0);
    }

    const fetchUnreadCounts = async () => {
      if (!currentUser) return;

      try {
        // Get unread messages count
        const conversations = await db.queryBuilder('conversations')
          .where((c: any) => c.participantIds.includes(currentUser.id))
          .exec();

        let unreadMessages = 0;
        for (const conv of conversations) {
          const messages = await db.queryBuilder('messages')
            .where((m: any) => m.conversationId === conv.id && m.senderId !== currentUser.id && !m.isRead)
            .exec();
          unreadMessages += messages.length;
        }

        setUnreadCounts(prev => ({ ...prev, messages: unreadMessages }));
      } catch (error) {
        console.error('Error fetching unread counts:', error);
      }
    };

    checkPermissions();
    fetchUnreadCounts();

    // Set up interval to refresh unread counts
    const interval = setInterval(fetchUnreadCounts, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [location, currentUser]);

  const toggleToolbar = () => {
    setIsOpen(!isOpen);
  };

  const toolbarItems: ToolbarItem[] = [
    {
      id: 'forum',
      label: 'Forum',
      icon: <Users className="h-5 w-5" />,
      component: (
        <Sheet>
          <SheetTrigger asChild>
            <div className="flex flex-col items-center gap-1 cursor-pointer">
              <div className="relative">
                <Users className="h-5 w-5" />
                {unreadCounts.forum > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadCounts.forum > 9 ? '9+' : unreadCounts.forum}
                  </span>
                )}
              </div>
              <span className="text-xs">Forum</span>
            </div>
          </SheetTrigger>
          <SheetContent side="right" className="w-[90vw] sm:w-[480px] md:w-[560px] lg:w-[720px] xl:w-[820px]">
            <SheetHeader>
              <SheetTitle>Course Forum</SheetTitle>
            </SheetHeader>
            <div className="mt-6 h-full">
              {/* Inline forum panel */}
              <div className="h-[calc(100vh-10rem)] overflow-hidden">
                <ThreadList courseId={courseId || ''} lessonId={lessonId || undefined} />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      ),
      isVisible: isAllowed && !!courseId
    },
    {
      id: 'ai-chat',
      label: 'AI Support',
      icon: <Sparkles className="h-5 w-5" />,
      component: (
        <Sheet>
          <SheetTrigger asChild>
            <div className="flex flex-col items-center gap-1 cursor-pointer">
              <div className="relative">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-xs">AI Support</span>
            </div>
          </SheetTrigger>
          <SheetContent side="right" className="w-[90vw] sm:w-[480px] md:w-[560px] lg:w-[720px] xl:w-[820px]">
            <SheetHeader>
              <SheetTitle>AI Learning Assistant</SheetTitle>
            </SheetHeader>
            <div className="mt-6 h-full">
              {/* Inline AI chat panel */}
              <div className="h-[calc(100vh-10rem)] overflow-hidden">
                <SessionList />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      ),
      isVisible: true
    },
    {
      id: 'notes',
      label: 'Notes',
      icon: <FileText className="h-5 w-5" />,
      component: (
        <Sheet>
          <SheetTrigger asChild>
            <div className="flex flex-col items-center gap-1 cursor-pointer">
              <div className="relative">
                <FileText className="h-5 w-5" />
              </div>
              <span className="text-xs">Notes</span>
            </div>
          </SheetTrigger>
          <SheetContent side="right" className="w-[90vw] sm:w-[480px] md:w-[560px] lg:w-[720px] xl:w-[820px]">
            <SheetHeader>
              <SheetTitle>My Notes</SheetTitle>
            </SheetHeader>
            <div className="mt-6 h-full">
              {/* Inline notes panel */}
              <div className="h-[calc(100vh-10rem)] overflow-hidden">
                <NoteList />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      ),
      isVisible: true
    },
    {
      id: 'messaging',
      label: 'Messages',
      icon: <Send className="h-5 w-5" />,
      component: (
        <Sheet>
          <SheetTrigger asChild>
            <div className="flex flex-col items-center gap-1 cursor-pointer">
              <div className="relative">
                <Send className="h-5 w-5" />
                {unreadCounts.messages > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadCounts.messages > 9 ? '9+' : unreadCounts.messages}
                  </span>
                )}
              </div>
              <span className="text-xs">Messages</span>
            </div>
          </SheetTrigger>
          <SheetContent side="right" className="w-[90vw] sm:w-[480px] md:w-[560px] lg:w-[720px] xl:w-[820px]">
            <SheetHeader>
              <SheetTitle>Messages</SheetTitle>
            </SheetHeader>
            <div className="mt-6 h-full">
              {/* Inline messaging panel */}
              <div className="h-[calc(100vh-10rem)] overflow-hidden">
                <ConversationList />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      ),
      isVisible: isAllowed && currentUser?.role === 'instructor' // Only instructors can access messaging for now
    }
  ];

  const visibleItems = toolbarItems.filter(item => item.isVisible);

  if (!currentUser || visibleItems.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="flex justify-center pb-2">
        <div className="pointer-events-auto">
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ y: 100, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 100, opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="mb-2"
              >
                <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-3xl shadow-2xl shadow-black/10 dark:shadow-black/30 p-6">
                  <div className="flex items-center gap-8">
                    {visibleItems.map((item) => (
                      <div key={item.id} className="flex flex-col items-center">
                        {item.component}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle Button - More attached to bottom */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex justify-center"
          >
            <Button
              onClick={toggleToolbar}
              size="lg"
              className="rounded-full h-16 w-16 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-2xl shadow-green-600/25 border-4 border-white dark:border-gray-900 transition-all duration-200"
            >
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {isOpen ? (
                  <ChevronDown className="h-7 w-7 text-white" />
                ) : (
                  <ChevronUp className="h-7 w-7 text-white" />
                )}
              </motion.div>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FloatingToolbar;
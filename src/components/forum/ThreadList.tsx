import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MessageSquare,
  Plus,
  Search,
  Pin,
  Lock,
  CheckCircle,
  Eye,
  Clock,
  ArrowUp,
  ArrowDown,
  Filter
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';
import ThreadView from './ThreadView';
import CreateThreadModal from './CreateThreadModal';

interface ThreadListProps {
  courseId: string;
  lessonId?: string;
  filterType?: 'all' | 'question' | 'general' | 'discussion';
  sortBy?: 'recent' | 'popular' | 'oldest';
}

const ThreadList: React.FC<ThreadListProps> = ({
  courseId,
  lessonId,
  filterType = 'all',
  sortBy = 'recent'
}) => {
  const [threads, setThreads] = useState<any[]>([]);
  const [filteredThreads, setFilteredThreads] = useState<any[]>([]);
  const [selectedThread, setSelectedThread] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [users, setUsers] = useState<Map<string, any>>(new Map());
  const currentUser = authService.getCurrentUser();

  const fetchThreads = async () => {
    try {
      let query = db.queryBuilder('forumThreads').where((thread: any) => thread.courseId === courseId);

      if (lessonId) {
        query = query.where((thread: any) => thread.lessonId === lessonId);
      }

      const data = await query.exec();

      // Fetch user data for thread creators
      const userIds = [...new Set(data.map((t: any) => t.userId))];
      const userData = await Promise.all(
        userIds.map(async (id) => {
          const user = await db.getItem('users', id);
          return [id, user];
        })
      );
      setUsers(new Map(userData));

      // Fetch post counts for each thread
      const threadsWithCounts = await Promise.all(
        data.map(async (thread: any) => {
          const posts = await db.queryBuilder('forumPosts')
            .where((p: any) => p.threadId === thread.id)
            .exec();

          return {
            ...thread,
            postCount: posts.length,
            lastPost: posts.length > 0 ? posts[posts.length - 1] : null
          };
        })
      );

      setThreads(threadsWithCounts || []);
    } catch (error) {
      console.error('Error fetching threads:', error);
    }
  };

  useEffect(() => {
    fetchThreads();

    // Set up real-time updates (polling every 30 seconds)
    const interval = setInterval(fetchThreads, 30000);
    return () => clearInterval(interval);
  }, [courseId, lessonId]);

  useEffect(() => {
    let filtered = [...threads];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(thread =>
        thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thread.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(thread => thread.type === filterType);
    }

    // Apply sorting
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.lastActivityAt || b.createdAt).getTime() - new Date(a.lastActivityAt || a.createdAt).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
    }

    setFilteredThreads(filtered);
  }, [threads, searchQuery, filterType, sortBy]);

  const handleThreadClick = async (thread: any) => {
    // Increment view count
    await db.update('forumThreads', thread.id, {
      viewCount: (thread.viewCount || 0) + 1
    });

    setSelectedThread(thread);
  };

  const getThreadTypeIcon = (type: string) => {
    switch (type) {
      case 'question':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'general':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const getThreadTypeColor = (type: string) => {
    switch (type) {
      case 'question':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'general':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (selectedThread) {
    return <ThreadView thread={selectedThread} onBack={() => setSelectedThread(null)} />;
  }

  return (
    <div className="space-y-4">
      {/* Header with search and create button */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <CreateThreadModal
          courseId={courseId}
          lessonId={lessonId}
          onThreadCreated={fetchThreads}
        >
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Discussion
          </Button>
        </CreateThreadModal>
      </div>

      {/* Thread list */}
      <div className="space-y-3">
        {filteredThreads.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No discussions yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Be the first to start a discussion in this {lessonId ? 'lesson' : 'course'}!
              </p>
              <CreateThreadModal
                courseId={courseId}
                lessonId={lessonId}
                onThreadCreated={fetchThreads}
              >
                <Button>Start Discussion</Button>
              </CreateThreadModal>
            </CardContent>
          </Card>
        ) : (
          filteredThreads.map((thread) => {
            const author = users.get(thread.userId);
            const lastActivity = thread.lastPost ? new Date(thread.lastPost.createdAt) : new Date(thread.createdAt);

            return (
              <Card
                key={thread.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleThreadClick(thread)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={author?.profile?.avatar} />
                        <AvatarFallback>
                          {author?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {thread.isPinned && <Pin className="h-4 w-4 text-orange-500" />}
                          {thread.isLocked && <Lock className="h-4 w-4 text-red-500" />}
                          {thread.isAnswered && <CheckCircle className="h-4 w-4 text-green-500" />}
                          <Badge variant="secondary" className={getThreadTypeColor(thread.type)}>
                            {getThreadTypeIcon(thread.type)}
                            <span className="ml-1 capitalize">{thread.type}</span>
                          </Badge>
                        </div>

                        <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                          {thread.title}
                        </h3>

                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {thread.content}
                        </p>

                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>by {author?.name || 'Unknown'}</span>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(lastActivity, { addSuffix: true })}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {thread.postCount || 0} replies
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {thread.viewCount || 0} views
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ThreadList;
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Pin,
  Lock,
  CheckCircle,
  MoreVertical,
  Reply,
  Heart,
  Share
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';

interface ThreadViewProps {
  thread: any;
  onBack: () => void;
}

const ThreadView: React.FC<ThreadViewProps> = ({ thread, onBack }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [users, setUsers] = useState<Map<string, any>>(new Map());
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [threadAuthor, setThreadAuthor] = useState<any>(null);
  const currentUser = authService.getCurrentUser();

  const fetchPosts = async () => {
    try {
      const data = await db.queryBuilder('forumPosts')
        .where((post: any) => post.threadId === thread.id)
        .orderBy('createdAt', 'asc')
        .exec();

      // Fetch user data for post authors
      const userIds = [...new Set(data.map((p: any) => p.userId))];
      const userData = await Promise.all(
        userIds.map(async (id) => {
          const user = await db.getItem('users', id);
          return [id, user];
        })
      );
      setUsers(new Map(userData));

      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      // Fetch thread author
      const author = await db.getItem('users', thread.userId);
      setThreadAuthor(author);

      // Fetch posts
      await fetchPosts();
    };

    fetchData();

    // Set up real-time updates
    const interval = setInterval(fetchPosts, 15000); // Every 15 seconds
    return () => clearInterval(interval);
  }, [thread.id]);

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !currentUser || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await db.insert('forumPosts', {
        threadId: thread.id,
        userId: currentUser.id,
        content: newPostContent.trim(),
        isAnswer: false,
        isEdited: false,
        parentPostId: replyingTo,
        likes: 0,
        dislikes: 0,
        attachments: []
      });

      // Update thread's last activity
      await db.update('forumThreads', thread.id, {
        lastActivityAt: new Date().toISOString(),
        lastActivityUserId: currentUser.id
      });

      setNewPostContent('');
      setReplyingTo(null);
      await fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReaction = async (postId: string, type: 'like' | 'dislike') => {
    if (!currentUser) return;

    try {
      // Check if user already reacted
      const existingReaction = await db.queryBuilder('forumPostReactions')
        .where((r: any) => r.postId === postId && r.userId === currentUser.id)
        .exec();

      if (existingReaction.length > 0) {
        // Remove existing reaction
        await db.delete('forumPostReactions', existingReaction[0].id);

        // Update post counts
        const post = posts.find(p => p.id === postId);
        if (post) {
          const updateField = existingReaction[0].type === 'like' ? 'likes' : 'dislikes';
          await db.update('forumPosts', postId, {
            [updateField]: Math.max(0, (post[updateField] || 0) - 1)
          });
        }
      } else {
        // Add new reaction
        await db.insert('forumPostReactions', {
          postId,
          userId: currentUser.id,
          type
        });

        // Update post counts
        const post = posts.find(p => p.id === postId);
        if (post) {
          const updateField = type === 'like' ? 'likes' : 'dislikes';
          await db.update('forumPosts', postId, {
            [updateField]: (post[updateField] || 0) + 1
          });
        }
      }

      await fetchPosts();
    } catch (error) {
      console.error('Error handling reaction:', error);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to discussions
        </Button>
      </div>

      {/* Thread Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <Avatar className="h-10 w-10">
                <AvatarImage src={threadAuthor?.profile?.avatar} />
                <AvatarFallback>
                  {threadAuthor?.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {thread.isPinned && <Pin className="h-4 w-4 text-orange-500" />}
                  {thread.isLocked && <Lock className="h-4 w-4 text-red-500" />}
                  {thread.isAnswered && <CheckCircle className="h-4 w-4 text-green-500" />}
                  <Badge variant="secondary" className={getThreadTypeColor(thread.type)}>
                    <span className="capitalize">{thread.type}</span>
                  </Badge>
                </div>

                <h1 className="text-xl font-bold mb-2">{thread.title}</h1>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span>by {threadAuthor?.name || 'Unknown'}</span>
                  <span>{formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}</span>
                  <span>{posts.length} replies</span>
                  <span>{thread.viewCount || 0} views</span>
                </div>

                {thread.tags && thread.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {thread.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {thread.content}
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      <div className="space-y-4">
        {posts.map((post) => {
          const author = users.get(post.userId);
          return (
            <Card key={post.id} className={post.isAnswer ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/50' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={author?.profile?.avatar} />
                      <AvatarFallback>
                        {author?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{author?.name || 'Unknown'}</span>
                        {post.isAnswer && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Answer
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </span>
                        {post.isEdited && (
                          <span className="text-xs text-muted-foreground">(edited)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert mb-4">
                  {post.content}
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReaction(post.id, 'like')}
                    className="flex items-center gap-1"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    {post.likes || 0}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReaction(post.id, 'dislike')}
                    className="flex items-center gap-1"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    {post.dislikes || 0}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(post.id)}
                    className="flex items-center gap-1"
                  >
                    <Reply className="h-4 w-4" />
                    Reply
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Reply Form */}
      {currentUser && !thread.isLocked && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold">
              {replyingTo ? 'Reply to post' : 'Add your reply'}
            </h3>
            {replyingTo && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(null)}
                className="w-fit"
              >
                Cancel reply
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Share your thoughts, ask questions, or provide answers..."
                rows={4}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim() || isSubmitting}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  {isSubmitting ? 'Posting...' : 'Post Reply'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {thread.isLocked && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">This discussion has been locked.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ThreadView;
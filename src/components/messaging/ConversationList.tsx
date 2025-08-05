import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Search,
  MessageCircle,
  Clock,
  Users,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';
import MessageView from './MessageView';
import NewConversationModal from './NewConversationModal';

const ConversationList: React.FC = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<Map<string, any>>(new Map());
  const currentUser = authService.getCurrentUser();

  const fetchConversations = async () => {
    if (!currentUser) return;

    try {
      const data = await db.queryBuilder('conversations')
        .where((c: any) => c.participantIds.includes(currentUser.id))
        .orderBy('lastMessageAt', 'desc')
        .exec();

      // Fetch user data for all participants
      const allParticipantIds = [...new Set(data.flatMap((c: any) => c.participantIds))];
      const userData = await Promise.all(
        allParticipantIds.map(async (id) => {
          const user = await db.getItem('users', id);
          return [id, user];
        })
      );
      setUsers(new Map(userData));

      // Fetch unread message counts for each conversation
      const conversationsWithUnread = await Promise.all(
        data.map(async (conversation: any) => {
          const unreadMessages = await db.queryBuilder('messages')
            .where((m: any) =>
              m.conversationId === conversation.id &&
              m.senderId !== currentUser.id &&
              !m.isRead
            )
            .exec();

          return {
            ...conversation,
            unreadCount: unreadMessages.length
          };
        })
      );

      setConversations(conversationsWithUnread || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  useEffect(() => {
    fetchConversations();

    // Set up real-time updates
    const interval = setInterval(fetchConversations, 10000); // Every 10 seconds
    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    let filtered = [...conversations];

    if (searchQuery) {
      filtered = filtered.filter(conversation => {
        const otherParticipants = conversation.participantIds
          .filter((id: string) => id !== currentUser?.id)
          .map((id: string) => users.get(id))
          .filter(Boolean);

        return otherParticipants.some((user: any) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    setFilteredConversations(filtered);
  }, [conversations, searchQuery, users, currentUser]);

  if (selectedConversation) {
    return <MessageView conversation={selectedConversation} onBack={() => setSelectedConversation(null)} />;
  }

  const getOtherParticipants = (conversation: any) => {
    return conversation.participantIds
      .filter((id: string) => id !== currentUser?.id)
      .map((id: string) => users.get(id))
      .filter(Boolean);
  };

  const getConversationTitle = (conversation: any) => {
    const otherParticipants = getOtherParticipants(conversation);
    if (conversation.title) {
      return conversation.title;
    }
    return otherParticipants.map((user: any) => user.name).join(', ') || 'Unknown';
  };

  const getLastMessagePreview = (conversation: any) => {
    if (conversation.lastMessage) {
      return conversation.lastMessage.content.substring(0, 50) + '...';
    }
    return 'No messages yet';
  };

  return (
    <div className="space-y-4">
      {/* Header with search and new conversation */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <NewConversationModal onConversationCreated={(conversation) => {
          fetchConversations();
          setSelectedConversation(conversation);
        }}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </NewConversationModal>
      </div>

      {/* Conversation list */}
      <div className="space-y-3">
        {filteredConversations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Start a conversation with instructors or students to collaborate and get help!
              </p>
              <NewConversationModal onConversationCreated={(conversation) => {
                fetchConversations();
                setSelectedConversation(conversation);
              }}>
                <Button>Start Your First Conversation</Button>
              </NewConversationModal>
            </CardContent>
          </Card>
        ) : (
          filteredConversations.map((conversation) => {
            const otherParticipants = getOtherParticipants(conversation);
            const lastActivity = conversation.lastMessageAt
              ? new Date(conversation.lastMessageAt)
              : new Date(conversation.createdAt);

            return (
              <Card
                key={conversation.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedConversation(conversation)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="flex -space-x-2">
                      {otherParticipants.slice(0, 2).map((user: any) => (
                        <Avatar key={user.id} className="h-10 w-10 border-2 border-background">
                          <AvatarImage src={user.profile?.avatar} />
                          <AvatarFallback>
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {otherParticipants.length > 2 && (
                        <div className="h-10 w-10 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                          +{otherParticipants.length - 2}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-sm truncate">
                          {getConversationTitle(conversation)}
                        </h3>
                        <div className="flex items-center gap-2">
                          {conversation.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(lastActivity, { addSuffix: true })}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground truncate">
                        {getLastMessagePreview(conversation)}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        {conversation.type === 'group' && (
                          <Badge variant="outline" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            Group
                          </Badge>
                        )}
                        {otherParticipants.some((user: any) => user.role === 'instructor') && (
                          <Badge variant="secondary" className="text-xs">
                            Instructor
                          </Badge>
                        )}
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

export default ConversationList;
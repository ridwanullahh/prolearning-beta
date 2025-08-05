import React, { useState, useEffect } from 'react';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '../ui/button';

interface NewConversationModalProps {
  onConversationCreated: (conversation: any) => void;
}

const NewConversationModal: React.FC<NewConversationModalProps> = ({ onConversationCreated }) => {
  const [users, setUsers] = useState<any[]>([]);
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    const fetchUsers = async () => {
      const allUsers = await db.get('users');
      setUsers(allUsers.filter((u: any) => u.id !== currentUser?.id));
    };
    fetchUsers();
  }, [currentUser]);

  const handleCreateConversation = async (userId: string) => {
    if (!currentUser) return;
    
    // Check if a conversation already exists
    const existingConversations = await db.queryBuilder('conversations')
      .where((c: any) => c.participantIds.includes(currentUser.id) && c.participantIds.includes(userId))
      .exec();

    if (existingConversations.length > 0) {
      onConversationCreated(existingConversations[0]);
      return;
    }

    const newConversation = await db.insert('conversations', {
      participantIds: [currentUser.id, userId],
    });
    onConversationCreated(newConversation);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>New Conversation</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start a new conversation</DialogTitle>
        </DialogHeader>
        <ul>
          {users.map(user => (
            <li key={user.id} onClick={() => handleCreateConversation(user.id)} className="cursor-pointer p-2 hover:bg-muted">
              {user.name}
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
};

export default NewConversationModal;
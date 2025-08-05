import React, { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '../ui/scroll-area';

interface MessageViewProps {
  conversation: any;
  onBack: () => void;
}

const MessageView: React.FC<MessageViewProps> = ({ conversation, onBack }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [otherUser, setOtherUser] = useState<any | null>(null);
  const currentUser = authService.getCurrentUser();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    const data = await db.queryBuilder('messages').where((m: any) => m.conversationId === conversation.id).orderBy('createdAt', 'asc').exec();
    setMessages(data);
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll for new messages every 5 seconds

    const otherUserId = conversation.participantIds.find((id: string) => id !== currentUser?.id);
    if (otherUserId) {
      db.getItem('users', otherUserId).then(setOtherUser);
    }

    return () => clearInterval(interval);
  }, [conversation.id]);
  
  useEffect(() => {
    // @ts-ignore
    if (scrollAreaRef.current?.scrollTo) {
        // @ts-ignore
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentUser) return;

    await db.insert('messages', {
      conversationId: conversation.id,
      senderId: currentUser.id,
      content: input,
      isRead: false,
    });
    setInput('');
    fetchMessages();
  };

  return (
    <div className="flex flex-col h-full">
      <Button onClick={onBack} variant="link" className="self-start">Back to conversations</Button>
      <h2 className="text-xl font-bold mb-4">Chat with {otherUser?.name || '...'}</h2>
      <ScrollArea className="flex-grow p-4 border rounded-md" ref={scrollAreaRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`mb-4 ${msg.senderId === currentUser?.id ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-2 rounded-lg ${msg.senderId === currentUser?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {msg.content}
            </div>
          </div>
        ))}
      </ScrollArea>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow"
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
};

export default MessageView;
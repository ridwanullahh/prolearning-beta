import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ConversationList from './ConversationList';

interface MessagingModalProps {
  children: React.ReactNode;
}

const MessagingModal: React.FC<MessagingModalProps> = ({ children }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-3/4 flex flex-col">
        <DialogHeader>
          <DialogTitle>Messages</DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto">
          <ConversationList />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessagingModal;
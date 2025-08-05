import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SessionList from './SessionList';

interface AIChatModalProps {
  children: React.ReactNode;
}

const AIChatModal: React.FC<AIChatModalProps> = ({ children }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-3/4 flex flex-col">
        <DialogHeader>
          <DialogTitle>AI Support</DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto">
          <SessionList />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIChatModal;
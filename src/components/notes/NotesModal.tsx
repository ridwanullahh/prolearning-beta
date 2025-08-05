import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import NoteList from './NoteList';

interface NotesModalProps {
  children: React.ReactNode;
}

const NotesModal: React.FC<NotesModalProps> = ({ children }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-3/4 flex flex-col">
        <DialogHeader>
          <DialogTitle>My Notes</DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto">
          <NoteList />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotesModal;
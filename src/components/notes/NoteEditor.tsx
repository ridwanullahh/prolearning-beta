import React, { useState, useEffect } from 'react';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RichTextEditor from '@/components/shared/RichTextEditor';
import { useLocation } from 'react-router-dom';
import { aiChatService } from '@/lib/ai-chat-service';

interface NoteEditorProps {
  note: any | null;
  onBack: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onBack }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [folders, setFolders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const currentUser = authService.getCurrentUser();
  const location = useLocation();

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setSelectedFolder(note.folderId);
      setSelectedCategory(note.categoryId);
    }
  }, [note]);

  useEffect(() => {
    const fetchFoldersAndCategories = async () => {
      if (!currentUser) return;
      const [folderData, categoryData] = await Promise.all([
        db.queryBuilder('noteFolders').where((f: any) => f.userId === currentUser.id).exec(),
        db.queryBuilder('noteCategories').where((c: any) => c.userId === currentUser.id).exec(),
      ]);
      setFolders(folderData);
      setCategories(categoryData);
    };
    fetchFoldersAndCategories();
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser) return;

    const courseRegex = /course\/([^/]+)/;
    const lessonRegex = /lesson\/([^/]+)/;
    const courseMatch = location.pathname.match(courseRegex);
    const lessonMatch = location.pathname.match(lessonRegex);

    const data = {
      title,
      content,
      userId: currentUser.id,
      folderId: selectedFolder,
      categoryId: selectedCategory,
      courseId: courseMatch ? courseMatch[1] : null,
      lessonId: lessonMatch ? lessonMatch[1] : null,
    };

    if (note) {
      await db.update('notes', note.id, data);
    } else {
      await db.insert('notes', data);
    }
    onBack();
  };
  
  const handleAiEnhance = async () => {
    if(!content) return;
    const enhancedContent = await aiChatService.generateResponse([], `Enhance the following note for clarity and detail: ${content}`);
    setContent(enhancedContent);
  }

  return (
    <div>
      <Button onClick={onBack} variant="link">Back to notes</Button>
      <div className="flex flex-col gap-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
        />
        <div className="flex gap-4">
          <select value={selectedFolder || ''} onChange={(e) => setSelectedFolder(e.target.value)} className="select select-bordered w-full max-w-xs">
            <option value="">Select a folder</option>
            {folders.map(folder => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
          </select>
          <select value={selectedCategory || ''} onChange={(e) => setSelectedCategory(e.target.value)} className="select select-bordered w-full max-w-xs">
            <option value="">Select a category</option>
            {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </div>
        <RichTextEditor
          value={content}
          onChange={setContent}
        />
        <div className="flex justify-between">
          <Button onClick={handleSave}>Save Note</Button>
          {currentUser?.role === 'instructor' && (
            <Button onClick={handleAiEnhance} variant="outline">Enhance with AI</Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
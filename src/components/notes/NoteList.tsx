import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Search,
  FileText,
  Folder,
  Tag,
  Star,
  Archive,
  Clock,
  BookOpen,
  GraduationCap,
  Trash2,
  MoreVertical,
  Pin,
  Edit,
  Eye,
  Sparkles
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useLocation } from 'react-router-dom';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';
import NoteEditor from './NoteEditor';
import { aiChatService } from '@/lib/ai-chat-service';

const NoteList: React.FC = () => {
  const [notes, setNotes] = useState<any[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'favorites' | 'archived' | 'contextual'>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState<string | null>(null);
  const currentUser = authService.getCurrentUser();
  const location = useLocation();

  const fetchFoldersAndCategories = async () => {
    if (!currentUser) return;
    const [folderData, categoryData] = await Promise.all([
      db.queryBuilder('noteFolders').where((f: any) => f.userId === currentUser.id).exec(),
      db.queryBuilder('noteCategories').where((c: any) => c.userId === currentUser.id).exec(),
    ]);
    setFolders(folderData);
    setCategories(categoryData);
  };

  const fetchNotes = async () => {
    if (!currentUser) return;

    try {
      let query = db.queryBuilder('notes')
        .where((n: any) => n.userId === currentUser.id)
        .orderBy('updatedAt', 'desc');

      if (selectedFolder) {
        query = query.where((n: any) => n.folderId === selectedFolder);
      }
      if (selectedCategory) {
        query = query.where((n: any) => n.categoryId === selectedCategory);
      }

      const data = await query.exec();
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  useEffect(() => {
    let filtered = [...notes];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.plainTextContent?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply view mode filter
    switch (viewMode) {
      case 'favorites':
        filtered = filtered.filter(note => note.isFavorite);
        break;
      case 'archived':
        filtered = filtered.filter(note => note.isArchived);
        break;
      case 'contextual':
        // Get current context
        const courseRegex = /course\/([^/]+)/;
        const lessonRegex = /lesson\/([^/]+)/;
        const courseMatch = location.pathname.match(courseRegex);
        const lessonMatch = location.pathname.match(lessonRegex);

        if (lessonMatch) {
          filtered = filtered.filter(note => note.lessonId === lessonMatch[1]);
        } else if (courseMatch) {
          filtered = filtered.filter(note => note.courseId === courseMatch[1]);
        }
        break;
      case 'all':
      default:
        filtered = filtered.filter(note => !note.isArchived);
        break;
    }

    setFilteredNotes(filtered);
  }, [notes, searchQuery, viewMode, location.pathname]);

  useEffect(() => {
    fetchFoldersAndCategories();
  }, [currentUser]);

  useEffect(() => {
    fetchNotes();
  }, [currentUser, selectedFolder, selectedCategory]);
  
  const handleSelectNote = (note: any) => {
    setSelectedNote(note);
    setIsCreating(false);
  }

  const handleCreateNew = () => {
    setSelectedNote(null);
    setIsCreating(true);
  }
  
  const handleBack = () => {
    setSelectedNote(null);
    setIsCreating(false);
    fetchNotes();
  }

  const handleToggleFavorite = async (noteId: string, isFavorite: boolean, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await db.update('notes', noteId, { isFavorite: !isFavorite });
      await fetchNotes();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleTogglePin = async (noteId: string, isPinned: boolean, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await db.update('notes', noteId, { isPinned: !isPinned });
      await fetchNotes();
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const handleArchiveNote = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await db.update('notes', noteId, { isArchived: true });
      await fetchNotes();
    } catch (error) {
      console.error('Error archiving note:', error);
    }
  };

  const handleDeleteNote = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      await db.delete('notes', noteId);
      await fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleAiEnhance = async (noteId: string, content: string) => {
    if (!currentUser || currentUser.role !== 'instructor') return;

    setIsEnhancing(noteId);
    try {
      const enhancedContent = await aiChatService.generateResponse(
        [],
        `Please enhance and improve the following note content for better clarity, structure, and educational value. Keep the core meaning but make it more comprehensive and well-organized:\n\n${content}`,
        { userRole: 'instructor' }
      );

      await db.update('notes', noteId, {
        content: enhancedContent,
        isAiEnhanced: true,
        version: (notes.find(n => n.id === noteId)?.version || 0) + 1
      });

      await fetchNotes();
    } catch (error) {
      console.error('Error enhancing note:', error);
    } finally {
      setIsEnhancing(null);
    }
  };

  const getContextIcon = (note: any) => {
    if (note.lessonId) {
      return <BookOpen className="h-4 w-4 text-blue-500" />;
    } else if (note.courseId) {
      return <GraduationCap className="h-4 w-4 text-green-500" />;
    }
    return <FileText className="h-4 w-4 text-gray-500" />;
  };

  const getContextLabel = (note: any) => {
    if (note.lessonId) return 'Lesson Note';
    if (note.courseId) return 'Course Note';
    return 'General Note';
  };

  if (selectedNote || isCreating) {
    return <NoteEditor note={selectedNote} onBack={handleBack} />;
  }

  return (
    <div className="space-y-6">
      {/* Header with search and create button */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={handleCreateNew}
          disabled={isCreating}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Note
        </Button>
      </div>

      {/* Tabs for different views */}
      <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Notes</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="contextual">Contextual</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value={viewMode} className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedFolder || ''}
                onChange={(e) => setSelectedFolder(e.target.value || null)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="">All Folders</option>
                {folders.map(folder => (
                  <option key={folder.id} value={folder.id}>{folder.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes Grid */}
          <div className="responsive-grid">
            {filteredNotes.length === 0 ? (
              <div className="col-span-full">
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No notes found</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      {searchQuery
                        ? `No notes match "${searchQuery}"`
                        : viewMode === 'contextual'
                          ? 'No notes for this lesson/course yet'
                          : 'Start taking notes to organize your thoughts!'
                      }
                    </p>
                    <Button onClick={handleCreateNew}>Create Your First Note</Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              filteredNotes.map((note) => (
                <Card
                  key={note.id}
                  className="cursor-pointer hover:shadow-md transition-shadow group"
                  onClick={() => handleSelectNote(note)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2 flex-1">
                        {getContextIcon(note)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {note.isPinned && <Pin className="h-3 w-3 text-orange-500" />}
                            {note.isFavorite && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                            {note.isAiEnhanced && <Sparkles className="h-3 w-3 text-purple-500" />}
                            <Badge variant="outline" className="text-xs">
                              {getContextLabel(note)}
                            </Badge>
                          </div>

                          <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                            {note.title}
                          </h3>

                          <p className="text-xs text-muted-foreground line-clamp-3 mb-2">
                            {note.plainTextContent || note.content?.substring(0, 150)}
                          </p>

                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                            </div>
                            {note.wordCount && (
                              <span>{note.wordCount} words</span>
                            )}
                            {note.readingTime && (
                              <span>{note.readingTime} min read</span>
                            )}
                          </div>

                          {note.tags && note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {note.tags.slice(0, 3).map((tag: string) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {note.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{note.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleToggleFavorite(note.id, note.isFavorite, e)}
                        >
                          <Star className={`h-3 w-3 ${note.isFavorite ? 'text-yellow-500 fill-current' : ''}`} />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleTogglePin(note.id, note.isPinned, e)}
                        >
                          <Pin className={`h-3 w-3 ${note.isPinned ? 'text-orange-500' : ''}`} />
                        </Button>

                        {currentUser?.role === 'instructor' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAiEnhance(note.id, note.content)}
                            disabled={isEnhancing === note.id}
                          >
                            <Sparkles className={`h-3 w-3 ${isEnhancing === note.id ? 'animate-spin' : ''}`} />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleArchiveNote(note.id, e)}
                        >
                          <Archive className="h-3 w-3" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteNote(note.id, e)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NoteList;
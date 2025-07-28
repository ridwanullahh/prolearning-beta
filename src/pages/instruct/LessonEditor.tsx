import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/github-sdk';
import { ArrowLeft, Save, Plus, Trash2, GripVertical, Upload, FileText, Video, Image as ImageIcon, Music, Type } from 'lucide-react';
import RichTextEditor from '@/components/shared/RichTextEditor';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { motion } from 'framer-motion';

// Interfaces
interface ContentBlock {
  id: string;
  type: 'text' | 'video' | 'image' | 'audio' | 'document';
  title: string;
  content: string;
  order: number;
  metadata?: any;
}

interface Quiz {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer: string;
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

const LessonEditor: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  useEffect(() => {
    loadLessonData();
  }, [courseId, lessonId]);

  const loadLessonData = async () => {
    try {
      if (lessonId && lessonId !== 'new') {
        const lessonData = await db.getItem('lessons', lessonId);
        if (lessonData) {
          setLesson(lessonData);
          setTitle(lessonData.title);
          setDescription(lessonData.description);
          setContentBlocks(JSON.parse(lessonData.content || '[]'));
          setQuizzes(JSON.parse(lessonData.quiz || '[]'));
          setFlashcards(JSON.parse(lessonData.flashcards || '[]'));
        }
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to load lesson data.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLesson = async () => {
    setSaving(true);
    try {
      const lessonData = {
        courseId,
        title,
        description,
        content: JSON.stringify(contentBlocks),
        quiz: JSON.stringify(quizzes),
        flashcards: JSON.stringify(flashcards),
        updatedAt: new Date().toISOString(),
      };

      if (lessonId === 'new' || !lesson) {
        const newLesson = await db.insert('lessons', { ...lessonData, createdAt: new Date().toISOString() });
        navigate(`/instruct/courses/${courseId}/lessons/${newLesson.id}/edit`);
      } else {
        await db.update('lessons', lessonId!, lessonData);
      }
      toast({ title: "Success", description: "Lesson saved successfully!" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save lesson.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const addContentBlock = (type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: `block_${Date.now()}`, type, title: '', content: '', order: contentBlocks.length
    };
    setContentBlocks([...contentBlocks, newBlock]);
  };

  const updateContentBlock = (id: string, updates: Partial<ContentBlock>) => {
    setContentBlocks(blocks => blocks.map(b => b.id === id ? { ...b, ...updates } : b));
  };
  
  const removeContentBlock = (id: string) => {
    setContentBlocks(blocks => blocks.filter(b => b.id !== id));
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(contentBlocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setContentBlocks(items.map((item, index) => ({ ...item, order: index })));
  };

  const addQuiz = () => setQuizzes([...quizzes, { id: `quiz_${Date.now()}`, question: '', type: 'multiple_choice', options: ['', ''], correctAnswer: '' }]);
  const updateQuiz = (id: string, updates: Partial<Quiz>) => setQuizzes(qs => qs.map(q => q.id === id ? { ...q, ...updates } : q));
  const removeQuiz = (id: string) => setQuizzes(qs => qs.filter(q => q.id !== id));

  const addFlashcard = () => setFlashcards([...flashcards, { id: `flash_${Date.now()}`, front: '', back: '' }]);
  const updateFlashcard = (id: string, updates: Partial<Flashcard>) => setFlashcards(fs => fs.map(f => f.id === id ? { ...f, ...updates } : f));
  const removeFlashcard = (id:string) => setFlashcards(fs => fs.filter(f => f.id !== id));

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate(`/instruct/courses/${courseId}/edit`)}>
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">{lessonId === 'new' ? 'Create New Lesson' : 'Edit Lesson'}</h1>
        </div>
        <Button onClick={handleSaveLesson} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Lesson'}
        </Button>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
          <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings">
            <Card>
                <CardHeader><CardTitle>Lesson Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="title">Lesson Title</Label>
                        <Input id="title" value={title} onChange={e => setTitle(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="description">Lesson Description</Label>
                        <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="content">
            <Card>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        Content Blocks
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => addContentBlock('text')}><Type className="h-4 w-4 mr-2"/>Text</Button>
                            <Button size="sm" variant="outline" onClick={() => addContentBlock('video')}><Video className="h-4 w-4 mr-2"/>Video</Button>
                            <Button size="sm" variant="outline" onClick={() => addContentBlock('image')}><ImageIcon className="h-4 w-4 mr-2"/>Image</Button>
                            <Button size="sm" variant="outline" onClick={() => addContentBlock('audio')}><Music className="h-4 w-4 mr-2"/>Audio</Button>
                            <Button size="sm" variant="outline" onClick={() => addContentBlock('document')}><FileText className="h-4 w-4 mr-2"/>Document</Button>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="content-blocks">
                            {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                                    {contentBlocks.map((block, index) => (
                                        <Draggable key={block.id} draggableId={block.id} index={index}>
                                            {(provided) => (
                                                <div ref={provided.innerRef} {...provided.draggableProps} className="p-4 border rounded-lg bg-background">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <div {...provided.dragHandleProps}><GripVertical className="h-5 w-5 text-muted-foreground" /></div>
                                                            <span className="font-semibold">{block.type.charAt(0).toUpperCase() + block.type.slice(1)} Block</span>
                                                        </div>
                                                        <Button size="sm" variant="ghost" onClick={() => removeContentBlock(block.id)}><Trash2 className="h-4 w-4"/></Button>
                                                    </div>
                                                    <ContentBlockEditor block={block} onUpdate={updateContentBlock} />
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="quiz">
            <Card>
                <CardHeader><CardTitle className="flex justify-between items-center">Quiz <Button onClick={addQuiz}><Plus className="h-4 w-4 mr-2"/>Add Question</Button></CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    {quizzes.map(q => <QuizEditor key={q.id} quiz={q} onUpdate={updateQuiz} onRemove={removeQuiz}/>)}
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="flashcards">
            <Card>
                <CardHeader><CardTitle className="flex justify-between items-center">Flashcards <Button onClick={addFlashcard}><Plus className="h-4 w-4 mr-2"/>Add Flashcard</Button></CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {flashcards.map(f => <FlashcardEditor key={f.id} flashcard={f} onUpdate={updateFlashcard} onRemove={removeFlashcard}/>)}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const ContentBlockEditor = ({ block, onUpdate }: { block: ContentBlock, onUpdate: (id: string, updates: Partial<ContentBlock>) => void }) => {
    return (
        <div className="space-y-2">
            <Input placeholder="Block Title" value={block.title} onChange={e => onUpdate(block.id, { title: e.target.value })}/>
            {block.type === 'text' && <RichTextEditor value={block.content} onChange={c => onUpdate(block.id, { content: c })} />}
            {['video', 'image', 'audio', 'document'].includes(block.type) && (
                <div className="p-4 border-dashed border-2 rounded-lg text-center">
                    <Upload className="mx-auto h-8 w-8 mb-2 text-gray-400" />
                    <p>Upload {block.type} file or provide a URL below.</p>
                    <Input className="mt-2" placeholder="URL (e.g., YouTube, a.com/image.png)" value={block.metadata?.url || ''} onChange={e => onUpdate(block.id, { metadata: {...block.metadata, url: e.target.value}})}/>
                </div>
            )}
        </div>
    )
}

const QuizEditor = ({ quiz, onUpdate, onRemove }: { quiz: Quiz, onUpdate: (id: string, updates: Partial<Quiz>) => void, onRemove: (id: string) => void }) => {
    return (
        <div className="p-4 border rounded-lg space-y-2">
            <div className="flex justify-end"><Button size="sm" variant="ghost" onClick={() => onRemove(quiz.id)}><Trash2 className="h-4 w-4"/></Button></div>
            <Textarea placeholder="Question" value={quiz.question} onChange={e => onUpdate(quiz.id, { question: e.target.value })}/>
            <Select value={quiz.type} onValueChange={(v:any) => onUpdate(quiz.id, { type: v })}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="true_false">True/False</SelectItem>
                    <SelectItem value="short_answer">Short Answer</SelectItem>
                </SelectContent>
            </Select>
            {quiz.type === 'multiple_choice' && (
                <div className="space-y-1">
                    {quiz.options?.map((opt, i) => (
                        <Input key={i} placeholder={`Option ${i+1}`} value={opt} onChange={e => {
                            const newOpts = [...(quiz.options || [])];
                            newOpts[i] = e.target.value;
                            onUpdate(quiz.id, { options: newOpts });
                        }}/>
                    ))}
                </div>
            )}
            <Input placeholder="Correct Answer" value={quiz.correctAnswer} onChange={e => onUpdate(quiz.id, { correctAnswer: e.target.value })}/>
        </div>
    )
}

const FlashcardEditor = ({ flashcard, onUpdate, onRemove }: { flashcard: Flashcard, onUpdate: (id: string, updates: Partial<Flashcard>) => void, onRemove: (id: string) => void }) => {
    return (
        <div className="p-4 border rounded-lg space-y-2 relative group">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="ghost" onClick={() => onRemove(flashcard.id)}><Trash2 className="h-4 w-4"/></Button>
            </div>
            <Textarea placeholder="Front side" value={flashcard.front} onChange={e => onUpdate(flashcard.id, { front: e.target.value })}/>
            <Textarea placeholder="Back side" value={flashcard.back} onChange={e => onUpdate(flashcard.id, { back: e.target.value })}/>
        </div>
    )
}

export default LessonEditor;

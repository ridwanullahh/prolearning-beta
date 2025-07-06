
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';
import { ArrowLeft, Save, Plus, Trash2, GripVertical, Upload } from 'lucide-react';
import RichTextEditor from '@/components/shared/RichTextEditor';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface ContentBlock {
  id: string;
  type: 'text' | 'video' | 'image' | 'audio' | 'document';
  title: string;
  content: string;
  order: number;
  metadata?: {
    url?: string;
    caption?: string;
    altText?: string;
    embedCode?: string;
    fileName?: string;
    fileSize?: number;
  };
}

interface Quiz {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'fill_in_blank' | 'short_answer' | 'essay';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hint?: string;
}

interface KeyPoint {
  id: string;
  point: string;
  explanation: string;
  importance: 'low' | 'medium' | 'high';
  examples: string[];
}

interface MindMapNode {
  id: string;
  label: string;
  x: number;
  y: number;
  children: string[];
}

interface MindMap {
  title: string;
  nodes: MindMapNode[];
}

const LessonEditor = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [lesson, setLesson] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Lesson data states
  const [basicInfo, setBasicInfo] = useState({
    title: '',
    description: '',
    duration: 30,
    objectives: '',
    order: 1,
    releaseType: 'immediate',
    scheduledReleaseDate: '',
    dripDays: 0,
    prerequisiteLessons: []
  });
  
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [keyPoints, setKeyPoints] = useState<KeyPoint[]>([]);
  const [mindMap, setMindMap] = useState<MindMap>({ title: '', nodes: [] });

  useEffect(() => {
    loadLessonData();
  }, [courseId, lessonId]);

  const loadLessonData = async () => {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        navigate('/auth/login');
        return;
      }

      // Load course
      const courseData = await db.getItem('courses', courseId!);
      if (!courseData || courseData.creatorId !== user.id) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to edit this course.",
          variant: "destructive"
        });
        navigate('/instruct');
        return;
      }
      setCourse(courseData);

      if (lessonId && lessonId !== 'new') {
        // Load existing lesson
        const lessonData = await db.getItem('lessons', lessonId);
        if (lessonData && lessonData.courseId === courseId) {
          setLesson(lessonData);
          setBasicInfo({
            title: lessonData.title,
            description: lessonData.description,
            duration: lessonData.duration,
            objectives: lessonData.objectives || '',
            order: lessonData.order,
            releaseType: lessonData.releaseType || 'immediate',
            scheduledReleaseDate: lessonData.scheduledReleaseDate || '',
            dripDays: lessonData.dripDays || 0,
            prerequisiteLessons: JSON.parse(lessonData.prerequisiteLessons || '[]')
          });

          // Load lesson content blocks
          const contents = await db.queryBuilder('lessonContents')
            .where(c => c.lessonId === lessonId)
            .orderBy('order')
            .exec();
          
          setContentBlocks(contents.map(c => ({
            id: c.id,
            type: c.type,
            title: c.title,
            content: c.content,
            order: c.order,
            metadata: JSON.parse(c.metadata || '{}')
          })));

          // Load quizzes
          const quizData = await db.queryBuilder('quizzes')
            .where(q => q.lessonId === lessonId)
            .exec();
          
          if (quizData.length > 0) {
            const questions = JSON.parse(quizData[0].questions || '[]');
            setQuizzes(questions.map((q: any, i: number) => ({
              id: `q${i}`,
              ...q
            })));
          }

          // Load flashcards
          const flashcardData = await db.queryBuilder('flashcards')
            .where(f => f.lessonId === lessonId)
            .orderBy('order')
            .exec();
          
          setFlashcards(flashcardData.map(f => ({
            id: f.id,
            front: f.front,
            back: f.back,
            difficulty: f.difficulty,
            hint: f.hint
          })));

          // Load key points
          const keyPointData = await db.queryBuilder('keyPoints')
            .where(k => k.lessonId === lessonId)
            .orderBy('order')
            .exec();
          
          setKeyPoints(keyPointData.map(k => ({
            id: k.id,
            point: k.point,
            explanation: k.explanation,
            importance: k.importance,
            examples: k.examples ? k.examples.split('\n') : []
          })));

          // Load mind map
          const mindMapData = await db.queryBuilder('mindMaps')
            .where(m => m.lessonId === lessonId)
            .exec();
          
          if (mindMapData.length > 0) {
            setMindMap({
              title: mindMapData[0].title,
              nodes: JSON.parse(mindMapData[0].data || '[]')
            });
          }
        }
      }
    } catch (error) {
      console.error('Error loading lesson data:', error);
      toast({
        title: "Error",
        description: "Failed to load lesson data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLesson = async () => {
    setSaving(true);
    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      let lessonData = lesson;
      
      // Create or update lesson
      if (lessonId === 'new' || !lessonData) {
        lessonData = await db.insert('lessons', {
          courseId: courseId!,
          title: basicInfo.title,
          description: basicInfo.description,
          order: basicInfo.order,
          duration: basicInfo.duration,
          type: 'mixed',
          isRequired: true,
          objectives: basicInfo.objectives,
          isPublished: true,
          releaseType: basicInfo.releaseType,
          scheduledReleaseDate: basicInfo.scheduledReleaseDate || null,
          dripDays: basicInfo.dripDays,
          prerequisiteLessons: JSON.stringify(basicInfo.prerequisiteLessons)
        });
        setLesson(lessonData);
      } else {
        lessonData = await db.update('lessons', lessonId!, {
          title: basicInfo.title,
          description: basicInfo.description,
          order: basicInfo.order,
          duration: basicInfo.duration,
          objectives: basicInfo.objectives,
          releaseType: basicInfo.releaseType,
          scheduledReleaseDate: basicInfo.scheduledReleaseDate || null,
          dripDays: basicInfo.dripDays,
          prerequisiteLessons: JSON.stringify(basicInfo.prerequisiteLessons)
        });
      }

      // Save content blocks
      // First, delete existing content blocks
      const existingContents = await db.queryBuilder('lessonContents')
        .where(c => c.lessonId === lessonData.id)
        .exec();
      
      for (const content of existingContents) {
        await db.delete('lessonContents', content.id);
      }

      // Insert new content blocks
      for (const block of contentBlocks) {
        await db.insert('lessonContents', {
          lessonId: lessonData.id,
          type: block.type,
          content: block.content,
          order: block.order,
          title: block.title,
          isRequired: true,
          metadata: JSON.stringify(block.metadata || {})
        });
      }

      // Save quizzes
      if (quizzes.length > 0) {
        const existingQuizzes = await db.queryBuilder('quizzes')
          .where(q => q.lessonId === lessonData.id)
          .exec();
        
        if (existingQuizzes.length > 0) {
          await db.update('quizzes', existingQuizzes[0].id, {
            questions: JSON.stringify(quizzes),
            totalQuestions: quizzes.length,
            title: `${basicInfo.title} Quiz`
          });
        } else {
          await db.insert('quizzes', {
            lessonId: lessonData.id,
            courseId: courseId!,
            title: `${basicInfo.title} Quiz`,
            description: 'Lesson quiz',
            questions: JSON.stringify(quizzes),
            totalQuestions: quizzes.length,
            passingScore: 70,
            timeLimit: 30,
            attempts: 3,
            isActive: true
          });
        }
      }

      // Save flashcards
      const existingFlashcards = await db.queryBuilder('flashcards')
        .where(f => f.lessonId === lessonData.id)
        .exec();
      
      for (const flashcard of existingFlashcards) {
        await db.delete('flashcards', flashcard.id);
      }

      for (let i = 0; i < flashcards.length; i++) {
        const flashcard = flashcards[i];
        await db.insert('flashcards', {
          lessonId: lessonData.id,
          courseId: courseId!,
          front: flashcard.front,
          back: flashcard.back,
          difficulty: flashcard.difficulty,
          order: i + 1,
          hint: flashcard.hint || ''
        });
      }

      // Save key points
      const existingKeyPoints = await db.queryBuilder('keyPoints')
        .where(k => k.lessonId === lessonData.id)
        .exec();
      
      for (const keyPoint of existingKeyPoints) {
        await db.delete('keyPoints', keyPoint.id);
      }

      for (let i = 0; i < keyPoints.length; i++) {
        const keyPoint = keyPoints[i];
        await db.insert('keyPoints', {
          lessonId: lessonData.id,
          courseId: courseId!,
          point: keyPoint.point,
          explanation: keyPoint.explanation,
          order: i + 1,
          importance: keyPoint.importance,
          examples: keyPoint.examples.join('\n')
        });
      }

      // Save mind map
      if (mindMap.nodes.length > 0) {
        const existingMindMaps = await db.queryBuilder('mindMaps')
          .where(m => m.lessonId === lessonData.id)
          .exec();
        
        if (existingMindMaps.length > 0) {
          await db.update('mindMaps', existingMindMaps[0].id, {
            title: mindMap.title,
            data: JSON.stringify(mindMap.nodes),
            nodeCount: mindMap.nodes.length
          });
        } else {
          await db.insert('mindMaps', {
            lessonId: lessonData.id,
            courseId: courseId!,
            title: mindMap.title,
            data: JSON.stringify(mindMap.nodes),
            nodeCount: mindMap.nodes.length
          });
        }
      }

      toast({
        title: "Success",
        description: "Lesson saved successfully!"
      });

      if (lessonId === 'new') {
        navigate(`/instruct/courses/${courseId}/lessons/${lessonData.id}/edit`);
      }
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast({
        title: "Error",
        description: "Failed to save lesson.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const addContentBlock = (type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title: '',
      content: '',
      order: contentBlocks.length + 1,
      metadata: {}
    };
    setContentBlocks([...contentBlocks, newBlock]);
  };

  const updateContentBlock = (id: string, updates: Partial<ContentBlock>) => {
    setContentBlocks(blocks => 
      blocks.map(block => 
        block.id === id ? { ...block, ...updates } : block
      )
    );
  };

  const removeContentBlock = (id: string) => {
    setContentBlocks(blocks => blocks.filter(block => block.id !== id));
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(contentBlocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1
    }));

    setContentBlocks(updatedItems);
  };

  const addQuiz = () => {
    const newQuiz: Quiz = {
      id: Math.random().toString(36).substr(2, 9),
      question: '',
      type: 'multiple_choice',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      points: 1
    };
    setQuizzes([...quizzes, newQuiz]);
  };

  const updateQuiz = (id: string, updates: Partial<Quiz>) => {
    setQuizzes(quizzes => 
      quizzes.map(quiz => 
        quiz.id === id ? { ...quiz, ...updates } : quiz
      )
    );
  };

  const removeQuiz = (id: string) => {
    setQuizzes(quizzes => quizzes.filter(quiz => quiz.id !== id));
  };

  const addFlashcard = () => {
    const newFlashcard: Flashcard = {
      id: Math.random().toString(36).substr(2, 9),
      front: '',
      back: '',
      difficulty: 'medium'
    };
    setFlashcards([...flashcards, newFlashcard]);
  };

  const updateFlashcard = (id: string, updates: Partial<Flashcard>) => {
    setFlashcards(flashcards => 
      flashcards.map(flashcard => 
        flashcard.id === id ? { ...flashcard, ...updates } : flashcard
      )
    );
  };

  const removeFlashcard = (id: string) => {
    setFlashcards(flashcards => flashcards.filter(flashcard => flashcard.id !== id));
  };

  const addKeyPoint = () => {
    const newKeyPoint: KeyPoint = {
      id: Math.random().toString(36).substr(2, 9),
      point: '',
      explanation: '',
      importance: 'medium',
      examples: []
    };
    setKeyPoints([...keyPoints, newKeyPoint]);
  };

  const updateKeyPoint = (id: string, updates: Partial<KeyPoint>) => {
    setKeyPoints(keyPoints => 
      keyPoints.map(keyPoint => 
        keyPoint.id === id ? { ...keyPoint, ...updates } : keyPoint
      )
    );
  };

  const removeKeyPoint = (id: string) => {
    setKeyPoints(keyPoints => keyPoints.filter(keyPoint => keyPoint.id !== id));
  };

  const addMindMapNode = () => {
    const newNode: MindMapNode = {
      id: Math.random().toString(36).substr(2, 9),
      label: '',
      x: Math.random() * 400,
      y: Math.random() * 300,
      children: []
    };
    setMindMap(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));
  };

  const updateMindMapNode = (id: string, updates: Partial<MindMapNode>) => {
    setMindMap(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === id ? { ...node, ...updates } : node
      )
    }));
  };

  const removeMindMapNode = (id: string) => {
    setMindMap(prev => ({
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== id)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lesson editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate(`/instruct/courses/${courseId}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {lessonId === 'new' ? 'Create New Lesson' : 'Edit Lesson'}
              </h1>
              <p className="text-gray-600">{course?.title}</p>
            </div>
          </div>
          <Button onClick={handleSaveLesson} disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Lesson
              </>
            )}
          </Button>
        </div>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
            <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
            <TabsTrigger value="keypoints">Key Points</TabsTrigger>
            <TabsTrigger value="mindmap">Mind Map</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Lesson Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Lesson Title</Label>
                  <Input
                    id="title"
                    value={basicInfo.title}
                    onChange={(e) => setBasicInfo({...basicInfo, title: e.target.value})}
                    placeholder="Enter lesson title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={basicInfo.duration}
                    onChange={(e) => setBasicInfo({...basicInfo, duration: parseInt(e.target.value) || 30})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={basicInfo.description}
                    onChange={(e) => setBasicInfo({...basicInfo, description: e.target.value})}
                    placeholder="Describe what students will learn in this lesson"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="objectives">Learning Objectives</Label>
                  <Textarea
                    id="objectives"
                    value={basicInfo.objectives}
                    onChange={(e) => setBasicInfo({...basicInfo, objectives: e.target.value})}
                    placeholder="List the learning objectives (one per line)"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order">Lesson Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={basicInfo.order}
                    onChange={(e) => setBasicInfo({...basicInfo, order: parseInt(e.target.value) || 1})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="releaseType">Release Type</Label>
                  <Select value={basicInfo.releaseType} onValueChange={(value) => setBasicInfo({...basicInfo, releaseType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="drip">Drip Content</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {basicInfo.releaseType === 'scheduled' && (
                  <div className="space-y-2">
                    <Label htmlFor="scheduledDate">Scheduled Release Date</Label>
                    <Input
                      id="scheduledDate"
                      type="datetime-local"
                      value={basicInfo.scheduledReleaseDate}
                      onChange={(e) => setBasicInfo({...basicInfo, scheduledReleaseDate: e.target.value})}
                    />
                  </div>
                )}

                {basicInfo.releaseType === 'drip' && (
                  <div className="space-y-2">
                    <Label htmlFor="dripDays">Drip Days (after enrollment)</Label>
                    <Input
                      id="dripDays"
                      type="number"
                      value={basicInfo.dripDays}
                      onChange={(e) => setBasicInfo({...basicInfo, dripDays: parseInt(e.target.value) || 0})}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Lesson Content
                  <div className="space-x-2">
                    <Button size="sm" onClick={() => addContentBlock('text')}>
                      <Plus className="h-4 w-4 mr-1" />
                      Text
                    </Button>
                    <Button size="sm" onClick={() => addContentBlock('video')}>
                      <Plus className="h-4 w-4 mr-1" />
                      Video
                    </Button>
                    <Button size="sm" onClick={() => addContentBlock('image')}>
                      <Plus className="h-4 w-4 mr-1" />
                      Image
                    </Button>
                    <Button size="sm" onClick={() => addContentBlock('audio')}>
                      <Plus className="h-4 w-4 mr-1" />
                      Audio
                    </Button>
                    <Button size="sm" onClick={() => addContentBlock('document')}>
                      <Plus className="h-4 w-4 mr-1" />
                      Document
                    </Button>
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
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="border rounded-lg p-4 bg-white"
                              >
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center space-x-2">
                                    <div {...provided.dragHandleProps}>
                                      <GripVertical className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <span className="font-medium uppercase text-sm text-gray-600">
                                      {block.type}
                                    </span>
                                    <span className="text-sm text-gray-500">Block {block.order}</span>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => removeContentBlock(block.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>

                                <div className="space-y-4">
                                  <div>
                                    <Label>Block Title</Label>
                                    <Input
                                      value={block.title}
                                      onChange={(e) => updateContentBlock(block.id, { title: e.target.value })}
                                      placeholder="Enter block title"
                                    />
                                  </div>

                                  {block.type === 'text' && (
                                    <div>
                                      <Label>Content (Markdown supported)</Label>
                                      <RichTextEditor
                                        value={block.content}
                                        onChange={(content) => updateContentBlock(block.id, { content })}
                                        placeholder="Enter your content here..."
                                        height="300px"
                                      />
                                    </div>
                                  )}

                                  {(block.type === 'video' || block.type === 'audio') && (
                                    <>
                                      <div>
                                        <Label>Media URL or Embed Code</Label>
                                        <Input
                                          value={block.metadata?.url || ''}
                                          onChange={(e) => updateContentBlock(block.id, { 
                                            metadata: { ...block.metadata, url: e.target.value } 
                                          })}
                                          placeholder="Enter URL or embed code"
                                        />
                                      </div>
                                      <div>
                                        <Label>Upload File</Label>
                                        <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center">
                                          <Upload className="mx-auto h-8 w-8 mb-2 text-gray-400" />
                                          <p className="text-sm text-gray-600">Upload {block.type} file</p>
                                          <input type="file" accept={block.type === 'video' ? 'video/*' : 'audio/*'} className="hidden" />
                                        </div>
                                      </div>
                                      <div>
                                        <Label>Description</Label>
                                        <Textarea
                                          value={block.content}
                                          onChange={(e) => updateContentBlock(block.id, { content: e.target.value })}
                                          placeholder="Describe this media content"
                                          rows={3}
                                        />
                                      </div>
                                    </>
                                  )}

                                  {block.type === 'image' && (
                                    <>
                                      <div>
                                        <Label>Image URL</Label>
                                        <Input
                                          value={block.metadata?.url || ''}
                                          onChange={(e) => updateContentBlock(block.id, { 
                                            metadata: { ...block.metadata, url: e.target.value } 
                                          })}
                                          placeholder="Enter image URL"
                                        />
                                      </div>
                                      <div>
                                        <Label>Upload Image</Label>
                                        <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center">
                                          <Upload className="mx-auto h-8 w-8 mb-2 text-gray-400" />
                                          <p className="text-sm text-gray-600">Upload image file</p>
                                          <input type="file" accept="image/*" className="hidden" />
                                        </div>
                                      </div>
                                      <div>
                                        <Label>Alt Text / Caption</Label>
                                        <Input
                                          value={block.metadata?.altText || ''}
                                          onChange={(e) => updateContentBlock(block.id, { 
                                            metadata: { ...block.metadata, altText: e.target.value } 
                                          })}
                                          placeholder="Enter alt text or caption"
                                        />
                                      </div>
                                    </>
                                  )}

                                  {block.type === 'document' && (
                                    <>
                                      <div>
                                        <Label>Document Upload</Label>
                                        <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center">
                                          <Upload className="mx-auto h-8 w-8 mb-2 text-gray-400" />
                                          <p className="text-sm text-gray-600">Upload document file</p>
                                          <p className="text-xs text-gray-500">Supports: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX</p>
                                          <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" className="hidden" />
                                        </div>
                                      </div>
                                      <div>
                                        <Label>Description</Label>
                                        <Textarea
                                          value={block.content}
                                          onChange={(e) => updateContentBlock(block.id, { content: e.target.value })}
                                          placeholder="Describe this document"
                                          rows={3}
                                        />
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>

                {contentBlocks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No content blocks yet. Add your first content block above.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quiz">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Quiz Questions
                  <Button onClick={addQuiz}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {quizzes.map((quiz, index) => (
                  <div key={quiz.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Question {index + 1}</h4>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeQuiz(quiz.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Question</Label>
                        <Textarea
                          value={quiz.question}
                          onChange={(e) => updateQuiz(quiz.id, { question: e.target.value })}
                          placeholder="Enter your question"
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label>Question Type</Label>
                        <Select value={quiz.type} onValueChange={(value: any) => updateQuiz(quiz.id, { type: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                            <SelectItem value="true_false">True/False</SelectItem>
                            <SelectItem value="fill_in_blank">Fill in the Blank</SelectItem>
                            <SelectItem value="short_answer">Short Answer</SelectItem>
                            <SelectItem value="essay">Essay</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {quiz.type === 'multiple_choice' && (
                        <div>
                          <Label>Options</Label>
                          <div className="space-y-2">
                            {quiz.options?.map((option, optionIndex) => (
                              <Input
                                key={optionIndex}
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...(quiz.options || [])];
                                  newOptions[optionIndex] = e.target.value;
                                  updateQuiz(quiz.id, { options: newOptions });
                                }}
                                placeholder={`Option ${optionIndex + 1}`}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <Label>Correct Answer</Label>
                        <Input
                          value={quiz.correctAnswer}
                          onChange={(e) => updateQuiz(quiz.id, { correctAnswer: e.target.value })}
                          placeholder="Enter correct answer"
                        />
                      </div>

                      <div>
                        <Label>Explanation</Label>
                        <Textarea
                          value={quiz.explanation}
                          onChange={(e) => updateQuiz(quiz.id, { explanation: e.target.value })}
                          placeholder="Explain why this is the correct answer"
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label>Points</Label>
                        <Input
                          type="number"
                          value={quiz.points}
                          onChange={(e) => updateQuiz(quiz.id, { points: parseInt(e.target.value) || 1 })}
                          min="1"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {quizzes.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No quiz questions yet. Add your first question above.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flashcards">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Flashcards
                  <Button onClick={addFlashcard}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Flashcard
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {flashcards.map((flashcard, index) => (
                  <div key={flashcard.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Flashcard {index + 1}</h4>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeFlashcard(flashcard.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Front (Question/Term)</Label>
                        <Textarea
                          value={flashcard.front}
                          onChange={(e) => updateFlashcard(flashcard.id, { front: e.target.value })}
                          placeholder="Enter question or term"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>Back (Answer/Definition)</Label>
                        <Textarea
                          value={flashcard.back}
                          onChange={(e) => updateFlashcard(flashcard.id, { back: e.target.value })}
                          placeholder="Enter answer or definition"
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <Label>Difficulty</Label>
                        <Select value={flashcard.difficulty} onValueChange={(value: any) => updateFlashcard(flashcard.id, { difficulty: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Hint (Optional)</Label>
                        <Input
                          value={flashcard.hint || ''}
                          onChange={(e) => updateFlashcard(flashcard.id, { hint: e.target.value })}
                          placeholder="Enter hint"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {flashcards.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No flashcards yet. Add your first flashcard above.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keypoints">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Key Points
                  <Button onClick={addKeyPoint}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Key Point
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {keyPoints.map((keyPoint, index) => (
                  <div key={keyPoint.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Key Point {index + 1}</h4>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeKeyPoint(keyPoint.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Key Point</Label>
                        <Input
                          value={keyPoint.point}
                          onChange={(e) => updateKeyPoint(keyPoint.id, { point: e.target.value })}
                          placeholder="Enter key point"
                        />
                      </div>

                      <div>
                        <Label>Explanation</Label>
                        <Textarea
                          value={keyPoint.explanation}
                          onChange={(e) => updateKeyPoint(keyPoint.id, { explanation: e.target.value })}
                          placeholder="Explain this key point"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label>Importance</Label>
                        <Select value={keyPoint.importance} onValueChange={(value: any) => updateKeyPoint(keyPoint.id, { importance: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Examples (Optional)</Label>
                        <Textarea
                          value={keyPoint.examples.join('\n')}
                          onChange={(e) => updateKeyPoint(keyPoint.id, { examples: e.target.value.split('\n').filter(ex => ex.trim()) })}
                          placeholder="Enter examples (one per line)"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {keyPoints.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No key points yet. Add your first key point above.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mindmap">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Mind Map
                  <Button onClick={addMindMapNode}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Node
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Mind Map Title</Label>
                  <Input
                    value={mindMap.title}
                    onChange={(e) => setMindMap(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter mind map title"
                  />
                </div>

                <div className="space-y-4">
                  {mindMap.nodes.map((node, index) => (
                    <div key={node.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Node {index + 1}</h4>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeMindMapNode(node.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div>
                        <Label>Node Label</Label>
                        <Input
                          value={node.label}
                          onChange={(e) => updateMindMapNode(node.id, { label: e.target.value })}
                          placeholder="Enter node label"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {mindMap.nodes.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No mind map nodes yet. Add your first node above.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LessonEditor;

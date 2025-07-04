
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Save, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  FileText,
  Video,
  Image,
  Headphones,
  Code,
  Upload,
  Eye,
  Calendar,
  Clock,
  Users,
  BookOpen,
  Brain,
  Lightbulb,
  Map,
  GripVertical
} from 'lucide-react';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface ContentBlock {
  id: string;
  type: 'rich_text' | 'video' | 'image' | 'audio' | 'pdf' | 'html';
  title: string;
  content: string;
  order: number;
  mediaUrl?: string;
  duration?: number;
  metadata?: any;
}

interface Question {
  id: string;
  question: string;
  type: 'multiple_choice' | 'short_answer' | 'fill_in_blank' | 'essay' | 'true_false';
  options: string[];
  correct_answer: string;
  explanation: string;
  points: number;
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hint: string;
  explanation: string;
}

interface KeyPoint {
  id: string;
  point: string;
  explanation: string;
  importance: 'low' | 'medium' | 'high';
  category: string;
  examples: string;
}

const LessonEditor = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Lesson basic info
  const [lesson, setLesson] = useState({
    title: '',
    description: '',
    objectives: '',
    duration: 30,
    order: 1,
    isRequired: true,
    prerequisiteLessons: [] as string[],
    releaseType: 'immediate',
    scheduledReleaseDate: '',
    dripDays: 0
  });

  // Content blocks
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  
  // Quiz data
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    instructions: '',
    passingScore: 70,
    timeLimit: 30,
    attempts: 3,
    shuffleQuestions: false
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  
  // Flashcards
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  
  // Key points
  const [keyPoints, setKeyPoints] = useState<KeyPoint[]>([]);
  
  // Mind map
  const [mindMap, setMindMap] = useState({
    title: '',
    data: ''
  });

  // Available lessons for prerequisites
  const [availableLessons, setAvailableLessons] = useState<any[]>([]);
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (courseId) {
      loadLessonData();
      loadAvailableLessons();
    }
  }, [courseId, lessonId]);

  const loadLessonData = async () => {
    if (!lessonId) return; // New lesson

    try {
      setLoading(true);
      
      const [lessonData, contentsData, quizData, flashcardsData, keyPointsData, mindMapData] = await Promise.all([
        db.getItem('lessons', lessonId),
        db.queryBuilder('lessonContents').where((c: any) => c.lessonId === lessonId).sort('order', 'asc').exec(),
        db.queryBuilder('quizzes').where((q: any) => q.lessonId === lessonId).exec(),
        db.queryBuilder('flashcards').where((f: any) => f.lessonId === lessonId).sort('order', 'asc').exec(),
        db.queryBuilder('keyPoints').where((k: any) => k.lessonId === lessonId).sort('order', 'asc').exec(),
        db.queryBuilder('mindMaps').where((m: any) => m.lessonId === lessonId).exec()
      ]);

      if (lessonData) {
        setLesson({
          title: lessonData.title || '',
          description: lessonData.description || '',
          objectives: lessonData.objectives || '',
          duration: lessonData.duration || 30,
          order: lessonData.order || 1,
          isRequired: lessonData.isRequired !== false,
          prerequisiteLessons: JSON.parse(lessonData.prerequisiteLessons || '[]'),
          releaseType: lessonData.releaseType || 'immediate',
          scheduledReleaseDate: lessonData.scheduledReleaseDate || '',
          dripDays: lessonData.dripDays || 0
        });
      }

      // Load content blocks
      const blocks: ContentBlock[] = contentsData.map((content: any) => ({
        id: content.id,
        type: content.type,
        title: content.title || '',
        content: content.content || '',
        order: content.order,
        mediaUrl: content.mediaUrl,
        duration: content.duration,
        metadata: content.metadata ? JSON.parse(content.metadata) : {}
      }));
      setContentBlocks(blocks);

      // Load quiz
      if (quizData.length > 0) {
        const quizItem = quizData[0];
        setQuiz({
          title: quizItem.title || '',
          description: quizItem.description || '',
          instructions: quizItem.instructions || '',
          passingScore: quizItem.passingScore || 70,
          timeLimit: quizItem.timeLimit || 30,
          attempts: quizItem.attempts || 3,
          shuffleQuestions: quizItem.shuffleQuestions || false
        });
        
        const parsedQuestions = JSON.parse(quizItem.questions || '[]');
        setQuestions(parsedQuestions.map((q: any, index: number) => ({
          id: q.id || `q_${index}`,
          ...q
        })));
      }

      // Load flashcards
      const cards: Flashcard[] = flashcardsData.map((card: any) => ({
        id: card.id,
        front: card.front || '',
        back: card.back || '',
        difficulty: card.difficulty || 'medium',
        hint: card.hint || '',
        explanation: card.explanation || ''
      }));
      setFlashcards(cards);

      // Load key points
      const points: KeyPoint[] = keyPointsData.map((point: any) => ({
        id: point.id,
        point: point.point || '',
        explanation: point.explanation || '',
        importance: point.importance || 'medium',
        category: point.category || 'general',
        examples: point.examples || ''
      }));
      setKeyPoints(points);

      // Load mind map
      if (mindMapData.length > 0) {
        setMindMap({
          title: mindMapData[0].title || '',
          data: mindMapData[0].data || ''
        });
      }

    } catch (error) {
      console.error('Error loading lesson:', error);
      toast({
        title: 'Error',
        description: 'Failed to load lesson data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableLessons = async () => {
    try {
      const lessons = await db.queryBuilder('lessons')
        .where((l: any) => l.courseId === courseId && l.id !== lessonId)
        .sort('order', 'asc')
        .exec();
      setAvailableLessons(lessons);
    } catch (error) {
      console.error('Error loading available lessons:', error);
    }
  };

  const saveLesson = async () => {
    if (!user || !courseId) return;

    try {
      setSaving(true);

      const lessonData = {
        courseId,
        title: lesson.title,
        description: lesson.description,
        objectives: lesson.objectives,
        duration: lesson.duration,
        order: lesson.order,
        type: 'mixed',
        isRequired: lesson.isRequired,
        prerequisiteLessons: JSON.stringify(lesson.prerequisiteLessons),
        releaseType: lesson.releaseType,
        scheduledReleaseDate: lesson.scheduledReleaseDate || null,
        dripDays: lesson.dripDays,
        isPublished: true,
        updatedAt: new Date().toISOString()
      };

      let savedLesson;
      if (lessonId) {
        savedLesson = await db.update('lessons', lessonId, lessonData);
        savedLesson.id = lessonId;
      } else {
        savedLesson = await db.insert('lessons', lessonData);
        // Redirect to edit mode
        navigate(`/instruct/courses/${courseId}/lessons/${savedLesson.id}/edit`, { replace: true });
      }

      // Save content blocks
      for (const block of contentBlocks) {
        const contentData = {
          lessonId: savedLesson.id,
          type: block.type,
          title: block.title,
          content: block.content,
          order: block.order,
          mediaUrl: block.mediaUrl,
          duration: block.duration,
          metadata: JSON.stringify(block.metadata || {}),
          isRequired: true
        };

        if (block.id.startsWith('new_')) {
          await db.insert('lessonContents', contentData);
        } else {
          await db.update('lessonContents', block.id, contentData);
        }
      }

      // Save quiz if has questions
      if (questions.length > 0) {
        const quizData = {
          lessonId: savedLesson.id,
          courseId,
          title: quiz.title || 'Lesson Quiz',
          description: quiz.description,
          instructions: quiz.instructions,
          questions: JSON.stringify(questions),
          totalQuestions: questions.length,
          passingScore: quiz.passingScore,
          timeLimit: quiz.timeLimit,
          attempts: quiz.attempts,
          shuffleQuestions: quiz.shuffleQuestions,
          isActive: true
        };

        const existingQuiz = await db.queryBuilder('quizzes')
          .where((q: any) => q.lessonId === savedLesson.id)
          .exec();

        if (existingQuiz.length > 0) {
          await db.update('quizzes', existingQuiz[0].id, quizData);
        } else {
          await db.insert('quizzes', quizData);
        }
      }

      // Save flashcards
      for (let i = 0; i < flashcards.length; i++) {
        const card = flashcards[i];
        const cardData = {
          lessonId: savedLesson.id,
          courseId,
          front: card.front,
          back: card.back,
          difficulty: card.difficulty,
          hint: card.hint,
          explanation: card.explanation,
          order: i + 1
        };

        if (card.id.startsWith('new_')) {
          await db.insert('flashcards', cardData);
        } else {
          await db.update('flashcards', card.id, cardData);
        }
      }

      // Save key points
      for (let i = 0; i < keyPoints.length; i++) {
        const point = keyPoints[i];
        const pointData = {
          lessonId: savedLesson.id,
          courseId,
          point: point.point,
          explanation: point.explanation,
          importance: point.importance,
          category: point.category,
          examples: point.examples,
          order: i + 1
        };

        if (point.id.startsWith('new_')) {
          await db.insert('keyPoints', pointData);
        } else {
          await db.update('keyPoints', point.id, pointData);
        }
      }

      // Save mind map
      if (mindMap.title || mindMap.data) {
        const mindMapData = {
          lessonId: savedLesson.id,
          courseId,
          title: mindMap.title || 'Lesson Mind Map',
          data: mindMap.data,
          nodeCount: 0,
          connections: '[]'
        };

        const existingMindMap = await db.queryBuilder('mindMaps')
          .where((m: any) => m.lessonId === savedLesson.id)
          .exec();

        if (existingMindMap.length > 0) {
          await db.update('mindMaps', existingMindMap[0].id, mindMapData);
        } else {
          await db.insert('mindMaps', mindMapData);
        }
      }

      toast({
        title: 'Success',
        description: 'Lesson saved successfully',
      });

    } catch (error) {
      console.error('Error saving lesson:', error);
      toast({
        title: 'Error',
        description: 'Failed to save lesson',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const addContentBlock = (type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: `new_${Date.now()}`,
      type,
      title: '',
      content: '',
      order: contentBlocks.length + 1
    };
    setContentBlocks([...contentBlocks, newBlock]);
  };

  const updateContentBlock = (index: number, field: keyof ContentBlock, value: any) => {
    const updated = [...contentBlocks];
    updated[index] = { ...updated[index], [field]: value };
    setContentBlocks(updated);
  };

  const removeContentBlock = (index: number) => {
    const updated = contentBlocks.filter((_, i) => i !== index);
    setContentBlocks(updated);
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `new_q_${Date.now()}`,
      question: '',
      type: 'multiple_choice',
      options: ['', '', '', ''],
      correct_answer: '',
      explanation: '',
      points: 1
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  const addFlashcard = () => {
    const newCard: Flashcard = {
      id: `new_f_${Date.now()}`,
      front: '',
      back: '',
      difficulty: 'medium',
      hint: '',
      explanation: ''
    };
    setFlashcards([...flashcards, newCard]);
  };

  const updateFlashcard = (index: number, field: keyof Flashcard, value: any) => {
    const updated = [...flashcards];
    updated[index] = { ...updated[index], [field]: value };
    setFlashcards(updated);
  };

  const removeFlashcard = (index: number) => {
    const updated = flashcards.filter((_, i) => i !== index);
    setFlashcards(updated);
  };

  const addKeyPoint = () => {
    const newPoint: KeyPoint = {
      id: `new_k_${Date.now()}`,
      point: '',
      explanation: '',
      importance: 'medium',
      category: 'general',
      examples: ''
    };
    setKeyPoints([...keyPoints, newPoint]);
  };

  const updateKeyPoint = (index: number, field: keyof KeyPoint, value: any) => {
    const updated = [...keyPoints];
    updated[index] = { ...updated[index], [field]: value };
    setKeyPoints(updated);
  };

  const removeKeyPoint = (index: number) => {
    const updated = keyPoints.filter((_, i) => i !== index);
    setKeyPoints(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate(`/instruct/courses/${courseId}/edit`)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Course
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {lessonId ? 'Edit Lesson' : 'Create New Lesson'}
                </h1>
                <p className="text-gray-600">
                  Build comprehensive lesson content with multiple learning materials
                </p>
              </div>
            </div>
            
            <Button onClick={saveLesson} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Lesson'}
            </Button>
          </div>
        </div>

        {/* Lesson Editor */}
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
            <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
            <TabsTrigger value="keypoints">Key Points</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Lesson Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Lesson Title</Label>
                    <Input
                      id="title"
                      value={lesson.title}
                      onChange={(e) => setLesson(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter lesson title"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={lesson.duration}
                      onChange={(e) => setLesson(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={lesson.description}
                    onChange={(e) => setLesson(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the lesson"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="objectives">Learning Objectives</Label>
                  <Textarea
                    id="objectives"
                    value={lesson.objectives}
                    onChange={(e) => setLesson(prev => ({ ...prev, objectives: e.target.value }))}
                    placeholder="What will students learn in this lesson?"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="order">Lesson Order</Label>
                    <Input
                      id="order"
                      type="number"
                      value={lesson.order}
                      onChange={(e) => setLesson(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                      min="1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="releaseType">Release Type</Label>
                    <Select
                      value={lesson.releaseType}
                      onValueChange={(value) => setLesson(prev => ({ ...prev, releaseType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="drip">Drip Release</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {lesson.releaseType === 'scheduled' && (
                  <div>
                    <Label htmlFor="releaseDate">Release Date</Label>
                    <Input
                      id="releaseDate"
                      type="datetime-local"
                      value={lesson.scheduledReleaseDate}
                      onChange={(e) => setLesson(prev => ({ ...prev, scheduledReleaseDate: e.target.value }))}
                    />
                  </div>
                )}

                {lesson.releaseType === 'drip' && (
                  <div>
                    <Label htmlFor="dripDays">Days After Enrollment</Label>
                    <Input
                      id="dripDays"
                      type="number"
                      value={lesson.dripDays}
                      onChange={(e) => setLesson(prev => ({ ...prev, dripDays: parseInt(e.target.value) || 0 }))}
                      min="0"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Lesson Content</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => addContentBlock('rich_text')}>
                      <FileText className="h-4 w-4 mr-1" />
                      Text
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addContentBlock('video')}>
                      <Video className="h-4 w-4 mr-1" />
                      Video
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addContentBlock('image')}>
                      <Image className="h-4 w-4 mr-1" />
                      Image
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addContentBlock('audio')}>
                      <Headphones className="h-4 w-4 mr-1" />
                      Audio
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {contentBlocks.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No content blocks yet</h3>
                    <p className="text-gray-600 mb-4">Add different types of content to make your lesson engaging</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contentBlocks.map((block, index) => (
                      <Card key={block.id} className="border-l-4 border-l-blue-600">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <GripVertical className="h-4 w-4 text-gray-400" />
                              <Badge variant="outline">
                                {block.type.replace('_', ' ').toUpperCase()}
                              </Badge>
                              <span className="text-sm text-gray-600">Block {index + 1}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeContentBlock(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <Label>Block Title</Label>
                              <Input
                                value={block.title}
                                onChange={(e) => updateContentBlock(index, 'title', e.target.value)}
                                placeholder="Content block title"
                              />
                            </div>

                            {block.type === 'rich_text' && (
                              <div>
                                <Label>Content (Markdown supported)</Label>
                                <Textarea
                                  value={block.content}
                                  onChange={(e) => updateContentBlock(index, 'content', e.target.value)}
                                  placeholder="Enter your content here. You can use Markdown formatting."
                                  rows={8}
                                />
                              </div>
                            )}

                            {(block.type === 'video' || block.type === 'audio') && (
                              <>
                                <div>
                                  <Label>Media URL or Embed Code</Label>
                                  <Input
                                    value={block.mediaUrl || ''}
                                    onChange={(e) => updateContentBlock(index, 'mediaUrl', e.target.value)}
                                    placeholder="YouTube URL, Vimeo URL, or embed code"
                                  />
                                </div>
                                <div>
                                  <Label>Description</Label>
                                  <Textarea
                                    value={block.content}
                                    onChange={(e) => updateContentBlock(index, 'content', e.target.value)}
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
                                    value={block.mediaUrl || ''}
                                    onChange={(e) => updateContentBlock(index, 'mediaUrl', e.target.value)}
                                    placeholder="Image URL"
                                  />
                                </div>
                                <div>
                                  <Label>Alt Text / Caption</Label>
                                  <Input
                                    value={block.content}
                                    onChange={(e) => updateContentBlock(index, 'content', e.target.value)}
                                    placeholder="Image description or caption"
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quiz" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Lesson Quiz</CardTitle>
                  <Button onClick={addQuestion}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Question
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quizTitle">Quiz Title</Label>
                    <Input
                      id="quizTitle"
                      value={quiz.title}
                      onChange={(e) => setQuiz(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Quiz title"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="passingScore">Passing Score (%)</Label>
                    <Input
                      id="passingScore"
                      type="number"
                      value={quiz.passingScore}
                      onChange={(e) => setQuiz(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 70 }))}
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={quiz.instructions}
                    onChange={(e) => setQuiz(prev => ({ ...prev, instructions: e.target.value }))}
                    placeholder="Quiz instructions for students"
                    rows={3}
                  />
                </div>

                {questions.map((question, index) => (
                  <Card key={question.id} className="border-l-4 border-l-green-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Question {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label>Question</Label>
                          <Textarea
                            value={question.question}
                            onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                            placeholder="Enter your question"
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Question Type</Label>
                            <Select
                              value={question.type}
                              onValueChange={(value) => updateQuestion(index, 'type', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                <SelectItem value="short_answer">Short Answer</SelectItem>
                                <SelectItem value="fill_in_blank">Fill in the Blank</SelectItem>
                                <SelectItem value="essay">Essay</SelectItem>
                                <SelectItem value="true_false">True/False</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Points</Label>
                            <Input
                              type="number"
                              value={question.points}
                              onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value) || 1)}
                              min="1"
                            />
                          </div>
                        </div>

                        {question.type === 'multiple_choice' && (
                          <div>
                            <Label>Options</Label>
                            <div className="space-y-2">
                              {question.options.map((option, optionIndex) => (
                                <Input
                                  key={optionIndex}
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...question.options];
                                    newOptions[optionIndex] = e.target.value;
                                    updateQuestion(index, 'options', newOptions);
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
                            value={question.correct_answer}
                            onChange={(e) => updateQuestion(index, 'correct_answer', e.target.value)}
                            placeholder="Enter the correct answer"
                          />
                        </div>

                        <div>
                          <Label>Explanation</Label>
                          <Textarea
                            value={question.explanation}
                            onChange={(e) => updateQuestion(index, 'explanation', e.target.value)}
                            placeholder="Explain why this is the correct answer"
                            rows={3}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flashcards" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Flashcards</CardTitle>
                  <Button onClick={addFlashcard}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Flashcard
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {flashcards.map((card, index) => (
                  <Card key={card.id} className="mb-4 border-l-4 border-l-yellow-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Flashcard {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFlashcard(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Front</Label>
                          <Textarea
                            value={card.front}
                            onChange={(e) => updateFlashcard(index, 'front', e.target.value)}
                            placeholder="Question or term"
                            rows={3}
                          />
                        </div>

                        <div>
                          <Label>Back</Label>
                          <Textarea
                            value={card.back}
                            onChange={(e) => updateFlashcard(index, 'back', e.target.value)}
                            placeholder="Answer or definition"
                            rows={3}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <Label>Difficulty</Label>
                          <Select
                            value={card.difficulty}
                            onValueChange={(value) => updateFlashcard(index, 'difficulty', value)}
                          >
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
                            value={card.hint}
                            onChange={(e) => updateFlashcard(index, 'hint', e.target.value)}
                            placeholder="Helpful hint"
                          />
                        </div>

                        <div>
                          <Label>Explanation (Optional)</Label>
                          <Input
                            value={card.explanation}
                            onChange={(e) => updateFlashcard(index, 'explanation', e.target.value)}
                            placeholder="Additional explanation"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keypoints" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Key Points</CardTitle>
                  <Button onClick={addKeyPoint}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Key Point
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {keyPoints.map((point, index) => (
                  <Card key={point.id} className="mb-4 border-l-4 border-l-purple-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Key Point {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeKeyPoint(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label>Key Point</Label>
                          <Input
                            value={point.point}
                            onChange={(e) => updateKeyPoint(index, 'point', e.target.value)}
                            placeholder="Main point or concept"
                          />
                        </div>

                        <div>
                          <Label>Explanation</Label>
                          <Textarea
                            value={point.explanation}
                            onChange={(e) => updateKeyPoint(index, 'explanation', e.target.value)}
                            placeholder="Detailed explanation"
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Importance</Label>
                            <Select
                              value={point.importance}
                              onValueChange={(value) => updateKeyPoint(index, 'importance', value)}
                            >
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
                            <Label>Category</Label>
                            <Input
                              value={point.category}
                              onChange={(e) => updateKeyPoint(index, 'category', e.target.value)}
                              placeholder="Category or topic"
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Examples (Optional)</Label>
                          <Textarea
                            value={point.examples}
                            onChange={(e) => updateKeyPoint(index, 'examples', e.target.value)}
                            placeholder="Examples or use cases"
                            rows={2}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LessonEditor;

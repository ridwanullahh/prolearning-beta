
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';
import { ChevronLeft, ChevronRight, BookOpen, Brain, Key, Map, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface LessonViewerProps {
  lessonId: string;
  courseId: string;
  onNext?: () => void;
  onPrevious?: () => void;
}

interface ContentBlock {
  id: string;
  type: 'text' | 'video' | 'image' | 'audio' | 'document';
  title: string;
  content: string;
  order: number;
  metadata: any;
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

const EnhancedLessonViewer = ({ lessonId, courseId, onNext, onPrevious }: LessonViewerProps) => {
  const [lesson, setLesson] = useState<any>(null);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [keyPoints, setKeyPoints] = useState<KeyPoint[]>([]);
  const [mindMap, setMindMap] = useState<{ title: string; nodes: MindMapNode[] }>({ title: '', nodes: [] });
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'content' | 'quiz' | 'flashcards' | 'keypoints' | 'mindmap'>('content');
  
  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  
  // Flashcard state
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [showFlashcardBack, setShowFlashcardBack] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    loadLessonData();
  }, [lessonId]);

  const loadLessonData = async () => {
    try {
      const user = authService.getCurrentUser();
      if (!user) return;

      // Load lesson
      const lessonData = await db.getItem('lessons', lessonId);
      if (!lessonData) {
        toast({
          title: "Error",
          description: "Lesson not found",
          variant: "destructive"
        });
        return;
      }

      // Check if lesson is accessible (drip content logic)
      const enrollment = await db.queryBuilder('enrollments')
        .where(e => e.userId === user.id && e.courseId === courseId)
        .first();

      if (!enrollment) {
        toast({
          title: "Access Denied",
          description: "You are not enrolled in this course",
          variant: "destructive"
        });
        return;
      }

      // Check drip content restrictions
      if (lessonData.releaseType === 'scheduled' && lessonData.scheduledReleaseDate) {
        const releaseDate = new Date(lessonData.scheduledReleaseDate);
        if (new Date() < releaseDate) {
          toast({
            title: "Lesson Not Available",
            description: `This lesson will be available on ${releaseDate.toLocaleDateString()}`,
            variant: "destructive"
          });
          return;
        }
      }

      if (lessonData.releaseType === 'drip' && lessonData.dripDays > 0) {
        const enrollmentDate = new Date(enrollment.enrolledAt);
        const availableDate = new Date(enrollmentDate.getTime() + (lessonData.dripDays * 24 * 60 * 60 * 1000));
        if (new Date() < availableDate) {
          toast({
            title: "Lesson Not Available",
            description: `This lesson will be available on ${availableDate.toLocaleDateString()}`,
            variant: "destructive"
          });
          return;
        }
      }

      setLesson(lessonData);

      // Load content blocks
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

    } catch (error) {
      console.error('Error loading lesson data:', error);
      toast({
        title: "Error",
        description: "Failed to load lesson data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSubmit = () => {
    let correctAnswers = 0;
    quizzes.forEach(quiz => {
      const userAnswer = quizAnswers[quiz.id];
      if (userAnswer && userAnswer.toLowerCase().trim() === quiz.correctAnswer.toLowerCase().trim()) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / quizzes.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);

    // Save quiz attempt
    const user = authService.getCurrentUser();
    if (user) {
      db.insert('quizAttempts', {
        userId: user.id,
        lessonId,
        courseId,
        score,
        answers: JSON.stringify(quizAnswers),
        submittedAt: new Date().toISOString()
      });
    }

    toast({
      title: "Quiz Submitted",
      description: `You scored ${score}% (${correctAnswers}/${quizzes.length} correct)`,
      variant: score >= 70 ? "default" : "destructive"
    });
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  const nextFlashcard = () => {
    setCurrentFlashcard((prev) => (prev + 1) % flashcards.length);
    setShowFlashcardBack(false);
  };

  const previousFlashcard = () => {
    setCurrentFlashcard((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    setShowFlashcardBack(false);
  };

  const renderContentBlock = (block: ContentBlock) => {
    switch (block.type) {
      case 'text':
        return (
          <div className="prose max-w-none">
            <ReactMarkdown>{block.content}</ReactMarkdown>
          </div>
        );

      case 'video':
        return (
          <div>
            {block.metadata?.url && (
              <div className="aspect-video bg-gray-100 rounded-lg mb-4">
                {block.metadata.url.includes('youtube.com') || block.metadata.url.includes('youtu.be') ? (
                  <iframe
                    src={block.metadata.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                    className="w-full h-full rounded-lg"
                    allowFullScreen
                  />
                ) : (
                  <video src={block.metadata.url} controls className="w-full h-full rounded-lg" />
                )}
              </div>
            )}
            {block.content && (
              <div className="text-gray-600">
                <ReactMarkdown>{block.content}</ReactMarkdown>
              </div>
            )}
          </div>
        );

      case 'image':
        return (
          <div>
            {block.metadata?.url && (
              <img
                src={block.metadata.url}
                alt={block.metadata?.altText || block.title}
                className="w-full rounded-lg mb-4"
              />
            )}
            {block.metadata?.altText && (
              <p className="text-sm text-gray-600 italic">{block.metadata.altText}</p>
            )}
          </div>
        );

      case 'audio':
        return (
          <div>
            {block.metadata?.url && (
              <audio src={block.metadata.url} controls className="w-full mb-4" />
            )}
            {block.content && (
              <div className="text-gray-600">
                <ReactMarkdown>{block.content}</ReactMarkdown>
              </div>
            )}
          </div>
        );

      case 'document':
        return (
          <div className="border rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span className="font-medium">{block.title}</span>
            </div>
            {block.content && (
              <p className="text-gray-600 mb-4">{block.content}</p>
            )}
            {block.metadata?.url && (
              <Button variant="outline" asChild>
                <a href={block.metadata.url} target="_blank" rel="noopener noreferrer">
                  Download Document
                </a>
              </Button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderQuiz = () => {
    if (quizzes.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Brain className="mx-auto h-12 w-12 mb-4" />
          <p>No quiz available for this lesson.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Lesson Quiz</h3>
          {quizSubmitted && (
            <div className="flex items-center space-x-4">
              <Badge variant={quizScore >= 70 ? "default" : "destructive"}>
                Score: {quizScore}%
              </Badge>
              <Button size="sm" onClick={resetQuiz}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake
              </Button>
            </div>
          )}
        </div>

        {quizzes.map((quiz, index) => (
          <Card key={quiz.id}>
            <CardHeader>
              <CardTitle className="text-lg">
                Question {index + 1}
                {quizSubmitted && (
                  <span className="ml-2">
                    {quizAnswers[quiz.id]?.toLowerCase().trim() === quiz.correctAnswer.toLowerCase().trim() ? (
                      <CheckCircle className="inline h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="inline h-5 w-5 text-red-600" />
                    )}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-800">{quiz.question}</p>

              {quiz.type === 'multiple_choice' && (
                <RadioGroup
                  value={quizAnswers[quiz.id] || ''}
                  onValueChange={(value) => setQuizAnswers(prev => ({ ...prev, [quiz.id]: value }))}
                  disabled={quizSubmitted}
                >
                  {quiz.options?.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`${quiz.id}-${optionIndex}`} />
                      <Label htmlFor={`${quiz.id}-${optionIndex}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {quiz.type === 'true_false' && (
                <RadioGroup
                  value={quizAnswers[quiz.id] || ''}
                  onValueChange={(value) => setQuizAnswers(prev => ({ ...prev, [quiz.id]: value }))}
                  disabled={quizSubmitted}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="True" id={`${quiz.id}-true`} />
                    <Label htmlFor={`${quiz.id}-true`}>True</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="False" id={`${quiz.id}-false`} />
                    <Label htmlFor={`${quiz.id}-false`}>False</Label>
                  </div>
                </RadioGroup>
              )}

              {(quiz.type === 'fill_in_blank' || quiz.type === 'short_answer') && (
                <Input
                  value={quizAnswers[quiz.id] || ''}
                  onChange={(e) => setQuizAnswers(prev => ({ ...prev, [quiz.id]: e.target.value }))}
                  placeholder="Enter your answer"
                  disabled={quizSubmitted}
                />
              )}

              {quiz.type === 'essay' && (
                <Textarea
                  value={quizAnswers[quiz.id] || ''}
                  onChange={(e) => setQuizAnswers(prev => ({ ...prev, [quiz.id]: e.target.value }))}
                  placeholder="Enter your essay response"
                  rows={5}
                  disabled={quizSubmitted}
                />
              )}

              {quizSubmitted && quiz.explanation && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-900">Explanation:</p>
                  <p className="text-blue-800">{quiz.explanation}</p>
                  <p className="text-sm text-blue-700 mt-2">
                    <strong>Correct Answer:</strong> {quiz.correctAnswer}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {!quizSubmitted && (
          <Button onClick={handleQuizSubmit} className="w-full">
            Submit Quiz
          </Button>
        )}
      </div>
    );
  };

  const renderFlashcards = () => {
    if (flashcards.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Brain className="mx-auto h-12 w-12 mb-4" />
          <p>No flashcards available for this lesson.</p>
        </div>
      );
    }

    const currentCard = flashcards[currentFlashcard];

    return (
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Flashcards</h3>
          <span className="text-sm text-gray-600">
            {currentFlashcard + 1} of {flashcards.length}
          </span>
        </div>

        <Card className="min-h-[300px] cursor-pointer" onClick={() => setShowFlashcardBack(!showFlashcardBack)}>
          <CardContent className="flex items-center justify-center h-full p-8">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-4">
                {showFlashcardBack ? 'Back' : 'Front'} - Click to flip
              </div>
              <div className="text-lg">
                {showFlashcardBack ? currentCard.back : currentCard.front}
              </div>
              {!showFlashcardBack && currentCard.hint && (
                <div className="mt-4 text-sm text-gray-600 italic">
                  Hint: {currentCard.hint}
                </div>
              )}
              <Badge variant="outline" className="mt-4">
                {currentCard.difficulty}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={previousFlashcard} disabled={flashcards.length <= 1}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button variant="outline" onClick={nextFlashcard} disabled={flashcards.length <= 1}>
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  };

  const renderKeyPoints = () => {
    if (keyPoints.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Key className="mx-auto h-12 w-12 mb-4" />
          <p>No key points available for this lesson.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Key Points</h3>
        {keyPoints.map((keyPoint, index) => (
          <Card key={keyPoint.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-lg">{keyPoint.point}</h4>
                <Badge variant={
                  keyPoint.importance === 'high' ? 'destructive' : 
                  keyPoint.importance === 'medium' ? 'default' : 'secondary'
                }>
                  {keyPoint.importance}
                </Badge>
              </div>
              <p className="text-gray-600 mb-4">{keyPoint.explanation}</p>
              {keyPoint.examples.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2">Examples:</h5>
                  <ul className="list-disc list-inside space-y-1">
                    {keyPoint.examples.map((example, idx) => (
                      <li key={idx} className="text-gray-600">{example}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderMindMap = () => {
    if (mindMap.nodes.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Map className="mx-auto h-12 w-12 mb-4" />
          <p>No mind map available for this lesson.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">{mindMap.title}</h3>
        <div className="border rounded-lg p-8" style={{ minHeight: '400px', position: 'relative' }}>
          {mindMap.nodes.map((node) => (
            <div
              key={node.id}
              className="absolute bg-blue-100 border border-blue-300 rounded-lg p-2 text-sm"
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {node.label}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Lesson not found or not accessible.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{lesson.title}</h2>
          <p className="text-gray-600">{lesson.description}</p>
        </div>
        <div className="flex space-x-2">
          {onPrevious && (
            <Button variant="outline" onClick={onPrevious}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
          )}
          {onNext && (
            <Button onClick={onNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex space-x-2 mb-6">
        <Button
          variant={currentView === 'content' ? 'default' : 'outline'}
          onClick={() => setCurrentView('content')}
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Content
        </Button>
        {quizzes.length > 0 && (
          <Button
            variant={currentView === 'quiz' ? 'default' : 'outline'}
            onClick={() => setCurrentView('quiz')}
          >
            <Brain className="h-4 w-4 mr-2" />
            Quiz
          </Button>
        )}
        {flashcards.length > 0 && (
          <Button
            variant={currentView === 'flashcards' ? 'default' : 'outline'}
            onClick={() => setCurrentView('flashcards')}
          >
            <Brain className="h-4 w-4 mr-2" />
            Flashcards
          </Button>
        )}
        {keyPoints.length > 0 && (
          <Button
            variant={currentView === 'keypoints' ? 'default' : 'outline'}
            onClick={() => setCurrentView('keypoints')}
          >
            <Key className="h-4 w-4 mr-2" />
            Key Points
          </Button>
        )}
        {mindMap.nodes.length > 0 && (
          <Button
            variant={currentView === 'mindmap' ? 'default' : 'outline'}
            onClick={() => setCurrentView('mindmap')}
          >
            <Map className="h-4 w-4 mr-2" />
            Mind Map
          </Button>
        )}
      </div>

      <div>
        {currentView === 'content' && (
          <div className="space-y-6">
            {contentBlocks.map((block) => (
              <Card key={block.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{block.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderContentBlock(block)}
                </CardContent>
              </Card>
            ))}
            {contentBlocks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="mx-auto h-12 w-12 mb-4" />
                <p>No content available for this lesson.</p>
              </div>
            )}
          </div>
        )}

        {currentView === 'quiz' && renderQuiz()}
        {currentView === 'flashcards' && renderFlashcards()}
        {currentView === 'keypoints' && renderKeyPoints()}
        {currentView === 'mindmap' && renderMindMap()}
      </div>
    </div>
  );
};

export default EnhancedLessonViewer;

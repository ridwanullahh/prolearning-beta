
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight,
  BookOpen,
  Brain,
  Lightbulb,
  HelpCircle,
  Download,
  FileText,
  Video,
  Image as ImageIcon,
  Volume2
} from 'lucide-react';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';
import ReactMarkdown from 'react-markdown';

interface EnhancedLessonViewerProps {
  lessonId: string;
  courseId: string;
  onComplete?: () => void | Promise<void>;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

const EnhancedLessonViewer = ({
  lessonId,
  courseId,
  onComplete,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false
}: EnhancedLessonViewerProps) => {
  const [lesson, setLesson] = useState<any>(null);
  const [contents, setContents] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [keyPoints, setKeyPoints] = useState<any[]>([]);
  const [mindMaps, setMindMaps] = useState<any[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizAttempts, setQuizAttempts] = useState(0);
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [canAccess, setCanAccess] = useState(false);
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (lessonId) {
      loadLesson();
      // Reset states when lesson changes
      setCurrentQuiz(null);
      setQuizAnswers({});
      setQuizScore(null);
      setQuizAttempts(0);
      setCurrentFlashcard(0);
      setShowFlashcardAnswer(false);
    }
  }, [lessonId]);

  const loadLesson = async () => {
    try {
      setLoading(true);
      const [lessonData, contentsData, quizzesData, flashcardsData, keyPointsData, mindMapsData] = await Promise.all([
        db.getItem('lessons', lessonId),
        db.queryBuilder('lessonContents')
          .where((c: any) => c.lessonId === lessonId)
          .orderBy('order', 'asc')
          .exec(),
        db.queryBuilder('quizzes').where((q: any) => q.lessonId === lessonId).exec(),
        db.queryBuilder('flashcards').where((f: any) => f.lessonId === lessonId).exec(),
        db.queryBuilder('keyPoints').where((k: any) => k.lessonId === lessonId).exec(),
        db.queryBuilder('mindMaps').where((m: any) => m.lessonId === lessonId).exec()
      ]);

      if (lessonData) {
        console.log('lessonData', lessonData);
        setLesson(lessonData);
        setContents(contentsData);
        setQuizzes(quizzesData);
        setFlashcards(flashcardsData);
        setKeyPoints(keyPointsData);
        setMindMaps(mindMapsData);

        if (quizzesData.length > 0) {
          setCurrentQuiz(quizzesData[0]);
        }

        // Check if lesson can be accessed based on release settings
        const now = new Date();
        let canAccessLesson = false;

        if (lessonData.isAiGenerated) {
          canAccessLesson = true;
        } else {
          canAccessLesson = lessonData.releaseType === 'immediate' ||
            (lessonData.releaseType === 'scheduled' && new Date(lessonData.scheduledDate) <= now) ||
            (lessonData.releaseType === 'drip' && await checkDripAccess(lessonData));
        }

        setCanAccess(canAccessLesson);
      }
    } catch (error) {
      console.error('Error loading lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkDripAccess = async (lessonData: any) => {
    if (!user || !lessonData.dripDays) return false;
    
    try {
      const enrollment = await db.queryBuilder('enrollments')
        .where((e: any) => e.userId === user.id && e.courseId === courseId)
        .exec();
      
      if (enrollment.length === 0) return false;
      
      const enrollmentDate = new Date(enrollment[0].enrolledAt);
      const daysElapsed = Math.floor((Date.now() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return daysElapsed >= lessonData.dripDays;
    } catch (error) {
      console.error('Error checking drip access:', error);
      return false;
    }
  };

  const handleQuizAnswer = (questionId: string, answer: string) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const submitQuiz = async () => {
    if (!currentQuiz) return;

    const questions = currentQuiz.questions || [];
    let correct = 0;
    
    questions.forEach((question: any) => {
      if (quizAnswers[question.id] === question.correctAnswer) {
        correct++;
      }
    });

    const score = (correct / questions.length) * 100;
    const newAttempts = quizAttempts + 1;
    
    setQuizScore(score);
    setQuizAttempts(newAttempts);

    // Save quiz attempt to database
    if (user) {
      await db.insert('quizAttempts', {
        userId: user.id,
        quizId: currentQuiz.id,
        lessonId: lessonId,
        courseId: courseId,
        score: score,
        answers: JSON.stringify(quizAnswers),
        attemptNumber: newAttempts,
        completedAt: new Date().toISOString()
      });
    }

    if (score >= (currentQuiz.passingScore || 70)) {
      setLessonCompleted(true);
    }
  };

  const retakeQuiz = () => {
    if (quizAttempts >= (currentQuiz.attempts || 3)) return;
    setQuizAnswers({});
    setQuizScore(null);
  };

  const nextFlashcard = () => {
    if (currentFlashcard < flashcards.length - 1) {
      setCurrentFlashcard(currentFlashcard + 1);
      setShowFlashcardAnswer(false);
    }
  };

  const previousFlashcard = () => {
    if (currentFlashcard > 0) {
      setCurrentFlashcard(currentFlashcard - 1);
      setShowFlashcardAnswer(false);
    }
  };

  const completeLesson = async () => {
    setLessonCompleted(true);
    if (onComplete) {
      await onComplete();
    }
  };

  const renderContent = (content: any) => {
    switch (content.type) {
      case 'text':
      case 'rich_text':
        return (
          <div className="prose max-w-none">
            <ReactMarkdown>{content.content}</ReactMarkdown>
          </div>
        );
      case 'video':
        return (
          <div className="space-y-2">
            {content.mediaUrl?.includes('youtube.com') || content.mediaUrl?.includes('vimeo.com') ? (
              <div className="aspect-video">
                <iframe
                  src={content.mediaUrl}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                />
              </div>
            ) : (
              <video controls className="w-full rounded-lg">
                <source src={content.mediaUrl} />
                Your browser does not support the video tag.
              </video>
            )}
            {content.description && (
              <p className="text-gray-600 text-sm">{content.description}</p>
            )}
          </div>
        );
      case 'image':
        return (
          <div className="space-y-2">
            <img
              src={content.mediaUrl || content.imageUrl}
              alt={content.altText || content.title}
              className="w-full rounded-lg"
            />
            {content.altText && (
              <p className="text-gray-600 text-sm">{content.altText}</p>
            )}
          </div>
        );
      case 'audio':
        return (
          <div className="space-y-2">
            <audio controls className="w-full">
              <source src={content.mediaUrl} />
              Your browser does not support the audio tag.
            </audio>
            {content.description && (
              <p className="text-gray-600 text-sm">{content.description}</p>
            )}
          </div>
        );
      case 'document':
        return (
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="flex-1">
                <h4 className="font-medium">{content.title}</h4>
                {content.description && (
                  <p className="text-sm text-gray-600">{content.description}</p>
                )}
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href={content.fileUrl || content.mediaUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </a>
              </Button>
            </div>
          </div>
        );
      default:
        return (
          <div className="prose max-w-none">
            <ReactMarkdown>{content.content || 'No content available'}</ReactMarkdown>
          </div>
        );
    }
  };

  const renderQuizContent = () => {
    if (!currentQuiz) return <p>No quiz available for this lesson.</p>;

    const questions = currentQuiz.questions || [];
    const maxAttempts = currentQuiz.attempts || 3;
    const canRetake = quizAttempts < maxAttempts && quizScore !== null && quizScore < (currentQuiz.passingScore || 70);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{currentQuiz.title}</h3>
          <div className="flex gap-2">
            <Badge>Passing Score: {currentQuiz.passingScore || 70}%</Badge>
            <Badge variant="outline">Attempts: {quizAttempts}/{maxAttempts}</Badge>
          </div>
        </div>

        {quizScore === null ? (
          <div className="space-y-4">
            {questions.map((question: any, index: number) => (
              <Card key={question.id || index}>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">
                    {index + 1}. {question.question}
                  </h4>
                  <div className="space-y-2">
                    {question.type === 'multiple_choice' && question.options?.map((option: string, optIndex: number) => (
                      <label key={optIndex} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name={question.id || `question_${index}`}
                          value={option}
                          onChange={(e) => handleQuizAnswer(question.id || `question_${index}`, e.target.value)}
                          className="w-4 h-4"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                    {question.type === 'fill_in_blank' && (
                      <input
                        type="text"
                        placeholder="Enter your answer..."
                        onChange={(e) => handleQuizAnswer(question.id || `question_${index}`, e.target.value)}
                        className="w-full p-2 border rounded-md"
                      />
                    )}
                    {question.type === 'short_answer' && (
                      <textarea
                        placeholder="Enter your answer..."
                        onChange={(e) => handleQuizAnswer(question.id || `question_${index}`, e.target.value)}
                        className="w-full p-2 border rounded-md h-20"
                      />
                    )}
                    {question.type === 'essay' && (
                      <textarea
                        placeholder="Enter your essay..."
                        onChange={(e) => handleQuizAnswer(question.id || `question_${index}`, e.target.value)}
                        className="w-full p-2 border rounded-md h-32"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button 
              onClick={submitQuiz} 
              className="w-full"
              disabled={Object.keys(quizAnswers).length === 0}
            >
              Submit Quiz
            </Button>
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <div className={`text-4xl font-bold mb-2 ${quizScore >= (currentQuiz.passingScore || 70) ? 'text-green-600' : 'text-red-600'}`}>
                {quizScore.toFixed(0)}%
              </div>
              <p className="text-lg mb-4">
                {quizScore >= (currentQuiz.passingScore || 70) ? 'Congratulations! You passed!' : 'You need to retake the quiz.'}
              </p>
              <div className="space-y-2">
                {quizScore >= (currentQuiz.passingScore || 70) && !lessonCompleted && (
                  <Button onClick={completeLesson}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete Lesson
                  </Button>
                )}
                {canRetake && (
                  <Button onClick={retakeQuiz} variant="outline">
                    Retake Quiz ({quizAttempts}/{maxAttempts})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderFlashcards = () => {
    if (flashcards.length === 0) return <p>No flashcards available for this lesson.</p>;

    const card = flashcards[currentFlashcard];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {currentFlashcard + 1} of {flashcards.length}
          </span>
          <Badge variant="outline">{card.difficulty || 'medium'}</Badge>
        </div>

        <Card className="min-h-[200px] cursor-pointer" onClick={() => setShowFlashcardAnswer(!showFlashcardAnswer)}>
          <CardContent className="p-8 flex items-center justify-center text-center">
            <div>
              <h3 className="text-xl font-semibold mb-4">
                {showFlashcardAnswer ? 'Answer' : 'Question'}
              </h3>
              <p className="text-lg">
                {showFlashcardAnswer ? card.back : card.front}
              </p>
              {card.hint && !showFlashcardAnswer && (
                <p className="text-sm text-gray-500 mt-2">
                  Hint: {card.hint}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={previousFlashcard}
            disabled={currentFlashcard === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowFlashcardAnswer(!showFlashcardAnswer)}
          >
            {showFlashcardAnswer ? 'Show Question' : 'Show Answer'}
          </Button>

          <Button
            variant="outline"
            onClick={nextFlashcard}
            disabled={currentFlashcard === flashcards.length - 1}
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderKeyPoints = () => {
    if (keyPoints.length === 0) return <p>No key points available for this lesson.</p>;

    return (
      <div className="space-y-4">
        {keyPoints.map((point, index) => (
          <Card key={point.id || index}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-2">{point.point}</h4>
                  {point.explanation && (
                    <p className="text-gray-600 text-sm">{point.explanation}</p>
                  )}
                  {point.examples && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-500 mb-1">Examples:</p>
                      <p className="text-sm text-gray-600">{point.examples}</p>
                    </div>
                  )}
                  <Badge variant="outline" className="mt-2">
                    {point.importance || 'medium'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderMindMap = () => {
    if (mindMaps.length === 0) return <p>No mind map available for this lesson.</p>;

    const mindMap = mindMaps[0];
    const mapData = mindMap.data || { nodes: [] };

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{mindMap.title}</h3>
        <div className="bg-white border rounded-lg p-6">
          <div className="flex flex-col items-center space-y-4">
            {mapData.nodes?.map((node: any, index: number) => (
              <div key={node.id || index} className="text-center">
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-medium mb-2">
                  {node.label}
                </div>
                {node.children && Array.isArray(node.children) && (
                  <div className="flex flex-wrap justify-center gap-2">
                    {node.children.map((childId: string, childIndex: number) => {
                      const childNode = mapData.nodes?.find((n: any) => n.id === childId);
                      return (
                        <div key={childIndex} className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm">
                          {childNode?.label || `Child ${childIndex + 1}`}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-semibold mb-2">Lesson not found</h3>
        <p className="text-gray-600">The requested lesson could not be found.</p>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-yellow-600 mb-4">
            <BookOpen className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Lesson Not Available</h3>
          <p className="text-gray-600 mb-4">
            This lesson is not yet available. It will be released according to the course schedule.
          </p>
          {lesson.releaseType === 'scheduled' && (
            <p className="text-sm text-gray-500">
              Available on: {new Date(lesson.scheduledDate).toLocaleDateString()}
            </p>
          )}
          {lesson.releaseType === 'drip' && (
            <p className="text-sm text-gray-500">
              Available {lesson.dripDays} days after enrollment
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Lesson Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {lesson.title}
            </CardTitle>
            <Badge variant={lessonCompleted ? "default" : "secondary"}>
              {lessonCompleted ? "Completed" : lesson.type || "Lesson"}
            </Badge>
          </div>
          <p className="text-gray-600">{lesson.description}</p>
        </CardHeader>
      </Card>

      {/* Lesson Content */}
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6 bg-gray-50 p-1 rounded-lg">
          <TabsTrigger value="content" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Content</span>
          </TabsTrigger>
          <TabsTrigger value="quiz" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Quiz</span>
          </TabsTrigger>
          <TabsTrigger value="flashcards" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">Flashcards</span>
          </TabsTrigger>
          <TabsTrigger value="keypoints" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Lightbulb className="h-4 w-4" />
            <span className="hidden sm:inline">Key Points</span>
          </TabsTrigger>
          <TabsTrigger value="mindmap" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">Mind Map</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-0">
          <div className="space-y-6">
            {contents.length > 0 ? (
              contents.map((content, index) => (
                <Card key={content.id || index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {content.type === 'text' && <FileText className="h-5 w-5" />}
                      {content.type === 'rich_text' && <FileText className="h-5 w-5" />}
                      {content.type === 'video' && <Video className="h-5 w-5" />}
                      {content.type === 'image' && <ImageIcon className="h-5 w-5" />}
                      {content.type === 'audio' && <Volume2 className="h-5 w-5" />}
                      {content.type === 'document' && <FileText className="h-5 w-5" />}
                      {content.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderContent(content)}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No content available</h3>
                  <p className="text-gray-600">This lesson doesn't have any content yet.</p>
                </CardContent>
              </Card>
            )}
            
            {!lessonCompleted && (
              <div className="mt-6 pt-6 border-t">
                <Button onClick={completeLesson} className="w-full">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Complete
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="quiz" className="mt-0">
          {renderQuizContent()}
        </TabsContent>

        <TabsContent value="flashcards" className="mt-0">
          {renderFlashcards()}
        </TabsContent>

        <TabsContent value="keypoints" className="mt-0">
          {renderKeyPoints()}
        </TabsContent>

        <TabsContent value="mindmap" className="mt-0">
          {renderMindMap()}
        </TabsContent>
      </Tabs>

      {/* Navigation */}
      {(onNext || onPrevious) && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={!hasPrevious}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous Lesson
          </Button>

          <Button
            onClick={onNext}
            disabled={!hasNext || !lessonCompleted}
          >
            Next Lesson
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default EnhancedLessonViewer;


import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight,
  BookOpen,
  Brain,
  Lightbulb,
  Map,
  Play,
  FileText,
  Image,
  Video,
  Headphones,
  Eye,
  EyeOff
} from 'lucide-react';
import { db } from '@/lib/github-sdk';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';

interface LessonViewerProps {
  lesson: any;
  onComplete: () => void;
  onNext: () => void;
  onPrevious: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface ContentBlock {
  id: string;
  type: string;
  title: string;
  content: string;
  mediaUrl?: string;
  order: number;
}

interface Question {
  question: string;
  type: string;
  options?: string[];
  correct_answer: string;
  explanation: string;
}

interface Flashcard {
  front: string;
  back: string;
  difficulty: string;
  hint?: string;
  isFlipped: boolean;
}

const EnhancedLessonViewer = ({ 
  lesson, 
  onComplete, 
  onNext, 
  onPrevious, 
  hasNext, 
  hasPrevious 
}: LessonViewerProps) => {
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [keyPoints, setKeyPoints] = useState<any[]>([]);
  const [mindMap, setMindMap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (lesson?.id) {
      loadLessonContent();
    }
  }, [lesson?.id]);

  const loadLessonContent = async () => {
    try {
      setLoading(true);

      // Load different types of content
      const [
        contentsData,
        quizzesData,
        flashcardsData,
        keyPointsData,
        mindMapsData
      ] = await Promise.all([
        db.queryBuilder('lessonContents')
          .where((c: any) => c.lessonId === lesson.id)
          .sort('order', 'asc')
          .exec(),
        db.queryBuilder('quizzes')
          .where((q: any) => q.lessonId === lesson.id)
          .exec(),
        db.queryBuilder('flashcards')
          .where((f: any) => f.lessonId === lesson.id)
          .sort('order', 'asc')
          .exec(),
        db.queryBuilder('keyPoints')
          .where((k: any) => k.lessonId === lesson.id)
          .sort('order', 'asc')
          .exec(),
        db.queryBuilder('mindMaps')
          .where((m: any) => m.lessonId === lesson.id)
          .exec()
      ]);

      // Set content blocks
      const blocks: ContentBlock[] = contentsData.map((content: any) => ({
        id: content.id,
        type: content.type,
        title: content.title || '',
        content: content.content || '',
        mediaUrl: content.mediaUrl,
        order: content.order
      }));
      setContentBlocks(blocks);

      // Set quiz data
      if (quizzesData.length > 0) {
        const quizData = quizzesData[0];
        setQuiz(quizData);
        try {
          const parsedQuestions = JSON.parse(quizData.questions || '[]');
          setQuestions(parsedQuestions);
        } catch (error) {
          console.error('Error parsing quiz questions:', error);
        }
      }

      // Set flashcards
      const cards: Flashcard[] = flashcardsData.map((card: any) => ({
        front: card.front || '',
        back: card.back || '',
        difficulty: card.difficulty || 'medium',
        hint: card.hint,
        isFlipped: false
      }));
      setFlashcards(cards);

      // Set key points
      setKeyPoints(keyPointsData);

      // Set mind map
      if (mindMapsData.length > 0) {
        setMindMap(mindMapsData[0]);
      }

    } catch (error) {
      console.error('Error loading lesson content:', error);
      toast({
        title: 'Error',
        description: 'Failed to load lesson content',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderContentBlock = (block: ContentBlock) => {
    switch (block.type) {
      case 'rich_text':
        return (
          <div className="prose max-w-none">
            <ReactMarkdown>{block.content}</ReactMarkdown>
          </div>
        );
      
      case 'video':
        return (
          <div className="aspect-video bg-black rounded-lg flex items-center justify-center mb-4">
            {block.mediaUrl ? (
              <iframe
                src={block.mediaUrl}
                className="w-full h-full rounded-lg"
                allowFullScreen
                title={block.title}
              />
            ) : (
              <div className="text-white text-center">
                <Video className="h-16 w-16 mx-auto mb-2" />
                <p>Video not available</p>
              </div>
            )}
          </div>
        );
      
      case 'image':
        return (
          <div className="text-center mb-4">
            {block.mediaUrl ? (
              <img
                src={block.mediaUrl}
                alt={block.content}
                className="max-w-full h-auto rounded-lg mx-auto"
              />
            ) : (
              <div className="bg-gray-200 rounded-lg p-8">
                <Image className="h-16 w-16 mx-auto text-gray-400" />
              </div>
            )}
            {block.content && (
              <p className="text-sm text-gray-600 mt-2">{block.content}</p>
            )}
          </div>
        );
      
      case 'audio':
        return (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            {block.mediaUrl ? (
              <audio controls className="w-full">
                <source src={block.mediaUrl} />
                Your browser does not support the audio element.
              </audio>
            ) : (
              <div className="text-center text-gray-500">
                <Headphones className="h-8 w-8 mx-auto mb-2" />
                <p>Audio not available</p>
              </div>
            )}
            {block.content && (
              <p className="text-sm mt-2">{block.content}</p>
            )}
          </div>
        );
      
      default:
        return (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-gray-600">{block.content}</p>
          </div>
        );
    }
  };

  const flipFlashcard = (index: number) => {
    setFlashcards(prev => prev.map((card, i) => 
      i === index ? { ...card, isFlipped: !card.isFlipped } : card
    ));
  };

  const submitQuiz = () => {
    let score = 0;
    questions.forEach((question, index) => {
      if (userAnswers[index] === question.correct_answer) {
        score++;
      }
    });
    
    const percentage = Math.round((score / questions.length) * 100);
    setQuizScore(percentage);
    setQuizSubmitted(true);

    if (percentage >= (quiz?.passingScore || 70)) {
      toast({
        title: 'Congratulations!',
        description: `You passed with ${percentage}%`,
      });
    } else {
      toast({
        title: 'Try Again',
        description: `You scored ${percentage}%. Minimum passing score is ${quiz?.passingScore || 70}%`,
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson content...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{lesson.title}</CardTitle>
              <p className="text-gray-600 mt-1">{lesson.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{lesson.duration} min</Badge>
              <Badge variant="outline">{lesson.type}</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Content
          </TabsTrigger>
          {quiz && (
            <TabsTrigger value="quiz" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Quiz
            </TabsTrigger>
          )}
          {flashcards.length > 0 && (
            <TabsTrigger value="flashcards" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Flashcards
            </TabsTrigger>
          )}
          {keyPoints.length > 0 && (
            <TabsTrigger value="keypoints" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Key Points
            </TabsTrigger>
          )}
          {mindMap && (
            <TabsTrigger value="mindmap" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Mind Map
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="content" className="mt-6">
          <Card>
            <CardContent className="p-6">
              {contentBlocks.length > 0 ? (
                <div className="space-y-6">
                  {contentBlocks.map((block) => (
                    <div key={block.id}>
                      {block.title && (
                        <h3 className="text-lg font-semibold mb-4">{block.title}</h3>
                      )}
                      {renderContentBlock(block)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No content available</h3>
                  <p className="text-gray-600">This lesson doesn't have any content yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {quiz && (
          <TabsContent value="quiz" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{quiz.title || 'Lesson Quiz'}</CardTitle>
                {quiz.description && (
                  <p className="text-gray-600">{quiz.description}</p>
                )}
              </CardHeader>
              <CardContent>
                {!quizSubmitted ? (
                  <div className="space-y-6">
                    {quiz.instructions && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-blue-800">{quiz.instructions}</p>
                      </div>
                    )}
                    
                    {questions.map((question, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-3">
                          Question {index + 1}: {question.question}
                        </h4>
                        
                        {question.type === 'multiple_choice' && question.options && (
                          <div className="space-y-2">
                            {question.options.map((option, optionIndex) => (
                              <label key={optionIndex} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`question_${index}`}
                                  value={option}
                                  onChange={(e) => setUserAnswers(prev => ({ ...prev, [index]: e.target.value }))}
                                  className="rounded border-gray-300"
                                />
                                <span>{option}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        
                        {question.type === 'short_answer' && (
                          <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="Enter your answer"
                            onChange={(e) => setUserAnswers(prev => ({ ...prev, [index]: e.target.value }))}
                          />
                        )}
                      </div>
                    ))}
                    
                    <Button onClick={submitQuiz} className="w-full">
                      Submit Quiz
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="text-4xl font-bold text-green-600">{quizScore}%</div>
                    <p className="text-lg">
                      You scored {quizScore}% on this quiz
                    </p>
                    {quizScore >= (quiz.passingScore || 70) ? (
                      <div className="text-green-600">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                        <p>Congratulations! You passed this quiz.</p>
                      </div>
                    ) : (
                      <div className="text-red-600">
                        <p>You need {quiz.passingScore || 70}% to pass. Please review the content and try again.</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {flashcards.length > 0 && (
          <TabsContent value="flashcards" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Study Flashcards</CardTitle>
                <p className="text-gray-600">Click on cards to flip them</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {flashcards.map((card, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow min-h-32 flex items-center justify-center text-center"
                      onClick={() => flipFlashcard(index)}
                    >
                      <div>
                        {!card.isFlipped ? (
                          <>
                            <div className="flex items-center justify-center mb-2">
                              <Eye className="h-4 w-4 mr-2" />
                              <span className="text-sm text-gray-500">Front</span>
                            </div>
                            <p className="font-medium">{card.front}</p>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center justify-center mb-2">
                              <EyeOff className="h-4 w-4 mr-2" />
                              <span className="text-sm text-gray-500">Back</span>
                            </div>
                            <p>{card.back}</p>
                            {card.hint && (
                              <p className="text-sm text-gray-500 mt-2">Hint: {card.hint}</p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {keyPoints.length > 0 && (
          <TabsContent value="keypoints" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Points</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {keyPoints.map((point, index) => (
                    <div key={point.id} className="border-l-4 border-l-blue-500 pl-4">
                      <h4 className="font-semibold text-lg">{point.point}</h4>
                      <p className="text-gray-600 mt-1">{point.explanation}</p>
                      {point.examples && (
                        <div className="mt-2">
                          <span className="text-sm font-medium text-gray-700">Examples:</span>
                          <p className="text-sm text-gray-600">{point.examples}</p>
                        </div>
                      )}
                      <Badge variant="outline" className="mt-2">
                        {point.importance} importance
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {mindMap && (
          <TabsContent value="mindmap" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{mindMap.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <Map className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Mind map visualization coming soon</p>
                  <p className="text-sm text-gray-500 mt-2">
                    This will display an interactive mind map of the lesson concepts
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Navigation and completion */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={!hasPrevious}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous Lesson
            </Button>

            <div className="flex items-center gap-4">
              <Button onClick={onComplete} variant="default">
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Complete
              </Button>
              
              <Button
                onClick={onNext}
                disabled={!hasNext}
              >
                Next Lesson
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedLessonViewer;

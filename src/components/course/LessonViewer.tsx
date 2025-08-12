
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
  HelpCircle
} from 'lucide-react';
import { db } from '@/lib/github-sdk';

interface LessonViewerProps {
  lesson: any;
  onComplete: () => void;
  onNext: () => void;
  onPrevious: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

const LessonViewer = ({
  lesson,
  onComplete,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious
}: LessonViewerProps) => {
  const [contents, setContents] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [keyPoints, setKeyPoints] = useState<any[]>([]);
  const [mindMaps, setMindMaps] = useState<any[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);

  useEffect(() => {
    if (lesson) {
      loadLessonContent();
    }
  }, [lesson]);

  const loadLessonContent = async () => {
    try {
      const [contentsData, quizzesData, flashcardsData, keyPointsData, mindMapsData] = await Promise.all([
        db.queryBuilder('lessonContents')
          .where((c: any) => c.lessonId === lesson.id)
          .orderBy('order', 'asc')
          .exec(),
        db.queryBuilder('quizzes').where((q: any) => q.lessonId === lesson.id).exec(),
        db.queryBuilder('flashcards').where((f: any) => f.lessonId === lesson.id).exec(),
        db.queryBuilder('keyPoints').where((k: any) => k.lessonId === lesson.id).exec(),
        db.queryBuilder('mindMaps').where((m: any) => m.lessonId === lesson.id).exec()
      ]);

      setContents(contentsData);
      setQuizzes(quizzesData);
      setFlashcards(flashcardsData);
      setKeyPoints(keyPointsData);
      setMindMaps(mindMapsData);

      if (quizzesData.length > 0) {
        setCurrentQuiz(quizzesData[0]);
      }
    } catch (error) {
      console.error('Error loading lesson content:', error);
    }
  };

  const handleQuizAnswer = (questionId: string, answer: string) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const submitQuiz = () => {
    if (!currentQuiz) return;

    const questions = JSON.parse(currentQuiz.questions);
    let correct = 0;
    
    questions.forEach((question: any) => {
      if (quizAnswers[question.id] === question.correctAnswer) {
        correct++;
      }
    });

    const score = (correct / questions.length) * 100;
    setQuizScore(score);

    if (score >= currentQuiz.passingScore) {
      setLessonCompleted(true);
    }
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

  const completeLesson = () => {
    setLessonCompleted(true);
    onComplete();
  };

  const renderQuizContent = () => {
    if (!currentQuiz) return <p>No quiz available for this lesson.</p>;

    const questions = JSON.parse(currentQuiz.questions);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{currentQuiz.title}</h3>
          <Badge>Passing Score: {currentQuiz.passingScore}%</Badge>
        </div>

        {quizScore === null ? (
          <div className="space-y-4">
            {questions.map((question: any, index: number) => (
              <Card key={question.id}>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">
                    {index + 1}. {question.question}
                  </h4>
                  <div className="space-y-2">
                    {question.options.map((option: string, optIndex: number) => (
                      <label key={optIndex} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={question.id}
                          value={option}
                          onChange={(e) => handleQuizAnswer(question.id, e.target.value)}
                          className="w-4 h-4"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button onClick={submitQuiz} className="w-full">
              Submit Quiz
            </Button>
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <div className={`text-4xl font-bold mb-2 ${quizScore >= currentQuiz.passingScore ? 'text-green-600' : 'text-red-600'}`}>
                {quizScore.toFixed(0)}%
              </div>
              <p className="text-lg mb-4">
                {quizScore >= currentQuiz.passingScore ? 'Congratulations! You passed!' : 'You need to retake the quiz.'}
              </p>
              {quizScore >= currentQuiz.passingScore && !lessonCompleted && (
                <Button onClick={completeLesson}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete Lesson
                </Button>
              )}
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
          <Badge variant="outline">{card.difficulty}</Badge>
        </div>

        <Card className="min-h-[200px]">
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
          <Card key={point.id}>
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
                    {point.importance}
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
    if (mindMaps.length === 0) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No mind map available</h3>
            <p className="text-gray-600">This lesson doesn't have a mind map yet.</p>
          </CardContent>
        </Card>
      );
    }

    const mindMap = mindMaps[0];

    return (
      <Card>
        <CardHeader>
          <CardTitle>{mindMap.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-6 min-h-[400px]">
            {mindMap.data && mindMap.data.nodes ? (
              <div className="space-y-4">
                <h4 className="font-semibold text-center mb-6">Concept Map</h4>
                <div className="flex flex-col items-center space-y-4">
                  {mindMap.data.nodes.map((node: any, index: number) => (
                    <div key={node.id || index} className="text-center">
                      <div className="bg-green-100 border-2 border-green-300 rounded-lg p-3 max-w-xs">
                        <p className="font-medium text-green-800">{node.label || node.text}</p>
                        {node.description && (
                          <p className="text-sm text-green-600 mt-1">{node.description}</p>
                        )}
                      </div>
                      {node.children && node.children.length > 0 && (
                        <div className="mt-4 ml-8 space-y-2">
                          {node.children.map((child: any, childIndex: number) => (
                            <div key={child.id || childIndex} className="bg-blue-100 border-2 border-blue-300 rounded-lg p-2 max-w-xs">
                              <p className="text-sm font-medium text-blue-800">{child.label || child.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Mind map data is not properly formatted.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-x-hidden">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="space-y-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>

          {/* Progress Bar */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-600">0%</span>
            </div>
            <Progress value={0} className="w-full" />
          </div>

          {/* Lesson Header */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <BookOpen className="h-5 w-5 flex-shrink-0" />
                    <span className="truncate">{lesson.title}</span>
                  </CardTitle>
                  {lesson.description && (
                    <p className="text-green-100 mt-2 line-clamp-2">{lesson.description}</p>
                  )}
                </div>
                <Badge
                  variant={lessonCompleted ? "default" : "secondary"}
                  className="flex-shrink-0 bg-white text-green-600"
                >
                  {lessonCompleted ? "Completed" : "text"}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Lesson Content */}
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 bg-white shadow-sm rounded-lg p-1">
              <TabsTrigger value="content" className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Content</span>
              </TabsTrigger>
              <TabsTrigger value="quiz" className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
                <HelpCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Quiz</span>
              </TabsTrigger>
              <TabsTrigger value="flashcards" className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">Flashcards</span>
              </TabsTrigger>
              <TabsTrigger value="keypoints" className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
                <Lightbulb className="h-4 w-4" />
                <span className="hidden sm:inline">Key Points</span>
              </TabsTrigger>
              <TabsTrigger value="mindmap" className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">Mind Map</span>
              </TabsTrigger>
            </TabsList>

        <TabsContent value="content" className="mt-4">
          <Card>
            <CardContent className="p-6">
              {contents.length > 0 ? (
                <div className="space-y-6">
                  {contents.map((content, index) => (
                    <div key={content.id || index}>
                      {content.title && (
                        <h3 className="text-lg font-semibold mb-3">{content.title}</h3>
                      )}
                      <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: content.content }}
                      />
                    </div>
                  ))}
                </div>
              ) : lesson.content ? (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: lesson.content }}
                />
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No content available</h3>
                  <p className="text-gray-600">This lesson doesn't have any content yet.</p>
                </div>
              )}
              {!lessonCompleted && (
                <div className="mt-6 pt-6 border-t">
                  <Button onClick={completeLesson} className="w-full">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Complete
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quiz" className="mt-4">
          {renderQuizContent()}
        </TabsContent>

        <TabsContent value="flashcards" className="mt-4">
          {renderFlashcards()}
        </TabsContent>

        <TabsContent value="keypoints" className="mt-4">
          {renderKeyPoints()}
        </TabsContent>

        <TabsContent value="mindmap" className="mt-4">
          {renderMindMap()}
        </TabsContent>
      </Tabs>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 sm:justify-between mt-8">
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={!hasPrevious}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous Lesson
            </Button>

            <div className="flex items-center gap-2 text-sm text-gray-600 order-1 sm:order-2 justify-center">
              <span>1</span>
              <span>Previous</span>
              <span>of</span>
              <span>8</span>
            </div>

            <Button
              onClick={onNext}
              disabled={!hasNext || !lessonCompleted}
              className="w-full sm:w-auto order-3 bg-green-600 hover:bg-green-700"
            >
              Next Lesson
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonViewer;

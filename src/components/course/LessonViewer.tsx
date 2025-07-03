
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
      const [quizzesData, flashcardsData, keyPointsData, mindMapsData] = await Promise.all([
        db.queryBuilder('quizzes').where((q: any) => q.lessonId === lesson.id).exec(),
        db.queryBuilder('flashcards').where((f: any) => f.lessonId === lesson.id).exec(),
        db.queryBuilder('keyPoints').where((k: any) => k.lessonId === lesson.id).exec(),
        db.queryBuilder('mindMaps').where((m: any) => m.lessonId === lesson.id).exec()
      ]);

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
              {lessonCompleted ? "Completed" : lesson.type}
            </Badge>
          </div>
          <p className="text-gray-600">{lesson.description}</p>
        </CardHeader>
      </Card>

      {/* Lesson Content */}
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="quiz" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Quiz
          </TabsTrigger>
          <TabsTrigger value="flashcards" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Flashcards
          </TabsTrigger>
          <TabsTrigger value="keypoints" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Key Points
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: lesson.content }}
              />
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
      </Tabs>

      {/* Navigation */}
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
    </div>
  );
};

export default LessonViewer;

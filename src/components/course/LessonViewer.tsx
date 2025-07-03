
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  ArrowRight, 
  BookOpen, 
  Brain, 
  FileText, 
  Lightbulb,
  CheckCircle2,
  Circle
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  content: string;
  order: number;
  quizzes: any[];
  flashcards: any[];
  mindmap: any;
  keypoints: string[];
}

interface Course {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface LessonViewerProps {
  lesson: Lesson;
  course: Course;
  onNext: () => void;
  onPrevious: () => void;
  onBack: () => void;
  progress: number;
}

const LessonViewer = ({ lesson, course, onNext, onPrevious, onBack, progress }: LessonViewerProps) => {
  const [activeTab, setActiveTab] = useState('content');
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

  const currentIndex = course.lessons.findIndex(l => l.id === lesson.id);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === course.lessons.length - 1;

  const markSectionComplete = (section: string) => {
    setCompletedSections(prev => new Set([...prev, section]));
  };

  const renderQuizzes = () => {
    if (!lesson.quizzes || lesson.quizzes.length === 0) {
      return <div className="text-center py-8 text-gray-500">No quizzes available</div>;
    }

    return (
      <div className="space-y-6">
        {lesson.quizzes.map((quiz, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{quiz.question}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {quiz.options?.map((option: string, optIndex: number) => (
                  <Button
                    key={optIndex}
                    variant="outline"
                    className="w-full justify-start text-left h-auto p-4"
                    onClick={() => markSectionComplete('quiz')}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderFlashcards = () => {
    if (!lesson.flashcards || lesson.flashcards.length === 0) {
      return <div className="text-center py-8 text-gray-500">No flashcards available</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lesson.flashcards.map((card, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold mb-2">{card.front}</h3>
              <p className="text-gray-600">{card.back}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderMindmap = () => {
    if (!lesson.mindmap) {
      return <div className="text-center py-8 text-gray-500">No mindmap available</div>;
    }

    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="inline-block p-4 bg-blue-100 rounded-lg mb-4">
              <h3 className="font-bold text-lg text-blue-800">{lesson.mindmap.central_topic}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lesson.mindmap.branches?.map((branch: any, index: number) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">{branch.topic}</h4>
                  <ul className="text-sm text-gray-600">
                    {branch.subtopics?.map((subtopic: string, subIndex: number) => (
                      <li key={subIndex} className="mb-1">• {subtopic}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderKeypoints = () => {
    if (!lesson.keypoints || lesson.keypoints.length === 0) {
      return <div className="text-center py-8 text-gray-500">No key points available</div>;
    }

    return (
      <div className="space-y-4">
        {lesson.keypoints.map((point, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mt-1">
                  <Lightbulb className="h-4 w-4 text-yellow-600" />
                </div>
                <p className="text-gray-700">{point}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Course
          </Button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">{lesson.title}</h1>
            <p className="text-sm text-gray-600">
              Lesson {currentIndex + 1} of {course.lessons.length}
            </p>
          </div>
          <div className="w-24"></div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Course Progress</span>
            <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Content Tabs */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="content" className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Content</span>
                </TabsTrigger>
                <TabsTrigger value="quiz" className="flex items-center space-x-2">
                  <Brain className="h-4 w-4" />
                  <span className="hidden sm:inline">Quiz</span>
                </TabsTrigger>
                <TabsTrigger value="flashcards" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Cards</span>
                </TabsTrigger>
                <TabsTrigger value="mindmap" className="flex items-center space-x-2">
                  <Lightbulb className="h-4 w-4" />
                  <span className="hidden sm:inline">Mind Map</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="prose max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                    </div>
                    <div className="mt-6 pt-6 border-t">
                      <Button 
                        onClick={() => markSectionComplete('content')}
                        className="w-full"
                      >
                        Mark as Complete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="quiz" className="mt-6">
                {renderQuizzes()}
              </TabsContent>

              <TabsContent value="flashcards" className="mt-6">
                {renderFlashcards()}
              </TabsContent>

              <TabsContent value="mindmap" className="mt-6">
                {renderMindmap()}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Key Points */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Points</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {renderKeypoints()}
              </CardContent>
            </Card>

            {/* Navigation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={onPrevious}
                  disabled={isFirst}
                  variant="outline"
                  className="w-full"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous Lesson
                </Button>
                <Button
                  onClick={onNext}
                  disabled={isLast}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Next Lesson
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonViewer;

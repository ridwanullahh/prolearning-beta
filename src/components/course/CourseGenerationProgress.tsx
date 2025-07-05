
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Brain, 
  CheckCircle, 
  Clock,
  Lightbulb,
  HelpCircle,
  Map
} from 'lucide-react';

interface CourseGenerationProgressProps {
  progress: {
    step: string;
    message: string;
    progress: number;
    currentLesson?: number;
    totalLessons?: number;
    data?: any;
    lesson?: any;
    course?: any;
    error?: any;
  };
}

const CourseGenerationProgress: React.FC<CourseGenerationProgressProps> = ({ progress }) => {
  const getStepIcon = (step: string) => {
    switch (step) {
      case 'curriculum':
        return <BookOpen className="h-5 w-5 text-blue-600" />;
      case 'lesson':
        return <Brain className="h-5 w-5 text-green-600" />;
      case 'finalize':
        return <Clock className="h-5 w-5 text-orange-600" />;
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <div className="h-5 w-5 bg-red-600 rounded-full" />;
      default:
        return <div className="h-5 w-5 bg-gray-400 rounded-full animate-pulse" />;
    }
  };

  const getStepStatus = (stepName: string) => {
    const currentStep = progress.step;
    const steps = ['curriculum', 'lesson', 'finalize', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    const stepIndex = steps.indexOf(stepName);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-blue-600" />
          Generating Your Course
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-gray-600">{Math.round(progress.progress)}%</span>
          </div>
          <Progress value={progress.progress} className="w-full" />
        </div>

        {/* Current Status */}
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
          {getStepIcon(progress.step)}
          <div className="flex-1">
            <p className="font-medium text-blue-900">{progress.message}</p>
            {progress.currentLesson && progress.totalLessons && (
              <p className="text-sm text-blue-700">
                Lesson {progress.currentLesson} of {progress.totalLessons}
              </p>
            )}
          </div>
        </div>

        {/* Step Progress */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Generation Steps</h4>
          
          <div className="space-y-2">
            {/* Curriculum Step */}
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                getStepStatus('curriculum') === 'completed' ? 'bg-green-100' :
                getStepStatus('curriculum') === 'active' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                {getStepStatus('curriculum') === 'completed' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <BookOpen className="h-4 w-4 text-gray-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Create Curriculum</p>
                <p className="text-xs text-gray-600">Building course structure and lessons</p>
              </div>
              <Badge variant={getStepStatus('curriculum') === 'completed' ? 'default' : 'secondary'}>
                {getStepStatus('curriculum') === 'completed' ? 'Done' : 
                 getStepStatus('curriculum') === 'active' ? 'Active' : 'Pending'}
              </Badge>
            </div>

            {/* Lesson Generation Step */}
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                getStepStatus('lesson') === 'completed' ? 'bg-green-100' :
                getStepStatus('lesson') === 'active' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                {getStepStatus('lesson') === 'completed' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Brain className="h-4 w-4 text-gray-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Generate Lessons</p>
                <p className="text-xs text-gray-600">Creating content, quizzes, and materials</p>
              </div>
              <Badge variant={getStepStatus('lesson') === 'completed' ? 'default' : 'secondary'}>
                {getStepStatus('lesson') === 'completed' ? 'Done' : 
                 getStepStatus('lesson') === 'active' ? 'Active' : 'Pending'}
              </Badge>
            </div>

            {/* Finalize Step */}
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                getStepStatus('finalize') === 'completed' ? 'bg-green-100' :
                getStepStatus('finalize') === 'active' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                {getStepStatus('finalize') === 'completed' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Clock className="h-4 w-4 text-gray-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Finalize Course</p>
                <p className="text-xs text-gray-600">Final review and optimization</p>
              </div>
              <Badge variant={getStepStatus('finalize') === 'completed' ? 'default' : 'secondary'}>
                {getStepStatus('finalize') === 'completed' ? 'Done' : 
                 getStepStatus('finalize') === 'active' ? 'Active' : 'Pending'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Generated Content Preview */}
        {progress.data && progress.step === 'curriculum' && (
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Curriculum Created</h4>
            <p className="text-sm text-green-800">{progress.data.title}</p>
            <p className="text-xs text-green-700 mt-1">
              {progress.data.lessons?.length || 0} lessons planned
            </p>
          </div>
        )}

        {progress.lesson && progress.step === 'lesson' && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Lesson Generated</h4>
            <p className="text-sm text-blue-800">{progress.lesson.title}</p>
            <div className="flex gap-2 mt-2">
              {progress.lesson.contents?.length > 0 && (
                <Badge variant="outline">
                  <BookOpen className="h-3 w-3 mr-1" />
                  Content
                </Badge>
              )}
              {progress.lesson.quiz && (
                <Badge variant="outline">
                  <HelpCircle className="h-3 w-3 mr-1" />
                  Quiz
                </Badge>
              )}
              {progress.lesson.flashcards?.length > 0 && (
                <Badge variant="outline">
                  <Brain className="h-3 w-3 mr-1" />
                  Flashcards
                </Badge>
              )}
              {progress.lesson.keyPoints?.length > 0 && (
                <Badge variant="outline">
                  <Lightbulb className="h-3 w-3 mr-1" />
                  Key Points
                </Badge>
              )}
              {progress.lesson.mindMap && (
                <Badge variant="outline">
                  <Map className="h-3 w-3 mr-1" />
                  Mind Map
                </Badge>
              )}
            </div>
          </div>
        )}

        {progress.error && progress.step === 'error' && (
          <div className="p-4 bg-red-50 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">Generation Failed</h4>
            <p className="text-sm text-red-800">{progress.error.message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseGenerationProgress;


import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, Brain, Clock, Target, Sparkles, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { db } from '@/lib/github-sdk';
import { aiService } from '@/lib/ai-service';
import { authService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
}

interface CourseSpec {
  academicLevelId: string;
  academicLevel: string;
  subjectId: string;
  subject: string;
  courseType: 'full_curriculum' | 'topic_based';
  topic?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  learningStyle: string;
  tone: string;
  quizOptions: {
    enabled: boolean;
    count: number;
    types: string[];
  };
  flashcardOptions: {
    enabled: boolean;
    count: number;
  };
  mindmapEnabled: boolean;
  keypointsEnabled: boolean;
  additionalComments: string;
}

const EnhancedCourseWizard = ({ onCourseGenerated, onCancel }: { onCourseGenerated: (course: any) => void; onCancel: () => void }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [courseSpec, setCourseSpec] = useState<CourseSpec>({
    academicLevelId: '',
    academicLevel: '',
    subjectId: '',
    subject: '',
    courseType: 'full_curriculum',
    difficulty: 'beginner',
    duration: 60,
    learningStyle: 'visual',
    tone: 'friendly',
    quizOptions: {
      enabled: true,
      count: 5,
      types: ['multiple_choice']
    },
    flashcardOptions: {
      enabled: true,
      count: 10
    },
    mindmapEnabled: true,
    keypointsEnabled: true,
    additionalComments: ''
  });
  
  const [academicLevels, setAcademicLevels] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [canGenerate, setCanGenerate] = useState(true);
  const [usageInfo, setUsageInfo] = useState<any>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    loadAcademicLevels();
    checkGenerationAvailability();
  }, []);

  useEffect(() => {
    if (courseSpec.academicLevelId) {
      loadSubjects(courseSpec.academicLevelId);
    }
  }, [courseSpec.academicLevelId]);

  const loadAcademicLevels = async () => {
    try {
      const levels = await db.get('academicLevels');
      setAcademicLevels(levels.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Error loading academic levels:', error);
      toast({
        title: 'Error',
        description: 'Failed to load academic levels',
        variant: 'destructive'
      });
    }
  };

  const loadSubjects = async (academicLevelId: string) => {
    try {
      const allSubjects = await db.get('subjects');
      const levelSubjects = allSubjects.filter(s => s.academicLevelId === academicLevelId && s.isActive);
      setSubjects(levelSubjects);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const checkGenerationAvailability = async () => {
    try {
      const user = authService.getCurrentUser();
      if (!user) return;

      const currentMonth = new Date().toISOString().slice(0, 7);
      const usage = await db.queryBuilder('aiGenerationUsage')
        .where(item => item.userId === user.id && item.month === currentMonth)
        .exec();

      const currentUsage = usage.length > 0 ? usage[0] : {
        freeGenerationsUsed: 0,
        subscriptionActive: false
      };

      const settings = await db.queryBuilder('platformSettings')
        .where(item => item.key === 'free_ai_generations_per_month')
        .exec();

      const freeLimit = settings.length > 0 ? parseInt(settings[0].value) : 3;
      
      setUsageInfo({
        freeUsed: currentUsage.freeGenerationsUsed,
        freeLimit,
        hasActiveSubscription: currentUsage.subscriptionActive,
        canGenerateFree: currentUsage.freeGenerationsUsed < freeLimit,
        canGeneratePaid: true // Assuming payment is available
      });

      setCanGenerate(
        currentUsage.subscriptionActive || 
        currentUsage.freeGenerationsUsed < freeLimit
      );
    } catch (error) {
      console.error('Error checking generation availability:', error);
    }
  };

  const steps: WizardStep[] = [
    {
      id: 'level',
      title: 'Academic Level',
      description: 'Select your current academic level',
      component: AcademicLevelStep
    },
    {
      id: 'subject',
      title: 'Subject',
      description: 'Choose the subject you want to learn',
      component: SubjectStep
    },
    {
      id: 'course_type',
      title: 'Course Type',
      description: 'Full curriculum or specific topic',
      component: CourseTypeStep
    },
    {
      id: 'preferences',
      title: 'Learning Preferences',
      description: 'Customize your learning experience',
      component: PreferencesStep
    },
    {
      id: 'features',
      title: 'Course Features',
      description: 'Select additional learning tools',
      component: FeaturesStep
    },
    {
      id: 'review',
      title: 'Review & Generate',
      description: 'Review your selections and generate course',
      component: ReviewStep
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateCourse = async () => {
    if (!canGenerate) {
      toast({
        title: 'Generation Limit Reached',
        description: 'Please upgrade to Pro or wait for next month',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      // Generate course with AI
      const generatedCourse = await aiService.generateCourse(courseSpec);
      
      // Save course to database
      const course = await db.insert('courses', {
        ...generatedCourse,
        creatorId: user.id,
        creatorType: 'ai'
      });

      // Save lessons and related content
      for (const lessonData of generatedCourse.lessons) {
        const lesson = await db.insert('lessons', {
          courseId: course.id,
          title: lessonData.title,
          description: lessonData.description,
          content: lessonData.content,
          order: lessonData.order,
          duration: lessonData.duration,
          type: lessonData.type || 'text',
          isRequired: true
        });

        // Save quiz if present
        if (lessonData.quiz && courseSpec.quizOptions.enabled) {
          await db.insert('quizzes', {
            lessonId: lesson.id,
            courseId: course.id,
            title: `${lessonData.title} Quiz`,
            questions: JSON.stringify(lessonData.quiz.questions),
            totalQuestions: lessonData.quiz.questions.length,
            passingScore: 70,
            attempts: 3,
            isActive: true
          });
        }

        // Save flashcards if present
        if (lessonData.flashcards && courseSpec.flashcardOptions.enabled) {
          for (let i = 0; i < lessonData.flashcards.length; i++) {
            const flashcard = lessonData.flashcards[i];
            await db.insert('flashcards', {
              lessonId: lesson.id,
              courseId: course.id,
              front: flashcard.front,
              back: flashcard.back,
              difficulty: flashcard.difficulty || 'medium',
              order: i + 1
            });
          }
        }

        // Save key points if present
        if (lessonData.keyPoints && courseSpec.keypointsEnabled) {
          for (let i = 0; i < lessonData.keyPoints.length; i++) {
            const keyPoint = lessonData.keyPoints[i];
            await db.insert('keyPoints', {
              lessonId: lesson.id,
              courseId: course.id,
              point: keyPoint.point,
              explanation: keyPoint.explanation,
              order: i + 1,
              importance: keyPoint.importance || 'medium'
            });
          }
        }

        // Save mind map if present
        if (lessonData.mindMap && courseSpec.mindmapEnabled) {
          await db.insert('mindMaps', {
            lessonId: lesson.id,
            courseId: course.id,
            title: lessonData.mindMap.title,
            data: JSON.stringify(lessonData.mindMap.nodes)
          });
        }
      }

      // Update usage tracking
      await updateUsageTracking(user.id);

      toast({
        title: 'Course Generated Successfully!',
        description: `Your course "${course.title}" has been created.`
      });

      onCourseGenerated(course);
    } catch (error) {
      console.error('Course generation error:', error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate course',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const updateUsageTracking = async (userId: string) => {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const usage = await db.queryBuilder('aiGenerationUsage')
        .where(item => item.userId === userId && item.month === currentMonth)
        .exec();

      if (usage.length > 0) {
        const currentUsage = usage[0];
        if (currentUsage.subscriptionActive) {
          // Pro user - no limits
        } else {
          // Free user - increment counter
          await db.update('aiGenerationUsage', currentUsage.id, {
            freeGenerationsUsed: currentUsage.freeGenerationsUsed + 1,
            lastGenerationAt: new Date().toISOString()
          });
        }
      } else {
        // Create new usage record
        await db.insert('aiGenerationUsage', {
          userId,
          month: currentMonth,
          freeGenerationsUsed: 1,
          paidGenerationsUsed: 0,
          subscriptionActive: false,
          lastGenerationAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error updating usage tracking:', error);
    }
  };

  return (
    <TooltipProvider>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Course Generator</h1>
              <p className="text-gray-600">Create a personalized learning experience</p>
            </div>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
          
          <div className="flex items-center space-x-4 mb-6">
            <Progress value={(currentStep / (steps.length - 1)) * 100} className="flex-1" />
            <span className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>

          <div className="flex space-x-2 mb-6">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex-1 p-3 rounded-lg border text-center transition-colors ${
                  index === currentStep
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : index < currentStep
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-gray-50 border-gray-200 text-gray-500'
                }`}
              >
                <div className="text-sm font-medium">{step.title}</div>
              </div>
            ))}
          </div>

          {usageInfo && (
            <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Generation Status</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    {usageInfo.hasActiveSubscription ? (
                      <Badge className="bg-green-100 text-green-800">Pro Unlimited</Badge>
                    ) : (
                      <Badge variant="outline">
                        {usageInfo.freeUsed}/{usageInfo.freeLimit} Free Generations
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {React.createElement(steps[currentStep].component, {
              courseSpec,
              setCourseSpec,
              academicLevels,
              subjects,
              onNext: nextStep,
              onPrev: prevStep,
              onGenerate: generateCourse,
              isGenerating,
              canGenerate,
              usageInfo
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

// Step Components
const AcademicLevelStep = ({ courseSpec, setCourseSpec, academicLevels, onNext }: any) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  const categories = [...new Set(academicLevels.map((level: any) => level.category))];
  const filteredLevels = selectedCategory 
    ? academicLevels.filter((level: any) => level.category === selectedCategory)
    : academicLevels;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-blue-600" />
          <span>Select Your Academic Level</span>
        </CardTitle>
        <CardDescription>
          Choose the level that best matches your current education stage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-base font-medium mb-3 block">Education Category</Label>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((category: string) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <span className="font-medium">{category}</span>
              </Button>
            ))}
          </div>
        </div>

        {selectedCategory && (
          <div>
            <Label className="text-base font-medium mb-3 block">Specific Level</Label>
            <div className="grid gap-3">
              {filteredLevels.map((level: any) => (
                <TooltipProvider key={level.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={courseSpec.academicLevelId === level.id ? "default" : "outline"}
                        onClick={() => setCourseSpec({
                          ...courseSpec,
                          academicLevelId: level.id,
                          academicLevel: level.name
                        })}
                        className="h-auto p-4 justify-between text-left"
                      >
                        <div>
                          <div className="font-medium">{level.name}</div>
                          <div className="text-sm text-gray-500">{level.typicalAge}</div>
                        </div>
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-sm">
                      <div className="space-y-2">
                        <div><strong>International:</strong> {level.internationalEquivalent}</div>
                        <div><strong>Nigerian:</strong> {level.nigerianEquivalent}</div>
                        <div><strong>Age:</strong> {level.typicalAge}</div>
                        {level.description && <div>{level.description}</div>}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button 
            onClick={onNext} 
            disabled={!courseSpec.academicLevelId}
            className="px-8"
          >
            Next Step <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const SubjectStep = ({ courseSpec, setCourseSpec, subjects, onNext, onPrev }: any) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <span>Choose Your Subject</span>
        </CardTitle>
        <CardDescription>
          Select the subject you want to focus on for this course
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((subject: any) => (
            <Button
              key={subject.id}
              variant={courseSpec.subjectId === subject.id ? "default" : "outline"}
              onClick={() => setCourseSpec({
                ...courseSpec,
                subjectId: subject.id,
                subject: subject.name
              })}
              className="h-auto p-4 flex items-center space-x-3 text-left"
            >
              <span className="text-2xl">{subject.icon}</span>
              <div>
                <div className="font-medium">{subject.name}</div>
                <div className="text-sm text-gray-500">{subject.description}</div>
              </div>
            </Button>
          ))}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrev}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button 
            onClick={onNext} 
            disabled={!courseSpec.subjectId}
            className="px-8"
          >
            Next Step <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const CourseTypeStep = ({ courseSpec, setCourseSpec, onNext, onPrev }: any) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Type</CardTitle>
        <CardDescription>
          Choose between a full curriculum or topic-specific course
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Button
            variant={courseSpec.courseType === 'full_curriculum' ? "default" : "outline"}
            onClick={() => setCourseSpec({ ...courseSpec, courseType: 'full_curriculum' })}
            className="w-full h-auto p-6 flex flex-col items-start space-y-2"
          >
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span className="font-semibold">Full Subject Curriculum</span>
            </div>
            <p className="text-sm text-left opacity-80">
              Comprehensive coverage of the entire subject with structured learning path
            </p>
          </Button>

          <Button
            variant={courseSpec.courseType === 'topic_based' ? "default" : "outline"}
            onClick={() => setCourseSpec({ ...courseSpec, courseType: 'topic_based' })}
            className="w-full h-auto p-6 flex flex-col items-start space-y-2"
          >
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span className="font-semibold">Specific Topic</span>
            </div>
            <p className="text-sm text-left opacity-80">
              Focused learning on a particular topic or concept
            </p>
          </Button>
        </div>

        {courseSpec.courseType === 'topic_based' && (
          <div className="space-y-2">
            <Label htmlFor="topic">Specify Your Topic</Label>
            <Input
              id="topic"
              placeholder="e.g., Photosynthesis, Algebra Equations, World War II"
              value={courseSpec.topic || ''}
              onChange={(e) => setCourseSpec({ ...courseSpec, topic: e.target.value })}
            />
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrev}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button 
            onClick={onNext}
            disabled={courseSpec.courseType === 'topic_based' && !courseSpec.topic}
            className="px-8"
          >
            Next Step <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const PreferencesStep = ({ courseSpec, setCourseSpec, onNext, onPrev }: any) => {
  const learningStyles = [
    { value: 'visual', label: 'Visual', description: 'Learn through images, diagrams, and visual aids' },
    { value: 'auditory', label: 'Auditory', description: 'Learn through listening and verbal instruction' },
    { value: 'kinesthetic', label: 'Kinesthetic', description: 'Learn through hands-on activities and practice' },
    { value: 'reading', label: 'Reading/Writing', description: 'Learn through text and written materials' }
  ];

  const tones = [
    { value: 'friendly', label: 'Friendly & Conversational' },
    { value: 'professional', label: 'Professional & Formal' },
    { value: 'encouraging', label: 'Encouraging & Motivational' },
    { value: 'simple', label: 'Simple & Easy to Understand' }
  ];

  const difficulties = [
    { value: 'beginner', label: 'Beginner', description: 'Start with basics and fundamentals' },
    { value: 'intermediate', label: 'Intermediate', description: 'Assumes some prior knowledge' },
    { value: 'advanced', label: 'Advanced', description: 'In-depth coverage for experienced learners' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-blue-600" />
          <span>Learning Preferences</span>
        </CardTitle>
        <CardDescription>
          Customize how you prefer to learn and study
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className="text-base font-medium">Learning Style</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {learningStyles.map((style) => (
              <Button
                key={style.value}
                variant={courseSpec.learningStyle === style.value ? "default" : "outline"}
                onClick={() => setCourseSpec({ ...courseSpec, learningStyle: style.value })}
                className="h-auto p-4 flex flex-col items-start space-y-1"
              >
                <span className="font-medium">{style.label}</span>
                <span className="text-xs opacity-80 text-left">{style.description}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-medium">Difficulty Level</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {difficulties.map((diff) => (
              <Button
                key={diff.value}
                variant={courseSpec.difficulty === diff.value ? "default" : "outline"}
                onClick={() => setCourseSpec({ ...courseSpec, difficulty: diff.value })}
                className="h-auto p-4 flex flex-col items-start space-y-1"
              >
                <span className="font-medium">{diff.label}</span>
                <span className="text-xs opacity-80 text-left">{diff.description}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-medium">Teaching Tone</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tones.map((tone) => (
              <Button
                key={tone.value}
                variant={courseSpec.tone === tone.value ? "default" : "outline"}
                onClick={() => setCourseSpec({ ...courseSpec, tone: tone.value })}
                className="h-auto p-3"
              >
                {tone.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="duration" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Estimated Study Duration (minutes per session)</span>
          </Label>
          <Select
            value={courseSpec.duration.toString()}
            onValueChange={(value) => setCourseSpec({ ...courseSpec, duration: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="45">45 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
              <SelectItem value="90">1.5 hours</SelectItem>
              <SelectItem value="120">2 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrev}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button onClick={onNext} className="px-8">
            Next Step <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const FeaturesStep = ({ courseSpec, setCourseSpec, onNext, onPrev }: any) => {
  const quizTypes = [
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'true_false', label: 'True/False' },
    { value: 'fill_blank', label: 'Fill in the Blanks' },
    { value: 'short_answer', label: 'Short Answer' },
    { value: 'essay', label: 'Essay Questions' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Features</CardTitle>
        <CardDescription>
          Select additional learning tools to include in your course
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 border rounded-lg">
            <Checkbox
              id="quizzes"
              checked={courseSpec.quizOptions.enabled}
              onCheckedChange={(checked) => 
                setCourseSpec({
                  ...courseSpec,
                  quizOptions: { ...courseSpec.quizOptions, enabled: !!checked }
                })
              }
            />
            <div className="flex-1">
              <Label htmlFor="quizzes" className="font-medium">Interactive Quizzes</Label>
              <p className="text-sm text-gray-600">Test your knowledge with practice questions</p>
            </div>
          </div>

          {courseSpec.quizOptions.enabled && (
            <div className="ml-8 space-y-4">
              <div>
                <Label>Number of questions per quiz</Label>
                <Select
                  value={courseSpec.quizOptions.count.toString()}
                  onValueChange={(value) => 
                    setCourseSpec({
                      ...courseSpec,
                      quizOptions: { ...courseSpec.quizOptions, count: parseInt(value) }
                    })
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-2 block">Question Types</Label>
                <div className="grid grid-cols-2 gap-2">
                  {quizTypes.map((type) => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={type.value}
                        checked={courseSpec.quizOptions.types.includes(type.value)}
                        onCheckedChange={(checked) => {
                          const types = checked
                            ? [...courseSpec.quizOptions.types, type.value]
                            : courseSpec.quizOptions.types.filter(t => t !== type.value);
                          setCourseSpec({
                            ...courseSpec,
                            quizOptions: { ...courseSpec.quizOptions, types }
                          });
                        }}
                      />
                      <Label htmlFor={type.value} className="text-sm">{type.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3 p-4 border rounded-lg">
            <Checkbox
              id="flashcards"
              checked={courseSpec.flashcardOptions.enabled}
              onCheckedChange={(checked) => 
                setCourseSpec({
                  ...courseSpec,
                  flashcardOptions: { ...courseSpec.flashcardOptions, enabled: !!checked }
                })
              }
            />
            <div className="flex-1">
              <Label htmlFor="flashcards" className="font-medium">Flashcards</Label>
              <p className="text-sm text-gray-600">Quick review cards for key concepts</p>
            </div>
          </div>

          {courseSpec.flashcardOptions.enabled && (
            <div className="ml-8">
              <Label>Number of flashcards per lesson</Label>
              <Select
                value={courseSpec.flashcardOptions.count.toString()}
                onValueChange={(value) => 
                  setCourseSpec({
                    ...courseSpec,
                    flashcardOptions: { ...courseSpec.flashcardOptions, count: parseInt(value) }
                  })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center space-x-3 p-4 border rounded-lg">
            <Checkbox
              id="mindmaps"
              checked={courseSpec.mindmapEnabled}
              onCheckedChange={(checked) => 
                setCourseSpec({ ...courseSpec, mindmapEnabled: !!checked })
              }
            />
            <div>
              <Label htmlFor="mindmaps" className="font-medium">Mind Maps</Label>
              <p className="text-sm text-gray-600">Visual concept connections and relationships</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 border rounded-lg">
            <Checkbox
              id="keypoints"
              checked={courseSpec.keypointsEnabled}
              onCheckedChange={(checked) => 
                setCourseSpec({ ...courseSpec, keypointsEnabled: !!checked })
              }
            />
            <div>
              <Label htmlFor="keypoints" className="font-medium">Key Points</Label>
              <p className="text-sm text-gray-600">Important takeaways and summaries</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrev}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button onClick={onNext} className="px-8">
            Next Step <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ReviewStep = ({ courseSpec, setCourseSpec, onGenerate, onPrev, isGenerating, canGenerate, usageInfo }: any) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Review & Generate</CardTitle>
        <CardDescription>
          Review your course specifications and add any final comments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label className="font-medium text-gray-700">Academic Level</Label>
              <p className="text-sm">{courseSpec.academicLevel}</p>
            </div>
            <div>
              <Label className="font-medium text-gray-700">Subject</Label>
              <p className="text-sm">{courseSpec.subject}</p>
            </div>
            <div>
              <Label className="font-medium text-gray-700">Course Type</Label>
              <p className="text-sm capitalize">
                {courseSpec.courseType.replace('_', ' ')}
                {courseSpec.topic && ` - ${courseSpec.topic}`}
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label className="font-medium text-gray-700">Difficulty</Label>
              <p className="text-sm capitalize">{courseSpec.difficulty}</p>
            </div>
            <div>
              <Label className="font-medium text-gray-700">Duration</Label>
              <p className="text-sm">{courseSpec.duration} minutes per session</p>
            </div>
            <div>
              <Label className="font-medium text-gray-700">Learning Style</Label>
              <p className="text-sm capitalize">{courseSpec.learningStyle}</p>
            </div>
          </div>
        </div>

        <div>
          <Label className="font-medium text-gray-700 mb-2 block">Enabled Features</Label>
          <div className="flex flex-wrap gap-2">
            {courseSpec.quizOptions.enabled && (
              <Badge variant="secondary">
                Quizzes ({courseSpec.quizOptions.count} questions)
              </Badge>
            )}
            {courseSpec.flashcardOptions.enabled && (
              <Badge variant="secondary">
                Flashcards ({courseSpec.flashcardOptions.count} cards)
              </Badge>
            )}
            {courseSpec.mindmapEnabled && <Badge variant="secondary">Mind Maps</Badge>}
            {courseSpec.keypointsEnabled && <Badge variant="secondary">Key Points</Badge>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="comments">Additional Comments (Optional)</Label>
          <Textarea
            id="comments"
            placeholder="Any specific requirements, topics to emphasize, or teaching preferences..."
            value={courseSpec.additionalComments}
            onChange={(e) => setCourseSpec({ ...courseSpec, additionalComments: e.target.value })}
            rows={4}
          />
          <p className="text-xs text-gray-500">
            Note: Comments should align with educational goals and Islamic values
          </p>
        </div>

        {!canGenerate && usageInfo && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Info className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-amber-800 font-medium">Generation Limit Reached</p>
                <p className="text-amber-700 text-sm">
                  You've used all {usageInfo.freeLimit} free generations this month. 
                  Upgrade to Pro for unlimited generations.
                </p>
                <Button size="sm" className="mt-2 bg-amber-600 hover:bg-amber-700">
                  Upgrade to Pro
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrev} disabled={isGenerating}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button 
            onClick={onGenerate} 
            disabled={isGenerating || !canGenerate}
            className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Course...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Course
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedCourseWizard;

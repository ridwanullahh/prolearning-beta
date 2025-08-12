import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { streamingAIService } from '@/lib/ai-service-streaming';
import { CourseGenerationOptions } from '@/lib/ai-service';
import CourseGenerationProgress from './CourseGenerationProgress';
import { CourseParser } from '@/lib/courseParser';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';
import { backgroundGenerationService } from '@/lib/background-generation-service';
import CurriculumSetupStep from './CurriculumSetupStep';
import { Loader2, BookOpen, Brain, Target, Clock, Upload } from 'lucide-react';

interface CourseGenerationWizardProps {
  onCourseGenerated?: (course: any) => void;
}

interface ExtendedCourseGenerationOptions extends CourseGenerationOptions {
  courseTitle: string;
  curriculum: string;
  studyMaterial?: File;
}

const CourseGenerationWizard = ({ onCourseGenerated }: CourseGenerationWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<any>(null);
  const [useBackgroundGeneration, setUseBackgroundGeneration] = useState(false);
  const [formData, setFormData] = useState<ExtendedCourseGenerationOptions>({
    courseTitle: '',
    academicLevel: '',
    subject: '',
    difficulty: 'beginner',
    duration: 4,
    includeQuiz: true,
    quizOptions: {
      count: 5,
      types: ['Multiple Choice']
    },
    includeFlashcards: true,
    flashcardCount: 10,
    includeMindmap: true,
    includeKeypoints: true,
    learningStyle: 'Visual',
    tone: 'Professional',
    topicBased: false,
    specificTopic: '',
    curriculum: '',
    additionalInstructions: ''
  });

  const { toast } = useToast();
  const totalSteps = 6; // Updated to include curriculum setup step

  const academicLevels = [
    'Primary School', 'Junior Secondary', 'Senior Secondary', 
    'Post-Secondary', 'Undergraduate', 'Postgraduate'
  ];

  const subjects = [
    'Islamic Studies', 'Mathematics', 'English Language', 'Science', 'Physics', 'Chemistry', 
    'Biology', 'Computer Science', 'History', 'Geography', 'Literature',
    'Economics', 'Business Studies', 'Arabic Language', 'Yoruba'
  ];

  const learningStyles = [
    'Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing', 'Mixed'
  ];

  const tones = [
    'Professional', 'Casual', 'Academic', 'Friendly', 'Motivational'
  ];

  const quizTypes = [
    'Multiple Choice', 'True/False', 'Fill in the Blank', 'Essay', 'Short Answer'
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerateCourse = async () => {
    setIsGenerating(true);
    
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check AI generation usage
      const currentMonth = new Date().toISOString().slice(0, 7);
      const usage = await db.queryBuilder('aiGenerationUsage')
        .where(u => u.userId === user.id && u.month === currentMonth)
        .exec();

      let currentUsage = usage[0];
      if (!currentUsage) {
        currentUsage = await db.insert('aiGenerationUsage', {
          userId: user.id,
          month: currentMonth,
          freeGenerationsUsed: 0,
          paidGenerationsUsed: 0,
          subscriptionActive: false
        });
      }

      // Check if user has free generations left
      if (currentUsage.freeGenerationsUsed >= 3 && !currentUsage.subscriptionActive) {
        toast({
          title: "Generation Limit Reached",
          description: "You've used all free generations this month. Please upgrade to Pro or wait until next month.",
          variant: "destructive"
        });
        return;
      }

      // Generate the course
      if (useBackgroundGeneration && backgroundGenerationService.isBackgroundGenerationSupported()) {
        // Queue for background generation
        const requestId = await backgroundGenerationService.queueGeneration(formData, user.id);

        toast({
          title: "Generation Queued!",
          description: "Your course is being generated in the background. You'll receive a notification when it's ready.",
        });

        // Show background generation status
        setProgress({
          step: 'queued',
          message: 'Course generation queued for background processing...',
          progress: 100,
          requestId: requestId
        });

        return;
      } else {
        // Generate the course using the streaming service
        const generatedCourse = await streamingAIService.generateCourseWithStreaming(
          formData,
          (progressUpdate) => {
            setProgress(progressUpdate);
          }
        );

        // Get academic level and subject IDs
      const academicLevels = await db.get('academicLevels');
      const subjects = await db.get('subjects');
      
      const academicLevel = academicLevels.find(al => al.category === formData.academicLevel);
      let subject = subjects.find(s => s.name === formData.subject);
      
      if (!subject && academicLevel) {
        // Create subject if it doesn't exist
        subject = await db.insert('subjects', {
          name: formData.subject,
          academicLevelId: academicLevel.id,
          description: `${formData.subject} course`,
          isActive: true
        });
      }

      // Parse and save the course using CourseParser
      if (academicLevel && subject) {
        const parsedData = CourseParser.parseAIGeneratedCourse(JSON.stringify(generatedCourse));
        
        const course = await db.insert('courses', {
          title: parsedData.course.title,
          description: parsedData.course.description,
          creatorId: user.id,
          creatorType: 'ai',
          academicLevelId: academicLevel.id,
          subjectId: subject.id,
          difficulty: formData.difficulty,
          duration: formData.duration,
          price: 0,
          currency: user.currency || 'USD',
          isPublished: true,
          isAiGenerated: true,
          objectives: parsedData.course.objectives,
          prerequisites: parsedData.course.prerequisites,
          estimatedTime: `${parsedData.course.estimatedHours} hours`,
          tags: [formData.subject, formData.academicLevel, formData.difficulty]
        });

        // Save lessons and related content using CourseParser
        await CourseParser.saveParsedCourseToDatabase(parsedData, course.id, db);

        // Update usage count
        await db.update('aiGenerationUsage', currentUsage.id, {
          freeGenerationsUsed: currentUsage.freeGenerationsUsed + 1
        });

        // Auto-enroll user in the course
        await db.insert('enrollments', {
          userId: user.id,
          courseId: course.id,
          status: 'active',
          paymentStatus: 'free'
        });

        toast({
          title: "Course Generated Successfully!",
          description: `"${parsedData.course.title}" has been created and added to your courses.`
        });

        if (onCourseGenerated) {
          onCourseGenerated(course);
        }
      }
      }
    } catch (error: any) {
      console.error('Course generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate course. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Course Basics</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="courseTitle">Course Title</Label>
              <Input
                placeholder="Enter course title (AI will enhance this)"
                value={formData.courseTitle}
                onChange={(e) => setFormData({...formData, courseTitle: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="academicLevel">Academic Level</Label>
              <Select value={formData.academicLevel} onValueChange={(value) => setFormData({...formData, academicLevel: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select academic level" />
                </SelectTrigger>
                <SelectContent>
                  {academicLevels.map((level) => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select value={formData.subject} onValueChange={(value) => setFormData({...formData, subject: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select value={formData.difficulty} onValueChange={(value: any) => setFormData({...formData, difficulty: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (hours)</Label>
              <Input
                type="number"
                min="1"
                max="50"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 4})}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Target className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold">Course Content</h3>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="topicBased"
                checked={formData.topicBased}
                onCheckedChange={(checked) => setFormData({...formData, topicBased: checked as boolean})}
              />
              <Label htmlFor="topicBased">Topic-based course (instead of full curriculum)</Label>
            </div>

            {formData.topicBased && (
              <div className="space-y-2">
                <Label htmlFor="specificTopic">Specific Topic</Label>
                <Input
                  placeholder="Enter specific topic to focus on"
                  value={formData.specificTopic}
                  onChange={(e) => setFormData({...formData, specificTopic: e.target.value})}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="learningStyle">Learning Style</Label>
              <Select value={formData.learningStyle} onValueChange={(value) => setFormData({...formData, learningStyle: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select learning style" />
                </SelectTrigger>
                <SelectContent>
                  {learningStyles.map((style) => (
                    <SelectItem key={style} value={style}>{style}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Course Tone</Label>
              <Select value={formData.tone} onValueChange={(value) => setFormData({...formData, tone: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  {tones.map((tone) => (
                    <SelectItem key={tone} value={tone}>{tone}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3:
        return (
          <CurriculumSetupStep
            curriculum={formData.curriculum}
            setCurriculum={(curriculum) => setFormData({...formData, curriculum})}
            onNext={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
            courseTitle={formData.courseTitle}
            academicLevel={formData.academicLevel}
            subject={formData.subject}
          />
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold">Learning Tools</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeQuiz"
                  checked={formData.includeQuiz}
                  onCheckedChange={(checked) => setFormData({...formData, includeQuiz: checked as boolean})}
                />
                <Label htmlFor="includeQuiz">Include Quiz</Label>
              </div>

              {formData.includeQuiz && (
                <div className="ml-6 space-y-2">
                  <div className="space-y-2">
                    <Label htmlFor="quizCount">Number of Questions</Label>
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={formData.quizOptions?.count || 5}
                      onChange={(e) => setFormData({
                        ...formData, 
                        quizOptions: {
                          ...formData.quizOptions!,
                          count: parseInt(e.target.value) || 5
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Question Types</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {quizTypes.map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={type}
                            checked={formData.quizOptions?.types?.includes(type)}
                            onCheckedChange={(checked) => {
                              const currentTypes = formData.quizOptions?.types || [];
                              const newTypes = checked
                                ? [...currentTypes, type]
                                : currentTypes.filter(t => t !== type);
                              setFormData({
                                ...formData,
                                quizOptions: {
                                  ...formData.quizOptions!,
                                  types: newTypes
                                }
                              });
                            }}
                          />
                          <Label htmlFor={type} className="text-sm">{type}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeFlashcards"
                  checked={formData.includeFlashcards}
                  onCheckedChange={(checked) => setFormData({...formData, includeFlashcards: checked as boolean})}
                />
                <Label htmlFor="includeFlashcards">Include Flashcards</Label>
              </div>

              {formData.includeFlashcards && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="flashcardCount">Number of Flashcards</Label>
                  <Input
                    type="number"
                    min="5"
                    max="50"
                    value={formData.flashcardCount || 10}
                    onChange={(e) => setFormData({...formData, flashcardCount: parseInt(e.target.value) || 10})}
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeMindmap"
                  checked={formData.includeMindmap}
                  onCheckedChange={(checked) => setFormData({...formData, includeMindmap: checked as boolean})}
                />
                <Label htmlFor="includeMindmap">Include Mind Map</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeKeypoints"
                  checked={formData.includeKeypoints}
                  onCheckedChange={(checked) => setFormData({...formData, includeKeypoints: checked as boolean})}
                />
                <Label htmlFor="includeKeypoints">Include Key Points</Label>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Target className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-semibold">Additional Options</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="studyMaterial">Study Material (Coming Soon)</Label>
              <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">
                <Upload className="mx-auto h-8 w-8 mb-2" />
                <p className="text-sm">File upload feature coming soon, In'sha'Allah</p>
                <p className="text-xs">Upload your study materials for AI to use</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalInstructions">Additional Instructions (Optional)</Label>
              <Textarea
                placeholder="Any specific instructions for the AI course generator..."
                value={formData.additionalInstructions}
                onChange={(e) => setFormData({...formData, additionalInstructions: e.target.value})}
                rows={4}
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg font-semibold">Final Review</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalInstructions">Additional Instructions (Optional)</Label>
              <Textarea
                placeholder="Any specific requirements or additional information for the AI..."
                value={formData.additionalInstructions}
                onChange={(e) => setFormData({...formData, additionalInstructions: e.target.value})}
                rows={4}
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Course Summary:</h4>
              <ul className="text-sm space-y-1">
                <li><strong>Title:</strong> {formData.courseTitle || 'AI Generated'}</li>
                <li><strong>Level:</strong> {formData.academicLevel}</li>
                <li><strong>Subject:</strong> {formData.subject}</li>
                <li><strong>Difficulty:</strong> {formData.difficulty}</li>
                <li><strong>Duration:</strong> {formData.duration} hours</li>
                <li><strong>Type:</strong> {formData.topicBased ? `Topic: ${formData.specificTopic}` : 'Full Curriculum'}</li>
                <li><strong>Includes:</strong> {[
                  formData.includeQuiz && 'Quiz',
                  formData.includeFlashcards && 'Flashcards',
                  formData.includeMindmap && 'Mind Map',
                  formData.includeKeypoints && 'Key Points'
                ].filter(Boolean).join(', ')}</li>
                {formData.curriculum && <li><strong>Custom Curriculum:</strong> Yes</li>}
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-blue-600" />
          <span>AI Course Generator</span>
        </CardTitle>
        <Progress value={(currentStep / totalSteps) * 100} className="w-full" />
        <p className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</p>
      </CardHeader>
      <CardContent>
        {isGenerating ? (
          <CourseGenerationProgress progress={progress} />
        ) : (
          renderStep()
        )}

        {/* Hide navigation for curriculum step as it has its own navigation */}
        {currentStep !== 3 && (
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!formData.academicLevel || !formData.subject}
              >
                Next
              </Button>
            ) : (
              <div className="space-y-3">
                {/* Background Generation Option */}
                {backgroundGenerationService.isBackgroundGenerationSupported() && (
                  <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                    <Checkbox
                      id="background-generation"
                      checked={useBackgroundGeneration}
                      onCheckedChange={setUseBackgroundGeneration}
                    />
                    <Label htmlFor="background-generation" className="text-sm">
                      Generate in background (you can navigate away and get notified when done)
                    </Label>
                  </div>
                )}

                <Button
                  onClick={handleGenerateCourse}
                  disabled={isGenerating || !formData.academicLevel || !formData.subject}
                  className="w-full"
                >
                  {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {useBackgroundGeneration ? 'Queue Generation' : 'Generate Course'}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseGenerationWizard;

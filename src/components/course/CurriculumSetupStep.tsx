import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Sparkles, 
  Copy, 
  Download, 
  RefreshCw,
  BookOpen,
  Target,
  Clock,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface CurriculumSetupStepProps {
  curriculum: string;
  setCurriculum: (curriculum: string) => void;
  onNext: () => void;
  onBack: () => void;
  courseTitle: string;
  academicLevel: string;
  subject: string;
}

interface CurriculumGenerationOptions {
  curriculumType: 'global' | 'regional' | 'country';
  country?: string;
  region?: string;
  moduleCount: number;
  lessonsPerModule: number;
  focusAreas: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in weeks
}

const CurriculumSetupStep: React.FC<CurriculumSetupStepProps> = ({
  curriculum,
  setCurriculum,
  onNext,
  onBack,
  courseTitle,
  academicLevel,
  subject
}) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'generate'>('paste');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationOptions, setGenerationOptions] = useState<CurriculumGenerationOptions>({
    curriculumType: 'global',
    moduleCount: 6,
    lessonsPerModule: 4,
    focusAreas: [],
    difficulty: 'intermediate',
    duration: 12
  });
  const [streamingContent, setStreamingContent] = useState('');
  const [generatedCurriculum, setGeneratedCurriculum] = useState('');
  const { toast } = useToast();

  const handleGenerateCurriculum = async () => {
    if (!courseTitle || !academicLevel || !subject) {
      toast({
        title: 'Missing Information',
        description: 'Please complete the basic course details first.',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    setStreamingContent('');
    setGeneratedCurriculum('');

    try {
      const prompt = buildCurriculumPrompt();

      // Use direct AI service streaming instead of API route
      const { streamingAIService } = await import('@/lib/ai-service-streaming');

      // Generate curriculum content directly
      const curriculumContent = await streamingAIService.generateCourseContent(prompt, 'curriculum');

      // Simulate streaming for better UX
      const words = curriculumContent.split(' ');
      let currentContent = '';

      for (let i = 0; i < words.length; i++) {
        currentContent += words[i] + ' ';
        setStreamingContent(currentContent);

        // Add small delay to simulate streaming
        if (i % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      setGeneratedCurriculum(curriculumContent);
      setCurriculum(curriculumContent);

      toast({
        title: 'Curriculum Generated',
        description: 'Your curriculum has been generated successfully!'
      });

    } catch (error) {
      console.error('Curriculum generation error:', error);
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate curriculum. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const buildCurriculumPrompt = (): string => {
    const { curriculumType, country, region, moduleCount, lessonsPerModule, focusAreas, difficulty, duration } = generationOptions;
    
    let contextualInfo = '';
    if (curriculumType === 'country' && country) {
      contextualInfo = `following ${country}'s educational standards and curriculum guidelines`;
    } else if (curriculumType === 'regional' && region) {
      contextualInfo = `aligned with ${region} regional educational standards`;
    } else {
      contextualInfo = 'following international best practices and global educational standards';
    }

    return `Create a comprehensive curriculum for a course titled "${courseTitle}" in ${subject} for ${academicLevel} level students, ${contextualInfo}.

Course Details:
- Title: ${courseTitle}
- Subject: ${subject}
- Academic Level: ${academicLevel}
- Difficulty: ${difficulty}
- Duration: ${duration} weeks
- Structure: ${moduleCount} modules with ${lessonsPerModule} lessons each
${focusAreas.length > 0 ? `- Focus Areas: ${focusAreas.join(', ')}` : ''}

Please provide a detailed curriculum structure with:
1. Course overview and learning objectives
2. Module breakdown with titles and descriptions
3. Lesson titles and brief descriptions for each module
4. Prerequisites and learning outcomes
5. Assessment strategies
6. Recommended resources

Format the response in clear, structured markdown that can be easily edited.`;
  };

  const handleUseCurriculum = () => {
    if (activeTab === 'generate' && generatedCurriculum) {
      setCurriculum(generatedCurriculum);
    }
    onNext();
  };

  const handleCopyCurriculum = () => {
    navigator.clipboard.writeText(generatedCurriculum);
    toast({
      title: 'Copied',
      description: 'Curriculum copied to clipboard'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Curriculum Setup
          </CardTitle>
          <p className="text-sm text-gray-600">
            Define your course structure by pasting an existing curriculum or generating one with AI.
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'paste' | 'generate')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="paste" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Paste Curriculum
              </TabsTrigger>
              <TabsTrigger value="generate" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI Generate
              </TabsTrigger>
            </TabsList>

            <TabsContent value="paste" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="curriculum">Course Curriculum</Label>
                <Textarea
                  id="curriculum"
                  value={curriculum}
                  onChange={(e) => setCurriculum(e.target.value)}
                  placeholder="Paste your existing curriculum here, or describe the topics you want to cover..."
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>
              <p className="text-xs text-gray-500">
                You can paste an existing curriculum or provide a detailed outline of topics you want to cover.
              </p>
            </TabsContent>

            <TabsContent value="generate" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Curriculum Type</Label>
                  <Select
                    value={generationOptions.curriculumType}
                    onValueChange={(value) => setGenerationOptions({
                      ...generationOptions,
                      curriculumType: value as 'global' | 'regional' | 'country'
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Global Standards
                        </div>
                      </SelectItem>
                      <SelectItem value="regional">Regional Standards</SelectItem>
                      <SelectItem value="country">Country-Specific</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {generationOptions.curriculumType === 'country' && (
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Select
                      value={generationOptions.country}
                      onValueChange={(value) => setGenerationOptions({
                        ...generationOptions,
                        country: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="au">Australia</SelectItem>
                        <SelectItem value="ng">Nigeria</SelectItem>
                        <SelectItem value="in">India</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Number of Modules</Label>
                  <Input
                    type="number"
                    min="3"
                    max="12"
                    value={generationOptions.moduleCount}
                    onChange={(e) => setGenerationOptions({
                      ...generationOptions,
                      moduleCount: parseInt(e.target.value) || 6
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Lessons per Module</Label>
                  <Input
                    type="number"
                    min="2"
                    max="8"
                    value={generationOptions.lessonsPerModule}
                    onChange={(e) => setGenerationOptions({
                      ...generationOptions,
                      lessonsPerModule: parseInt(e.target.value) || 4
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Course Duration (weeks)</Label>
                  <Input
                    type="number"
                    min="4"
                    max="52"
                    value={generationOptions.duration}
                    onChange={(e) => setGenerationOptions({
                      ...generationOptions,
                      duration: parseInt(e.target.value) || 12
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Difficulty Level</Label>
                  <Select
                    value={generationOptions.difficulty}
                    onValueChange={(value) => setGenerationOptions({
                      ...generationOptions,
                      difficulty: value as 'beginner' | 'intermediate' | 'advanced'
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleGenerateCurriculum}
                disabled={isGenerating}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating Curriculum...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Curriculum
                  </>
                )}
              </Button>

              <AnimatePresence>
                {(isGenerating || generatedCurriculum) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <Label>Generated Curriculum</Label>
                      {generatedCurriculum && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyCurriculum}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </Button>
                      )}
                    </div>
                    <Textarea
                      value={isGenerating ? streamingContent : generatedCurriculum}
                      onChange={(e) => setGeneratedCurriculum(e.target.value)}
                      rows={12}
                      className="font-mono text-sm"
                      placeholder={isGenerating ? "Generating curriculum..." : ""}
                      readOnly={isGenerating}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={handleUseCurriculum}
          disabled={!curriculum && !generatedCurriculum}
          className="bg-green-600 hover:bg-green-700"
        >
          Continue with Curriculum
        </Button>
      </div>
    </div>
  );
};

export default CurriculumSetupStep;

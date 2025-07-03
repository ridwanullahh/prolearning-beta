import { config } from './config';

export interface AIProvider {
  name: string;
  generateCourse: (prompt: string) => Promise<any>;
  generateContent: (prompt: string, type: 'lesson' | 'quiz' | 'flashcard' | 'mindmap' | 'keypoints') => Promise<any>;
  isAvailable: () => boolean;
}

export interface CourseGenerationOptions {
  academicLevel: string;
  subject: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  includeQuiz: boolean;
  quizOptions?: {
    count: number;
    types: string[];
  };
  includeFlashcards: boolean;
  flashcardCount?: number;
  includeMindmap: boolean;
  includeKeypoints: boolean;
  learningStyle: string;
  tone: string;
  topicBased: boolean;
  specificTopic?: string;
  additionalInstructions?: string;
}

class ChutesAIProvider implements AIProvider {
  name = 'Chutes AI';

  async generateCourse(prompt: string): Promise<any> {
    try {
      const response = await fetch('https://llm.chutes.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.ai.chutesToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-ai/DeepSeek-V3-0324',
          messages: [
            {
              role: 'system',
              content: 'You are an expert educational content creator. Generate comprehensive course content in JSON format with lessons, quizzes, flashcards, mind maps, and key points. Ensure content is educationally sound and age-appropriate.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          stream: false,
          max_tokens: 4000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`Chutes AI API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseCourseResponse(data.choices[0].message.content);
    } catch (error) {
      console.error('Chutes AI error:', error);
      throw error;
    }
  }

  async generateContent(prompt: string, type: string): Promise<any> {
    try {
      const response = await fetch('https://llm.chutes.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.ai.chutesToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-ai/DeepSeek-V3-0324',
          messages: [
            {
              role: 'system',
              content: `You are an expert at creating ${type} content for educational purposes. Return content in JSON format suitable for the ${type} type.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          stream: false,
          max_tokens: 2000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`Chutes AI API error: ${response.status}`);
      }

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (error) {
      console.error('Chutes AI content generation error:', error);
      throw error;
    }
  }

  isAvailable(): boolean {
    return !!config.ai.chutesToken;
  }

  private parseCourseResponse(content: string): any {
    try {
      return JSON.parse(content);
    } catch {
      // Fallback parsing if JSON is malformed
      return {
        title: 'Generated Course',
        description: content.substring(0, 200),
        lessons: [
          {
            title: 'Introduction',
            content: content,
            order: 1,
            duration: 30,
            type: 'text'
          }
        ]
      };
    }
  }
}

class GeminiAIProvider implements AIProvider {
  name = 'Gemini AI';

  async generateCourse(prompt: string): Promise<any> {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${config.ai.geminiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate a comprehensive educational course in JSON format. ${prompt}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4000,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini AI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.candidates[0].content.parts[0].text;
      return this.parseCourseResponse(content);
    } catch (error) {
      console.error('Gemini AI error:', error);
      throw error;
    }
  }

  async generateContent(prompt: string, type: string): Promise<any> {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${config.ai.geminiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate ${type} content in JSON format: ${prompt}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini AI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.candidates[0].content.parts[0].text;
      return JSON.parse(content);
    } catch (error) {
      console.error('Gemini AI content generation error:', error);
      throw error;
    }
  }

  isAvailable(): boolean {
    return !!config.ai.geminiKey;
  }

  private parseCourseResponse(content: string): any {
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      return JSON.parse(content);
    } catch {
      return {
        title: 'Generated Course',
        description: content.substring(0, 200),
        lessons: [
          {
            title: 'Introduction',
            content: content,
            order: 1,
            duration: 30,
            type: 'text'
          }
        ]
      };
    }
  }
}

class CloudflareAIProvider implements AIProvider {
  name = 'Cloudflare AI';

  async generateCourse(prompt: string): Promise<any> {
    try {
      const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${config.ai.cloudflareAccountId}/ai/run/@cf/meta/llama-3.1-8b-instruct`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.ai.cloudflareToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are an expert educational content creator. Generate comprehensive course content in JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        throw new Error(`Cloudflare AI API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseCourseResponse(data.result.response);
    } catch (error) {
      console.error('Cloudflare AI error:', error);
      throw error;
    }
  }

  async generateContent(prompt: string, type: string): Promise<any> {
    try {
      const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${config.ai.cloudflareAccountId}/ai/run/@cf/meta/llama-3.1-8b-instruct`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.ai.cloudflareToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `Generate ${type} content in JSON format.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`Cloudflare AI API error: ${response.status}`);
      }

      const data = await response.json();
      return JSON.parse(data.result.response);
    } catch (error) {
      console.error('Cloudflare AI content generation error:', error);
      throw error;
    }
  }

  isAvailable(): boolean {
    return !!(config.ai.cloudflareAccountId && config.ai.cloudflareToken);
  }

  private parseCourseResponse(content: string): any {
    try {
      return JSON.parse(content);
    } catch {
      return {
        title: 'Generated Course',
        description: content.substring(0, 200),
        lessons: [
          {
            title: 'Introduction',
            content: content,
            order: 1,
            duration: 30,
            type: 'text'
          }
        ]
      };
    }
  }
}

class AIService {
  private providers: AIProvider[];
  private currentProviderIndex = 0;

  constructor() {
    this.providers = [
      new ChutesAIProvider(),
      new GeminiAIProvider(),
      new CloudflareAIProvider()
    ];
  }

  private getAvailableProviders(): AIProvider[] {
    return this.providers.filter(provider => provider.isAvailable());
  }

  private async tryWithFallback<T>(operation: (provider: AIProvider) => Promise<T>): Promise<T> {
    const availableProviders = this.getAvailableProviders();
    
    if (availableProviders.length === 0) {
      throw new Error('No AI providers available. Please configure API keys.');
    }

    let lastError: Error | null = null;

    for (let i = 0; i < availableProviders.length; i++) {
      const provider = availableProviders[i];
      try {
        console.log(`Trying AI provider: ${provider.name}`);
        const result = await operation(provider);
        console.log(`Successfully used provider: ${provider.name}`);
        return result;
      } catch (error) {
        console.warn(`Provider ${provider.name} failed:`, error);
        lastError = error as Error;
        
        // Wait before trying next provider
        if (i < availableProviders.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    throw new Error(`All AI providers failed. Last error: ${lastError?.message}`);
  }

  async generateCourse(courseSpec: any): Promise<any> {
    const prompt = this.buildCoursePrompt(courseSpec);
    
    return this.tryWithFallback(async (provider) => {
      const result = await provider.generateCourse(prompt);
      return this.validateAndFormatCourse(result, courseSpec);
    });
  }

  async generateLesson(lessonSpec: any): Promise<any> {
    const prompt = this.buildLessonPrompt(lessonSpec);
    
    return this.tryWithFallback(async (provider) => {
      return await provider.generateContent(prompt, 'lesson');
    });
  }

  async generateQuiz(quizSpec: any): Promise<any> {
    const prompt = this.buildQuizPrompt(quizSpec);
    
    return this.tryWithFallback(async (provider) => {
      return await provider.generateContent(prompt, 'quiz');
    });
  }

  async generateFlashcards(flashcardSpec: any): Promise<any> {
    const prompt = this.buildFlashcardPrompt(flashcardSpec);
    
    return this.tryWithFallback(async (provider) => {
      return await provider.generateContent(prompt, 'flashcard');
    });
  }

  async generateMindMap(mindMapSpec: any): Promise<any> {
    const prompt = this.buildMindMapPrompt(mindMapSpec);
    
    return this.tryWithFallback(async (provider) => {
      return await provider.generateContent(prompt, 'mindmap');
    });
  }

  async generateKeyPoints(keyPointsSpec: any): Promise<any> {
    const prompt = this.buildKeyPointsPrompt(keyPointsSpec);
    
    return this.tryWithFallback(async (provider) => {
      return await provider.generateContent(prompt, 'keypoints');
    });
  }

  private buildCoursePrompt(spec: any): string {
    const {
      academicLevel,
      subject,
      courseType,
      topic,
      difficulty,
      duration,
      learningStyle,
      tone,
      quizOptions,
      flashcardOptions,
      additionalComments
    } = spec;

    let prompt = `Create a comprehensive educational course with the following specifications:

Academic Level: ${academicLevel}
Subject: ${subject}
Course Type: ${courseType}
${topic ? `Specific Topic: ${topic}` : ''}
Difficulty: ${difficulty}
Duration: ${duration} minutes
Learning Style: ${learningStyle}
Tone: ${tone}

Course Requirements:
- Generate progressive lessons with clear learning objectives
- Include ${quizOptions?.count || 5} quiz questions per lesson (Types: ${quizOptions?.types?.join(', ') || 'Multiple Choice'})
- Create ${flashcardOptions?.count || 10} flashcards per lesson
- Generate mind maps for complex concepts
- Extract key points for each lesson

Content Guidelines:
- Ensure content is age-appropriate and educationally sound
- Use clear, engaging language suitable for the academic level
- Include practical examples and real-world applications
- Maintain Islamic values and avoid prohibited content
- Structure content progressively from basic to advanced concepts

${additionalComments ? `Additional Requirements: ${additionalComments}` : ''}

Return the course data in this JSON format:
{
  "title": "Course Title",
  "description": "Course description",
  "objectives": ["Learning objective 1", "Learning objective 2"],
  "lessons": [
    {
      "title": "Lesson Title",
      "description": "Lesson description",
      "content": "Detailed lesson content",
      "duration": 30,
      "order": 1,
      "objectives": ["Lesson objective 1"],
      "quiz": {
        "questions": [
          {
            "question": "Question text",
            "type": "multiple_choice",
            "options": ["A", "B", "C", "D"],
            "correct_answer": "A",
            "explanation": "Why this is correct"
          }
        ]
      },
      "flashcards": [
        {
          "front": "Question/Term",
          "back": "Answer/Definition",
          "difficulty": "easy"
        }
      ],
      "keyPoints": [
        {
          "point": "Key concept",
          "explanation": "Detailed explanation",
          "importance": "high"
        }
      ],
      "mindMap": {
        "title": "Concept Map",
        "nodes": [
          {
            "id": "1",
            "label": "Main Concept",
            "children": ["2", "3"]
          }
        ]
      }
    }
  ]
}`;

    return prompt;
  }

  private buildLessonPrompt(spec: any): string {
    return `Create a detailed lesson on "${spec.topic}" for ${spec.academicLevel} level students in ${spec.subject}. 
    Duration: ${spec.duration} minutes. Learning style: ${spec.learningStyle}. 
    Include clear explanations, examples, and practical applications.`;
  }

  private buildQuizPrompt(spec: any): string {
    return `Create ${spec.count} quiz questions about "${spec.topic}" for ${spec.academicLevel} level.
    Question types: ${spec.types.join(', ')}. Difficulty: ${spec.difficulty}.
    Include correct answers and explanations.`;
  }

  private buildFlashcardPrompt(spec: any): string {
    return `Create ${spec.count} flashcards for "${spec.topic}" at ${spec.academicLevel} level.
    Focus on key terms, concepts, and definitions. Vary difficulty levels.`;
  }

  private buildMindMapPrompt(spec: any): string {
    return `Create a mind map structure for "${spec.topic}" showing relationships between concepts.
    Include main nodes, sub-nodes, and connections. Format as JSON with nodes and relationships.`;
  }

  private buildKeyPointsPrompt(spec: any): string {
    return `Extract the most important key points from "${spec.topic}" for ${spec.academicLevel} level.
    Prioritize by importance and include brief explanations.`;
  }

  private validateAndFormatCourse(result: any, spec: any): any {
    // Ensure the result has required structure
    const course = {
      title: result.title || `${spec.subject} Course`,
      description: result.description || `A comprehensive course on ${spec.subject}`,
      academicLevelId: spec.academicLevelId,
      subjectId: spec.subjectId,
      difficulty: spec.difficulty,
      duration: spec.duration,
      isAiGenerated: true,
      courseType: spec.courseType,
      objectives: result.objectives || [],
      lessons: result.lessons || [],
      creatorType: 'ai',
      isPublished: false,
      status: 'draft'
    };

    // Validate lessons structure
    course.lessons = course.lessons.map((lesson: any, index: number) => ({
      ...lesson,
      order: lesson.order || index + 1,
      duration: lesson.duration || 30,
      type: lesson.type || 'text',
      isRequired: true
    }));

    return course;
  }

  getAvailableProviderNames(): string[] {
    return this.getAvailableProviders().map(p => p.name);
  }

  getProviderStatus(): Record<string, boolean> {
    return this.providers.reduce((status, provider) => {
      status[provider.name] = provider.isAvailable();
      return status;
    }, {} as Record<string, boolean>);
  }
}

export const aiService = new AIService();
export default aiService;

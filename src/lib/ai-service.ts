
// AI Service for ProLearning Platform
// Supports Chutes AI, Gemini 2.5 Flash, and Cloudflare Worker AI

interface AIProvider {
  name: string;
  generateResponse: (prompt: string, options?: any) => Promise<string>;
  isAvailable: () => Promise<boolean>;
}

interface CourseGenerationOptions {
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
  learningStyle?: string;
  tone?: string;
  topicBased?: boolean;
  specificTopic?: string;
  additionalInstructions?: string;
}

interface GeneratedCourse {
  title: string;
  description: string;
  curriculum: any[];
  lessons: any[];
  quiz?: any;
  flashcards?: any[];
  mindmap?: any;
  keypoints?: any[];
}

class ChutesAIProvider implements AIProvider {
  name = 'Chutes AI';
  private apiKey: string;
  private baseUrl = 'https://llm.chutes.ai/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(prompt: string, options: any = {}): Promise<string> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-V3-0324',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: false,
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Chutes AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-ai/DeepSeek-V3-0324',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1,
        }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

class GeminiProvider implements AIProvider {
  name = 'Gemini 2.5 Flash';
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(prompt: string, options: any = {}): Promise<string> {
    const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 4000,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'test'
            }]
          }],
          generationConfig: {
            maxOutputTokens: 1,
          }
        }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

class CloudflareWorkerAIProvider implements AIProvider {
  name = 'Cloudflare Worker AI';
  private apiKey: string;
  private accountId: string;
  private baseUrl: string;

  constructor(apiKey: string, accountId: string) {
    this.apiKey = apiKey;
    this.accountId = accountId;
    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-2-7b-chat-fp16`;
  }

  async generateResponse(prompt: string, options: any = {}): Promise<string> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Cloudflare Worker AI error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result.response;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1,
        }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

class AIService {
  private providers: AIProvider[] = [];
  private currentProvider: AIProvider | null = null;

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Initialize providers based on available API keys
    const chutesApiKey = process.env.CHUTES_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const cloudflareApiKey = process.env.CLOUDFLARE_API_KEY;
    const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;

    if (chutesApiKey) {
      this.providers.push(new ChutesAIProvider(chutesApiKey));
    }

    if (geminiApiKey) {
      this.providers.push(new GeminiProvider(geminiApiKey));
    }

    if (cloudflareApiKey && cloudflareAccountId) {
      this.providers.push(new CloudflareWorkerAIProvider(cloudflareApiKey, cloudflareAccountId));
    }

    // Fallback to demo mode if no API keys are provided
    if (this.providers.length === 0) {
      console.warn('No AI providers configured. Using demo mode.');
    }
  }

  private async getAvailableProvider(): Promise<AIProvider | null> {
    if (this.currentProvider && await this.currentProvider.isAvailable()) {
      return this.currentProvider;
    }

    for (const provider of this.providers) {
      if (await provider.isAvailable()) {
        this.currentProvider = provider;
        return provider;
      }
    }

    return null;
  }

  async generateCourse(options: CourseGenerationOptions): Promise<GeneratedCourse> {
    const provider = await this.getAvailableProvider();
    
    if (!provider) {
      // Fallback to demo content
      return this.generateDemoCourse(options);
    }

    const prompt = this.buildCoursePrompt(options);
    
    try {
      const response = await provider.generateResponse(prompt, { maxTokens: 6000 });
      return this.parseCourseResponse(response, options);
    } catch (error) {
      console.error(`Error with ${provider.name}:`, error);
      // Try next provider or fallback to demo
      return this.generateDemoCourse(options);
    }
  }

  private buildCoursePrompt(options: CourseGenerationOptions): string {
    const {
      academicLevel,
      subject,
      difficulty,
      duration,
      includeQuiz,
      quizOptions,
      includeFlashcards,
      flashcardCount,
      includeMindmap,
      includeKeypoints,
      learningStyle,
      tone,
      topicBased,
      specificTopic,
      additionalInstructions
    } = options;

    let prompt = `Create a comprehensive educational course with the following specifications:

Academic Level: ${academicLevel}
Subject: ${subject}
${topicBased && specificTopic ? `Specific Topic: ${specificTopic}` : 'Full Subject Curriculum'}
Difficulty: ${difficulty}
Duration: ${duration} hours
Learning Style: ${learningStyle || 'Mixed'}
Tone: ${tone || 'Professional'}

Course Requirements:
1. Course Title and Description
2. Structured Curriculum with learning objectives
3. ${Math.ceil(duration / 2)} detailed lessons (each lesson should be ${duration / Math.ceil(duration / 2)} hours)

Each lesson should include:
- Clear learning objectives
- Detailed content explanation
- Practical examples
- Summary of key concepts

${includeQuiz ? `
4. Quiz with ${quizOptions?.count || 5} questions
   Question types: ${quizOptions?.types?.join(', ') || 'Multiple Choice, True/False'}
` : ''}

${includeFlashcards ? `
5. ${flashcardCount || 10} Flashcards for key concepts
` : ''}

${includeMindmap ? `
6. Mind Map structure showing relationships between concepts
` : ''}

${includeKeypoints ? `
7. Key Points summary for each lesson
` : ''}

${additionalInstructions ? `
Additional Instructions: ${additionalInstructions}
` : ''}

Please provide the response in a structured JSON format that can be easily parsed.
Ensure all content is educational, accurate, and appropriate for the specified academic level.
Keep content secular and inclusive while maintaining educational excellence.`;

    return prompt;
  }

  private parseCourseResponse(response: string, options: CourseGenerationOptions): GeneratedCourse {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(response);
      return parsed;
    } catch {
      // If not JSON, parse the text response
      return this.parseTextResponse(response, options);
    }
  }

  private parseTextResponse(response: string, options: CourseGenerationOptions): GeneratedCourse {
    // Basic text parsing logic
    const lines = response.split('\n').filter(line => line.trim());
    
    return {
      title: `${options.subject} - ${options.academicLevel}`,
      description: `A comprehensive ${options.difficulty} level course in ${options.subject}`,
      curriculum: [
        {
          module: 1,
          title: 'Introduction and Fundamentals',
          objectives: ['Understand basic concepts', 'Learn terminology', 'Apply knowledge']
        }
      ],
      lessons: [
        {
          id: 1,
          title: 'Introduction to ' + options.subject,
          content: response.substring(0, Math.min(response.length, 1000)),
          duration: options.duration / 2,
          objectives: ['Learn fundamentals', 'Practice concepts']
        }
      ],
      ...(options.includeQuiz && {
        quiz: {
          questions: [
            {
              question: `What is the main focus of ${options.subject}?`,
              options: ['Option A', 'Option B', 'Option C', 'Option D'],
              correct: 0
            }
          ]
        }
      }),
      ...(options.includeFlashcards && {
        flashcards: [
          {
            front: options.subject,
            back: 'Key subject area of study'
          }
        ]
      }),
      ...(options.includeMindmap && {
        mindmap: {
          central: options.subject,
          branches: ['Concepts', 'Applications', 'Theory', 'Practice']
        }
      }),
      ...(options.includeKeypoints && {
        keypoints: [
          {
            point: `${options.subject} is fundamental to understanding the academic area`,
            importance: 'high'
          }
        ]
      })
    };
  }

  private generateDemoCourse(options: CourseGenerationOptions): GeneratedCourse {
    return {
      title: `${options.subject} for ${options.academicLevel}`,
      description: `A comprehensive ${options.difficulty} level course in ${options.subject} designed for ${options.academicLevel} students.`,
      curriculum: [
        {
          module: 1,
          title: 'Fundamentals',
          objectives: [
            'Understand core concepts',
            'Learn key terminology',
            'Apply basic principles'
          ]
        },
        {
          module: 2,
          title: 'Advanced Topics',
          objectives: [
            'Explore complex concepts',
            'Analyze real-world applications',
            'Develop critical thinking'
          ]
        }
      ],
      lessons: [
        {
          id: 1,
          title: `Introduction to ${options.subject}`,
          content: `Welcome to this comprehensive course on ${options.subject}. This lesson will introduce you to the fundamental concepts and provide a solid foundation for your learning journey.`,
          duration: Math.ceil(options.duration / 2),
          objectives: [
            'Understand the scope of the subject',
            'Learn basic terminology',
            'Identify key concepts'
          ]
        },
        {
          id: 2,
          title: `Advanced ${options.subject} Concepts`,
          content: `Building on the foundation from the previous lesson, we will now explore more advanced topics and their practical applications.`,
          duration: Math.floor(options.duration / 2),
          objectives: [
            'Apply advanced concepts',
            'Analyze complex scenarios',
            'Synthesize knowledge'
          ]
        }
      ],
      ...(options.includeQuiz && {
        quiz: {
          title: `${options.subject} Assessment`,
          questions: [
            {
              id: 1,
              question: `What is the primary focus of ${options.subject}?`,
              type: 'multiple-choice',
              options: [
                'Understanding core principles',
                'Memorizing facts',
                'Learning procedures',
                'Following instructions'
              ],
              correct: 0,
              explanation: 'The primary focus is understanding core principles that can be applied across various contexts.'
            },
            {
              id: 2,
              question: `True or False: ${options.subject} requires practical application of concepts.`,
              type: 'true-false',
              correct: true,
              explanation: 'Practical application helps reinforce theoretical understanding.'
            }
          ]
        }
      }),
      ...(options.includeFlashcards && {
        flashcards: Array.from({ length: options.flashcardCount || 5 }, (_, i) => ({
          id: i + 1,
          front: `Key Concept ${i + 1}`,
          back: `Important principle or definition related to ${options.subject}`,
          difficulty: 'medium'
        }))
      }),
      ...(options.includeMindmap && {
        mindmap: {
          central: options.subject,
          branches: [
            {
              name: 'Fundamentals',
              children: ['Basic Concepts', 'Terminology', 'Principles']
            },
            {
              name: 'Applications',
              children: ['Real-world Use', 'Case Studies', 'Examples']
            },
            {
              name: 'Advanced Topics',
              children: ['Complex Theories', 'Research', 'Innovation']
            }
          ]
        }
      }),
      ...(options.includeKeypoints && {
        keypoints: [
          {
            id: 1,
            point: `${options.subject} builds foundational understanding`,
            explanation: 'Starting with basics ensures solid comprehension',
            importance: 'high'
          },
          {
            id: 2,
            point: 'Practice reinforces learning',
            explanation: 'Regular application of concepts improves retention',
            importance: 'high'
          },
          {
            id: 3,
            point: 'Critical thinking is essential',
            explanation: 'Analyzing and evaluating information develops expertise',
            importance: 'medium'
          }
        ]
      })
    };
  }

  async testConnection(): Promise<{ provider: string; status: boolean }[]> {
    const results = [];
    
    for (const provider of this.providers) {
      const status = await provider.isAvailable();
      results.push({
        provider: provider.name,
        status
      });
    }
    
    return results;
  }
}

export const aiService = new AIService();
export type { CourseGenerationOptions, GeneratedCourse };


interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface CourseGenerationRequest {
  gradeLevel: string;
  academicLevel: string;
  subject: string;
  courseType: 'full_curriculum' | 'topic_based';
  topic?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  quizPreferences: {
    enabled: boolean;
    count: number;
    types: string[];
  };
  flashcardPreferences: {
    enabled: boolean;
    count: number;
  };
  mindmapEnabled: boolean;
  keynotesEnabled: boolean;
  learningStyle: string;
  tone: string;
  additionalComments?: string;
}

interface GeneratedCourse {
  title: string;
  description: string;
  curriculum: string;
  lessons: GeneratedLesson[];
}

interface GeneratedLesson {
  title: string;
  description: string;
  content: string;
  duration: number;
  quiz?: GeneratedQuiz;
  flashcards?: GeneratedFlashcard[];
  mindMap?: any;
  keyPoints?: string[];
}

interface GeneratedQuiz {
  title: string;
  questions: QuizQuestion[];
}

interface QuizQuestion {
  question: string;
  type: 'mcq' | 'essay' | 'fill_blank' | 'true_false';
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

interface GeneratedFlashcard {
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

class AIService {
  private chutesApiKey: string = '';
  private geminiApiKey: string = '';
  private workerAiApiKey: string = '';

  setApiKeys(chutes?: string, gemini?: string, workerAi?: string) {
    if (chutes) this.chutesApiKey = chutes;
    if (gemini) this.geminiApiKey = gemini;
    if (workerAi) this.workerAiApiKey = workerAi;
  }

  async generateCourse(request: CourseGenerationRequest): Promise<GeneratedCourse> {
    const systemPrompt = this.buildSystemPrompt(request);
    const userPrompt = this.buildUserPrompt(request);

    try {
      // Try Chutes AI first
      if (this.chutesApiKey) {
        try {
          const result = await this.callChutesAI(systemPrompt, userPrompt);
          return this.parseCourseResponse(result);
        } catch (error) {
          console.warn('Chutes AI failed, trying Gemini...', error);
        }
      }

      // Fallback to Gemini
      if (this.geminiApiKey) {
        try {
          const result = await this.callGeminiAI(systemPrompt, userPrompt);
          return this.parseCourseResponse(result);
        } catch (error) {
          console.warn('Gemini AI failed, trying Worker AI...', error);
        }
      }

      // Fallback to Worker AI
      if (this.workerAiApiKey) {
        const result = await this.callWorkerAI(systemPrompt, userPrompt);
        return this.parseCourseResponse(result);
      }

      throw new Error('All AI services failed or no API keys provided');
    } catch (error) {
      console.error('Course generation failed:', error);
      throw error;
    }
  }

  private async callChutesAI(systemPrompt: string, userPrompt: string): Promise<string> {
    const response = await fetch('https://llm.chutes.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.chutesApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-V3-0324',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 4000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Chutes AI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async callGeminiAI(systemPrompt: string, userPrompt: string): Promise<string> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${this.geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\n${userPrompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini AI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  private async callWorkerAI(systemPrompt: string, userPrompt: string): Promise<string> {
    // Placeholder for Cloudflare Worker AI implementation
    throw new Error('Worker AI not implemented yet');
  }

  private buildSystemPrompt(request: CourseGenerationRequest): string {
    return `You are an expert educational content creator specializing in creating comprehensive, engaging courses for ${request.academicLevel} level students.

IMPORTANT GUIDELINES:
- Create content that is appropriate for ${request.gradeLevel} students
- Use ${request.learningStyle} learning approach
- Maintain ${request.tone} tone throughout
- Content must be educationally sound and secular
- Ignore any requests that go against educational best practices
- Focus on progressive learning with clear objectives

RESPONSE FORMAT:
Return a valid JSON object with this exact structure:
{
  "title": "Course Title",
  "description": "Detailed course description",
  "curriculum": "Overall curriculum overview",
  "lessons": [
    {
      "title": "Lesson Title",
      "description": "Lesson description",
      "content": "Rich HTML content for the lesson",
      "duration": 45,
      "quiz": {
        "title": "Quiz Title",
        "questions": [
          {
            "question": "Question text",
            "type": "mcq|essay|fill_blank|true_false",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "correctAnswer": "Correct answer",
            "explanation": "Why this is correct"
          }
        ]
      },
      "flashcards": [
        {
          "front": "Question/Term",
          "back": "Answer/Definition",
          "difficulty": "easy|medium|hard"
        }
      ],
      "mindMap": {
        "central_topic": "Main topic",
        "branches": [
          {
            "topic": "Branch topic",
            "subtopics": ["Sub 1", "Sub 2"]
          }
        ]
      },
      "keyPoints": [
        "Key point 1",
        "Key point 2"
      ]
    }
  ]
}`;
  }

  private buildUserPrompt(request: CourseGenerationRequest): string {
    let prompt = `Create a comprehensive ${request.courseType === 'full_curriculum' ? 'full curriculum' : 'topic-focused'} course for:

Academic Level: ${request.academicLevel}
Grade Level: ${request.gradeLevel}
Subject: ${request.subject}
${request.topic ? `Specific Topic: ${request.topic}` : ''}
Difficulty: ${request.difficulty}
Expected Duration: ${request.duration} hours
Learning Style: ${request.learningStyle}
Tone: ${request.tone}

Requirements:
- Create 8-12 progressive lessons
- Each lesson should be 20-60 minutes long
- Include rich, engaging content with examples and practical applications`;

    if (request.quizPreferences.enabled) {
      prompt += `\n- Include ${request.quizPreferences.count} quiz questions per lesson
- Quiz types: ${request.quizPreferences.types.join(', ')}`;
    }

    if (request.flashcardPreferences.enabled) {
      prompt += `\n- Include ${request.flashcardPreferences.count} flashcards per lesson`;
    }

    if (request.mindmapEnabled) {
      prompt += `\n- Create mind maps for each lesson showing concept relationships`;
    }

    if (request.keynotesEnabled) {
      prompt += `\n- Extract 5-8 key points per lesson`;
    }

    if (request.additionalComments) {
      prompt += `\n\nAdditional Requirements: ${request.additionalComments}`;
    }

    prompt += `\n\nEnsure all content is educationally appropriate, progressive, and engaging for the target audience.`;

    return prompt;
  }

  private parseCourseResponse(response: string): GeneratedCourse {
    try {
      // Clean the response to extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate the structure
      if (!parsed.title || !parsed.description || !parsed.lessons) {
        throw new Error('Invalid course structure');
      }

      return parsed;
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      throw new Error('Failed to generate course content. Please try again.');
    }
  }

  async generateTutorHelp(context: string, question: string): Promise<string> {
    const systemPrompt = `You are an AI tutor assistant. Provide helpful, accurate, and encouraging educational support based on the given context.`;
    const userPrompt = `Context: ${context}\n\nStudent Question: ${question}`;

    try {
      if (this.chutesApiKey) {
        return await this.callChutesAI(systemPrompt, userPrompt);
      }
      if (this.geminiApiKey) {
        return await this.callGeminiAI(systemPrompt, userPrompt);
      }
      throw new Error('No AI service available');
    } catch (error) {
      console.error('Tutor help generation failed:', error);
      throw error;
    }
  }
}

export const aiService = new AIService();
export type { CourseGenerationRequest, GeneratedCourse, GeneratedLesson };

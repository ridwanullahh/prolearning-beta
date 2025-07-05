
import { config } from './config';
import { db } from './github-sdk';

export interface StreamingAIService {
  generateCourseWithStreaming: (courseSpec: any, onProgress: (progress: any) => void) => Promise<any>;
}

class StreamingCourseGenerator {
  private currentProvider: any;

  constructor() {
    this.currentProvider = config.ai.primaryProvider;
  }

  async generateCourseWithStreaming(courseSpec: any, onProgress: (progress: any) => void) {
    try {
      // Step 1: Generate curriculum
      onProgress({ 
        step: 'curriculum', 
        message: 'Creating course curriculum...', 
        progress: 10 
      });

      const curriculum = await this.generateCurriculum(courseSpec);
      
      onProgress({ 
        step: 'curriculum', 
        message: 'Curriculum created successfully!', 
        progress: 20,
        data: curriculum
      });

      // Step 2: Generate lessons with content
      const lessons = [];
      const totalLessons = curriculum.lessons?.length || 1;
      
      for (let i = 0; i < totalLessons; i++) {
        const lessonSpec = curriculum.lessons[i];
        
        onProgress({ 
          step: 'lesson', 
          message: `Generating lesson ${i + 1}: ${lessonSpec.title}...`, 
          progress: 20 + (i / totalLessons) * 60,
          currentLesson: i + 1,
          totalLessons: totalLessons
        });

        const lesson = await this.generateLessonContent(lessonSpec, courseSpec, curriculum);
        lessons.push(lesson);
        
        onProgress({ 
          step: 'lesson', 
          message: `Lesson ${i + 1} completed!`, 
          progress: 20 + ((i + 1) / totalLessons) * 60,
          currentLesson: i + 1,
          totalLessons: totalLessons,
          lesson: lesson
        });
      }

      // Step 3: Finalize course
      onProgress({ 
        step: 'finalize', 
        message: 'Finalizing course...', 
        progress: 90 
      });

      const course = {
        ...curriculum,
        lessons: lessons,
        isComplete: true
      };

      onProgress({ 
        step: 'complete', 
        message: 'Course generation completed!', 
        progress: 100,
        course: course
      });

      return course;
    } catch (error) {
      onProgress({ 
        step: 'error', 
        message: `Error: ${error.message}`, 
        progress: 0,
        error: error
      });
      throw error;
    }
  }

  private async generateCurriculum(courseSpec: any) {
    const prompt = this.buildCurriculumPrompt(courseSpec);
    
    try {
      const response = await this.callAIProvider(prompt, 'curriculum');
      return this.parseCurriculumResponse(response, courseSpec);
    } catch (error) {
      console.error('Curriculum generation error:', error);
      throw error;
    }
  }

  private async generateLessonContent(lessonSpec: any, courseSpec: any, curriculum: any) {
    const contentPrompt = this.buildLessonContentPrompt(lessonSpec, courseSpec, curriculum);
    
    const lesson = {
      ...lessonSpec,
      contents: [],
      quiz: null,
      flashcards: [],
      keyPoints: [],
      mindMap: null
    };

    // Generate different content types based on course spec
    if (courseSpec.includeRichContent) {
      const contentResponse = await this.callAIProvider(contentPrompt, 'lesson_content');
      lesson.contents = this.parseContentResponse(contentResponse);
    }

    if (courseSpec.includeQuiz) {
      const quizPrompt = this.buildQuizPrompt(lessonSpec, courseSpec);
      const quizResponse = await this.callAIProvider(quizPrompt, 'quiz');
      lesson.quiz = this.parseQuizResponse(quizResponse);
    }

    if (courseSpec.includeFlashcards) {
      const flashcardPrompt = this.buildFlashcardPrompt(lessonSpec, courseSpec);
      const flashcardResponse = await this.callAIProvider(flashcardPrompt, 'flashcard');
      lesson.flashcards = this.parseFlashcardResponse(flashcardResponse);
    }

    if (courseSpec.includeKeypoints) {
      const keyPointsPrompt = this.buildKeyPointsPrompt(lessonSpec, courseSpec);
      const keyPointsResponse = await this.callAIProvider(keyPointsPrompt, 'keypoints');
      lesson.keyPoints = this.parseKeyPointsResponse(keyPointsResponse);
    }

    if (courseSpec.includeMindmap) {
      const mindMapPrompt = this.buildMindMapPrompt(lessonSpec, courseSpec);
      const mindMapResponse = await this.callAIProvider(mindMapPrompt, 'mindmap');
      lesson.mindMap = this.parseMindMapResponse(mindMapResponse);
    }

    return lesson;
  }

  private async callAIProvider(prompt: string, type: string) {
    // Try Chutes AI first
    if (config.ai.chutesToken) {
      try {
        const response = await fetch('https://llm.chutes.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.ai.chutesToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: config.ai.chutesModel,
            messages: [
              {
                role: 'system',
                content: `You are an expert educational content creator. Generate ${type} content in JSON format.`
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

        if (response.ok) {
          const data = await response.json();
          return data.choices[0].message.content;
        }
      } catch (error) {
        console.warn('Chutes AI failed, trying Gemini:', error);
      }
    }

    // Fallback to Gemini
    if (config.ai.geminiKey) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.ai.geminiModel}:generateContent?key=${config.ai.geminiKey}`, {
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
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 4000,
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          return data.candidates[0].content.parts[0].text;
        }
      } catch (error) {
        console.error('Gemini AI failed:', error);
      }
    }

    throw new Error('All AI providers failed');
  }

  private buildCurriculumPrompt(spec: any): string {
    return `Create a comprehensive course curriculum for "${spec.courseTitle}" at ${spec.academicLevel} level in ${spec.subject}.

Course Details:
- Type: ${spec.courseType}
- Topic: ${spec.topic || 'General'}
- Difficulty: ${spec.difficulty}
- Duration: ${spec.duration} minutes total
- Learning Style: ${spec.learningStyle}
- Tone: ${spec.tone}

Requirements:
- Create 4-8 progressive lessons
- Each lesson should build on previous concepts
- Include clear learning objectives for each lesson
- Ensure age-appropriate content
- Follow Islamic educational values

Return JSON format:
{
  "title": "Course Title",
  "description": "Course description",
  "objectives": ["objective1", "objective2"],
  "lessons": [
    {
      "title": "Lesson Title",
      "description": "Lesson description",
      "objectives": ["lesson objective"],
      "order": 1,
      "duration": 30
    }
  ]
}`;
  }

  private buildLessonContentPrompt(lessonSpec: any, courseSpec: any, curriculum: any): string {
    return `Create comprehensive content for lesson "${lessonSpec.title}" in the course "${curriculum.title}".

Lesson Context:
- Order: ${lessonSpec.order}
- Duration: ${lessonSpec.duration} minutes
- Objectives: ${lessonSpec.objectives?.join(', ') || 'General learning'}
- Course Level: ${courseSpec.academicLevel}
- Subject: ${courseSpec.subject}

Content Requirements:
- Create multiple content blocks with different types
- Include introduction, main content, examples, and summary
- Use rich formatting with headings, bullet points, emphasis
- Make content engaging and age-appropriate
- Include practical examples and real-world applications

Return JSON format:
[
  {
    "title": "Introduction",
    "type": "rich_text",
    "content": "# Introduction\n\nWelcome to this lesson...",
    "order": 1
  },
  {
    "title": "Main Concepts",
    "type": "rich_text", 
    "content": "## Key Concepts\n\n### Concept 1\nDetailed explanation...",
    "order": 2
  },
  {
    "title": "Examples",
    "type": "rich_text",
    "content": "## Practical Examples\n\n1. Example 1...",
    "order": 3
  },
  {
    "title": "Summary",
    "type": "rich_text",
    "content": "## Lesson Summary\n\nIn this lesson we learned...",
    "order": 4
  }
]`;
  }

  private buildQuizPrompt(lessonSpec: any, courseSpec: any): string {
    return `Create a quiz for lesson "${lessonSpec.title}" at ${courseSpec.academicLevel} level.

Requirements:
- 3-5 questions of varying difficulty
- Mix of multiple choice and other question types
- Include explanations for correct answers
- Ensure questions test understanding, not just memorization

Return JSON format:
{
  "title": "Quiz: ${lessonSpec.title}",
  "questions": [
    {
      "id": "q1",
      "question": "Question text",
      "type": "multiple_choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Explanation of why this is correct"
    }
  ],
  "passingScore": 70,
  "attempts": 3
}`;
  }

  private buildFlashcardPrompt(lessonSpec: any, courseSpec: any): string {
    return `Create flashcards for lesson "${lessonSpec.title}" at ${courseSpec.academicLevel} level.

Requirements:
- 5-8 flashcards covering key concepts
- Vary difficulty levels
- Include terms, definitions, and examples

Return JSON format:
[
  {
    "front": "Question or term",
    "back": "Answer or definition", 
    "difficulty": "easy|medium|hard",
    "hint": "Optional hint"
  }
]`;
  }

  private buildKeyPointsPrompt(lessonSpec: any, courseSpec: any): string {
    return `Extract key points from lesson "${lessonSpec.title}" at ${courseSpec.academicLevel} level.

Requirements:
- 4-6 most important concepts
- Clear, concise explanations
- Prioritize by importance

Return JSON format:
[
  {
    "point": "Key concept",
    "explanation": "Detailed explanation",
    "importance": "high|medium|low",
    "examples": "Optional examples"
  }
]`;
  }

  private buildMindMapPrompt(lessonSpec: any, courseSpec: any): string {
    return `Create a mind map for lesson "${lessonSpec.title}" at ${courseSpec.academicLevel} level.

Requirements:
- Central concept with branching sub-concepts
- Clear hierarchical structure
- Visual organization of information

Return JSON format:
{
  "title": "Mind Map: ${lessonSpec.title}",
  "data": {
    "nodes": [
      {
        "id": "1",
        "label": "Central Concept",
        "children": ["2", "3", "4"]
      },
      {
        "id": "2", 
        "label": "Sub-concept 1",
        "children": []
      }
    ]
  }
}`;
  }

  private parseCurriculumResponse(content: string, spec: any) {
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      return JSON.parse(content);
    } catch {
      return {
        title: spec.courseTitle || 'Generated Course',
        description: content.substring(0, 200),
        objectives: ['Learn key concepts', 'Apply knowledge'],
        lessons: [
          {
            title: 'Introduction',
            description: 'Course introduction',
            objectives: ['Understand course goals'],
            order: 1,
            duration: 30
          }
        ]
      };
    }
  }

  private parseContentResponse(content: string) {
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      return JSON.parse(content);
    } catch {
      return [
        {
          title: 'Lesson Content',
          type: 'rich_text',
          content: content,
          order: 1
        }
      ];
    }
  }

  private parseQuizResponse(content: string) {
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      return JSON.parse(content);
    } catch {
      return {
        title: 'Quiz',
        questions: [
          {
            id: 'q1',
            question: 'Sample question based on lesson content',
            type: 'multiple_choice',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: 'Option A',
            explanation: 'This is the correct answer because...'
          }
        ],
        passingScore: 70,
        attempts: 3
      };
    }
  }

  private parseFlashcardResponse(content: string) {
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      return JSON.parse(content);
    } catch {
      return [
        {
          front: 'Key Term',
          back: 'Definition or explanation',
          difficulty: 'medium'
        }
      ];
    }
  }

  private parseKeyPointsResponse(content: string) {
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      return JSON.parse(content);
    } catch {
      return [
        {
          point: 'Important Concept',
          explanation: 'Detailed explanation of the concept',
          importance: 'high'
        }
      ];
    }
  }

  private parseMindMapResponse(content: string) {
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      return JSON.parse(content);
    } catch {
      return {
        title: 'Mind Map',
        data: {
          nodes: [
            {
              id: '1',
              label: 'Main Topic',
              children: ['2', '3']
            },
            {
              id: '2',
              label: 'Subtopic 1',
              children: []
            },
            {
              id: '3',
              label: 'Subtopic 2', 
              children: []
            }
          ]
        }
      };
    }
  }
}

export const streamingAIService = new StreamingCourseGenerator();

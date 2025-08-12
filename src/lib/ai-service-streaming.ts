
import { config } from './config';
import { db } from './github-sdk';
import { aiGuidelinesService } from './ai-guidelines-service';
import { apiKeyRotationService } from './api-key-rotation';

export interface StreamingAIService {
  generateCourseWithStreaming: (courseSpec: any, onProgress: (progress: any) => void) => Promise<any>;
}

class StreamingCourseGenerator {
  private currentProvider: any;

  constructor() {
    this.currentProvider = config.ai.primaryProvider;
  }

  // Public method for plain content generation used by API endpoints
  public async generateCourseContent(prompt: string, type: string): Promise<string> {
    return await this.executeAIRequest(prompt, type);
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
      let successfulLessons = 0;

      for (let i = 0; i < totalLessons; i++) {
        const lessonSpec = curriculum.lessons[i];

        onProgress({
          step: 'lesson',
          message: `Generating lesson ${i + 1}: ${lessonSpec.title}...`,
          progress: 20 + (i / totalLessons) * 60,
          currentLesson: i + 1,
          totalLessons: totalLessons
        });

        // Retry lesson generation until successful - NO SKIPPING
        let lessonGenerated = false;
        let lessonRetryCount = 0;
        const maxLessonRetries = 5; // Increased retries for lesson generation
        let lesson: any = null;

        while (!lessonGenerated && lessonRetryCount < maxLessonRetries) {
          try {
            lesson = await this.generateLessonContent(lessonSpec, courseSpec, curriculum);
            lessonGenerated = true;
            lessons.push(lesson);
            successfulLessons++;

            onProgress({
              step: 'lesson',
              message: `Lesson ${i + 1} generated successfully!`,
              progress: 20 + ((i + 1) / totalLessons) * 60,
              currentLesson: i + 1,
              totalLessons: totalLessons,
              lesson: lesson,
            });
          } catch (lessonError: any) {
            lessonRetryCount++;
            console.error(`Error generating lesson ${i + 1} (attempt ${lessonRetryCount}):`, lessonError);

            if (lessonRetryCount >= maxLessonRetries) {
              throw new Error(`Failed to generate lesson ${i + 1} after ${maxLessonRetries} attempts: ${lessonError.message}`);
            } else {
              onProgress({
                step: 'retry',
                message: `Retrying lesson ${i + 1} generation (attempt ${lessonRetryCount + 1}/${maxLessonRetries})...`,
                progress: 20 + (i / totalLessons) * 60,
                currentLesson: i + 1,
                totalLessons: totalLessons,
              });

              // Exponential backoff for lesson retry
              await new Promise(resolve => setTimeout(resolve, 2000 * Math.pow(2, lessonRetryCount - 1)));
            }
          }
        }

        // Persist lesson to DB using GitHub SDK with retry logic - NO SKIPPING
        if (lesson) {
          let dbSaveSuccess = false;
          let dbRetryCount = 0;
          const maxDbRetries = 5; // Increased retries for DB saves

          while (!dbSaveSuccess && dbRetryCount < maxDbRetries) {
            try {
              await db.insert('lessons', { ...lesson, isAiGenerated: true });
              dbSaveSuccess = true;

              onProgress({
                step: 'lesson',
                message: `Lesson ${i + 1} completed and saved!`,
                progress: 20 + ((i + 1) / totalLessons) * 60,
                currentLesson: i + 1,
                totalLessons: totalLessons,
                lesson: lesson,
              });
            } catch (dbError: any) {
              dbRetryCount++;
              console.error(`Error saving lesson ${i + 1} to DB (attempt ${dbRetryCount}):`, dbError);

              if (dbRetryCount >= maxDbRetries) {
                throw new Error(`Failed to save lesson ${i + 1} to database after ${maxDbRetries} attempts: ${dbError.message}`);
              } else {
                onProgress({
                  step: 'retry',
                  message: `Retrying lesson ${i + 1} database save (attempt ${dbRetryCount + 1}/${maxDbRetries})...`,
                  progress: 20 + ((i + 1) / totalLessons) * 60,
                  currentLesson: i + 1,
                  totalLessons: totalLessons,
                });

                // Wait before DB retry
                await new Promise(resolve => setTimeout(resolve, 1000 * dbRetryCount));
              }
            }
          }
        }
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
      const curriculumContent = await this.callAIProvider(prompt, 'curriculum');
      return this.parseCurriculumResponse(curriculumContent, courseSpec);
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

    // Generate lesson content blocks first
    lesson.contents = await this.generateLessonContentBlocks(lessonSpec, courseSpec, curriculum);

    // Generate other learning tools after lesson content is available
    if (courseSpec.includeQuiz) {
      lesson.quiz = await this.generateQuiz(lessonSpec, courseSpec, lesson.contents);
    }

    if (courseSpec.includeFlashcards) {
      lesson.flashcards = await this.generateFlashcards(lessonSpec, courseSpec, lesson.contents);
    }

    if (courseSpec.includeKeypoints) {
      lesson.keyPoints = await this.generateKeyPoints(lessonSpec, courseSpec, lesson.contents);
    }

    if (courseSpec.includeMindmap) {
      lesson.mindMap = await this.generateMindMap(lessonSpec, courseSpec, lesson.contents);
    }

    return lesson;
  }

  private async generateLessonContentBlocks(lessonSpec: any, courseSpec: any, curriculum: any) {
    const contentPrompt = this.buildLessonContentPrompt(lessonSpec, courseSpec, curriculum);
    const contentResponse = await this.callAIProvider(contentPrompt, 'lesson_content');
    return this.parseContentResponse(contentResponse);
  }

  private async generateQuiz(lessonSpec: any, courseSpec: any, lessonContent: any) {
    const quizPrompt = this.buildQuizPrompt(lessonSpec, courseSpec, lessonContent);
    const quizResponse = await this.callAIProvider(quizPrompt, 'quiz');
    return this.parseQuizResponse(quizResponse);
  }

  private async generateFlashcards(lessonSpec: any, courseSpec: any, lessonContent: any) {
    const flashcardPrompt = this.buildFlashcardPrompt(lessonSpec, courseSpec, lessonContent);
    const flashcardResponse = await this.callAIProvider(flashcardPrompt, 'flashcard');
    return this.parseFlashcardResponse(flashcardResponse);
  }

  private async generateKeyPoints(lessonSpec: any, courseSpec: any, lessonContent: any) {
    const keyPointsPrompt = this.buildKeyPointsPrompt(lessonSpec, courseSpec, lessonContent);
    const keyPointsResponse = await this.callAIProvider(keyPointsPrompt, 'keypoints');
    return this.parseKeyPointsResponse(keyPointsResponse);
  }

  private async generateMindMap(lessonSpec: any, courseSpec: any, lessonContent: any) {
    const mindMapPrompt = this.buildMindMapPrompt(lessonSpec, courseSpec, lessonContent);
    const mindMapResponse = await this.callAIProvider(mindMapPrompt, 'mindmap');
    return this.parseMindMapResponse(mindMapResponse);
  }

  private requestQueue: { prompt: string; type: string; resolve: (value: string | PromiseLike<string>) => void; reject: (reason?: any) => void }[] = [];
  private isProcessingQueue = false;

  private async callAIProvider(prompt: string, type: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ prompt, type, resolve, reject });
      this.processRequestQueue();
    });
  }

  private async processRequestQueue() {
    if (this.isProcessingQueue) return;
    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (!request) continue;

      const { prompt, type, resolve, reject } = request;

      try {
        const content = await this.executeAIRequest(prompt, type);
        resolve(content);
      } catch (error) {
        console.error('AI request failed:', error);
        reject(error);
      }

      // Smart rate limiting based on available keys
      if (!apiKeyRotationService.hasAvailableKeys()) {
        const waitTime = apiKeyRotationService.getEstimatedWaitTime();
        console.log(`Waiting ${waitTime}ms for API keys to become available...`);
        await new Promise(resolve => setTimeout(resolve, Math.min(waitTime, 30000))); // Max 30s wait
      } else {
        // Standard delay between requests to be safe
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    this.isProcessingQueue = false;
  }

  private async executeAIRequest(prompt: string, type: string): Promise<string> {
    // Get AI guidelines for this content type
    const guidelinesPrompt = await aiGuidelinesService.buildGuidelinesPrompt(type, 'content');

    // Retry logic for AI requests
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
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
                  content: `You are an expert educational content creator. Generate ${type} content in JSON format. IMPORTANT: Your response must only be the JSON object, without any markdown, backticks, or other explanatory text.

${guidelinesPrompt}`
                },
                {
                  role: 'user',
                  content: prompt
                }
              ],
              stream: true,
              max_tokens: 8000,
              temperature: 0.7
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Chutes AI error: ${response.status} - ${errorText}`);
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('ReadableStream not available');
          }

          let fullContent = '';
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.choices?.[0]?.delta?.content) {
                    fullContent += parsed.choices[0].delta.content;
                  }
                } catch (e) {
                  // Skip invalid JSON lines
                  continue;
                }
              }
            }
          }

          if (fullContent.trim()) {
            return fullContent;
          } else {
            throw new Error('Empty response from Chutes AI');
          }
        } catch (error) {
          lastError = error as Error;
          console.warn(`Chutes AI attempt ${attempt} failed:`, error);
          if (attempt < maxRetries) {
            // Wait before retry with exponential backoff
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
            continue;
          }
        }
      }

      // Fallback to Gemini with key rotation
      const geminiKey = apiKeyRotationService.getNextGeminiKey();
      if (geminiKey) {
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.ai.geminiModel}:generateContent?key=${geminiKey}`, {
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
                maxOutputTokens: 8000,
              }
            })
          });

        if (response.ok) {
          const data = await response.json();
          console.log('Gemini response:', JSON.stringify(data, null, 2));

          // Check for finish reason and handle truncation
          if (data.candidates && data.candidates[0]) {
            const candidate = data.candidates[0];

            if (candidate.finishReason === 'MAX_TOKENS') {
              console.warn('Response was truncated due to token limit. Trying to extract partial content...');
            }

            if (candidate.content && candidate.content.parts && candidate.content.parts[0]) {
              const content = candidate.content.parts[0].text;

              // If content was truncated, try to fix incomplete JSON
              if (candidate.finishReason === 'MAX_TOKENS' && content) {
                try {
                  // Try to parse as-is first
                  JSON.parse(content);
                  return content;
                } catch (e) {
                  // If JSON is incomplete, try to fix it
                  console.warn('Attempting to fix truncated JSON...');
                  let fixedContent = content.trim();

                  // Count braces to see if we need to close them
                  const openBraces = (fixedContent.match(/\{/g) || []).length;
                  const closeBraces = (fixedContent.match(/\}/g) || []).length;
                  const missingBraces = openBraces - closeBraces;

                  if (missingBraces > 0) {
                    // Add missing closing braces
                    fixedContent += '}]}'.repeat(missingBraces);
                  }

                  try {
                    JSON.parse(fixedContent);
                    return fixedContent;
                  } catch (e2) {
                    console.error('Could not fix truncated JSON, using fallback');
                    return this.generateFallbackCurriculum(spec);
                  }
                }
              }

              return content;
            } else {
              console.error('Unexpected Gemini response structure:', data);
              throw new Error('Unexpected Gemini response structure');
            }
          } else {
            console.error('No candidates in Gemini response:', data);
            throw new Error('No candidates in Gemini response');
          }
        } else {
          console.error('Gemini AI failed:', response.status);
          const errorText = await response.text();
          throw new Error(`Gemini AI error: ${response.status} - ${errorText}`);
        }
        } catch (error) {
          lastError = error as Error;
          console.error(`Gemini attempt ${attempt} failed:`, error);

          // Mark key as failed if it's a quota or rate limit error
          const errorMessage = error.message.toLowerCase();
          if (errorMessage.includes('quota') || errorMessage.includes('rate limit') || errorMessage.includes('429')) {
            apiKeyRotationService.markKeyAsFailed(geminiKey, 'gemini', 5 * 60 * 1000); // Block for 5 minutes
          }

          if (attempt < maxRetries) {
            // Wait before retry with exponential backoff
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
            continue;
          }
        }
      }
    }

    // If all retries failed, throw the last error
    throw lastError || new Error('All AI providers failed after multiple attempts');
  }

  private generateFallbackCurriculum(spec: any): string {
    const moduleCount = spec.moduleCount || 4;
    const lessonsPerModule = spec.lessonsPerModule || 4;

    const fallbackCurriculum = {
      title: spec.courseTitle || 'Generated Course',
      description: `A comprehensive course on ${spec.subject || 'the selected topic'} designed for ${spec.academicLevel || 'students'}.`,
      objectives: [
        `Understand the fundamentals of ${spec.subject || 'the topic'}`,
        `Apply key concepts in practical scenarios`,
        `Develop critical thinking skills`,
        `Master essential techniques and methods`
      ],
      modules: [],
      lessons: []
    };

    // Generate modules and lessons
    for (let i = 0; i < moduleCount; i++) {
      const module = {
        title: `Module ${i + 1}: Introduction to Core Concepts`,
        description: `This module covers the essential concepts and foundations needed for understanding ${spec.subject || 'the topic'}.`,
        order: i,
        estimatedDuration: lessonsPerModule * 30,
        objectives: [
          `Learn the basic principles of Module ${i + 1}`,
          `Practice key skills and techniques`,
          `Apply knowledge through exercises`
        ]
      };

      fallbackCurriculum.modules.push(module);

      // Generate lessons for this module
      for (let j = 0; j < lessonsPerModule; j++) {
        const lesson = {
          title: `Lesson ${j + 1}: ${module.title.split(': ')[1]} - Part ${j + 1}`,
          description: `This lesson introduces key concepts and provides practical examples for better understanding.`,
          objectives: [
            `Understand the core concepts of this lesson`,
            `Apply the learned principles`,
            `Complete practical exercises`
          ],
          moduleTitle: module.title,
          order: j,
          duration: 30
        };

        fallbackCurriculum.lessons.push(lesson);
      }
    }

    return JSON.stringify(fallbackCurriculum, null, 2);
  }

  private buildCurriculumPrompt(spec: any): string {
    const moduleCount = spec.moduleCount || 4;
    const lessonsPerModule = spec.lessonsPerModule || 4;

    return `Create a comprehensive course curriculum for "${spec.courseTitle}" at ${spec.academicLevel} level in ${spec.subject}.

Course Details:
- Type: ${spec.courseType}
- Topic: ${spec.topic || 'General'}
- Difficulty: ${spec.difficulty}
- Duration: ${spec.duration} minutes total
- Learning Style: ${spec.learningStyle}
- Tone: ${spec.tone}
- Structure: ${moduleCount} modules with ${lessonsPerModule} lessons each

Requirements:
- Create ${moduleCount} progressive modules, each containing ${lessonsPerModule} lessons
- Each module should focus on a specific aspect or theme
- Each lesson should build on previous concepts within the module
- Include clear learning objectives for each module and lesson
- Ensure age-appropriate content
- Follow Islamic educational values

Return ONLY the raw JSON object, without any markdown, backticks, or other explanatory text.
Your response should be in this format:
{
  "title": "Course Title",
  "description": "Course description",
  "objectives": ["objective1", "objective2"],
  "modules": [
    {
      "title": "Module Title",
      "description": "Module description",
      "order": 0,
      "estimatedDuration": 120,
      "objectives": ["module objective"]
    }
  ],
  "lessons": [
    {
      "title": "Lesson Title",
      "description": "Lesson description",
      "objectives": ["lesson objective"],
      "moduleTitle": "Module Title",
      "order": 0,
      "duration": 30
    }
  ]
}`;
  }

  private buildLessonContentPrompt(lessonSpec: any, courseSpec: any, curriculum: any): string {
    return `You are an expert educational content creator. Your task is to create comprehensive and engaging content for a lesson in an online course.

Course Title: ${curriculum.title}
Lesson Title: ${lessonSpec.title}
Course Subject: ${courseSpec.subject}
Course Level: ${courseSpec.academicLevel}
Lesson Objectives: ${lessonSpec.objectives?.join(', ') || 'General learning'}
Target Audience: Students at the ${courseSpec.academicLevel} level studying ${courseSpec.subject}

Content Requirements:
- Create a variety of content blocks, including an introduction, main concepts, examples, and a summary.
- Use appropriate headings, subheadings, bullet points, numbered lists, and other formatting elements to structure the content effectively.
- Ensure the content is engaging, age-appropriate, and easy to understand.
- Include practical examples, real-world applications, and relevant anecdotes to illustrate the concepts.
- The content should be detailed, comprehensive, and cover all the key aspects of the lesson.

Return ONLY the raw JSON object, without any markdown, backticks, or other explanatory text.
Your response should be in this format:
[
  {
    "title": "Introduction",
    "type": "rich_text",
    "content": "## Introduction\\n\\nWelcome to this lesson...",
    "order": 1
  },
  {
    "title": "Main Concepts",
    "type": "rich_text",
    "content": "## Key Concepts\\n\\n### Concept 1\\nDetailed explanation...",
    "order": 2
  },
  {
    "title": "Examples",
    "type": "rich_text",
    "content": "## Practical Examples\\n\\n1. Example 1...",
    "order": 3
  },
  {
    "title": "Summary",
    "type": "rich_text",
    "content": "## Lesson Summary\\n\\nIn this lesson we learned...",
    "order": 4
  }
]`;
  }

  private buildQuizPrompt(lessonSpec: any, courseSpec: any, lessonContent: any): string {
    return `You are an expert quiz creator. Your task is to create a comprehensive and engaging quiz for a lesson in an online course.

Lesson Content:
${lessonContent}

Course Title: ${courseSpec.courseTitle}
Lesson Title: ${lessonSpec.title}
Course Subject: ${courseSpec.subject}
Course Level: ${courseSpec.academicLevel}
Lesson Objectives: ${lessonSpec.objectives?.join(', ') || 'General learning'}
Target Audience: Students at the ${courseSpec.academicLevel} level studying ${courseSpec.subject}

Quiz Requirements:
- Create 3-5 questions of varying difficulty levels.
- Include a mix of multiple-choice, true/false, and short answer questions.
- Provide clear and concise explanations for the correct answers.
- Ensure the questions test understanding and application of the lesson content, not just memorization.

Return ONLY the raw JSON object, without any markdown, backticks, or other explanatory text.
Your response should be in this format:
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

  private buildFlashcardPrompt(lessonSpec: any, courseSpec: any, lessonContent: any): string {
    return `You are an expert flashcard creator. Your task is to create comprehensive and engaging flashcards for a lesson in an online course.

Lesson Content:
${lessonContent}

Course Title: ${courseSpec.courseTitle}
Lesson Title: ${lessonSpec.title}
Course Subject: ${courseSpec.subject}
Course Level: ${courseSpec.academicLevel}
Lesson Objectives: ${lessonSpec.objectives?.join(', ') || 'General learning'}
Target Audience: Students at the ${courseSpec.academicLevel} level studying ${courseSpec.subject}

Flashcard Requirements:
- Create 5-8 flashcards covering the key concepts of the lesson.
- Vary the difficulty levels of the flashcards (easy, medium, hard).
- Include clear and concise terms, definitions, and examples.
- Provide optional hints to help students remember the information.

Return ONLY the raw JSON object, without any markdown, backticks, or other explanatory text.
Your response should be in this format:
[
  {
    "front": "Question or term",
    "back": "Answer or definition",
    "difficulty": "easy|medium|hard",
    "hint": "Optional hint"
  }
]`;
  }

  private buildKeyPointsPrompt(lessonSpec: any, courseSpec: any, lessonContent: any): string {
    return `You are an expert key point extractor. Your task is to extract the key points from a lesson in an online course and present them in a clear and concise format.

Lesson Content:
${lessonContent}

Course Title: ${courseSpec.courseTitle}
Lesson Title: ${lessonSpec.title}
Course Subject: ${courseSpec.subject}
Course Level: ${courseSpec.academicLevel}
Lesson Objectives: ${lessonSpec.objectives?.join(', ') || 'General learning'}
Target Audience: Students at the ${courseSpec.academicLevel} level studying ${courseSpec.subject}

Key Point Requirements:
- Extract 4-6 of the most important concepts from the lesson.
- Provide clear and concise explanations for each key point.
- Prioritize the key points by importance (high, medium, low).
- Include optional examples to illustrate the concepts.

Return ONLY the raw JSON object, without any markdown, backticks, or other explanatory text.
Your response should be in this format:
[
  {
    "point": "Key concept",
    "explanation": "Detailed explanation",
    "importance": "high|medium|low",
    "examples": "Optional examples"
  }
]`;
  }

  private buildMindMapPrompt(lessonSpec: any, courseSpec: any, lessonContent: any): string {
    return `You are an expert mind map creator. Your task is to create a comprehensive and visually appealing mind map for a lesson in an online course.

Lesson Content:
${lessonContent}

Course Title: ${courseSpec.courseTitle}
Lesson Title: ${lessonSpec.title}
Course Subject: ${courseSpec.subject}
Course Level: ${courseSpec.academicLevel}
Lesson Objectives: ${lessonSpec.objectives?.join(', ') || 'General learning'}
Target Audience: Students at the ${courseSpec.academicLevel} level studying ${courseSpec.subject}

Mind Map Requirements:
- Create a mind map with a central concept and branching sub-concepts.
- Use a clear hierarchical structure to organize the information.
- Ensure the mind map is visually appealing and easy to understand.

Return ONLY the raw JSON object, without any markdown, backticks, or other explanatory text.
Your response should be in this format:
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

  private _cleanAndParseJson(content: string): any {
    if (!content) {
      throw new Error('Content is empty or null');
    }

    // Attempt to extract JSON from markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    let potentialJson = jsonMatch ? jsonMatch[1] : content;

    try {
      // First, try to parse it directly
      return JSON.parse(potentialJson);
    } catch (e) {
      // If direct parsing fails, attempt to repair truncated JSON
      try {
        let repairedJson = potentialJson.trim();
        const openBrackets = (repairedJson.match(/\{/g) || []).length;
        const closeBrackets = (repairedJson.match(/\}/g) || []).length;
        const openSquares = (repairedJson.match(/\[/g) || []).length;
        const closeSquares = (repairedJson.match(/\]/g) || []).length;

        if (openBrackets > closeBrackets) {
          repairedJson += '}'.repeat(openBrackets - closeBrackets);
        }
        if (openSquares > closeSquares) {
          repairedJson += ']'.repeat(openSquares - closeSquares);
        }
        
        // Attempt to close a potentially unterminated string at the end
        if (repairedJson.lastIndexOf('"') > repairedJson.lastIndexOf('}') && repairedJson.lastIndexOf('"') > repairedJson.lastIndexOf(']')) {
            // Find the last open quote that isn't escaped
            let lastOpenQuote = -1;
            for (let i = repairedJson.length - 1; i >= 0; i--) {
                if (repairedJson[i] === '"' && (i === 0 || repairedJson[i-1] !== '\\')) {
                    const nextQuote = repairedJson.indexOf('"', i + 1);
                    if (nextQuote === -1 || repairedJson.substring(i+1, nextQuote).indexOf('"') === -1) {
                        lastOpenQuote = i;
                        break;
                    }
                }
            }

            if(lastOpenQuote !== -1) {
                const substringAfterQuote = repairedJson.substring(lastOpenQuote + 1);
                if (substringAfterQuote.indexOf('"') === -1) {
                     repairedJson += '"';
                }
            }
        }
        
        // Final check for dangling commas before closing brackets
        repairedJson = repairedJson.replace(/,(\s*[\}\]])/g, '$1');

        // Close any remaining open structures
        const openBracketsAfterRepair = (repairedJson.match(/\{/g) || []).length;
        const closeBracketsAfterRepair = (repairedJson.match(/\}/g) || []).length;
        let openSquaresAfterRepair = (repairedJson.match(/\[/g) || []).length;
        let closeSquaresAfterRepair = (repairedJson.match(/\]/g) || []).length;

        if (openBracketsAfterRepair > closeBracketsAfterRepair) {
          repairedJson += '}'.repeat(openBracketsAfterRepair - closeBracketsAfterRepair);
        }
        if (openSquaresAfterRepair > closeSquaresAfterRepair) {
          repairedJson += ']'.repeat(openSquaresAfterRepair - closeSquaresAfterRepair);
        }
        
        // If it's still not valid, it might be a truncated array of objects.
        // Try to close the last object and the array.
        if (repairedJson.lastIndexOf('{') > repairedJson.lastIndexOf('}')) {
            repairedJson += '}]}';
        }
        
        // Final pass to remove any trailing commas
        repairedJson = repairedJson.replace(/,\s*([\}\]])/g, '$1');
        
        if (repairedJson.endsWith(',')) {
            repairedJson = repairedJson.slice(0, -1);
        }


        return JSON.parse(repairedJson);
      } catch (e2) {
         try {
            const geminiResponse = JSON.parse(content);
            if (geminiResponse.candidates && geminiResponse.candidates[0] && geminiResponse.candidates[0].content && geminiResponse.candidates[0].content.parts && geminiResponse.candidates[0].content.parts[0]) {
              const nestedContent = geminiResponse.candidates[0].content.parts[0].text;
              // Re-run the cleaning process on the nested content
              return this._cleanAndParseJson(nestedContent);
            }
         } catch (e3) {
            console.error("Failed to parse JSON after multiple attempts, including repair.", { content });
            throw new Error(`Failed to parse JSON: ${potentialJson}`);
         }
      }
    }
    throw new Error(`Could not parse JSON from content: ${content}`);
  }

  private parseCurriculumResponse(content: string, spec: any) {
    try {
      const parsed = this._cleanAndParseJson(content);

      // Ensure modules are included in the curriculum structure
      if (!parsed.modules && parsed.lessons) {
        // Group lessons into modules if not already structured
        const lessonsPerModule = spec.lessonsPerModule || 4;
        const modules = [];
        const moduleLessons = [];

        for (let i = 0; i < parsed.lessons.length; i += lessonsPerModule) {
          const moduleIndex = Math.floor(i / lessonsPerModule);
          const moduleLessonsSlice = parsed.lessons.slice(i, i + lessonsPerModule);

          const module = {
            title: `Module ${moduleIndex + 1}`,
            description: `Module ${moduleIndex + 1} covering ${moduleLessonsSlice.map(l => l.title).join(', ')}`,
            order: moduleIndex,
            estimatedDuration: moduleLessonsSlice.reduce((sum, l) => sum + (l.duration || 30), 0),
            objectives: moduleLessonsSlice.flatMap(l => l.objectives || [])
          };

          modules.push(module);

          // Update lessons with module reference
          moduleLessonsSlice.forEach((lesson, lessonIndex) => {
            moduleLessons.push({
              ...lesson,
              moduleTitle: module.title,
              order: lessonIndex
            });
          });
        }

        parsed.modules = modules;
        parsed.lessons = moduleLessons;
      }

      return parsed;
    } catch (error) {
      console.error('Error parsing curriculum:', error);
      // Provide a fallback curriculum structure on failure
      return {
        title: spec.courseTitle || 'Generated Course',
        description: 'Failed to generate curriculum. Please check AI provider response.',
        objectives: [],
        modules: [
          {
            title: 'Module 1',
            description: 'Introduction module',
            order: 0,
            estimatedDuration: 30,
            objectives: []
          }
        ],
        lessons: [
          {
            title: 'Error Generating Lesson',
            description: 'Could not generate lesson content.',
            objectives: [],
            moduleTitle: 'Module 1',
            order: 0,
            duration: 30
          }
        ]
      };
    }
  }

  private parseContentResponse(content: string): any {
    try {
      let parsedContent = this._cleanAndParseJson(content);

      // Validate the parsed content structure
      if (!Array.isArray(parsedContent)) {
        console.warn('Content is not an array, wrapping in an array.');
        parsedContent = [parsedContent];
      }

      // Ensure each content block has the required properties
      return parsedContent.map((block: any, index: number) => ({
        title: block.title || `Content Block ${index + 1}`,
        type: block.type || 'rich_text',
        content: block.content || 'No content provided.',
        order: block.order || index + 1,
      }));

    } catch (error) {
      console.error('Error parsing content:', error);
      return [
        {
          title: 'Lesson Content',
          type: 'rich_text',
          content: 'Failed to parse content. Please check the AI provider response.',
          order: 1,
        },
      ];
    }
  }

  private parseQuizResponse(content: string): any {
    try {
      let parsedQuiz = this._cleanAndParseJson(content);

      if (!parsedQuiz || typeof parsedQuiz !== 'object') {
        throw new Error('Invalid quiz format: Quiz must be an object.');
      }

      if (!Array.isArray(parsedQuiz.questions)) {
        console.warn('Quiz questions is not an array, setting to empty array.');
        parsedQuiz.questions = [];
      }

      parsedQuiz.questions = parsedQuiz.questions.map((question: any, index: number) => ({
        id: question.id || `q${index + 1}`,
        question: question.question || 'Question text not provided.',
        type: question.type || 'multiple_choice',
        options: question.options || [],
        correctAnswer: question.correctAnswer || '',
        explanation: question.explanation || 'No explanation provided.',
      }));

      return parsedQuiz;
    } catch (error) {
      console.error('Error parsing quiz:', error);
      return {
        title: 'Quiz Failed to Generate',
        questions: [],
        passingScore: 70,
        attempts: 3,
      };
    }
  }

  private parseFlashcardResponse(content: string): any {
    try {
      let parsedFlashcards = this._cleanAndParseJson(content);

      if (!Array.isArray(parsedFlashcards)) {
        console.warn('Flashcards is not an array, setting to empty array.');
        parsedFlashcards = [];
      }

      return parsedFlashcards.map((flashcard: any) => ({
        front: flashcard.front || 'No term provided.',
        back: flashcard.back || 'No definition provided.',
        difficulty: flashcard.difficulty || 'medium',
        hint: flashcard.hint || '',
      }));
    } catch (error) {
      console.error('Error parsing flashcards:', error);
      return [];
    }
  }

  private parseKeyPointsResponse(content: string): any {
    try {
      let parsedKeyPoints = this._cleanAndParseJson(content);

      if (!Array.isArray(parsedKeyPoints)) {
        console.warn('Key points is not an array, setting to empty array.');
        parsedKeyPoints = [];
      }

      return parsedKeyPoints.map((keyPoint: any) => ({
        point: keyPoint.point || 'No key point provided.',
        explanation: keyPoint.explanation || 'No explanation provided.',
        importance: keyPoint.importance || 'high',
      }));
    } catch (error) {
      console.error('Error parsing key points:', error);
      return [];
    }
  }

  private parseMindMapResponse(content: string): any {
    try {
      let parsedMindMap = this._cleanAndParseJson(content);

      if (!parsedMindMap || typeof parsedMindMap !== 'object') {
        throw new Error('Invalid mind map format: Mind map must be an object.');
      }

      if (!parsedMindMap.data || !Array.isArray(parsedMindMap.data.nodes)) {
        console.warn('Mind map data or nodes are invalid, setting to default.');
        parsedMindMap.data = { nodes: [] };
      }

      return parsedMindMap;
    } catch (error) {
      console.error('Error parsing mind map:', error);
      return {
        title: 'Mind Map Failed to Generate',
        data: { nodes: [] },
      };
    }
  }
}

export const streamingAIService = new StreamingCourseGenerator();

import { db } from './github-sdk';
import { config } from './config';

interface ApiKeyUsage {
  id: string;
  key: string;
  name: string;
  usageCount: number;
  dailyUsageCount: number;
  lastUsedAt: string;
  lastResetAt: string;
  isActive: boolean;
  rateLimit: number;
  dailyLimit: number;
  priority: number;
}

class AIChatService {
  private requestQueue: Array<{
    resolve: (value: string) => void;
    reject: (error: Error) => void;
    prompt: string;
    history: any[];
    context?: any;
  }> = [];
  private isProcessingQueue = false;
  private lastRequestTime = 0;
  private readonly MIN_REQUEST_INTERVAL = 5500; // 5.5 seconds to stay under 11 requests/minute

  private async getAvailableApiKey(): Promise<ApiKeyUsage> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    // Get all active keys
    let keys = await db.queryBuilder('geminiApiKeys')
      .where((k: any) => k.isActive === true)
      .orderBy('priority', 'asc')
      .orderBy('lastUsedAt', 'asc')
      .exec();

    if (keys.length === 0) {
      // Initialize default key from config if no keys exist
      if (config.ai.geminiKey) {
        const defaultKey = {
          key: config.ai.geminiKey,
          name: 'Default Key',
          usageCount: 0,
          dailyUsageCount: 0,
          lastUsedAt: new Date().toISOString(),
          lastResetAt: todayStart,
          isActive: true,
          rateLimit: 11,
          dailyLimit: 1000,
          priority: 1
        };
        const insertedKey = await db.insert('geminiApiKeys', defaultKey);
        return { ...defaultKey, id: insertedKey.id };
      }
      throw new Error('No Gemini API keys available');
    }

    // Reset daily usage if needed
    for (const key of keys) {
      if (key.lastResetAt < todayStart) {
        await db.update('geminiApiKeys', key.id, {
          dailyUsageCount: 0,
          lastResetAt: todayStart
        });
        key.dailyUsageCount = 0;
      }
    }

    // Find a key that hasn't hit daily limit
    const availableKey = keys.find(k => k.dailyUsageCount < k.dailyLimit);

    if (!availableKey) {
      throw new Error('All API keys have reached their daily limit');
    }

    return availableKey;
  }

  private async updateKeyUsage(keyId: string): Promise<void> {
    const key = await db.getItem('geminiApiKeys', keyId);
    if (key) {
      await db.update('geminiApiKeys', keyId, {
        usageCount: (key.usageCount || 0) + 1,
        dailyUsageCount: (key.dailyUsageCount || 0) + 1,
        lastUsedAt: new Date().toISOString(),
      });
    }
  }

  async generateResponse(history: any[], prompt: string, context?: any): Promise<string> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ resolve, reject, prompt, history, context });
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (!request) continue;

      try {
        // Rate limiting: ensure minimum interval between requests
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
          await new Promise(resolve =>
            setTimeout(resolve, this.MIN_REQUEST_INTERVAL - timeSinceLastRequest)
          );
        }

        const response = await this.makeApiRequest(request.history, request.prompt, request.context);
        this.lastRequestTime = Date.now();
        request.resolve(response);
      } catch (error) {
        request.reject(error as Error);
      }
    }

    this.isProcessingQueue = false;
  }

  private async makeApiRequest(history: any[], prompt: string, context?: any): Promise<string> {
    const apiKey = await this.getAvailableApiKey();
    const model = 'gemini-2.5-flash';

    // Build contextual prompt if context is provided
    let contextualPrompt = prompt;
    if (context) {
      const contextInfo = await this.buildContextualInfo(context);
      contextualPrompt = `${contextInfo}\n\nUser question: ${prompt}`;
    }

    const contents = [
      ...history.map(h => ({
        role: h.role === 'model' ? 'model' : 'user',
        parts: [{ text: h.content }]
      })),
      { role: 'user', parts: [{ text: contextualPrompt }] }
    ];

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: contents,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2000,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      // Update key usage
      await this.updateKeyUsage(apiKey.id);

      if (!response.ok) {
        const errorBody = await response.json();
        console.error('Gemini API Error:', errorBody);

        // If rate limited, try next key
        if (response.status === 429) {
          throw new Error('Rate limit exceeded, trying next key');
        }

        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (data.candidates && data.candidates.length > 0) {
        return data.candidates[0].content.parts[0].text;
      }
      return 'I am sorry, I could not generate a response.';
    } catch (error) {
      console.error('Error in makeApiRequest:', error);
      throw error;
    }
  }
  private async buildContextualInfo(context: any): Promise<string> {
    let contextInfo = '';

    try {
      if (context.lessonId) {
        const lesson = await db.getItem('lessons', context.lessonId);
        if (lesson) {
          contextInfo += `Current Lesson: ${lesson.title}\n`;
          contextInfo += `Description: ${lesson.description}\n`;

          if (lesson.contents && lesson.contents.length > 0) {
            contextInfo += `Lesson Content:\n`;
            lesson.contents.forEach((content: any, index: number) => {
              contextInfo += `${index + 1}. ${content.type}: ${content.content?.substring(0, 200)}...\n`;
            });
          }

          if (lesson.keyPoints && lesson.keyPoints.length > 0) {
            contextInfo += `Key Points:\n`;
            lesson.keyPoints.forEach((point: any, index: number) => {
              contextInfo += `- ${point.point}\n`;
            });
          }
        }
      }

      if (context.courseId) {
        const course = await db.getItem('courses', context.courseId);
        if (course) {
          contextInfo += `Current Course: ${course.title}\n`;
          contextInfo += `Course Description: ${course.description}\n`;
          contextInfo += `Level: ${course.level}\n`;
        }
      }

      if (context.userRole) {
        if (context.userRole === 'instructor') {
          contextInfo += `\nYou are assisting an instructor. Focus on helping with course creation, teaching strategies, content development, and educational best practices.\n`;
        } else {
          contextInfo += `\nYou are assisting a learner. Focus on explaining concepts clearly, providing examples, and helping with understanding the material.\n`;
        }
      }

      contextInfo += `\nPlease provide helpful, accurate, and contextually relevant responses based on the above information.\n`;
    } catch (error) {
      console.error('Error building contextual info:', error);
    }

    return contextInfo;
  }

  async addApiKey(key: string, name: string, rateLimit = 11, dailyLimit = 1000): Promise<void> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    await db.insert('geminiApiKeys', {
      key,
      name,
      usageCount: 0,
      dailyUsageCount: 0,
      lastUsedAt: now.toISOString(),
      lastResetAt: todayStart,
      isActive: true,
      rateLimit,
      dailyLimit,
      priority: 1
    });
  }

  async getApiKeyStats(): Promise<ApiKeyUsage[]> {
    return await db.queryBuilder('geminiApiKeys')
      .orderBy('priority', 'asc')
      .exec();
  }

  async updateApiKeyStatus(keyId: string, isActive: boolean): Promise<void> {
    await db.update('geminiApiKeys', keyId, { isActive });
  }
}

export const aiChatService = new AIChatService();
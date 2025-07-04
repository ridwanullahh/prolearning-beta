import OpenAI from 'openai';
import UniversalSDK, { 
  UniversalSDKConfig, 
  User as SDKUser, 
  SchemaDefinition 
} from './universal-sdk';
import { config } from './config';

// Enhanced database schemas for the complete platform
const schemas: Record<string, SchemaDefinition> = {
  users: {
    required: ['email', 'name', 'role'],
    types: {
      id: 'string',
      uid: 'string',
      email: 'string',
      name: 'string',
      role: 'string',
      avatar: 'string',
      country: 'string',
      currency: 'string',
      createdAt: 'date',
      updatedAt: 'date',
      isActive: 'boolean',
      profileComplete: 'boolean',
      timezone: 'string',
      language: 'string',
      learningStyle: 'string',
      subscription: 'string',
      subscriptionExpiry: 'date',
      gamificationPoints: 'number',
      level: 'number',
      badges: 'string',
      password: 'string'
    },
    defaults: {
      isActive: true,
      profileComplete: false,
      language: 'en',
      learningStyle: 'visual',
      subscription: 'free',
      gamificationPoints: 0,
      level: 1,
      badges: '[]',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },
  userProfiles: {
    required: ['userId'],
    types: {
      id: 'string',
      uid: 'string',
      userId: 'string',
      gradeLevel: 'string',
      academicLevel: 'string',
      learningStyle: 'string',
      preferences: 'string',
      timezone: 'string',
      language: 'string',
      bio: 'string',
      interests: 'string',
      goals: 'string'
    }
  },
  academicLevels: {
    required: ['name', 'internationalEquivalent', 'nigerianEquivalent', 'typicalAge', 'category', 'order'],
    types: {
      id: 'string',
      uid: 'string',
      name: 'string',
      internationalEquivalent: 'string',
      nigerianEquivalent: 'string',
      typicalAge: 'string',
      category: 'string',
      order: 'number',
      description: 'string'
    }
  },
  subjects: {
    required: ['name', 'academicLevelId', 'isActive'],
    types: {
      id: 'string',
      uid: 'string',
      name: 'string',
      academicLevelId: 'string',
      description: 'string',
      isActive: 'boolean',
      category: 'string',
      icon: 'string'
    },
    defaults: {
      isActive: true,
      category: 'general'
    }
  },
  courses: {
    required: ['title', 'description', 'creatorId', 'creatorType', 'academicLevelId', 'subjectId', 'difficulty', 'duration', 'isPublished', 'isAiGenerated'],
    types: {
      id: 'string',
      uid: 'string',
      title: 'string',
      description: 'string',
      creatorId: 'string',
      creatorType: 'string',
      academicLevelId: 'string',
      subjectId: 'string',
      difficulty: 'string',
      duration: 'number',
      price: 'number',
      currency: 'string',
      isPublished: 'boolean',
      isAiGenerated: 'boolean',
      thumbnailUrl: 'string',
      tags: 'string',
      createdAt: 'date',
      updatedAt: 'date',
      school: 'string',
      enrollmentCount: 'number',
      rating: 'number',
      reviewCount: 'number',
      objectives: 'string',
      prerequisites: 'string',
      targetAudience: 'string',
      courseType: 'string',
      language: 'string',
      level: 'string',
      category: 'string',
      estimatedTime: 'string',
      instructor: 'string',
      lastUpdated: 'date',
      featured: 'boolean',
      status: 'string',
      prerequisiteCourses: 'string',
      isDripEnabled: 'boolean',
      dripSettings: 'string',
      certificateEnabled: 'boolean',
      badgeEnabled: 'boolean',
      forumEnabled: 'boolean',
      peerReviewEnabled: 'boolean'
    },
    defaults: {
      isPublished: false,
      enrollmentCount: 0,
      rating: 0,
      reviewCount: 0,
      currency: 'USD',
      language: 'en',
      courseType: 'self-paced',
      featured: false,
      status: 'draft',
      prerequisiteCourses: '[]',
      isDripEnabled: false,
      dripSettings: '{}',
      certificateEnabled: true,
      badgeEnabled: true,
      forumEnabled: true,
      peerReviewEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },
  lessons: {
    required: ['courseId', 'title', 'description', 'order', 'duration', 'type', 'isRequired'],
    types: {
      id: 'string',
      uid: 'string',
      courseId: 'string',
      title: 'string',
      description: 'string',
      order: 'number',
      duration: 'number',
      type: 'string',
      isRequired: 'boolean',
      createdAt: 'date',
      videoUrl: 'string',
      audioUrl: 'string',
      attachments: 'string',
      objectives: 'string',
      notes: 'string',
      isPublished: 'boolean',
      prerequisiteLessons: 'string',
      releaseType: 'string',
      scheduledReleaseDate: 'date',
      dripDays: 'number',
      interactiveElements: 'string'
    },
    defaults: {
      isRequired: true,
      isPublished: true,
      type: 'text',
      prerequisiteLessons: '[]',
      releaseType: 'immediate',
      dripDays: 0,
      interactiveElements: '[]',
      createdAt: new Date().toISOString()
    }
  },
  lessonContents: {
    required: ['lessonId', 'type', 'content', 'order'],
    types: {
      id: 'string',
      uid: 'string',
      lessonId: 'string',
      type: 'string',
      content: 'string',
      order: 'number',
      title: 'string',
      description: 'string',
      mediaUrl: 'string',
      duration: 'number',
      metadata: 'string',
      isRequired: 'boolean',
      createdAt: 'date'
    },
    defaults: {
      isRequired: true,
      createdAt: new Date().toISOString()
    }
  },
  quizzes: {
    required: ['lessonId', 'title', 'questions', 'totalQuestions', 'passingScore', 'attempts', 'isActive'],
    types: {
      id: 'string',
      uid: 'string',
      lessonId: 'string',
      courseId: 'string',
      title: 'string',
      description: 'string',
      questions: 'string',
      totalQuestions: 'number',
      passingScore: 'number',
      timeLimit: 'number',
      attempts: 'number',
      isActive: 'boolean',
      quizType: 'string',
      instructions: 'string',
      showResults: 'boolean',
      shuffleQuestions: 'boolean',
      gradingLogic: 'string',
      feedback: 'string'
    },
    defaults: {
      isActive: true,
      attempts: 3,
      quizType: 'practice',
      showResults: true,
      shuffleQuestions: false,
      passingScore: 70,
      gradingLogic: 'standard',
      feedback: 'immediate'
    }
  },
  flashcards: {
    required: ['lessonId', 'front', 'back', 'difficulty', 'order'],
    types: {
      id: 'string',
      uid: 'string',
      lessonId: 'string',
      courseId: 'string',
      front: 'string',
      back: 'string',
      difficulty: 'string',
      tags: 'string',
      order: 'number',
      category: 'string',
      hint: 'string',
      explanation: 'string',
      mediaUrl: 'string',
      audio: 'string'
    }
  },
  mindMaps: {
    required: ['lessonId', 'title', 'data'],
    types: {
      id: 'string',
      uid: 'string',
      lessonId: 'string',
      courseId: 'string',
      title: 'string',
      data: 'string',
      createdAt: 'date',
      description: 'string',
      nodeCount: 'number',
      connections: 'string',
      style: 'string',
      isPublic: 'boolean'
    },
    defaults: {
      isPublic: false,
      createdAt: new Date().toISOString()
    }
  },
  keyPoints: {
    required: ['lessonId', 'point', 'order', 'importance'],
    types: {
      id: 'string',
      uid: 'string',
      lessonId: 'string',
      courseId: 'string',
      point: 'string',
      explanation: 'string',
      order: 'number',
      importance: 'string',
      category: 'string',
      examples: 'string',
      mediaUrl: 'string',
      references: 'string'
    }
  },
  assignments: {
    required: ['lessonId', 'title', 'description', 'type', 'dueDate', 'maxPoints'],
    types: {
      id: 'string',
      uid: 'string',
      lessonId: 'string',
      courseId: 'string',
      title: 'string',
      description: 'string',
      type: 'string',
      instructions: 'string',
      dueDate: 'date',
      maxPoints: 'number',
      allowLateSubmission: 'boolean',
      fileTypes: 'string',
      maxFileSize: 'number',
      peerReviewEnabled: 'boolean',
      rubric: 'string',
      createdAt: 'date'
    },
    defaults: {
      allowLateSubmission: true,
      fileTypes: '["pdf","doc","docx","txt"]',
      maxFileSize: 10,
      peerReviewEnabled: false,
      createdAt: new Date().toISOString()
    }
  },
  submissions: {
    required: ['assignmentId', 'userId', 'content', 'submittedAt'],
    types: {
      id: 'string',
      uid: 'string',
      assignmentId: 'string',
      userId: 'string',
      content: 'string',
      fileUrls: 'string',
      submittedAt: 'date',
      status: 'string',
      grade: 'number',
      feedback: 'string',
      gradedAt: 'date',
      gradedBy: 'string',
      lateSubmission: 'boolean'
    },
    defaults: {
      status: 'submitted',
      lateSubmission: false
    }
  },
  peerReviews: {
    required: ['submissionId', 'reviewerId', 'rating', 'feedback'],
    types: {
      id: 'string',
      uid: 'string',
      submissionId: 'string',
      reviewerId: 'string',
      rating: 'number',
      feedback: 'string',
      criteria: 'string',
      createdAt: 'date',
      isAnonymous: 'boolean'
    },
    defaults: {
      isAnonymous: true,
      createdAt: new Date().toISOString()
    }
  },
  userProgress: {
    required: ['userId', 'courseId', 'progressPercentage', 'lastAccessedAt', 'totalTimeSpent'],
    types: {
      id: 'string',
      uid: 'string',
      userId: 'string',
      courseId: 'string',
      lessonId: 'string',
      progressPercentage: 'number',
      lastAccessedAt: 'date',
      completedAt: 'date',
      totalTimeSpent: 'number',
      currentLesson: 'string',
      completedLessons: 'string',
      quizScores: 'string',
      certificates: 'string',
      badges: 'string',
      points: 'number'
    },
    defaults: {
      progressPercentage: 0,
      totalTimeSpent: 0,
      completedLessons: '[]',
      quizScores: '{}',
      certificates: '[]',
      badges: '[]',
      points: 0,
      lastAccessedAt: new Date().toISOString()
    }
  },
  enrollments: {
    required: ['userId', 'courseId', 'enrolledAt', 'status', 'paymentStatus'],
    types: {
      id: 'string',
      uid: 'string',
      userId: 'string',
      courseId: 'string',
      enrolledAt: 'date',
      expiresAt: 'date',
      status: 'string',
      paymentStatus: 'string',
      amount: 'number',
      currency: 'string',
      paymentMethod: 'string',
      transactionId: 'string',
      refundStatus: 'string',
      accessLevel: 'string',
      completionDate: 'date'
    },
    defaults: {
      enrolledAt: new Date().toISOString(),
      status: 'active',
      paymentStatus: 'free',
      accessLevel: 'full'
    }
  },
  carts: {
    required: ['userId', 'items'],
    types: {
      id: 'string',
      uid: 'string',
      userId: 'string',
      items: 'string',
      totalAmount: 'number',
      currency: 'string',
      createdAt: 'date',
      updatedAt: 'date'
    },
    defaults: {
      totalAmount: 0,
      currency: 'USD',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },
  orders: {
    required: ['userId', 'items', 'totalAmount', 'currency', 'status'],
    types: {
      id: 'string',
      uid: 'string',
      userId: 'string',
      items: 'string',
      totalAmount: 'number',
      currency: 'string',
      status: 'string',
      paymentMethod: 'string',
      transactionId: 'string',
      createdAt: 'date',
      completedAt: 'date',
      billingAddress: 'string',
      discountApplied: 'number'
    },
    defaults: {
      status: 'pending',
      discountApplied: 0,
      createdAt: new Date().toISOString()
    }
  },
  wallets: {
    required: ['userId', 'balance', 'currency'],
    types: {
      id: 'string',
      uid: 'string',
      userId: 'string',
      balance: 'number',
      currency: 'string',
      createdAt: 'date',
      updatedAt: 'date',
      totalEarnings: 'number',
      totalWithdrawals: 'number',
      pendingBalance: 'number'
    },
    defaults: {
      balance: 0,
      currency: 'USD',
      totalEarnings: 0,
      totalWithdrawals: 0,
      pendingBalance: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },
  transactions: {
    required: ['userId', 'amount', 'currency', 'type', 'category', 'description', 'status'],
    types: {
      id: 'string',
      uid: 'string',
      userId: 'string',
      amount: 'number',
      currency: 'string',
      type: 'string',
      category: 'string',
      description: 'string',
      referenceId: 'string',
      status: 'string',
      createdAt: 'date',
      paymentMethod: 'string',
      fee: 'number',
      netAmount: 'number'
    },
    defaults: {
      status: 'pending',
      fee: 0,
      createdAt: new Date().toISOString()
    }
  },
  withdrawals: {
    required: ['userId', 'amount', 'currency', 'bankDetails', 'status'],
    types: {
      id: 'string',
      uid: 'string',
      userId: 'string',
      amount: 'number',
      currency: 'string',
      bankDetails: 'string',
      status: 'string',
      createdAt: 'date',
      processedAt: 'date',
      rejectionReason: 'string',
      referenceId: 'string'
    },
    defaults: {
      status: 'pending',
      createdAt: new Date().toISOString()
    }
  },
  earnings: {
    required: ['instructorId', 'courseId', 'amount', 'currency', 'type'],
    types: {
      id: 'string',
      uid: 'string',
      instructorId: 'string',
      courseId: 'string',
      amount: 'number',
      currency: 'string',
      type: 'string',
      commissionRate: 'number',
      netAmount: 'number',
      createdAt: 'date',
      paidOut: 'boolean'
    },
    defaults: {
      commissionRate: 15,
      paidOut: false,
      createdAt: new Date().toISOString()
    }
  },
  blogPosts: {
    required: ['title', 'content', 'authorId', 'status'],
    types: {
      id: 'string',
      uid: 'string',
      title: 'string',
      content: 'string',
      authorId: 'string',
      status: 'string',
      excerpt: 'string',
      featuredImage: 'string',
      tags: 'string',
      slug: 'string',
      publishedAt: 'date',
      createdAt: 'date',
      updatedAt: 'date',
      viewCount: 'number',
      category: 'string'
    },
    defaults: {
      status: 'draft',
      viewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },
  helpArticles: {
    required: ['title', 'content', 'category', 'status'],
    types: {
      id: 'string',
      uid: 'string',
      title: 'string',
      content: 'string',
      category: 'string',
      status: 'string',
      tags: 'string',
      slug: 'string',
      viewCount: 'number',
      helpful: 'number',
      notHelpful: 'number',
      createdAt: 'date',
      updatedAt: 'date'
    },
    defaults: {
      status: 'published',
      viewCount: 0,
      helpful: 0,
      notHelpful: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },
  supportTickets: {
    required: ['userId', 'subject', 'description', 'category', 'priority', 'status'],
    types: {
      id: 'string',
      uid: 'string',
      userId: 'string',
      subject: 'string',
      description: 'string',
      category: 'string',
      priority: 'string',
      status: 'string',
      assignedTo: 'string',
      createdAt: 'date',
      updatedAt: 'date',
      resolvedAt: 'date'
    },
    defaults: {
      status: 'open',
      priority: 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },
  ticketReplies: {
    required: ['ticketId', 'userId', 'message'],
    types: {
      id: 'string',
      uid: 'string',
      ticketId: 'string',
      userId: 'string',
      message: 'string',
      isStaff: 'boolean',
      attachments: 'string',
      createdAt: 'date'
    },
    defaults: {
      isStaff: false,
      createdAt: new Date().toISOString()
    }
  },
};

// GitHub SDK Configuration
const SDK_CONFIG: UniversalSDKConfig = {
  owner: config.github.owner,
  repo: config.github.repo,
  token: config.github.token,
  branch: 'main',
  basePath: 'data',
  mediaPath: 'media',
  schemas,
  auth: {
    requireEmailVerification: false,
    otpTriggers: []
  }
};

class GitHubDatabase {
  private sdk: UniversalSDK;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;
  private openai: OpenAI | null = null;

  constructor() {
    this.sdk = new UniversalSDK(SDK_CONFIG);
    
    // Initialize OpenAI if API key is available
    if (config.ai.openai) {
      this.openai = new OpenAI({
        apiKey: config.ai.openai,
        dangerouslyAllowBrowser: true
      });
    }
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this._initialize();
    await this.initPromise;
  }

  private async _initialize(): Promise<void> {
    try {
      await this.sdk.init();
      
      // Set up schemas
      Object.entries(schemas).forEach(([collection, schema]) => {
        this.sdk.setSchema(collection, schema);
      });

      // Initialize default data if collections are empty
      await this.initializeDefaultData();
      
      this.isInitialized = true;
      console.log('GitHub SDK initialized successfully');
    } catch (error) {
      console.error('Failed to initialize GitHub SDK:', error);
      throw error;
    }
  }

  private async initializeDefaultData(): Promise<void> {
    // Implementation for initializing default data
  }

  // Wrapper methods for safe operations
  async get<T = any>(collection: string): Promise<T[]> {
    await this.initialize();
    return this.safeOperation(() => this.sdk.get<T>(collection));
  }

  async getItem<T = any>(collection: string, key: string): Promise<T | null> {
    await this.initialize();
    return this.safeOperation(() => this.sdk.getItem<T>(collection, key));
  }

  async insert<T = any>(collection: string, item: Partial<T>): Promise<T & { id: string; uid: string }> {
    await this.initialize();
    return this.safeOperation(() => this.sdk.insert<T>(collection, item));
  }

  async bulkInsert<T = any>(collection: string, items: Partial<T>[]): Promise<(T & { id: string; uid: string })[]> {
    await this.initialize();
    return this.safeOperation(() => this.sdk.bulkInsert<T>(collection, items));
  }

  async update<T = any>(collection: string, key: string, updates: Partial<T>): Promise<T> {
    await this.initialize();
    return this.safeOperation(() => this.sdk.update<T>(collection, key, updates));
  }

  async bulkUpdate<T = any>(collection: string, updates: (Partial<T> & { id?: string; uid?: string })[]): Promise<T[]> {
    await this.initialize();
    return this.safeOperation(() => this.sdk.bulkUpdate<T>(collection, updates));
  }

  async delete<T = any>(collection: string, key: string): Promise<void> {
    await this.initialize();
    return this.safeOperation(() => this.sdk.delete<T>(collection, key));
  }

  queryBuilder<T = any>(collection: string) {
    return this.sdk.queryBuilder<T>(collection);
  }

  // Authentication methods
  async register(email: string, password: string, profile: any = {}): Promise<any> {
    await this.initialize();
    return this.safeOperation(() => this.sdk.register(email, password, profile));
  }

  async login(email: string, password: string): Promise<string | { otpRequired: boolean }> {
    await this.initialize();
    return this.safeOperation(() => this.sdk.login(email, password));
  }

  createSession(user: any): string {
    return this.sdk.createSession(user);
  }

  getSession(token: string) {
    return this.sdk.getSession(token);
  }

  getCurrentUser(token: string) {
    return this.sdk.getCurrentUser(token);
  }

  destroySession(token: string): boolean {
    return this.sdk.destroySession(token);
  }

  hashPassword(password: string): string {
    return this.sdk.hashPassword(password);
  }

  verifyPassword(password: string, hash: string): boolean {
    return this.sdk.verifyPassword(password, hash);
  }

  // Advanced conflict resolution with exponential backoff and jitter
  private async safeOperation<T>(operation: () => Promise<T>, retries = 5): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        return await operation();
      } catch (error: any) {
        if (error.message.includes('409') && i < retries - 1) {
          // Exponential backoff with jitter
          const baseDelay = Math.pow(2, i) * 1000;
          const jitter = Math.random() * 1000;
          const delay = baseDelay + jitter;
          
          console.log(`Conflict detected, retrying in ${delay}ms (attempt ${i + 1}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
    throw new Error('Max retries exceeded for GitHub operation');
  }
}

export const db = new GitHubDatabase();
export default db;

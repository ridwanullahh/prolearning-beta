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
  withdrawals: {
    required: ['userId', 'amount', 'currency', 'status', 'requestedAt'],
    types: {
      id: 'string',
      uid: 'string',
      userId: 'string',
      amount: 'number',
      currency: 'string',
      status: 'string',
      requestedAt: 'date',
      processedAt: 'date',
      bankDetails: 'string',
      adminNotes: 'string',
      transactionId: 'string'
    },
    defaults: {
      status: 'pending',
      requestedAt: new Date().toISOString()
    }
  },
  blogPosts: {
    required: ['title', 'content', 'authorId', 'status'],
    types: {
      id: 'string',
      uid: 'string',
      title: 'string',
      content: 'string',
      excerpt: 'string',
      authorId: 'string',
      status: 'string',
      publishedAt: 'date',
      createdAt: 'date',
      updatedAt: 'date',
      featuredImage: 'string',
      tags: 'string',
      category: 'string',
      slug: 'string',
      metaTitle: 'string',
      metaDescription: 'string'
    },
    defaults: {
      status: 'draft',
      tags: '[]',
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
      createdAt: 'date',
      updatedAt: 'date',
      authorId: 'string',
      tags: 'string',
      order: 'number',
      slug: 'string'
    },
    defaults: {
      status: 'published',
      tags: '[]',
      order: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },
  supportTickets: {
    required: ['userId', 'subject', 'message', 'priority', 'status'],
    types: {
      id: 'string',
      uid: 'string',
      userId: 'string',
      subject: 'string',
      message: 'string',
      priority: 'string',
      status: 'string',
      category: 'string',
      createdAt: 'date',
      updatedAt: 'date',
      assignedTo: 'string',
      resolvedAt: 'date'
    },
    defaults: {
      priority: 'medium',
      status: 'open',
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
      createdAt: 'date',
      isAdminReply: 'boolean',
      attachments: 'string'
    },
    defaults: {
      isAdminReply: false,
      attachments: '[]',
      createdAt: new Date().toISOString()
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
  certificates: {
    required: ['userId', 'courseId', 'certificateUrl', 'issuedAt'],
    types: {
      id: 'string',
      uid: 'string',
      userId: 'string',
      courseId: 'string',
      certificateUrl: 'string',
      issuedAt: 'date',
      certificateId: 'string',
      validUntil: 'date',
      template: 'string',
      metadata: 'string'
    },
    defaults: {
      issuedAt: new Date().toISOString()
    }
  },
  badges: {
    required: ['name', 'description', 'criteria', 'icon'],
    types: {
      id: 'string',
      uid: 'string',
      name: 'string',
      description: 'string',
      criteria: 'string',
      icon: 'string',
      color: 'string',
      category: 'string',
      points: 'number',
      isActive: 'boolean'
    },
    defaults: {
      isActive: true,
      points: 10
    }
  },
  userBadges: {
    required: ['userId', 'badgeId', 'earnedAt'],
    types: {
      id: 'string',
      uid: 'string',
      userId: 'string',
      badgeId: 'string',
      earnedAt: 'date',
      courseId: 'string',
      lessonId: 'string'
    }
  },
  forums: {
    required: ['courseId', 'title', 'description'],
    types: {
      id: 'string',
      uid: 'string',
      courseId: 'string',
      title: 'string',
      description: 'string',
      isActive: 'boolean',
      moderatorIds: 'string',
      createdAt: 'date',
      aiModerationEnabled: 'boolean',
      settings: 'string'
    },
    defaults: {
      isActive: true,
      moderatorIds: '[]',
      aiModerationEnabled: true,
      settings: '{}',
      createdAt: new Date().toISOString()
    }
  },
  forumPosts: {
    required: ['forumId', 'userId', 'title', 'content'],
    types: {
      id: 'string',
      uid: 'string',
      forumId: 'string',
      userId: 'string',
      title: 'string',
      content: 'string',
      createdAt: 'date',
      updatedAt: 'date',
      isSticky: 'boolean',
      isLocked: 'boolean',
      viewCount: 'number',
      replyCount: 'number',
      lastReplyAt: 'date',
      tags: 'string'
    },
    defaults: {
      isSticky: false,
      isLocked: false,
      viewCount: 0,
      replyCount: 0,
      tags: '[]',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },
  forumReplies: {
    required: ['postId', 'userId', 'content'],
    types: {
      id: 'string',
      uid: 'string',
      postId: 'string',
      userId: 'string',
      content: 'string',
      createdAt: 'date',
      updatedAt: 'date',
      parentReplyId: 'string',
      isModerated: 'boolean',
      votes: 'number'
    },
    defaults: {
      isModerated: false,
      votes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },
  aiGenerationUsage: {
    required: ['userId', 'month', 'freeGenerationsUsed', 'paidGenerationsUsed', 'subscriptionActive'],
    types: {
      id: 'string',
      uid: 'string',
      userId: 'string',
      month: 'string',
      freeGenerationsUsed: 'number',
      paidGenerationsUsed: 'number',
      subscriptionActive: 'boolean',
      totalTokensUsed: 'number',
      lastGenerationAt: 'date'
    },
    defaults: {
      freeGenerationsUsed: 0,
      paidGenerationsUsed: 0,
      subscriptionActive: false,
      totalTokensUsed: 0
    }
  },
  platformSettings: {
    required: ['key', 'value'],
    types: {
      id: 'string',
      uid: 'string',
      key: 'string',
      value: 'string',
      description: 'string',
      updatedAt: 'date',
      category: 'string',
      isPublic: 'boolean'
    },
    defaults: {
      isPublic: false,
      updatedAt: new Date().toISOString()
    }
  },
  reviews: {
    required: ['userId', 'courseId', 'rating', 'comment'],
    types: {
      id: 'string',
      uid: 'string',
      userId: 'string',
      courseId: 'string',
      rating: 'number',
      comment: 'string',
      createdAt: 'date',
      isVerified: 'boolean',
      helpful: 'number'
    },
    defaults: {
      isVerified: false,
      helpful: 0,
      createdAt: new Date().toISOString()
    }
  },
  notifications: {
    required: ['userId', 'title', 'message', 'type'],
    types: {
      id: 'string',
      uid: 'string',
      userId: 'string',
      title: 'string',
      message: 'string',
      type: 'string',
      isRead: 'boolean',
      createdAt: 'date',
      actionUrl: 'string'
    },
    defaults: {
      isRead: false,
      createdAt: new Date().toISOString()
    }
  },
  quizAttempts: {
    required: ['userId', 'lessonId', 'courseId', 'score', 'submittedAt'],
    types: {
      id: 'string',
      uid: 'string',
      userId: 'string',
      lessonId: 'string',
      courseId: 'string',
      score: 'number',
      answers: 'string',
      submittedAt: 'date',
      timeSpent: 'number',
      isCompleted: 'boolean'
    },
    defaults: {
      isCompleted: true,
      timeSpent: 0,
      submittedAt: new Date().toISOString()
    }
  }
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
      console.log('🔍 [SDK DEBUG] Starting GitHub SDK initialization...');
      
      await this.sdk.init();
      
      // Set up schemas
      Object.entries(schemas).forEach(([collection, schema]) => {
        this.sdk.setSchema(collection, schema);
      });

      // Initialize default data if collections are empty
      await this.initializeDefaultData();
      
      this.isInitialized = true;
      console.log('🔍 [SDK DEBUG] GitHub SDK initialized successfully');
    } catch (error) {
      console.error('🔍 [SDK DEBUG] Failed to initialize GitHub SDK:', error);
      throw error;
    }
  }

  private async initializeDefaultData(): Promise<void> {
    try {
      // Check if academic levels exist
      const academicLevels = await this.sdk.get('academicLevels');
      
      if (academicLevels.length === 0) {
        // Insert comprehensive academic levels data
        const defaultAcademicLevels = [
          // Early Childhood
          { name: 'Infant/Toddler Care', internationalEquivalent: 'Infant/Toddler Care', nigerianEquivalent: 'Creche', typicalAge: '0-2 years', category: 'Early Childhood', order: 1, description: 'Early childhood care and development' },
          { name: 'Preschool', internationalEquivalent: 'Preschool', nigerianEquivalent: 'Nursery 1', typicalAge: '3 years', category: 'Early Childhood', order: 2, description: 'Basic pre-school education' },
          { name: 'Pre-Kindergarten', internationalEquivalent: 'Pre-Kindergarten', nigerianEquivalent: 'Nursery 2', typicalAge: '4 years', category: 'Early Childhood', order: 3, description: 'Advanced pre-school preparation' },
          { name: 'Kindergarten', internationalEquivalent: 'Kindergarten/Reception', nigerianEquivalent: 'Kindergarten/Nursery 3', typicalAge: '5 years', category: 'Early Childhood', order: 4, description: 'School readiness preparation' },
          
          // Primary School
          { name: 'Grade 1', internationalEquivalent: 'Grade 1/Year 1', nigerianEquivalent: 'Primary 1', typicalAge: '6 years', category: 'Primary School', order: 5, description: 'Foundation of formal education' },
          { name: 'Grade 2', internationalEquivalent: 'Grade 2/Year 2', nigerianEquivalent: 'Primary 2', typicalAge: '7 years', category: 'Primary School', order: 6, description: 'Basic literacy and numeracy' },
          { name: 'Grade 3', internationalEquivalent: 'Grade 3/Year 3', nigerianEquivalent: 'Primary 3', typicalAge: '8 years', category: 'Primary School', order: 7, description: 'Intermediate primary education' },
          { name: 'Grade 4', internationalEquivalent: 'Grade 4/Year 4', nigerianEquivalent: 'Primary 4', typicalAge: '9 years', category: 'Primary School', order: 8, description: 'Advanced primary skills' },
          { name: 'Grade 5', internationalEquivalent: 'Grade 5/Year 5', nigerianEquivalent: 'Primary 5', typicalAge: '10 years', category: 'Primary School', order: 9, description: 'Upper primary education' },
          { name: 'Grade 6', internationalEquivalent: 'Grade 6/Year 6', nigerianEquivalent: 'Primary 6', typicalAge: '11 years', category: 'Primary School', order: 10, description: 'Primary completion level' },
          
          // Junior Secondary
          { name: 'Grade 7', internationalEquivalent: 'Grade 7/Year 7', nigerianEquivalent: 'JSS 1', typicalAge: '12 years', category: 'Junior Secondary', order: 11, description: 'Introduction to secondary education' },
          { name: 'Grade 8', internationalEquivalent: 'Grade 8/Year 8', nigerianEquivalent: 'JSS 2', typicalAge: '13 years', category: 'Junior Secondary', order: 12, description: 'Intermediate secondary education' },
          { name: 'Grade 9', internationalEquivalent: 'Grade 9/Year 9', nigerianEquivalent: 'JSS 3', typicalAge: '14 years', category: 'Junior Secondary', order: 13, description: 'Junior secondary completion' },
          
          // Senior Secondary
          { name: 'Grade 10', internationalEquivalent: 'Grade 10/Year 10', nigerianEquivalent: 'SS 1', typicalAge: '15 years', category: 'Senior Secondary', order: 14, description: 'Senior secondary foundation' },
          { name: 'Grade 11', internationalEquivalent: 'Grade 11/Year 11', nigerianEquivalent: 'SS 2', typicalAge: '16 years', category: 'Senior Secondary', order: 15, description: 'Advanced secondary education' },
          { name: 'Grade 12', internationalEquivalent: 'Grade 12/Year 12', nigerianEquivalent: 'SS 3', typicalAge: '17 years', category: 'Senior Secondary', order: 16, description: 'Secondary school completion' },
          
          // Post-Secondary
          { name: 'A-Level Year 1', internationalEquivalent: 'A-Level Year 1/IB Year 1', nigerianEquivalent: 'IJMB/JUPEB/Cambridge A-Level 1', typicalAge: '17-18 years', category: 'Post-Secondary', order: 17, description: 'Advanced level preparation' },
          { name: 'A-Level Year 2', internationalEquivalent: 'A-Level Year 2/IB Year 2', nigerianEquivalent: 'IJMB/JUPEB/Cambridge A-Level 2', typicalAge: '18-19 years', category: 'Post-Secondary', order: 18, description: 'Advanced level completion' },
          
          // Undergraduate
          { name: 'Freshman', internationalEquivalent: '1st Year - Freshman', nigerianEquivalent: '100 Level', typicalAge: '18-19 years', category: 'Undergraduate', order: 19, description: 'First year university' },
          { name: 'Sophomore', internationalEquivalent: '2nd Year - Sophomore', nigerianEquivalent: '200 Level', typicalAge: '19-20 years', category: 'Undergraduate', order: 20, description: 'Second year university' },
          { name: 'Junior', internationalEquivalent: '3rd Year - Junior', nigerianEquivalent: '300 Level', typicalAge: '20-21 years', category: 'Undergraduate', order: 21, description: 'Third year university' },
          { name: 'Senior', internationalEquivalent: '4th Year - Senior', nigerianEquivalent: '400 Level', typicalAge: '21-22 years', category: 'Undergraduate', order: 22, description: 'Final year undergraduate' },
          { name: '5th Year', internationalEquivalent: '5th Year (Engineering/Medicine)', nigerianEquivalent: '500 Level', typicalAge: '22-23 years', category: 'Undergraduate', order: 23, description: 'Extended undergraduate programs' },
          
          // Postgraduate
          { name: 'Postgraduate Diploma', internationalEquivalent: 'Postgraduate Diploma', nigerianEquivalent: 'PGD', typicalAge: '23-24 years', category: 'Postgraduate', order: 24, description: 'Postgraduate diploma level' },
          { name: 'Masters Year 1', internationalEquivalent: 'Master\'s Year 1', nigerianEquivalent: 'MSc/MA/MBA - Year 1', typicalAge: '24-25 years', category: 'Postgraduate', order: 25, description: 'First year masters' },
          { name: 'Masters Year 2', internationalEquivalent: 'Master\'s Year 2', nigerianEquivalent: 'MSc/MA/MBA - Year 2', typicalAge: '25-26 years', category: 'Postgraduate', order: 26, description: 'Second year masters' }
        ];

        await this.sdk.bulkInsert('academicLevels', defaultAcademicLevels);

        // Initialize comprehensive subjects for each academic level
        const subjects = await this.sdk.get('subjects');
        if (subjects.length === 0) {
          const defaultSubjects = [
            // Early Childhood subjects
            { name: 'Early Literacy', academicLevelId: '1', description: 'Basic reading and writing skills', category: 'language', icon: '📚' },
            { name: 'Basic Math', academicLevelId: '1', description: 'Numbers and counting', category: 'mathematics', icon: '🔢' },
            { name: 'Creative Arts', academicLevelId: '1', description: 'Art and creativity', category: 'arts', icon: '🎨' },
            
            // Primary subjects
            { name: 'Mathematics', academicLevelId: '5', description: 'Elementary mathematics', category: 'mathematics', icon: '➕' },
            { name: 'English Language', academicLevelId: '5', description: 'Language arts and communication', category: 'language', icon: '🇬🇧' },
            { name: 'Science', academicLevelId: '5', description: 'Basic science concepts', category: 'science', icon: '🔬' },
            { name: 'Social Studies', academicLevelId: '5', description: 'Society and environment', category: 'social', icon: '🌍' },
            
            // Secondary subjects
            { name: 'Physics', academicLevelId: '11', description: 'Physical sciences', category: 'science', icon: '⚛️' },
            { name: 'Chemistry', academicLevelId: '11', description: 'Chemical sciences', category: 'science', icon: '🧪' },
            { name: 'Biology', academicLevelId: '11', description: 'Life sciences', category: 'science', icon: '🧬' },
            { name: 'Geography', academicLevelId: '11', description: 'Earth and environmental science', category: 'social', icon: '🗺️' },
            { name: 'History', academicLevelId: '11', description: 'Historical studies', category: 'social', icon: '📜' },
            { name: 'Literature', academicLevelId: '11', description: 'Literary analysis and appreciation', category: 'language', icon: '📖' },
            
            // University subjects
            { name: 'Computer Science', academicLevelId: '19', description: 'Computing and programming', category: 'technology', icon: '💻' },
            { name: 'Engineering', academicLevelId: '19', description: 'Engineering principles', category: 'technology', icon: '⚙️' },
            { name: 'Medicine', academicLevelId: '19', description: 'Medical sciences', category: 'science', icon: '🩺' },
            { name: 'Law', academicLevelId: '19', description: 'Legal studies', category: 'social', icon: '⚖️' },
            { name: 'Business Administration', academicLevelId: '19', description: 'Business and management', category: 'business', icon: '💼' },
          ];

          await this.sdk.bulkInsert('subjects', defaultSubjects);
        }

        // Initialize platform settings
        const defaultSettings = [
          { key: 'commission_rate', value: '15', description: 'Platform commission rate percentage', category: 'payment', isPublic: false },
          { key: 'free_ai_generations_per_month', value: '3', description: 'Number of free AI generations per month', category: 'ai', isPublic: true },
          { key: 'ai_course_price', value: '0.5', description: 'Price per AI generated course in USD', category: 'pricing', isPublic: true },
          { key: 'pro_subscription_price', value: '5', description: 'Monthly pro subscription price in USD', category: 'pricing', isPublic: true },
          { key: 'course_expiry_days', value: '30', description: 'Days until course expires for non-pro users', category: 'subscription', isPublic: false },
          { key: 'platform_name', value: 'ProLearning', description: 'Platform name', category: 'general', isPublic: true },
          { key: 'support_email', value: 'support@prolearning.com', description: 'Support email address', category: 'contact', isPublic: true }
        ];

        await this.sdk.bulkInsert('platformSettings', defaultSettings);

        // Initialize default badges
        const defaultBadges = [
          { name: 'First Course', description: 'Completed your first course', criteria: 'complete_first_course', icon: '🎓', color: 'blue', category: 'achievement', points: 50 },
          { name: 'Quick Learner', description: 'Completed a course in under 24 hours', criteria: 'fast_completion', icon: '⚡', color: 'yellow', category: 'speed', points: 100 },
          { name: 'Perfect Score', description: 'Achieved 100% on a quiz', criteria: 'perfect_quiz', icon: '💯', color: 'green', category: 'academic', points: 75 },
          { name: 'Consistent Learner', description: 'Studied for 7 consecutive days', criteria: 'daily_streak_7', icon: '🔥', color: 'red', category: 'consistency', points: 200 }
        ];

        await this.sdk.bulkInsert('badges', defaultBadges);
      }
    } catch (error) {
      console.error('🔍 [SDK DEBUG] Error initializing default data:', error);
    }
  }

  private async safeOperation<T>(operation: () => Promise<T>, retries = 5): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        return await operation();
      } catch (error: any) {
        if (error.message.includes('409') && i < retries - 1) {
          const baseDelay = Math.pow(2, i) * 1000;
          const jitter = Math.random() * 1000;
          const delay = baseDelay + jitter;
          
          console.log(`🔍 [SDK DEBUG] Conflict detected, retrying in ${delay}ms (attempt ${i + 1}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
    throw new Error('Max retries exceeded for GitHub operation');
  }

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
}

export const db = new GitHubDatabase();
export default db;

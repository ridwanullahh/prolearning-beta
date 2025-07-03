
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
      subscriptionExpiry: 'date'
    },
    defaults: {
      isActive: true,
      profileComplete: false,
      language: 'en',
      learningStyle: 'visual',
      subscription: 'free',
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
      status: 'string'
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },
  lessons: {
    required: ['courseId', 'title', 'description', 'content', 'order', 'duration', 'type', 'isRequired'],
    types: {
      id: 'string',
      uid: 'string',
      courseId: 'string',
      title: 'string',
      description: 'string',
      content: 'string',
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
      isPublished: 'boolean'
    },
    defaults: {
      isRequired: true,
      isPublished: true,
      type: 'text',
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
      shuffleQuestions: 'boolean'
    },
    defaults: {
      isActive: true,
      attempts: 3,
      quizType: 'practice',
      showResults: true,
      shuffleQuestions: false,
      passingScore: 70
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
      explanation: 'string'
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
      connections: 'string'
    },
    defaults: {
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
      examples: 'string'
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
      certificates: 'string'
    },
    defaults: {
      progressPercentage: 0,
      totalTimeSpent: 0,
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
      refundStatus: 'string'
    },
    defaults: {
      enrolledAt: new Date().toISOString(),
      status: 'active',
      paymentStatus: 'free'
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
      validUntil: 'date'
    },
    defaults: {
      issuedAt: new Date().toISOString()
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

  constructor() {
    this.sdk = new UniversalSDK(SDK_CONFIG);
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
      }
    } catch (error) {
      console.error('Error initializing default data:', error);
    }
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
}

export const db = new GitHubDatabase();
export default db;


import Dexie, { Table } from 'dexie';

// User and Authentication Types
export interface User {
  id?: number;
  email: string;
  passwordHash: string;
  name: string;
  role: 'learner' | 'instructor' | 'super_admin';
  avatar?: string;
  country?: string;
  currency?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  profileComplete: boolean;
}

export interface UserProfile {
  id?: number;
  userId: number;
  gradeLevel?: string;
  academicLevel?: string;
  learningStyle?: string;
  preferences?: string; // JSON string
  timezone?: string;
  language?: string;
}

// Academic Structure
export interface AcademicLevel {
  id?: number;
  name: string;
  internationalEquivalent: string;
  nigerianEquivalent: string;
  typicalAge: string;
  category: string;
  order: number;
}

export interface Subject {
  id?: number;
  name: string;
  academicLevelId: number;
  description?: string;
  isActive: boolean;
}

// Courses and Content
export interface Course {
  id?: number;
  title: string;
  description: string;
  creatorId: number;
  creatorType: 'ai' | 'instructor';
  academicLevelId: number;
  subjectId: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in hours
  price?: number;
  currency?: string;
  isPublished: boolean;
  isAiGenerated: boolean;
  thumbnailUrl?: string;
  tags?: string;
  createdAt: Date;
  updatedAt: Date;
  school?: string;
  enrollmentCount: number;
  rating: number;
  reviewCount: number;
}

export interface Lesson {
  id?: number;
  courseId: number;
  title: string;
  description: string;
  content: string; // JSON string for rich content
  order: number;
  duration: number; // in minutes
  type: 'text' | 'video' | 'audio' | 'interactive';
  isRequired: boolean;
  createdAt: Date;
}

export interface Quiz {
  id?: number;
  lessonId: number;
  title: string;
  description?: string;
  questions: string; // JSON string
  totalQuestions: number;
  passingScore: number;
  timeLimit?: number; // in minutes
  attempts: number;
  isActive: boolean;
}

export interface Flashcard {
  id?: number;
  lessonId: number;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags?: string;
  order: number;
}

export interface MindMap {
  id?: number;
  lessonId: number;
  title: string;
  data: string; // JSON string for mind map structure
  createdAt: Date;
}

export interface KeyPoint {
  id?: number;
  lessonId: number;
  point: string;
  explanation?: string;
  order: number;
  importance: 'low' | 'medium' | 'high';
}

// Progress and Analytics
export interface UserProgress {
  id?: number;
  userId: number;
  courseId: number;
  lessonId?: number;
  progressPercentage: number;
  lastAccessedAt: Date;
  completedAt?: Date;
  totalTimeSpent: number; // in minutes
}

export interface QuizAttempt {
  id?: number;
  userId: number;
  quizId: number;
  score: number;
  totalQuestions: number;
  answers: string; // JSON string
  completedAt: Date;
  timeSpent: number; // in minutes
}

// Enrollment and Payments
export interface Enrollment {
  id?: number;
  userId: number;
  courseId: number;
  enrolledAt: Date;
  expiresAt?: Date;
  status: 'active' | 'expired' | 'cancelled';
  paymentStatus: 'free' | 'paid' | 'pending';
  amount?: number;
  currency?: string;
}

export interface Wallet {
  id?: number;
  userId: number;
  balance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id?: number;
  userId: number;
  amount: number;
  currency: string;
  type: 'credit' | 'debit';
  category: 'course_purchase' | 'subscription' | 'withdrawal' | 'commission';
  description: string;
  referenceId?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

// AI Generation Tracking
export interface AiGenerationUsage {
  id?: number;
  userId: number;
  month: string; // YYYY-MM format
  freeGenerationsUsed: number;
  paidGenerationsUsed: number;
  subscriptionActive: boolean;
}

// Settings and Configuration
export interface PlatformSettings {
  id?: number;
  key: string;
  value: string;
  description?: string;
  updatedAt: Date;
}

class ProLearningDatabase extends Dexie {
  users!: Table<User>;
  userProfiles!: Table<UserProfile>;
  academicLevels!: Table<AcademicLevel>;
  subjects!: Table<Subject>;
  courses!: Table<Course>;
  lessons!: Table<Lesson>;
  quizzes!: Table<Quiz>;
  flashcards!: Table<Flashcard>;
  mindMaps!: Table<MindMap>;
  keyPoints!: Table<KeyPoint>;
  userProgress!: Table<UserProgress>;
  quizAttempts!: Table<QuizAttempt>;
  enrollments!: Table<Enrollment>;
  wallets!: Table<Wallet>;
  transactions!: Table<Transaction>;
  aiGenerationUsage!: Table<AiGenerationUsage>;
  platformSettings!: Table<PlatformSettings>;

  constructor() {
    super('ProLearningDatabase');
    
    this.version(1).stores({
      users: '++id, email, role, isActive, createdAt',
      userProfiles: '++id, userId, gradeLevel, academicLevel',
      academicLevels: '++id, category, order',
      subjects: '++id, academicLevelId, isActive',
      courses: '++id, creatorId, academicLevelId, subjectId, isPublished, isAiGenerated, createdAt',
      lessons: '++id, courseId, order',
      quizzes: '++id, lessonId, isActive',
      flashcards: '++id, lessonId, difficulty, order',
      mindMaps: '++id, lessonId, createdAt',
      keyPoints: '++id, lessonId, order, importance',
      userProgress: '++id, userId, courseId, lessonId, lastAccessedAt',
      quizAttempts: '++id, userId, quizId, completedAt',
      enrollments: '++id, userId, courseId, enrolledAt, status',
      wallets: '++id, userId, currency',
      transactions: '++id, userId, type, category, status, createdAt',
      aiGenerationUsage: '++id, userId, month',
      platformSettings: '++id, key'
    });
  }
}

export const db = new ProLearningDatabase();

// Initialize default data
export const initializeDatabase = async () => {
  // Check if academic levels exist
  const levelCount = await db.academicLevels.count();
  
  if (levelCount === 0) {
    // Insert academic levels data
    const academicLevels: AcademicLevel[] = [
      // Early Childhood
      { name: 'Infant/Toddler Care', internationalEquivalent: 'Infant/Toddler Care', nigerianEquivalent: 'Creche', typicalAge: '0-2 years', category: 'Early Childhood', order: 1 },
      { name: 'Preschool', internationalEquivalent: 'Preschool', nigerianEquivalent: 'Nursery 1', typicalAge: '3 years', category: 'Early Childhood', order: 2 },
      { name: 'Pre-Kindergarten', internationalEquivalent: 'Pre-Kindergarten', nigerianEquivalent: 'Nursery 2', typicalAge: '4 years', category: 'Early Childhood', order: 3 },
      { name: 'Kindergarten', internationalEquivalent: 'Kindergarten/Reception', nigerianEquivalent: 'Kindergarten/Nursery 3', typicalAge: '5 years', category: 'Early Childhood', order: 4 },
      
      // Primary School
      { name: 'Grade 1', internationalEquivalent: 'Grade 1/Year 1', nigerianEquivalent: 'Primary 1', typicalAge: '6 years', category: 'Primary School', order: 5 },
      { name: 'Grade 2', internationalEquivalent: 'Grade 2/Year 2', nigerianEquivalent: 'Primary 2', typicalAge: '7 years', category: 'Primary School', order: 6 },
      { name: 'Grade 3', internationalEquivalent: 'Grade 3/Year 3', nigerianEquivalent: 'Primary 3', typicalAge: '8 years', category: 'Primary School', order: 7 },
      { name: 'Grade 4', internationalEquivalent: 'Grade 4/Year 4', nigerianEquivalent: 'Primary 4', typicalAge: '9 years', category: 'Primary School', order: 8 },
      { name: 'Grade 5', internationalEquivalent: 'Grade 5/Year 5', nigerianEquivalent: 'Primary 5', typicalAge: '10 years', category: 'Primary School', order: 9 },
      { name: 'Grade 6', internationalEquivalent: 'Grade 6/Year 6', nigerianEquivalent: 'Primary 6', typicalAge: '11 years', category: 'Primary School', order: 10 },
      
      // Junior Secondary
      { name: 'Grade 7', internationalEquivalent: 'Grade 7/Year 7', nigerianEquivalent: 'JSS 1', typicalAge: '12 years', category: 'Junior Secondary', order: 11 },
      { name: 'Grade 8', internationalEquivalent: 'Grade 8/Year 8', nigerianEquivalent: 'JSS 2', typicalAge: '13 years', category: 'Junior Secondary', order: 12 },
      { name: 'Grade 9', internationalEquivalent: 'Grade 9/Year 9', nigerianEquivalent: 'JSS 3', typicalAge: '14 years', category: 'Junior Secondary', order: 13 },
      
      // Senior Secondary
      { name: 'Grade 10', internationalEquivalent: 'Grade 10/Year 10', nigerianEquivalent: 'SS 1', typicalAge: '15 years', category: 'Senior Secondary', order: 14 },
      { name: 'Grade 11', internationalEquivalent: 'Grade 11/Year 11', nigerianEquivalent: 'SS 2', typicalAge: '16 years', category: 'Senior Secondary', order: 15 },
      { name: 'Grade 12', internationalEquivalent: 'Grade 12/Year 12', nigerianEquivalent: 'SS 3', typicalAge: '17 years', category: 'Senior Secondary', order: 16 },
      
      // Post-Secondary
      { name: 'A-Level Year 1', internationalEquivalent: 'A-Level Year 1/IB Year 1', nigerianEquivalent: 'IJMB/JUPEB/Cambridge A-Level 1', typicalAge: '17-18 years', category: 'Post-Secondary', order: 17 },
      { name: 'A-Level Year 2', internationalEquivalent: 'A-Level Year 2/IB Year 2', nigerianEquivalent: 'IJMB/JUPEB/Cambridge A-Level 2', typicalAge: '18-19 years', category: 'Post-Secondary', order: 18 },
      
      // Undergraduate
      { name: 'Freshman', internationalEquivalent: '1st Year - Freshman', nigerianEquivalent: '100 Level', typicalAge: '18-19 years', category: 'Undergraduate', order: 19 },
      { name: 'Sophomore', internationalEquivalent: '2nd Year - Sophomore', nigerianEquivalent: '200 Level', typicalAge: '19-20 years', category: 'Undergraduate', order: 20 },
      { name: 'Junior', internationalEquivalent: '3rd Year - Junior', nigerianEquivalent: '300 Level', typicalAge: '20-21 years', category: 'Undergraduate', order: 21 },
      { name: 'Senior', internationalEquivalent: '4th Year - Senior', nigerianEquivalent: '400 Level', typicalAge: '21-22 years', category: 'Undergraduate', order: 22 },
      { name: '5th Year', internationalEquivalent: '5th Year (Engineering/Medicine)', nigerianEquivalent: '500 Level', typicalAge: '22-23 years', category: 'Undergraduate', order: 23 },
      
      // Postgraduate
      { name: 'Postgraduate Diploma', internationalEquivalent: 'Postgraduate Diploma', nigerianEquivalent: 'PGD', typicalAge: '23-24 years', category: 'Postgraduate', order: 24 },
      { name: 'Masters Year 1', internationalEquivalent: 'Master\'s Year 1', nigerianEquivalent: 'MSc/MA/MBA - Year 1', typicalAge: '24-25 years', category: 'Postgraduate', order: 25 },
      { name: 'Masters Year 2', internationalEquivalent: 'Master\'s Year 2', nigerianEquivalent: 'MSc/MA/MBA - Year 2', typicalAge: '25-26 years', category: 'Postgraduate', order: 26 }
    ];

    await db.academicLevels.bulkAdd(academicLevels);

    // Initialize platform settings
    const settings: PlatformSettings[] = [
      { key: 'commission_rate', value: '15', description: 'Platform commission rate percentage', updatedAt: new Date() },
      { key: 'free_ai_generations_per_month', value: '3', description: 'Number of free AI generations per month', updatedAt: new Date() },
      { key: 'ai_course_price', value: '0.5', description: 'Price per AI generated course in USD', updatedAt: new Date() },
      { key: 'pro_subscription_price', value: '5', description: 'Monthly pro subscription price in USD', updatedAt: new Date() }
    ];

    await db.platformSettings.bulkAdd(settings);
  }
};


import { config } from './config';
import CryptoJS from 'crypto-js';

class GitHubDatabase {
  private initialized = false;
  private tables: Record<string, any[]> = {};
  private sessions: Map<string, { user: any; expiresAt: number }> = new Map();
  private storage: Storage;

  constructor() {
    this.storage = typeof window !== 'undefined' ? window.localStorage : {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      length: 0,
      key: () => null
    } as Storage;
  }

  async initialize() {
    if (this.initialized) return;
    
    console.log('Initializing GitHub SDK...');
    
    // Load existing data from localStorage
    const storedData = this.storage.getItem('github_sdk_data');
    if (storedData) {
      try {
        this.tables = JSON.parse(storedData);
        console.log('Loaded existing data from localStorage');
      } catch (error) {
        console.warn('Failed to load stored data, initializing fresh');
      }
    }
    
    // Initialize all tables with proper schema if they don't exist
    if (!this.tables.users) this.tables.users = [];
    if (!this.tables.courses) this.tables.courses = [];
    if (!this.tables.lessons) this.tables.lessons = [];
    if (!this.tables.lessonContents) this.tables.lessonContents = [];
    if (!this.tables.quizzes) this.tables.quizzes = [];
    if (!this.tables.quizAttempts) this.tables.quizAttempts = [];
    if (!this.tables.flashcards) this.tables.flashcards = [];
    if (!this.tables.keyPoints) this.tables.keyPoints = [];
    if (!this.tables.mindMaps) this.tables.mindMaps = [];
    if (!this.tables.enrollments) this.tables.enrollments = [];
    if (!this.tables.userProgress) this.tables.userProgress = [];
    if (!this.tables.walletTransactions) this.tables.walletTransactions = [];
    if (!this.tables.userWallets) this.tables.userWallets = [];
    if (!this.tables.instructorEarnings) this.tables.instructorEarnings = [];
    if (!this.tables.instructorWithdrawals) this.tables.instructorWithdrawals = [];
    if (!this.tables.blogPosts) this.tables.blogPosts = [];
    if (!this.tables.helpArticles) this.tables.helpArticles = [];
    if (!this.tables.supportTickets) this.tables.supportTickets = [];
    if (!this.tables.ticketMessages) this.tables.ticketMessages = [];
    if (!this.tables.courseGenerationJobs) this.tables.courseGenerationJobs = [];
    if (!this.tables.mediaUploads) this.tables.mediaUploads = [];
    if (!this.tables.userProfiles) this.tables.userProfiles = [];
    if (!this.tables.wallets) this.tables.wallets = [];
    if (!this.tables.aiGenerationUsage) this.tables.aiGenerationUsage = [];
    if (!this.tables.ticketReplies) this.tables.ticketReplies = [];

    // Initialize reference data
    if (!this.tables.academicLevels || this.tables.academicLevels.length === 0) {
      this.tables.academicLevels = [
        { id: '1', name: 'Elementary School', description: 'Grades K-5', order: 1 },
        { id: '2', name: 'Middle School', description: 'Grades 6-8', order: 2 },
        { id: '3', name: 'High School', description: 'Grades 9-12', order: 3 },
        { id: '4', name: 'University', description: 'Undergraduate level', order: 4 },
        { id: '5', name: 'Graduate', description: 'Graduate level', order: 5 }
      ];
    }

    if (!this.tables.subjects || this.tables.subjects.length === 0) {
      this.tables.subjects = [
        { id: '1', name: 'Mathematics', description: 'Math and calculations' },
        { id: '2', name: 'Science', description: 'Natural sciences' },
        { id: '3', name: 'English', description: 'Language and literature' },
        { id: '4', name: 'History', description: 'Historical studies' },
        { id: '5', name: 'Computer Science', description: 'Programming and technology' },
        { id: '6', name: 'Business', description: 'Business and entrepreneurship' },
        { id: '7', name: 'Art', description: 'Visual and creative arts' },
        { id: '8', name: 'Music', description: 'Music theory and practice' }
      ];
    }

    // Load sessions from localStorage
    const storedSessions = this.storage.getItem('github_sdk_sessions');
    if (storedSessions) {
      try {
        const sessionData = JSON.parse(storedSessions);
        this.sessions = new Map(sessionData);
        console.log('Loaded existing sessions from localStorage');
      } catch (error) {
        console.warn('Failed to load stored sessions');
      }
    }

    this.initialized = true;
    console.log('GitHub SDK initialized successfully');
    this.persistData();
  }

  private persistData() {
    try {
      this.storage.setItem('github_sdk_data', JSON.stringify(this.tables));
      this.storage.setItem('github_sdk_sessions', JSON.stringify([...this.sessions.entries()]));
    } catch (error) {
      console.warn('Failed to persist data to localStorage:', error);
    }
  }

  async insert(table: string, data: any) {
    await this.initialize();
    const id = this.generateId();
    const item = {
      id,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (!this.tables[table]) {
      this.tables[table] = [];
    }
    
    this.tables[table].push(item);
    console.log(`Inserted into ${table}:`, item);
    this.persistData();
    return item;
  }

  async update(table: string, id: string, data: any) {
    await this.initialize();
    if (!this.tables[table]) return null;
    
    const index = this.tables[table].findIndex((item: any) => item.id === id);
    if (index === -1) return null;
    
    this.tables[table][index] = {
      ...this.tables[table][index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    console.log(`Updated ${table} ${id}:`, this.tables[table][index]);
    this.persistData();
    return this.tables[table][index];
  }

  async delete(table: string, id: string) {
    await this.initialize();
    if (!this.tables[table]) return false;
    
    const index = this.tables[table].findIndex((item: any) => item.id === id);
    if (index === -1) return false;
    
    this.tables[table].splice(index, 1);
    console.log(`Deleted from ${table}: ${id}`);
    this.persistData();
    return true;
  }

  async get(table: string) {
    await this.initialize();
    return [...(this.tables[table] || [])];
  }

  async getItem(table: string, id: string) {
    await this.initialize();
    if (!this.tables[table]) return null;
    return this.tables[table].find((item: any) => item.id === id) || null;
  }

  queryBuilder(table: string) {
    return new QueryBuilder(this, table);
  }

  // Authentication methods
  async register(email: string, password: string, profile: any = {}): Promise<any> {
    await this.initialize();
    const users = this.tables.users;
    const existingUser = users.find((u: any) => u.email === email);
    
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = this.hashPassword(password);
    const user = await this.insert('users', {
      email,
      password: hashedPassword,
      name: profile.name || email.split('@')[0],
      role: profile.role || 'learner',
      ...profile,
      isActive: true,
      status: 'active',
      lastLoginAt: new Date().toISOString()
    });

    return user;
  }

  async login(email: string, password: string): Promise<string> {
    await this.initialize();
    const users = this.tables.users;
    const user = users.find((u: any) => u.email === email);
    
    if (!user || !this.verifyPassword(password, user.password)) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive || user.status !== 'active') {
      throw new Error('Account is deactivated');
    }

    // Update last login
    await this.update('users', user.id, { lastLoginAt: new Date().toISOString() });

    return this.createSession(user);
  }

  createSession(user: any): string {
    const token = this.generateSessionToken();
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
    
    this.sessions.set(token, {
      user,
      expiresAt
    });

    this.persistData();
    return token;
  }

  getSession(token: string) {
    const session = this.sessions.get(token);
    if (!session || session.expiresAt < Date.now()) {
      if (session) {
        this.sessions.delete(token);
        this.persistData();
      }
      return null;
    }
    return session;
  }

  getCurrentUser(token: string): any | null {
    const session = this.getSession(token);
    if (!session) return null;
    
    // Get fresh user data from database
    const user = this.tables.users?.find((u: any) => u.id === session.user.id);
    return user || null;
  }

  destroySession(token: string): boolean {
    const deleted = this.sessions.delete(token);
    if (deleted) {
      this.persistData();
    }
    return deleted;
  }

  hashPassword(password: string): string {
    return CryptoJS.SHA256(password + 'prolearning_salt').toString();
  }

  verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }

  private generateSessionToken(): string {
    return CryptoJS.lib.WordArray.random(32).toString();
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  // Clear all data (for testing)
  async clearAll() {
    this.tables = {};
    this.sessions.clear();
    this.storage.removeItem('github_sdk_data');
    this.storage.removeItem('github_sdk_sessions');
    this.initialized = false;
    await this.initialize();
  }
}

class QueryBuilder {
  private db: GitHubDatabase;
  private tableName: string;
  private whereConditions: ((item: any) => boolean)[] = [];
  private orderByField?: string;
  private orderByDirection: 'asc' | 'desc' = 'asc';
  private limitCount?: number;

  constructor(db: GitHubDatabase, table: string) {
    this.db = db;
    this.tableName = table;
  }

  where(condition: (item: any) => boolean) {
    this.whereConditions.push(condition);
    return this;
  }

  orderBy(field: string, direction: 'asc' | 'desc' = 'asc') {
    this.orderByField = field;
    this.orderByDirection = direction;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  async exec() {
    const data = await this.db.get(this.tableName);
    let result = data;

    // Apply where conditions
    for (const condition of this.whereConditions) {
      result = result.filter(condition);
    }

    // Apply ordering
    if (this.orderByField) {
      result.sort((a, b) => {
        const aVal = a[this.orderByField!];
        const bVal = b[this.orderByField!];
        
        if (this.orderByDirection === 'asc') {
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else {
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
      });
    }

    // Apply limit
    if (this.limitCount) {
      result = result.slice(0, this.limitCount);
    }

    return result;
  }
}

export const db = new GitHubDatabase();

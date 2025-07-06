
import { config } from './config';
import CryptoJS from 'crypto-js';

class GitHubDatabase {
  private initialized = false;
  private tables: Record<string, any[]> = {};
  private sessions: Map<string, { user: any; expiresAt: number }> = new Map();

  async initialize() {
    if (this.initialized) return;
    
    console.log('Initializing GitHub SDK...');
    
    // Initialize all tables with proper schema
    this.tables = {
      users: [],
      courses: [],
      lessons: [],
      lessonContents: [],
      quizzes: [],
      quizAttempts: [],
      flashcards: [],
      keyPoints: [],
      mindMaps: [],
      enrollments: [],
      userProgress: [],
      academicLevels: [
        { id: '1', name: 'Elementary School', description: 'Grades K-5', order: 1 },
        { id: '2', name: 'Middle School', description: 'Grades 6-8', order: 2 },
        { id: '3', name: 'High School', description: 'Grades 9-12', order: 3 },
        { id: '4', name: 'University', description: 'Undergraduate level', order: 4 },
        { id: '5', name: 'Graduate', description: 'Graduate level', order: 5 }
      ],
      subjects: [
        { id: '1', name: 'Mathematics', description: 'Math and calculations' },
        { id: '2', name: 'Science', description: 'Natural sciences' },
        { id: '3', name: 'English', description: 'Language and literature' },
        { id: '4', name: 'History', description: 'Historical studies' },
        { id: '5', name: 'Computer Science', description: 'Programming and technology' }
      ],
      walletTransactions: [],
      userWallets: [],
      instructorEarnings: [],
      instructorWithdrawals: [],
      blogPosts: [],
      helpArticles: [],
      supportTickets: [],
      ticketMessages: [],
      courseGenerationJobs: [],
      mediaUploads: [],
      userProfiles: [],
      wallets: [],
      aiGenerationUsage: [],
      ticketReplies: []
    };

    this.initialized = true;
    console.log('GitHub SDK initialized successfully');
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
    return this.tables[table][index];
  }

  async delete(table: string, id: string) {
    await this.initialize();
    if (!this.tables[table]) return false;
    
    const index = this.tables[table].findIndex((item: any) => item.id === id);
    if (index === -1) return false;
    
    this.tables[table].splice(index, 1);
    console.log(`Deleted from ${table}: ${id}`);
    return true;
  }

  async get(table: string) {
    await this.initialize();
    return this.tables[table] || [];
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
      isActive: true
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

    return this.createSession(user);
  }

  createSession(user: any): string {
    const token = this.generateSessionToken();
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    
    this.sessions.set(token, {
      user,
      expiresAt
    });

    return token;
  }

  getSession(token: string) {
    const session = this.sessions.get(token);
    if (!session || session.expiresAt < Date.now()) {
      return null;
    }
    return session;
  }

  getCurrentUser(token: string): any | null {
    const session = this.getSession(token);
    return session?.user || null;
  }

  destroySession(token: string): boolean {
    return this.sessions.delete(token);
  }

  hashPassword(password: string): string {
    return CryptoJS.SHA256(password).toString();
  }

  verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }

  private generateSessionToken(): string {
    return CryptoJS.lib.WordArray.random(32).toString();
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
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

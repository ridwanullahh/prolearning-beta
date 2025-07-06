import { config } from './config';
import UniversalSDK from './universal-sdk';
import CryptoJS from 'crypto-js';

class GitHubDatabase {
  private sdk: UniversalSDK;
  private initialized = false;
  private sessions: Map<string, { user: any; expiresAt: number }> = new Map();

  constructor() {
    this.sdk = new UniversalSDK({
      owner: config.github.owner,
      repo: config.github.repo,
      token: config.github.token,
      branch: 'main',
      basePath: 'data',
      mediaPath: 'media'
    });
  }

  async initialize() {
    if (this.initialized) return;
    
    console.log('Initializing GitHub SDK...');
    
    try {
      await this.sdk.init();
      
      // Initialize default data for static tables
      const academicLevels = await this.sdk.get('academicLevels');
      if (academicLevels.length === 0) {
        await this.sdk.bulkInsert('academicLevels', [
          { name: 'Elementary School', description: 'Grades K-5', order: 1 },
          { name: 'Middle School', description: 'Grades 6-8', order: 2 },
          { name: 'High School', description: 'Grades 9-12', order: 3 },
          { name: 'University', description: 'Undergraduate level', order: 4 },
          { name: 'Graduate', description: 'Graduate level', order: 5 }
        ]);
      }

      const subjects = await this.sdk.get('subjects');
      if (subjects.length === 0) {
        await this.sdk.bulkInsert('subjects', [
          { name: 'Mathematics', description: 'Math and calculations' },
          { name: 'Science', description: 'Natural sciences' },
          { name: 'English', description: 'Language and literature' },
          { name: 'History', description: 'Historical studies' },
          { name: 'Computer Science', description: 'Programming and technology' }
        ]);
      }

      this.initialized = true;
      console.log('GitHub SDK initialized successfully');
    } catch (error) {
      console.error('Failed to initialize GitHub SDK:', error);
      throw error;
    }
  }

  async insert(table: string, data: any) {
    await this.initialize();
    const item = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const result = await this.sdk.insert(table, item);
    console.log(`Inserted into ${table}:`, result);
    return result;
  }

  async update(table: string, id: string, data: any) {
    await this.initialize();
    try {
      const updatedData = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      const result = await this.sdk.update(table, id, updatedData);
      console.log(`Updated ${table} ${id}:`, result);
      return result;
    } catch (error) {
      console.error(`Error updating ${table} ${id}:`, error);
      return null;
    }
  }

  async delete(table: string, id: string) {
    await this.initialize();
    try {
      await this.sdk.delete(table, id);
      console.log(`Deleted from ${table}: ${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting from ${table}:`, error);
      return false;
    }
  }

  async get(table: string) {
    await this.initialize();
    return await this.sdk.get(table);
  }

  async getItem(table: string, id: string) {
    await this.initialize();
    return await this.sdk.getItem(table, id);
  }

  queryBuilder(table: string) {
    return new QueryBuilder(this, table);
  }

  // Authentication methods
  async register(email: string, password: string, profile: any = {}): Promise<any> {
    await this.initialize();
    const users = await this.sdk.get('users');
    const existingUser = users.find((u: any) => u.email === email);
    
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = this.hashPassword(password);
    const user = await this.sdk.insert('users', {
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
    const users = await this.sdk.get('users');
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
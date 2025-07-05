import { config } from './config';

class GitHubDatabase {
  private initialized = false;
  private tables: Record<string, any[]> = {};

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
      mediaUploads: []
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

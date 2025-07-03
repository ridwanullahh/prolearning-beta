import OpenAI from "openai";
import { config } from "./config";

interface QueryBuilder {
  where(predicate: (item: any) => boolean): QueryBuilder;
  sort(field: string, direction: 'asc' | 'desc'): QueryBuilder;
  exec(): Promise<any[]>;
}

class GitHubDatabase {
  private initialized = false;
  private tableName = 'prolearning_data';
  private sessionStore: Map<string, any> = new Map();

  async initialize() {
    if (this.initialized) return;
    
    try {
      console.log('Initializing GitHub SDK...');
      
      if (!config.github.owner || !config.github.repo || !config.github.token) {
        throw new Error('GitHub configuration is missing. Please check your environment variables.');
      }

      // Test the connection
      const response = await fetch(`https://api.github.com/repos/${config.github.owner}/${config.github.repo}`, {
        headers: {
          'Authorization': `token ${config.github.token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      this.initialized = true;
      console.log('GitHub SDK initialized successfully');
    } catch (error) {
      console.error('Failed to initialize GitHub SDK:', error);
      throw error;
    }
  }

  private async getData(): Promise<any> {
    try {
      await this.initialize();

      const response = await fetch(`https://api.github.com/repos/${config.github.owner}/${config.github.repo}/contents/${this.tableName}.json`, {
        headers: {
          'Authorization': `token ${config.github.token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (response.status === 404) {
        console.warn('Data file not found. Returning default data.');
        return { 
          users: [], 
          courses: [], 
          lessons: [],
          quizzes: [],
          flashcards: [],
          keyPoints: [],
          mindMaps: [],
          enrollments: [],
          academicLevels: [],
          subjects: [],
          aiGenerationUsage: [],
          platformSettings: [],
          userProfiles: [],
          wallets: [],
          transactions: []
        };
      }

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to get data:', error);
      throw error;
    }
  }

  private async saveData(data: any): Promise<void> {
    try {
      await this.initialize();

      const content = JSON.stringify(data, null, 2);
      const contentBase64 = Buffer.from(content).toString('base64');

      // Get the current file's SHA for the update
      const getResponse = await fetch(`https://api.github.com/repos/${config.github.owner}/${config.github.repo}/contents/${this.tableName}.json`, {
        headers: {
          'Authorization': `token ${config.github.token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      let sha = '';
      if (getResponse.ok) {
        const getData = await getResponse.json();
        sha = getData.sha;
      } else if (getResponse.status === 404) {
        console.log('File does not exist, creating new file.');
      } else {
        throw new Error(`GitHub API error: ${getResponse.status} ${getResponse.statusText}`);
      }

      const body = JSON.stringify({
        message: 'Update prolearning data',
        content: contentBase64,
        sha: sha,
        branch: 'main',
      });

      const response = await fetch(`https://api.github.com/repos/${config.github.owner}/${config.github.repo}/contents/${this.tableName}.json`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${config.github.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('GitHub API error details:', errorData);
        throw new Error(`Failed to save data: ${response.status} ${response.statusText}`);
      }

      console.log('Data saved successfully');
    } catch (error) {
      console.error('Failed to save data:', error);
      throw error;
    }
  }

  async get(tableName: string): Promise<any[]> {
    try {
      const data = await this.getData();
      return data[tableName] || [];
    } catch (error) {
      console.error(`Error getting ${tableName}:`, error);
      return [];
    }
  }

  async getItem(tableName: string, id: string): Promise<any | null> {
    try {
      const data = await this.getData();
      const items = data[tableName] || [];
      return items.find((item: any) => item.id === id) || null;
    } catch (error) {
      console.error(`Error getting item from ${tableName}:`, error);
      return null;
    }
  }

  async insert(tableName: string, item: any): Promise<any> {
    try {
      const data = await this.getData();
      data[tableName] = data[tableName] || [];
      
      const newItem = {
        id: item.id || `${tableName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...item,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      data[tableName].push(newItem);
      await this.saveData(data);
      return newItem;
    } catch (error) {
      console.error(`Error inserting into ${tableName}:`, error);
      throw error;
    }
  }

  async update(tableName: string, id: string, updates: any): Promise<void> {
    try {
      const data = await this.getData();
      const items = data[tableName] || [];
      const index = items.findIndex((item: any) => item.id === id);
      
      if (index === -1) {
        throw new Error(`Item with id ${id} not found in ${tableName}`);
      }
      
      items[index] = {
        ...items[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await this.saveData(data);
    } catch (error) {
      console.error(`Error updating ${tableName}:`, error);
      throw error;
    }
  }

  async delete(tableName: string, id: string): Promise<void> {
    try {
      const data = await this.getData();
      data[tableName] = (data[tableName] || []).filter((item: any) => item.id !== id);
      await this.saveData(data);
    } catch (error) {
      console.error(`Error deleting from ${tableName}:`, error);
      throw error;
    }
  }

  queryBuilder(tableName: string): QueryBuilder {
    const self = this;
    let items: any[] = [];
    let whereClause: ((item: any) => boolean) | null = null;
    let sortField: string | null = null;
    let sortDirection: 'asc' | 'desc' = 'asc';

    return {
      where(predicate: (item: any) => boolean) {
        whereClause = predicate;
        return this;
      },
      
      sort(field: string, direction: 'asc' | 'desc' = 'asc') {
        sortField = field;
        sortDirection = direction;
        return this;
      },
      
      async exec() {
        try {
          const data = await self.getData();
          items = data[tableName] || [];
          
          if (whereClause) {
            items = items.filter(whereClause);
          }
          
          if (sortField) {
            items.sort((a, b) => {
              const aVal = a[sortField];
              const bVal = b[sortField];
              const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
              return sortDirection === 'desc' ? -comparison : comparison;
            });
          }
          
          return items;
        } catch (error) {
          console.error(`Error executing query on ${tableName}:`, error);
          return [];
        }
      }
    };
  }

  async login(email: string, password: string): Promise<string> {
    try {
      const data = await this.getData();
      const users = data.users || [];
      const user = users.find((u: any) => u.email === email);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // In a real implementation, you'd verify the password hash
      // For demo purposes, we'll just check if password matches
      if (user.password !== password) {
        throw new Error('Invalid password');
      }
      
      const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.sessionStore.set(token, { userId: user.id, createdAt: new Date().toISOString() });
      
      return token;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(email: string, password: string, userData: any): Promise<any> {
    try {
      const data = await this.getData();
      data.users = data.users || [];
      
      // Check if user already exists
      const existingUser = data.users.find((u: any) => u.email === email);
      if (existingUser) {
        throw new Error('User already exists');
      }
      
      const newUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        password, // In production, this should be hashed
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      data.users.push(newUser);
      await this.saveData(data);
      
      return newUser;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  getCurrentUser(token: string): any | null {
    const session = this.sessionStore.get(token);
    if (!session) return null;
    
    // In a real implementation, you'd fetch the user from the database
    return { id: session.userId };
  }

  createSession(user: any): string {
    const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.sessionStore.set(token, { userId: user.id, createdAt: new Date().toISOString() });
    return token;
  }

  getSession(token: string): any | null {
    return this.sessionStore.get(token) || null;
  }

  destroySession(token: string): void {
    this.sessionStore.delete(token);
  }

  async createUser(userData: any): Promise<any> {
    return this.insert('users', userData);
  }

  async updateUser(userId: string, updateData: any): Promise<void> {
    return this.update('users', userId, updateData);
  }

  async deleteUser(userId: string): Promise<void> {
    return this.delete('users', userId);
  }

  async getUser(userId: string): Promise<any> {
    return this.getItem('users', userId);
  }

  async getUserByEmail(email: string): Promise<any> {
    try {
      const users = await this.queryBuilder('users')
        .where(user => user.email === email)
        .exec();
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  async generateCourse(topic: string, userId: string): Promise<any> {
    try {
      await this.initialize();
      
      // For demo purposes, return a mock course
      // In production, you'd integrate with OpenAI or another AI service
      const course = {
        id: `course_${Date.now()}`,
        title: `Course on ${topic}`,
        description: `A comprehensive course about ${topic}`,
        userId: userId,
        createdAt: new Date().toISOString(),
        lessons: [
          {
            id: 1,
            title: `Introduction to ${topic}`,
            content: `Welcome to this course on ${topic}. This lesson covers the basics...`,
            duration: 30
          },
          {
            id: 2,
            title: `Advanced ${topic}`,
            content: `In this lesson, we'll dive deeper into ${topic}...`,
            duration: 45
          }
        ]
      };

      return this.insert('courses', course);
    } catch (error) {
      console.error('Error generating course:', error);
      throw error;
    }
  }

  async createCourse(courseData: any): Promise<any> {
    return this.insert('courses', courseData);
  }

  async updateCourse(courseId: string, updateData: any): Promise<void> {
    return this.update('courses', courseId, updateData);
  }

  async deleteCourse(courseId: string): Promise<void> {
    return this.delete('courses', courseId);
  }

  async getCourse(courseId: string): Promise<any> {
    return this.getItem('courses', courseId);
  }

  async getUserCourses(userId: string): Promise<any[]> {
    try {
      return await this.queryBuilder('courses')
        .where(course => course.userId === userId)
        .exec();
    } catch (error) {
      console.error('Error getting user courses:', error);
      return [];
    }
  }

  async getInstructorCourses(instructorId: string): Promise<any[]> {
    try {
      return await this.queryBuilder('courses')
        .where(course => course.userId === instructorId && course.type === 'instructor_created')
        .exec();
    } catch (error) {
      console.error('Error getting instructor courses:', error);
      return [];
    }
  }

  async getPublishedCourses(): Promise<any[]> {
    try {
      return await this.queryBuilder('courses')
        .where(course => course.published === true)
        .exec();
    } catch (error) {
      console.error('Error getting published courses:', error);
      return [];
    }
  }
}

export const db = new GitHubDatabase();

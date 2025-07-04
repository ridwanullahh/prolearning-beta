import CryptoJS from 'crypto-js';

export interface UniversalSDKConfig {
  owner: string;
  repo: string;
  token: string;
  branch?: string;
  basePath?: string;
  mediaPath?: string;
  schemas?: Record<string, SchemaDefinition>;
  auth?: {
    requireEmailVerification?: boolean;
    otpTriggers?: string[];
  };
}

export interface SchemaDefinition {
  required: string[];
  types: Record<string, string>;
  defaults?: Record<string, any>;
}

export interface User {
  id: string;
  uid: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  country?: string;
  currency?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  password?: string;
}

export default class UniversalSDK {
  private config: UniversalSDKConfig;
  private baseUrl: string;
  private schemas: Record<string, SchemaDefinition> = {};
  private sessions: Map<string, { user: User; expiresAt: number }> = new Map();

  constructor(config: UniversalSDKConfig) {
    this.config = {
      branch: 'main',
      basePath: 'data',
      mediaPath: 'media',
      ...config
    };
    this.baseUrl = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}`;
  }

  async init(): Promise<void> {
    try {
      console.log('Initializing UniversalSDK with config:', {
        owner: this.config.owner,
        repo: this.config.repo,
        hasToken: !!this.config.token
      });
      
      if (!this.config.token || this.config.token === 'your-github-token') {
        throw new Error('Invalid GitHub token. Please set VITE_GITHUB_TOKEN environment variable.');
      }

      // Test the GitHub API connection
      const testResponse = await this.request('/');
      console.log('GitHub API connection successful:', testResponse.name);

      await this.ensureDirectoryExists(this.config.basePath!);
      await this.ensureDirectoryExists(this.config.mediaPath!);
    } catch (error) {
      console.error('Failed to initialize UniversalSDK:', error);
      throw error;
    }
  }

  setSchema(collection: string, schema: SchemaDefinition): void {
    this.schemas[collection] = schema;
  }

  private async ensureDirectoryExists(path: string): Promise<void> {
    try {
      await this.request(`/contents/${path}/.gitkeep`);
    } catch (error: any) {
      if (error.message.includes('404')) {
        await this.request(`/contents/${path}/.gitkeep`, {
          method: 'PUT',
          body: JSON.stringify({
            message: `Create ${path} directory`,
            content: this.encodeContent(''),
            branch: this.config.branch
          })
        });
      }
    }
  }

  private encodeContent(content: string): string {
    try {
      // Use TextEncoder for proper UTF-8 encoding
      const encoder = new TextEncoder();
      const uint8Array = encoder.encode(content);
      
      // Convert Uint8Array to base64
      let binary = '';
      const len = uint8Array.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(uint8Array[i]);
      }
      return btoa(binary);
    } catch (error) {
      console.error('Encoding error:', error);
      // Fallback for simple ASCII content
      return btoa(unescape(encodeURIComponent(content)));
    }
  }

  private decodeContent(content: string): string {
    try {
      const binary = atob(content);
      const uint8Array = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        uint8Array[i] = binary.charCodeAt(i);
      }
      const decoder = new TextDecoder();
      return decoder.decode(uint8Array);
    } catch (error) {
      console.error('Decoding error:', error);
      return decodeURIComponent(escape(atob(content)));
    }
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log('Making GitHub API request to:', url);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `token ${this.config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('GitHub API Error:', {
        status: response.status,
        statusText: response.statusText,
        url,
        error: errorData
      });
      throw new Error(errorData);
    }

    return response.json();
  }

  private async getFileWithSha(path: string): Promise<{ content: string; sha: string } | null> {
    try {
      const response = await this.request(`/contents/${path}`);
      return {
        content: this.decodeContent(response.content),
        sha: response.sha
      };
    } catch (error: any) {
      if (error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async save(collection: string, data: any[]): Promise<void> {
    const path = `${this.config.basePath}/${collection}.json`;
    const content = JSON.stringify(data, null, 2);
    
    try {
      const existing = await this.getFileWithSha(path);
      
      const requestBody: any = {
        message: `Update ${collection}`,
        content: this.encodeContent(content),
        branch: this.config.branch
      };

      if (existing) {
        requestBody.sha = existing.sha;
      }

      await this.request(`/contents/${path}`, {
        method: 'PUT',
        body: JSON.stringify(requestBody)
      });
    } catch (error: any) {
      if (error.message.includes('409')) {
        // Conflict - try to merge
        await this.handleConflict(path, content);
      } else {
        throw error;
      }
    }
  }

  private async handleConflict(path: string, newContent: string): Promise<void> {
    try {
      // Get the latest version
      const latest = await this.getFileWithSha(path);
      if (!latest) {
        throw new Error('Could not resolve conflict - file not found');
      }

      // Parse both versions
      const latestData = JSON.parse(latest.content);
      const newData = JSON.parse(newContent);

      // Simple merge strategy - combine arrays and deduplicate by id
      const merged = this.mergeData(latestData, newData);

      // Save with latest SHA
      await this.request(`/contents/${path}`, {
        method: 'PUT',
        body: JSON.stringify({
          message: `Resolve conflict in ${path}`,
          content: this.encodeContent(JSON.stringify(merged, null, 2)),
          sha: latest.sha,
          branch: this.config.branch
        })
      });
    } catch (error) {
      console.error('Conflict resolution failed:', error);
      throw error;
    }
  }

  private mergeData(existing: any[], incoming: any[]): any[] {
    if (!Array.isArray(existing)) existing = [];
    if (!Array.isArray(incoming)) incoming = [];

    const merged = [...existing];
    const existingIds = new Set(existing.map(item => item.id || item.uid));

    for (const item of incoming) {
      const id = item.id || item.uid;
      if (!existingIds.has(id)) {
        merged.push(item);
      } else {
        // Update existing item
        const index = merged.findIndex(m => (m.id || m.uid) === id);
        if (index !== -1) {
          merged[index] = { ...merged[index], ...item };
        }
      }
    }

    return merged;
  }

  async get<T = any>(collection: string): Promise<T[]> {
    const path = `${this.config.basePath}/${collection}.json`;
    try {
      const file = await this.getFileWithSha(path);
      if (!file) return [];
      return JSON.parse(file.content);
    } catch (error: any) {
      if (error.message.includes('404')) {
        return [];
      }
      throw error;
    }
  }

  async getItem<T = any>(collection: string, key: string): Promise<T | null> {
    const items = await this.get<T>(collection);
    return items.find((item: any) => item.id === key || item.uid === key) || null;
  }

  async insert<T = any>(collection: string, item: Partial<T>): Promise<T & { id: string; uid: string }> {
    const items = await this.get<T>(collection);
    const schema = this.schemas[collection];
    
    const newItem = {
      id: this.generateId(),
      uid: this.generateId(),
      ...item,
      ...(schema?.defaults || {})
    } as T & { id: string; uid: string };

    items.push(newItem);
    await this.save(collection, items);
    return newItem;
  }

  async bulkInsert<T = any>(collection: string, items: Partial<T>[]): Promise<(T & { id: string; uid: string })[]> {
    const existingItems = await this.get<T>(collection);
    const schema = this.schemas[collection];
    
    const newItems = items.map(item => ({
      id: this.generateId(),
      uid: this.generateId(),
      ...item,
      ...(schema?.defaults || {})
    })) as (T & { id: string; uid: string })[];

    const allItems = [...existingItems, ...newItems];
    await this.save(collection, allItems);
    return newItems;
  }

  async update<T = any>(collection: string, key: string, updates: Partial<T>): Promise<T> {
    const items = await this.get<T>(collection);
    const index = items.findIndex((item: any) => item.id === key || item.uid === key);
    
    if (index === -1) {
      throw new Error(`Item with key ${key} not found in ${collection}`);
    }

    items[index] = { ...items[index], ...updates };
    await this.save(collection, items);
    return items[index];
  }

  async bulkUpdate<T = any>(collection: string, updates: (Partial<T> & { id?: string; uid?: string })[]): Promise<T[]> {
    const items = await this.get<T>(collection);
    const updatedItems: T[] = [];

    for (const update of updates) {
      const key = update.id || update.uid;
      if (!key) continue;

      const index = items.findIndex((item: any) => item.id === key || item.uid === key);
      if (index !== -1) {
        items[index] = { ...items[index], ...update };
        updatedItems.push(items[index]);
      }
    }

    await this.save(collection, items);
    return updatedItems;
  }

  async delete<T = any>(collection: string, key: string): Promise<void> {
    const items = await this.get<T>(collection);
    const filteredItems = items.filter((item: any) => item.id !== key && item.uid !== key);
    await this.save(collection, filteredItems);
  }

  queryBuilder<T = any>(collection: string) {
    return new QueryBuilder<T>(this, collection);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Auth methods
  async register(email: string, password: string, profile: any = {}): Promise<User> {
    const users = await this.get<User>('users');
    const existingUser = users.find(u => u.email === email);
    
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = this.hashPassword(password);
    const user = await this.insert<User>('users', {
      email,
      password: hashedPassword,
      name: profile.name || email.split('@')[0],
      role: profile.role || 'learner',
      ...profile,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return user;
  }

  async login(email: string, password: string): Promise<string> {
    console.log('Attempting login for user:', email);
    const users = await this.get<User>('users');
    const user = users.find(u => u.email === email);
    
    if (!user) {
      console.error('User not found:', email);
      throw new Error('Invalid credentials');
    }

    if (!user.password) {
      console.error('User has no password set:', email);
      throw new Error('Invalid credentials');
    }

    if (!this.verifyPassword(password, user.password)) {
      console.error('Password verification failed for user:', email);
      throw new Error('Invalid credentials');
    }

    console.log('Login successful for user:', email);
    return this.createSession(user);
  }

  createSession(user: User): string {
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

  getCurrentUser(token: string): User | null {
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
}

class QueryBuilder<T> {
  private sdk: UniversalSDK;
  private collection: string;
  private filters: ((item: T) => boolean)[] = [];
  private sortFn?: (a: T, b: T) => number;
  private limitCount?: number;
  private offsetCount: number = 0;

  constructor(sdk: UniversalSDK, collection: string) {
    this.sdk = sdk;
    this.collection = collection;
  }

  where(predicate: (item: T) => boolean): this {
    this.filters.push(predicate);
    return this;
  }

  orderBy(keyOrFn: keyof T | ((item: T) => any), direction: 'asc' | 'desc' = 'asc'): this {
    this.sortFn = (a, b) => {
      const aVal = typeof keyOrFn === 'function' ? keyOrFn(a) : a[keyOrFn];
      const bVal = typeof keyOrFn === 'function' ? keyOrFn(b) : b[keyOrFn];
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    };
    return this;
  }

  sort(keyOrFn: keyof T | ((item: T) => any), direction: 'asc' | 'desc' = 'asc'): this {
    return this.orderBy(keyOrFn, direction);
  }

  limit(count: number): this {
    this.limitCount = count;
    return this;
  }

  offset(count: number): this {
    this.offsetCount = count;
    return this;
  }

  async exec(): Promise<T[]> {
    let items = await this.sdk.get<T>(this.collection);
    
    // Apply filters
    for (const filter of this.filters) {
      items = items.filter(filter);
    }
    
    // Apply sorting
    if (this.sortFn) {
      items.sort(this.sortFn);
    }
    
    // Apply offset
    if (this.offsetCount > 0) {
      items = items.slice(this.offsetCount);
    }
    
    // Apply limit
    if (this.limitCount) {
      items = items.slice(0, this.limitCount);
    }
    
    return items;
  }

  async first(): Promise<T | null> {
    const items = await this.limit(1).exec();
    return items[0] || null;
  }

  async count(): Promise<number> {
    const items = await this.exec();
    return items.length;
  }
}

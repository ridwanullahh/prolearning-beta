
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
}

interface QueuedOperation {
  id: string;
  type: 'save' | 'insert' | 'update' | 'delete';
  collection: string;
  data?: any;
  itemId?: string;
  resolve: (value: any) => void;
  reject: (error: Error) => void;
  retryCount: number;
  timestamp: number;
}

export default class UniversalSDK {
  private config: UniversalSDKConfig;
  private baseUrl: string;
  private schemas: Record<string, SchemaDefinition> = {};
  private sessions: Map<string, { user: User; expiresAt: number }> = new Map();
  private operationQueue: QueuedOperation[] = [];
  private isProcessingQueue = false;
  private readonly MAX_RETRIES = 5;
  private readonly RETRY_DELAY_BASE = 1000; // Base delay in ms
  private readonly QUEUE_PROCESSING_DELAY = 100; // Delay between operations

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
    return this.queueOperation('save', collection, data);
  }

  private async queueOperation(type: QueuedOperation['type'], collection: string, data?: any, itemId?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const operation: QueuedOperation = {
        id: this.generateId(),
        type,
        collection,
        data,
        itemId,
        resolve,
        reject,
        retryCount: 0,
        timestamp: Date.now()
      };

      this.operationQueue.push(operation);
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue) return;
    this.isProcessingQueue = true;

    console.log(`Processing GitHub operation queue: ${this.operationQueue.length} operations pending`);

    while (this.operationQueue.length > 0) {
      const operation = this.operationQueue.shift();
      if (!operation) continue;

      const startTime = Date.now();
      console.log(`Executing ${operation.type} operation on ${operation.collection} (ID: ${operation.id})`);

      try {
        const result = await this.executeOperation(operation);
        const duration = Date.now() - startTime;
        console.log(`✅ ${operation.type} operation completed in ${duration}ms`);
        operation.resolve(result);
      } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`❌ ${operation.type} operation failed after ${duration}ms:`, error);
        await this.handleOperationError(operation, error as Error);
      }

      // Small delay between operations to prevent overwhelming GitHub API
      await new Promise(resolve => setTimeout(resolve, this.QUEUE_PROCESSING_DELAY));
    }

    console.log('✅ GitHub operation queue processing completed');
    this.isProcessingQueue = false;
  }

  private async executeOperation(operation: QueuedOperation): Promise<any> {
    const { type, collection, data, itemId } = operation;

    switch (type) {
      case 'save':
        return this.executeSave(collection, data);
      case 'insert':
        return this.executeInsert(collection, data);
      case 'update':
        return this.executeUpdate(collection, itemId!, data);
      case 'delete':
        return this.executeDelete(collection, itemId!);
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }
  }

  private async executeSave(collection: string, data: any[]): Promise<void> {
    const path = `${this.config.basePath}/${collection}.json`;
    const content = JSON.stringify(data, null, 2);

    // Ensure collection exists
    await this.ensureCollectionExists(collection);

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
  }

  private async handleOperationError(operation: QueuedOperation, error: Error): Promise<void> {
    const isConflict = error.message.includes('409');
    const isRateLimit = error.message.includes('403') && error.message.includes('rate limit');

    if (isConflict && operation.retryCount < this.MAX_RETRIES) {
      // Handle conflict with intelligent retry
      try {
        await this.resolveConflictAndRetry(operation);
        return;
      } catch (conflictError) {
        console.error('Conflict resolution failed:', conflictError);
      }
    }

    if ((isRateLimit || isConflict) && operation.retryCount < this.MAX_RETRIES) {
      // Exponential backoff retry
      operation.retryCount++;
      const delay = this.RETRY_DELAY_BASE * Math.pow(2, operation.retryCount - 1);

      console.log(`Retrying operation ${operation.id} (attempt ${operation.retryCount}/${this.MAX_RETRIES}) after ${delay}ms`);

      setTimeout(() => {
        this.operationQueue.unshift(operation); // Add back to front of queue
        this.processQueue();
      }, delay);

      return;
    }

    // Max retries exceeded or non-recoverable error
    console.error(`Operation ${operation.id} failed after ${operation.retryCount} retries:`, error);
    operation.reject(error);
  }

  private async resolveConflictAndRetry(operation: QueuedOperation): Promise<void> {
    if (operation.type !== 'save') {
      throw new Error('Conflict resolution only supported for save operations');
    }

    const path = `${this.config.basePath}/${operation.collection}.json`;

    // Get the latest version
    const latest = await this.getFileWithSha(path);
    if (!latest) {
      throw new Error('Could not resolve conflict - file not found');
    }

    // Parse both versions
    const latestData = JSON.parse(latest.content);
    const newData = operation.data;

    // Intelligent merge strategy
    const merged = this.mergeData(latestData, newData);

    // Update operation with merged data and retry
    operation.data = merged;
    operation.retryCount++;

    // Add back to queue for retry
    this.operationQueue.unshift(operation);
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
      if (!file || !file.content) {
        // Auto-create collection if it doesn't exist
        await this.ensureCollectionExists(collection);
        return [];
      }
      return JSON.parse(file.content);
    } catch (error: any) {
      if (error.message.includes('404')) {
        // Auto-create collection if it doesn't exist
        await this.ensureCollectionExists(collection);
        return [];
      }
      throw error;
    }
  }

  private async ensureCollectionExists(collection: string): Promise<void> {
    const path = `${this.config.basePath}/${collection}.json`;

    try {
      // Check if collection already exists
      await this.getFileWithSha(path);
      return; // Collection exists, nothing to do
    } catch (error: any) {
      if (error.message.includes('404')) {
        // Collection doesn't exist, create it with empty array
        console.log(`Auto-creating collection: ${collection}`);

        try {
          await this.request(`/contents/${path}`, {
            method: 'PUT',
            body: JSON.stringify({
              message: `Create ${collection} collection`,
              content: this.encodeContent('[]'),
              branch: this.config.branch
            })
          });
        } catch (createError: any) {
          // If creation fails due to conflict, collection was created by another process
          if (!createError.message.includes('409')) {
            throw createError;
          }
        }
      } else {
        throw error;
      }
    }
  }

  async getItem<T = any>(collection: string, key: string): Promise<T | null> {
    const items = await this.get<T>(collection);
    return items.find((item: any) => item.id === key || item.uid === key) || null;
  }

  async insert<T = any>(collection: string, item: Partial<T>): Promise<T & { id: string; uid: string }> {
    return this.queueOperation('insert', collection, item);
  }

  private async executeInsert<T = any>(collection: string, item: Partial<T>): Promise<T & { id: string; uid: string }> {
    const items = await this.get<T>(collection);
    const schema = this.schemas[collection];

    const newItem = {
      id: this.generateId(),
      uid: this.generateId(),
      ...item,
      ...(schema?.defaults || {})
    } as T & { id: string; uid: string };

    items.push(newItem);
    await this.executeSave(collection, items);
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
    return this.queueOperation('update', collection, updates, key);
  }

  private async executeUpdate<T = any>(collection: string, key: string, updates: Partial<T>): Promise<T> {
    const items = await this.get<T>(collection);
    const index = items.findIndex((item: any) => item.id === key || item.uid === key);

    if (index === -1) {
      throw new Error(`Item with key ${key} not found in ${collection}`);
    }

    items[index] = { ...items[index], ...updates };
    await this.executeSave(collection, items);
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
    return this.queueOperation('delete', collection, undefined, key);
  }

  private async executeDelete<T = any>(collection: string, key: string): Promise<void> {
    const items = await this.get<T>(collection);
    const filteredItems = items.filter((item: any) => item.id !== key && item.uid !== key);
    await this.executeSave(collection, filteredItems);
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
    const users = await this.get<User>('users');
    const user = users.find(u => u.email === email);
    
    if (!user || !this.verifyPassword(password, (user as any).password)) {
      throw new Error('Invalid credentials');
    }

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

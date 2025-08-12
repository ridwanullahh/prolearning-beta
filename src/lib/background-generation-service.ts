// Background Generation Service
// Handles course generation in the background with service workers

export interface BackgroundGenerationRequest {
  id: string;
  courseTitle: string;
  courseSpec: any;
  userId: string;
  timestamp: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

class BackgroundGenerationService {
  private db: IDBDatabase | null = null;
  private isServiceWorkerSupported = false;

  constructor() {
    this.isServiceWorkerSupported = 'serviceWorker' in navigator;
    this.initializeDB();
    this.registerServiceWorker();
  }

  // Initialize IndexedDB for storing generation requests
  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ProLearningDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('pendingGenerations')) {
          const store = db.createObjectStore('pendingGenerations', { keyPath: 'id' });
          store.createIndex('userId', 'userId', { unique: false });
          store.createIndex('status', 'status', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('generationHistory')) {
          const historyStore = db.createObjectStore('generationHistory', { keyPath: 'id' });
          historyStore.createIndex('userId', 'userId', { unique: false });
          historyStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // Register service worker
  private async registerServiceWorker(): Promise<void> {
    if (!this.isServiceWorkerSupported) {
      console.warn('Service Worker not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);

      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }

      // Enable background sync if supported
      if ('sync' in window.ServiceWorkerRegistration.prototype) {
        console.log('Background Sync supported');
      }
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  // Queue a course generation request for background processing
  async queueGeneration(courseSpec: any, userId: string): Promise<string> {
    const requestId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const request: BackgroundGenerationRequest = {
      id: requestId,
      courseTitle: courseSpec.courseTitle || 'Untitled Course',
      courseSpec,
      userId,
      timestamp: Date.now(),
      status: 'pending'
    };

    // Store in IndexedDB
    await this.storePendingRequest(request);

    // If service worker is available, register for background sync
    if (this.isServiceWorkerSupported && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if ('sync' in registration) {
          await registration.sync.register('background-course-generation');
        }
      } catch (error) {
        console.error('Background sync registration failed:', error);
        // Fallback to immediate processing
        this.processGenerationImmediately(request);
      }
    } else {
      // Fallback to immediate processing
      this.processGenerationImmediately(request);
    }

    return requestId;
  }

  // Store pending request in IndexedDB
  private async storePendingRequest(request: BackgroundGenerationRequest): Promise<void> {
    if (!this.db) await this.initializeDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingGenerations'], 'readwrite');
      const store = transaction.objectStore('pendingGenerations');
      
      const addRequest = store.add(request);
      addRequest.onerror = () => reject(addRequest.error);
      addRequest.onsuccess = () => resolve();
    });
  }

  // Get pending requests for a user
  async getPendingRequests(userId: string): Promise<BackgroundGenerationRequest[]> {
    if (!this.db) await this.initializeDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingGenerations'], 'readonly');
      const store = transaction.objectStore('pendingGenerations');
      const index = store.index('userId');
      
      const request = index.getAll(userId);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  // Update request status
  async updateRequestStatus(requestId: string, status: BackgroundGenerationRequest['status']): Promise<void> {
    if (!this.db) await this.initializeDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingGenerations'], 'readwrite');
      const store = transaction.objectStore('pendingGenerations');
      
      const getRequest = store.get(requestId);
      getRequest.onsuccess = () => {
        const request = getRequest.result;
        if (request) {
          request.status = status;
          const updateRequest = store.put(request);
          updateRequest.onerror = () => reject(updateRequest.error);
          updateRequest.onsuccess = () => resolve();
        } else {
          reject(new Error('Request not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Process generation immediately (fallback)
  private async processGenerationImmediately(request: BackgroundGenerationRequest): Promise<void> {
    try {
      await this.updateRequestStatus(request.id, 'processing');

      // Import the streaming AI service
      const { streamingAIService } = await import('./ai-service-streaming');

      // Generate the course with robust error handling
      let course: any = null;
      let retryCount = 0;
      const maxRetries = 3;

      while (!course && retryCount < maxRetries) {
        try {
          course = await streamingAIService.generateCourseWithStreaming(
            request.courseSpec,
            (progress) => {
              // Store progress updates
              this.storeProgressUpdate(request.id, progress);

              // Send progress via push notification if supported
              this.sendProgressNotification(request, progress);
            }
          );
        } catch (generationError) {
          retryCount++;
          console.error(`Generation attempt ${retryCount} failed:`, generationError);

          if (retryCount >= maxRetries) {
            throw generationError;
          }

          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, 5000 * Math.pow(2, retryCount - 1)));
        }
      }

      await this.updateRequestStatus(request.id, 'completed');

      // Send success notification
      await this.sendNotification({
        title: 'Course Generated!',
        body: `Your course "${request.courseTitle}" has been generated successfully.`,
        data: { courseId: course?.id, requestId: request.id },
        actions: [
          { action: 'view', title: 'View Course' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      });

      // Move to history
      await this.moveToHistory(request, course);

    } catch (error) {
      console.error('Immediate generation failed:', error);
      await this.updateRequestStatus(request.id, 'failed');

      // Send failure notification
      await this.sendNotification({
        title: 'Generation Failed',
        body: `Failed to generate course "${request.courseTitle}". Please try again.`,
        data: { requestId: request.id, error: error.message },
        actions: [
          { action: 'retry', title: 'Retry' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      });
    }
  }

  // Store progress update
  private async storeProgressUpdate(requestId: string, progress: any): Promise<void> {
    // Store progress in localStorage for now (could be moved to IndexedDB)
    const key = `generation_progress_${requestId}`;
    localStorage.setItem(key, JSON.stringify({
      ...progress,
      timestamp: Date.now()
    }));
  }

  // Get progress for a request
  getProgress(requestId: string): any {
    const key = `generation_progress_${requestId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  }

  // Move completed request to history
  private async moveToHistory(request: BackgroundGenerationRequest, course: any): Promise<void> {
    if (!this.db) await this.initializeDB();
    
    const historyEntry = {
      ...request,
      course,
      completedAt: Date.now()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['generationHistory', 'pendingGenerations'], 'readwrite');
      const historyStore = transaction.objectStore('generationHistory');
      const pendingStore = transaction.objectStore('pendingGenerations');
      
      // Add to history
      const addRequest = historyStore.add(historyEntry);
      addRequest.onerror = () => reject(addRequest.error);
      
      // Remove from pending
      const deleteRequest = pendingStore.delete(request.id);
      deleteRequest.onerror = () => reject(deleteRequest.error);
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Check if background generation is supported
  isBackgroundGenerationSupported(): boolean {
    return this.isServiceWorkerSupported && 'sync' in window.ServiceWorkerRegistration.prototype;
  }

  // Get generation history
  async getGenerationHistory(userId: string): Promise<any[]> {
    if (!this.db) await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['generationHistory'], 'readonly');
      const store = transaction.objectStore('generationHistory');
      const index = store.index('userId');

      const request = index.getAll(userId);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  // Send notification (both browser and push)
  private async sendNotification(payload: any): Promise<void> {
    try {
      // Browser notification
      if (Notification.permission === 'granted') {
        new Notification(payload.title, {
          body: payload.body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          data: payload.data
        });
      }

      // Push notification via service worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration.active) {
          registration.active.postMessage({
            type: 'SHOW_NOTIFICATION',
            payload
          });
        }
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  // Send progress notification
  private async sendProgressNotification(request: BackgroundGenerationRequest, progress: any): Promise<void> {
    // Only send notifications for major milestones to avoid spam
    if (progress.step === 'curriculum' || progress.step === 'complete' || progress.step === 'error') {
      await this.sendNotification({
        title: 'Course Generation Progress',
        body: progress.message,
        data: { requestId: request.id, progress: progress.progress }
      });
    }
  }

  // Send notification (both browser and push)
  private async sendNotification(payload: any): Promise<void> {
    try {
      // Browser notification
      if (Notification.permission === 'granted') {
        new Notification(payload.title, {
          body: payload.body,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          data: payload.data
        });
      }

      // Push notification via service worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration.active) {
          registration.active.postMessage({
            type: 'SHOW_NOTIFICATION',
            payload
          });
        }
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  // Send progress notification
  private async sendProgressNotification(request: BackgroundGenerationRequest, progress: any): Promise<void> {
    // Only send notifications for major milestones to avoid spam
    if (progress.step === 'curriculum' || progress.step === 'complete' || progress.step === 'error') {
      await this.sendNotification({
        title: 'Course Generation Progress',
        body: progress.message,
        data: { requestId: request.id, progress: progress.progress }
      });
    }
  }

  // Cleanup old completed requests
  async cleanupOldRequests(olderThanDays: number = 7): Promise<void> {
    if (!this.db) await this.initializeDB();

    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['generationHistory'], 'readwrite');
      const store = transaction.objectStore('generationHistory');
      const index = store.index('timestamp');

      const request = index.openCursor(IDBKeyRange.upperBound(cutoffTime));
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const backgroundGenerationService = new BackgroundGenerationService();

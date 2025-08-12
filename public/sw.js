// Service Worker for ProLearning
// Handles background course generation and push notifications

const CACHE_NAME = 'prolearning-v1';
const urlsToCache = [
  '/',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Background sync for course generation
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-course-generation') {
    event.waitUntil(handleBackgroundGeneration());
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Course generation completed!',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Course',
        icon: '/images/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/images/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('ProLearning', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    // Open the course page
    event.waitUntil(
      clients.openWindow('/dashboard/courses')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open dashboard
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

// Background course generation handler
async function handleBackgroundGeneration() {
  try {
    // Get pending generation requests from IndexedDB
    const pendingRequests = await getPendingGenerationRequests();
    
    for (const request of pendingRequests) {
      try {
        await generateCourseInBackground(request);
        await removePendingRequest(request.id);
        
        // Send success notification
        await self.registration.showNotification('Course Generated!', {
          body: `Your course "${request.courseTitle}" has been generated successfully.`,
          icon: '/icon-192x192.png',
          tag: 'course-generation-success',
          data: { courseId: request.courseId }
        });
      } catch (error) {
        console.error('Background generation failed:', error);
        
        // Send error notification
        await self.registration.showNotification('Generation Failed', {
          body: `Failed to generate course "${request.courseTitle}". Please try again.`,
          icon: '/icon-192x192.png',
          tag: 'course-generation-error',
          data: { requestId: request.id }
        });
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Generate course in background
async function generateCourseInBackground(request) {
  const response = await fetch('/api/ai/generate-course-background', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error(`Generation failed: ${response.status}`);
  }

  return await response.json();
}

// IndexedDB helpers for storing pending requests
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ProLearningDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingGenerations')) {
        db.createObjectStore('pendingGenerations', { keyPath: 'id' });
      }
    };
  });
}

async function getPendingGenerationRequests() {
  const db = await openDB();
  const transaction = db.transaction(['pendingGenerations'], 'readonly');
  const store = transaction.objectStore('pendingGenerations');
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function removePendingRequest(id) {
  const db = await openDB();
  const transaction = db.transaction(['pendingGenerations'], 'readwrite');
  const store = transaction.objectStore('pendingGenerations');
  
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

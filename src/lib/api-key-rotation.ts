// API Key Rotation Service
// Manages multiple API keys to avoid rate limits

import { config } from './config';

interface KeyUsage {
  key: string;
  lastUsed: number;
  requestCount: number;
  isBlocked: boolean;
  blockUntil: number;
}

class APIKeyRotationService {
  private geminiKeyUsage: Map<string, KeyUsage> = new Map();
  private currentGeminiKeyIndex = 0;
  private readonly GEMINI_RATE_LIMIT = 11; // requests per minute
  private readonly RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
  private readonly BLOCK_DURATION = 60 * 1000; // Block key for 1 minute after hitting limit

  constructor() {
    this.initializeKeys();
  }

  private initializeKeys(): void {
    // Initialize Gemini keys
    config.ai.geminiKeys.forEach(key => {
      if (!this.geminiKeyUsage.has(key)) {
        this.geminiKeyUsage.set(key, {
          key,
          lastUsed: 0,
          requestCount: 0,
          isBlocked: false,
          blockUntil: 0
        });
      }
    });
  }

  // Get next available Gemini API key
  getNextGeminiKey(): string | null {
    const now = Date.now();
    const availableKeys = Array.from(this.geminiKeyUsage.values())
      .filter(usage => {
        // Unblock keys if block period has passed
        if (usage.isBlocked && now > usage.blockUntil) {
          usage.isBlocked = false;
          usage.requestCount = 0;
          usage.lastUsed = 0;
        }

        // Reset request count if rate limit window has passed
        if (now - usage.lastUsed > this.RATE_LIMIT_WINDOW) {
          usage.requestCount = 0;
        }

        return !usage.isBlocked && usage.requestCount < this.GEMINI_RATE_LIMIT;
      })
      .sort((a, b) => a.requestCount - b.requestCount); // Prefer keys with fewer requests

    if (availableKeys.length === 0) {
      console.warn('All Gemini API keys are rate limited or blocked');
      return null;
    }

    const selectedKey = availableKeys[0];
    this.recordKeyUsage(selectedKey.key, 'gemini');
    
    return selectedKey.key;
  }

  // Record API key usage
  private recordKeyUsage(key: string, provider: 'gemini'): void {
    const now = Date.now();
    
    if (provider === 'gemini') {
      const usage = this.geminiKeyUsage.get(key);
      if (usage) {
        usage.lastUsed = now;
        usage.requestCount++;

        // Block key if it hits the rate limit
        if (usage.requestCount >= this.GEMINI_RATE_LIMIT) {
          usage.isBlocked = true;
          usage.blockUntil = now + this.BLOCK_DURATION;
          console.log(`Gemini API key blocked until ${new Date(usage.blockUntil).toISOString()}`);
        }
      }
    }
  }

  // Mark a key as failed (e.g., due to quota exceeded)
  markKeyAsFailed(key: string, provider: 'gemini', blockDuration: number = this.BLOCK_DURATION): void {
    const now = Date.now();
    
    if (provider === 'gemini') {
      const usage = this.geminiKeyUsage.get(key);
      if (usage) {
        usage.isBlocked = true;
        usage.blockUntil = now + blockDuration;
        usage.requestCount = this.GEMINI_RATE_LIMIT; // Mark as at limit
        console.log(`Gemini API key marked as failed and blocked until ${new Date(usage.blockUntil).toISOString()}`);
      }
    }
  }

  // Get key usage statistics
  getKeyStats(): { gemini: KeyUsage[] } {
    return {
      gemini: Array.from(this.geminiKeyUsage.values())
    };
  }

  // Reset all key usage (for testing or manual reset)
  resetAllKeys(): void {
    this.geminiKeyUsage.forEach(usage => {
      usage.requestCount = 0;
      usage.lastUsed = 0;
      usage.isBlocked = false;
      usage.blockUntil = 0;
    });
  }

  // Get estimated wait time until next key is available
  getEstimatedWaitTime(): number {
    const now = Date.now();
    const blockedKeys = Array.from(this.geminiKeyUsage.values())
      .filter(usage => usage.isBlocked);

    if (blockedKeys.length === 0) {
      return 0;
    }

    const nextAvailableTime = Math.min(...blockedKeys.map(usage => usage.blockUntil));
    return Math.max(0, nextAvailableTime - now);
  }

  // Check if any keys are available
  hasAvailableKeys(): boolean {
    const now = Date.now();
    return Array.from(this.geminiKeyUsage.values()).some(usage => {
      // Check if key is available
      if (usage.isBlocked && now <= usage.blockUntil) {
        return false;
      }

      // Reset if window passed
      if (now - usage.lastUsed > this.RATE_LIMIT_WINDOW) {
        return true;
      }

      return usage.requestCount < this.GEMINI_RATE_LIMIT;
    });
  }

  // Batch requests to optimize key usage
  async batchRequests<T>(
    requests: (() => Promise<T>)[],
    batchSize: number = 5
  ): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      
      // Wait if no keys are available
      while (!this.hasAvailableKeys()) {
        const waitTime = this.getEstimatedWaitTime();
        console.log(`Waiting ${waitTime}ms for API keys to become available...`);
        await new Promise(resolve => setTimeout(resolve, Math.min(waitTime, 30000))); // Max 30s wait
      }

      // Execute batch with delay between requests
      const batchResults = await Promise.all(
        batch.map(async (request, index) => {
          // Add delay between requests in the same batch
          if (index > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
          }
          return request();
        })
      );

      results.push(...batchResults);
    }

    return results;
  }
}

export const apiKeyRotationService = new APIKeyRotationService();

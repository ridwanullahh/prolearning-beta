
import { db } from './github-sdk';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'learner' | 'instructor' | 'super_admin';
  avatar?: string;
  country?: string;
  currency?: string;
}

class AuthService {
  private currentUser: AuthUser | null = null;
  private currentToken: string | null = null;

  async login(email: string, password: string): Promise<AuthUser> {
    try {
      console.log('[AUTH DEBUG] Starting login process for:', email);
      
      const token = await db.login(email, password);
      console.log('[AUTH DEBUG] Login token received:', typeof token);
      
      if (typeof token !== 'string') {
        console.log('[AUTH DEBUG] OTP required, not supported');
        throw new Error('OTP not supported in this implementation');
      }

      console.log('[AUTH DEBUG] Getting current user with token');
      const user = db.getCurrentUser(token);
      console.log('[AUTH DEBUG] Current user retrieved:', user ? 'success' : 'failed');
      
      if (!user) {
        console.log('[AUTH DEBUG] Failed to get user data');
        throw new Error('Failed to get user data');
      }

      if (!user.isActive) {
        console.log('[AUTH DEBUG] Account is deactivated');
        throw new Error('Account is deactivated');
      }

      console.log('[AUTH DEBUG] Creating auth user object');
      this.currentUser = {
        id: user.id || user.uid,
        email: user.email,
        name: user.name,
        role: user.role as 'learner' | 'instructor' | 'super_admin',
        avatar: user.avatar,
        country: user.country,
        currency: user.currency
      };

      this.currentToken = token;

      // Store in localStorage for persistence
      localStorage.setItem('auth_user', JSON.stringify(this.currentUser));
      localStorage.setItem('auth_token', token);
      
      console.log('[AUTH DEBUG] Login successful for user:', this.currentUser.id);
      return this.currentUser;
    } catch (error: any) {
      console.error('[AUTH DEBUG] Login error:', error.message);
      throw new Error(error.message || 'Login failed');
    }
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
    role: 'learner' | 'instructor';
    country?: string;
  }): Promise<AuthUser> {
    try {
      console.log('[AUTH DEBUG] Starting registration for:', userData.email);
      
      const currency = this.getCurrencyByCountry(userData.country);
      console.log('[AUTH DEBUG] Determined currency:', currency);
      
      const user = await db.register(userData.email, userData.password, {
        name: userData.name,
        role: userData.role,
        country: userData.country,
        currency: currency,
        isActive: true,
        profileComplete: false
      });

      console.log('[AUTH DEBUG] User registered with ID:', user.id);

      // Create user profile
      await db.insert('userProfiles', {
        userId: user.id,
        preferences: JSON.stringify({
          theme: 'light',
          language: 'en',
          notifications: true
        })
      });

      // Create wallet
      await db.insert('wallets', {
        userId: user.id,
        balance: 0,
        currency: currency || 'USD'
      });

      // Initialize AI generation usage for current month
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      await db.insert('aiGenerationUsage', {
        userId: user.id,
        month: currentMonth,
        freeGenerationsUsed: 0,
        paidGenerationsUsed: 0,
        subscriptionActive: false
      });

      // Create session
      const token = db.createSession(user);
      this.currentToken = token;

      this.currentUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        country: user.country,
        currency: user.currency
      };

      localStorage.setItem('auth_user', JSON.stringify(this.currentUser));
      localStorage.setItem('auth_token', token);
      
      console.log('[AUTH DEBUG] Registration successful for user:', this.currentUser.id);
      return this.currentUser;
    } catch (error: any) {
      console.error('[AUTH DEBUG] Registration error:', error.message);
      throw new Error(error.message || 'Registration failed');
    }
  }

  async logout(): Promise<void> {
    console.log('[AUTH DEBUG] Logging out user');
    if (this.currentToken) {
      db.destroySession(this.currentToken);
    }
    this.currentUser = null;
    this.currentToken = null;
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    console.log('[AUTH DEBUG] Logout complete');
  }

  getCurrentUser(): AuthUser | null {
    if (this.currentUser) {
      return this.currentUser;
    }

    // Try to restore from localStorage
    const stored = localStorage.getItem('auth_user');
    const token = localStorage.getItem('auth_token');
    
    if (stored && token) {
      try {
        const session = db.getSession(token);
        if (session) {
          this.currentUser = JSON.parse(stored);
          this.currentToken = token;
          console.log('[AUTH DEBUG] Restored user from localStorage:', this.currentUser.id);
          return this.currentUser;
        }
      } catch {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
        console.log('[AUTH DEBUG] Invalid stored session, cleared localStorage');
      }
    }

    return null;
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  getCurrentToken(): string | null {
    return this.currentToken || localStorage.getItem('auth_token');
  }

  private getCurrencyByCountry(country?: string): string {
    const currencyMap: Record<string, string> = {
      'Nigeria': 'NGN',
      'United States': 'USD',
      'United Kingdom': 'GBP',
      'Canada': 'CAD',
      'Australia': 'AUD',
      'Germany': 'EUR',
      'France': 'EUR',
      'India': 'INR',
      'South Africa': 'ZAR',
      'Kenya': 'KES',
      'Ghana': 'GHS'
    };

    return currencyMap[country || ''] || 'USD';
  }
}

export const authService = new AuthService();

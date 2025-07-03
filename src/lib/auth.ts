
import { db, User, UserProfile } from './database';
import bcrypt from 'bcryptjs';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: 'learner' | 'instructor' | 'super_admin';
  avatar?: string;
  country?: string;
  currency?: string;
}

class AuthService {
  private currentUser: AuthUser | null = null;

  async login(email: string, password: string): Promise<AuthUser> {
    const user = await db.users.where('email').equals(email).first();
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    this.currentUser = {
      id: user.id!,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      country: user.country,
      currency: user.currency
    };

    // Store in localStorage for persistence
    localStorage.setItem('auth_user', JSON.stringify(this.currentUser));
    
    return this.currentUser;
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
    role: 'learner' | 'instructor';
    country?: string;
  }): Promise<AuthUser> {
    // Check if user already exists
    const existingUser = await db.users.where('email').equals(userData.email).first();
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(userData.password, 10);

    // Create user
    const userId = await db.users.add({
      email: userData.email,
      passwordHash,
      name: userData.name,
      role: userData.role,
      country: userData.country,
      currency: this.getCurrencyByCountry(userData.country),
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      profileComplete: false
    });

    // Create user profile
    await db.userProfiles.add({
      userId: userId as number,
      preferences: JSON.stringify({
        theme: 'light',
        language: 'en',
        notifications: true
      })
    });

    // Create wallet
    await db.wallets.add({
      userId: userId as number,
      balance: 0,
      currency: this.getCurrencyByCountry(userData.country) || 'USD',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Initialize AI generation usage for current month
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    await db.aiGenerationUsage.add({
      userId: userId as number,
      month: currentMonth,
      freeGenerationsUsed: 0,
      paidGenerationsUsed: 0,
      subscriptionActive: false
    });

    const newUser = await db.users.get(userId as number);
    if (!newUser) {
      throw new Error('Failed to create user');
    }

    this.currentUser = {
      id: newUser.id!,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      avatar: newUser.avatar,
      country: newUser.country,
      currency: newUser.currency
    };

    localStorage.setItem('auth_user', JSON.stringify(this.currentUser));
    
    return this.currentUser;
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    localStorage.removeItem('auth_user');
  }

  getCurrentUser(): AuthUser | null {
    if (this.currentUser) {
      return this.currentUser;
    }

    // Try to restore from localStorage
    const stored = localStorage.getItem('auth_user');
    if (stored) {
      try {
        this.currentUser = JSON.parse(stored);
        return this.currentUser;
      } catch {
        localStorage.removeItem('auth_user');
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

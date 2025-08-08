
import { db } from './github-sdk';
import { emailService } from './email-service';
import { v4 as uuidv4 } from 'uuid';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'learner' | 'instructor' | 'super_admin';
  avatar?: string;
  country?: string;
  currency?: string;
  onboardingCompleted?: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  profile?: any;
  instructorProfile?: any;
  createdAt?: string;
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
        currency: user.currency,
        onboardingCompleted: user.onboardingCompleted,
        approvalStatus: user.approvalStatus,
        profile: user.profile,
        instructorProfile: user.instructorProfile,
        createdAt: user.createdAt
      };

      this.currentToken = token;

      localStorage.setItem('prolearning-token', token);
      localStorage.setItem('prolearning-user', JSON.stringify(this.currentUser));

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
        profileComplete: false,
        onboardingCompleted: false
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
        currency: user.currency,
        onboardingCompleted: user.onboardingCompleted,
        approvalStatus: user.approvalStatus,
        profile: user.profile,
        instructorProfile: user.instructorProfile,
        createdAt: user.createdAt
      };

      console.log('[AUTH DEBUG] Registration successful for user:', this.currentUser.id);
      return this.currentUser;
    } catch (error: any) {
      console.error('[AUTH DEBUG] Registration error:', error.message);
      throw new Error(error.message || 'Registration failed');
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const users = await db.get('users');
    const user = users.find((u: any) => u.email === email);

    if (user) {
      const token = uuidv4();
      const expires = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now

      await db.update('users', user.id, {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      });

      await emailService.sendPasswordResetEmail(email, token);
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const users = await db.get('users');
    const user = users.find((u: any) => u.resetPasswordToken === token && new Date(u.resetPasswordExpires) > new Date());

    if (!user) {
      throw new Error('Password reset token is invalid or has expired.');
    }

    const hashedPassword = await db.hashPassword(password);
    await db.update('users', user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });
  }

  async handleGoogleCallback(code: string): Promise<AuthUser> {
    // This is a placeholder. The actual implementation will depend on
    // how you exchange the code for an access token and user profile.
    console.log('Handling Google callback with code:', code);

    // 1. Exchange authorization code for access token
    // 2. Get user profile from Google
    // 3. Check if user exists in your DB
    // 4. If not, create a new user
    // 5. Create a session for the user
    // 6. Return the AuthUser

    // Placeholder implementation
    const userProfile = {
      id: 'google-user-id',
      email: 'googleuser@example.com',
      name: 'Google User',
      role: 'learner' as const,
    };

    let user = (await db.get('users')).find((u: any) => u.email === userProfile.email);
    if (!user) {
      user = await db.register(userProfile.email, '', {
        name: userProfile.name,
        role: userProfile.role,
        googleId: userProfile.id,
        onboardingCompleted: false,
        isActive: true,
        profileComplete: false
      });
    }

    const token = db.createSession(user);
    this.currentToken = token;
    this.currentUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      onboardingCompleted: user.onboardingCompleted || false,
    };

    localStorage.setItem('prolearning-token', token);
    localStorage.setItem('prolearning-user', JSON.stringify(this.currentUser));

    return this.currentUser;
  }

  async logout(): Promise<void> {
    console.log('[AUTH DEBUG] Logging out user');
    if (this.currentToken) {
      db.destroySession(this.currentToken);
    }
    this.currentUser = null;
    this.currentToken = null;
    localStorage.removeItem('prolearning-token');
    localStorage.removeItem('prolearning-user');
    console.log('[AUTH DEBUG] Logout complete');
  }

  getCurrentUser(): AuthUser | null {
    if (this.currentUser) {
      return this.currentUser;
    }

    const token = localStorage.getItem('prolearning-token');
    const user = localStorage.getItem('prolearning-user');

    if (token && user) {
      this.currentToken = token;
      this.currentUser = JSON.parse(user);
      return this.currentUser;
    }

    return null;
  }

  updateCurrentUser(updatedUser: AuthUser): void {
    this.currentUser = updatedUser;
    localStorage.setItem('prolearning-user', JSON.stringify(this.currentUser));
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  getCurrentToken(): string | null {
    return this.currentToken;
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

import { config, CURRENCY_RATES } from './config';
import { db } from './github-sdk';

export interface PaymentRequest {
  amount: number;
  currency: string;
  email: string;
  userId: string;
  courseId?: string;
  type: 'course_purchase' | 'subscription' | 'ai_generation' | 'wallet_funding';
  description: string;
}

export interface PaymentResponse {
  success: boolean;
  reference: string;
  authorization_url?: string;
  access_code?: string;
  message?: string;
}

class PaymentService {
  private paystackBaseUrl = 'https://api.paystack.co';

  async initializePayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Convert amount to user's local currency
      const convertedAmount = this.convertCurrency(paymentRequest.amount, 'USD', paymentRequest.currency);
      const amountInKobo = Math.round(convertedAmount * 100); // Paystack expects amount in kobo/cents

      const response = await fetch(`${this.paystackBaseUrl}/transaction/initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.payment.paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountInKobo,
          email: paymentRequest.email,
          currency: paymentRequest.currency,
          reference: this.generateReference(),
          callback_url: `${config.app.url}/payment/callback`,
          metadata: {
            userId: paymentRequest.userId,
            courseId: paymentRequest.courseId,
            type: paymentRequest.type,
            originalAmount: paymentRequest.amount,
            originalCurrency: 'USD'
          }
        })
      });

      const data = await response.json();

      if (data.status) {
        // Store transaction record
        await this.createTransactionRecord({
          ...paymentRequest,
          amount: convertedAmount,
          referenceId: data.data.reference,
          status: 'pending'
        });

        return {
          success: true,
          reference: data.data.reference,
          authorization_url: data.data.authorization_url,
          access_code: data.data.access_code
        };
      } else {
        throw new Error(data.message || 'Payment initialization failed');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      throw error;
    }
  }

  async verifyPayment(reference: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.paystackBaseUrl}/transaction/verify/${reference}`, {
        headers: {
          'Authorization': `Bearer ${config.payment.paystackSecretKey}`,
        }
      });

      const data = await response.json();

      if (data.status && data.data.status === 'success') {
        // Update transaction status
        await this.updateTransactionStatus(reference, 'completed');
        
        // Process the successful payment
        await this.processSuccessfulPayment(data.data);
        
        return true;
      } else {
        await this.updateTransactionStatus(reference, 'failed');
        return false;
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      await this.updateTransactionStatus(reference, 'failed');
      return false;
    }
  }

  private async processSuccessfulPayment(paymentData: any): Promise<void> {
    const { metadata } = paymentData;
    
    switch (metadata.type) {
      case 'course_purchase':
        await this.enrollUserInCourse(metadata.userId, metadata.courseId);
        await this.processInstructorEarning(metadata.courseId, paymentData.amount / 100);
        break;
      case 'subscription':
        await this.activateSubscription(metadata.userId);
        break;
      case 'ai_generation':
        await this.addAIGenerationCredits(metadata.userId);
        break;
      case 'wallet_funding':
        await this.addToWallet(metadata.userId, paymentData.amount / 100, paymentData.currency);
        break;
    }

    // Update user wallet
    await this.updateUserWallet(metadata.userId, paymentData);
  }

  private async addToWallet(userId: string, amount: number, currency: string): Promise<void> {
    try {
      let wallets = await db.queryBuilder('wallets')
        .where(item => item.userId === userId)
        .exec();

      if (wallets.length === 0) {
        // Create wallet if it doesn't exist
        await db.insert('wallets', {
          userId,
          balance: amount,
          currency,
          totalEarnings: 0,
          totalWithdrawals: 0,
          pendingBalance: 0
        });
      } else {
        // Update existing wallet balance
        const wallet = wallets[0];
        await db.update('wallets', wallet.id, {
          balance: (wallet.balance || 0) + amount,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error adding to wallet:', error);
    }
  }

  private async processInstructorEarning(courseId: string, amount: number): Promise<void> {
    try {
      const course = await db.getItem('courses', courseId);
      if (!course) return;

      const commissionRate = 15; // Platform commission
      const instructorShare = amount * (100 - commissionRate) / 100;

      // Record earning
      await db.insert('earnings', {
        instructorId: course.creatorId,
        courseId,
        amount: instructorShare,
        currency: course.currency || 'USD',
        type: 'course_sale',
        commissionRate,
        netAmount: instructorShare
      });

      // Update instructor wallet
      let wallets = await db.queryBuilder('wallets')
        .where(item => item.userId === course.creatorId)
        .exec();

      if (wallets.length === 0) {
        await db.insert('wallets', {
          userId: course.creatorId,
          balance: instructorShare,
          currency: course.currency || 'USD',
          totalEarnings: instructorShare,
          totalWithdrawals: 0,
          pendingBalance: 0
        });
      } else {
        const wallet = wallets[0];
        await db.update('wallets', wallet.id, {
          balance: (wallet.balance || 0) + instructorShare,
          totalEarnings: (wallet.totalEarnings || 0) + instructorShare,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error processing instructor earning:', error);
    }
  }

  private async enrollUserInCourse(userId: string, courseId: string): Promise<void> {
    try {
      await db.insert('enrollments', {
        userId,
        courseId,
        enrolledAt: new Date().toISOString(),
        status: 'active',
        paymentStatus: 'paid'
      });

      // Update course enrollment count
      const course = await db.getItem('courses', courseId);
      if (course) {
        await db.update('courses', courseId, {
          enrollmentCount: (course.enrollmentCount || 0) + 1
        });
      }
    } catch (error) {
      console.error('Error enrolling user in course:', error);
    }
  }

  private async activateSubscription(userId: string): Promise<void> {
    try {
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);

      await db.update('users', userId, {
        subscription: 'pro',
        subscriptionExpiry: expiryDate.toISOString()
      });

      // Update AI generation usage
      const currentMonth = new Date().toISOString().slice(0, 7);
      const usage = await db.queryBuilder('aiGenerationUsage')
        .where(item => item.userId === userId && item.month === currentMonth)
        .exec();

      if (usage.length > 0) {
        await db.update('aiGenerationUsage', usage[0].id, {
          subscriptionActive: true
        });
      } else {
        await db.insert('aiGenerationUsage', {
          userId,
          month: currentMonth,
          freeGenerationsUsed: 0,
          paidGenerationsUsed: 0,
          subscriptionActive: true
        });
      }
    } catch (error) {
      console.error('Error activating subscription:', error);
    }
  }

  private async addAIGenerationCredits(userId: string): Promise<void> {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const usage = await db.queryBuilder('aiGenerationUsage')
        .where(item => item.userId === userId && item.month === currentMonth)
        .exec();

      if (usage.length > 0) {
        await db.update('aiGenerationUsage', usage[0].id, {
          paidGenerationsUsed: (usage[0].paidGenerationsUsed || 0) + 1
        });
      } else {
        await db.insert('aiGenerationUsage', {
          userId,
          month: currentMonth,
          freeGenerationsUsed: 0,
          paidGenerationsUsed: 1,
          subscriptionActive: false
        });
      }
    } catch (error) {
      console.error('Error adding AI generation credits:', error);
    }
  }

  private async updateUserWallet(userId: string, paymentData: any): Promise<void> {
    try {
      let wallet = await db.queryBuilder('wallets')
        .where(item => item.userId === userId)
        .exec();

      if (wallet.length === 0) {
        // Create wallet if it doesn't exist
        await db.insert('wallets', {
          userId,
          balance: 0,
          currency: paymentData.currency,
          totalEarnings: 0,
          totalWithdrawals: 0,
          pendingBalance: 0
        });
      }
    } catch (error) {
      console.error('Error updating user wallet:', error);
    }
  }

  private async createTransactionRecord(transaction: any): Promise<void> {
    try {
      await db.insert('transactions', {
        userId: transaction.userId,
        amount: transaction.amount,
        currency: transaction.currency,
        type: 'credit',
        category: transaction.type,
        description: transaction.description,
        referenceId: transaction.referenceId,
        status: transaction.status,
        paymentMethod: 'paystack'
      });
    } catch (error) {
      console.error('Error creating transaction record:', error);
    }
  }

  private async updateTransactionStatus(reference: string, status: string): Promise<void> {
    try {
      const transactions = await db.queryBuilder('transactions')
        .where(item => item.referenceId === reference)
        .exec();

      if (transactions.length > 0) {
        await db.update('transactions', transactions[0].id, { status });
      }
    } catch (error) {
      console.error('Error updating transaction status:', error);
    }
  }

  convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === toCurrency) return amount;
    
    const usdAmount = fromCurrency === 'USD' ? amount : amount / CURRENCY_RATES[fromCurrency];
    return toCurrency === 'USD' ? usdAmount : usdAmount * CURRENCY_RATES[toCurrency];
  }

  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  private generateReference(): string {
    return `PL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getTransactionHistory(userId: string): Promise<any[]> {
    try {
      return await db.queryBuilder('transactions')
        .where(item => item.userId === userId)
        .orderBy('createdAt', 'desc')
        .exec();
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }

  async getUserWallet(userId: string): Promise<any> {
    try {
      const wallets = await db.queryBuilder('wallets')
        .where(item => item.userId === userId)
        .exec();
      
      return wallets.length > 0 ? wallets[0] : null;
    } catch (error) {
      console.error('Error fetching user wallet:', error);
      return null;
    }
  }
}

export const paymentService = new PaymentService();
export default paymentService;

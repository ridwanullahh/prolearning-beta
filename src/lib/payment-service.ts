import { config, CURRENCY_RATES } from './config';
import { db } from './github-sdk';
import crypto from 'crypto';

export interface PaymentRequest {
    amount: number;
    currency: string;
    email: string;
    userId: string;
    items: { courseId: string; price: number; quantity: number }[];
    type: 'cart_checkout' | 'wallet_funding';
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
            const totalAmount = paymentRequest.type === 'cart_checkout'
                ? paymentRequest.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
                : paymentRequest.amount;
            const convertedAmount = this.convertCurrency(totalAmount, 'USD', paymentRequest.currency);
            const amountInKobo = Math.round(convertedAmount * 100);

            const reference = this.generateReference();
            const order = await db.insert('orders', {
                userId: paymentRequest.userId,
                items: paymentRequest.items,
                total: convertedAmount,
                status: 'pending',
                paymentGateway: 'paystack',
                transactionId: reference,
            });

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
                    reference: reference,
                    callback_url: `${config.app.url}/payment/callback`,
                    metadata: {
                        orderId: order.id,
                        userId: paymentRequest.userId,
                        type: paymentRequest.type,
                    }
                })
            });

            const data = await response.json();

            if (data.status) {
                return {
                    success: true,
                    reference: data.data.reference,
                    authorization_url: data.data.authorization_url,
                    access_code: data.data.access_code
                };
            } else {
                await db.update('orders', order.id, { status: 'failed' });
                throw new Error(data.message || 'Payment initialization failed');
            }
        } catch (error) {
            console.error('Payment initialization error:', error);
            throw error;
        }
    }

    async handlePaystackWebhook(payload: any, signature: string): Promise<void> {
        const hash = crypto.createHmac('sha512', config.payment.paystackSecretKey).update(JSON.stringify(payload)).digest('hex');
        if (hash !== signature) {
            throw new Error('Invalid webhook signature');
        }

        const { event, data } = payload;
        const reference = data.reference;

        const transaction = await db.queryBuilder('transactions').where(tx => tx.gatewayTransactionId === reference).first();
        if (transaction) {
            console.log(`Transaction ${reference} already processed.`);
            return;
        }

        if (event === 'charge.success') {
            await this.processSuccessfulPayment(data);
        } else {
            await this.updateOrderStatusByTx(reference, 'failed');
        }
    }

    async verifyPayment(reference: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.paystackBaseUrl}/transaction/verify/${reference}`, {
                headers: { 'Authorization': `Bearer ${config.payment.paystackSecretKey}` }
            });
            const data = await response.json();

            if (data.status && data.data.status === 'success') {
                const transaction = await db.queryBuilder('transactions').where(tx => tx.gatewayTransactionId === reference).first();
                if (!transaction) {
                    await this.processSuccessfulPayment(data.data);
                }
                return true;
            } else {
                await this.updateOrderStatusByTx(reference, 'failed');
                return false;
            }
        } catch (error) {
            console.error('Payment verification error:', error);
            await this.updateOrderStatusByTx(reference, 'failed');
            return false;
        }
    }

    private async processSuccessfulPayment(paymentData: any): Promise<void> {
        const { reference, metadata, amount, currency } = paymentData;
        const { orderId, userId, type } = metadata;

        const order = await db.getItem('orders', orderId);
        if (!order || order.status === 'completed') {
            console.log(`Order ${orderId} not found or already completed.`);
            return;
        }

        await db.update('orders', orderId, { status: 'completed' });

        const newTransaction = await db.insert('transactions', {
            userId,
            orderId,
            amount: amount / 100,
            currency,
            status: 'completed',
            gateway: 'paystack',
            gatewayTransactionId: reference,
        });

        if (type === 'cart_checkout') {
            for (const item of order.items) {
                await this.enrollUserInCourse(userId, item.courseId);
                await this.processInstructorEarning(item.courseId, item.price * item.quantity, newTransaction.id);
            }
            await this.clearUserCart(userId);
        } else if (type === 'wallet_funding') {
            await this.fundWallet(userId, amount / 100, currency, newTransaction.id);
        }
    }

    private async fundWallet(userId: string, amount: number, currency: string, transactionId: string): Promise<void> {
        const wallet = await this.getUserWallet(userId) || await this.createUserWallet(userId, currency);
        await db.update('wallets', wallet.id, { balance: (wallet.balance || 0) + amount });
        await db.insert('walletTransactions', {
            walletId: wallet.id,
            type: 'credit',
            amount,
            description: 'Wallet funding',
            relatedEntityId: transactionId,
            relatedEntityType: 'transaction'
        });
    }

    private async processInstructorEarning(courseId: string, saleAmount: number, transactionId: string): Promise<void> {
        const course = await db.getItem('courses', courseId);
        if (!course) return;

        const instructorId = course.instructorId;
        const commissionRate = config.payment.platformCommission;
        const instructorShare = saleAmount * (100 - commissionRate) / 100;
        const platformShare = saleAmount - instructorShare;

        const instructorWallet = await this.getUserWallet(instructorId) || await this.createUserWallet(instructorId, 'USD');
        await db.update('wallets', instructorWallet.id, { balance: (instructorWallet.balance || 0) + instructorShare });

        await db.insert('walletTransactions', {
            walletId: instructorWallet.id,
            type: 'credit',
            amount: instructorShare,
            description: `Earning from course: ${course.title}`,
            relatedEntityId: transactionId,
            relatedEntityType: 'transaction'
        });

        const adminWallet = await this.getUserWallet(config.app.adminUserId) || await this.createUserWallet(config.app.adminUserId, 'USD');
        await db.update('wallets', adminWallet.id, { balance: (adminWallet.balance || 0) + platformShare });

        await db.insert('walletTransactions', {
            walletId: adminWallet.id,
            type: 'credit',
            amount: platformShare,
            description: `Commission from course: ${course.title}`,
            relatedEntityId: transactionId,
            relatedEntityType: 'transaction'
        });
    }

    private async enrollUserInCourse(userId: string, courseId: string): Promise<void> {
        await db.insert('enrollments', { userId, courseId, progress: 0, completed: false });
    }

    private async clearUserCart(userId: string): Promise<void> {
        const cart = await db.queryBuilder('cart').where(c => c.userId === userId).first();
        if (cart) {
            await db.update('cart', cart.id, { items: [] });
        }
    }

    async processWalletPayment(userId: string, orderId: string): Promise<void> {
        const order = await db.getItem('orders', orderId);
        if (!order) throw new Error('Order not found.');

        const wallet = await this.getUserWallet(userId);
        if (!wallet || wallet.balance < order.total) {
            throw new Error('Insufficient wallet balance.');
        }

        await db.update('wallets', wallet.id, { balance: wallet.balance - order.total });

        const walletTx = await db.insert('walletTransactions', {
            walletId: wallet.id,
            type: 'debit',
            amount: order.total,
            description: `Payment for order ${orderId}`,
            relatedEntityId: orderId,
            relatedEntityType: 'order'
        });

        await db.update('orders', orderId, { status: 'completed' });

        for (const item of order.items) {
            await this.enrollUserInCourse(userId, item.courseId);
            await this.processInstructorEarning(item.courseId, item.price * item.quantity, walletTx.id);
        }
        await this.clearUserCart(userId);
    }

    async requestWithdrawal(userId: string, amount: number, method: string, details: object): Promise<void> {
        const wallet = await this.getUserWallet(userId);
        if (!wallet || wallet.balance < amount) {
            throw new Error('Insufficient funds for withdrawal.');
        }

        await db.update('wallets', wallet.id, { balance: wallet.balance - amount });
        await db.insert('withdrawals', {
            userId,
            amount,
            status: 'pending',
            method,
            details,
        });
    }

    async processWithdrawal(withdrawalId: string, approved: boolean): Promise<void> {
        const withdrawal = await db.getItem('withdrawals', withdrawalId);
        if (!withdrawal) throw new Error('Withdrawal not found.');

        if (approved) {
            // Here you would integrate with a payment provider to send money
            // For now, we just mark it as approved
            await db.update('withdrawals', withdrawalId, { status: 'approved' });
        } else {
            // Refund the user's wallet
            const wallet = await this.getUserWallet(withdrawal.userId);
            await db.update('wallets', wallet.id, { balance: wallet.balance + withdrawal.amount });
            await db.update('withdrawals', withdrawalId, { status: 'rejected' });
        }
    }

    private async updateOrderStatusByTx(reference: string, status: string): Promise<void> {
        const order = await db.queryBuilder('orders').where(o => o.transactionId === reference).first();
        if (order) {
            await db.update('orders', order.id, { status });
        }
    }

    private async createUserWallet(userId: string, currency: string): Promise<any> {
        return db.insert('wallets', { userId, balance: 0, currency });
    }

    convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
        if (fromCurrency === toCurrency) return amount;
        const usdAmount = fromCurrency === 'USD' ? amount : amount / (CURRENCY_RATES[fromCurrency] || 1);
        return toCurrency === 'USD' ? usdAmount : usdAmount * (CURRENCY_RATES[toCurrency] || 1);
    }

    formatCurrency(amount: number, currency: string): string {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    }

    private generateReference(): string {
        return `PL_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
    }

    async getTransactionHistory(userId: string): Promise<any[]> {
        return db.queryBuilder('transactions').where(t => t.userId === userId).orderBy('createdAt', 'desc').exec();
    }

    async getUserWallet(userId: string): Promise<any> {
        return db.queryBuilder('wallets').where(w => w.userId === userId).first();
    }
}

export const paymentService = new PaymentService();
export default paymentService;

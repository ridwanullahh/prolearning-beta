
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, CheckCircle } from 'lucide-react';
import { authService } from '@/lib/auth';
import { paymentService } from '@/lib/payment-service';
import { db } from '@/lib/github-sdk';
import { toast } from 'sonner';

interface Wallet {
    id: string;
    balance: number;
    currency: string;
}

interface Earning {
    id: string;
    amount: number;
    description: string;
    createdAt: string;
}

interface Withdrawal {
    id: string;
    amount: number;
    status: string;
    details: object;
    createdAt: string;
}

const EarningsWithdrawals = () => {
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [earnings, setEarnings] = useState<Earning[]>([]);
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [withdrawalAmount, setWithdrawalAmount] = useState('');
    const [bankDetails, setBankDetails] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const user = authService.getCurrentUser();

    const loadData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const userWallet = await paymentService.getUserWallet(user.id);
            setWallet(userWallet);

            if (userWallet) {
                const earningsData = await db.queryBuilder('walletTransactions')
                    .where(tx => tx.walletId === userWallet.id && tx.type === 'credit' && tx.description.includes('Earning'))
                    .orderBy('createdAt', 'desc').exec();
                setEarnings(earningsData);

                const withdrawalsData = await db.queryBuilder('withdrawals')
                    .where(w => w.userId === user.id)
                    .orderBy('createdAt', 'desc').exec();
                setWithdrawals(withdrawalsData);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Failed to load earnings and withdrawals data.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleWithdrawalRequest = async () => {
        const amount = parseFloat(withdrawalAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error('Please enter a valid amount.');
            return;
        }
        if (!wallet || amount > wallet.balance) {
            toast.error('Insufficient balance for this withdrawal.');
            return;
        }
        if (!bankDetails.trim()) {
            toast.error('Please provide your bank details for withdrawal.');
            return;
        }

        setIsSubmitting(true);
        try {
            await paymentService.requestWithdrawal(user!.id, amount, 'bank_transfer', { bankDetails });
            toast.success('Withdrawal request submitted successfully.');
            setWithdrawalAmount('');
            setBankDetails('');
            loadData(); // Refresh all data
        } catch (error: any) {
            console.error('Withdrawal request failed:', error);
            toast.error(error.message || 'Failed to submit withdrawal request.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'approved': return 'default';
            case 'pending': return 'default';
            case 'rejected': return 'destructive';
            default: return 'secondary';
        }
    };

    const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
    const totalWithdrawn = withdrawals.filter(w => w.status === 'approved').reduce((sum, w) => sum + w.amount, 0);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader><CardTitle>Available Balance</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold">{formatCurrency(wallet?.balance || 0, wallet?.currency || 'USD')}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Total Earnings</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold">{formatCurrency(totalEarnings, wallet?.currency || 'USD')}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Total Withdrawn</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold">{formatCurrency(totalWithdrawn, wallet?.currency || 'USD')}</p></CardContent>
                </Card>
            </div>

            <Tabs defaultValue="withdraw" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="withdraw">Request Withdrawal</TabsTrigger>
                    <TabsTrigger value="earnings">Earnings History</TabsTrigger>
                    <TabsTrigger value="withdrawals">Withdrawal History</TabsTrigger>
                </TabsList>

                <TabsContent value="withdraw">
                    <Card>
                        <CardHeader>
                            <CardTitle>Request a Withdrawal</CardTitle>
                            <CardDescription>Withdraw funds to your designated bank account.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="withdrawal-amount">Amount</Label>
                                <Input id="withdrawal-amount" type="number" value={withdrawalAmount} onChange={e => setWithdrawalAmount(e.target.value)} />
                            </div>
                            <div>
                                <Label htmlFor="bank-details">Bank Details</Label>
                                <Textarea id="bank-details" value={bankDetails} onChange={e => setBankDetails(e.target.value)} placeholder="Bank Name, Account Number, Account Holder Name" />
                            </div>
                            <Button onClick={handleWithdrawalRequest} disabled={isSubmitting}>
                                {isSubmitting ? 'Submitting...' : 'Submit Request'}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="earnings">
                    <Card>
                        <CardHeader><CardTitle>Earnings History</CardTitle></CardHeader>
                        <CardContent>
                            {earnings.map(e => (
                                <div key={e.id} className="flex justify-between p-2 border-b">
                                    <p>{e.description}</p>
                                    <p className="text-green-500">{formatCurrency(e.amount, wallet?.currency || 'USD')}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="withdrawals">
                    <Card>
                        <CardHeader><CardTitle>Withdrawal History</CardTitle></CardHeader>
                        <CardContent>
                            {withdrawals.map(w => (
                                <div key={w.id} className="flex justify-between p-2 border-b">
                                    <p>{new Date(w.createdAt).toLocaleDateString()}</p>
                                    <p>{formatCurrency(w.amount, wallet?.currency || 'USD')}</p>
                                    <Badge variant={getStatusBadgeVariant(w.status)}>{w.status}</Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default EarningsWithdrawals;

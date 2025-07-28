
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Wallet, CreditCard, ArrowUpRight, ArrowDownLeft, History, Send } from 'lucide-react';
import { authService } from '@/lib/auth';
import { paymentService } from '@/lib/payment-service';
import { db } from '@/lib/github-sdk';
import { toast } from 'sonner';

// Interfaces moved to a shared types file if they grow
interface WalletData {
    id: string;
    balance: number;
    currency: string;
}

interface WalletTransaction {
    id: string;
    amount: number;
    type: 'credit' | 'debit';
    description: string;
    createdAt: string;
}

const WalletDashboard = () => {
    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [fundAmount, setFundAmount] = useState('');
    const [withdrawalAmount, setWithdrawalAmount] = useState('');
    const [withdrawalMethod, setWithdrawalMethod] = useState('bank_transfer');
    const [loading, setLoading] = useState(true);
    const [isFunding, setIsFunding] = useState(false);
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const user = authService.getCurrentUser();

    const loadWalletData = useCallback(async () => {
        if (!user) return;
        try {
            let walletData = await paymentService.getUserWallet(user.id);
            if (!walletData) {
                walletData = await db.insert('wallets', { userId: user.id, balance: 0, currency: 'USD' });
            }
            setWallet(walletData);

            const txData = await db.queryBuilder('walletTransactions')
                .where(tx => tx.walletId === walletData.id)
                .orderBy('createdAt', 'desc')
                .exec();
            setTransactions(txData);
        } catch (error) {
            console.error('Error loading wallet data:', error);
            toast.error('Failed to load wallet data.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadWalletData();
    }, [loadWalletData]);

    const handleFundWallet = async () => {
        if (!fundAmount || parseFloat(fundAmount) <= 0) {
            toast.error('Please enter a valid amount.');
            return;
        }
        setIsFunding(true);
        try {
            const response = await paymentService.initializePayment({
                amount: parseFloat(fundAmount),
                currency: wallet?.currency || 'USD',
                email: user!.email,
                userId: user!.id,
                items: [], // Empty for wallet funding
                type: 'wallet_funding',
                description: `Wallet funding`,
            });
            if (response.authorization_url) {
                window.location.href = response.authorization_url;
            } else {
                toast.error('Failed to initialize payment.');
            }
        } catch (error) {
            console.error('Error funding wallet:', error);
            toast.error('Could not initiate wallet funding.');
        } finally {
            setIsFunding(false);
        }
    };

    const handleRequestWithdrawal = async () => {
        const amount = parseFloat(withdrawalAmount);
        if (!amount || amount <= 0) {
            toast.error('Please enter a valid withdrawal amount.');
            return;
        }
        if (wallet && amount > wallet.balance) {
            toast.error('Withdrawal amount exceeds available balance.');
            return;
        }

        setIsWithdrawing(true);
        try {
            await paymentService.requestWithdrawal(user!.id, amount, withdrawalMethod, { info: 'Bank details here' });
            toast.success('Withdrawal request submitted successfully.');
            setWithdrawalAmount('');
            loadWalletData(); // Refresh wallet data
        } catch (error) {
            console.error('Withdrawal request error:', error);
            toast.error('Failed to submit withdrawal request.');
        } finally {
            setIsWithdrawing(false);
        }
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    };

    if (loading) return <div>Loading wallet...</div>;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Available Balance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold text-green-600">
                        {formatCurrency(wallet?.balance || 0, wallet?.currency || 'USD')}
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="history" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="history">Transaction History</TabsTrigger>
                    <TabsTrigger value="fund">Fund Wallet</TabsTrigger>
                    <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                </TabsList>

                <TabsContent value="history">
                    <Card>
                        <CardHeader><CardTitle>Transaction History</CardTitle></CardHeader>
                        <CardContent>
                            {transactions.map(tx => (
                                <div key={tx.id} className="flex justify-between items-center p-2 border-b">
                                    <div>
                                        <p className="font-medium">{tx.description}</p>
                                        <p className="text-sm text-gray-500">{new Date(tx.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div className={`font-bold ${tx.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
                                        {tx.type === 'credit' ? '+' : '-'} {formatCurrency(tx.amount, wallet?.currency || 'USD')}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="fund">
                    <Card>
                        <CardHeader><CardTitle>Fund Your Wallet</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <Label htmlFor="fund-amount">Amount</Label>
                            <Input id="fund-amount" type="number" value={fundAmount} onChange={e => setFundAmount(e.target.value)} placeholder="e.g., 50" />
                            <Button onClick={handleFundWallet} disabled={isFunding}>
                                {isFunding ? 'Processing...' : 'Fund with Paystack'}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="withdraw">
                    <Card>
                        <CardHeader><CardTitle>Request Withdrawal</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <Label htmlFor="withdrawal-amount">Amount</Label>
                            <Input id="withdrawal-amount" type="number" value={withdrawalAmount} onChange={e => setWithdrawalAmount(e.target.value)} placeholder="e.g., 100" />
                            {/* Add fields for withdrawal method details */}
                            <Button onClick={handleRequestWithdrawal} disabled={isWithdrawing}>
                                {isWithdrawing ? 'Submitting...' : 'Submit Request'}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default WalletDashboard;

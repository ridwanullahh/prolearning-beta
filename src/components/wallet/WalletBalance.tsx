
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { authService } from '@/lib/auth';
import { db } from '@/lib/github-sdk';
import { paymentService } from '@/lib/payment-service';
import { toast } from 'sonner';

interface WalletData {
  balance: number;
  currency: string;
  totalEarnings: number;
  totalWithdrawals: number;
  pendingBalance: number;
}

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  type: 'credit' | 'debit';
  category: string;
  description: string;
  status: string;
  createdAt: string;
}

const WalletBalance = () => {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fundAmount, setFundAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showFundDialog, setShowFundDialog] = useState(false);

  const user = authService.getCurrentUser();

  useEffect(() => {
    if (user) {
      loadWalletData();
      loadTransactions();
    }
  }, [user]);

  const loadWalletData = async () => {
    try {
      const wallets = await db.queryBuilder('wallets')
        .where(item => item.userId === user!.id)
        .exec();

      if (wallets.length > 0) {
        const wallet = wallets[0];
        setWalletData({
          balance: wallet.balance || 0,
          currency: wallet.currency || user!.currency || 'USD',
          totalEarnings: wallet.totalEarnings || 0,
          totalWithdrawals: wallet.totalWithdrawals || 0,
          pendingBalance: wallet.pendingBalance || 0
        });
      } else {
        // Create wallet if it doesn't exist
        const newWallet = await db.insert('wallets', {
          userId: user!.id,
          balance: 0,
          currency: user!.currency || 'USD',
          totalEarnings: 0,
          totalWithdrawals: 0,
          pendingBalance: 0
        });

        setWalletData({
          balance: 0,
          currency: user!.currency || 'USD',
          totalEarnings: 0,
          totalWithdrawals: 0,
          pendingBalance: 0
        });
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const transactionData = await db.queryBuilder('transactions')
        .where(item => item.userId === user!.id)
        .orderBy('createdAt', 'desc')
        .limit(10)
        .exec();

      setTransactions(transactionData);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const handleFundWallet = async () => {
    if (!fundAmount || parseFloat(fundAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setProcessing(true);
    try {
      const response = await paymentService.initializePayment({
        amount: parseFloat(fundAmount),
        currency: walletData?.currency || 'USD',
        email: user!.email,
        userId: user!.id,
        type: 'wallet_funding',
        description: `Wallet funding - ${fundAmount} ${walletData?.currency || 'USD'}`
      });

      if (response.success && response.authorization_url) {
        window.open(response.authorization_url, '_blank');
        setShowFundDialog(false);
        setFundAmount('');
        toast.success('Payment initiated. Complete the payment to fund your wallet.');
      } else {
        throw new Error(response.message || 'Failed to initialize payment');
      }
    } catch (error: any) {
      console.error('Error funding wallet:', error);
      toast.error(error.message || 'Failed to fund wallet');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Wallet className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(walletData?.balance || 0, walletData?.currency || 'USD')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(walletData?.totalEarnings || 0, walletData?.currency || 'USD')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(walletData?.totalWithdrawals || 0, walletData?.currency || 'USD')}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Wallet Management</CardTitle>
              <CardDescription>Fund your wallet and view transaction history</CardDescription>
            </div>
            <Dialog open={showFundDialog} onOpenChange={setShowFundDialog}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Fund Wallet
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Fund Your Wallet</DialogTitle>
                  <DialogDescription>
                    Add money to your wallet using Paystack payment gateway
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount ({walletData?.currency || 'USD'})</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                      min="1"
                      step="0.01"
                    />
                  </div>
                  <Button 
                    onClick={handleFundWallet} 
                    disabled={processing || !fundAmount}
                    className="w-full"
                  >
                    {processing ? 'Processing...' : 'Fund Wallet'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="font-semibold">Recent Transactions</h3>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No transactions found
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownLeft className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {transaction.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletBalance;

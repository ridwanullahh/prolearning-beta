
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Wallet, CreditCard, ArrowUpRight, ArrowDownLeft, History } from 'lucide-react';
import { authService } from '@/lib/auth';
import { paymentService } from '@/lib/payment-service';
import { db } from '@/lib/github-sdk';
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
  type: string;
  category: string;
  description: string;
  status: string;
  createdAt: string;
  paymentMethod?: string;
}

const WalletDashboard = () => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fundAmount, setFundAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [fundingWallet, setFundingWallet] = useState(false);

  const user = authService.getCurrentUser();

  useEffect(() => {
    if (user) {
      loadWalletData();
      loadTransactions();
    }
  }, [user]);

  const loadWalletData = async () => {
    try {
      const walletData = await paymentService.getUserWallet(user!.id);
      if (walletData) {
        setWallet({
          balance: walletData.balance || 0,
          currency: walletData.currency || 'USD',
          totalEarnings: walletData.totalEarnings || 0,
          totalWithdrawals: walletData.totalWithdrawals || 0,
          pendingBalance: walletData.pendingBalance || 0
        });
      } else {
        // Create default wallet
        await db.insert('wallets', {
          userId: user!.id,
          balance: 0,
          currency: user!.currency || 'USD',
          totalEarnings: 0,
          totalWithdrawals: 0,
          pendingBalance: 0
        });
        setWallet({
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
      const transactionData = await paymentService.getTransactionHistory(user!.id);
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

    setFundingWallet(true);
    try {
      const response = await paymentService.initializePayment({
        amount: parseFloat(fundAmount),
        currency: wallet?.currency || 'USD',
        email: user!.email,
        userId: user!.id,
        type: 'wallet_funding',
        description: `Wallet funding - ${fundAmount} ${wallet?.currency || 'USD'}`
      });

      if (response.success && response.authorization_url) {
        // Open payment gateway in new window
        window.open(response.authorization_url, '_blank');
        toast.success('Redirecting to payment gateway...');
        setFundAmount('');
      }
    } catch (error) {
      console.error('Error funding wallet:', error);
      toast.error('Failed to initialize payment');
    } finally {
      setFundingWallet(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Wallet className="h-6 w-6 text-purple-600" />
        <h1 className="text-2xl font-bold">Wallet</h1>
      </div>

      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(wallet?.balance || 0, wallet?.currency || 'USD')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(wallet?.totalEarnings || 0, wallet?.currency || 'USD')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(wallet?.totalWithdrawals || 0, wallet?.currency || 'USD')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Balance</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(wallet?.pendingBalance || 0, wallet?.currency || 'USD')}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="fund" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="fund">Fund Wallet</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="fund">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Fund Your Wallet
              </CardTitle>
              <CardDescription>
                Add money to your wallet using Paystack payment gateway
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ({wallet?.currency || 'USD'})</Label>
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
                disabled={fundingWallet || !fundAmount}
                className="w-full"
              >
                {fundingWallet ? 'Processing...' : 'Fund Wallet'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Transaction History
              </CardTitle>
              <CardDescription>
                View all your wallet transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No transactions found
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{transaction.description}</span>
                          <Badge className={getStatusBadgeColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {new Date(transaction.createdAt).toLocaleDateString()} • {transaction.paymentMethod}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'credit' ? '+' : '-'}
                          {formatCurrency(transaction.amount, transaction.currency)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.category}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WalletDashboard;

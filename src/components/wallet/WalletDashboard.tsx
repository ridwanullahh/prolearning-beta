
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Wallet, CreditCard, History, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { authService } from '@/lib/auth';
import { db } from '@/lib/github-sdk';
import { paymentService } from '@/lib/payment-service';
import { toast } from '@/hooks/use-toast';

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
}

const WalletDashboard = () => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fundAmount, setFundAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
      const walletData = await paymentService.getUserWallet(user!.id);
      if (walletData) {
        setWallet(walletData);
      } else {
        // Create wallet if it doesn't exist
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
      console.error('Error loading wallet:', error);
      toast({
        title: 'Error',
        description: 'Failed to load wallet data',
        variant: 'destructive'
      });
    }
  };

  const loadTransactions = async () => {
    try {
      const transactionHistory = await paymentService.getTransactionHistory(user!.id);
      setTransactions(transactionHistory);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const handleFundWallet = async () => {
    if (!fundAmount || parseFloat(fundAmount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const paymentRequest = {
        amount: parseFloat(fundAmount),
        currency: wallet?.currency || 'USD',
        email: user!.email,
        userId: user!.id,
        type: 'wallet_funding' as const,
        description: `Wallet funding - ${paymentService.formatCurrency(parseFloat(fundAmount), wallet?.currency || 'USD')}`
      };

      const response = await paymentService.initializePayment(paymentRequest);
      
      if (response.success && response.authorization_url) {
        window.open(response.authorization_url, '_blank');
        setShowFundDialog(false);
        setFundAmount('');
        
        toast({
          title: 'Payment Initialized',
          description: 'Please complete the payment in the opened window'
        });
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      toast({
        title: 'Payment Failed',
        description: 'Failed to initialize payment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return paymentService.formatCurrency(amount, currency);
  };

  if (!wallet) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Wallet className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">My Wallet</h2>
        </div>
        
        <Dialog open={showFundDialog} onOpenChange={setShowFundDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Fund Wallet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Fund Your Wallet</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
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
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Processing...' : 'Fund Wallet'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(wallet.balance, wallet.currency)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(wallet.totalEarnings, wallet.currency)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(wallet.totalWithdrawals, wallet.currency)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(wallet.pendingBalance, wallet.currency)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Transaction History</span>
          </CardTitle>
          <CardDescription>Your recent wallet transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No transactions yet</p>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
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
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleDateString()} • {transaction.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency)}
                    </p>
                    <p className={`text-sm capitalize ${
                      transaction.status === 'completed' ? 'text-green-600' : 
                      transaction.status === 'pending' ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {transaction.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletDashboard;

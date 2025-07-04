
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DollarSign, TrendingUp, Clock, CheckCircle, XCircle, Plus } from 'lucide-react';
import { authService } from '@/lib/auth';
import { db } from '@/lib/github-sdk';
import { paymentService } from '@/lib/payment-service';
import { toast } from '@/hooks/use-toast';

interface Withdrawal {
  id: string;
  amount: number;
  currency: string;
  status: string;
  requestedAt: string;
  processedAt?: string;
  bankDetails: string;
  adminNotes?: string;
}

const EarningsWithdrawals = () => {
  const [wallet, setWallet] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankDetails, setBankDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (user) {
      loadWalletData();
      loadWithdrawals();
    }
  }, [user]);

  const loadWalletData = async () => {
    try {
      const walletData = await paymentService.getUserWallet(user!.id);
      setWallet(walletData);
    } catch (error) {
      console.error('Error loading wallet:', error);
    }
  };

  const loadWithdrawals = async () => {
    try {
      const withdrawalData = await db.queryBuilder('withdrawals')
        .where(item => item.userId === user!.id)
        .orderBy('requestedAt', 'desc')
        .exec();
      setWithdrawals(withdrawalData);
    } catch (error) {
      console.error('Error loading withdrawals:', error);
    }
  };

  const handleWithdrawRequest = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount',
        variant: 'destructive'
      });
      return;
    }

    if (parseFloat(withdrawAmount) > wallet?.balance) {
      toast({
        title: 'Insufficient Balance',
        description: 'You cannot withdraw more than your available balance',
        variant: 'destructive'
      });
      return;
    }

    if (!bankDetails.trim()) {
      toast({
        title: 'Bank Details Required',
        description: 'Please provide your bank details',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create withdrawal request
      await db.insert('withdrawals', {
        userId: user!.id,
        amount: parseFloat(withdrawAmount),
        currency: wallet.currency,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        bankDetails: bankDetails
      });

      // Update wallet pending balance
      await db.update('wallets', wallet.id, {
        pendingBalance: (wallet.pendingBalance || 0) + parseFloat(withdrawAmount)
      });

      toast({
        title: 'Withdrawal Requested',
        description: 'Your withdrawal request has been submitted for review'
      });

      setShowWithdrawDialog(false);
      setWithdrawAmount('');
      setBankDetails('');
      loadWalletData();
      loadWithdrawals();
    } catch (error) {
      console.error('Withdrawal request error:', error);
      toast({
        title: 'Request Failed',
        description: 'Failed to submit withdrawal request',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-orange-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-orange-600';
    }
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
          <DollarSign className="h-6 w-6 text-green-600" />
          <h2 className="text-2xl font-bold">Earnings & Withdrawals</h2>
        </div>
        
        <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
          <DialogTrigger asChild>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              disabled={!wallet?.balance || wallet.balance <= 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Request Withdrawal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Withdrawal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder={`Max: ${paymentService.formatCurrency(wallet?.balance || 0, wallet?.currency || 'USD')}`}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  min="1"
                  max={wallet?.balance || 0}
                  step="0.01"
                />
              </div>
              <div>
                <Label htmlFor="bankDetails">Bank Details</Label>
                <Textarea
                  id="bankDetails"
                  placeholder="Please provide your bank details (Bank name, Account number, Account name, etc.)"
                  value={bankDetails}
                  onChange={(e) => setBankDetails(e.target.value)}
                  rows={4}
                />
              </div>
              <Button 
                onClick={handleWithdrawRequest} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Processing...' : 'Request Withdrawal'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available for Withdrawal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {paymentService.formatCurrency(wallet.balance - (wallet.pendingBalance || 0), wallet.currency)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {paymentService.formatCurrency(wallet.totalEarnings || 0, wallet.currency)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {paymentService.formatCurrency(wallet.pendingBalance || 0, wallet.currency)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
          <CardDescription>Your withdrawal requests and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {withdrawals.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No withdrawal requests yet</p>
          ) : (
            <div className="space-y-4">
              {withdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(withdrawal.status)}
                    <div>
                      <p className="font-medium">
                        {paymentService.formatCurrency(withdrawal.amount, withdrawal.currency)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(withdrawal.requestedAt).toLocaleDateString()}
                        {withdrawal.processedAt && ` • Processed: ${new Date(withdrawal.processedAt).toLocaleDateString()}`}
                      </p>
                      {withdrawal.adminNotes && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Note: {withdrawal.adminNotes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium capitalize ${getStatusColor(withdrawal.status)}`}>
                      {withdrawal.status}
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

export default EarningsWithdrawals;

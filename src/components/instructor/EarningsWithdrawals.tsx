
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { authService } from '@/lib/auth';
import { db } from '@/lib/github-sdk';
import { toast } from 'sonner';

interface Earning {
  id: string;
  courseId: string;
  amount: number;
  currency: string;
  type: string;
  commissionRate: number;
  netAmount: number;
  createdAt: string;
  paidOut: boolean;
}

interface Withdrawal {
  id: string;
  amount: number;
  currency: string;
  bankDetails: string;
  status: string;
  createdAt: string;
  processedAt?: string;
  rejectionReason?: string;
}

const EarningsWithdrawals = () => {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [bankDetails, setBankDetails] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);

  const user = authService.getCurrentUser();

  useEffect(() => {
    if (user) {
      loadEarnings();
      loadWithdrawals();
      loadWalletBalance();
    }
  }, [user]);

  const loadEarnings = async () => {
    try {
      const earningsData = await db.queryBuilder('earnings')
        .where(item => item.instructorId === user!.id)
        .orderBy('createdAt', 'desc')
        .exec();
      setEarnings(earningsData);
    } catch (error) {
      console.error('Error loading earnings:', error);
    }
  };

  const loadWithdrawals = async () => {
    try {
      const withdrawalsData = await db.queryBuilder('withdrawals')
        .where(item => item.userId === user!.id)
        .orderBy('createdAt', 'desc')
        .exec();
      setWithdrawals(withdrawalsData);
    } catch (error) {
      console.error('Error loading withdrawals:', error);
    }
  };

  const loadWalletBalance = async () => {
    try {
      const wallets = await db.queryBuilder('wallets')
        .where(item => item.userId === user!.id)
        .exec();
      
      if (wallets.length > 0) {
        setAvailableBalance(wallets[0].balance || 0);
      }
    } catch (error) {
      console.error('Error loading wallet balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalRequest = async () => {
    if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parseFloat(withdrawalAmount) > availableBalance) {
      toast.error('Insufficient balance');
      return;
    }

    if (!bankDetails.trim()) {
      toast.error('Please provide bank details');
      return;
    }

    setSubmittingWithdrawal(true);
    try {
      await db.insert('withdrawals', {
        userId: user!.id,
        amount: parseFloat(withdrawalAmount),
        currency: user!.currency || 'USD',
        bankDetails,
        status: 'pending'
      });

      // Update wallet balance (reduce available balance, increase pending)
      const wallets = await db.queryBuilder('wallets')
        .where(item => item.userId === user!.id)
        .exec();

      if (wallets.length > 0) {
        const wallet = wallets[0];
        await db.update('wallets', wallet.id, {
          balance: wallet.balance - parseFloat(withdrawalAmount),
          pendingBalance: (wallet.pendingBalance || 0) + parseFloat(withdrawalAmount),
          updatedAt: new Date().toISOString()
        });
      }

      toast.success('Withdrawal request submitted successfully');
      setWithdrawalAmount('');
      setBankDetails('');
      loadWithdrawals();
      loadWalletBalance();
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      toast.error('Failed to submit withdrawal request');
    } finally {
      setSubmittingWithdrawal(false);
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
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalEarnings = earnings.reduce((sum, earning) => sum + earning.netAmount, 0);
  const paidOutEarnings = earnings.filter(e => e.paidOut).reduce((sum, earning) => sum + earning.netAmount, 0);

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
        <DollarSign className="h-6 w-6 text-green-600" />
        <h1 className="text-2xl font-bold">Earnings & Withdrawals</h1>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(availableBalance, user?.currency || 'USD')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalEarnings, user?.currency || 'USD')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Withdrawn</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(paidOutEarnings, user?.currency || 'USD')}
            </div>
          </CardContent>
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
              <CardTitle>Request Withdrawal</CardTitle>
              <CardDescription>
                Withdraw your earnings to your bank account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="withdrawal-amount">Amount ({user?.currency || 'USD'})</Label>
                <Input
                  id="withdrawal-amount"
                  type="number"
                  placeholder="Enter amount"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  min="1"
                  step="0.01"
                  max={availableBalance}
                />
                <p className="text-sm text-gray-500">
                  Available balance: {formatCurrency(availableBalance, user?.currency || 'USD')}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bank-details">Bank Details</Label>
                <Textarea
                  id="bank-details"
                  placeholder="Bank Name: 
Account Number: 
Account Name: 
Sort Code/Routing Number:"
                  value={bankDetails}
                  onChange={(e) => setBankDetails(e.target.value)}
                  rows={6}
                />
              </div>

              <Button 
                onClick={handleWithdrawalRequest} 
                disabled={submittingWithdrawal || !withdrawalAmount || !bankDetails}
                className="w-full"
              >
                {submittingWithdrawal ? 'Submitting...' : 'Request Withdrawal'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings">
          <Card>
            <CardHeader>
              <CardTitle>Earnings History</CardTitle>
              <CardDescription>
                Track your course sales and earnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {earnings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No earnings found
                </div>
              ) : (
                <div className="space-y-4">
                  {earnings.map((earning) => (
                    <div key={earning.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{earning.type.replace('_', ' ').toUpperCase()}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {new Date(earning.createdAt).toLocaleDateString()} • 
                          Commission: {earning.commissionRate}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          {formatCurrency(earning.netAmount, earning.currency)}
                        </div>
                        <Badge className={earning.paidOut ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {earning.paidOut ? 'Paid Out' : 'Available'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal History</CardTitle>
              <CardDescription>
                View all your withdrawal requests and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {withdrawals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No withdrawal requests found
                </div>
              ) : (
                <div className="space-y-4">
                  {withdrawals.map((withdrawal) => (
                    <div key={withdrawal.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-bold">
                          {formatCurrency(withdrawal.amount, withdrawal.currency)}
                        </div>
                        <Badge className={getStatusBadgeColor(withdrawal.status)}>
                          {withdrawal.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        Requested: {new Date(withdrawal.createdAt).toLocaleDateString()}
                        {withdrawal.processedAt && (
                          <>
                            <br />
                            Processed: {new Date(withdrawal.processedAt).toLocaleDateString()}
                          </>
                        )}
                      </div>
                      {withdrawal.rejectionReason && (
                        <div className="text-sm text-red-600 mt-2">
                          Reason: {withdrawal.rejectionReason}
                        </div>
                      )}
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

export default EarningsWithdrawals;

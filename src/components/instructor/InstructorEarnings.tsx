
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Clock, ArrowUpRight } from 'lucide-react';
import { authService } from '@/lib/auth';
import { db } from '@/lib/github-sdk';
import { toast } from 'sonner';

interface EarningData {
  totalEarnings: number;
  monthlyEarnings: number;
  pendingEarnings: number;
  availableForWithdrawal: number;
  currency: string;
}

interface Earning {
  id: string;
  amount: number;
  currency: string;
  courseTitle: string;
  type: string;
  status: string;
  createdAt: string;
}

interface Withdrawal {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  bankDetails?: string;
  processedAt?: string;
  rejectionReason?: string;
}

const InstructorEarnings = () => {
  const [earnings, setEarnings] = useState<EarningData | null>(null);
  const [earningHistory, setEarningHistory] = useState<Earning[]>([]);
  const [withdrawalHistory, setWithdrawalHistory] = useState<Withdrawal[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankDetails, setBankDetails] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const user = authService.getCurrentUser();

  useEffect(() => {
    if (user) {
      loadEarningsData();
      loadEarningHistory();
      loadWithdrawalHistory();
    }
  }, [user]);

  const loadEarningsData = async () => {
    try {
      const allEarnings = await db.queryBuilder('earnings')
        .where((earning: any) => earning.instructorId === user!.id)
        .exec();

      const wallet = await db.queryBuilder('wallets')
        .where((wallet: any) => wallet.userId === user!.id)
        .exec();

      const totalEarnings = allEarnings.reduce((sum: number, earning: any) => sum + earning.netAmount, 0);
      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthlyEarnings = allEarnings
        .filter((earning: any) => earning.createdAt.startsWith(currentMonth))
        .reduce((sum: number, earning: any) => sum + earning.netAmount, 0);

      const walletData = wallet[0];
      
      setEarnings({
        totalEarnings,
        monthlyEarnings,
        pendingEarnings: walletData?.pendingBalance || 0,
        availableForWithdrawal: walletData?.balance || 0,
        currency: user!.currency || 'USD'
      });
    } catch (error) {
      console.error('Error loading earnings data:', error);
      toast.error('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  const loadEarningHistory = async () => {
    try {
      const earningsData = await db.queryBuilder('earnings')
        .where((earning: any) => earning.instructorId === user!.id)
        .orderBy('createdAt', 'desc')
        .exec();

      // Get course titles
      const enrichedEarnings = await Promise.all(
        earningsData.map(async (earning: any) => {
          const course = await db.getItem('courses', earning.courseId);
          return {
            ...earning,
            courseTitle: course?.title || 'Unknown Course'
          };
        })
      );

      setEarningHistory(enrichedEarnings);
    } catch (error) {
      console.error('Error loading earning history:', error);
    }
  };

  const loadWithdrawalHistory = async () => {
    try {
      const withdrawals = await db.queryBuilder('withdrawalRequests')
        .where((withdrawal: any) => withdrawal.userId === user!.id)
        .orderBy('createdAt', 'desc')
        .exec();

      setWithdrawalHistory(withdrawals);
    } catch (error) {
      console.error('Error loading withdrawal history:', error);
    }
  };

  const handleWithdrawal = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!bankDetails.trim()) {
      toast.error('Please provide bank details');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (amount > (earnings?.availableForWithdrawal || 0)) {
      toast.error('Insufficient balance for withdrawal');
      return;
    }

    setProcessing(true);
    try {
      // Create withdrawal request
      await db.insert('withdrawalRequests', {
        userId: user!.id,
        amount,
        currency: earnings?.currency || 'USD',
        bankDetails,
        status: 'pending'
      });

      // Update wallet balance
      const wallet = await db.queryBuilder('wallets')
        .where((wallet: any) => wallet.userId === user!.id)
        .exec();

      if (wallet.length > 0) {
        await db.update('wallets', wallet[0].id, {
          balance: (wallet[0].balance || 0) - amount,
          pendingBalance: (wallet[0].pendingBalance || 0) + amount,
          totalWithdrawals: (wallet[0].totalWithdrawals || 0) + amount
        });
      }

      toast.success('Withdrawal request submitted successfully');
      setWithdrawAmount('');
      setBankDetails('');
      loadEarningsData();
      loadWithdrawalHistory();
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      toast.error('Failed to process withdrawal request');
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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'rejected':
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
        <DollarSign className="h-6 w-6 text-green-600" />
        <h1 className="text-2xl font-bold">Earnings & Withdrawals</h1>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(earnings?.totalEarnings || 0, earnings?.currency || 'USD')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(earnings?.monthlyEarnings || 0, earnings?.currency || 'USD')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(earnings?.pendingEarnings || 0, earnings?.currency || 'USD')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(earnings?.availableForWithdrawal || 0, earnings?.currency || 'USD')}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="withdraw" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          <TabsTrigger value="earnings">Earnings History</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawal History</TabsTrigger>
        </TabsList>

        <TabsContent value="withdraw">
          <Card>
            <CardHeader>
              <CardTitle>Request Withdrawal</CardTitle>
              <CardDescription>
                Withdraw your available earnings to your bank account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ({earnings?.currency || 'USD'})</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  min="1"
                  max={earnings?.availableForWithdrawal || 0}
                  step="0.01"
                />
                <p className="text-sm text-gray-500">
                  Available: {formatCurrency(earnings?.availableForWithdrawal || 0, earnings?.currency || 'USD')}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankDetails">Bank Details</Label>
                <Textarea
                  id="bankDetails"
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
                onClick={handleWithdrawal} 
                disabled={processing || !withdrawAmount || !bankDetails}
                className="w-full"
              >
                {processing ? 'Processing...' : 'Request Withdrawal'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings">
          <Card>
            <CardHeader>
              <CardTitle>Earnings History</CardTitle>
              <CardDescription>
                View your course earnings and commissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {earningHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No earnings yet
                </div>
              ) : (
                <div className="space-y-4">
                  {earningHistory.map((earning) => (
                    <div key={earning.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{earning.courseTitle}</span>
                          <Badge className={getStatusBadgeColor(earning.status)}>
                            {earning.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {new Date(earning.createdAt).toLocaleDateString()} • {earning.type}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          +{formatCurrency(earning.amount, earning.currency)}
                        </div>
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
                Track your withdrawal requests and payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {withdrawalHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No withdrawals yet
                </div>
              ) : (
                <div className="space-y-4">
                  {withdrawalHistory.map((withdrawal) => (
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

export default InstructorEarnings;

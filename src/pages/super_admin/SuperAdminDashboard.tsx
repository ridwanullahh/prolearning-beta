
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, BookOpen, DollarSign, TrendingUp, Shield, Settings, CreditCard, Wallet } from 'lucide-react';
import { authService } from '@/lib/auth';
import { db } from '@/lib/github-sdk';
import { toast } from 'sonner';

interface DashboardStats {
  totalUsers: number;
  totalInstructors: number;
  totalCourses: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingWithdrawals: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  lastLoginAt?: string;
}

interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  currency: string;
  bankDetails: string;
  status: string;
  createdAt: string;
}

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalInstructors: 0,
    totalCourses: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingWithdrawals: 0
  });
  const [users, setUsers] = useState<User[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const user = authService.getCurrentUser();

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      // Load all users
      const allUsers = await db.get('users');
      const instructors = allUsers.filter(u => u.role === 'instructor');
      
      // Load all courses
      const allCourses = await db.get('courses');
      
      // Load all earnings
      const allEarnings = await db.get('earnings');
      const totalRevenue = allEarnings.reduce((sum, earning) => sum + earning.netAmount, 0);
      
      // Calculate monthly revenue
      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthlyEarnings = allEarnings.filter(earning => earning.createdAt.startsWith(currentMonth));
      const monthlyRevenue = monthlyEarnings.reduce((sum, earning) => sum + earning.netAmount, 0);
      
      // Load pending withdrawals
      const pendingWithdrawals = await db.queryBuilder('withdrawalRequests')
        .where(item => item.status === 'pending')
        .exec();

      const enrichedWithdrawals = await Promise.all(
        pendingWithdrawals.map(async (withdrawal: any) => {
          const user = await db.getItem('users', withdrawal.userId);
          return {
            ...withdrawal,
            userName: user?.name || 'Unknown User'
          };
        })
      );

      setStats({
        totalUsers: allUsers.length,
        totalInstructors: instructors.length,
        totalCourses: allCourses.length,
        totalRevenue,
        monthlyRevenue,
        pendingWithdrawals: pendingWithdrawals.length
      });

      setUsers(allUsers);
      setWithdrawalRequests(enrichedWithdrawals);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveWithdrawal = async (withdrawalId: string) => {
    try {
      await db.update('withdrawalRequests', withdrawalId, {
        status: 'approved',
        processedAt: new Date().toISOString()
      });
      
      toast.success('Withdrawal approved successfully');
      loadDashboardData();
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      toast.error('Failed to approve withdrawal');
    }
  };

  const handleRejectWithdrawal = async (withdrawalId: string, reason: string) => {
    try {
      await db.update('withdrawalRequests', withdrawalId, {
        status: 'rejected',
        processedAt: new Date().toISOString(),
        rejectionReason: reason
      });
      
      // Return money to user's available balance
      const withdrawal = withdrawalRequests.find(w => w.id === withdrawalId);
      if (withdrawal) {
        const userWallet = await db.queryBuilder('wallets')
          .where(item => item.userId === withdrawal.userId)
          .exec();
        
        if (userWallet.length > 0) {
          const wallet = userWallet[0];
          await db.update('wallets', wallet.id, {
            balance: (wallet.balance || 0) + withdrawal.amount,
            pendingBalance: (wallet.pendingBalance || 0) - withdrawal.amount
          });
        }
      }
      
      toast.success('Withdrawal rejected');
      loadDashboardData();
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      toast.error('Failed to reject withdrawal');
    }
  };

  const handleUserStatusToggle = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await db.update('users', userId, { status: newStatus });
      
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      loadDashboardData();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
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
        <Shield className="h-6 w-6 text-purple-600" />
        <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Instructors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInstructors}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.monthlyRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pendingWithdrawals}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Users Management</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawal Requests</TabsTrigger>
          <TabsTrigger value="settings">Platform Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Users Management</CardTitle>
              <CardDescription>Manage platform users and their permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.name}</span>
                        <Badge className={
                          user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'instructor' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {user.role}
                        </Badge>
                        <Badge className={
                          user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }>
                          {user.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {user.email} • Joined {new Date(user.createdAt).toLocaleDateString()}
                        {user.lastLoginAt && ` • Last login ${new Date(user.lastLoginAt).toLocaleDateString()}`}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUserStatusToggle(user.id, user.status)}
                        disabled={user.role === 'super_admin'}
                      >
                        {user.status === 'active' ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal Requests</CardTitle>
              <CardDescription>Review and process instructor withdrawal requests</CardDescription>
            </CardHeader>
            <CardContent>
              {withdrawalRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No pending withdrawal requests
                </div>
              ) : (
                <div className="space-y-4">
                  {withdrawalRequests.map((request) => (
                    <div key={request.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{request.userName}</span>
                            <Badge className="bg-yellow-100 text-yellow-800">
                              {request.status}
                            </Badge>
                          </div>
                          <div className="text-lg font-bold text-green-600 mb-2">
                            {formatCurrency(request.amount, request.currency)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Requested: {new Date(request.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Bank Details:</h4>
                        <pre className="text-sm bg-gray-50 p-3 rounded border whitespace-pre-wrap">
                          {request.bankDetails}
                        </pre>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApproveWithdrawal(request.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            const reason = prompt('Enter rejection reason:');
                            if (reason) {
                              handleRejectWithdrawal(request.id, reason);
                            }
                          }}
                          className="border-red-600 text-red-600 hover:bg-red-50"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Platform Settings
              </CardTitle>
              <CardDescription>Configure platform-wide settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Payment Configuration</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Configure Paystack payment settings for wallet funding and course purchases
                  </p>
                  <Button variant="outline">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Configure Paystack
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Commission Settings</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Current platform commission: 15% per course sale
                  </p>
                  <Button variant="outline">Update Commission Rate</Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">System Maintenance</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Perform system maintenance and data cleanup
                  </p>
                  <Button variant="outline">System Tools</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperAdminDashboard;

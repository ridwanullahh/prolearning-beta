
import BlogCMS from '@/components/admin/BlogCMS';
import { AppHeader, AppSidebar } from '@/components/layout/Sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import TicketSystem from '@/components/support/TicketSystem';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authService } from '@/lib/auth';
import { db } from '@/lib/github-sdk';
import {
	BookOpen,
	CreditCard,
	DollarSign,
	MessageSquare,
	Settings,
	Users,
	Wallet,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';

const SuperAdminDashboard = () => {
	const [stats, setStats] = useState({
		totalUsers: 0,
		totalCourses: 0,
		totalRevenue: 0,
		totalWithdrawals: 0,
		pendingWithdrawals: 0,
		activeTickets: 0,
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadDashboardStats();
	}, []);

	const loadDashboardStats = async () => {
		try {
			const users = await db.get('users');
			const courses = await db.get('courses');
			const transactions = await db
				.queryBuilder('transactions')
				.where((item) => item.status === 'completed')
				.exec();
			const totalRevenue = transactions.reduce(
				(sum, tx) => sum + tx.amount,
				0
			);
			const withdrawals = await db.get('withdrawals');
			const totalWithdrawals = withdrawals
				.filter((w) => w.status === 'approved')
				.reduce((sum, w) => sum + w.amount, 0);
			const pendingWithdrawals = withdrawals
				.filter((w) => w.status === 'pending')
				.reduce((sum, w) => sum + w.amount, 0);
			const tickets = await db
				.queryBuilder('supportTickets')
				.where(
					(item) => item.status !== 'resolved' && item.status !== 'closed'
				)
				.exec();

			setStats({
				totalUsers: users.length,
				totalCourses: courses.length,
				totalRevenue,
				totalWithdrawals,
				pendingWithdrawals,
				activeTickets: tickets.length,
			});
		} catch (error) {
			console.error('Error loading dashboard stats:', error);
		} finally {
			setLoading(false);
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(amount);
	};

	return (
		<SidebarProvider>
			<div className="flex min-h-screen w-full flex-row bg-gradient-to-br from-green-50/50 via-emerald-50/30 to-teal-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-green-950/20">
				<AppSidebar />
				<div className="flex flex-col sm:gap-4">
					<AppHeader />
					<main className="grid flex-1 items-start gap-4 p-4 sm:px-6 md:gap-8">
						<Tabs defaultValue="overview">
							<TabsList className="bg-white/80 backdrop-blur-sm">
								<TabsTrigger value="overview" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Overview</TabsTrigger>
								<TabsTrigger value="wallet" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Wallet</TabsTrigger>
								<TabsTrigger value="withdrawals" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Withdrawals</TabsTrigger>
								<TabsTrigger value="blog" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Blog</TabsTrigger>
								<TabsTrigger value="support" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Support</TabsTrigger>
							</TabsList>
							<TabsContent value="overview">
								<Outlet />
							</TabsContent>
						</Tabs>
					</main>
				</div>
			</div>
		</SidebarProvider>
	);
}

// Withdrawal Management Component
const WithdrawalManagement = () => {
	const [withdrawals, setWithdrawals] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadWithdrawals();
	}, []);

	const loadWithdrawals = async () => {
		try {
			const withdrawalsData = await db
				.queryBuilder('withdrawals')
				.orderBy('createdAt', 'desc')
				.exec();
			setWithdrawals(withdrawalsData);
		} catch (error) {
			console.error('Error loading withdrawals:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleApproveWithdrawal = async (withdrawalId: string) => {
		try {
			await db.update('withdrawals', withdrawalId, {
				status: 'approved',
				processedAt: new Date().toISOString(),
			});

			// Update instructor wallet
			const withdrawal = withdrawals.find((w) => w.id === withdrawalId);
			if (withdrawal) {
				const wallets = await db
					.queryBuilder('wallets')
					.where((item) => item.userId === withdrawal.userId)
					.exec();

				if (wallets.length > 0) {
					const wallet = wallets[0];
					await db.update('wallets', wallet.id, {
						pendingBalance: (wallet.pendingBalance || 0) - withdrawal.amount,
						totalWithdrawals:
							(wallet.totalWithdrawals || 0) + withdrawal.amount,
						updatedAt: new Date().toISOString(),
					});
				}
			}

			loadWithdrawals();
		} catch (error) {
			console.error('Error approving withdrawal:', error);
		}
	};

	const handleRejectWithdrawal = async (
		withdrawalId: string,
		reason: string
	) => {
		try {
			await db.update('withdrawals', withdrawalId, {
				status: 'rejected',
				rejectionReason: reason,
				processedAt: new Date().toISOString(),
			});

			// Return amount to instructor balance
			const withdrawal = withdrawals.find((w) => w.id === withdrawalId);
			if (withdrawal) {
				const wallets = await db
					.queryBuilder('wallets')
					.where((item) => item.userId === withdrawal.userId)
					.exec();

				if (wallets.length > 0) {
					const wallet = wallets[0];
					await db.update('wallets', wallet.id, {
						balance: (wallet.balance || 0) + withdrawal.amount,
						pendingBalance: (wallet.pendingBalance || 0) - withdrawal.amount,
						updatedAt: new Date().toISOString(),
					});
				}
			}

			loadWithdrawals();
		} catch (error) {
			console.error('Error rejecting withdrawal:', error);
		}
	};

	const formatCurrency = (amount: number, currency: string) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency,
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

	if (loading) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
			</div>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Withdrawal Management</CardTitle>
				<CardDescription>
					Review and process instructor withdrawal requests
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{withdrawals.length === 0 ? (
						<div className="text-center py-8 text-gray-500">
							No withdrawal requests found
						</div>
					) : (
						withdrawals.map((withdrawal) => (
							<div key={withdrawal.id} className="p-4 border rounded-lg">
								<div className="flex items-center justify-between mb-3">
									<div>
										<div className="font-bold text-lg">
											{formatCurrency(withdrawal.amount, withdrawal.currency)}
										</div>
										<div className="text-sm text-gray-500">
											Requested:{' '}
											{new Date(withdrawal.createdAt).toLocaleDateString()}
										</div>
									</div>
									<div className="flex items-center gap-2">
										<Badge
											className={getStatusBadgeColor(withdrawal.status)}
											variant="secondary"
										>
											{withdrawal.status}
										</Badge>
										{withdrawal.status === 'pending' && (
											<div className="flex gap-2">
												<Button
													size="sm"
													onClick={() =>
														handleApproveWithdrawal(withdrawal.id)
													}
												>
													Approve
												</Button>
												<Button
													size="sm"
													variant="outline"
													onClick={() => {
														const reason = prompt('Enter rejection reason:');
														if (reason) {
															handleRejectWithdrawal(withdrawal.id, reason);
														}
													}}
												>
													Reject
												</Button>
											</div>
										)}
									</div>
								</div>
								<div className="text-sm bg-muted p-3 rounded">
									<strong>Bank Details:</strong>
									<pre className="whitespace-pre-wrap mt-1">
										{withdrawal.bankDetails}
									</pre>
								</div>
								{withdrawal.rejectionReason && (
									<div className="text-sm text-red-600 mt-2">
										<strong>Rejection Reason:</strong>{' '}
										{withdrawal.rejectionReason}
									</div>
								)}
							</div>
						))
					)}
				</div>
			</CardContent>
		</Card>
	);
};

export default SuperAdminDashboard;

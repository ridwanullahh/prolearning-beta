import {
	Book,
	BookOpen,
	GraduationCap,
	Home,
	LifeBuoy,
	Search,
	Settings,
	ShoppingBag,
	Users,
	Wallet,
} from 'lucide-react';
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
	SidebarTrigger,
} from '../ui/sidebar';
import { Link, useLocation } from 'react-router-dom';
import { authService } from '@/lib/auth';
import { Button } from '../ui/button';
import { Input } from '@/components/ui/input';

const learnerNavItems = [
	{ href: '/dashboard', label: 'Dashboard', icon: Home },
	{ href: '/dashboard/courses', label: 'My Courses', icon: BookOpen },
	{ href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
	{ href: '/wallet', label: 'Wallet', icon: Wallet },
];

const instructorNavItems = [
	{ href: '/instruct', label: 'Dashboard', icon: Home },
	{ href: '/instruct/courses', label: 'My Courses', icon: BookOpen },
	{ href: '/instruct/create', label: 'Create Course', icon: Book },
	{ href: '/instruct/students', label: 'Students', icon: Users },
];

const adminNavItems = [
	{ href: '/admin', label: 'Dashboard', icon: Home },
	{ href: '/admin/users', label: 'Users', icon: Users },
	{ href: '/admin/courses', label: 'Courses', icon: BookOpen },
	{ href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AppSidebar() {
	const location = useLocation();
	const user = authService.getCurrentUser();

	const navItems =
		user?.role === 'instructor'
			? instructorNavItems
			: user?.role === 'super_admin'
			? adminNavItems
			: learnerNavItems;

	const handleLogout = () => {
		authService.logout();
		window.location.reload();
	};

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader className="p-4 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<GraduationCap className="w-8 h-8 text-primary" />
					<h1 className="text-xl font-semibold">ProLearning</h1>
				</div>
				<div className="sm:hidden">
					<SidebarTrigger />
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarMenu>
					{navItems.map((item) => (
						<SidebarMenuItem key={item.href}>
							<Link to={item.href} className="w-full">
								<SidebarMenuButton
									isActive={location.pathname === item.href}
								>
									<item.icon className="h-4 w-4 mr-2" />
									{item.label}
								</SidebarMenuButton>
							</Link>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
				<SidebarSeparator />
				<SidebarMenu>
					<SidebarMenuItem>
						<Link to="/support" className="w-full">
							<SidebarMenuButton
								isActive={location.pathname === '/support'}
							>
								<LifeBuoy className="h-4 w-4 mr-2" />
								Support
							</SidebarMenuButton>
						</Link>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<Link to="/settings" className="w-full">
							<SidebarMenuButton
								isActive={location.pathname === '/settings'}
							>
								<Settings className="h-4 w-4 mr-2" />
								Settings
							</SidebarMenuButton>
						</Link>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarContent>
			<SidebarMenu>
				<SidebarSeparator />
				<SidebarMenuItem>
					<Button
						variant="ghost"
						className="w-full justify-start"
						onClick={handleLogout}
					>
						Logout
					</Button>
				</SidebarMenuItem>
				<SidebarMenuItem className="hidden sm:block">
					<SidebarTrigger className="w-full justify-start" />
				</SidebarMenuItem>
			</SidebarMenu>
		</Sidebar>
	);
}

export function AppHeader() {
	const user = authService.getCurrentUser();
	return (
		<header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
			<div className="flex items-center gap-4">
				<div className="relative flex-1 md:grow-0">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Search..."
						className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
					/>
				</div>
			</div>
			<div className="flex items-center gap-4 ml-auto">
				<Button variant="ghost" size="icon">
					<Wallet className="h-5 w-5" />
					<span className="sr-only">Wallet</span>
				</Button>
				<Button variant="ghost" size="icon">
					<Settings className="h-5 w-5" />
					<span className="sr-only">Settings</span>
				</Button>
				<img
					src={user?.avatar || `https://avatar.vercel.sh/${user?.id}.png`}
					alt="user"
					className="w-8 h-8 rounded-full"
				/>
			</div>
		</header>
	);
}
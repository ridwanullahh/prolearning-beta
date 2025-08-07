import {
  Book,
  BookOpen,
  GraduationCap,
  Home,
  LifeBuoy,
  Search,
  Settings,
  Shield,
  ShoppingBag,
  Users,
  Wallet,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Trophy,
  BarChart3,
  MessageCircle,
  Plus,
  ChevronRight,
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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const learnerNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home, badge: null },
  { href: '/dashboard/courses', label: 'My Courses', icon: BookOpen, badge: null },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag, badge: 'New' },
  { href: '/achievements', label: 'Achievements', icon: Trophy, badge: null },
  { href: '/progress', label: 'Progress', icon: BarChart3, badge: null },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, badge: null },
];

const instructorNavItems = [
  { href: '/instruct', label: 'Dashboard', icon: Home, badge: null },
  { href: '/instruct/courses', label: 'My Courses', icon: BookOpen, badge: null },
  { href: '/instruct/courses/new', label: 'Create Course', icon: Plus, badge: null },
  { href: '/instruct/students', label: 'Students', icon: Users, badge: null },
  { href: '/instruct/analytics', label: 'Analytics', icon: BarChart3, badge: null },
  { href: '/instruct/settings', label: 'Settings', icon: Settings, badge: null },
];

const adminNavItems = [
  { href: '/super-admin', label: 'Dashboard', icon: Home, badge: null },
  { href: '/super-admin/users', label: 'Users', icon: Users, badge: null },
  { href: '/super-admin/courses', label: 'Courses', icon: BookOpen, badge: null },
  { href: '/super-admin/analytics', label: 'Analytics', icon: BarChart3, badge: null },
  { href: '/super-admin/instructor-approvals', label: 'Instructor Approvals', icon: Users, badge: null },
  { href: '/super-admin/qualification-approvals', label: 'Qualification Approvals', icon: GraduationCap, badge: null },
  { href: '/super-admin/ai-guidelines', label: 'AI Guidelines', icon: Shield, badge: null },
  { href: '/super-admin/settings', label: 'Settings', icon: Settings, badge: null },
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
    <Sidebar 
      collapsible="icon" 
      className="border-r-0 bg-gradient-to-b from-white via-green-50/30 to-emerald-50/20 dark:from-gray-950 dark:via-green-950/20 dark:to-emerald-950/10"
    >
      <SidebarHeader className="p-6 border-b border-gray-100 dark:border-gray-800">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              ProLearning
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {user?.role || 'learner'} dashboard
            </p>
          </div>
        </motion.div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-6">
        <SidebarMenu className="space-y-2">
          {navItems.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <SidebarMenuItem>
                <Link to={item.href} className="w-full">
                  <SidebarMenuButton
                    isActive={location.pathname === item.href}
                    className={`
                      h-12 px-4 rounded-2xl transition-all duration-200 group relative overflow-hidden
                      ${location.pathname === item.href 
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-600/25'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }
                    `}
                  >
                    <item.icon className={`h-5 w-5 transition-colors ${
                      location.pathname === item.href ? 'text-white' : 'text-gray-500 group-hover:text-green-600'
                    }`} />
                    <span className="font-medium group-data-[collapsible=icon]:hidden ml-3">
                      {item.label}
                    </span>
                    {item.badge && (
                      <Badge 
                        variant="secondary" 
                        className="ml-auto text-xs bg-green-100 text-green-700 group-data-[collapsible=icon]:hidden"
                      >
                        {item.badge}
                      </Badge>
                    )}
                    {location.pathname === item.href && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl -z-10"
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </motion.div>
          ))}
        </SidebarMenu>

        <SidebarSeparator className="my-6 bg-gray-200 dark:bg-gray-700" />

        <SidebarMenu className="space-y-2">
          <SidebarMenuItem>
            <Link to="/support" className="w-full">
              <SidebarMenuButton
                isActive={location.pathname === '/support'}
                className="h-12 px-4 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                <MessageCircle className="h-5 w-5 text-gray-500" />
                <span className="font-medium group-data-[collapsible=icon]:hidden ml-3">Support</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <Link to="/help" className="w-full">
              <SidebarMenuButton
                isActive={location.pathname === '/help'}
                className="h-12 px-4 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                <LifeBuoy className="h-5 w-5 text-gray-500" />
                <span className="font-medium group-data-[collapsible=icon]:hidden ml-3">Help Center</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.avatar || `https://avatar.vercel.sh/${user?.id}.png`} />
            <AvatarFallback className="bg-gradient-to-br from-green-600 to-emerald-600 text-white">
              {user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="group-data-[collapsible=icon]:hidden flex-1 min-w-0">
            <p className="font-medium text-gray-900 dark:text-white truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {user?.role || 'learner'}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="group-data-[collapsible=icon]:hidden h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Wallet className="mr-2 h-4 w-4" />
                Billing & Payments
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Preferences
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Sidebar>
  );
}

import { ThemeToggle } from './ThemeToggle';
export function AppHeader() {
  const user = authService.getCurrentUser();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <motion.header 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg px-6"
    >
      {/* Mobile Menu Trigger */}
      <div className="flex items-center gap-4 lg:hidden">
        <SidebarTrigger className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700" />
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className={`relative transition-all duration-200 ${isSearchFocused ? 'scale-105' : ''}`}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search courses, lessons, or topics..."
            className="w-full h-12 pl-12 pr-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-full text-sm focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-200"
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
          >
            3
          </Badge>
        </Button>

        {/* Wallet */}
        <Button 
          variant="ghost" 
          size="icon"
          className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Wallet className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar || `https://avatar.vercel.sh/${user?.id}.png`} />
                <AvatarFallback className="bg-gradient-to-br from-green-600 to-emerald-600 text-white">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Wallet className="mr-2 h-4 w-4" />
              Billing
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => {
                authService.logout();
                window.location.reload();
              }}
              className="text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}
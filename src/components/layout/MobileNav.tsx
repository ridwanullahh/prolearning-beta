
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, BookOpen, Users, Settings, Brain, TrendingUp } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { authService } from '@/lib/auth';

interface MobileNavProps {
  userRole: 'learner' | 'instructor' | 'super_admin';
}

const MobileNav = ({ userRole }: MobileNavProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const user = authService.getCurrentUser();

  const getNavItems = () => {
    switch (userRole) {
      case 'learner':
        return [
          { path: '/dashboard', label: 'Dashboard', icon: Home },
          { path: '/marketplace', label: 'Marketplace', icon: BookOpen },
          { path: '/my-courses', label: 'My Courses', icon: Brain },
          { path: '/progress', label: 'Progress', icon: TrendingUp },
        ];
      case 'instructor':
        return [
          { path: '/instruct', label: 'Dashboard', icon: Home },
          { path: '/instruct/courses', label: 'My Courses', icon: BookOpen },
          { path: '/instruct/students', label: 'Students', icon: Users },
          { path: '/instruct/analytics', label: 'Analytics', icon: TrendingUp },
        ];
      case 'super_admin':
        return [
          { path: '/super-admin', label: 'Dashboard', icon: Home },
          { path: '/super-admin/users', label: 'Users', icon: Users },
          { path: '/super-admin/courses', label: 'Courses', icon: BookOpen },
          { path: '/super-admin/analytics', label: 'Analytics', icon: TrendingUp },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-white">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <div className="flex flex-col h-full bg-gradient-to-b from-blue-600 to-indigo-700">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">ProLearning</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-blue-100 text-sm mt-2">Welcome, {user?.name}</p>
            </div>
            
            <nav className="flex-1 px-4 py-6">
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'text-blue-100 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>
            
            <div className="p-4 border-t border-white/10">
              <Button
                variant="ghost"
                className="w-full justify-start text-blue-100 hover:bg-white/10 hover:text-white"
                onClick={() => {
                  authService.logout();
                  setIsOpen(false);
                }}
              >
                <Settings className="mr-3 h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileNav;


import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu, 
  BookOpen, 
  Brain, 
  User, 
  Settings, 
  LogOut,
  Home,
  ShoppingBag,
  GraduationCap,
  Users
} from 'lucide-react';
import { authService } from '@/lib/auth';

const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const user = authService.getCurrentUser();

  const learnerNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/courses', label: 'My Courses', icon: BookOpen },
    { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  ];

  const instructorNavItems = [
    { href: '/instruct', label: 'Dashboard', icon: Home },
    { href: '/instruct/courses', label: 'My Courses', icon: BookOpen },
    { href: '/instruct/create', label: 'Create Course', icon: Brain },
    { href: '/instruct/students', label: 'Students', icon: Users },
  ];

  const navItems = user?.role === 'instructor' ? instructorNavItems : learnerNavItems;

  const handleLogout = () => {
    authService.logout();
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 p-4 border-b">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">ProLearning</h2>
              <p className="text-sm text-muted-foreground">{user?.name}</p>
            </div>
          </div>

          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="p-4 border-t space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setOpen(false)}
            >
              <User className="h-4 w-4 mr-3" />
              Profile
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setOpen(false)}
            >
              <Settings className="h-4 w-4 mr-3" />
              Settings
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;


import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Home, BookOpen, MessageSquare, HelpCircle, User } from 'lucide-react';
import { authService } from '@/lib/auth';

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = authService.getCurrentUser();

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMenu}
        className="p-2"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white shadow-lg border-t z-50">
          <div className="p-4 space-y-2">
            <Link
              to="/"
              className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            
            <Link
              to="/marketplace"
              className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <BookOpen className="h-4 w-4" />
              <span>Courses</span>
            </Link>

            <Link
              to="/blog"
              className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Blog</span>
            </Link>

            <Link
              to="/help"
              className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <HelpCircle className="h-4 w-4" />
              <span>Help</span>
            </Link>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    authService.logout();
                    setIsOpen(false);
                  }}
                  className="w-full justify-start"
                >
                  Logout
                </Button>
              </>
            ) : (
              <div className="space-y-2 pt-2 border-t">
                <Link to="/auth/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link to="/auth/register" onClick={() => setIsOpen(false)}>
                  <Button size="sm" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileNav;

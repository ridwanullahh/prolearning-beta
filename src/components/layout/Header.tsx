import { Button } from '@/components/ui/button';
import { GraduationCap, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 50 }}
      className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-900/80"
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-green-500" />
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            ProLearning
          </span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <NavLink href="/marketplace">Marketplace</NavLink>
          <NavLink href="/features">Features</NavLink>
          <NavLink href="/blog">Blog</NavLink>
          <NavLink href="/contact">Contact</NavLink>
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Button variant="ghost" asChild>
            <Link to="/auth/login">Sign In</Link>
          </Button>
          <Button
            asChild
            className="rounded-2xl bg-green-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600"
          >
            <Link to="/auth/register">Get Started</Link>
          </Button>
        </div>
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden"
        >
          <div className="flex flex-col items-center space-y-4 p-4">
            <NavLink href="/marketplace">Marketplace</NavLink>
            <NavLink href="/features">Features</NavLink>
            <NavLink href="/blog">Blog</NavLink>
            <NavLink href="/contact">Contact</NavLink>
            <div className="flex w-full flex-col space-y-2">
              <ThemeToggle />
              <Button variant="outline" asChild>
                <Link to="/auth/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/auth/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

const NavLink: React.FC<{ href: string; children: React.ReactNode }> = ({
  href,
  children,
}) => {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (href.startsWith('#')) {
    return (
      <a
        href={href}
        onClick={(e) => {
          e.preventDefault();
          scrollTo(href.substring(1));
        }}
        className="font-medium text-gray-600 transition-colors hover:text-green-500 dark:text-gray-300 dark:hover:text-green-400"
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      to={href}
      className="font-medium text-gray-600 transition-colors hover:text-green-500 dark:text-gray-300 dark:hover:text-green-400"
    >
      {children}
    </Link>
  );
};

export default Header;
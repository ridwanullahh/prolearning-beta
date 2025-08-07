import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Menu, Search, X, AlignJustify, BookOpen, Users, Clock, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { db } from '@/lib/github-sdk';

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const [courses, instructors] = await Promise.all([
        db.get('courses'),
        db.get('users')
      ]);

      const filteredCourses = courses.filter((course: any) =>
        course.title.toLowerCase().includes(query.toLowerCase()) ||
        course.description.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);

      const filteredInstructors = instructors.filter((user: any) =>
        user.role === 'instructor' &&
        user.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 3);

      setSearchResults([
        ...filteredCourses.map((course: any) => ({ ...course, type: 'course' })),
        ...filteredInstructors.map((instructor: any) => ({ ...instructor, type: 'instructor' }))
      ]);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 50 }}
      className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/95 shadow-sm"
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-green-500" />
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            ProLearning
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 lg:flex">
          <NavLink href="/marketplace">Marketplace</NavLink>
          <NavLink href="/features">Features</NavLink>
          <NavLink href="/blog">Blog</NavLink>
          <NavLink href="/contact">Contact</NavLink>
          <NavLink href="/become-instructor">Become an Instructor</NavLink>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-2xl">
                <Search className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-96">
              <SheetHeader>
                <SheetTitle>Search Courses & Instructors</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search courses, instructors, topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 rounded-2xl"
                  />
                </div>

                <div className="mt-6">
                  {isSearching && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Searching...</p>
                    </div>
                  )}

                  {!isSearching && searchResults.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Search Results</h4>
                      {searchResults.map((result, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                          onClick={() => {
                            if (result.type === 'course') {
                              navigate(`/course/${result.id}`);
                            }
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                              {result.type === 'course' ? (
                                <BookOpen className="w-5 h-5 text-white" />
                              ) : (
                                <Users className="w-5 h-5 text-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-gray-900 dark:text-white truncate">
                                {result.type === 'course' ? result.title : result.name}
                              </h5>
                              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                {result.type === 'course' ? result.description : `Instructor • ${result.email}`}
                              </p>
                              {result.type === 'course' && (
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {result.price > 0 ? `$${result.price}` : 'Free'}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!isSearching && searchQuery && searchResults.length === 0 && (
                    <div className="text-center py-8">
                      <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">No results found for "{searchQuery}"</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try different keywords</p>
                    </div>
                  )}

                  {!searchQuery && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Quick Actions</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" size="sm" className="rounded-2xl" onClick={() => navigate('/marketplace')}>
                          <BookOpen className="w-4 h-4 mr-2" />
                          Browse Courses
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-2xl" onClick={() => navigate('/become-instructor')}>
                          <Users className="w-4 h-4 mr-2" />
                          Teach
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <ThemeToggle />
          <Button variant="ghost" asChild className="rounded-2xl">
            <Link to="/auth/login">Sign In</Link>
          </Button>
          <Button
            asChild
            className="rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-6 py-3 font-semibold text-white transition-all duration-200 shadow-lg shadow-green-600/25"
          >
            <Link to="/auth/register">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-2 lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-2xl">
                <Search className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Search</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 rounded-2xl"
                  />
                </div>

                <div className="mt-4">
                  {searchResults.length > 0 && (
                    <div className="space-y-2">
                      {searchResults.slice(0, 3).map((result, index) => (
                        <div
                          key={index}
                          className="p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                          onClick={() => {
                            if (result.type === 'course') {
                              navigate(`/course/${result.id}`);
                            }
                          }}
                        >
                          <div className="font-medium text-sm truncate">{result.title || result.name}</div>
                          <div className="text-xs text-gray-500 truncate">{result.description || 'Instructor'}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-2xl">
                <AlignJustify className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col gap-6 pt-6">
                <nav className="flex flex-col gap-4">
                  <NavLink href="/marketplace">Marketplace</NavLink>
                  <NavLink href="/features">Features</NavLink>
                  <NavLink href="/blog">Blog</NavLink>
                  <NavLink href="/contact">Contact</NavLink>
                  <NavLink href="/become-instructor">Become an Instructor</NavLink>
                </nav>
                <div className="flex flex-col gap-3 pt-6 border-t">
                  <Button variant="outline" asChild className="rounded-2xl">
                    <Link to="/auth/login">Sign In</Link>
                  </Button>
                  <Button asChild className="rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                    <Link to="/auth/register">Get Started</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

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
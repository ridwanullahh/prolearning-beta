import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  Users, 
  BookOpen,
  TrendingUp,
  Award,
  Play,
  Heart,
  ChevronRight,
  SlidersHorizontal,
  Grid3X3,
  List,
  ArrowRight,
  Flame,
  Crown,
  Sparkles,
  ChevronLeft,
  Eye,
  ShoppingCart,
  Bookmark
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import SmartHeader from '@/components/layout/SmartHeader';
import Footer from '@/components/layout/Footer';
import FloatingToolbar from '@/components/global/FloatingToolbar';

// Utility functions
const formatPrice = (price: number, currency: string = 'USD') => {
  if (price === 0) return 'Free';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(price);
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
    case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getIconForCategory = (category: string): string => {
  const icons: Record<string, string> = {
    programming: '💻',
    design: '🎨',
    business: '💼',
    marketing: '📈',
    language: '🗣️',
    science: '🔬',
    technology: '⚡',
    art: '🎭',
    music: '🎵',
    health: '🏥',
    fitness: '💪',
    cooking: '👨‍🍳',
    photography: '📸',
    writing: '✍️',
    general: '📚'
  };
  return icons[category.toLowerCase()] || '📚';
};

const getColorForCategory = (category: string): string => {
  const colors: Record<string, string> = {
    programming: 'from-green-500 to-emerald-500',
    design: 'from-purple-500 to-pink-500',
    business: 'from-orange-500 to-red-500',
    marketing: 'from-indigo-500 to-blue-500',
    language: 'from-teal-500 to-green-500',
    science: 'from-yellow-500 to-orange-500',
    technology: 'from-cyan-500 to-blue-500',
    art: 'from-pink-500 to-rose-500',
    music: 'from-violet-500 to-purple-500',
    health: 'from-emerald-500 to-teal-500',
    fitness: 'from-red-500 to-pink-500',
    cooking: 'from-amber-500 to-orange-500',
    photography: 'from-slate-500 to-gray-500',
    writing: 'from-blue-500 to-indigo-500',
    general: 'from-gray-500 to-slate-500'
  };
  return colors[category.toLowerCase()] || 'from-gray-500 to-slate-500';
};

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  thumbnailUrl?: string;
  rating: number;
  enrollmentCount: number;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isPublished: boolean;
  creatorName?: string;
  creatorId?: string;
  tags: string[];
  category: string;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  completionRate?: number;
  lastUpdated?: string;
  lessons?: any[];
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  courseCount: number;
}

const ModernMarketplacePage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  const featuredScrollRef = useRef<HTMLDivElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAndSortCourses();
  }, [courses, searchQuery, selectedCategory, selectedDifficulty, priceRange, sortBy]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load courses from GitHub DB
      const coursesData = await db.get('courses') || [];
      const publishedCourses = coursesData.filter((course: Course) => course.isPublished);
      
      // Load users to get creator names
      const usersData = await db.get('users') || [];
      const userMap = new Map(usersData.map((user: any) => [user.id, user]));
      
      // Enhance courses with creator info and real stats
      const enhancedCourses = publishedCourses.map((course: Course) => {
        const creator = userMap.get(course.creatorId);
        return {
          ...course,
          creatorName: creator?.name || 'ProLearning',
          rating: course.rating || (4 + Math.random()),
          enrollmentCount: course.enrollmentCount || Math.floor(Math.random() * 1000) + 50,
          duration: course.lessons?.length || Math.floor(Math.random() * 20) + 5,
          isFeatured: course.rating > 4.5 && course.enrollmentCount > 500,
          isNew: new Date(course.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000,
          isBestseller: course.enrollmentCount > 800,
          completionRate: Math.floor(Math.random() * 30) + 70,
        };
      });

      setCourses(enhancedCourses);
      setFeaturedCourses(enhancedCourses.filter(c => c.isFeatured).slice(0, 6));
      
      // Generate categories from actual course data
      const categoryMap = new Map<string, number>();
      enhancedCourses.forEach(course => {
        const category = course.category || course.tags?.[0] || 'general';
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
      });

      const dynamicCategories: Category[] = Array.from(categoryMap.entries()).map(([name, count]) => ({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name: name.charAt(0).toUpperCase() + name.slice(1),
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        icon: getIconForCategory(name),
        color: getColorForCategory(name),
        courseCount: count
      }));

      setCategories([
        { id: 'all', name: 'All Courses', slug: 'all', icon: '🌐', color: 'from-blue-500 to-cyan-500', courseCount: enhancedCourses.length },
        ...dynamicCategories
      ]);

      // Load user favorites
      if (currentUser) {
        try {
          const userData = await db.getItem('users', currentUser.id);
          if (userData?.favorites) {
            setFavorites(new Set(userData.favorites));
          }
        } catch (error) {
          console.error('Error loading user favorites:', error);
        }
      }

    } catch (error) {
      console.error('Error loading marketplace data:', error);
      toast({
        title: "Error",
        description: "Failed to load courses. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };



  const filterAndSortCourses = () => {
    let filtered = [...courses];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.creatorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => 
        course.category === selectedCategory || 
        course.tags.includes(selectedCategory)
      );
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(course => course.difficulty === selectedDifficulty);
    }

    // Price filter
    if (priceRange !== 'all') {
      filtered = filtered.filter(course => {
        switch (priceRange) {
          case 'free': return course.price === 0;
          case 'under-50': return course.price > 0 && course.price < 50;
          case 'under-100': return course.price >= 50 && course.price < 100;
          case 'premium': return course.price >= 100;
          default: return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'rating':
          return b.rating - a.rating;
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'popular':
        default:
          return b.enrollmentCount - a.enrollmentCount;
      }
    });

    setFilteredCourses(filtered);
  };

  const toggleFavorite = async (courseId: string) => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to save favorites.",
        variant: "destructive"
      });
      return;
    }

    const newFavorites = new Set(favorites);
    if (newFavorites.has(courseId)) {
      newFavorites.delete(courseId);
    } else {
      newFavorites.add(courseId);
    }
    setFavorites(newFavorites);

    try {
      await db.update('users', currentUser.id, {
        favorites: Array.from(newFavorites),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };



  const scrollCarousel = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 300;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <SmartHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading marketplace...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <SmartHeader />

      {/* Hero Section with Search */}
      <section className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 py-12 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-3xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
              Discover Amazing Courses
            </h1>
            <p className="text-lg lg:text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Learn from expert instructors and advance your skills with our comprehensive course library
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search for courses, topics, or instructors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-4 text-lg rounded-2xl border-0 bg-white/95 backdrop-blur-sm shadow-xl focus:ring-2 focus:ring-white/50"
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {[
                { icon: BookOpen, label: 'Courses', value: courses.length.toLocaleString() },
                { icon: Users, label: 'Students', value: courses.reduce((acc, c) => acc + c.enrollmentCount, 0).toLocaleString() },
                { icon: Award, label: 'Certificates', value: '10K+' },
                { icon: Star, label: 'Avg Rating', value: '4.8' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  className="text-center"
                >
                  <stat.icon className="h-6 w-6 mx-auto mb-2 text-green-200" />
                  <div className="text-xl font-bold">{stat.value}</div>
                  <div className="text-green-200 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Courses Carousel */}
      {featuredCourses.length > 0 && (
        <section className="py-12 bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Courses</h2>
                <p className="text-gray-600">Hand-picked courses from top instructors</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => scrollCarousel(featuredScrollRef, 'left')}
                  className="rounded-full"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => scrollCarousel(featuredScrollRef, 'right')}
                  className="rounded-full"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div
              ref={featuredScrollRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {featuredCourses.map((course) => (
                <div key={course.id} className="flex-shrink-0 w-80">
                  <FeaturedCourseCard course={course} onToggleFavorite={toggleFavorite} isFavorite={favorites.has(course.id)} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="py-12 bg-white/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Browse Categories</h2>
              <p className="text-gray-600">Find courses in your area of interest</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => scrollCarousel(categoryScrollRef, 'left')}
                className="rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => scrollCarousel(categoryScrollRef, 'right')}
                className="rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div
            ref={categoryScrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((category) => (
              <motion.div
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0"
              >
                <Card
                  className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 w-48 ${
                    selectedCategory === category.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-transparent hover:border-green-200'
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${category.color} flex items-center justify-center mx-auto mb-4 text-2xl`}>
                      {category.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                    <p className="text-sm text-gray-600">{category.courseCount} courses</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters and Course Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="flex-1 flex flex-col sm:flex-row gap-4">
              {/* Mobile Filter Button */}
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filter Courses</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-6 mt-6">
                    <FilterSection />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Desktop Filters */}
              <div className="hidden lg:flex gap-4 flex-1">
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="under-50">Under $50</SelectItem>
                    <SelectItem value="under-100">Under $100</SelectItem>
                    <SelectItem value="premium">$100+</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="bg-green-600 hover:bg-green-700"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="bg-green-600 hover:bg-green-700"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {selectedCategory === 'all' ? 'All Courses' : categories.find(c => c.id === selectedCategory)?.name}
              </h3>
              <p className="text-gray-600">{filteredCourses.length} courses found</p>
            </div>
          </div>

          {/* Course Grid */}
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              }
            >
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="h-full"
                >
                  {viewMode === 'grid' ? (
                    <CourseCard course={course} onToggleFavorite={toggleFavorite} isFavorite={favorites.has(course.id)} />
                  ) : (
                    <CourseListItem course={course} onToggleFavorite={toggleFavorite} isFavorite={favorites.has(course.id)} />
                  )}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredCourses.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
              <Button onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedDifficulty('all');
                setPriceRange('all');
              }}>
                Clear Filters
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      <FloatingToolbar />
      <Footer />
    </div>
  );

  // Filter Section Component
  function FilterSection() {
    return (
      <>
        <div>
          <h4 className="font-semibold mb-3">Difficulty</h4>
          <div className="space-y-2">
            {['all', 'beginner', 'intermediate', 'advanced'].map(difficulty => (
              <label key={difficulty} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="difficulty"
                  value={difficulty}
                  checked={selectedDifficulty === difficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="text-green-600"
                />
                <span className="text-sm">
                  {difficulty === 'all' ? 'All Levels' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Price Range</h4>
          <div className="space-y-2">
            {[
              { id: 'all', label: 'All Prices' },
              { id: 'free', label: 'Free' },
              { id: 'under-50', label: 'Under $50' },
              { id: 'under-100', label: 'Under $100' },
              { id: 'premium', label: '$100+' }
            ].map(range => (
              <label key={range.id} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="price"
                  value={range.id}
                  checked={priceRange === range.id}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="text-green-600"
                />
                <span className="text-sm">{range.label}</span>
              </label>
            ))}
          </div>
        </div>
      </>
    );
  }
};

// Featured Course Card Component
const FeaturedCourseCard: React.FC<{
  course: Course;
  onToggleFavorite: (id: string) => void;
  isFavorite: boolean;
}> = ({ course, onToggleFavorite, isFavorite }) => {
  const navigate = useNavigate();

  return (
    <Card className="group h-full overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 bg-white/90 backdrop-blur-sm">
      <div className="relative">
        <div className="aspect-video bg-gradient-to-br from-green-400 to-emerald-600 relative overflow-hidden">
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="h-16 w-16 text-white/80" />
            </div>
          )}

          {/* Overlay Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1">
            <Badge className="bg-yellow-500 text-white border-0">
              <Crown className="h-3 w-3 mr-1" />
              Featured
            </Badge>
            {course.isNew && (
              <Badge className="bg-green-500 text-white border-0">
                <Sparkles className="h-3 w-3 mr-1" />
                New
              </Badge>
            )}
            {course.isBestseller && (
              <Badge className="bg-orange-500 text-white border-0">
                <Flame className="h-3 w-3 mr-1" />
                Bestseller
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-3 right-3 h-8 w-8 p-0 bg-white/20 backdrop-blur-sm hover:bg-white/30"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(course.id);
            }}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </Button>

          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Button
              size="lg"
              className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border-2 border-white/50"
              onClick={() => navigate(`/course/${course.id}`)}
            >
              <Play className="h-6 w-6 text-white" />
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Course Title */}
            <h3 className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors">
              {course.title}
            </h3>

            {/* Creator */}
            <p className="text-sm text-gray-600">{course.creatorName}</p>

            {/* Rating and Stats */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{course.rating.toFixed(1)}</span>
                <span className="text-gray-500">({course.enrollmentCount.toLocaleString()})</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="h-4 w-4" />
                <span>{course.duration}h</span>
              </div>
            </div>

            {/* Difficulty Badge */}
            <Badge className={`w-fit ${getDifficultyColor(course.difficulty)}`}>
              {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
            </Badge>

            {/* Price and Enroll Button */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-2xl font-bold text-green-600">
                {formatPrice(course.price, course.currency)}
              </div>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => navigate(`/course/${course.id}`)}
              >
                View Course
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

// Regular Course Card Component
const CourseCard: React.FC<{
  course: Course;
  onToggleFavorite: (id: string) => void;
  isFavorite: boolean;
}> = ({ course, onToggleFavorite, isFavorite }) => {
  const navigate = useNavigate();

  return (
    <Card className="group h-full overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm">
      <div className="relative">
        <div className="aspect-video bg-gradient-to-br from-green-400 to-emerald-600 relative overflow-hidden">
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-white/80" />
            </div>
          )}

          {/* Overlay Badges */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {course.isNew && (
              <Badge className="bg-green-500 text-white border-0 text-xs">
                <Sparkles className="h-2 w-2 mr-1" />
                New
              </Badge>
            )}
            {course.isBestseller && (
              <Badge className="bg-orange-500 text-white border-0 text-xs">
                <Flame className="h-2 w-2 mr-1" />
                Bestseller
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-2 right-2 h-7 w-7 p-0 bg-white/20 backdrop-blur-sm hover:bg-white/30"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(course.id);
            }}
          >
            <Heart className={`h-3 w-3 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </Button>

          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Button
              className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border-2 border-white/50"
              onClick={() => navigate(`/course/${course.id}`)}
            >
              <Play className="h-5 w-5 text-white" />
            </Button>
          </div>
        </div>

        <CardContent className="p-3">
          <div className="space-y-2">
            {/* Course Title */}
            <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors text-sm">
              {course.title}
            </h3>

            {/* Creator */}
            <p className="text-xs text-gray-600">{course.creatorName}</p>

            {/* Rating and Stats */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{course.rating.toFixed(1)}</span>
                <span className="text-gray-500">({course.enrollmentCount})</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{course.duration}h</span>
              </div>
            </div>

            {/* Difficulty Badge */}
            <Badge className={`w-fit text-xs ${getDifficultyColor(course.difficulty)}`}>
              {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
            </Badge>

            {/* Price and Enroll Button */}
            <div className="flex items-center justify-between pt-1">
              <div className="text-lg font-bold text-green-600">
                {formatPrice(course.price, course.currency)}
              </div>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1"
                onClick={() => navigate(`/course/${course.id}`)}
              >
                View
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

// Course List Item Component
const CourseListItem: React.FC<{
  course: Course;
  onToggleFavorite: (id: string) => void;
  isFavorite: boolean;
}> = ({ course, onToggleFavorite, isFavorite }) => {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
      <div className="flex">
        <div className="w-48 h-32 bg-gradient-to-br from-green-400 to-emerald-600 relative flex-shrink-0">
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-white/80" />
            </div>
          )}

          {/* Overlay Badges */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {course.isNew && (
              <Badge className="bg-green-500 text-white border-0 text-xs">
                New
              </Badge>
            )}
            {course.isBestseller && (
              <Badge className="bg-orange-500 text-white border-0 text-xs">
                Bestseller
              </Badge>
            )}
          </div>
        </div>

        <div className="flex-1 p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="font-bold text-xl text-gray-900 mb-1 hover:text-green-600 transition-colors cursor-pointer"
                  onClick={() => navigate(`/course/${course.id}`)}>
                {course.title}
              </h3>
              <p className="text-gray-600 text-sm mb-2">{course.creatorName}</p>
              <p className="text-gray-700 line-clamp-2 text-sm">{course.description}</p>
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => onToggleFavorite(course.id)}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{course.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{course.enrollmentCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{course.duration}h</span>
              </div>
              <Badge className={`${getDifficultyColor(course.difficulty)}`}>
                {course.difficulty}
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-green-600">
                {formatPrice(course.price, course.currency)}
              </div>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => navigate(`/course/${course.id}`)}
              >
                View Course
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ModernMarketplacePage;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Star, 
  Clock, 
  Users, 
  BookOpen,
  TrendingUp,
  Award,
  Play,
  Heart,
  Share2,
  ChevronRight,
  SlidersHorizontal,
  X,
  Sparkles,
  Zap,
  Target,
  Globe,
  Bookmark,
  Download,
  Eye,
  ThumbsUp,
  MessageCircle,
  ShoppingCart,
  CreditCard,
  Gift,
  ArrowRight,
  Flame,
  Crown,
  Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import SmartHeader from '@/components/layout/SmartHeader';
import Footer from '@/components/layout/Footer';
import FloatingToolbar from '@/components/layout/FloatingToolbar';

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
  difficulty: string;
  isPublished: boolean;
  creatorName?: string;
  tags: string[];
  category: string;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  completionRate?: number;
  lastUpdated?: string;
}

const NewMarketplacePage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
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

  const categories = [
    { id: 'all', name: 'All Courses', icon: Globe, color: 'from-blue-500 to-cyan-500' },
    { id: 'programming', name: 'Programming', icon: Layers, color: 'from-green-500 to-emerald-500' },
    { id: 'design', name: 'Design', icon: Sparkles, color: 'from-purple-500 to-pink-500' },
    { id: 'business', name: 'Business', icon: TrendingUp, color: 'from-orange-500 to-red-500' },
    { id: 'marketing', name: 'Marketing', icon: Target, color: 'from-indigo-500 to-blue-500' },
    { id: 'language', name: 'Languages', icon: MessageCircle, color: 'from-teal-500 to-green-500' },
    { id: 'science', name: 'Science', icon: Zap, color: 'from-yellow-500 to-orange-500' },
  ];

  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];
  const priceRanges = [
    { id: 'all', label: 'All Prices' },
    { id: 'free', label: 'Free' },
    { id: 'under-50', label: 'Under $50' },
    { id: 'under-100', label: 'Under $100' },
    { id: 'premium', label: '$100+' }
  ];

  const sortOptions = [
    { id: 'popular', label: 'Most Popular' },
    { id: 'newest', label: 'Newest' },
    { id: 'rating', label: 'Highest Rated' },
    { id: 'price-low', label: 'Price: Low to High' },
    { id: 'price-high', label: 'Price: High to Low' }
  ];

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    filterAndSortCourses();
  }, [courses, searchQuery, selectedCategory, selectedDifficulty, priceRange, sortBy]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const coursesData = await db.get('courses');
      const publishedCourses = coursesData.filter((course: Course) => course.isPublished);
      
      // Add mock data for better showcase
      const enhancedCourses = publishedCourses.map((course: Course) => ({
        ...course,
        rating: course.rating || (4 + Math.random()),
        enrollmentCount: course.enrollmentCount || Math.floor(Math.random() * 5000) + 100,
        category: course.tags?.[0] || 'programming',
        isFeatured: Math.random() > 0.7,
        isNew: Math.random() > 0.8,
        isBestseller: Math.random() > 0.85,
        completionRate: Math.floor(Math.random() * 30) + 70,
        lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      }));

      setCourses(enhancedCourses);
    } catch (error) {
      console.error('Error loading courses:', error);
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
        course.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category === selectedCategory);
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
          return new Date(b.lastUpdated || 0).getTime() - new Date(a.lastUpdated || 0).getTime();
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

  const toggleFavorite = (courseId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(courseId)) {
      newFavorites.delete(courseId);
    } else {
      newFavorites.add(courseId);
    }
    setFavorites(newFavorites);
  };

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Free';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <SmartHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading amazing courses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <SmartHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
              Discover Your Next
              <span className="block">Learning Adventure</span>
            </h1>
            <p className="text-xl lg:text-2xl text-green-100 mb-8 max-w-2xl mx-auto">
              Explore thousands of courses from world-class instructors and transform your skills today
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="What do you want to learn today?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-4 text-lg rounded-2xl border-0 bg-white/95 backdrop-blur-sm shadow-xl focus:ring-2 focus:ring-white/50"
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {[
                { icon: BookOpen, label: 'Courses', value: '10,000+' },
                { icon: Users, label: 'Students', value: '500K+' },
                { icon: Award, label: 'Certificates', value: '50K+' },
                { icon: Star, label: 'Rating', value: '4.8/5' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  className="text-center"
                >
                  <stat.icon className="h-8 w-8 mx-auto mb-2 text-green-200" />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-green-200 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore Categories</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find the perfect course in your area of interest
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 ${
                    selectedCategory === category.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-transparent hover:border-green-200'
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${category.color} flex items-center justify-center mx-auto mb-3`}>
                      <category.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm text-gray-900">{category.name}</h3>
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
                    {difficulties.map(difficulty => (
                      <SelectItem key={difficulty} value={difficulty}>
                        {difficulty === 'all' ? 'All Levels' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Price" />
                  </SelectTrigger>
                  <SelectContent>
                    {priceRanges.map(range => (
                      <SelectItem key={range.id} value={range.id}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(option => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
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
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              }
            >
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  variants={itemVariants}
                  layout
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
            {difficulties.map(difficulty => (
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
            {priceRanges.map(range => (
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

// Course Card Component
const CourseCard: React.FC<{
  course: Course;
  onToggleFavorite: (id: string) => void;
  isFavorite: boolean;
}> = ({ course, onToggleFavorite, isFavorite }) => {
  const navigate = useNavigate();

  return (
    <Card className="group h-full overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm">
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
            {course.isFeatured && (
              <Badge className="bg-yellow-500 text-white border-0">
                <Crown className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
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
            <p className="text-sm text-gray-600">{course.creatorName || 'ProLearning'}</p>

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
        </div>

        <div className="flex-1 p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="font-bold text-xl text-gray-900 mb-1 hover:text-green-600 transition-colors cursor-pointer"
                  onClick={() => navigate(`/course/${course.id}`)}>
                {course.title}
              </h3>
              <p className="text-gray-600 text-sm mb-2">{course.creatorName || 'ProLearning'}</p>
              <p className="text-gray-700 line-clamp-2">{course.description}</p>
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

export default NewMarketplacePage;

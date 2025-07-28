import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import {
  Search,
  BookOpen,
  Star,
  Users,
  Clock,
  Award,
  Heart,
  ChevronRight,
  Grid3X3,
  List,
  SlidersHorizontal,
  X,
  Zap,
  Palette,
  BarChart3,
  Layers3
} from 'lucide-react';
import { db } from '../../lib/github-sdk';
import { authService } from '../../lib/auth';
import { useToast } from '../../hooks/use-toast';
import { Course, Subject, AcademicLevel } from '../../lib/types';

const MarketplacePage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  const [academicLevels, setAcademicLevels] = useState<AcademicLevel[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = authService.getCurrentUser();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchQuery, selectedCategory, selectedLevel, priceFilter, sortBy]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allCourses, levels, allSubjects] = await Promise.all([
        db.get('courses'),
        db.get('academicLevels'),
        db.get('subjects')
      ]);
      
      const publishedCourses = allCourses.filter(course => course.isPublished);
      const uniqueCategories = [...new Set(allSubjects.map(s => s.category).filter(Boolean))];

      setCourses(publishedCourses);
      setAcademicLevels(levels);
      setSubjects(allSubjects);
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error loading marketplace data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load courses',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => {
        const subject = subjects.find(s => s.id === course.subjectId);
        return subject?.category === selectedCategory;
      });
    }
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(course => course.academicLevelId === selectedLevel);
    }
    if (priceFilter !== 'all') {
      switch (priceFilter) {
        case 'free':
          filtered = filtered.filter(course => !course.price || course.price === 0);
          break;
        case 'paid':
          filtered = filtered.filter(course => course.price && course.price > 0);
          break;
        case 'under_25':
          filtered = filtered.filter(course => course.price && course.price < 25);
          break;
        case '25_100':
          filtered = filtered.filter(course => course.price && course.price >= 25 && course.price <= 100);
          break;
        case 'over_100':
          filtered = filtered.filter(course => course.price && course.price > 100);
          break;
      }
    }
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.enrollmentCount || 0) - (a.enrollmentCount || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
    setFilteredCourses(filtered);
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free';
    return `$${price.toFixed(2)}`;
  };

  const getLevelName = (levelId: string) => academicLevels.find(l => l.id === levelId)?.name || 'N/A';
  const getSubjectCategory = (subjectId: string) => subjects.find(s => s.id === subjectId)?.category || 'N/A';

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Loading Amazing Courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 50, damping: 15 }}
        className="bg-white dark:bg-gray-900/80 backdrop-blur-lg shadow-sm border-b dark:border-gray-800 sticky top-0 z-20"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                  Course Marketplace
                </span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                Explore thousands of courses to fuel your curiosity.
              </p>
            </div>
            <div className="relative w-full md:w-auto md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 w-full bg-gray-100 dark:bg-gray-800 border-transparent focus:ring-2 focus:ring-green-500 focus:border-transparent rounded-full"
              />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '-100%', opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                onClick={() => setShowFilters(false)}
              />
            )}
            <motion.aside
              className={`fixed lg:sticky top-0 lg:top-24 h-full lg:h-auto w-80 bg-white dark:bg-gray-900 shadow-xl lg:shadow-none p-6 z-40 transform ${
                showFilters ? 'translate-x-0' : '-translate-x-full'
              } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
            >
              <div className="flex items-center justify-between mb-6 lg:mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-green-500"/>
                  Filters
                </h2>
                <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setShowFilters(false)}>
                  <X />
                </Button>
              </div>
              <div className="space-y-6">
                <FilterSelect icon={Layers3} label="Category" value={selectedCategory} onValueChange={setSelectedCategory} options={[{value: 'all', label: 'All Categories'}, ...categories.map(c => ({value: c, label: c}))]} />
                <FilterSelect icon={BarChart3} label="Level" value={selectedLevel} onValueChange={setSelectedLevel} options={[{value: 'all', label: 'All Levels'}, ...academicLevels.map(l => ({value: l.id, label: l.name}))]} />
                <FilterSelect icon={Palette} label="Price" value={priceFilter} onValueChange={setPriceFilter} options={[
                  {value: 'all', label: 'All Prices'},
                  {value: 'free', label: 'Free'},
                  {value: 'under_25', label: 'Under $25'},
                  {value: '25_100', label: '$25 - $100'},
                  {value: 'over_100', label: 'Over $100'},
                ]}/>
              </div>
            </motion.aside>
          </AnimatePresence>

          {/* Main Content */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="outline"
                className="lg:hidden"
                onClick={() => setShowFilters(true)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <p className="text-gray-600 dark:text-gray-400 hidden lg:block">
                {filteredCourses.length} amazing course{filteredCourses.length !== 1 ? 's' : ''} found
              </p>
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 rounded-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')} className="rounded-full"><Grid3X3/></Button>
                <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')} className="rounded-full"><List/></Button>
              </div>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              {filteredCourses.map(course => (
                <motion.div variants={itemVariants} key={course.id}>
                  {viewMode === 'grid'
                    ? <CourseCard course={course} getLevelName={getLevelName} getSubjectCategory={getSubjectCategory} formatPrice={formatPrice} />
                    : <CourseListItem course={course} getLevelName={getLevelName} getSubjectCategory={getSubjectCategory} formatPrice={formatPrice} />
                  }
                </motion.div>
              ))}
            </motion.div>

            {filteredCourses.length === 0 && (
              <div className="text-center py-20">
                <BookOpen className="h-16 w-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2">No Courses Found</h3>
                <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters to discover new opportunities!</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

const FilterSelect = ({ icon: Icon, label, value, onValueChange, options }: { icon: React.ElementType, label: string, value: string, onValueChange: (value: string) => void, options: { value: string, label: string }[] }) => (
  <div>
    <label className="text-sm font-semibold mb-2 block flex items-center gap-2 text-gray-800 dark:text-gray-200">
      <Icon className="h-4 w-4 text-gray-500"/>
      {label}
    </label>
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full rounded-full bg-gray-100 dark:bg-gray-800 border-transparent">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map(opt => (
          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const CourseCard = ({ course, getLevelName, getSubjectCategory, formatPrice }: { course: Course, getLevelName: (levelId: string) => string, getSubjectCategory: (subjectId: string) => string, formatPrice: (price: number) => string }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);

  return (
    <Card
      className="group overflow-hidden rounded-2xl h-full flex flex-col transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 border-transparent bg-white dark:bg-gray-800/50"
      onClick={() => navigate(`/course/${course.id}`)}
    >
      <div className="aspect-video relative">
        <img
          src={course.thumbnailUrl || `https://source.unsplash.com/random/400x225?${course.title.split(' ')[0]}`}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
          onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}
        >
          <Heart className={`h-5 w-5 ${isLiked ? 'text-red-500 fill-current' : ''}`} />
        </Button>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-bold text-lg text-white line-clamp-2">{course.title}</h3>
        </div>
      </div>

      <CardContent className="p-4 flex-grow flex flex-col">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
          <Badge variant="outline" className="capitalize">{getSubjectCategory(course.subjectId)}</Badge>
          <Badge variant="outline">{getLevelName(course.academicLevelId)}</Badge>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 flex-grow">{course.description}</p>
        
        <Separator className="my-3" />

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1"><Users className="h-4 w-4"/>{course.enrollmentCount || 0}</div>
          <div className="flex items-center gap-1"><Clock className="h-4 w-4"/>{course.duration}h</div>
          <div className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-400"/>{course.rating || 'New'}</div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(course.price || 0)}</p>
          <Button size="sm" className="rounded-full bg-green-500 hover:bg-green-600 text-white">
            View Details
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const CourseListItem = ({ course, getLevelName, getSubjectCategory, formatPrice }: { course: Course, getLevelName: (levelId: string) => string, getSubjectCategory: (subjectId: string) => string, formatPrice: (price: number) => string }) => {
  const navigate = useNavigate();

  return (
    <Card
      className="group transition-all duration-300 ease-in-out hover:shadow-xl hover:bg-white dark:hover:bg-gray-800/80 border-transparent bg-white/50 dark:bg-gray-800/30"
      onClick={() => navigate(`/course/${course.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-6">
          <img
            src={course.thumbnailUrl || `https://source.unsplash.com/random/200x200?${course.title.split(' ')[0]}`}
            alt={course.title}
            className="w-32 h-32 object-cover rounded-xl flex-shrink-0"
          />
          <div className="flex-grow">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize text-xs">{getSubjectCategory(course.subjectId)}</Badge>
                <Badge variant="outline" className="text-xs">{getLevelName(course.academicLevelId)}</Badge>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatPrice(course.price || 0)}</p>
            </div>
            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2 group-hover:text-green-600 transition-colors">{course.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{course.description}</p>
            <Separator className="my-3"/>
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1"><Users className="h-4 w-4"/>{course.enrollmentCount || 0} Students</div>
                <div className="flex items-center gap-1"><Clock className="h-4 w-4"/>{course.duration} hours</div>
                <div className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-400"/>{course.rating || 'New'}</div>
              </div>
              <Button size="sm" className="rounded-full">
                View Details
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketplacePage;

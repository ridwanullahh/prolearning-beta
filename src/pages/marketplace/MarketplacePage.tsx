
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Star, 
  Users, 
  Clock, 
  TrendingUp, 
  Award,
  Heart,
  Play,
  ChevronRight,
  Grid3X3,
  List,
  SlidersHorizontal
} from 'lucide-react';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const MarketplacePage = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedSchool, setSelectedSchool] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  const [academicLevels, setAcademicLevels] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [schools, setSchools] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = authService.getCurrentUser();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchQuery, selectedCategory, selectedLevel, selectedSchool, priceFilter, sortBy]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load courses
      const allCourses = await db.get('courses');
      const publishedCourses = allCourses.filter(course => course.isPublished);

      // Load academic levels and subjects for filtering
      const levels = await db.get('academicLevels');
      const allSubjects = await db.get('subjects');

      // Extract unique schools and categories
      const uniqueSchools = [...new Set(publishedCourses.map(c => c.school).filter(Boolean))];
      const uniqueCategories = [...new Set(allSubjects.map(s => s.category).filter(Boolean))];

      setCourses(publishedCourses);
      setAcademicLevels(levels);
      setSubjects(allSubjects);
      setSchools(uniqueSchools);
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

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.tags?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => {
        const subject = subjects.find(s => s.id === course.subjectId);
        return subject?.category === selectedCategory;
      });
    }

    // Academic level filter
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(course => course.academicLevelId === selectedLevel);
    }

    // School filter
    if (selectedSchool !== 'all') {
      filtered = filtered.filter(course => course.school === selectedSchool);
    }

    // Price filter
    if (priceFilter !== 'all') {
      switch (priceFilter) {
        case 'free':
          filtered = filtered.filter(course => !course.price || course.price === 0);
          break;
        case 'paid':
          filtered = filtered.filter(course => course.price && course.price > 0);
          break;
        case 'under_10':
          filtered = filtered.filter(course => course.price && course.price < 10);
          break;
        case 'under_50':
          filtered = filtered.filter(course => course.price && course.price < 50);
          break;
      }
    }

    // Sort courses
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
      case 'price_low':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_high':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
    }

    setFilteredCourses(filtered);
  };

  const formatPrice = (price: number, currency: string = 'USD') => {
    if (price === 0) return 'Free';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  const getAcademicLevelName = (levelId: string) => {
    const level = academicLevels.find(l => l.id === levelId);
    return level?.name || 'Unknown';
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.name || 'Unknown';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Course Marketplace</h1>
              <p className="text-gray-600">Discover amazing courses from expert instructors</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search courses, topics, instructors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Academic Level</label>
                  <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      {academicLevels.map(level => (
                        <SelectItem key={level.id} value={level.id}>
                          {level.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">School</label>
                  <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Schools</SelectItem>
                      {schools.map(school => (
                        <SelectItem key={school} value={school}>
                          {school}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Price</label>
                  <Select value={priceFilter} onValueChange={setPriceFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="under_10">Under $10</SelectItem>
                      <SelectItem value="under_50">Under $50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="price_low">Price: Low to High</SelectItem>
                      <SelectItem value="price_high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Course Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
              </p>
            </div>

            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
              : 'space-y-4'
            }>
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {viewMode === 'grid' ? (
                    <CourseCard course={course} getSubjectName={getSubjectName} getAcademicLevelName={getAcademicLevelName} formatPrice={formatPrice} />
                  ) : (
                    <CourseListItem course={course} getSubjectName={getSubjectName} getAcademicLevelName={getAcademicLevelName} formatPrice={formatPrice} />
                  )}
                </motion.div>
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-600">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CourseCard = ({ course, getSubjectName, getAcademicLevelName, formatPrice }: any) => {
  const navigate = useNavigate();

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm">
      <div onClick={() => navigate(`/course/${course.id}`)}>
        <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-600 rounded-t-lg relative overflow-hidden">
          {course.thumbnailUrl ? (
            <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <BookOpen className="h-12 w-12 text-white/80" />
            </div>
          )}
          <div className="absolute top-4 right-4">
            <Badge className={course.isAiGenerated ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}>
              {course.isAiGenerated ? 'AI Generated' : 'Instructor Led'}
            </Badge>
          </div>
          {course.featured && (
            <div className="absolute top-4 left-4">
              <Badge className="bg-yellow-100 text-yellow-800">
                <Award className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-6">
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline" className="text-xs">
                {getSubjectName(course.subjectId)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {getAcademicLevelName(course.academicLevelId)}
              </Badge>
            </div>
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
              {course.title}
            </h3>
            <p className="text-gray-600 text-sm mt-2 line-clamp-2">
              {course.description}
            </p>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {course.enrollmentCount || 0}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {course.duration}min
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-1 text-yellow-500" />
                {course.rating || 0}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-blue-600">
              {formatPrice(course.price || 0, course.currency)}
            </div>
            <Button size="sm" className="group-hover:bg-blue-600 group-hover:text-white transition-colors">
              View Course
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

const CourseListItem = ({ course, getSubjectName, getAcademicLevelName, formatPrice }: any) => {
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4" onClick={() => navigate(`/course/${course.id}`)}>
          <div className="w-24 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            {course.thumbnailUrl ? (
              <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <BookOpen className="h-8 w-8 text-white" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    {getSubjectName(course.subjectId)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {getAcademicLevelName(course.academicLevelId)}
                  </Badge>
                  {course.isAiGenerated && (
                    <Badge className="bg-purple-100 text-purple-800 text-xs">AI</Badge>
                  )}
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
                  {course.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                  {course.description}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {course.enrollmentCount || 0} students
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {course.duration} min
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                    {course.rating || 0}
                  </div>
                </div>
              </div>
              
              <div className="text-right flex-shrink-0 ml-4">
                <div className="text-xl font-bold text-blue-600 mb-2">
                  {formatPrice(course.price || 0, course.currency)}
                </div>
                <Button size="sm">
                  View Course
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketplacePage;

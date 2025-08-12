import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/github-sdk';
import { 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Trash2, 
  Edit, 
  Eye, 
  MoreHorizontal,
  BookOpen,
  Users,
  Clock,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  creatorId: string;
  creatorType: 'instructor' | 'ai';
  isAiGenerated: boolean;
  price: number;
  isPublished: boolean;
  enrollmentCount: number;
  rating: number;
  duration: number;
  academicLevelId: string;
  subjectId: string;
  createdAt: string;
  updatedAt: string;
}

const CourseManagement = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const { toast } = useToast();

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    filterAndSortCourses();
  }, [courses, searchTerm, sortBy, sortOrder, filterType, filterStatus]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const coursesData = await db.get('courses');
      setCourses(coursesData || []);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load courses',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCourses = () => {
    let filtered = [...courses];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(course => {
        if (filterType === 'ai') return course.isAiGenerated;
        if (filterType === 'instructor') return !course.isAiGenerated;
        return true;
      });
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(course => {
        if (filterStatus === 'published') return course.isPublished;
        if (filterStatus === 'draft') return !course.isPublished;
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy as keyof Course];
      let bValue = b[sortBy as keyof Course];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredCourses(filtered);
  };

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSelectAll = () => {
    const currentPageCourses = getCurrentPageCourses();
    const allSelected = currentPageCourses.every(course => selectedCourses.includes(course.id));
    
    if (allSelected) {
      setSelectedCourses(prev => prev.filter(id => !currentPageCourses.find(c => c.id === id)));
    } else {
      setSelectedCourses(prev => [...new Set([...prev, ...currentPageCourses.map(c => c.id)])]);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedCourses.length === 0) return;

    try {
      await Promise.all(selectedCourses.map(id => db.delete('courses', id)));
      await loadCourses();
      setSelectedCourses([]);
      toast({
        title: 'Success',
        description: `${selectedCourses.length} courses deleted successfully`
      });
    } catch (error) {
      console.error('Error deleting courses:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete courses',
        variant: 'destructive'
      });
    }
  };

  const handleBatchPublish = async (publish: boolean) => {
    if (selectedCourses.length === 0) return;

    try {
      await Promise.all(
        selectedCourses.map(id => 
          db.update('courses', id, { 
            isPublished: publish,
            updatedAt: new Date().toISOString()
          })
        )
      );
      await loadCourses();
      setSelectedCourses([]);
      toast({
        title: 'Success',
        description: `${selectedCourses.length} courses ${publish ? 'published' : 'unpublished'} successfully`
      });
    } catch (error) {
      console.error('Error updating courses:', error);
      toast({
        title: 'Error',
        description: 'Failed to update courses',
        variant: 'destructive'
      });
    }
  };

  const getCurrentPageCourses = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCourses.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  const getStats = () => {
    const total = courses.length;
    const published = courses.filter(c => c.isPublished).length;
    const aiGenerated = courses.filter(c => c.isAiGenerated).length;
    const instructorCreated = courses.filter(c => !c.isAiGenerated).length;
    
    return { total, published, aiGenerated, instructorCreated };
  };

  const stats = getStats();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Course Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage all courses across the platform</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={loadCourses} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Published</p>
                <p className="text-2xl font-bold text-green-600">{stats.published}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">AI Generated</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.aiGenerated}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Instructor Created</p>
                <p className="text-2xl font-bold text-teal-600">{stats.instructorCreated}</p>
              </div>
              <Users className="h-8 w-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ai">AI Generated</SelectItem>
                  <SelectItem value="instructor">Instructor Created</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Created Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="enrollmentCount">Enrollments</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Batch Actions */}
      {selectedCourses.length > 0 && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedCourses.length} course(s) selected
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBatchPublish(true)}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Publish
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBatchPublish(false)}
                  className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Unpublish
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBatchDelete}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Courses ({filteredCourses.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={getCurrentPageCourses().length > 0 && getCurrentPageCourses().every(course => selectedCourses.includes(course.id))}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-gray-600">Select All</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stats
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  <AnimatePresence>
                    {getCurrentPageCourses().map((course) => (
                      <motion.tr
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <Checkbox
                              checked={selectedCourses.includes(course.id)}
                              onCheckedChange={() => handleSelectCourse(course.id)}
                              className="mr-3"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {course.title}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {course.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant={course.isAiGenerated ? "secondary" : "default"} className="bg-green-100 text-green-800">
                            {course.isAiGenerated ? 'AI Generated' : 'Instructor'}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant={course.isPublished ? "default" : "secondary"} className={course.isPublished ? "bg-green-100 text-green-800" : ""}>
                            {course.isPublished ? 'Published' : 'Draft'}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {course.enrollmentCount || 0}
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4" />
                              {course.rating || 'N/A'}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {course.duration}h
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {new Date(course.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCourses.length)} of {filteredCourses.length} courses
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;

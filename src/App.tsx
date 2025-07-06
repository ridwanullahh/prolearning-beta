
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import MarketplacePage from './pages/marketplace/MarketplacePage';
import CourseDetailsPage from './pages/course/CourseDetailsPage';
import BlogArchive from './pages/blog/BlogArchive';
import BlogPost from './pages/blog/BlogPost';
import AuthLayout from './layouts/AuthLayout';
import LearnerDashboard from './pages/dashboard/LearnerDashboard';
import MyCourses from './pages/dashboard/MyCourses';
import LessonPage from './pages/learner/LessonPage';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import InstructorCourses from './pages/instruct/InstructorCourses';
import CourseBuilder from './pages/instruct/CourseBuilder';
import LessonEditor from './pages/instructor/LessonEditor';
import SuperAdminDashboard from './pages/super_admin/SuperAdminDashboard';
import NotFound from './pages/NotFound';
import { ProtectedRoute } from './components/shared/ProtectedRoute';
import { Toaster } from 'sonner';
import MobileNav from './components/shared/MobileNav';
import HelpArchive from './pages/help/HelpArchive';
import HelpArticle from './pages/help/HelpArticle';
import SupportTicket from './pages/support/SupportTicket';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/course/:id" element={<CourseDetailsPage />} />
          <Route path="/blog" element={<BlogArchive />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/help" element={<HelpArchive />} />
          <Route path="/help/:slug" element={<HelpArticle />} />
          
          {/* Auth Routes */}
          <Route path="/auth/*" element={<AuthLayout />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <LearnerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-courses" 
            element={
              <ProtectedRoute>
                <MyCourses />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/course/:courseId/lesson/:lessonId" 
            element={
              <ProtectedRoute>
                <LessonPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/instruct" 
            element={
              <ProtectedRoute allowedRoles={['instructor', 'super_admin']}>
                <InstructorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/instruct/courses" 
            element={
              <ProtectedRoute allowedRoles={['instructor', 'super_admin']}>
                <InstructorCourses />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/instruct/course-builder" 
            element={
              <ProtectedRoute allowedRoles={['instructor', 'super_admin']}>
                <CourseBuilder />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/instruct/course/:courseId/lesson/:lessonId/edit" 
            element={
              <ProtectedRoute allowedRoles={['instructor', 'super_admin']}>
                <LessonEditor />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/support" 
            element={
              <ProtectedRoute>
                <SupportTicket />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/super-admin" 
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;

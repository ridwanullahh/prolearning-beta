import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "./lib/github-sdk";
import { authService, AuthUser } from "./lib/auth";
import AuthLayout from "./components/auth/AuthLayout";
import LearnerDashboard from "./pages/dashboard/LearnerDashboard";
import InstructorDashboard from "./pages/instruct/InstructorDashboard";
import SuperAdminDashboard from "./pages/super-admin/SuperAdminDashboard";
import LandingPage from "./pages/LandingPage";
import CoursePage from "./pages/course/CoursePage";
import LessonPage from "./pages/lesson/LessonPage";
import MarketplacePage from "./pages/marketplace/MarketplacePage";
import CourseDetailsPage from "./pages/course/CourseDetailsPage";
import CourseViewer from "./components/course/CourseViewer";
import LessonEditor from "./pages/instruct/LessonEditor";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LoadingScreen from "./components/ui/LoadingScreen";
import NotFound from "./pages/NotFound";
import BlogArchive from "./pages/blog/BlogArchive";
import BlogPost from "./pages/blog/BlogPost";
import HelpCenter from "./pages/help/HelpCenter";
import HelpArticle from "./pages/help/HelpArticle";
import SupportTicket from "./pages/support/SupportTicket";

const queryClient = new QueryClient();

const App = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('Initializing GitHub SDK...');
        await db.initialize();
        console.log('GitHub SDK initialized successfully');
        
        const user = authService.getCurrentUser();
        setCurrentUser(user);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setIsInitialized(true);
      }
    };

    initialize();
  }, []);

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/*" element={<AuthLayout />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/course/:id" element={<CourseDetailsPage />} />
            <Route path="/blog" element={<BlogArchive />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/help/:slug" element={<HelpArticle />} />
            <Route path="/support" element={<SupportTicket />} />
            
            {/* Protected Learner Routes */}
            <Route 
              path="/dashboard/*" 
              element={
                <ProtectedRoute allowedRoles={['learner']}>
                  <LearnerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-course/:id" 
              element={
                <ProtectedRoute allowedRoles={['learner']}>
                  <CourseViewer />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/lesson/:id" 
              element={
                <ProtectedRoute allowedRoles={['learner']}>
                  <LessonPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Instructor Routes */}
            <Route 
              path="/instruct/*" 
              element={
                <ProtectedRoute allowedRoles={['instructor']}>
                  <InstructorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/instruct/courses/:courseId/lessons/new" 
              element={
                <ProtectedRoute allowedRoles={['instructor']}>
                  <LessonEditor />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/instruct/courses/:courseId/lessons/:lessonId/edit" 
              element={
                <ProtectedRoute allowedRoles={['instructor']}>
                  <LessonEditor />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Super Admin Routes */}
            <Route 
              path="/super-admin/*" 
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

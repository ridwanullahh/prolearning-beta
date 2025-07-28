import { CartProvider } from "./components/cart/Cart";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "./lib/github-sdk";
import Checkout from "./pages/Checkout";
import { authService, AuthUser } from "./lib/auth";
import AuthLayout from "./components/auth/AuthLayout";
import GoogleCallback from "./pages/auth/GoogleCallback";
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
import LoadingScreen from "@/components/ui/LoadingScreen";
import NotFound from "./pages/NotFound";
import LearnerDashboardHome from "./pages/dashboard/LearnerDashboardHome";
import MyCourses from "./pages/dashboard/MyCourses";
import BlogArchive from "./pages/blog/BlogArchive";
import BlogPost from "./pages/blog/BlogPost";
import InstructorDashboardHome from "./pages/instruct/InstructorDashboardHome";
import InstructorCourses from "./pages/instruct/InstructorCourses";
import CourseBuilder from "./pages/instruct/CourseBuilder";
import HelpCenter from "./pages/help/HelpCenter";
import HelpArticle from "./pages/help/HelpArticle";
import SupportTicket from "./pages/support/SupportTicket";
import SuperAdminDashboardHome from "./pages/super-admin/SuperAdminDashboardHome";
import ContactPage from "./pages/ContactPage";
import TermsPage from "./pages/TermsPage";
import AboutPage from "./pages/AboutPage";


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
    <CartProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth/*" element={<AuthLayout />} />
              <Route path="/auth/google/callback" element={<GoogleCallback />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/blog" element={<BlogArchive />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/help/:slug" element={<HelpArticle />} />
              <Route path="/support" element={<SupportTicket />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/course/:courseId" element={<CourseDetailsPage />} />
              <Route path="/checkout" element={<Checkout />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['learner']}>
                  <LearnerDashboard />
                </ProtectedRoute>
              }>
                <Route index element={<LearnerDashboardHome />} />
                <Route path="courses" element={<MyCourses />} />
                <Route path="course/:courseId/view" element={<CourseViewer />} />
              </Route>
              
              <Route path="/instruct" element={
                <ProtectedRoute allowedRoles={['instructor']}>
                  <InstructorDashboard />
                </ProtectedRoute>
              }>
                <Route index element={<InstructorDashboardHome />} />
                <Route path="courses" element={<InstructorCourses />} />
                <Route path="course/new" element={<CourseBuilder />} />
                <Route path="course/:courseId/edit" element={<CourseBuilder />} />
                <Route path="course/:courseId/lesson/:lessonId/edit" element={<LessonEditor />} />
              </Route>

              <Route path="/super-admin" element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              }>
                <Route index element={<SuperAdminDashboardHome />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </CartProvider>
  );
};

export default App;

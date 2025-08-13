import { CartProvider } from "./components/cart/Cart";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "./lib/github-sdk";
import * as serviceWorkerRegistration from './lib/service-worker-registration';
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
import FixedMarketplacePage from "./pages/marketplace/FixedMarketplacePage";
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
import FeaturesPage from "./pages/FeaturesPage";
import BecomeInstructorPage from "./pages/BecomeInstructorPage";
import InstructorOnboardingPage from "./pages/instructor/OnboardingPage";
import LearnerOnboardingPage from "./pages/learner/OnboardingPage";
import InstructorApprovalsPage from "./pages/super-admin/InstructorApprovalsPage";
import LearnerSettingsPage from "./pages/dashboard/SettingsPage";
import InstructorSettingsPage from "./pages/instruct/SettingsPage";
import QualificationApprovalsPage from "./pages/super-admin/QualificationApprovalsPage";
import AIGuidelinesPage from "./pages/super-admin/AIGuidelinesPage";
import CreateCourseTrackPage from "./pages/instruct/CreateCourseTrackPage";
import NotificationManagementPage from "./pages/super-admin/NotificationManagementPage";
import PopupBuilderPage from "./pages/super-admin/PopupBuilderPage";
import BlogManagementPage from "./pages/super-admin/BlogManagementPage";
import SupportManagementPage from "./pages/super-admin/SupportManagementPage";
import NotificationSettingsPage from "./pages/settings/NotificationSettingsPage";
import NotificationConsentModal from "./components/notifications/NotificationConsentModal";
import ManageCourseTracksPage from "./pages/instruct/ManageCourseTracksPage";
import EditCourseTrackPage from "./pages/instruct/EditCourseTrackPage";
import CourseTrackDetailsPage from "./pages/course/CourseTrackDetailsPage";
import MyCourseTracksPage from "./pages/dashboard/MyCourseTracksPage";
import LearnerNotesPage from "./pages/dashboard/LearnerNotesPage";
import InstructorNotesPage from "./pages/instruct/InstructorNotesPage";


const queryClient = new QueryClient();

const App = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [showNotificationConsent, setShowNotificationConsent] = useState(false);
  const [notificationConsentChecked, setNotificationConsentChecked] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('Initializing GitHub SDK...');
        await db.initialize();
        console.log('GitHub SDK initialized successfully');

        const user = authService.getCurrentUser();
        setCurrentUser(user);
        setIsInitialized(true);

        // Check notification consent for logged-in users
        if (user && !notificationConsentChecked) {
          try {
            const userData = await db.getItem('users', user.id);
            if (!userData?.notificationConsent && !userData?.notificationConsentDate) {
              // Show consent modal for users who haven't been asked
              setTimeout(() => setShowNotificationConsent(true), 2000);
            }
            setNotificationConsentChecked(true);
          } catch (error) {
            console.error('Error checking notification consent:', error);
          }
        }

        // Register service worker for background generation and push notifications
        serviceWorkerRegistration.register({
          onSuccess: (registration) => {
            console.log('Service Worker registered successfully:', registration);
          },
          onUpdate: (registration) => {
            console.log('Service Worker updated:', registration);
            // Optionally show a notification to the user about the update
          }
        });

        // Request notification permission
        await serviceWorkerRegistration.requestNotificationPermission();

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
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/become-instructor" element={<BecomeInstructorPage />} />
              <Route path="/blog" element={<BlogArchive />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/help/:slug" element={<HelpArticle />} />
              <Route path="/support" element={<SupportTicket />} />
              <Route path="/marketplace" element={<FixedMarketplacePage />} />
              <Route path="/course/:courseId" element={<CourseDetailsPage />} />
              <Route path="/track/:trackId" element={<CourseTrackDetailsPage />} />
              <Route path="/checkout" element={<Checkout />} />
              {/* Direct learner course viewer route to support /my-course/:id links */}
              <Route path="/my-course/:id" element={
                <ProtectedRoute allowedRoles={["learner"]}>
                  <CoursePage />
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['learner']}>
                  <LearnerDashboard />
                </ProtectedRoute>
              }>
                <Route index element={<LearnerDashboardHome />} />
                <Route path="courses" element={<MyCourses />} />
                <Route path="course/:courseId/view" element={<CourseViewer />} />
                <Route path="onboarding" element={<LearnerOnboardingPage />} />
                <Route path="settings" element={<LearnerSettingsPage />} />
                <Route path="notification-settings" element={<NotificationSettingsPage />} />
                <Route path="my-tracks" element={<MyCourseTracksPage />} />
                <Route path="notes" element={<LearnerNotesPage />} />
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
                <Route path="onboarding" element={<InstructorOnboardingPage />} />
                <Route path="settings" element={<InstructorSettingsPage />} />
                <Route path="track/new" element={<CreateCourseTrackPage />} />
                <Route path="tracks" element={<ManageCourseTracksPage />} />
                <Route path="track/:trackId/edit" element={<EditCourseTrackPage />} />
                <Route path="notes" element={<InstructorNotesPage />} />
              </Route>

              <Route path="/super-admin" element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              }>
                <Route index element={<SuperAdminDashboardHome />} />
                <Route path="instructor-approvals" element={<InstructorApprovalsPage />} />
                <Route path="qualification-approvals" element={<QualificationApprovalsPage />} />
                <Route path="ai-guidelines" element={<AIGuidelinesPage />} />
                <Route path="notifications" element={<NotificationManagementPage />} />
                <Route path="popups" element={<PopupBuilderPage />} />
                <Route path="blog" element={<BlogManagementPage />} />
                <Route path="support" element={<SupportManagementPage />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>

          {/* Notification Consent Modal */}
          <NotificationConsentModal
            isOpen={showNotificationConsent}
            onClose={() => setShowNotificationConsent(false)}
            onConsent={(granted) => {
              console.log('Notification consent:', granted);
              setShowNotificationConsent(false);
            }}
          />
        </TooltipProvider>
      </QueryClientProvider>
    </CartProvider>
  );
};

export default App;

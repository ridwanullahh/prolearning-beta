import { Routes, Route, Navigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { authService } from '@/lib/auth';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import ResetPasswordForm from './ResetPasswordForm';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, Users, Trophy } from 'lucide-react';

const AuthLayout = () => {
  const location = useLocation();
  const user = authService.getCurrentUser();

  // Redirect authenticated users to their dashboard
  if (user) {
    const from = location.state?.from?.pathname;
    if (from) {
      return <Navigate to={from} replace />;
    }
    
    const roleRoutes = {
      learner: '/dashboard',
      instructor: '/instruct', 
      super_admin: '/super-admin'
    };
    
    return <Navigate to={roleRoutes[user.role]} replace />;
  }

  const features = [
    {
      icon: GraduationCap,
      title: "AI-Powered Learning",
      description: "Personalized courses tailored to your learning style"
    },
    {
      icon: BookOpen,
      title: "Rich Content",
      description: "Interactive lessons with quizzes, flashcards, and mind maps"
    },
    {
      icon: Users,
      title: "Expert Instructors",
      description: "Learn from industry professionals and certified educators"
    },
    {
      icon: Trophy,
      title: "Track Progress",
      description: "Monitor your learning journey with detailed analytics"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-950 dark:via-green-950 dark:to-teal-950">
      {/* Mobile-first design */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        
        {/* Left side - Branding & Features (hidden on mobile, shown on desktop) */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700" />
          <div className="absolute inset-0 bg-black/10" />
          
          <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <h1 className="text-3xl font-bold">ProLearning</h1>
              </div>
              <h2 className="text-4xl font-bold leading-tight mb-4">
                Transform Your Learning Journey
              </h2>
              <p className="text-xl text-white/90 leading-relaxed">
                Join thousands of learners and instructors in our AI-powered educational platform designed for the modern world.
              </p>
            </motion.div>

            <div className="grid gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                    <p className="text-white/80 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Auth Forms */}
        <div className="flex-1 lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Mobile header (shown only on mobile) */}
            <div className="lg:hidden text-center mb-8">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center justify-center gap-3 mb-4"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ProLearning</h1>
              </motion.div>
              <p className="text-gray-600 dark:text-gray-400">
                Your personalized journey to mastery starts here
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 border border-gray-200 dark:border-gray-800"
            >
              <Routes>
                <Route path="login" element={<LoginForm />} />
                <Route path="register" element={<RegisterForm />} />
                <Route path="forgot-password" element={<ForgotPasswordForm />} />
                <Route path="reset-password/:token" element={<ResetPasswordForm />} />
                <Route path="*" element={<Navigate to="login" replace />} />
              </Routes>
            </motion.div>

            {/* Mobile features preview */}
            <div className="lg:hidden mt-8 grid grid-cols-2 gap-4">
              {features.slice(0, 4).map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  className="text-center p-4 bg-white/50 dark:bg-gray-900/50 rounded-2xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-medium text-sm text-gray-900 dark:text-white mb-1">{feature.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

import { Routes, Route, Navigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { authService } from '@/lib/auth';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Routes>
          <Route path="login" element={<LoginForm />} />
          <Route path="register" element={<RegisterForm />} />
          <Route path="*" element={<Navigate to="login" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default AuthLayout;

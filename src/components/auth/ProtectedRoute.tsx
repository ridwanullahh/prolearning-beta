
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();
  const user = authService.getCurrentUser();

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const roleRoutes = {
      learner: '/dashboard',
      instructor: '/instruct',
      super_admin: '/super-admin'
    };
    
    return <Navigate to={roleRoutes[user.role]} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

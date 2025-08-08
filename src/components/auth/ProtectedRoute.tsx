
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '@/lib/auth';
import PendingApprovalPage from '../instructor/PendingApprovalPage';

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
    } as const;

    return <Navigate to={roleRoutes[user.role]} replace />;
  }

  // Redirect to onboarding if not completed (but allow the onboarding route itself)
  const pathname = location.pathname;
  if (
    user.role === 'instructor' &&
    !user.onboardingCompleted &&
    pathname !== '/instruct/onboarding'
  ) {
    return <Navigate to="/instruct/onboarding" replace />;
  }
  if (
    user.role === 'learner' &&
    !user.onboardingCompleted &&
    pathname !== '/dashboard/onboarding'
  ) {
    return <Navigate to="/dashboard/onboarding" replace />;
  }

  if (user.role === 'instructor' && user.approvalStatus !== 'approved') {
    return <PendingApprovalPage />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

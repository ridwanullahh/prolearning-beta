
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
  <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
  	<div className="hidden lg:flex items-center justify-center flex-col bg-muted p-10 text-center">
  		<div className="mx-auto w-[350px]">
  			<h1 className="text-3xl font-bold text-primary">
  				Welcome to ProLearning
  			</h1>
  			<p className="text-muted-foreground mt-2">
  				Your personalized journey to mastery starts here. Access AI-driven
  				courses and expert-led content.
  			</p>
  		</div>
  	</div>
  	<div className="flex items-center justify-center py-12">
  		<div className="mx-auto grid w-[350px] gap-6">
  			<Routes>
  				<Route path="login" element={<LoginForm />} />
  				<Route path="register" element={<RegisterForm />} />
  				<Route path="*" element={<Navigate to="login" replace />} />
  			</Routes>
  		</div>
  	</div>
  </div>
 );
};

export default AuthLayout;

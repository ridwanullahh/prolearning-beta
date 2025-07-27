import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuth = async () => {
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get('code');

      if (code) {
        try {
          const user = await authService.handleGoogleCallback(code);
          toast({
            title: 'Welcome! 🎉',
            description: `Signed in successfully as ${user.name}`,
          });
          const roleRoutes = {
            learner: '/dashboard',
            instructor: '/instruct',
            super_admin: '/super-admin',
          };
          navigate(roleRoutes[user.role], { replace: true });
        } catch (error) {
          toast({
            title: 'Google Sign-In Failed',
            description:
              error instanceof Error
                ? error.message
                : 'An unexpected error occurred. Please try again.',
            variant: 'destructive',
          });
          navigate('/auth/login', { replace: true });
        }
      } else {
        toast({
          title: 'Google Sign-In Error',
          description: 'Could not get authorization code from Google.',
          variant: 'destructive',
        });
        navigate('/auth/login', { replace: true });
      }
    };

    handleAuth();
  }, [location, navigate, toast]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Loader2 className="h-16 w-16 animate-spin text-green-600" />
    </div>
  );
};

export default GoogleCallback;
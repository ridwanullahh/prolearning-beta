import { useState, useEffect } from 'react';
import { authService, AuthUser } from '../lib/auth';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  return { user, setUser };
};
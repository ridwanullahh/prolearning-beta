import { useState, useEffect } from 'react';
import { authService, AuthUser } from '../lib/auth';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(authService.getCurrentUser());

  const updateUser = (updatedUser: AuthUser) => {
    authService.updateCurrentUser(updatedUser);
    setUser(updatedUser);
  };

  return { user, setUser: updateUser };
};
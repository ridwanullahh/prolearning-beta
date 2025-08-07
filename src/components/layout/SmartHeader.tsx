import React from 'react';
import { authService } from '@/lib/auth';
import Header from './Header'; // Public header
import { useLocation } from 'react-router-dom';

const SmartHeader: React.FC = () => {
  const user = authService.getCurrentUser();
  const location = useLocation();

  // Check if we're on a dashboard route where AppHeader is already provided
  const isDashboardRoute = location.pathname.startsWith('/dashboard') ||
                          location.pathname.startsWith('/instruct') ||
                          location.pathname.startsWith('/super-admin');

  // Only show public header for public pages
  // Dashboard pages handle their own headers within SidebarProvider
  return isDashboardRoute ? null : <Header />;
};

export default SmartHeader;

import React from 'react';
import { useAuth } from '../../services/context/AuthContext';
import { LandingNavbar } from './LandingNavbar';
import { AppNavbar } from './AppNavbar';

export { LandingNavbar } from './LandingNavbar';
export { AppNavbar } from './AppNavbar';

export const Navbar: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <AppNavbar />;
  }

  return <LandingNavbar />;
};
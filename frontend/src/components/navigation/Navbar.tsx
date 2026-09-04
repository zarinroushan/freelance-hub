import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/context/AuthContext';
import { Menu, X, Bell, User, LogOut, Moon, Sun } from 'lucide-react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/gigs', label: 'Find Gigs' },
    { to: '/dashboard', label: 'Dashboard' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🌸</span>
            <span className="text-xl font-bold text-[var(--color-text)]">UniGigs</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-[var(--color-surface-alt)] transition-colors"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notifications */}
            {isAuthenticated && (
              <button className="p-2 rounded-lg hover:bg-[var(--color-surface-alt)] relative">
                <Bell size={20} className="text-[var(--color-text)]" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--color-error)] rounded-full"></span>
              </button>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-[var(--color-surface-alt)]"
                >
                  <User size={20} />
                  <span className="text-sm font-medium">{user?.email}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-[var(--color-surface-alt)] text-[var(--color-error)]"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <button className="text-[var(--color-text)] hover:text-[var(--color-primary)]">
                    Login
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-primary-hover)]">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-[var(--color-surface-alt)]"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="px-4 py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className="block text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
              >
                {link.label}
              </Link>
            ))}
            
            {isAuthenticated ? (
              <>
                <Link to="/profile" onClick={() => setIsOpen(false)} className="block">
                  Profile
                </Link>
                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="block text-left text-[var(--color-error)]">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)}>Login</Link>
                <Link to="/signup" onClick={() => setIsOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { ThemeToggle } from '../ui/ThemeToggle';
import { useTheme } from '../../services/context/ThemeContext';
import { useAuth } from '../../services/context/AuthContext';

import './Navbar.css';

interface NavItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Detect scroll for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
    setIsNotificationOpen(false);
  }, [location.pathname]);

  // Navigation items based on user role
  const getNavItems = (): NavItem[] => {
    // Guest user
    if (!isAuthenticated || !user) {
      return [
        {
          label: 'Explore',
          path: '/gigs',
        },
        {
          label: 'How it works',
          path: '/how-it-works',
        },
        {
          label: 'About',
          path: '/about',
        },
      ];
    }

    // Student
    if (user.role === 'student') {
      return [
        {
          label: 'Explore',
          path: '/gigs',
        },
        {
          label: 'My Applications',
          path: '/applications',
        },
        {
          label: 'Messages',
          path: '/messages',
        },
        {
          label: 'Dashboard',
          path: '/dashboard',
        },
      ];
    }

    // Client
    return [
      {
        label: 'Explore',
        path: '/gigs',
      },
      {
        label: 'Post a Gig',
        path: '/gigs/new',
      },
      {
        label: 'My Gigs',
        path: '/dashboard',
      },
      {
        label: 'Messages',
        path: '/messages',
      },
    ];
  };

  const navItems = getNavItems();

  // Create a display name from email
  const getDisplayName = () => {
    if (!user?.email) {
      return 'User';
    }

    const emailName = user.email.split('@')[0];

    return emailName
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Create avatar initial from email
  const getAvatarInitial = () => {
    if (!user?.email) {
      return 'U';
    }

    return user.email.charAt(0).toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/');
    }
  };

  const isActive = (path: string) => {
    if (path === '/gigs') {
      return (
        location.pathname === '/gigs' ||
        location.pathname.startsWith('/gigs/')
      );
    }

    return location.pathname === path;
  };

  return (
    <header
      className={`navbar ${
        isScrolled ? 'navbar--scrolled' : ''
      }`}
    >
      <div className="navbar__container">

        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">✦</span>
          <span className="navbar__logo-text">UniGigs</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="navbar__nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`navbar__link ${
                isActive(item.path)
                  ? 'navbar__link--active'
                  : ''
              }`}
            >
              {item.label}

              {isActive(item.path) && (
                <span className="navbar__link-indicator" />
              )}
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="navbar__actions">

          {/* Theme Toggle */}
          <ThemeToggle
            currentTheme={theme}
            onToggle={toggleTheme}
          />

          {/* Notifications */}
          {isAuthenticated && (
            <div className="navbar__notifications">
              <button
                type="button"
                className="navbar__icon-btn"
                onClick={() =>
                  setIsNotificationOpen(!isNotificationOpen)
                }
                aria-label="Notifications"
                aria-expanded={isNotificationOpen}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>

                <span className="navbar__badge">3</span>
              </button>

              {isNotificationOpen && (
                <div className="navbar__dropdown navbar__dropdown--notifications">

                  <div className="navbar__dropdown-header">
                    <h4>Notifications</h4>

                    <button
                      type="button"
                      className="navbar__dropdown-action"
                      onClick={() =>
                        setIsNotificationOpen(false)
                      }
                    >
                      Mark all as read
                    </button>
                  </div>

                  <div className="navbar__dropdown-content">

                    {/* Notification 1 */}
                    <div className="notification-item notification-item--unread">
                      <div className="notification-item__icon">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                      </div>

                      <div className="notification-item__content">
                        <p className="notification-item__title">
                          Application Accepted
                        </p>

                        <p className="notification-item__message">
                          Your UI Designer application was accepted!
                        </p>

                        <span className="notification-item__time">
                          2h ago
                        </span>
                      </div>
                    </div>

                    {/* Notification 2 */}
                    <div className="notification-item notification-item--unread">
                      <div className="notification-item__icon">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                      </div>

                      <div className="notification-item__content">
                        <p className="notification-item__title">
                          New Message
                        </p>

                        <p className="notification-item__message">
                          Sarah sent you a message
                        </p>

                        <span className="notification-item__time">
                          5h ago
                        </span>
                      </div>
                    </div>

                    {/* Notification 3 */}
                    <div className="notification-item">
                      <div className="notification-item__icon">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                      </div>

                      <div className="notification-item__content">
                        <p className="notification-item__title">
                          Gig Reminder
                        </p>

                        <p className="notification-item__message">
                          Portfolio website deadline tomorrow
                        </p>

                        <span className="notification-item__time">
                          1d ago
                        </span>
                      </div>
                    </div>

                  </div>

                  <div className="navbar__dropdown-footer">
                    <Link to="/notifications">
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Menu */}
          {isAuthenticated && user ? (
            <div className="navbar__user">

              <button
                type="button"
                className="navbar__user-btn"
                onClick={() =>
                  setIsProfileMenuOpen(!isProfileMenuOpen)
                }
                aria-expanded={isProfileMenuOpen}
                aria-label="Open user menu"
              >

                {/* Avatar - using email instead of user.avatar */}
                <div className="navbar__avatar-placeholder">
                  {getAvatarInitial()}
                </div>

                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>

              </button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <div className="navbar__dropdown navbar__dropdown--profile">

                  {/* User Information */}
                  <div className="navbar__user-info">

                    <div className="navbar__user-avatar">
                      <div className="navbar__avatar-placeholder">
                        {getAvatarInitial()}
                      </div>
                    </div>

                    <div className="navbar__user-details">

                      {/* Display name generated from email */}
                      <p className="navbar__user-name">
                        {getDisplayName()}
                      </p>

                      <p className="navbar__user-email">
                        {user.email}
                      </p>

                      <span className="navbar__user-role">
                        {user.role === 'student'
                          ? 'Student'
                          : 'Client'}
                      </span>

                    </div>
                  </div>

                  <div className="navbar__dropdown-divider" />

                  {/* Dashboard */}
                  <Link
                    to="/dashboard"
                    className="navbar__dropdown-item"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="3"
                        y="3"
                        width="7"
                        height="7"
                      />

                      <rect
                        x="14"
                        y="3"
                        width="7"
                        height="7"
                      />

                      <rect
                        x="14"
                        y="14"
                        width="7"
                        height="7"
                      />

                      <rect
                        x="3"
                        y="14"
                        width="7"
                        height="7"
                      />
                    </svg>

                    Dashboard
                  </Link>

                  {/* Profile */}
                  <Link
                    to="/profile"
                    className="navbar__dropdown-item"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle
                        cx="12"
                        cy="7"
                        r="4"
                      />
                    </svg>

                    Profile
                  </Link>

                  {/* Settings */}
                  <Link
                    to="/settings"
                    className="navbar__dropdown-item"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                      />

                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>

                    Settings
                  </Link>

                  <div className="navbar__dropdown-divider" />

                  {/* Logout */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="navbar__dropdown-item navbar__dropdown-item--danger"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />

                      <polyline points="16 17 21 12 16 7" />

                      <line
                        x1="21"
                        y1="12"
                        x2="9"
                        y2="12"
                      />
                    </svg>

                    Logout
                  </button>

                </div>
              )}
            </div>
          ) : (

            /* Guest Authentication Buttons */
            <div className="navbar__auth">

              <Link
                to="/login"
                className="navbar__btn navbar__btn--ghost"
              >
                Sign In
              </Link>

              <Link
                to="/signup"
                className="navbar__btn navbar__btn--primary"
              >
                Get Started
              </Link>

            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="navbar__mobile-toggle"
            onClick={() =>
              setIsMobileMenuOpen(!isMobileMenuOpen)
            }
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line
                  x1="18"
                  y1="6"
                  x2="6"
                  y2="18"
                />

                <line
                  x1="6"
                  y1="6"
                  x2="18"
                  y2="18"
                />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line
                  x1="3"
                  y1="12"
                  x2="21"
                  y2="12"
                />

                <line
                  x1="3"
                  y1="6"
                  x2="21"
                  y2="6"
                />

                <line
                  x1="3"
                  y1="18"
                  x2="21"
                  y2="18"
                />
              </svg>
            )}
          </button>

        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="navbar__mobile-menu">

          <nav className="navbar__mobile-nav">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`navbar__mobile-link ${
                  isActive(item.path)
                    ? 'navbar__mobile-link--active'
                    : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Authentication */}
          {!isAuthenticated && (
            <div className="navbar__mobile-auth">

              <Link
                to="/login"
                className="navbar__btn navbar__btn--ghost navbar__btn--full"
              >
                Sign In
              </Link>

              <Link
                to="/signup"
                className="navbar__btn navbar__btn--primary navbar__btn--full"
              >
                Get Started
              </Link>

            </div>
          )}

          {/* Mobile Logged-in Actions */}
          {isAuthenticated && user && (
            <div className="navbar__mobile-auth">

              <Link
                to="/profile"
                className="navbar__btn navbar__btn--ghost navbar__btn--full"
              >
                Profile
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="navbar__btn navbar__btn--primary navbar__btn--full"
              >
                Logout
              </button>

            </div>
          )}

        </div>
      )}
    </header>
  );
};
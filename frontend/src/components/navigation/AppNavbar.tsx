import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useTheme } from '../../services/context/ThemeContext';
import { useAuth } from '../../services/context/AuthContext';
import { Menu, X, Bell, ChevronDown, LayoutDashboard, User as UserIcon, Settings, LogOut, CheckCircle, MessageSquare, Clock } from 'lucide-react';
import './Navbar.css';

interface NavItem {
  label: string;
  path: string;
}

export const AppNavbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
    setIsNotificationOpen(false);
  }, [location.pathname]);

  const getNavItems = (): NavItem[] => {
    if (!user) return [];

    if (user.role === 'student') {
      return [
        { label: 'Explore Gigs', path: '/gigs' },
        { label: 'Contracts', path: '/contracts' },
        { label: 'My Applications', path: '/applications' },
        { label: 'Messages', path: '/messages' },
        { label: 'Dashboard', path: '/dashboard' },
      ];
    }

    // Client - NO Explore / Browse Gigs link
    return [
      { label: 'My Gigs', path: '/dashboard' },
      { label: 'Post a Gig', path: '/gigs/new' },
      { label: 'Contracts', path: '/contracts' },
      { label: 'Messages', path: '/messages' },
    ];
  };

  const navItems = getNavItems();

  const getDisplayName = () => {
    if (!user?.email) return 'User';
    const emailName = user.email.split('@')[0];
    return emailName
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getAvatarInitial = () => {
    if (!user?.email) return 'U';
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
      return location.pathname === '/gigs' || (location.pathname.startsWith('/gigs/') && location.pathname !== '/gigs/new');
    }
    return location.pathname === path;
  };

  return (
    <header className={`navbar navbar--app ${isScrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__container">
        {/* Logo */}
        <Link to={user?.role === 'student' ? '/gigs' : '/dashboard'} className="navbar__logo">
          <img src="/favicon.png" alt="UniGigs" className="navbar__logo-icon" />
          <span className="navbar__logo-text">UniGigs</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="navbar__nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`navbar__link ${isActive(item.path) ? 'navbar__link--active' : ''}`}
            >
              {item.label}
              {isActive(item.path) && <span className="navbar__link-indicator" />}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="navbar__actions">
          <ThemeToggle currentTheme={theme} onToggle={toggleTheme} />

          {/* Notifications */}
          <div className="navbar__notifications">
            <button
              type="button"
              className="navbar__icon-btn"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="navbar__badge">3</span>
            </button>

            {isNotificationOpen && (
              <div className="navbar__dropdown navbar__dropdown--notifications">
                <div className="navbar__dropdown-header">
                  <h4>Notifications</h4>
                  <button
                    type="button"
                    className="navbar__dropdown-action"
                    onClick={() => setIsNotificationOpen(false)}
                  >
                    Mark all as read
                  </button>
                </div>

                <div className="navbar__dropdown-content">
                  <div className="notification-item notification-item--unread">
                    <div className="notification-item__icon">
                      <CheckCircle size={16} />
                    </div>
                    <div className="notification-item__content">
                      <p className="notification-item__title">Application Accepted</p>
                      <p className="notification-item__message">Your UI Designer proposal was accepted!</p>
                      <span className="notification-item__time">2h ago</span>
                    </div>
                  </div>

                  <div className="notification-item notification-item--unread">
                    <div className="notification-item__icon">
                      <MessageSquare size={16} />
                    </div>
                    <div className="notification-item__content">
                      <p className="notification-item__title">New Message</p>
                      <p className="notification-item__message">Client sent you project details</p>
                      <span className="notification-item__time">5h ago</span>
                    </div>
                  </div>

                  <div className="notification-item">
                    <div className="notification-item__icon">
                      <Clock size={16} />
                    </div>
                    <div className="notification-item__content">
                      <p className="notification-item__title">Gig Reminder</p>
                      <p className="notification-item__message">Project milestone due tomorrow</p>
                      <span className="notification-item__time">1d ago</span>
                    </div>
                  </div>
                </div>

                <div className="navbar__dropdown-footer">
                  <Link to="/messages">View all notifications</Link>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          {user && (
            <div className="navbar__user">
              <button
                type="button"
                className="navbar__user-btn"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                aria-expanded={isProfileMenuOpen}
              >
                <div className="navbar__avatar-placeholder">{getAvatarInitial()}</div>
                <ChevronDown size={16} />
              </button>

              {isProfileMenuOpen && (
                <div className="navbar__dropdown navbar__dropdown--profile">
                  <div className="navbar__user-info">
                    <div className="navbar__user-avatar">
                      <div className="navbar__avatar-placeholder">{getAvatarInitial()}</div>
                    </div>
                    <div className="navbar__user-details">
                      <p className="navbar__user-name">{getDisplayName()}</p>
                      <p className="navbar__user-email">{user.email}</p>
                      <span className="navbar__user-role">
                        {user.role === 'student' ? 'Student Freelancer' : 'Client'}
                      </span>
                    </div>
                  </div>

                  <div className="navbar__dropdown-divider" />

                  <Link to="/dashboard" className="navbar__dropdown-item">
                    <LayoutDashboard size={18} />
                    Dashboard
                  </Link>

                  <Link to="/profile" className="navbar__dropdown-item">
                    <UserIcon size={18} />
                    Profile
                  </Link>

                  <Link to="/settings" className="navbar__dropdown-item">
                    <Settings size={18} />
                    Settings
                  </Link>

                  <div className="navbar__dropdown-divider" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="navbar__dropdown-item navbar__dropdown-item--danger"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="navbar__mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
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
                className={`navbar__mobile-link ${isActive(item.path) ? 'navbar__mobile-link--active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="navbar__mobile-auth">
            <Link to="/profile" className="navbar__btn navbar__btn--ghost navbar__btn--full">
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
        </div>
      )}
    </header>
  );
};

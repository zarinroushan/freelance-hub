import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useTheme } from '../../services/context/ThemeContext';
import { useAuth } from '../../services/context/AuthContext';
import { API_BASE_URL, getAuthToken } from '../../services/api';
import { Menu, X, Bell, ChevronDown, LayoutDashboard, User as UserIcon, Settings, LogOut, CheckCircle, MessageSquare, Clock } from 'lucide-react';
import './Navbar.css';

interface NavItem {
  label: string;
  path: string;
}

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  related_entity_type?: string | null;
  related_entity_id?: number | null;
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = getAuthToken();

        if (!token) return;

        const [notifsRes, countRes] = await Promise.all([
          fetch(`${API_BASE_URL}/notifications`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_BASE_URL}/notifications/unread-count`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (notifsRes.ok) {
          const data = await notifsRes.json();
          setNotifications(data);
        }

        if (countRes.ok) {
          const data = await countRes.json();
          setUnreadCount(data.unread_count);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
    setIsNotificationOpen(false);
  }, [location.pathname]);


  const handleNotificationClick = (notification: Notification) => {
    try {
      console.log('🔔 NOTIFICATION CLICKED:', notification);
      console.log('👤 CURRENT USER:', user);
      console.log('👤 USER ROLE:', user?.role);
      console.log('📌 NOTIFICATION TYPE:', notification.type);
      console.log('🔗 RELATED ENTITY TYPE:', notification.related_entity_type);
      console.log('🔗 RELATED ENTITY ID:', notification.related_entity_id);

      // Close notification dropdown immediately
      setIsNotificationOpen(false);

      // Update notification state locally
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id
            ? { ...n, is_read: true }
            : n
        )
      );

      setUnreadCount((prev) =>
        Math.max(0, prev - (notification.is_read ? 0 : 1))
      );

      // ==========================================
      // DETERMINE WHERE THE NOTIFICATION SHOULD GO
      // ==========================================

      let targetPath = '/notifications';

      // Application received notifications always route directly to the gig applications page
      if (notification.type === 'application_received') {
        if (notification.related_entity_id) {
          targetPath = `/applications/${notification.related_entity_id}`;
        } else {
          targetPath = '/dashboard';
        }
      }
      // ==========================================
      // STUDENT / FREELANCER
      // ==========================================
      else if (user?.role === 'student') {
        switch (notification.type) {
          case 'application_accepted':
          case 'application_rejected':
            // Student should see their applications
            targetPath = '/applications';
            break;

          case 'new_message':
            targetPath = '/messages';
            break;

          case 'work_submitted':
          case 'work_approved':
          case 'payment_released':
          case 'contract_created':
            targetPath = '/contracts';
            break;

          case 'gig_posted':
            targetPath = notification.related_entity_id
              ? `/gigs/${notification.related_entity_id}`
              : '/gigs';
            break;

          case 'review_received':
            targetPath = '/profile';
            break;

          default:
            targetPath = '/notifications';
            break;
        }
      }

      // ==========================================
      // CLIENT
      // ==========================================
      else if (user?.role === 'client') {
        switch (notification.type) {
          case 'application_received':
            if (notification.related_entity_id) {
              targetPath = `/applications/${notification.related_entity_id}`;
            } else {
              targetPath = '/dashboard';
            }
            break;

          case 'new_message':
            targetPath = '/messages';
            break;

          case 'work_submitted':
          case 'work_approved':
          case 'payment_released':
          case 'contract_created':
            targetPath = '/contracts';
            break;

          case 'review_received':
            targetPath = '/profile';
            break;

          default:
            targetPath = '/notifications';
            break;
        }
      }

      console.log('🚀 FINAL TARGET PATH:', targetPath);

      // ==========================================
      // NAVIGATE IMMEDIATELY
      // ==========================================
      navigate(targetPath);

      console.log('✅ navigate() CALLED');

      // Mark notification as read in background without blocking navigation
      const token = getAuthToken();
      if (token && !notification.is_read) {
        fetch(`${API_BASE_URL}/notifications/${notification.id}/read`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).catch((err) => {
          console.error('Error marking notification as read in background:', err);
        });
      }
    } catch (error) {
      console.error('❌ ERROR HANDLING NOTIFICATION:', error);
    }
  };

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

  const markAllAsRead = async () => {
    try {
      const token = getAuthToken();

      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to mark notifications as read');
      }

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
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
              {unreadCount > 0 && (
                <span className="navbar__badge">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {isNotificationOpen && (
              <div className="navbar__dropdown navbar__dropdown--notifications">
                <div className="navbar__dropdown-header">
                  <h4>Notifications</h4>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      className="navbar__dropdown-action"
                      onClick={markAllAsRead}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="navbar__dropdown-content">
                  {notifications.length === 0 ? (
                    <div className="notification-item">
                      <div className="notification-item__content">
                        <p className="notification-item__message">
                          No notifications
                        </p>
                      </div>
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        className={`notification-item ${
                          !notification.is_read ? 'notification-item--unread' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="notification-item__icon">
                          {notification.type === 'application_accepted' ? (
                            <CheckCircle size={16} />
                          ) : notification.type === 'new_message' ? (
                            <MessageSquare size={16} />
                          ) : (
                            <Clock size={16} />
                          )}
                        </div>

                        <div className="notification-item__content">
                          <p className="notification-item__title">
                            {notification.title}
                          </p>

                          <p className="notification-item__message">
                            {notification.message}
                          </p>

                          <span className="notification-item__time">
                            {new Date(notification.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="navbar__dropdown-footer">
                  <Link to="/notifications">View all notifications</Link>
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

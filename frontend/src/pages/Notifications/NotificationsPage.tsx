import { useEffect, useState } from 'react';
import { Bell, CheckCircle } from 'lucide-react';
import { API_BASE_URL, getAuthToken } from '../../services/api';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const token = getAuthToken();

      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(
      (notification) => !notification.is_read
    );

    try {
      await Promise.all(
        unreadNotifications.map((notification) =>
          fetch(`${API_BASE_URL}/notifications/${notification.id}/read`, {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
          })
        )
      );

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <Bell size={26} className="text-[var(--color-primary)]" />
              <h1 className="text-2xl font-bold text-[var(--color-text)]">
                Notifications
              </h1>
            </div>

            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                : 'All notifications are read'}
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-[var(--color-text-muted)]">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell
                size={42}
                className="mx-auto mb-3 text-[var(--color-text-muted)] opacity-30"
              />
              <p className="text-[var(--color-text)] font-medium">
                No notifications
              </p>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                You're all caught up.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => markAsRead(notification.id)}
                  className={`w-full p-5 text-left transition-colors hover:bg-[var(--color-surface-alt)] ${
                    !notification.is_read
                      ? 'bg-[var(--color-primary)]/5'
                      : ''
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="mt-1">
                      {notification.is_read ? (
                        <CheckCircle
                          size={20}
                          className="text-[var(--color-text-muted)]"
                        />
                      ) : (
                        <Bell
                          size={20}
                          className="text-[var(--color-primary)]"
                        />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <p className="font-semibold text-[var(--color-text)]">
                          {notification.title}
                        </p>

                        {!notification.is_read && (
                          <span className="text-xs px-2 py-1 rounded-full bg-[var(--color-primary)] text-white">
                            New
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-[var(--color-text-muted)] mt-1">
                        {notification.message}
                      </p>

                      <p className="text-xs text-[var(--color-text-muted)] mt-3">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
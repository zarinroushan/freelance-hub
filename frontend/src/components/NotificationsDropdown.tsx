import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const [notifsRes, countRes] = await Promise.all([
          fetch('/api/notifications', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('unigigs_token')}` },
          }),
          fetch('/api/notifications/unread-count', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('unigigs_token')}` },
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
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('unigigs_token')}` },
      });
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error marking notification:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-[var(--color-surface-alt)] relative"
      >
        <Bell size={20} className="text-[var(--color-text)]" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg z-20 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-[var(--color-border)]">
              <h3 className="font-semibold text-[var(--color-text)]">Notifications</h3>
            </div>

            {notifications.length === 0 ? (
              <div className="p-8 text-center text-[var(--color-text-muted)]">
                <Bell size={32} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {notifications.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`w-full p-4 text-left hover:bg-[var(--color-surface-alt)] transition-colors ${
                      !notif.is_read ? 'bg-[var(--color-primary)]/5' : ''
                    }`}
                  >
                    <p className="font-medium text-sm text-[var(--color-text)] mb-1">
                      {notif.title}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {notif.message}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-2">
                      {new Date(notif.created_at).toLocaleDateString()}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
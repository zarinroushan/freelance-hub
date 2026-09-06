import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/context/AuthContext';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Settings, Bell, Shield, LogOut, AlertCircle } from 'lucide-react';

export function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [settings, setSettings] = useState({
    email_notifications: true,
    application_alerts: true,
    message_notifications: true,
    marketing_emails: false,
  });

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings({
      ...settings,
      [key]: value,
    });
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simulate saving settings - in a real app, this would call the backend
      // For now, just show a success message
      setMessage({ type: 'success', text: 'Settings saved successfully! ✅' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setLoading(false);
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text)] flex items-center mb-2">
          <Settings className="w-8 h-8 mr-3" />
          Settings
        </h1>
        <p className="text-[var(--color-text-muted)]">
          Manage your account preferences and notifications
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg border flex items-start ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-lg flex items-center">
              <Shield className="w-5 h-5 mr-2 text-[var(--color-primary)]" />
              Account Information
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] opacity-50 cursor-not-allowed"
              />
              <p className="text-xs text-[var(--color-text-muted)] mt-2">
                Your email address cannot be changed. Contact support if you need assistance.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Account Type
              </label>
              <input
                type="text"
                value={user?.role === 'student' ? 'Student / Freelancer' : 'Client'}
                disabled
                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] opacity-50 cursor-not-allowed"
              />
              <p className="text-xs text-[var(--color-text-muted)] mt-2">
                Your account type determines your access to features.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-lg flex items-center">
              <Bell className="w-5 h-5 mr-2 text-[var(--color-primary)]" />
              Notifications
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)]">
                  Email Notifications
                </label>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  Receive email updates about your account activity
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.email_notifications}
                onChange={(e) => handleSettingChange('email_notifications', e.target.checked)}
                className="w-5 h-5 rounded border-[var(--color-border)] text-[var(--color-primary)] cursor-pointer"
              />
            </div>

            <div className="border-t border-[var(--color-border)] pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)]">
                    Application Alerts
                  </label>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    Get notified when students apply for your gigs
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.application_alerts}
                  onChange={(e) => handleSettingChange('application_alerts', e.target.checked)}
                  className="w-5 h-5 rounded border-[var(--color-border)] text-[var(--color-primary)] cursor-pointer"
                />
              </div>
            </div>

            <div className="border-t border-[var(--color-border)] pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)]">
                    Message Notifications
                  </label>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    Get notified when you receive new messages
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.message_notifications}
                  onChange={(e) => handleSettingChange('message_notifications', e.target.checked)}
                  className="w-5 h-5 rounded border-[var(--color-border)] text-[var(--color-primary)] cursor-pointer"
                />
              </div>
            </div>

            <div className="border-t border-[var(--color-border)] pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)]">
                    Marketing Emails
                  </label>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    Receive promotional updates and feature announcements
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.marketing_emails}
                  onChange={(e) => handleSettingChange('marketing_emails', e.target.checked)}
                  className="w-5 h-5 rounded border-[var(--color-border)] text-[var(--color-primary)] cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-4">
              <Button onClick={handleSaveSettings} disabled={loading}>
                {loading ? 'Saving...' : 'Save Notification Settings'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-lg text-red-600">Danger Zone</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 mb-4">
                Logging out will clear your session. You'll need to log in again to access your account.
              </p>
              <Button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../services/context/AuthContext';
import api from '../../services/api';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { User, Mail, MapPin, Briefcase, Star, Edit2, Save } from 'lucide-react';

interface Profile {
  id: number;
  user_id: number;
  full_name: string;
  bio?: string;
  university?: string;
  avatar_url?: string;
  availability: string;
  completed_gigs_count: number;
  average_rating: number;
  total_earnings?: number;
  created_at?: string;
}

export function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    university: '',
    availability: 'available',
  });

useEffect(() => {
  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile/me');

      const data = response.data;

      setProfile(data);

      setFormData({
        full_name: data.full_name || '',
        bio: data.bio || '',
        university: data.university || '',
        availability: data.availability || 'available',
      });

    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  fetchProfile();
}, []);

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  setLoading(true);

  try {
    const response = await api.put(
      '/users/profile/me',
      formData
    );

    const updated = response.data;

    setProfile(updated);

    setIsEditing(false);

    alert('Profile updated successfully! ✅');

  } catch (error) {
    console.error('Error updating profile:', error);

    alert('Failed to update profile');

  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">My Profile</h1>
        <p className="text-[var(--color-text-muted)]">
          Manage your profile and showcase your skills
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Sidebar - Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6 text-center">
              {/* Avatar */}
              <div className="w-32 h-32 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full mx-auto mb-4 flex items-center justify-center">
                <User size={64} className="text-white" />
              </div>

              <h2 className="text-2xl font-bold text-[var(--color-text)] mb-1">
                {profile?.full_name || 'User'}
              </h2>
              <p className="text-[var(--color-text-muted)] mb-4">{user?.email}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-[var(--color-border)] mb-4">
                <div>
                  <div className="text-xl font-bold text-[var(--color-text)]">
                    {profile?.completed_gigs_count || 0}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">Completed</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-[var(--color-text)]">
                    {profile?.average_rating || '—'}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">Rating</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-[var(--color-text)]">
                    {profile?.total_earnings || 0}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">Earned</div>
                </div>
              </div>

              {/* Availability */}
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Briefcase size={16} className="text-[var(--color-text-muted)]" />
                <span className="text-sm text-[var(--color-text)] capitalize">
                  {profile?.availability || 'available'}
                </span>
              </div>

              <Button onClick={() => setIsEditing(!isEditing)}>
                <Edit2 size={16} className="mr-2" />
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </CardContent>
          </Card>

          {/* Skills Section */}
          <Card className="mt-6">
            <CardHeader>
              <h3 className="font-semibold">Skills</h3>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {['React', 'TypeScript', 'Node.js', 'Python', 'Figma'].map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm rounded-full"
                  >
                    {skill}
                  </span>
                ))}
                <button className="px-3 py-1 border border-[var(--color-border)] text-sm rounded-full hover:bg-[var(--color-surface-alt)]">
                  + Add
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Profile Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-lg">Profile Information</h3>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                      Bio
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      placeholder="Tell us about yourself..."
                      rows={6}
                      className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                      University
                    </label>
                    <input
                      type="text"
                      value={formData.university}
                      onChange={(e) => setFormData({...formData, university: e.target.value})}
                      placeholder="e.g., Mumbai University"
                      className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                      Availability
                    </label>
                    <select
                      value={formData.availability}
                      onChange={(e) => setFormData({...formData, availability: e.target.value})}
                      className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    >
                      <option value="available">Available for work</option>
                      <option value="busy">Busy</option>
                      <option value="unavailable">Not available</option>
                    </select>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button type="submit" disabled={loading}>
                      <Save size={16} className="mr-2" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-[var(--color-text-muted)] mb-2">About</h4>
                    <p className="text-[var(--color-text)]">
                      {profile?.bio || 'No bio added yet.'}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-[var(--color-text-muted)] mb-2">University</h4>
                    <p className="text-[var(--color-text)]">
                      {profile?.university || 'Not specified'}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-[var(--color-text-muted)] mb-2">Member Since</h4>
                    <p className="text-[var(--color-text)]">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Recently joined'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
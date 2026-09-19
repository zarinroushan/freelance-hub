import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../services/context/AuthContext';
import api from '../../services/api';
import { uploadImage, uploadFile } from '../../services/upload';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SkillsModal } from '../../components/profile/SkillsModal';
import {
  User,
  Briefcase,
  Edit2,
  Save,
  Camera,
  Plus,
  Sparkles,
  X,
  Loader2,
  FileText,
  Globe,
  UploadCloud,
  ExternalLink,
  Trash2,
} from 'lucide-react';

function GithubIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

interface Profile {
  id: number;
  user_id: number;
  full_name: string;
  bio?: string;
  university?: string;
  avatar_url?: string;
  resume_url?: string;
  portfolio_url?: string;
  github_url?: string;
  linkedin_url?: string;
  availability: string;
  completed_gigs_count: number;
  average_rating: number;
  total_earnings?: number;
  created_at?: string;
}

interface Review {
  id: number;
  rating: number;
  comment?: string;
  created_at: string;
}

interface UserSkillItem {
  id: number;
  name: string;
  category?: string;
}

export function ProfilePage() {
  const { userId } = useParams<{ userId?: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  
  // Skills state
  const [skills, setSkills] = useState<string[]>([]);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  
  // Cloudinary Upload state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    university: '',
    availability: 'available',
    portfolio_url: '',
    github_url: '',
    linkedin_url: '',
  });

  const isOwnProfile = !userId || (user && Number(userId) === user.id);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!isOwnProfile && userId) {
          const response = await api.get(`/users/${userId}`);
          const data = response.data;
          const email = data.user?.email || '';
          const fallbackName = email ? email.split('@')[0].replace('.', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase()) : `User #${userId}`;
          
          if (data.profile) {
            setProfile({
              ...data.profile,
              full_name: (data.profile.full_name && data.profile.full_name !== 'User') ? data.profile.full_name : fallbackName
            });
          } else {
            setProfile({
              id: 0,
              user_id: Number(userId),
              full_name: fallbackName,
              availability: 'available',
              completed_gigs_count: 0,
              average_rating: data.stats?.average_rating || 0,
            });
          }
          setUserEmail(email);
          if (data.skills) {
            setSkills(data.skills.map((s: UserSkillItem) => s.name));
          }
          const reviewsResponse = await api.get(`/reviews/user/${userId}`);
          setReviews(reviewsResponse.data);
        } else {
          const response = await api.get('/users/profile/me');
          const data = response.data;
          const email = user?.email || '';
          const fallbackName = email ? email.split('@')[0].replace('.', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase()) : 'Student User';
          
          const displayName = (data.full_name && data.full_name !== 'User') ? data.full_name : fallbackName;
          
          setProfile({
            ...data,
            full_name: displayName
          });
          setUserEmail(email);
          if (user) {
            const reviewsResponse = await api.get(`/reviews/user/${user.id}`);
            setReviews(reviewsResponse.data);
          }
          setFormData({
            full_name: displayName,
            bio: data.bio || '',
            university: data.university || '',
            availability: data.availability || 'available',
            portfolio_url: data.portfolio_url || '',
            github_url: data.github_url || '',
            linkedin_url: data.linkedin_url || '',
          });

          // Fetch user skills from dedicated endpoint
          try {
            const skillsResponse = await api.get('/users/profile/me/skills');
            setSkills(skillsResponse.data.map((s: UserSkillItem) => s.name));
          } catch (skillsErr) {
            console.error('Error loading skills:', skillsErr);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [userId, isOwnProfile, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put('/users/profile/me', formData);
      setProfile(response.data);
      setIsEditing(false);
      alert('Profile updated successfully! ✅');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Save skills to backend
  const handleSaveSkills = async (updatedSkills: string[]) => {
    try {
      const response = await api.put('/users/profile/me/skills', {
        skills: updatedSkills,
      });
      setSkills(response.data.map((s: UserSkillItem) => s.name));
    } catch (err) {
      console.error('Error saving skills:', err);
      alert('Failed to save skills');
    }
  };

  // Remove single skill directly
  const handleRemoveSkill = async (skillToRemove: string) => {
    const updated = skills.filter(s => s !== skillToRemove);
    setSkills(updated);
    try {
      await api.put('/users/profile/me/skills', { skills: updated });
    } catch (err) {
      console.error('Error removing skill:', err);
    }
  };

  // Handle Cloudinary Avatar Upload
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const result = await uploadImage(file, 'unigigs/avatars');
      const avatarUrl = result.url;

      const response = await api.put('/users/profile/me', {
        avatar_url: avatarUrl,
      });

      setProfile(response.data);
      alert('Profile photo updated successfully via Cloudinary! 📸');
    } catch (err) {
      console.error('Error uploading avatar to Cloudinary:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle Cloudinary Resume Upload
  const handleResumeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingResume(true);
    try {
      const result = await uploadFile(file, 'unigigs/resumes');
      const resumeUrl = result.url;

      const response = await api.put('/users/profile/me', {
        resume_url: resumeUrl,
      });

      setProfile(response.data);
      alert('Resume uploaded successfully via Cloudinary! 📄');
    } catch (err) {
      console.error('Error uploading resume to Cloudinary:', err);
      alert('Failed to upload resume file. Please try again.');
    } finally {
      setUploadingResume(false);
      if (resumeInputRef.current) {
        resumeInputRef.current.value = '';
      }
    }
  };

  // Remove resume
  const handleRemoveResume = async () => {
    if (!confirm('Are you sure you want to remove your resume?')) return;
    try {
      const response = await api.put('/users/profile/me', {
        resume_url: '',
      });
      setProfile(response.data);
    } catch (err) {
      console.error('Error removing resume:', err);
    }
  };

  const displayName = profile?.full_name && profile.full_name !== 'User'
    ? profile.full_name
    : (userEmail ? userEmail.split('@')[0].replace('.', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase()) : 'Student User');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarFileChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={resumeInputRef}
        onChange={handleResumeFileChange}
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,image/*"
        className="hidden"
      />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">My Profile</h1>
        <p className="text-[var(--color-text-muted)]">
          Manage your profile, showcase your skills, upload your resume, and link your professional profiles.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Sidebar - Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6 text-center">
              {/* Avatar with Cloudinary Upload */}
              <div className="relative w-32 h-32 mx-auto mb-4 group">
                <div className="w-32 h-32 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full flex items-center justify-center overflow-hidden shadow-md">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={64} className="text-white" />
                  )}
                </div>

                {isOwnProfile && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    title="Upload photo to Cloudinary"
                    className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                  >
                    {uploadingAvatar ? (
                      <Loader2 className="w-8 h-8 animate-spin" />
                    ) : (
                      <div className="flex flex-col items-center">
                        <Camera size={24} />
                        <span className="text-[10px] font-semibold mt-1">Upload</span>
                      </div>
                    )}
                  </button>
                )}
              </div>

              <h2 className="text-2xl font-bold text-[var(--color-text)] mb-1">
                {displayName}
              </h2>
              <p className="text-[var(--color-text-muted)] mb-4">{userEmail || user?.email}</p>

              {/* Links: Portfolio, GitHub & LinkedIn */}
              {(profile?.portfolio_url || profile?.github_url || profile?.linkedin_url) && (
                <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                  {profile.portfolio_url && (
                    <a
                      href={profile.portfolio_url.startsWith('http') ? profile.portfolio_url : `https://${profile.portfolio_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--color-surface-alt)] hover:bg-[var(--color-border)] text-xs font-semibold text-[var(--color-primary)] rounded-full transition-colors"
                      title="Portfolio Website"
                    >
                      <Globe size={13} /> Portfolio <ExternalLink size={10} />
                    </a>
                  )}
                  {profile.github_url && (
                    <a
                      href={profile.github_url.startsWith('http') ? profile.github_url : `https://${profile.github_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--color-surface-alt)] hover:bg-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] rounded-full transition-colors"
                      title="GitHub Profile"
                    >
                      <GithubIcon size={13} /> GitHub <ExternalLink size={10} />
                    </a>
                  )}
                  {profile.linkedin_url && (
                    <a
                      href={profile.linkedin_url.startsWith('http') ? profile.linkedin_url : `https://${profile.linkedin_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 text-xs font-semibold text-[#0A66C2] rounded-full transition-colors"
                      title="LinkedIn Profile"
                    >
                      <LinkedinIcon size={13} /> LinkedIn <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              )}

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
                    ₹{profile?.total_earnings || 0}
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

              {isOwnProfile && (
                <Button onClick={() => setIsEditing(!isEditing)} className="w-full">
                  <Edit2 size={16} className="mr-2" />
                  {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Skills Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <h3 className="font-semibold text-base text-[var(--color-text)] flex items-center gap-2">
                <Sparkles size={18} className="text-[var(--color-primary)]" />
                Skills
              </h3>
              {isOwnProfile && skills.length > 0 && (
                <button
                  onClick={() => setIsSkillsModalOpen(true)}
                  className="text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1"
                >
                  <Plus size={14} /> Manage
                </button>
              )}
            </CardHeader>
            <CardContent>
              {skills.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs text-[var(--color-text-muted)] mb-3">
                    No skills added to your profile yet.
                  </p>
                  {isOwnProfile && (
                    <button
                      onClick={() => setIsSkillsModalOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white text-xs font-semibold rounded-xl hover:bg-[var(--color-primary)]/90 transition-all shadow-sm"
                    >
                      <Plus size={16} /> Add Skills
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--color-primary-light)] text-[var(--color-primary)] text-xs font-medium rounded-full border border-[var(--color-primary)]/20"
                    >
                      {skill}
                      {isOwnProfile && (
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          title="Remove skill"
                          className="hover:text-red-500 rounded-full p-0.5"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </span>
                  ))}
                  {isOwnProfile && (
                    <button
                      onClick={() => setIsSkillsModalOpen(true)}
                      className="px-3 py-1 border border-dashed border-[var(--color-primary)] text-[var(--color-primary)] text-xs font-medium rounded-full hover:bg-[var(--color-primary-light)] transition-colors flex items-center gap-1"
                    >
                      <Plus size={12} /> Add
                    </button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reviews Card */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-base">Reviews</h3>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <p className="text-sm text-[var(--color-text-muted)]">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map(review => (
                    <div
                      key={review.id}
                      className="border-b border-[var(--color-border)] last:border-0 pb-3 last:pb-0"
                    >
                      <div className="font-medium text-[var(--color-warning)]">
                        {'★'.repeat(review.rating)}
                        {'☆'.repeat(5 - review.rating)}
                      </div>
                      {review.comment && (
                        <p className="text-sm text-[var(--color-text)] mt-1">
                          {review.comment}
                        </p>
                      )}
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content (Right Side) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information Card */}
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
                      onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="e.g. Alex Sharma"
                      className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                      Bio
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={e => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      rows={5}
                      className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                      University / College
                    </label>
                    <input
                      type="text"
                      value={formData.university}
                      onChange={e => setFormData({ ...formData, university: e.target.value })}
                      placeholder="e.g., Mumbai University"
                      className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                  </div>

                  {/* Professional Links */}
                  <div className="border-t border-[var(--color-border)] pt-5 space-y-4">
                    <h4 className="text-sm font-semibold text-[var(--color-text)] uppercase tracking-wider">
                      Professional Links
                    </h4>

                    <div>
                      <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                        Portfolio URL / Personal Website
                      </label>
                      <input
                        type="url"
                        value={formData.portfolio_url}
                        onChange={e => setFormData({ ...formData, portfolio_url: e.target.value })}
                        placeholder="https://myportfolio.dev"
                        className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                        GitHub Profile URL
                      </label>
                      <input
                        type="url"
                        value={formData.github_url}
                        onChange={e => setFormData({ ...formData, github_url: e.target.value })}
                        placeholder="https://github.com/username"
                        className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                        LinkedIn Profile URL
                      </label>
                      <input
                        type="url"
                        value={formData.linkedin_url}
                        onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                      Availability
                    </label>
                    <select
                      value={formData.availability}
                      onChange={e => setFormData({ ...formData, availability: e.target.value })}
                      className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    >
                      <option value="available">Available for work</option>
                      <option value="busy">Busy</option>
                      <option value="unavailable">Not available</option>
                    </select>
                  </div>

                  <div className="flex space-x-3 pt-4 border-t border-[var(--color-border)]">
                    <Button type="submit" disabled={loading}>
                      <Save size={16} className="mr-2" />
                      {loading ? 'Saving...' : 'Save Profile Changes'}
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
                    <p className="text-[var(--color-text)] leading-relaxed">
                      {profile?.bio || 'No bio added yet.'}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-[var(--color-text-muted)] mb-2">University / Institution</h4>
                    <p className="text-[var(--color-text)] font-medium">
                      {profile?.university || 'Not specified'}
                    </p>
                  </div>

                  {/* Professional Links */}
                  <div>
                    <h4 className="text-sm font-medium text-[var(--color-text-muted)] mb-2">Professional Links</h4>
                    {(!profile?.portfolio_url && !profile?.github_url && !profile?.linkedin_url) ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[var(--color-text-muted)]">No links added yet.</span>
                        {isOwnProfile && (
                          <button
                            onClick={() => setIsEditing(true)}
                            className="text-xs font-semibold text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
                          >
                            <Plus size={12} /> Add Links
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        {profile?.portfolio_url && (
                          <a
                            href={profile.portfolio_url.startsWith('http') ? profile.portfolio_url : `https://${profile.portfolio_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-surface-alt)] border border-[var(--color-border)] hover:border-[var(--color-primary)] text-sm font-medium text-[var(--color-primary)] rounded-lg transition-colors"
                          >
                            <Globe size={16} /> Portfolio Website <ExternalLink size={12} />
                          </a>
                        )}

                        {profile?.github_url && (
                          <a
                            href={profile.github_url.startsWith('http') ? profile.github_url : `https://${profile.github_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-surface-alt)] border border-[var(--color-border)] hover:border-[var(--color-text)] text-sm font-medium text-[var(--color-text)] rounded-lg transition-colors"
                          >
                            <GithubIcon size={16} /> GitHub Profile <ExternalLink size={12} />
                          </a>
                        )}

                        {profile?.linkedin_url && (
                          <a
                            href={profile.linkedin_url.startsWith('http') ? profile.linkedin_url : `https://${profile.linkedin_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0A66C2]/10 border border-[#0A66C2]/20 hover:bg-[#0A66C2]/20 text-sm font-medium text-[#0A66C2] rounded-lg transition-colors"
                          >
                            <LinkedinIcon size={16} /> LinkedIn Profile <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    )}
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

          {/* Resume / CV Section (DIRECTLY UNDER Profile Information) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <h3 className="font-semibold text-lg text-[var(--color-text)] flex items-center gap-2">
                <FileText size={20} className="text-[var(--color-primary)]" />
                Resume / CV
              </h3>
            </CardHeader>
            <CardContent>
              {profile?.resume_url ? (
                <div className="p-4 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden pr-2">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
                      <FileText size={22} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold text-[var(--color-text)] truncate">
                        Resume Document
                      </p>
                      <a
                        href={profile.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[var(--color-primary)] hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        View / Download Resume <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>

                  {isOwnProfile && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => resumeInputRef.current?.click()}
                        disabled={uploadingResume}
                        title="Upload new resume via Cloudinary"
                        className="px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] text-xs font-medium text-[var(--color-text)] rounded-lg transition-colors flex items-center gap-1"
                      >
                        {uploadingResume ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                        Replace
                      </button>
                      <button
                        onClick={handleRemoveResume}
                        title="Remove resume"
                        className="p-2 text-[var(--color-text-muted)] hover:text-red-500 rounded-lg hover:bg-[var(--color-border)] transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 border-2 border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-surface-alt)]/40">
                  <FileText className="w-10 h-10 mx-auto text-[var(--color-text-muted)] mb-2" />
                  <p className="text-sm font-medium text-[var(--color-text)] mb-1">
                    No Resume Uploaded Yet
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] max-w-md mx-auto mb-4">
                    Upload your PDF, DOC, or Image resume using Cloudinary to showcase your experience directly to potential clients.
                  </p>
                  {isOwnProfile && (
                    <button
                      onClick={() => resumeInputRef.current?.click()}
                      disabled={uploadingResume}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] text-white text-xs font-semibold rounded-xl hover:bg-[var(--color-primary-dark)] transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      {uploadingResume ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Uploading to Cloudinary...
                        </>
                      ) : (
                        <>
                          <UploadCloud size={16} /> Upload Resume (PDF / DOC / Image)
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Skills Enum Modal */}
      <SkillsModal
        isOpen={isSkillsModalOpen}
        onClose={() => setIsSkillsModalOpen(false)}
        currentSkills={skills}
        onSave={handleSaveSkills}
      />
    </div>
  );
}
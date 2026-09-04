import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

export function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'client'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await register(email, password, role);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Cherry Blossom Decoration */}
      <div className="absolute top-20 right-10 text-5xl opacity-20">🌸</div>
      <div className="absolute bottom-20 left-10 text-4xl opacity-20">🌸</div>

      <div className="max-w-md w-full">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2 mb-4">
              <span className="text-3xl">🌸</span>
              <span className="text-2xl font-bold text-[var(--color-text)]">UniGigs</span>
            </Link>
            <h2 className="text-2xl font-bold text-[var(--color-text)]">Create Account</h2>
            <p className="text-[var(--color-text-muted)] mt-2">
              Join the student freelance community
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-[var(--color-error)]/10 border border-[var(--color-error)] text-[var(--color-error)] px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              icon={<User size={18} />}
            />

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              icon={<Mail size={18} />}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              icon={<Lock size={18} />}
            />

            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              icon={<Lock size={18} />}
            />

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                I want to...
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`p-4 border-2 rounded-xl text-center transition-all ${
                    role === 'student'
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                      : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'
                  }`}
                >
                  <div className="text-2xl mb-2">🎓</div>
                  <div className="font-medium">Find Work</div>
                  <div className="text-xs text-[var(--color-text-muted)] mt-1">As a freelancer</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('client')}
                  className={`p-4 border-2 rounded-xl text-center transition-all ${
                    role === 'client'
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                      : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'
                  }`}
                >
                  <div className="text-2xl mb-2">💼</div>
                  <div className="font-medium">Hire Talent</div>
                  <div className="text-xs text-[var(--color-text-muted)] mt-1">Post gigs</div>
                </button>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              <label htmlFor="terms" className="text-sm text-[var(--color-text-muted)]">
                I agree to the{' '}
                <a href="#" className="text-[var(--color-primary)] hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-[var(--color-primary)] hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--color-border)]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[var(--color-surface)] text-[var(--color-text-muted)]">
                Or sign up with
              </span>
            </div>
          </div>

          {/* Social Signup (Placeholder) */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center px-4 py-2 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-alt)] transition-colors">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center px-4 py-2 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-alt)] transition-colors">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </button>
          </div>

          {/* Login Link */}
          <p className="mt-8 text-center text-sm text-[var(--color-text-muted)]">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--color-primary)] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
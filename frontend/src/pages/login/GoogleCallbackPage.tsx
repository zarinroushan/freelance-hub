import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../services/context/AuthContext';

export function GoogleCallbackPage() {
  const { loginWithGoogleCode } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('Completing Google sign-in...');

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      setError('Google sign-in could not be completed.');
      return;
    }

    loginWithGoogleCode(code)
      .then(() => navigate('/dashboard', { replace: true }))
      .catch((loginError: Error) => setError(loginError.message))
  }, [loginWithGoogleCode, navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <p className="text-[var(--color-text-muted)]">{error}</p>
    </div>
  );
}

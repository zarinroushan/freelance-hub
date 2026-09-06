
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import type { User } from '../../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    role: 'student' | 'client'
  ) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'unigigs_user';
const TOKEN_STORAGE_KEY = 'unigigs_token';

// Change this if your backend uses a different port or route
const API_URL = 'http://localhost:8000/api/auth';

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load saved login when the app starts
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Failed to load saved authentication:', error);

      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  // REGISTER
  const register = async (
    email: string,
    password: string,
    role: 'student' | 'client'
  ): Promise<void> => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      throw new Error('Email and password are required.');
    }

    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: normalizedEmail,
        password,
        role,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Registration failed.');
    }

    const authData = data as AuthResponse;

    localStorage.setItem(
      TOKEN_STORAGE_KEY,
      authData.access_token
    );

    localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify(authData.user)
    );

    setUser(authData.user);
  };

  // LOGIN
  const login = async (
    email: string,
    password: string
  ): Promise<void> => {
    const normalizedEmail = email.trim().toLowerCase();

    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: normalizedEmail,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || 'Invalid email or password.'
      );
    }

    const authData = data as AuthResponse;

    localStorage.setItem(
      TOKEN_STORAGE_KEY,
      authData.access_token
    );

    localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify(authData.user)
    );

    setUser(authData.user);
  };

  // LOGOUT
  const logout = (): void => {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
// Add these exports for other components to use
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

export const getUser = (): User | null => {
  const user = localStorage.getItem(USER_STORAGE_KEY);
  return user ? JSON.parse(user) : null;
};
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
}


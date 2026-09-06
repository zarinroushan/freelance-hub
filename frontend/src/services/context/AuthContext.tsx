import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'unigigs_user';
const USERS_STORAGE_KEY = 'unigigs_users';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load saved login when the app starts
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Failed to load saved user:', error);
      localStorage.removeItem(USER_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  // REGISTER
  const register = async (
    email: string,
    password: string,
    role: 'student' | 'client'
  ) => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      throw new Error('Email and password are required.');
    }

    // Get existing users
    const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);

    const users: Array<{
      id: number;
      email: string;
      password: string;
      role: 'student' | 'client';
      is_active: boolean;
      created_at: string;
    }> = savedUsers ? JSON.parse(savedUsers) : [];

    // Check duplicate email
    const existingUser = users.find(
      (existing) => existing.email === normalizedEmail
    );

    if (existingUser) {
      throw new Error('An account with this email already exists.');
    }

    // Create user
    const newUser = {
      id: Date.now(),
      email: normalizedEmail,
      password,
      role,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    // Save account
    localStorage.setItem(
      USERS_STORAGE_KEY,
      JSON.stringify([...users, newUser])
    );

    // Save logged-in user WITHOUT password
    const loggedInUser: User = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      is_active: newUser.is_active,
      created_at: newUser.created_at,
    };

    localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify(loggedInUser)
    );

    setUser(loggedInUser);
  };

  // LOGIN
  const login = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();

    const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);

    const users: Array<{
      id: number;
      email: string;
      password: string;
      role: 'student' | 'client';
      is_active: boolean;
      created_at: string;
    }> = savedUsers ? JSON.parse(savedUsers) : [];

    const existingUser = users.find(
      (savedUser) =>
        savedUser.email === normalizedEmail &&
        savedUser.password === password
    );

    if (!existingUser) {
      throw new Error('Invalid email or password.');
    }

    // Save logged-in user WITHOUT password
    const loggedInUser: User = {
      id: existingUser.id,
      email: existingUser.email,
      role: existingUser.role,
      is_active: existingUser.is_active,
      created_at: existingUser.created_at,
    };

    localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify(loggedInUser)
    );

    setUser(loggedInUser);
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem(USER_STORAGE_KEY);
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

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
import api from './api';
import type { User } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  role: 'student' | 'client';
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    const { access_token, user } = response.data;
    
    localStorage.setItem('unigigs_token', access_token);
    localStorage.setItem('unigigs_user', JSON.stringify(user));
    
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    const { access_token, user } = response.data;
    
    localStorage.setItem('unigigs_token', access_token);
    localStorage.setItem('unigigs_user', JSON.stringify(user));
    
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('unigigs_token');
    localStorage.removeItem('unigigs_user');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('unigigs_token');
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('unigigs_user');
    return userStr ? JSON.parse(userStr) : null;
  },
};
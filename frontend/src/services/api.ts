import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');
export const API_BASE_URL = configuredApiUrl ? `${configuredApiUrl}/api` : '/api';

export function apiFetch(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  const token = localStorage.getItem('unigigs_token');

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(`${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`, {
    ...options,
    headers,
  });
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests - FIXED: Use correct storage key
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('unigigs_token');  // ✅ FIXED
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('unigigs_token');  // ✅ FIXED
      localStorage.removeItem('unigigs_user');   // ✅ FIXED
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
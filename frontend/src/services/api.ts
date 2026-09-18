import axios from 'axios';

// Use environment variable VITE_API_URL if set (e.g. https://unigigs-backend-9pgj.onrender.com/api)
// Strip trailing slash if present
export const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getAuthToken = (): string | null => {
  return localStorage.getItem('unigigs_token') || localStorage.getItem('token');
};

// Add token to requests
api.interceptors.request.use((config) => {
  const token = getAuthToken();
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
      localStorage.removeItem('unigigs_token');
      localStorage.removeItem('unigigs_user');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
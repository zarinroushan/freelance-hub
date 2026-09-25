import axios from 'axios';

// Use environment variable VITE_API_URL if set (e.g. https://unigigs-backend-9pgj.onrender.com/api)
// Ensure base URL always ends with /api
const getApiBaseUrl = (): string => {
  const envUrl = (import.meta.env.VITE_API_URL || '/api').trim().replace(/\/+$/, '');
  if (!envUrl) return '/api';
  return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
};

export const API_BASE_URL = getApiBaseUrl();

export const getAuthToken = (): string | null => {
  return localStorage.getItem('unigigs_token') || localStorage.getItem('token');
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Add authentication token to every request
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle authentication errors
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
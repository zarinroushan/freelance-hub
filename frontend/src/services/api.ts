import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
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
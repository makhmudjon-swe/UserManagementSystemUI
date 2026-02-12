import axios from 'axios';

declare global {
  interface ImportMeta {
    env: {
      VITE_API_BASE_URL?: string;
    };
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (window.location.hostname === 'localhost' ? '/api' : 'https://user-management-system-17ls.onrender.com/api');
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.dispatchEvent(new CustomEvent('api-unauthorized', { detail: { status: 401 } }));
    }
    return Promise.reject(error);
  }
);

export default api;
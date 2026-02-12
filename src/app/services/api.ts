import axios from "axios";

// Base API configuration - production vs development
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://user-management-system-17ls.onrender.com/api' 
  : '/api'; // Vite dev server proxy 

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 
    "Content-Type": "application/json",
    "Accept": "application/json"
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const isAuthEndpoint =
    config.url?.includes("/auth/login") ||
    config.url?.includes("/auth/register") ||
    config.url?.includes("/auth/confirm-email");

  if (token && !isAuthEndpoint) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

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

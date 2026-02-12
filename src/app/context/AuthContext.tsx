import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/app/services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = authService.getToken();
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      
      if (!response.token) {
        throw new Error('No token received from server');
      }
      
      localStorage.setItem('token', response.token);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const register = async (fullName: string, email: string, password: string) => {
    try {
      await authService.register({ fullName, email, password });
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    if (window.location.pathname !== '/login') {
      navigate('/login');
    }
  };

  useEffect(() => {
    const handleUnauthorized = () => {
      authService.logout();
      setIsAuthenticated(false);
      if (window.location.pathname !== '/login') {
        navigate('/login');
      }
    };

    const handleApiError = (event: CustomEvent) => {
      if (event.detail?.status === 401) {
        handleUnauthorized();
      }
    };

    window.addEventListener('api-unauthorized', handleApiError as EventListener);
    return () => {
      window.removeEventListener('api-unauthorized', handleApiError as EventListener);
    };
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, register, logout, loading }}>
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
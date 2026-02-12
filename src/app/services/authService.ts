import api from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface ConfirmEmailResponse {
  message: string;
}

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', data);
      
      if (!response.data.token) {
        throw new Error('Server did not return a token');
      }
      
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Register user
  register: async (data: RegisterRequest): Promise<{ message: string }> => {
    try {
      console.log('Sending registration data:', data);
      const response = await api.post<{ message: string }>('/auth/register', data);
      console.log('Registration response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Registration API error:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  confirmEmail: async (token: string): Promise<ConfirmEmailResponse> => {
    const response = await api.get<ConfirmEmailResponse>(`/auth/confirm-email?token=${token}`);
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem('token');
  },

  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },
};
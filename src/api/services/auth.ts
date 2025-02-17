import { apiClient } from '../client';
import { authStore } from '../../store/auth';
import { ApiResponse } from '../types';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface AuthResponse {
  token: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
}

export const authService = {
  login: (credentials: LoginRequest) => {
    return apiClient.post<AuthResponse>('/Auth/Login', credentials);
  },

  forgotPassword: (email: string) => {
    return apiClient.post<void>('/auth/forgot-password', { email });
  },

  logout: async () => {
    await authStore.clearAuth();
    // Kullanıcıyı login ekranına yönlendir
  },

  register: (data: RegisterRequest) => {
    return apiClient.post<AuthResponse>('/Auth/Register', data);
  },
}; 
import { API_URL, API_CONFIG } from './config';
import { ApiResponse } from './types';
import { Toast, ToastType } from 'react-native-toast-notifications';
import { authStore } from '../store/auth';
import { navigationRef, navigateToLogin } from '../navigation/RootNavigation';

declare global {
  var toast: ToastType;
}

type HeadersInit_ = Headers | string[][] | Record<string, string>;

class ApiClient {
  private static instance: ApiClient;
  private toast: ToastType;

  private constructor() {
    this.toast = global.toast;
  }

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private async getHeaders(): Promise<HeadersInit_> {
    const token = await authStore.getToken();
    return {
      ...API_CONFIG.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getHeaders();
      const url = `${API_URL}${endpoint}`;
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (response.status === 401) {
        console.log('401 Unauthorized error detected - Logging out user');
        await authStore.clearAuth();
        this.toast?.show('Oturum süreniz doldu. Lütfen tekrar giriş yapın.', {
          type: 'danger',
          placement: 'top',
          duration: 4000,
        });
        
        navigateToLogin();
        
        throw new Error('Oturum süresi doldu');
      }

      const data: ApiResponse<T> = await response.json();

      if (!data.isSuccess) {
        this.toast?.show(data.message || 'İşlem başarısız', {
          type: 'danger',
        });
        throw new Error(data.message || 'API Error');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        this.toast?.show(error.message, {
          type: 'danger',
          placement: 'top',
          duration: 4000,
        });
      } else {
        this.toast?.show('Beklenmeyen bir hata oluştu', {
          type: 'danger',
          placement: 'top',
          duration: 4000,
        });
      }
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      // Ensure body can be properly stringified
      const jsonBody = JSON.stringify(body);
      
      return this.request<T>(endpoint, {
        method: 'POST',
        body: jsonBody,
      });
    } catch (error) {
      console.error('Error stringifying request body:', error);
      throw new Error('Invalid request data: Could not convert to JSON');
    }
  }

  async put<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      // Ensure body can be properly stringified
      const jsonBody = JSON.stringify(body);
      
      return this.request<T>(endpoint, {
        method: 'PUT',
        body: jsonBody,
      });
    } catch (error) {
      console.error('Error stringifying request body:', error);
      throw new Error('Invalid request data: Could not convert to JSON');
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = ApiClient.getInstance(); 
import { API_URL } from './config';
import { navigateToLogin } from '../navigation/RootNavigation';
import Toast from 'react-native-toast-message';
import { Alert } from 'react-native';
import { authStore } from '../store/auth';

// HeadersInit tipini tanımla
type HeadersInit = Headers | Record<string, string> | string[][];

// API yanıt tipi
export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string | null;
  data: T;
  statusCode: number;
}

// İstek seçenekleri için interface
interface RequestOptions {
  requiresAuth?: boolean;
  customHeaders?: Record<string, string>;
}

export class ApiClient {
  private baseUrl: string | undefined;
  private loading: boolean = false;

  constructor(baseUrl: string | undefined = API_URL) {
    this.baseUrl = baseUrl;
  }

  get isLoading(): boolean {
    return this.loading;
  }

  set isLoading(value: boolean) {
    this.loading = value;
  }

  private async getHeaders(options: RequestOptions = {}): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (options.requiresAuth !== false) {
      const token = await authStore.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    if (options.customHeaders) {
      Object.assign(headers, options.customHeaders);
    }

    return headers;
  }

  async clearAuth(): Promise<void> {
    await authStore.clearAuth();
  }

  async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    try {
      if (!this.baseUrl) {
        throw new Error('API URL is not defined');
      }
      
      const url = `${this.baseUrl}${endpoint}`;
      const headers = await this.getHeaders(options);
      
      const config: RequestInit = {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      };
      
      this.isLoading = true;
      
      const response = await fetch(url, config);
      
      // 401 veya 403 hatası kontrolü
      if (response.status === 401 || response.status === 403) {
        console.error(`Authentication error: ${response.status} ${response.statusText}`);
        
        // Auth verilerini temizle
        await this.clearAuth();
        
        // Kullanıcıya bilgi ver
        Toast.show({
          type: 'error',
          text1: 'Oturum süresi doldu',
          text2: 'Lütfen tekrar giriş yapın',
          visibilityTime: 3000,
          autoHide: true,
        });
        
        // Navigasyon işlemini bir timeout ile yap (toast mesajının görünmesi için)
        setTimeout(() => {
          try {
            const result = navigateToLogin();
            console.log('Navigation result:', result);
          } catch (navError) {
            console.error('Navigation error:', navError);
            // Fallback olarak alert göster
            Alert.alert(
              'Oturum Hatası',
              'Oturumunuz sona erdi. Lütfen uygulamayı yeniden başlatın ve tekrar giriş yapın.',
              [{ text: 'Tamam', onPress: () => console.log('OK Pressed') }]
            );
          }
        }, 1000);
        
        // Hata fırlatmak yerine başarısız yanıt döndür
        return {
          isSuccess: false,
          message: 'Oturum süresi doldu. Lütfen tekrar giriş yapın.',
          data: null as unknown as T,
          statusCode: response.status
        };
      }
      
      // Yanıt başarılı değilse
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error: ${response.status} ${response.statusText}`, errorText);
        return {
          isSuccess: false,
          message: errorText || `API error: ${response.status} ${response.statusText}`,
          data: null as unknown as T,
          statusCode: response.status
        };
      }
      
      // Content-Type kontrolü
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Response is not JSON:', contentType);
        const text = await response.text();
        try {
          // Yine de JSON olarak parse etmeyi dene
          const parsedData = JSON.parse(text);
          return {
            isSuccess: true,
            data: parsedData as T,
            message: null,
            statusCode: response.status
          };
        } catch (e) {
          console.error('Failed to parse non-JSON response:', text);
          return {
            isSuccess: false,
            message: 'Invalid response format from server',
            data: null as unknown as T,
            statusCode: response.status
          };
        }
      }
      
      const result = await response.json();
      
      // API yanıt formatını kontrol et
      if (result.hasOwnProperty('isSuccess')) {
        // Zaten ApiResponse formatında, statusCode ekle
        return {
          ...result,
          statusCode: response.status
        } as ApiResponse<T>;
      } else {
        // ApiResponse formatına dönüştür
        return {
          isSuccess: true,
          data: result as T,
          message: null,
          statusCode: response.status
        };
      }
    } catch (error) {
      console.error('Request error:', error);
      
      // Hata yanıtını ApiResponse formatına dönüştür
      return {
        isSuccess: false,
        message: error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu',
        data: null as unknown as T,
        statusCode: 500
      };
    } finally {
      this.isLoading = false;
    }
  }

  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  async post<T>(endpoint: string, body: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, body, options);
  }

  async put<T>(endpoint: string, body: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, body, options);
  }

  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }
}

// Singleton instance
export const apiClient = new ApiClient(); 
export interface ApiResponse<T> {
  isSuccess: boolean;
  data: T;
  message: string | null;
  statusCode?: number;
}

export interface GoogleLoginRequest {
  idToken: string;
  email: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
} 
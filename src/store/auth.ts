import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEY = 'auth_data';

interface User {
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
}

interface AuthData {
  token: string;
  user: User;
}

export const authStore = {
  async setAuth(data: AuthData) {
    try {
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  },

  async getAuth(): Promise<AuthData | null> {
    try {
      const data = await AsyncStorage.getItem(AUTH_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting auth data:', error);
      return null;
    }
  },

  async getToken(): Promise<string | null> {
    try {
      const data = await this.getAuth();
      return data ? data.token : null;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  async clearAuth() {
    try {
      await AsyncStorage.removeItem(AUTH_KEY);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  },
}; 
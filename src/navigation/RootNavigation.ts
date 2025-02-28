import { createNavigationContainerRef } from '@react-navigation/native';
import { Alert } from 'react-native';
import { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// Güvenli navigasyon yardımcı fonksiyonu
export function navigateToLogin() {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  } else {
    // Navigasyon hazır değilse, kullanıcıya bilgi ver
    Alert.alert(
      'Oturum Süresi Doldu',
      'Oturumunuz sona erdi. Lütfen uygulamayı yeniden başlatın ve tekrar giriş yapın.'
    );
  }
} 
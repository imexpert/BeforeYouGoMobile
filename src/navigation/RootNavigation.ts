import { createRef } from 'react';
import { NavigationContainerRef, CommonActions } from '@react-navigation/native';
import { RootStackParamList } from './types';
import { Alert } from 'react-native';

// NavigationContainer için ref oluştur
export const navigationRef = createRef<NavigationContainerRef<RootStackParamList>>();

// Login sayfasına yönlendirme fonksiyonu
export function navigateToLogin() {
  try {
    console.log('Attempting to navigate to Login screen');
    
    // Navigation hazır mı kontrol et
    if (!navigationRef.current) {
      console.error('Navigation reference is not initialized');
      Alert.alert(
        'Navigasyon Hatası',
        'Navigasyon referansı başlatılmadı. Lütfen uygulamayı yeniden başlatın.',
        [{ text: 'Tamam', onPress: () => console.log('OK Pressed') }]
      );
      return false;
    }
    
    if (!navigationRef.current.isReady()) {
      console.warn('Navigation is not ready yet, cannot navigate to Login');
      
      // Navigation hazır değilse, bir süre sonra tekrar dene
      setTimeout(() => {
        try {
          if (navigationRef.current && navigationRef.current.isReady()) {
            console.log('Navigation is now ready, navigating to Login screen');
            
            // React Navigation 7.x için güncellenmiş reset işlemi
            navigationRef.current.resetRoot({
              routes: [{ name: 'LoginForm' }],
            });
            
            console.log('Successfully reset navigation to Login screen');
          } else {
            console.error('Navigation still not ready after timeout');
            // Kullanıcıya bilgi ver
            Alert.alert(
              'Oturum Süresi Doldu',
              'Oturumunuz sona erdi. Lütfen uygulamayı yeniden başlatın ve tekrar giriş yapın.',
              [{ text: 'Tamam', onPress: () => console.log('OK Pressed') }]
            );
          }
        } catch (innerError) {
          console.error('Error in delayed navigation:', innerError);
          Alert.alert(
            'Navigasyon Hatası',
            'Navigasyon işlemi sırasında bir hata oluştu. Lütfen uygulamayı yeniden başlatın.',
            [{ text: 'Tamam', onPress: () => console.log('OK Pressed') }]
          );
        }
      }, 500);
      
      return false;
    }
    
    console.log('Navigation is ready, navigating to Login screen');
    
    // React Navigation 7.x için güncellenmiş reset işlemi
    navigationRef.current.resetRoot({
      routes: [{ name: 'LoginForm' }],
    });
    
    console.log('Successfully reset navigation to Login screen');
    return true;
  } catch (error) {
    console.error('Error navigating to Login:', error);
    
    // Hata durumunda kullanıcıya bilgi ver
    Alert.alert(
      'Oturum Süresi Doldu',
      'Oturumunuz sona erdi. Lütfen uygulamayı yeniden başlatın ve tekrar giriş yapın.',
      [{ text: 'Tamam', onPress: () => console.log('OK Pressed') }]
    );
    
    return false;
  }
}

// Diğer navigasyon fonksiyonları buraya eklenebilir
export function navigate(name: keyof RootStackParamList, params?: any) {
  if (navigationRef.current) {
    navigationRef.current.navigate(name, params);
  } else {
    console.warn('Cannot navigate, navigation is not ready');
  }
} 
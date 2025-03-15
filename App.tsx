/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ToastProvider } from 'react-native-toast-notifications';
import { navigationRef } from './src/navigation/RootNavigation';
import { authStore } from './src/store/auth';

// i18n'i en başta import et
import './src/translations/i18n';

// StackNavigator'ı import edelim
import StackNavigator from './src/navigation/StackNavigator';

function App(): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();

    // Periyodik token kontrolü (her 5 dakikada bir)
    const tokenCheckInterval = setInterval(() => {
      checkAuth();
    }, 5 * 60 * 1000); // 5 dakika

    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, []);

  const checkAuth = async () => {
    try {
      const token = await authStore.getToken();
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#5D5FEF" />
      </View>
    );
  }

  return (
    <ToastProvider
      placement="top"
      duration={4000}
      animationType="slide-in"
    >
      <NavigationContainer ref={navigationRef}>
        <StackNavigator initialAuth={isAuthenticated} />
      </NavigationContainer>
    </ToastProvider>
  );
}

export default App;

/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
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
  }, []);

  const checkAuth = async () => {
    const token = await authStore.getToken();
    setIsAuthenticated(!!token);
    setIsLoading(false);
  };

  if (isLoading) {
    return <View style={{ flex: 1 }} />;
  }

  return (
    <ToastProvider
      placement="top"
      duration={4000}
      animationType="slide-in"
    >
      <NavigationContainer ref={navigationRef}>
        <StackNavigator />
      </NavigationContainer>
    </ToastProvider>
  );
}

export default App;

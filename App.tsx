/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ToastProvider } from 'react-native-toast-notifications';
import { navigationRef } from './src/navigation/RootNavigation';
import { authStore } from './src/store/auth';
import './src/translations/i18n';

// Screen imports
import LoginScreen from './src/screens/LoginScreen';
import LoginFormScreen from './src/screens/LoginFormScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import DrawerNavigator from './src/navigation/DrawerNavigator';

const Stack = createNativeStackNavigator();

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
    return <View style={styles.background} />;
  }

  return (
    <ToastProvider
      placement="top"
      duration={4000}
      animationType="slide-in"
    >
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator 
          screenOptions={{ headerShown: false }}
          initialRouteName={isAuthenticated ? 'Main' : 'Welcome'}
        >
          <Stack.Screen name="Welcome" component={LoginScreen} />
          <Stack.Screen name="LoginForm" component={LoginFormScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="Main" component={DrawerNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </ToastProvider>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export default App;

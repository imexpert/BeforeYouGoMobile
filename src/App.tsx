import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './navigation/RootNavigation';
import { LogBox } from 'react-native';
import Toast from 'react-native-toast-message';
import StackNavigator from './navigation/StackNavigator';
import { authStore } from './store/auth';

// Bazı uyarıları görmezden gel (isteğe bağlı)
LogBox.ignoreLogs([
  'Sending `onAnimatedValueUpdate` with no listeners registered',
  'Non-serializable values were found in the navigation state',
]);

const App = () => {
  const [initialAuth, setInitialAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await authStore.getAuth();
      setInitialAuth(!!auth?.token);
    };
    checkAuth();
  }, []);

  return (
    <>
      <NavigationContainer ref={navigationRef}>
        <StackNavigator initialAuth={initialAuth} />
      </NavigationContainer>
      <Toast />
    </>
  );
};

export default App; 
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { navigationRef } from './navigation/RootNavigation';
import { RootStackParamList } from './navigation/types';
import { LogBox } from 'react-native';
import Toast from 'react-native-toast-message';

// Gerçek ekranları import et
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import CreateActivityScreen from './screens/CreateActivityScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import LoginFormScreen from './screens/LoginFormScreen';
import RegisterScreen from './screens/RegisterScreen';

// Bazı uyarıları görmezden gel (isteğe bağlı)
LogBox.ignoreLogs([
  'Sending `onAnimatedValueUpdate` with no listeners registered',
  'Non-serializable values were found in the navigation state',
]);

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  // NavigationContainer'ın hazır olduğunu kontrol et
  useEffect(() => {
    const checkNavigation = () => {
      if (navigationRef.current && navigationRef.current.isReady()) {
        console.log('Navigation is ready in App component');
        
        // Mevcut route'ları kontrol et ve logla
        const routes = navigationRef.current.getRootState().routes;
        console.log('Available routes:', routes.map(r => r.name));
      } else {
        console.warn('Navigation is not ready yet in App component');
      }
    };
    
    // Kısa bir gecikme ile kontrol et (component mount olduktan sonra)
    const timer = setTimeout(checkNavigation, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <NavigationContainer 
        ref={navigationRef} 
        onReady={() => {
          console.log('NavigationContainer is now ready');
          // Mevcut route'ları kontrol et ve logla
          if (navigationRef.current) {
            const routes = navigationRef.current.getRootState().routes;
            console.log('Initial routes:', routes.map(r => r.name));
          }
        }}
      >
        <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={LoginScreen} />
          <Stack.Screen name="LoginForm" component={LoginFormScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Main" component={HomeScreen} />
          <Stack.Screen name="CreateActivity" component={CreateActivityScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </>
  );
};

export default App; 
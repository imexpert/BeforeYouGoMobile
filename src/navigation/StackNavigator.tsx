import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DrawerNavigator from './DrawerNavigator';
import NotificationsScreen from '../screens/NotificationsScreen';
import CreateActivityScreen from '../screens/CreateActivityScreen';
import LoginScreen from '../screens/LoginScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const StackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Welcome"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Main"
        component={DrawerNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateActivity"
        component={CreateActivityScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Bildirimler',
          headerTitleStyle: { color: '#000' },
          headerShadowVisible: false,
          headerTintColor: '#000',
        }}
      />
    </Stack.Navigator>
  );
};

export default StackNavigator; 
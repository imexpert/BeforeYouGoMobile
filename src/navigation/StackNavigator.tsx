import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DrawerNavigator from './DrawerNavigator';
import NotificationsScreen from '../screens/NotificationsScreen';
import CreateActivityScreen from '../screens/CreateActivityScreen';
import LoginFormScreen from '../screens/LoginFormScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

interface StackNavigatorProps {
  initialAuth: boolean;
}

const StackNavigator = ({ initialAuth }: StackNavigatorProps) => {
  return (
    <Stack.Navigator
      initialRouteName={initialAuth ? "Main" : "LoginForm"}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="LoginForm"
        component={LoginFormScreen}
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
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
};

export default StackNavigator; 
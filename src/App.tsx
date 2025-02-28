import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { navigationRef } from './navigation/RootNavigation';
import { RootStackParamList } from './navigation/types';
import { View, Text } from 'react-native';

// Import your screens or create placeholders
const LoginScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Login Screen</Text></View>;
const MainScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Main Screen</Text></View>;
const CreateActivityScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Create Activity Screen</Text></View>;
const NotificationsScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Notifications Screen</Text></View>;

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={MainScreen} />
        <Stack.Screen name="CreateActivity" component={CreateActivityScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App; 
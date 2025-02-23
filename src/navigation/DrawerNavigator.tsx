import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useTranslation } from 'react-i18next';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CustomDrawer from '../components/CustomDrawer';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { TouchableOpacity, View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type { DrawerParamList } from './types';

const Drawer = createDrawerNavigator<DrawerParamList>();

const DrawerNavigator = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  // Örnek bildirim sayısı
  const unreadNotifications = 3;

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: 'transparent',
        },
        headerTintColor: '#000',
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerRight: () => (
          <TouchableOpacity 
            style={{ marginRight: 16, flexDirection: 'row', alignItems: 'center' }}
            onPress={() => navigation.navigate('Notifications')}
          >
            <View style={{ position: 'relative' }}>
              <Icon name="notifications" size={24} color="#5D5FEF" />
              {unreadNotifications > 0 && (
                <View style={{
                  position: 'absolute',
                  right: -6,
                  top: -6,
                  backgroundColor: '#FF3B30',
                  borderRadius: 10,
                  minWidth: 20,
                  height: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Text style={{
                    color: '#FFF',
                    fontSize: 12,
                    fontWeight: 'bold',
                  }}>
                    {unreadNotifications}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ),
        drawerActiveBackgroundColor: '#5D5FEF',
        drawerActiveTintColor: '#fff',
        drawerInactiveTintColor: '#333',
      }}
    >
      <Drawer.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          title: 'Ana Sayfa',
        }}
      />
      <Drawer.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          title: 'Profil',
        }}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator; 
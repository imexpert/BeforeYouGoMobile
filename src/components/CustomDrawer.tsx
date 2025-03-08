import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { useTranslation } from 'react-i18next';
import { authService } from '../api/services/auth';
import { useNavigation } from '@react-navigation/native';
import { authStore } from '../store/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Welcome: undefined;
  LoginForm: undefined;
  Register: undefined;
  Main: undefined;
};

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
}

const CustomDrawer = (props: any) => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const auth = await authStore.getAuth();
    if (auth?.user) {
      setUserData({
        ...auth.user,
        email: auth.user.email || '',
      });
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      await authStore.clearAuth();
      navigation.navigate('Welcome');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Image
            source={userData?.profileImage 
              ? { uri: userData.profileImage }
              : require('../assets/default-avatar.png')}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {userData ? `${userData.firstName} ${userData.lastName}` : ''}
            </Text>
            <Text style={styles.userEmail}>{userData?.email || ''}</Text>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <Icon name="more-vert" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.menuItems}>
          <TouchableOpacity style={styles.menuItem}>
            <Icon name="folder" size={24} color="#666" style={styles.menuIcon} />
            <Text style={styles.menuText}>My Files</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Icon name="folder-shared" size={24} color="#666" style={styles.menuIcon} />
            <Text style={styles.menuText}>Shared with me</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Icon name="star" size={24} color="#666" style={styles.menuIcon} />
            <Text style={styles.menuText}>Starred</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Icon name="access-time" size={24} color="#666" style={styles.menuIcon} />
            <Text style={styles.menuText}>Recent</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Icon name="offline-pin" size={24} color="#666" style={styles.menuIcon} />
            <Text style={styles.menuText}>Offline</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Icon name="file-upload" size={24} color="#666" style={styles.menuIcon} />
            <Text style={styles.menuText}>Uploads</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
        >
          <Icon name="logout" size={24} color="#FF3B30" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>{t('drawer.logout')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  menuButton: {
    padding: 8,
  },
  menuItems: {
    padding: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 4,
  },
  menuIcon: {
    marginRight: 32,
  },
  menuText: {
    fontSize: 14,
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  logoutIcon: {
    marginRight: 12,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CustomDrawer; 
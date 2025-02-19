import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { useToast } from 'react-native-toast-notifications';
import { authStore } from '../store/auth';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const navigation = useNavigation();

  // Google Sign-In'i başlatmadan önce konfigürasyonu kontrol edelim
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '971128462559-qaf83h8regje3gu151ki0egsudkujs96.apps.googleusercontent.com',
    });
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      // Debug için log ekleyelim
      console.log('Google Sign-In başlatılıyor...');
      
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      
      if (!idToken) {
        throw new Error('Google Sign-In idToken alınamadı');
      }

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      const user = userCredential.user;

      await authStore.setAuth({
        token: await user.getIdToken(),
        user: {
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          email: user.email || '',
          profileImage: user.photoURL || undefined,
        },
      });

      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });

      toast.show('Başarıyla giriş yapıldı', {
        type: 'success',
      });
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      toast.show('Google ile giriş yapılırken bir hata oluştu', {
        type: 'danger',
      });
    }
  };

  return (
    <ImageBackground 
      source={require('../assets/images/background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>{t('home.title')}</Text>
          <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
          
          <TouchableOpacity 
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
          >
            <Icon name="google" size={24} color="#DB4437" />
            <Text style={styles.googleButtonText}>
              {t('auth.signInWithGoogle')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  googleButtonText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});

export default HomeScreen; 
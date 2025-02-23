import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { GoogleSignin, auth } from '../config/firebase';
import { useToast } from 'react-native-toast-notifications';
import { authStore } from '../store/auth';
import { authService } from '../api/services/auth';

type RootStackParamList = {
  Welcome: undefined;
  LoginForm: undefined;
  Register: undefined;
  Main: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '971128462559-nc3bs33h5vs6i22m45nm6vo6sjehbefv.apps.googleusercontent.com',
    });
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      console.log('Google Sign-In başlatılıyor...');
      
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      await GoogleSignin.getTokens();
      
      const response = await authService.loginWithGoogle({
        idToken: userInfo.data?.idToken,
        email: userInfo.data?.user.email,
        firstName: userInfo.data?.user.givenName || '',
        lastName: userInfo.data?.user.familyName || '',
        photoUrl: userInfo.data?.user.photo,
      });

      await authStore.setAuth({
        token: response.data.token,
        user: {
          firstName: userInfo.data?.user.givenName || '',
          lastName: userInfo.data?.user.familyName || '',
          email: userInfo.data?.user.email,
          profileImage: userInfo.data?.user.photo || undefined,
        }
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5D5FEF" />
        </View>
      )}
      <View style={[styles.content, loading && styles.contentBlurred]}>
        {/* Illustration */}
        <Image
          source={require('../assets/images/login-illustration.png')}
          style={styles.illustration}
          resizeMode="contain"
        />

        {/* Welcome Text */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('welcome.title')}</Text>
          <Text style={styles.subtitle}>{t('welcome.subtitle')}</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('LoginForm')}
          >
            <Text style={styles.loginButtonText}>{t('welcome.login')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.signupButtonText}>{t('welcome.signup')}</Text>
          </TouchableOpacity>
        </View>

        {/* Social Login */}
        <View style={styles.socialContainer}>
          <Text style={styles.socialText}>{t('welcome.socialText')}</Text>
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
          >
            <Image
              source={require('../assets/images/google.png')}
              style={styles.googleIcon}
            />
            <Text style={styles.googleButtonText}>{t('auth.signInWithGoogle')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  illustration: {
    width: '80%',
    height: 200,
    marginBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  buttons: {
    width: '100%',
    alignItems: 'center',
  },
  loginButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#5D5FEF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signupButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#5D5FEF',
  },
  signupButtonText: {
    color: '#5D5FEF',
    fontSize: 16,
    fontWeight: '600',
  },
  socialContainer: {
    width: '100%',
    alignItems: 'center',
  },
  socialText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    width: '100%',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 1000,
  },
  contentBlurred: {
    opacity: 0.7,
  },
});

export default LoginScreen; 
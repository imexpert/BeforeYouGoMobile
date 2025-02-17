import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useToast } from 'react-native-toast-notifications';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { authService } from '../api/services/auth';
import { authStore } from '../store/auth';

type RootStackParamList = {
  Welcome: undefined;
  LoginForm: undefined;
  ForgotPassword: undefined;
  Main: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'LoginForm'>;
};

const LoginFormScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const toast = useToast();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    Keyboard.dismiss();
    
    // Email boş kontrolü
    if (!email.trim()) {
      toast.show(t('validation.emailRequired'), {
        type: 'danger',
      });
      return;
    }

    // Email format kontrolü
    if (!validateEmail(email)) {
      toast.show(t('validation.emailInvalid'), {
        type: 'danger',
      });
      return;
    }

    // Şifre boş kontrolü
    if (!password.trim()) {
      toast.show(t('validation.passwordRequired'), {
        type: 'danger',
      });
      return;
    }

    // Şifre uzunluk kontrolü
    if (password.length < 6) {
      toast.show(t('validation.passwordTooShort'), {
        type: 'danger',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await authService.login({
        email: email.trim(),
        password: password.trim(),
      });

      if (response.data) {
        await authStore.setAuth({
          token: response.data.token,
          user: {
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            email: response.data.email,
            profileImage: response.data.profileImage,
          },
        });
        
        toast.show(t('validation.loginSuccess'), {
          type: 'success',
        });
        
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.show(t('validation.error'), { type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{t('login.title')}</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('login.email')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('login.emailPlaceholder')}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('login.password')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('login.passwordPlaceholder')}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>{t('login.forgotPassword')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.loginButton,
                loading && styles.loginButtonDisabled
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? t('login.loggingIn') : t('login.loginButton')}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: '#000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 20,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  forgotPasswordText: {
    color: '#5D5FEF',
    fontSize: 14,
  },
  loginButton: {
    height: 56,
    backgroundColor: '#5D5FEF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
});

export default LoginFormScreen; 
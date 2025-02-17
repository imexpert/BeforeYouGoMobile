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
  ScrollView,
  Keyboard,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useToast } from 'react-native-toast-notifications';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { authService } from '../api/services/auth';
import { authStore } from '../store/auth';

type RootStackParamList = {
  Welcome: undefined;
  Register: undefined;
  LoginForm: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
};

const RegisterScreen = ({ navigation }: Props) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const toast = useToast();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    Keyboard.dismiss();

    // Ad kontrolü
    if (!firstName.trim()) {
      toast.show(t('validation.firstNameRequired'), {
        type: 'danger',
      });
      return;
    }

    // Soyad kontrolü
    if (!lastName.trim()) {
      toast.show(t('validation.lastNameRequired'), {
        type: 'danger',
      });
      return;
    }

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

    // Şifre eşleşme kontrolü
    if (password !== confirmPassword) {
      toast.show(t('validation.passwordsDoNotMatch'), {
        type: 'danger',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await authService.register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password: password.trim(),
        confirmPassword: confirmPassword.trim(),
      });

      if (response.isSuccess) {
        await authStore.setAuth(response.data);
        toast.show(t('validation.registerSuccess'), {
          type: 'success',
        });
        navigation.navigate('LoginForm');
      }
    } catch (error) {
      console.error('Register error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView>
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{t('register.title')}</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('register.firstName')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('register.firstNamePlaceholder')}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('register.lastName')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('register.lastNamePlaceholder')}
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('register.email')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('register.emailPlaceholder')}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('register.password')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('register.passwordPlaceholder')}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('register.confirmPassword')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('register.confirmPasswordPlaceholder')}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity 
              style={[styles.registerButton, loading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.registerButtonText}>
                {loading ? t('register.registering') : t('register.register')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  form: {
    padding: 16,
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000',
  },
  registerButton: {
    height: 56,
    backgroundColor: '#5D5FEF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RegisterScreen; 
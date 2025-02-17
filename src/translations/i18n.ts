import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { NativeModules, Platform } from 'react-native';
import tr from './tr';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      tr: {
        translation: tr,
      },
    },
    lng: 'tr',
    fallbackLng: 'tr',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n; 
import * as Localization from 'expo-localization';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import ar from '@/i18n/ar.json';
import en from '@/i18n/en.json';

const resources = {
  en: { translation: en },
  ar: { translation: ar },
};

// `use` is also a named export of i18next; this is the idiomatic i18next + react-i18next setup.
// eslint-disable-next-line import/no-named-as-default-member
i18next.use(initReactI18next).init({
  resources,
  lng: Localization.getLocales()[0]?.languageCode ?? 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: 'v4',
});

export default i18next;

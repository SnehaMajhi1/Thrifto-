import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en/translation.json';
import neTranslation from './locales/ne/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      ne: { translation: neTranslation },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escaping
    },
  });

export default i18n;

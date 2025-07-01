import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language, LanguageOption } from '../types';
import i18n from '../i18n';

interface LanguageState {
  currentLanguage: Language;
  availableLanguages: LanguageOption[];
  setLanguage: (language: Language) => void;
}

const availableLanguages: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
];

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      currentLanguage: 'en',
      availableLanguages,
      setLanguage: (language: Language) => {
        i18n.changeLanguage(language);
        set({ currentLanguage: language });
      },
    }),
    {
      name: 'language-storage',
    }
  )
);

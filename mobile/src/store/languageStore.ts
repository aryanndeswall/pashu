import { create } from 'zustand';

export type SupportedLanguage = 'mr' | 'hi' | 'en';

export interface LanguageOption {
  code: SupportedLanguage;
  nativeName: string;
  englishName: string;
  badgeCode: string;
  description: string;
  flagEmoji: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'mr',
    nativeName: 'मराठी',
    englishName: 'Marathi',
    badgeCode: 'MR',
    description: 'प्राथमिक भाषा (महाराष्ट्र / अहमदनगर)',
    flagEmoji: '🇮🇳',
  },
  {
    code: 'hi',
    nativeName: 'हिंदी',
    englishName: 'Hindi',
    badgeCode: 'HI',
    description: 'राष्ट्रीय भाषा (समग्र भारत)',
    flagEmoji: '🇮🇳',
  },
  {
    code: 'en',
    nativeName: 'English',
    englishName: 'English',
    badgeCode: 'EN',
    description: 'Administrative & Jury Presentation',
    flagEmoji: '🌐',
  },
];

export const UI_TRANSLATIONS: Record<string, Record<SupportedLanguage, string>> = {
  appName: {
    mr: 'पशु सुरक्षा',
    hi: 'पशु सुरक्षा',
    en: 'Pashu-Suraksha',
  },
  appSubtitle: {
    mr: 'राष्ट्रीय पशु आरोग्य पाळत',
    hi: 'राष्ट्रीय पशु स्वास्थ्य निगरानी',
    en: 'National Livestock Surveillance',
  },
  reportTab: {
    mr: 'लक्षणे नोंदवा',
    hi: 'लक्षण दर्ज करें',
    en: 'Report',
  },
  doctorReportTab: {
    mr: '८ लक्षणे',
    hi: '८ लक्षण',
    en: '8 Syndromes',
  },
  dashboardTab: {
    mr: 'स्थानिक स्थिती',
    hi: 'स्थानिक स्थिति',
    en: 'Status',
  },
  animalsTab: {
    mr: 'माझे पशु',
    hi: 'मेरे पशु',
    en: 'My Animals',
  },
  labsTab: {
    mr: 'लॅब अहवाल',
    hi: 'लैब रिपोर्ट',
    en: 'Lab Samples',
  },
  warRoomTab: {
    mr: 'वॉर रूम (GIS)',
    hi: 'वॉर रूम (GIS)',
    en: 'War Room',
  },
  offlineStatus: {
    mr: 'ऑफलाइन',
    hi: 'ऑफ़लाइन',
    en: 'Offline',
  },
  onlineStatus: {
    mr: 'ऑनलाइन',
    hi: 'ऑनलाइन',
    en: 'Online',
  },
  syncing: {
    mr: 'सिंक...',
    hi: 'सिंक...',
    en: 'Syncing...',
  },
  switchRole: {
    mr: 'भूमिका बदला',
    hi: 'भूमिका बदलें',
    en: 'Switch Role',
  },
  selectLanguage: {
    mr: 'भाषा निवडा (Select Language)',
    hi: 'भाषा चुनें (Select Language)',
    en: 'Select Language',
  },
  languageDescription: {
    mr: 'तुमच्या पसंतीची भाषा निवडा (Select your preferred language):',
    hi: 'अपनी पसंदीदा भाषा चुनें (Select your preferred language):',
    en: 'Select your preferred language for livestock surveillance:',
  },
  close: {
    mr: 'बंद करा',
    hi: 'बंद करें',
    en: 'Close',
  },
  activeBadge: {
    mr: 'सक्रिय',
    hi: 'सक्रिय',
    en: 'Active',
  },
};

interface LanguageState {
  currentLanguage: SupportedLanguage;
  isSelectorOpen: boolean;
  setLanguage: (lang: SupportedLanguage) => void;
  setSelectorOpen: (open: boolean) => void;
  t: (key: string, defaultText?: string) => string;
}

const getInitialLanguage = (): SupportedLanguage => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = localStorage.getItem('pashu_language') as SupportedLanguage;
    if (saved === 'mr' || saved === 'hi' || saved === 'en') {
      return saved;
    }
  }
  return 'mr';
};

export const useLanguageStore = create<LanguageState>((set, get) => ({
  currentLanguage: getInitialLanguage(),
  isSelectorOpen: false,

  setLanguage: (lang: SupportedLanguage) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('pashu_language', lang);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
    set({ currentLanguage: lang, isSelectorOpen: false });
  },

  setSelectorOpen: (open: boolean) => set({ isSelectorOpen: open }),

  t: (key: string, defaultText?: string): string => {
    const lang = get().currentLanguage;
    const translation = UI_TRANSLATIONS[key];
    if (translation && translation[lang]) {
      return translation[lang];
    }
    return defaultText ?? key;
  },
}));

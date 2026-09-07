import { describe, it, expect, beforeEach } from 'vitest';
import {
  useLanguageStore,
  SUPPORTED_LANGUAGES,
  UI_TRANSLATIONS,
} from '../store/languageStore';

describe('useLanguageStore Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    useLanguageStore.setState({ currentLanguage: 'mr', isSelectorOpen: false });
    if (typeof document !== 'undefined') {
      document.documentElement.lang = 'mr';
    }
  });

  it('initializes with Marathi (mr) in test environment', () => {
    const { currentLanguage } = useLanguageStore.getState();
    expect(currentLanguage).toBe('mr');
    expect(document.documentElement.lang).toBe('mr');
  });

  it('supports Marathi, Hindi, and English options in metadata', () => {
    expect(SUPPORTED_LANGUAGES).toHaveLength(3);
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    expect(codes).toEqual(['mr', 'hi', 'en']);
  });

  it('switches language and persists to localStorage and document.documentElement.lang', () => {
    const { setLanguage } = useLanguageStore.getState();

    setLanguage('hi');
    expect(useLanguageStore.getState().currentLanguage).toBe('hi');
    expect(localStorage.getItem('pashu_language')).toBe('hi');
    expect(document.documentElement.lang).toBe('hi');

    setLanguage('en');
    expect(useLanguageStore.getState().currentLanguage).toBe('en');
    expect(localStorage.getItem('pashu_language')).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('translates known keys across all supported languages', () => {
    const { t, setLanguage } = useLanguageStore.getState();

    // In Marathi
    setLanguage('mr');
    expect(t('reportTab')).toBe('लक्षणे नोंदवा');
    expect(t('animalsTab')).toBe('माझे पशु');

    // In Hindi
    setLanguage('hi');
    expect(t('reportTab')).toBe('लक्षण दर्ज करें');
    expect(t('animalsTab')).toBe('मेरे पशु');

    // In English
    setLanguage('en');
    expect(t('reportTab')).toBe('Report');
    expect(t('animalsTab')).toBe('My Animals');
  });

  it('returns fallback text or key when key is unknown', () => {
    const { t } = useLanguageStore.getState();
    expect(t('nonExistentKey', 'Fallback Value')).toBe('Fallback Value');
    expect(t('nonExistentKeyNoFallback')).toBe('nonExistentKeyNoFallback');
  });

  it('toggles selector modal open and close states', () => {
    const { setSelectorOpen } = useLanguageStore.getState();

    setSelectorOpen(true);
    expect(useLanguageStore.getState().isSelectorOpen).toBe(true);

    setSelectorOpen(false);
    expect(useLanguageStore.getState().isSelectorOpen).toBe(false);
  });
});

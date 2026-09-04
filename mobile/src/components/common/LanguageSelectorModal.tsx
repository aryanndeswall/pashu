import React from 'react';
import { Languages, Check, X } from 'lucide-react';
import {
  useLanguageStore,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
} from '../../store/languageStore';
import { hapticsService } from '../../services/hapticsService';

export const LanguageSelectorModal: React.FC = () => {
  const { currentLanguage, isSelectorOpen, setLanguage, setSelectorOpen, t } =
    useLanguageStore();

  if (!isSelectorOpen) return null;

  const handleSelect = async (code: SupportedLanguage) => {
    await hapticsService.triggerSelection();
    setLanguage(code);
  };

  const handleClose = async () => {
    await hapticsService.triggerSelection();
    setSelectorOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="language-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="language-modal-title"
                className="text-sm font-bold text-slate-900 dark:text-white lang-devanagari"
              >
                {t('selectLanguage', 'भाषा निवडा (Select Language)')}
              </h3>
              <p className="text-[11px] text-slate-400">
                Pashu-Suraksha Multi-Lingual Core
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close language selector"
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 active:scale-95 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtitle */}
        <p className="text-xs text-slate-600 dark:text-slate-300">
          {t('languageDescription', 'तुमच्या पसंतीची भाषा निवडा:')}
        </p>

        {/* Language Cards */}
        <div className="space-y-2">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = currentLanguage === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang.code)}
                aria-label={`Select ${lang.englishName} language`}
                className={`field-touch-target w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-[0.98] ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl shrink-0" role="img" aria-label={lang.englishName}>
                    {lang.flagEmoji}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {lang.nativeName}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        ({lang.englishName})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {lang.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {lang.badgeCode}
                  </span>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all active:scale-95"
          >
            {t('close', 'बंद करा')}
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ShieldCheck, WifiOff, Sun, Moon, CheckCircle2, ArrowRight, RefreshCw, Clock, Languages } from 'lucide-react';
import { useNavigationStore } from '../../store/navigationStore';
import { useAuthStore, UserRole, DEMO_PERSONAS } from '../../store/authStore';
import { useSyncStore } from '../../store/syncStore';
import { useLanguageStore, SUPPORTED_LANGUAGES } from '../../store/languageStore';
import { hapticsService } from '../../services/hapticsService';
import { FluidDrawer } from '../animations/FluidDrawer';
import { LanguageSelectorModal } from './LanguageSelectorModal';

export const HeaderBar: React.FC = () => {
  const isDarkMode = useNavigationStore((state) => state.isDarkMode);
  const toggleDarkMode = useNavigationStore((state) => state.toggleDarkMode);
  const { activeRole, switchRole } = useAuthStore();
  const { pendingCount, isSyncing, setDrawerOpen } = useSyncStore();
  const { currentLanguage, setSelectorOpen, t } = useLanguageStore();
  const [isRoleDrawerOpen, setIsRoleDrawerOpen] = useState(false);

  const activeLanguage =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) ?? SUPPORTED_LANGUAGES[0];

  const handleOpenLanguageModal = async () => {
    await hapticsService.hapticLight();
    setSelectorOpen(true);
  };

  const handleToggleTheme = async () => {
    await hapticsService.hapticLight();
    toggleDarkMode();
  };

  const handleOpenRoleDrawer = async () => {
    await hapticsService.hapticLight();
    setIsRoleDrawerOpen(true);
  };

  const handleSwitchRole = (role: UserRole) => {
    switchRole(role);
    setIsRoleDrawerOpen(false);
  };

  const getRolePill = () => {
    switch (activeRole) {
      case 'consumer':
        return {
          label: `👨‍🌾 ${t('roleConsumer', 'Farmer')}`,
          badgeClass: 'bg-emerald-800/80 text-emerald-100 border-emerald-600/70 hover:bg-emerald-800',
        };
      case 'doctor':
        return {
          label: `🩺 ${t('roleDoctor', 'Veterinarian')}`,
          badgeClass: 'bg-blue-900/80 text-blue-100 border-blue-600/70 hover:bg-blue-800',
        };
      case 'admin':
        return {
          label: `🏛️ ${t('roleAdmin', 'Officer')}`,
          badgeClass: 'bg-purple-900/80 text-purple-100 border-purple-600/70 hover:bg-purple-800',
        };
    }
  };

  const currentPill = getRolePill();

  const roleOptions: { role: UserRole; title: string; titleEnglish: string; subtitle: string; icon: string; bg: string }[] = [
    {
      role: 'consumer',
      title: currentLanguage === 'en' ? 'Livestock Owner / Farmer' : currentLanguage === 'hi' ? 'पशुपालक (किसान)' : 'पशुपालक (Farmer / Consumer)',
      titleEnglish: 'Livestock Owner / Farmer',
      subtitle: currentLanguage === 'en' ? `${DEMO_PERSONAS.consumer.name} • ${DEMO_PERSONAS.consumer.block}` : `${DEMO_PERSONAS.consumer.nameMarathi} • राहुरी खुर्द`,
      icon: '👨‍🌾',
      bg: 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20',
    },
    {
      role: 'doctor',
      title: currentLanguage === 'en' ? 'Field Veterinarian & Para-vet' : currentLanguage === 'hi' ? 'पशु चिकित्सक / पैरा-वेट' : 'पशुवैद्य (Veterinarian / Doctor)',
      titleEnglish: 'Field Veterinarian & Para-vet',
      subtitle: currentLanguage === 'en' ? `${DEMO_PERSONAS.doctor.name} • ${DEMO_PERSONAS.doctor.block}` : `${DEMO_PERSONAS.doctor.nameMarathi} • राहुरी व संगमनेर`,
      icon: '🩺',
      bg: 'border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20',
    },
    {
      role: 'admin',
      title: currentLanguage === 'en' ? 'District Animal Husbandry Officer' : currentLanguage === 'hi' ? 'जिला पशुपालन अधिकारी' : 'जिल्हा अधिकारी (District Admin)',
      titleEnglish: 'District Animal Husbandry Officer',
      subtitle: currentLanguage === 'en' ? `${DEMO_PERSONAS.admin.name} • ${DEMO_PERSONAS.admin.district}` : `${DEMO_PERSONAS.admin.nameMarathi} • अहमदनगर`,
      icon: '🏛️',
      bg: 'border-purple-500/30 bg-purple-50/50 dark:bg-purple-950/20',
    },
  ];

  return (
    <>
      <header className="bg-emerald-950 dark:bg-slate-950 border-b border-emerald-800/60 dark:border-slate-800 px-4 py-2.5 pt-5 sticky top-0 z-30 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          {/* App Title & Branding */}
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-1.5 rounded-xl text-white shadow-md shadow-emerald-950/40 flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                {currentLanguage === 'en' ? 'Pashu-Suraksha' : 'पशु सुरक्षा'}{' '}
                <span className="text-[9px] bg-emerald-700/80 text-emerald-100 font-semibold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                  Suraksha
                </span>
              </h1>
              <p className="text-[10px] text-emerald-300/80 dark:text-emerald-400">
                {t('appSubtitle', 'National Livestock Surveillance')}
              </p>
            </div>
          </div>

          {/* Header Controls: Role Switcher Pill + Offline Status + Theme Toggle */}
          <div className="flex items-center gap-1.5">
            {/* SIH Demo 1-Click Role Switcher Pill */}
            <button
              type="button"
              onClick={handleOpenRoleDrawer}
              aria-label="Open Demo Role Switcher"
              className={`field-touch-target flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border transition-all active:scale-95 shadow-xs ${currentPill.badgeClass}`}
            >
              <span>{currentPill.label}</span>
              <span className="text-[9px] opacity-70">▾</span>
            </button>

            {/* Sync Queue Drawer Toggle Pill */}
            <button
              type="button"
              onClick={async () => {
                await hapticsService.hapticLight();
                setDrawerOpen(true);
              }}
              aria-label="Open Sync Queue"
              className={`field-touch-target flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border transition-all active:scale-95 shadow-xs ${
                isSyncing
                  ? 'bg-blue-900/80 text-blue-200 border-blue-600'
                  : pendingCount > 0
                  ? 'bg-amber-900/80 text-amber-200 border-amber-600'
                  : 'bg-emerald-900/80 text-emerald-200 border-emerald-700/60'
              }`}
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-300" />
                  <span className="text-[10px] hidden xs:inline">{t('syncing', 'Sync...')}</span>
                </>
              ) : pendingCount > 0 ? (
                <>
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px] font-mono">{pendingCount}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] hidden xs:inline font-mono">0</span>
                </>
              )}
            </button>

            {/* Offline Core Status Pill */}
            <div className="hidden sm:flex items-center gap-1 bg-emerald-900/70 border border-emerald-700/50 px-2 py-1 rounded-full text-[11px] text-emerald-200">
              <WifiOff className="w-3 h-3 text-amber-400" />
              <span className="font-semibold text-[10px]">{t('offlineStatus', 'Offline')}</span>
            </div>

            {/* Multi-Lingual Language Selector Button */}
            <button
              type="button"
              onClick={handleOpenLanguageModal}
              aria-label={`Current language: ${activeLanguage.englishName}. Open Language Selector`}
              className="field-touch-target flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border border-emerald-700/60 bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800/80 active:scale-95 transition-all shadow-xs"
            >
              <Languages className="w-3.5 h-3.5 text-emerald-300" />
              <span className="text-[10px] font-mono font-bold">{activeLanguage.badgeCode}</span>
            </button>

            {/* Sunlight / Night Mode Toggle */}
            <button
              type="button"
              onClick={handleToggleTheme}
              aria-label={isDarkMode ? 'Switch to Sunlight Mode' : 'Switch to Dark Mode'}
              className="field-touch-target p-1.5 rounded-full text-emerald-300 hover:text-white hover:bg-emerald-900/60 active:scale-95 transition-all flex items-center justify-center"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-emerald-300" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* SIH Demo Role Switcher Fluid Drawer */}
      <FluidDrawer
        isOpen={isRoleDrawerOpen}
        onClose={() => setIsRoleDrawerOpen(false)}
        title={currentLanguage === 'en' ? 'Switch Role (SIH Demo Role Switcher)' : currentLanguage === 'hi' ? 'भूमिका बदलें (SIH Demo Role Switcher)' : 'भूमिका बदला (SIH Demo Role Switcher)'}
      >
        <div className="space-y-3 pt-2">
          <p className={`text-xs text-slate-500 dark:text-slate-400 ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
            {t('roleDemoInstruction', 'Switch roles instantly for live demo:')}
          </p>

          <div className="space-y-2.5">
            {roleOptions.map((opt) => {
              const isCurrent = activeRole === opt.role;

              return (
                <div
                  key={opt.role}
                  onClick={() => handleSwitchRole(opt.role)}
                  className={`field-touch-target p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    isCurrent
                      ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{opt.icon}</span>
                    <div>
                      <h4 className={`text-xs font-bold text-slate-900 dark:text-white ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                        {opt.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {opt.subtitle}
                      </p>
                    </div>
                  </div>

                  {isCurrent ? (
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t('activeBadge', 'Active')}</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      aria-label={`Switch to ${opt.titleEnglish}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSwitchRole(opt.role);
                      }}
                      className="field-touch-target px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 flex items-center gap-1"
                    >
                      <span>{t('select', 'Select')}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </FluidDrawer>
      <LanguageSelectorModal />
    </>
  );
};

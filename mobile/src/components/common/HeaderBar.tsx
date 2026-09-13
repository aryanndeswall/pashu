import React from 'react';
import { ShieldCheck, Wifi, WifiOff, Sun, Moon, CheckCircle2, RefreshCw, Clock, Languages, User } from 'lucide-react';
import { useNavigationStore } from '../../store/navigationStore';
import { useAuthStore } from '../../store/authStore';
import { useSyncStore } from '../../store/syncStore';
import { useLanguageStore, SUPPORTED_LANGUAGES } from '../../store/languageStore';
import { hapticsService } from '../../services/hapticsService';
import { LanguageSelectorModal } from './LanguageSelectorModal';

interface HeaderBarProps {
  onOpenProfile?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ onOpenProfile }) => {
  const isDarkMode = useNavigationStore((state) => state.isDarkMode);
  const toggleDarkMode = useNavigationStore((state) => state.toggleDarkMode);
  const { activeRole, userProfile } = useAuthStore();
  const { networkTier, pendingCount, isSyncing, setDrawerOpen } = useSyncStore();
  const isOnline = networkTier !== 'OFFLINE';
  const { currentLanguage, setSelectorOpen, t } = useLanguageStore();

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

          {/* Header Controls: Role Indicator Pill + Offline Status + Theme Toggle */}
          <div className="flex items-center gap-1.5">
            {/* Read-only Role Indicator Pill (role is locked to login credentials) */}
            <div
              aria-label={`Current role: ${activeRole}`}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border select-none shadow-xs ${
                activeRole === 'consumer'
                  ? 'bg-emerald-800/80 text-emerald-100 border-emerald-600/70'
                  : activeRole === 'doctor'
                  ? 'bg-blue-900/80 text-blue-100 border-blue-600/70'
                  : 'bg-purple-900/80 text-purple-100 border-purple-600/70'
              }`}
            >
              <span>
                {activeRole === 'consumer'
                  ? `👨‍🌾 ${t('roleConsumer', 'Farmer')}`
                  : activeRole === 'doctor'
                  ? `🩺 ${t('roleDoctor', 'Veterinarian')}`
                  : `🏛️ ${t('roleAdmin', 'Officer')}`}
              </span>
            </div>

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

            {/* Dynamic Network Status Pill */}
            <button
              type="button"
              onClick={async () => {
                await hapticsService.hapticLight();
                setDrawerOpen(true);
              }}
              aria-label={`Network status: ${isOnline ? 'Online' : 'Offline'}. Open sync drawer.`}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] border transition-all active:scale-95 cursor-pointer shadow-xs ${
                isOnline
                  ? 'bg-emerald-900/60 border-emerald-600/70 text-emerald-200 hover:bg-emerald-800/80'
                  : 'bg-amber-950/80 border-amber-600/70 text-amber-200 hover:bg-amber-900/80'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3 text-emerald-400" />
                  <span className="font-semibold text-[10px]">{t('onlineStatus', 'Online')}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-amber-400 animate-pulse" />
                  <span className="font-semibold text-[10px]">{t('offlineStatus', 'Offline')}</span>
                </>
              )}
            </button>

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

            {/* User Profile Settings Button */}
            {onOpenProfile && (
              <button
                type="button"
                onClick={async () => {
                  await hapticsService.hapticLight();
                  onOpenProfile();
                }}
                aria-label="Open User Profile"
                className="field-touch-target p-1.5 rounded-full text-emerald-300 hover:text-white hover:bg-emerald-900/60 active:scale-95 transition-all flex items-center justify-center"
              >
                <User className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <LanguageSelectorModal />
    </>
  );
};

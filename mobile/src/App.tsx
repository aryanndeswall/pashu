import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HeaderBar } from './components/common/HeaderBar';
import { RealtimeAlertBanner } from './components/common/RealtimeAlertBanner';
import { BottomBar } from './components/navigation/BottomBar';
import { EmergencySOSModal } from './components/modals/EmergencySOSModal';
import { useNavigationStore } from './store/navigationStore';
import { useAuthStore } from './store/authStore';
import { ReportView } from './views/ReportView';
import { DashboardView } from './views/DashboardView';
import { AnimalRegistryView } from './views/AnimalRegistryView';
import { LabReferralView } from './views/LabReferralView';
import { RoleSelectionView } from './views/RoleSelectionView';
import { RolePortalView } from './views/RolePortalView';
import { LoginView } from './views/LoginView';
import { OtpVerificationView } from './views/OtpVerificationView';
import { OnboardingView } from './views/OnboardingView';
import { OfflinePinView } from './views/OfflinePinView';
import { UserProfileView } from './views/UserProfileView';
import { SyncQueueDrawer } from './components/sync/SyncQueueDrawer';
import { useSyncStore } from './store/syncStore';
import { useLanguageStore } from './store/languageStore';
import { Users } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export function App() {
  const activeTab = useNavigationStore((state) => state.activeTab);
  const {
    activeRole,
    userProfile,
    isAuthenticated,
    isLocked,
    loginStep,
    initSession,
  } = useAuthStore();
  const { currentLanguage, t } = useLanguageStore();
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    initSession();
    useSyncStore.getState().initSyncStore();
  }, [initSession]);

  const isAuthFlowActive = !isAuthenticated || isLocked;

  const renderActiveView = () => {
    // 1. Unauthenticated or locked state routing
    if (isAuthFlowActive) {
      switch (loginStep) {
        case 'portal':
          return <RolePortalView />;
        case 'login':
          return <LoginView />;
        case 'otp':
          return <OtpVerificationView />;
        case 'onboarding':
          return <OnboardingView />;
        case 'pin_setup':
          return <OfflinePinView mode="setup" />;
        case 'pin_unlock':
          return <OfflinePinView mode="unlock" />;
        default:
          return <RolePortalView />;
      }
    }

    // 2. Profile View Overlay
    if (showProfile) {
      return <UserProfileView onClose={() => setShowProfile(false)} />;
    }

    // 3. Demo Role Selection Screen Overlay
    if (showRoleSelector) {
      return <RoleSelectionView onRoleSelected={() => setShowRoleSelector(false)} />;
    }

    // 4. Primary Application Tab Viewport
    switch (activeTab) {
      case 'report':
        return <ReportView />;
      case 'dashboard':
        return <DashboardView />;
      case 'animals':
        return <AnimalRegistryView />;
      case 'labs':
        return activeRole === 'consumer' ? <ReportView /> : <LabReferralView />;
      default:
        return <ReportView />;
    }
  };

  const getRoleBannerStyle = () => {
    switch (activeRole) {
      case 'consumer':
        return 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-300';
      case 'doctor':
        return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/40 text-blue-900 dark:text-blue-300';
      case 'admin':
        return 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/40 text-purple-900 dark:text-purple-300';
    }
  };

  const getGreetingText = () => {
    if (currentLanguage === 'en') {
      return `Welcome, ${userProfile.name}`;
    }
    if (currentLanguage === 'hi') {
      return `स्वागत है, ${userProfile.nameHindi || userProfile.nameMarathi || userProfile.name}`;
    }
    return `स्वागत आहे, ${userProfile.nameMarathi}`;
  };

  const getBlockText = () => {
    if (currentLanguage === 'en') {
      return userProfile.block;
    }
    if (currentLanguage === 'hi') {
      if (userProfile.block === 'Rahuri Khurd') return 'राहुरी खुर्द';
      if (userProfile.block === 'Rahuri & Sangamner') return 'राहुरी व संगमनेर';
      if (userProfile.block === 'District Headquarters') return 'जिला मुख्यालय';
      return userProfile.block;
    }
    if (userProfile.block === 'Rahuri Khurd') return 'राहुरी खुर्द';
    if (userProfile.block === 'Rahuri & Sangamner') return 'राहुरी व संगमनेर';
    if (userProfile.block === 'District Headquarters') return 'जिल्हा मुख्यालय';
    return userProfile.block;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
        {/* Top Header */}
        <HeaderBar
          onOpenProfile={
            isAuthenticated && !isLocked
              ? () => {
                  setShowRoleSelector(false);
                  setShowProfile(!showProfile);
                }
              : undefined
          }
        />

        {/* Real-time Biosecurity Outbreak Alert Banner (WebSocket & SSE Push) */}
        <RealtimeAlertBanner />

        {/* User Persona Context Greeting Banner (shown when authenticated and not in overlays) */}
        {!isAuthFlowActive && !showProfile && (
          <div className={`border-b px-4 py-2 text-xs transition-colors ${getRoleBannerStyle()}`}>
            <div className="max-w-md mx-auto flex items-center justify-between">
              <div className="flex items-center gap-1.5 truncate">
                <span className={`font-bold ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                  {getGreetingText()}
                </span>
                <span className="opacity-75 text-[11px] truncate">
                  ({getBlockText()})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowRoleSelector(!showRoleSelector)}
                aria-label="Toggle Full Role Selection View"
                className="field-touch-target text-[11px] font-bold underline flex items-center gap-1 opacity-90 hover:opacity-100 flex-shrink-0"
              >
                <Users className="w-3.5 h-3.5" />
                <span>{showRoleSelector ? t('goToApp', 'Go to App') : t('switchRole', 'Switch Role')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Main Viewport (pb-28 for bottom bar clearance when authenticated) */}
        <main className={`flex-1 p-4 max-w-md mx-auto w-full ${!isAuthFlowActive && !showProfile ? 'pb-28' : 'pb-6'}`}>
          {renderActiveView()}
        </main>

        {/* Emergency SOS Biohazard Modal (only when authenticated) */}
        {!isAuthFlowActive && <EmergencySOSModal />}

        {/* Offline Sync Queue Drawer */}
        <SyncQueueDrawer />

        {/* Bottom Navigation Bar */}
        {!isAuthFlowActive && !showRoleSelector && !showProfile && <BottomBar />}
      </div>
    </QueryClientProvider>
  );
}

export default App;

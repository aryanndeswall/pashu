import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HeaderBar } from './components/common/HeaderBar';
import { BottomBar } from './components/navigation/BottomBar';
import { EmergencySOSModal } from './components/modals/EmergencySOSModal';
import { useNavigationStore } from './store/navigationStore';
import { useAuthStore } from './store/authStore';
import { ReportView } from './views/ReportView';
import { DashboardView } from './views/DashboardView';
import { AnimalRegistryView } from './views/AnimalRegistryView';
import { LabReferralView } from './views/LabReferralView';
import { RoleSelectionView } from './views/RoleSelectionView';
import { SyncQueueDrawer } from './components/sync/SyncQueueDrawer';
import { useSyncStore } from './store/syncStore';
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
  const { activeRole, userProfile, initSession } = useAuthStore();
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  useEffect(() => {
    initSession();
    useSyncStore.getState().initSyncStore();
  }, [initSession]);

  const renderActiveView = () => {
    if (showRoleSelector) {
      return <RoleSelectionView onRoleSelected={() => setShowRoleSelector(false)} />;
    }

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

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
        {/* Top Header */}
        <HeaderBar />

        {/* User Persona Context Greeting Banner */}
        <div className={`border-b px-4 py-2 text-xs transition-colors ${getRoleBannerStyle()}`}>
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-bold lang-devanagari">
                स्वागत आहे, {userProfile.nameMarathi}
              </span>
              <span className="opacity-75 text-[11px] truncate">
                ({userProfile.block})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowRoleSelector(!showRoleSelector)}
              aria-label="Toggle Full Role Selection View"
              className="field-touch-target text-[11px] font-bold underline flex items-center gap-1 opacity-90 hover:opacity-100 flex-shrink-0"
            >
              <Users className="w-3.5 h-3.5" />
              <span>{showRoleSelector ? 'अ‍ॅपवर जा' : 'भूमिका बदला'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Main Viewport (pb-28 for bottom bar clearance) */}
        <main className="flex-1 p-4 pb-28 max-w-md mx-auto w-full">
          {renderActiveView()}
        </main>

        {/* Emergency SOS Biohazard Modal */}
        <EmergencySOSModal />

        {/* Offline Sync Queue Drawer */}
        <SyncQueueDrawer />

        {/* Bottom Navigation Bar */}
        {!showRoleSelector && <BottomBar />}
      </div>
    </QueryClientProvider>
  );
}

export default App;

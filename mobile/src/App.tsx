import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HeaderBar } from './components/common/HeaderBar';
import { BottomBar } from './components/navigation/BottomBar';
import { EmergencySOSModal } from './components/modals/EmergencySOSModal';
import { useNavigationStore } from './store/navigationStore';
import { ReportView } from './views/ReportView';
import { DashboardView } from './views/DashboardView';
import { AnimalRegistryView } from './views/AnimalRegistryView';
import { LabReferralView } from './views/LabReferralView';

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

  const renderActiveView = () => {
    switch (activeTab) {
      case 'report':
        return <ReportView />;
      case 'dashboard':
        return <DashboardView />;
      case 'animals':
        return <AnimalRegistryView />;
      case 'labs':
        return <LabReferralView />;
      default:
        return <ReportView />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
        {/* Top Header */}
        <HeaderBar />

        {/* Dynamic Main Viewport (pb-28 for bottom bar clearance) */}
        <main className="flex-1 p-4 pb-28 max-w-md mx-auto w-full">
          {renderActiveView()}
        </main>

        {/* Emergency SOS Biohazard Modal */}
        <EmergencySOSModal />

        {/* Bottom Navigation Bar */}
        <BottomBar />
      </div>
    </QueryClientProvider>
  );
}

export default App;

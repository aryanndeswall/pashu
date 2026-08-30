import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ShieldCheck, WifiOff } from 'lucide-react';
import { HealthCheckView } from './views/HealthCheckView';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        {/* Header */}
        <header className="bg-emerald-950 border-b border-emerald-800/60 px-4 py-3 pt-6 sticky top-0 z-10 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-md shadow-emerald-950/40">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  पशु सुरक्षा <span className="text-[10px] bg-emerald-700/80 text-emerald-100 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">Suraksha</span>
                </h1>
                <p className="text-[11px] text-emerald-300/80">National Livestock Health Surveillance</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-900/60 border border-emerald-700/50 px-2.5 py-1 rounded-full text-xs text-emerald-200">
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-medium">Offline Core</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 max-w-md mx-auto w-full">
          <HealthCheckView />
        </main>

        {/* Footer */}
        <footer className="p-3 text-center text-[11px] text-slate-500 border-t border-slate-900">
          Pashu-Suraksha • Autonomous Biosecurity Surveillance (Phase 1 Verified)
        </footer>
      </div>
    </QueryClientProvider>
  );
}

export default App;

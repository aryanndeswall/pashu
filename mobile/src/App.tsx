import React from 'react';
import { ShieldCheck, Database, WifiOff, CheckCircle2, Activity } from 'lucide-react';

export function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-emerald-950 border-b border-emerald-800/60 px-4 py-4 pt-8 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-md shadow-emerald-950/40">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                पशु सुरक्षा <span className="text-xs bg-emerald-700/80 text-emerald-100 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">Suraksha</span>
              </h1>
              <p className="text-xs text-emerald-300/80">National Livestock Health Surveillance</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-900/60 border border-emerald-700/50 px-2.5 py-1 rounded-full text-xs text-emerald-200">
            <WifiOff className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium">Offline Core</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-md mx-auto w-full space-y-4">
        {/* Status Card */}
        <div className="bg-slate-800/90 border border-slate-700/70 rounded-2xl p-4 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Container Status</span>
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Native APK Ready
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1.5 border-b border-slate-700/50">
              <span className="text-slate-400">Runtime Container</span>
              <span className="font-semibold text-slate-200">Capacitor 6 Android</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-700/50">
              <span className="text-slate-400">App Package ID</span>
              <span className="font-mono text-xs font-semibold text-emerald-300">com.pashusuraksha.app</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-700/50">
              <span className="text-slate-400">Android SDK Target</span>
              <span className="font-semibold text-slate-200">SDK 28 - 34 (Android 9-14)</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Persistence Engine</span>
              <span className="flex items-center gap-1 text-slate-200 font-semibold">
                <Database className="w-3.5 h-3.5 text-emerald-400" /> Native SQLite (SQLCipher)
              </span>
            </div>
          </div>
        </div>

        {/* Diagnostic Banner */}
        <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-300 text-sm font-semibold">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Phase 1 Verification Shell Active</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Assets boot directly from on-device flash memory (<code className="text-emerald-300">assets/public/</code>). Ready for SQLite schema initialization and Maharashtra LGD seed loading in Plan 01-02.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-500 border-t border-slate-800">
        Pashu-Suraksha • Autonomous Biosecurity Surveillance
      </footer>
    </div>
  );
}

export default App;

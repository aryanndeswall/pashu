import React from 'react';
import { ShieldCheck, WifiOff, Sun, Moon } from 'lucide-react';
import { useNavigationStore } from '../../store/navigationStore';
import { hapticsService } from '../../services/hapticsService';

export const HeaderBar: React.FC = () => {
  const isDarkMode = useNavigationStore((state) => state.isDarkMode);
  const toggleDarkMode = useNavigationStore((state) => state.toggleDarkMode);

  const handleToggleTheme = async () => {
    await hapticsService.hapticLight();
    toggleDarkMode();
  };

  return (
    <header className="bg-emerald-950 dark:bg-slate-950 border-b border-emerald-800/60 dark:border-slate-800 px-4 py-3 pt-6 sticky top-0 z-30 shadow-md">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* App Title & Branding */}
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-600 p-1.5 rounded-xl text-white shadow-md shadow-emerald-950/40">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              पशु सुरक्षा{' '}
              <span className="text-[9px] bg-emerald-700/80 text-emerald-100 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Suraksha
              </span>
            </h1>
            <p className="text-[10px] text-emerald-300/80 dark:text-emerald-400">
              National Livestock Surveillance
            </p>
          </div>
        </div>

        {/* Header Controls: Offline Status & Theme Toggle */}
        <div className="flex items-center gap-2">
          {/* Offline Core Status Pill */}
          <div className="flex items-center gap-1 bg-emerald-900/70 border border-emerald-700/50 px-2 py-1 rounded-full text-[11px] text-emerald-200">
            <WifiOff className="w-3 h-3 text-amber-400" />
            <span className="font-semibold text-[10px]">Offline Core</span>
          </div>

          {/* Sunlight / Night Mode Toggle */}
          <button
            type="button"
            onClick={handleToggleTheme}
            aria-label={isDarkMode ? 'Switch to Sunlight Mode' : 'Switch to Dark Mode'}
            className="field-touch-target p-2 rounded-full text-emerald-300 hover:text-white hover:bg-emerald-900/60 active:scale-95 transition-all flex items-center justify-center"
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
  );
};

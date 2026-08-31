import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useNavigationStore } from '../../store/navigationStore';
import { hapticsService } from '../../services/hapticsService';

export const SOSButton: React.FC = () => {
  const setEmergencyModalOpen = useNavigationStore((state) => state.setEmergencyModalOpen);

  const handleClick = async () => {
    setEmergencyModalOpen(true);
    await hapticsService.hapticError();
  };

  return (
    <div className="relative flex items-center justify-center -translate-y-4">
      {/* Outer pulsating danger ring */}
      <span className="absolute w-16 h-16 rounded-full bg-red-500/30 animate-ping pointer-events-none" />

      {/* Main elevated circular SOS button */}
      <button
        type="button"
        onClick={handleClick}
        aria-label="Emergency Outbreak Alert / तातडीक आपत्कालीन सूचना"
        className="field-touch-target relative z-10 w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white shadow-lg shadow-red-950/40 border-4 border-white dark:border-slate-900 flex flex-col items-center justify-center transition-transform focus:outline-none focus:ring-4 focus:ring-red-500/50"
      >
        <AlertTriangle className="w-6 h-6 text-white animate-bounce mb-0.5" />
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-white">
          SOS
        </span>
      </button>
    </div>
  );
};

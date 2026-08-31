import React from 'react';
import { AlertOctagon } from 'lucide-react';
import { SyndromeDefinition } from '../../types/syndromes';
import { AnatomicalBadge } from './AnatomicalBadge';
import { HazardBorder } from '../animations/HazardBorder';
import { hapticsService } from '../../services/hapticsService';

interface SyndromeCardProps {
  syndrome: SyndromeDefinition;
  isSelected?: boolean;
  onSelect: (syndrome: SyndromeDefinition) => void;
}

export const SyndromeCard: React.FC<SyndromeCardProps> = ({
  syndrome,
  isSelected = false,
  onSelect,
}) => {
  const isHSDS = syndrome.code === 'HSDS';

  const handleClick = async () => {
    if (isHSDS) {
      await hapticsService.hapticError();
    } else {
      await hapticsService.hapticMedium();
    }
    onSelect(syndrome);
  };

  const getSeverityBadge = () => {
    switch (syndrome.severity) {
      case 'CRITICAL_BIOHAZARD':
        return (
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-600 text-white flex items-center gap-1 uppercase tracking-wider animate-pulse">
            <AlertOctagon className="w-3 h-3" />
            आपत्कालीन
          </span>
        );
      case 'HIGH_CONTAGION':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white uppercase tracking-wider">
            तीव्र संसर्ग
          </span>
        );
      case 'ELEVATED':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-600 text-white uppercase tracking-wider">
            लक्ष्य
          </span>
        );
      case 'ROUTINE_ENDEMIC':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-600 text-white uppercase tracking-wider">
            सामान्य
          </span>
        );
    }
  };

  const cardContent = (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`${syndrome.nameMarathi} (${syndrome.code})`}
      className={`field-touch-target w-full text-left p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between h-full bg-white dark:bg-slate-900 shadow-sm hover:shadow-md active:scale-98 ${
        isSelected
          ? 'border-emerald-600 dark:border-emerald-500 ring-2 ring-emerald-500/30'
          : isHSDS
          ? 'border-red-500/80 bg-red-50/40 dark:bg-red-950/20'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Top row: Anatomical Icon & Code / Severity pill */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <AnatomicalBadge
          anatomicalPart={syndrome.anatomicalPart}
          severity={syndrome.severity}
        />
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs font-black text-slate-800 dark:text-slate-200 font-mono tracking-wider bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
            {syndrome.code}
          </span>
          {getSeverityBadge()}
        </div>
      </div>

      {/* Center content: Marathi Name and Colloquial Name */}
      <div className="flex-1 mb-2">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white lang-devanagari leading-snug">
          {syndrome.nameMarathi}
        </h3>
        <p className="text-[11px] text-emerald-800 dark:text-emerald-400 font-medium lang-devanagari mt-0.5 line-clamp-1">
          ({syndrome.colloquialMarathi})
        </p>
      </div>

      {/* Bottom row: English title subtitle */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
          {syndrome.nameEnglish}
        </p>
      </div>
    </button>
  );

  return (
    <div className="h-full">
      {isHSDS ? (
        <HazardBorder isActive={true} className="h-full">
          {cardContent}
        </HazardBorder>
      ) : (
        cardContent
      )}
    </div>
  );
};

import React from 'react';
import {
  Sparkles,
  CircleDot,
  Skull,
  Wind,
  ShieldAlert,
  HeartPulse,
  Flame,
  Zap,
} from 'lucide-react';
import { SyndromeDefinition } from '../../types/syndromes';

interface AnatomicalBadgeProps {
  anatomicalPart: SyndromeDefinition['anatomicalPart'];
  severity: SyndromeDefinition['severity'];
  className?: string;
}

export const AnatomicalBadge: React.FC<AnatomicalBadgeProps> = ({
  anatomicalPart,
  severity,
  className = '',
}) => {
  const getIcon = () => {
    switch (anatomicalPart) {
      case 'mouth_hoof':
        return <Sparkles className="w-5 h-5" />;
      case 'skin_lumps':
        return <CircleDot className="w-5 h-5" />;
      case 'sudden_death_blood':
        return <Skull className="w-5 h-5" />;
      case 'respiratory':
        return <Wind className="w-5 h-5" />;
      case 'swollen_quarter':
        return <ShieldAlert className="w-5 h-5" />;
      case 'reproductive':
        return <HeartPulse className="w-5 h-5" />;
      case 'enteric':
        return <Flame className="w-5 h-5" />;
      case 'neurological':
        return <Zap className="w-5 h-5" />;
      default:
        return <CircleDot className="w-5 h-5" />;
    }
  };

  const getSeverityStyle = () => {
    switch (severity) {
      case 'CRITICAL_BIOHAZARD':
        return 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300 border-red-300 dark:border-red-800';
      case 'HIGH_CONTAGION':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'ELEVATED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'ROUTINE_ENDEMIC':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300';
    }
  };

  return (
    <div
      className={`inline-flex items-center justify-center p-2 rounded-xl border shadow-xs ${getSeverityStyle()} ${className}`}
      aria-hidden="true"
    >
      {getIcon()}
    </div>
  );
};

import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, HeartPulse, User, MapPin, Phone } from 'lucide-react';
import { LocalAnimal, formatTagNumber } from '../../services/animalService';
import { hapticsService } from '../../services/hapticsService';
import { useLanguageStore } from '../../store/languageStore';

interface AnimalCardProps {
  animal: LocalAnimal;
  onSelect?: (animal: LocalAnimal) => void;
  selected?: boolean;
}

export const AnimalCard: React.FC<AnimalCardProps> = ({ animal, onSelect, selected }) => {
  const { currentLanguage, t } = useLanguageStore();

  const getSpeciesEmoji = (species: string) => {
    const s = species.toLowerCase();
    if (s.includes('cow') || s.includes('गाय') || s.includes('bovine')) return '🐄';
    if (s.includes('buffalo') || s.includes('म्हैस')) return '🐃';
    if (s.includes('goat') || s.includes('शेळी') || s.includes('caprine')) return '🐐';
    if (s.includes('sheep') || s.includes('मेंढी') || s.includes('ovine')) return '🐑';
    return '🐾';
  };

  const handleClick = async () => {
    await hapticsService.hapticLight();
    if (onSelect) {
      onSelect(animal);
    }
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      data-testid={`animal-card-${animal.tagNumber}`}
      className={`relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left ${
        selected
          ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
      }`}
    >
      {/* Header with Tag & Booster Badge */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl shadow-inner flex-shrink-0">
            {getSpeciesEmoji(animal.species)}
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 font-semibold block">
              {t('pashuAadhaarTitle', 'पशू आधार १२-अंकी टॅग')}
            </span>
            <span className="text-sm font-black font-mono tracking-wide text-slate-900 dark:text-white">
              {formatTagNumber(animal.tagNumber)}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        {animal.vaccinationStatus === 'UP_TO_DATE' && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t('vaccinesComplete', 'लस पूर्ण')}</span>
          </span>
        )}
        {animal.vaccinationStatus === 'BOOSTER_DUE' && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300/50 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{t('boosterDue', 'बूस्टर वेळ')}</span>
          </span>
        )}
        {animal.vaccinationStatus === 'OVERDUE' && (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-red-600 text-white shadow-sm">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>{t('vaccineOverdue', 'लस थकीत')}</span>
          </span>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <div>
          <span className="text-[10px] text-slate-400 font-medium block">{t('speciesBreed', 'प्रजाती व जात')}</span>
          <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
            {animal.breed || animal.species}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-medium block">{t('age', 'वय')}</span>
          <span className="font-bold text-slate-800 dark:text-slate-200 block">
            {animal.ageMonths} {t('months', 'महिने')} ({Math.floor(animal.ageMonths / 12)} {t('years', 'वर्षे')})
          </span>
        </div>
      </div>

      {/* Owner & Village Info */}
      <div className="mt-2.5 pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1 truncate max-w-[60%]">
          <User className="w-3 h-3 text-slate-400 flex-shrink-0" />
          <span className="truncate font-medium text-slate-700 dark:text-slate-300">{animal.ownerName}</span>
        </div>
        <div className="flex items-center gap-1">
          <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
          <span className="font-mono text-[10px]">{animal.ownerMobileMasked}</span>
        </div>
      </div>
    </div>
  );
};

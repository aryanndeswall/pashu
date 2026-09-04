import React from 'react';
import { SyndromeCategory } from '../../types/syndromes';
import { SECONDARY_SYMPTOMS_BY_SYNDROME } from '../../services/decisionTreeService';
import { hapticsService } from '../../services/hapticsService';
import { Check, AlertCircle } from 'lucide-react';

interface SecondarySymptomsSelectorProps {
  syndromeCode: SyndromeCategory;
  selectedSymptomIds: string[];
  onToggleSymptom: (symptomId: string) => void;
}

export const SecondarySymptomsSelector: React.FC<SecondarySymptomsSelectorProps> = ({
  syndromeCode,
  selectedSymptomIds,
  onToggleSymptom,
}) => {
  const secondarySymptoms = SECONDARY_SYMPTOMS_BY_SYNDROME[syndromeCode] || [];

  const handleToggle = async (symptomId: string) => {
    await hapticsService.hapticLight();
    onToggleSymptom(symptomId);
  };

  if (secondarySymptoms.length === 0) return null;

  return (
    <div className="bg-slate-100/80 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2.5">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 lang-devanagari flex items-center gap-1.5">
          <span>तपशीलवार लक्षणे निवडा (Select Observed Symptoms):</span>
        </h4>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
          {selectedSymptomIds.length} निवडले
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {secondarySymptoms.map((symptom) => {
          const isSelected = selectedSymptomIds.includes(symptom.id);

          return (
            <button
              key={symptom.id}
              type="button"
              onClick={() => handleToggle(symptom.id)}
              aria-pressed={isSelected}
              className={`field-touch-target text-left p-2.5 rounded-xl border transition-all text-xs flex items-center justify-between gap-2 active:scale-98 ${
                isSelected
                  ? symptom.isHighRisk
                    ? 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-950 dark:text-red-200 ring-1 ring-red-500/30'
                    : 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 ring-1 ring-emerald-500/30'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 ${
                    isSelected
                      ? symptom.isHighRisk
                        ? 'bg-red-600 border-red-600 text-white'
                        : 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>

                <div className="pr-1">
                  <div className="font-bold lang-devanagari leading-snug">
                    {symptom.nameMarathi}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                    {symptom.nameEnglish}
                  </div>
                </div>
              </div>

              {symptom.isHighRisk && (
                <span title="High Risk Zoonotic Indicator">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

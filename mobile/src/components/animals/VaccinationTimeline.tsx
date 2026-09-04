import React from 'react';
import { Syringe, Calendar, CheckCircle2, Clock, AlertTriangle, ShieldAlert } from 'lucide-react';
import { VaccineRecord } from '../../services/animalService';

interface VaccinationTimelineProps {
  vaccines: VaccineRecord[];
  tagNumber: string;
}

export const VaccinationTimeline: React.FC<VaccinationTimelineProps> = ({
  vaccines,
  tagNumber,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Syringe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            DAHD राष्ट्रीय लसीकरण वेळापत्रक (Vaccination Ledger)
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          Tag: {tagNumber}
        </span>
      </div>

      <div className="space-y-2.5">
        {vaccines.map((v) => {
          const isDueSoon = v.status === 'BOOSTER_DUE';
          const isOverdue = v.status === 'OVERDUE';

          return (
            <div
              key={v.disease}
              data-testid={`vaccine-row-${v.disease}`}
              className={`p-3 rounded-xl border transition-all ${
                isDueSoon
                  ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/80'
                  : isOverdue
                  ? 'bg-red-50/60 dark:bg-red-950/30 border-red-300 dark:border-red-800/80'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-xs font-black text-slate-900 dark:text-white block">
                    {v.diseaseNameMarathi}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    बॅच क्र.: {v.batchNumber}
                  </span>
                </div>

                {/* Status Pill */}
                {v.status === 'UP_TO_DATE' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    लस पूर्ण
                  </span>
                )}
                {v.status === 'BOOSTER_DUE' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 animate-pulse">
                    <Clock className="w-3 h-3 text-amber-700 dark:text-amber-300" />
                    {v.daysRemaining} दिवसात बूस्टर
                  </span>
                )}
                {v.status === 'OVERDUE' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-600 text-white">
                    <ShieldAlert className="w-3 h-3" />
                    मुदत संपली ({Math.abs(v.daysRemaining)} दिवस)
                  </span>
                )}
              </div>

              {/* Dates Row */}
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>शेवटचा डोस: <strong className="font-mono">{v.lastDoseDate}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>पुढील डोस: <strong className={`font-mono ${isDueSoon ? 'text-amber-700 dark:text-amber-400 font-bold' : ''}`}>{v.nextBoosterDue}</strong></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

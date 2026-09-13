import React from 'react';
import { Info } from 'lucide-react';
import { ReportWizardView } from './ReportWizardView';
import { useLanguageStore } from '../../store/languageStore';

export const FarmerReportView: React.FC = () => {
  const { currentLanguage, t } = useLanguageStore();

  return (
    <div className="space-y-4">
      {/* Top Banner / Guidance */}
      <div className="bg-emerald-900/10 dark:bg-emerald-950/40 border border-emerald-500/20 rounded-2xl p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-600/10 text-emerald-700 dark:text-emerald-300">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`text-xs font-bold text-slate-800 dark:text-slate-200 ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
              {t('fieldReportTitle', 'Syndromic Field Report')}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {t('fieldReportSubtitle', 'Record symptoms, photos, voice notes & GPS in 3 easy steps')}
            </p>
          </div>
        </div>
      </div>

      {/* 3-Step Multi-Sensor Reporting Wizard */}
      <ReportWizardView />
    </div>
  );
};

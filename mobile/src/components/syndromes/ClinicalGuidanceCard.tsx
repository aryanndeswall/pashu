import React from 'react';
import { DecisionTreeResult } from '../../types/syndromes';
import { useAuthStore } from '../../store/authStore';
import { useLanguageStore } from '../../store/languageStore';
import { Stethoscope, ShieldAlert, PhoneCall, AlertTriangle, FileText } from 'lucide-react';
import { localizeInterimAdvice } from '../../utils/clinicalLocalization';

interface ClinicalGuidanceCardProps {
  result: DecisionTreeResult;
}

export const ClinicalGuidanceCard: React.FC<ClinicalGuidanceCardProps> = ({ result }) => {
  const activeRole = useAuthStore((state) => state.activeRole);
  const { currentLanguage, t } = useLanguageStore();
  const isClinicalUser = activeRole === 'doctor' || activeRole === 'admin';

  if (isClinicalUser) {
    // Technical Differential Diagnosis Card for Field Vets & DVO
    return (
      <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-3.5 space-y-3 shadow-xs">
        {/* Header: Primary Differential & ICD/OIE Code */}
        <div className="flex items-start justify-between gap-2 border-b border-blue-200/80 dark:border-blue-900/60 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-600 text-white shadow-xs">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-blue-950 dark:text-blue-200 font-mono">
                {result.primaryDifferential.diseaseName}
              </div>
              <div className={`text-[11px] font-semibold text-blue-800 dark:text-blue-300 ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                {currentLanguage === 'en'
                  ? (result.primaryDifferential.diseaseNameEnglish || result.primaryDifferential.diseaseName)
                  : currentLanguage === 'hi'
                  ? (result.primaryDifferential.diseaseNameHindi || result.primaryDifferential.diseaseNameMarathi)
                  : result.primaryDifferential.diseaseNameMarathi}
              </div>

            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-200/80 dark:bg-blue-900/80 text-blue-900 dark:text-blue-200 font-bold">
              {result.primaryDifferential.icd11OrOieCode}
            </span>
            <span
              className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                result.primaryDifferential.confidence === 'CONFIRMED_ALERT'
                  ? 'bg-red-600 text-white animate-pulse'
                  : result.primaryDifferential.confidence === 'HIGHLY_PROBABLE'
                  ? 'bg-amber-500 text-white'
                  : 'bg-blue-600 text-white'
              }`}
            >
              {result.primaryDifferential.confidence}
            </span>
          </div>
        </div>

        {/* Clinical Guidance */}
        <div className="space-y-1 text-xs text-blue-900 dark:text-blue-200">
          <div className="font-bold flex items-center gap-1.5 text-blue-950 dark:text-blue-100">
            <FileText className="w-3.5 h-3.5" />
            <span>Differential Clinical Analysis:</span>
          </div>
          <p className="text-[11px] leading-relaxed pl-5 opacity-90">
            {result.clinicalGuidance}
          </p>
        </div>

        {/* Laboratory & Biosecurity Directives */}
        <div className="space-y-1 text-xs text-blue-900 dark:text-blue-200 bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/40">
          <div className="font-bold text-[11px] text-blue-950 dark:text-blue-200">
            Field Sample & Treatment Protocol:
          </div>
          <p className="text-[11px] leading-snug">
            {currentLanguage === 'en'
              ? result.primaryDifferential.recommendedAction
              : currentLanguage === 'hi'
              ? (result.primaryDifferential.recommendedActionHindi || result.primaryDifferential.recommendedActionMarathi)
              : result.primaryDifferential.recommendedActionMarathi}
          </p>
        </div>

        {/* IDSP Notice if Notifiable */}
        {result.idspNotifiable && (
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-950/60 px-2 py-1 rounded-lg border border-red-200 dark:border-red-900">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>IDSP / NCDC One-Health Zoonotic Notifiable Event</span>
          </div>
        )}
      </div>
    );
  }

  // Simplified Vernacular Containment Advisory for Farmer / Consumer
  return (
    <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-3.5 space-y-2.5 shadow-xs">
      <div className="flex items-center gap-2 border-b border-emerald-200/80 dark:border-emerald-900/60 pb-2">
        <div className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-xs">
          <ShieldAlert className="w-4 h-4" />
        </div>
        <div>
          <h4 className={`text-xs font-bold text-emerald-950 dark:text-emerald-200 ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
            {t('farmerAdvisoryTitle', 'पशुपालकांसाठी महत्त्वाची काळजी (Farmer Advisory)')}
          </h4>
          <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
            {t('suspectedDisease', 'संशयित आजार:')} {currentLanguage === 'en' ? result.primaryDifferential.diseaseName : currentLanguage === 'hi' ? (result.primaryDifferential.diseaseNameHindi || result.primaryDifferential.diseaseNameMarathi) : result.primaryDifferential.diseaseNameMarathi}
          </p>
        </div>
      </div>

      <p className={`text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
        {currentLanguage === 'en'
          ? (result.farmerAdvisoryEnglish || result.primaryDifferential.recommendedAction || localizeInterimAdvice(result.farmerAdvisory, 'en', result.primaryDifferential.icd11OrOieCode))
          : currentLanguage === 'hi'
          ? (result.farmerAdvisoryHindi || localizeInterimAdvice(result.farmerAdvisory, 'hi', result.primaryDifferential.icd11OrOieCode))
          : result.farmerAdvisory}
      </p>

      <div className="pt-1 flex items-center justify-between">
        <a
          href="tel:1962"
          className="field-touch-target px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>{t('helplineBtn', 'पशु सखी हेल्पलाइन (१९६२)')}</span>
        </a>
        <span className="text-[10px] text-slate-500 dark:text-slate-400">
          {t('helpline24x7', 'टोल-फ्री २४x७ सेवा')}
        </span>
      </div>
    </div>
  );
};

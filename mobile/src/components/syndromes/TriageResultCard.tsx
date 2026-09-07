import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  BrainCircuit,
  Volume2,
  FileText,
  AlertOctagon,
  Sparkles,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { TriageResponse } from '../../services/aiTriageService';
import { hapticsService } from '../../services/hapticsService';
import { useLanguageStore } from '../../store/languageStore';

interface TriageResultCardProps {
  triage: TriageResponse;
  onAcknowledge?: () => void;
}

export const TriageResultCard: React.FC<TriageResultCardProps> = ({ triage, onAcknowledge }) => {
  const { currentLanguage, t } = useLanguageStore();
  const [activeLang, setActiveLang] = useState<'mr' | 'hi' | 'en'>(
    currentLanguage === 'en' ? 'en' : currentLanguage === 'hi' ? 'hi' : 'mr'
  );

  useEffect(() => {
    setActiveLang(currentLanguage === 'en' ? 'en' : currentLanguage === 'hi' ? 'hi' : 'mr');
  }, [currentLanguage]);

  const isAnthraxLock = triage.biohazard_alert === 'CRITICAL_ANTHRAX_LOCK';
  const confidencePercent = Math.round(triage.clinical_confidence * 100);

  useEffect(() => {
    if (isAnthraxLock) {
      hapticsService.hapticError();
    } else {
      hapticsService.hapticLight();
    }
  }, [isAnthraxLock]);

  const syndromeName =
    currentLanguage === 'en'
      ? triage.syndrome_name_en
      : currentLanguage === 'hi'
      ? triage.syndrome_name_hindi || triage.syndrome_name_marathi
      : triage.syndrome_name_marathi;

  const getAdvisoryText = () => {
    if (activeLang === 'en') {
      return (
        triage.immediate_advisory_en ||
        (isAnthraxLock
          ? 'DANGER! DO NOT OPEN OR CUT THE CARCASS. Severe risk of fatal human infection. Bury carcass in a 6-foot deep lime pit.'
          : 'Isolate affected animals immediately. Wash oral blisters and foot lesions with diluted potassium permanganate (KMnO4) antiseptic.')
      );
    }
    if (activeLang === 'hi') {
      return triage.immediate_advisory_hindi;
    }
    return triage.immediate_advisory_marathi;
  };

  return (
    <div
      data-testid="triage-result-card"
      className={`relative rounded-3xl p-5 border transition-all duration-300 shadow-lg text-left ${
        isAnthraxLock
          ? 'bg-red-50/90 dark:bg-red-950/80 border-red-600 ring-4 ring-red-600/30 animate-pulse'
          : 'bg-white dark:bg-slate-900 border-emerald-500/30 dark:border-emerald-500/20 shadow-emerald-500/5'
      }`}
    >
      {/* Anthrax Emergency Biohazard Banner */}
      {isAnthraxLock && (
        <div
          data-testid="anthrax-biohazard-banner"
          className="mb-4 p-3 rounded-2xl bg-red-600 text-white flex items-center gap-3 shadow-md"
        >
          <AlertOctagon className="w-6 h-6 flex-shrink-0 animate-bounce text-amber-200" />
          <div>
            <span className="text-xs font-black tracking-wider uppercase block">
              {currentLanguage === 'en' ? 'CRITICAL ANTHRAX BIOHAZARD' : 'जीवघेणा धोका (CRITICAL ANTHRAX BIOHAZARD)'}
            </span>
            <p className="text-[11px] font-bold text-red-100">
              {currentLanguage === 'en' ? 'DO NOT CUT OR OPEN CARCASS' : 'शवविच्छेदन अजिबात करू नका (DO NOT CUT OR OPEN CARCASS)'}
            </p>
          </div>
        </div>
      )}

      {/* Header: AI Badge & Confidence Gauge */}
      <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              isAnthraxLock
                ? 'bg-red-600 text-white'
                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
            }`}
          >
            {isAnthraxLock ? <ShieldAlert className="w-5 h-5" /> : <BrainCircuit className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Gemini 3.7 Flash Triage
              </span>
              <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                <Clock className="w-2.5 h-2.5" />
                {triage.inference_time_ms}ms
              </span>
            </div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              {syndromeName}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {currentLanguage === 'en' && triage.syndrome_name_en ? triage.syndrome_name_en : triage.suspected_disease}
            </p>
          </div>
        </div>

        {/* Confidence Pill */}
        <div className="text-right">
          <span className="text-[10px] text-slate-400 block font-medium">
            {t('confidence', 'Confidence')}
          </span>
          <span
            data-testid="confidence-badge"
            className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full ${
              isAnthraxLock
                ? 'bg-red-600 text-white'
                : confidencePercent >= 90
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300/50'
                : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/50'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>{confidencePercent}%</span>
          </span>
        </div>
      </div>

      {/* Clinical Rationale (Explainable AI) */}
      <div className="py-3 text-xs space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
          {t('aiClinicalRationale', 'AI Clinical Rationale')}
        </span>
        <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
          {triage.clinical_rationale}
        </p>

        {triage.identified_symptoms.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1.5">
            {triage.identified_symptoms.map((symptom, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                ✓ {symptom}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Vernacular Advisory Card with Marathi/Hindi/English Tabs */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-emerald-600" />
            <span>{t('farmerDirective', 'Farmer Advisory Directive')}</span>
          </span>

          <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setActiveLang('mr')}
              className={`px-2 py-0.5 rounded-md transition-all ${
                activeLang === 'mr'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              मराठी
            </button>
            <button
              type="button"
              onClick={() => setActiveLang('hi')}
              className={`px-2 py-0.5 rounded-md transition-all ${
                activeLang === 'hi'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              हिंदी
            </button>
            <button
              type="button"
              onClick={() => setActiveLang('en')}
              className={`px-2 py-0.5 rounded-md transition-all ${
                activeLang === 'en'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              English
            </button>
          </div>
        </div>

        <div
          data-testid="advisory-text"
          className={`p-3.5 rounded-2xl text-xs font-semibold leading-relaxed border ${
            isAnthraxLock
              ? 'bg-red-100 dark:bg-red-950/90 text-red-900 dark:text-red-200 border-red-300 dark:border-red-800'
              : 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-200/60 dark:border-emerald-800/60'
          }`}
        >
          {getAdvisoryText()}
        </div>
      </div>

      {/* Recommended Containment Checklist */}
      {triage.recommended_containment_actions.length > 0 && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            {t('biosecurityChecklist', 'Emergency Biosecurity Checklist')}
          </span>
          <div className="space-y-1">
            {triage.recommended_containment_actions.map((action, i) => (
              <div key={i} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Acknowledge Button */}
      {onAcknowledge && (
        <div className="pt-4">
          <button
            type="button"
            onClick={onAcknowledge}
            className={`field-touch-target w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.98] ${
              isAnthraxLock
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
            }`}
            data-testid="btn-acknowledge-triage"
          >
            <span>{t('acknowledgeAdvisory', 'Acknowledge Advisory')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

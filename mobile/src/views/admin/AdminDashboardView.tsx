import React, { useState, useEffect } from 'react';
import {
  Activity,
  Building2,
  AlertOctagon,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useLanguageStore } from '../../store/languageStore';
import { CommandMapView } from '../../components/gis/CommandMapView';
import { EpiCurveChart } from '../../components/gis/EpiCurveChart';
import { MarketClosureModal } from '../../components/gis/MarketClosureModal';
import { getApiUrl } from '../../config/api';

export const AdminDashboardView: React.FC = () => {
  const { userProfile } = useAuthStore();
  const { currentLanguage, t } = useLanguageStore();
  const [isMemoModalOpen, setIsMemoModalOpen] = useState(false);
  const [activeClusters, setActiveClusters] = useState<any[]>([]);

  useEffect(() => {
    fetch(getApiUrl('clusters/active'))
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setActiveClusters(Array.isArray(data) ? data : []))
      .catch((err) => console.warn('Failed to load active clusters for admin war room:', err));
  }, []);

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* Command Center Title & Statutory Memo Action */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
            <Activity className="w-5 h-5 text-purple-700 dark:text-purple-400" />
          </div>
          <div>
            <h2 className={`text-sm font-bold text-slate-900 dark:text-white ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
              {t('commandWarRoomTitle', 'District GIS Command War Room')}
            </h2>
            <p className="text-[11px] text-slate-500 font-mono">
              {userProfile.district} {currentLanguage === 'en' ? 'District' : 'जिल्हा'} •{' '}
              {activeClusters.length > 0
                ? `PCICDA biosecurity command: ${activeClusters[0].id}`
                : currentLanguage === 'en'
                ? 'Biosecurity surveillance normal'
                : 'रोग नियंत्रण कक्ष सामान्य स्थिती'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsMemoModalOpen(true)}
          className={`field-touch-target px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5 text-xs shadow-sm transition-transform active:scale-95 ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}
          aria-label="Issue Market Closure Order"
        >
          <Building2 className="w-4 h-4" />
          <span>{t('marketClosureBtn', 'Market Closure Order')}</span>
        </button>
      </div>

      {/* Executive Outbreak Metric Tiles */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-2.5 border border-rose-200 dark:border-rose-900 shadow-sm">
          <span className={`text-[10px] text-slate-400 block truncate ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
            {t('activeClusters', 'Active Clusters')}
          </span>
          <strong className="text-lg font-black text-rose-600 flex items-center justify-center gap-0.5">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>
              {activeClusters.length} {t('declared', 'Declared')}
            </span>
          </strong>
          <span className="text-[9px] text-rose-500 font-bold block">
            {activeClusters.length > 0 ? `${activeClusters[0].primary_disease || 'Active'}` : 'Normal'}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-2.5 border border-amber-200 dark:border-amber-900 shadow-sm">
          <span className={`text-[10px] text-slate-400 block truncate ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
            {t('surveillanceVillages', 'Surveillance Villages')}
          </span>
          <strong className="text-lg font-black text-amber-600">
            {activeClusters.length > 0 ? 4 : 0}{' '}
            {currentLanguage === 'en' ? 'Villages' : currentLanguage === 'hi' ? 'गांव' : 'गावे'}
          </strong>
          <span className={`text-[9px] text-amber-600 font-bold block ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
            {activeClusters.length > 0 ? t('perimeter10km', '10 km Perimeter') : 'Perimeter 0 km'}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-2.5 border border-purple-200 dark:border-purple-900 shadow-sm">
          <span className={`text-[10px] text-slate-400 block truncate ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
            {t('ringVaccinationTarget', 'Ring Vaccination Target')}
          </span>
          <strong className="text-lg font-black text-purple-600">
            {activeClusters.length > 0 ? activeClusters[0].cases_count * 150 : 0}
          </strong>
          <span className="text-[9px] text-purple-600 font-bold block">
            {activeClusters.length > 0 ? '72h SLA' : 'Surveillance'}
          </span>
        </div>
      </div>

      {/* Interactive Web-GIS Outbreak Vector Map (1km, 5km, 10km rings) */}
      <CommandMapView />

      {/* 14-Day Rolling Epidemic Curve Chart (TimescaleDB) */}
      <EpiCurveChart />

      {/* Taluka Biosecurity Risk Breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 className={`text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
            {t('talukaRiskBreakdown', 'Taluka Biosecurity Risk Matrix')}
          </h3>
          <span className="text-[10px] font-mono text-slate-400">LGD Census 2026</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs">
            <div>
              <strong className="text-slate-900 dark:text-white block font-bold">
                {currentLanguage === 'en' ? 'Rahuri' : 'Rahuri (राहुरी)'}
              </strong>
              <span className="text-[10px] text-slate-500">Ashwi Budruk Epicenter • 3,240 Bovines</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px]">
              {t('highRiskZone', 'Critical Outbreak Zone')}
            </span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs">
            <div>
              <strong className="text-slate-900 dark:text-white block font-bold">
                {currentLanguage === 'en' ? 'Sangamner' : 'Sangamner (संगमनेर)'}
              </strong>
              <span className="text-[10px] text-slate-500">5km Ring Buffer • 2,480 Bovines</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-600 text-white font-black text-[10px]">
              {t('mediumRiskZone', 'Surveillance Buffer')}
            </span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
            <div>
              <strong className="text-slate-900 dark:text-white block font-bold">
                {currentLanguage === 'en' ? 'Kopargaon' : 'Kopargaon (कोपरगाव)'}
              </strong>
              <span className="text-[10px] text-slate-500">10km Perimeter • 2,130 Bovines</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px]">
              {t('lowRiskZone', 'Monitored Normal')}
            </span>
          </div>
        </div>
      </div>

      {/* Statutory Market Closure Order Generator Modal */}
      <MarketClosureModal
        isOpen={isMemoModalOpen}
        onClose={() => setIsMemoModalOpen(false)}
      />
    </div>
  );
};

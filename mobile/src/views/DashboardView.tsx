import React, { useState } from 'react';
import {
  ShieldCheck,
  Database,
  Radio,
  BellRing,
  MapPin,
  Building2,
  FileSpreadsheet,
  AlertOctagon,
  Activity,
} from 'lucide-react';
import { RadarSweep } from '../components/animations/RadarSweep';
import { CountUpTicker } from '../components/animations/CountUpTicker';
import { HealthCheckView } from './HealthCheckView';
import { useAuthStore } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';
import { CommandMapView } from '../components/gis/CommandMapView';
import { EpiCurveChart } from '../components/gis/EpiCurveChart';
import { MarketClosureModal } from '../components/gis/MarketClosureModal';
import { SihDemoSimulatorCard } from '../components/gis/SihDemoSimulatorCard';

export const DashboardView: React.FC = () => {
  const { activeRole, userProfile } = useAuthStore();
  const { currentLanguage, t } = useLanguageStore();
  const [isMemoModalOpen, setIsMemoModalOpen] = useState(false);

  // If activeRole is admin, display the full Web-GIS Outbreak Command War Room
  if (activeRole === 'admin') {
    return (
      <div className="space-y-4 pb-12">
        {/* Command Center Title & Statutory Memo Action */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              <Activity className="w-5 h-5 text-purple-700 dark:text-purple-400" />
            </div>
            <div>
              <h2 className={`text-sm font-bold text-slate-900 dark:text-white ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                {t('commandWarRoomTitle', 'जिल्हा नियंत्रण कक्ष (GIS Command War Room)')}
              </h2>
              <p className="text-[11px] text-slate-500">
                {userProfile.district} • PCICDA biosecurity command
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
            <span>{t('marketClosureBtn', 'बाजार बंदी आदेश')}</span>
          </button>
        </div>

        {/* Executive Outbreak Metric Tiles */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-2.5 border border-rose-200 dark:border-rose-900 shadow-sm">
            <span className={`text-[10px] text-slate-400 block truncate ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
              {t('activeClusters', 'सक्रिय क्लस्टर')}
            </span>
            <strong className="text-lg font-black text-rose-600 flex items-center justify-center gap-0.5">
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>1 {t('declared', 'घोषित')}</span>
            </strong>
            <span className="text-[9px] text-rose-500 font-bold block">OPS 0.84</span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-2.5 border border-amber-200 dark:border-amber-900 shadow-sm">
            <span className={`text-[10px] text-slate-400 block truncate ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
              {t('surveillanceVillages', 'पाळत गावे (LGD)')}
            </span>
            <strong className="text-lg font-black text-amber-600">4 {currentLanguage === 'en' ? 'Villages' : 'गावे'}</strong>
            <span className={`text-[9px] text-amber-600 font-bold block ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
              {t('perimeter10km', '१० किमी परिमिती')}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-2.5 border border-purple-200 dark:border-purple-900 shadow-sm">
            <span className={`text-[10px] text-slate-400 block truncate ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
              {t('ringVaccinationTarget', 'रिंग लसीकरण लक्ष्य')}
            </span>
            <strong className="text-lg font-black text-purple-600">3,550</strong>
            <span className="text-[9px] text-purple-600 font-bold block">72h SLA</span>
          </div>
        </div>

        {/* SIH Hackathon Live Demonstration Scenario Card */}
        <SihDemoSimulatorCard />

        {/* Interactive Web-GIS Outbreak Vector Map (1km, 5km, 10km rings) */}
        <CommandMapView />

        {/* 14-Day Rolling Epidemic Curve Chart (TimescaleDB) */}
        <EpiCurveChart />

        {/* Statutory Market Closure Order Generator Modal */}
        <MarketClosureModal
          isOpen={isMemoModalOpen}
          onClose={() => setIsMemoModalOpen(false)}
        />
      </div>
    );
  }

  // Consumer (Farmer) and Doctor (Vet) localized view
  return (
    <div className="space-y-4 pb-8">
      {/* Live Geospatial Surveillance Widget */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {t('localPerimeterRadar', 'स्थानिक पाळत परिमिती (5 km Radar)')}
            </h2>
          </div>
          <span className="text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {currentLanguage === 'en' ? 'Ahmednagar' : 'अहमदनगर (Ahmednagar)'}
          </span>
        </div>

        {/* Center Radar Sweep */}
        <div className="flex justify-center py-2">
          <RadarSweep size={180} />
        </div>

        <p className={`text-[11px] text-center text-slate-500 dark:text-slate-400 mt-2 ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
          {t('noOutbreakFound', '५ किमी परिघात कोणतीही संसर्गजन्य हालचाल आढळलेली नाही (Zero Outbreak Rings).')}
        </p>
      </div>

      {/* Metric Counters Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Offline Queue Count */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className={`text-[11px] font-medium ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
              {t('pendingReports', 'प्रलंबित अहवाल')}
            </span>
            <Database className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
            <CountUpTicker end={4} durationMs={900} />
            <span className="text-[11px] font-normal text-slate-400">offline</span>
          </div>
          <p className={`text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
            {t('securedInSqlite', 'SQLite मध्ये सुरक्षित')}
          </p>
        </div>

        {/* LGD Villages Monitored */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className={`text-[11px] font-medium ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
              {t('monitoredVillages', 'निरीक्षण गावे')}
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
            <CountUpTicker end={26} durationMs={1000} />
            <span className="text-[11px] font-normal text-slate-400">villages</span>
          </div>
          <p className={`text-[10px] text-slate-500 dark:text-slate-400 mt-1 ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
            {t('lgdBordersAttached', 'LGD सीमा संलग्न')}
          </p>
        </div>
      </div>

      {/* Active Surveillance Alert Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/60 rounded-2xl p-3.5 flex items-start gap-3">
        <BellRing className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h3 className={`text-xs font-bold text-amber-900 dark:text-amber-200 ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
            {t('weatherWarningTitle', 'दक्षता सूचना: हवामान बदल (Weather Warning)')}
          </h3>
          <p className={`text-[11px] text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
            {t('weatherWarningDesc', 'पावसामुळे घटसर्प (HS) व एकटांग्या (BQ) रोगाचा धोका वाढला आहे. पशुपालकांना लसीकरणाचा सल्ला द्या.')}
          </p>
        </div>
      </div>

      {/* Collapsible SQLite Diagnostic Core */}
      <div className="pt-2">
        <HealthCheckView />
      </div>
    </div>
  );
};

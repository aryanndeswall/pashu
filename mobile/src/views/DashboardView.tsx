import React from 'react';
import { ShieldCheck, Database, Radio, BellRing, MapPin } from 'lucide-react';
import { RadarSweep } from '../components/animations/RadarSweep';
import { CountUpTicker } from '../components/animations/CountUpTicker';
import { HealthCheckView } from './HealthCheckView';

export const DashboardView: React.FC = () => {
  return (
    <div className="space-y-4 pb-8">
      {/* Live Geospatial Surveillance Widget */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              स्थानिक पाळत परिमिती (5 km Radar)
            </h2>
          </div>
          <span className="text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            अहमदनगर (Ahmednagar)
          </span>
        </div>

        {/* Center Radar Sweep */}
        <div className="flex justify-center py-2">
          <RadarSweep size={180} />
        </div>

        <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 lang-devanagari mt-2">
          ५ किमी परिघात कोणतीही संसर्गजन्य हालचाल आढळलेली नाही (Zero Outbreak Rings).
        </p>
      </div>

      {/* Metric Counters Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Offline Queue Count */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-medium lang-devanagari">प्रलंबित अहवाल</span>
            <Database className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
            <CountUpTicker end={4} durationMs={900} />
            <span className="text-[11px] font-normal text-slate-400">offline</span>
          </div>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            SQLite मध्ये सुरक्षित
          </p>
        </div>

        {/* LGD Villages Monitored */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-medium lang-devanagari">निरीक्षण गावे</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
            <CountUpTicker end={26} durationMs={1000} />
            <span className="text-[11px] font-normal text-slate-400">villages</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            LGD सीमा संलग्न
          </p>
        </div>
      </div>

      {/* Active Surveillance Alert Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/60 rounded-2xl p-3.5 flex items-start gap-3">
        <BellRing className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-xs font-bold text-amber-900 dark:text-amber-200 lang-devanagari">
            दक्षता सूचना: हवामान बदल (Weather Warning)
          </h3>
          <p className="text-[11px] text-amber-800 dark:text-amber-300 lang-devanagari mt-0.5 leading-relaxed">
            पावसामुळे घटसर्प (HS) व एकटांग्या (BQ) रोगाचा धोका वाढला आहे. पशुपालकांना लसीकरणाचा सल्ला द्या.
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

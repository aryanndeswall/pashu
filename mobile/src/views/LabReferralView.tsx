import React from 'react';
import { FlaskConical, QrCode, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export const LabReferralView: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* e-LRF Introduction Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white lang-devanagari">
                इ-प्रयोगशाळा मागणीपत्र (e-LRF Tracker)
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Sample cold-chain & diagnostic requisition
              </p>
            </div>
          </div>
          <button
            type="button"
            className="field-touch-target p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1 text-xs"
          >
            <QrCode className="w-4 h-4" />
            <span>स्कॅन</span>
          </button>
        </div>
      </div>

      {/* Active Lab Sample Tracking Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-purple-300 dark:border-purple-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400">Requisition ID</span>
            <p className="text-xs font-black font-mono text-purple-700 dark:text-purple-400">
              LRF-20260831-0941
            </p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            मार्गावर (In Transit)
          </span>
        </div>

        <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-400">नमुना प्रकार (Sample):</span>
            <span className="font-semibold">Vesicular Swab (FMD Suspect)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">प्रयोगशाळा (Destination):</span>
            <span className="font-semibold">District Diagnostic Lab (DDL), Pune</span>
          </div>
        </div>

        {/* Cold-Chain 48-hour SLA Timer Bar */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
            <span className="flex items-center gap-1 text-slate-700 dark:text-slate-200">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              ४८ तास कोल्ड-चेन मर्यादा (Cold Chain SLA)
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono">३२ तास शिल्लक (32h left)</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '65%' }} />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Preserved at 2°C–4°C in insulated ice carrier
          </p>
        </div>
      </div>
    </div>
  );
};

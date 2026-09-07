import React, { useState, useEffect } from 'react';
import { TrendingDown, AlertCircle, BarChart3, ShieldCheck } from 'lucide-react';
import { gisService, EpiCurveResponse, EpiCurvePoint } from '../../services/gisService';
import { useLanguageStore } from '../../store/languageStore';

export const EpiCurveChart: React.FC = () => {
  const { currentLanguage, t } = useLanguageStore();
  const [data, setData] = useState<EpiCurveResponse | null>(null);
  const [activePoint, setActivePoint] = useState<EpiCurvePoint | null>(null);

  useEffect(() => {
    gisService.getEpiCurve('Ahmednagar').then((res) => {
      setData(res);
      setActivePoint(res.points[res.points.length - 1]);
    });
  }, []);

  if (!data) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
        Loading epidemic curve...
      </div>
    );
  }

  const maxVal = Math.max(...data.points.map((p) => p.suspectedCases), 35);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
      {/* Header Row */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white lang-devanagari">
              {t('epiCurveTitle', '१४ दिवसांचा उद्रेक आलेख (14-Day Epi-Curve)')}
            </h3>
            <p className="text-[10px] text-slate-400">
              TimescaleDB syndromic time-series
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1 font-mono">
          <TrendingDown className="w-3 h-3" />
          Rt {data.currentRt} ({t('controlled', 'नियंत्रित')})
        </span>
      </div>

      {/* SVG Bar & Line Chart Canvas */}
      <div className="relative w-full aspect-[2/1] bg-slate-50 dark:bg-slate-950/80 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-end">
        {/* Intervention Vertical Divider (Day 7) */}
        <div
          className="absolute top-2 bottom-6 border-l-2 border-dashed border-rose-500 z-10 pointer-events-none"
          style={{ left: `${(6.5 / 14) * 100}%` }}
        >
          <span className="absolute -top-1 left-1 text-[8px] font-bold bg-rose-500 text-white px-1.5 py-0.2 rounded shadow whitespace-nowrap">
            {t('ringVacDay7', 'रिंग लसीकरण (Day 7)')}
          </span>
        </div>

        {/* 14-Day Bars */}
        <div className="flex items-end justify-between h-32 w-full gap-1 pt-4">
          {data.points.map((pt) => {
            const heightPercent = (pt.suspectedCases / maxVal) * 100;
            const isHovered = activePoint?.dayIndex === pt.dayIndex;
            const isPeak = pt.date === data.peakDay;

            return (
              <div
                key={pt.dayIndex}
                onClick={() => setActivePoint(pt)}
                className="flex-1 flex flex-col items-center cursor-pointer group h-full justify-end"
              >
                {/* Bar */}
                <div
                  className={`w-full rounded-t-md transition-all duration-300 relative ${
                    isPeak
                      ? 'bg-rose-500 shadow-md shadow-rose-500/20'
                      : pt.dayIndex > 7
                      ? 'bg-emerald-500 dark:bg-emerald-600'
                      : 'bg-amber-500 dark:bg-amber-600'
                  } ${isHovered ? 'ring-2 ring-purple-600 scale-x-110' : 'opacity-85 group-hover:opacity-100'}`}
                  style={{ height: `${Math.max(6, heightPercent)}%` }}
                >
                  {/* Confirmed overlay segment */}
                  {pt.confirmedCases > 0 && (
                    <div
                      className="w-full bg-purple-700/80 rounded-t-md absolute bottom-0 left-0"
                      style={{ height: `${(pt.confirmedCases / pt.suspectedCases) * 100}%` }}
                    />
                  )}
                </div>

                {/* Day label */}
                <span className="text-[8px] font-mono text-slate-400 mt-1">
                  D{pt.dayIndex}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Point Detail Tooltip */}
      {activePoint && (
        <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs">
          <div className="space-y-0.5">
            <span className="font-mono text-[10px] text-slate-400">
              {currentLanguage === 'en' ? 'Date' : 'दिनांक'}: {activePoint.date} (Day {activePoint.dayIndex})
            </span>
            <div className="flex items-center gap-3 font-semibold text-slate-800 dark:text-slate-200">
              <span className="text-amber-600">{t('suspectedLabel', 'संशयित')}: {activePoint.suspectedCases}</span>
              <span className="text-purple-600">{t('confirmedLabel', 'निश्चित')}: {activePoint.confirmedCases}</span>
              <span className="text-rose-600">{t('deathsLabel', 'मृत्यू')}: {activePoint.mortalityCount}</span>
            </div>
          </div>
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
            Rt {activePoint.reproductionNumber}
          </span>
        </div>
      )}

      {/* Aggregate Epi Counters */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <span className="text-[10px] text-slate-400 block">{t('totalSuspected', 'एकूण संशयित')}</span>
          <strong className="text-sm font-bold text-amber-600">{data.totalSuspected}</strong>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <span className="text-[10px] text-slate-400 block">{t('totalConfirmed', 'लॅब निश्चित')}</span>
          <strong className="text-sm font-bold text-purple-600">{data.totalConfirmed}</strong>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <span className="text-[10px] text-slate-400 block">{t('totalDeaths', 'एकूण मृत्यू')}</span>
          <strong className="text-sm font-bold text-rose-600">{data.totalDeaths}</strong>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <span className="text-[10px] text-slate-400 block">{t('transmissionRate', 'प्रसार वेग')}</span>
          <strong className="text-sm font-bold text-emerald-600 font-mono">Rt {data.currentRt}</strong>
        </div>
      </div>
    </div>
  );
};

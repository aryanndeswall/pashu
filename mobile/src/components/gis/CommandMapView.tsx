import React, { useState } from 'react';
import {
  MapPin,
  Shield,
  Layers,
  Radio,
  AlertTriangle,
  Info,
  Car,
  ChevronRight,
} from 'lucide-react';
import { useLanguageStore } from '../../store/languageStore';

interface VillagePin {
  id: string;
  name: string;
  nameMr: string;
  bovineCount: number;
  cases: number;
  x: number; // percentage in SVG viewBox
  y: number;
  zone: 'INFECTED' | 'RING_VAC' | 'SURVEILLANCE';
}

const DEMO_VILLAGES: VillagePin[] = [
  {
    id: '558301',
    name: 'Ashwi Budruk',
    nameMr: 'आश्वी बुद्रुक (केंद्र)',
    bovineCount: 1450,
    cases: 40,
    x: 50,
    y: 50,
    zone: 'INFECTED',
  },
  {
    id: '558302',
    name: 'Rahuri Rural',
    nameMr: 'राहुरी ग्रामीण',
    bovineCount: 2100,
    cases: 8,
    x: 62,
    y: 42,
    zone: 'RING_VAC',
  },
  {
    id: '558303',
    name: 'Sangamner Khurd',
    nameMr: 'संगमनेर खुर्द',
    bovineCount: 1800,
    cases: 2,
    x: 32,
    y: 65,
    zone: 'SURVEILLANCE',
  },
  {
    id: '558304',
    name: 'Kopargaon Rural',
    nameMr: 'कोपरगाव ग्रामीण',
    bovineCount: 2400,
    cases: 0,
    x: 74,
    y: 72,
    zone: 'SURVEILLANCE',
  },
];

const CHECKPOINTS = [
  { name: 'SH-10 Rahuri Barrier', x: 68, y: 35 },
  { name: 'NH-160 Shirdi Barrier', x: 26, y: 55 },
];

export const CommandMapView: React.FC = () => {
  const { currentLanguage, t } = useLanguageStore();
  const [showBuffers, setShowBuffers] = useState(true);
  const [showVillages, setShowVillages] = useState(true);
  const [showCheckpoints, setShowCheckpoints] = useState(true);
  const [selectedVillage, setSelectedVillage] = useState<VillagePin | null>(DEMO_VILLAGES[0]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
      {/* Header & Layer Toggles */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
            <Radio className="w-4 h-4 animate-pulse text-rose-600" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white lang-devanagari flex items-center gap-1.5">
              <span>
                {currentLanguage === 'en'
                  ? 'Web-GIS Outbreak Cluster Map'
                  : currentLanguage === 'hi'
                  ? 'स्थानिक वेब-जीआईएस प्रकोप मानचित्र (Web-GIS Map)'
                  : 'स्थानिक वेब-जीआयएस नकाशा (Web-GIS Outbreak Map)'}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 font-mono font-black">
                OPS 0.84
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">
              Ahmednagar Cluster CL-SYN_VESICULAR-558301
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setShowBuffers(!showBuffers)}
            className={`px-2 py-1 rounded-lg border transition-colors ${
              showBuffers
                ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                : 'text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            {t('bufferToggle', 'बफर')}
          </button>
          <button
            type="button"
            onClick={() => setShowVillages(!showVillages)}
            className={`px-2 py-1 rounded-lg border transition-colors ${
              showVillages
                ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                : 'text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            {t('villagesToggle', 'गावे')}
          </button>
          <button
            type="button"
            onClick={() => setShowCheckpoints(!showCheckpoints)}
            className={`px-2 py-1 rounded-lg border transition-colors ${
              showCheckpoints
                ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                : 'text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            {t('checkpointsToggle', 'नाके')}
          </button>
        </div>
      </div>

      {/* SVG GIS Vector Map Canvas */}
      <div className="relative w-full aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
        {/* Subtle Map Grid Background */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#64748b_1px,transparent_1px)] [background-size:16px_16px]" />

        <svg viewBox="0 0 100 100" className="w-full h-full relative z-10">
          {/* 10 km Surveillance Perimeter (Cyan) */}
          {showBuffers && (
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="#06b6d4"
              fillOpacity="0.12"
              stroke="#06b6d4"
              strokeWidth="0.8"
              strokeDasharray="2 1.5"
            />
          )}

          {/* 5 km Ring Vaccination Target (Amber) */}
          {showBuffers && (
            <circle
              cx="50"
              cy="50"
              r="25"
              fill="#f59e0b"
              fillOpacity="0.18"
              stroke="#f59e0b"
              strokeWidth="0.9"
              strokeDasharray="3 1.5"
            />
          )}

          {/* 1 km Infected Movement Freeze Zone (Red) */}
          {showBuffers && (
            <circle
              cx="50"
              cy="50"
              r="10"
              fill="#dc2626"
              fillOpacity="0.32"
              stroke="#dc2626"
              strokeWidth="1.2"
            />
          )}

          {/* Epicenter Pulsating Target Marker */}
          <circle cx="50" cy="50" r="2.5" fill="#dc2626" />
          <circle
            cx="50"
            cy="50"
            r="4.5"
            fill="none"
            stroke="#ef4444"
            strokeWidth="0.6"
            className="animate-ping"
            style={{ transformOrigin: '50% 50%' }}
          />

          {/* Highway Quarantine Checkpoints */}
          {showCheckpoints &&
            CHECKPOINTS.map((cp, idx) => (
              <g key={idx} transform={`translate(${cp.x}, ${cp.y})`}>
                <rect
                  x="-2"
                  y="-2"
                  width="4"
                  height="4"
                  rx="1"
                  fill="#fbbf24"
                  stroke="#78350f"
                  strokeWidth="0.4"
                />
                <circle cx="0" cy="0" r="0.8" fill="#1e1b4b" />
              </g>
            ))}

          {/* Village Pins */}
          {showVillages &&
            DEMO_VILLAGES.map((v) => {
              const isSelected = selectedVillage?.id === v.id;
              const color =
                v.zone === 'INFECTED'
                  ? '#ef4444'
                  : v.zone === 'RING_VAC'
                  ? '#f59e0b'
                  : '#06b6d4';

              return (
                <g
                  key={v.id}
                  transform={`translate(${v.x}, ${v.y})`}
                  className="cursor-pointer transition-transform hover:scale-125"
                  onClick={() => setSelectedVillage(v)}
                >
                  <circle
                    cx="0"
                    cy="0"
                    r={isSelected ? 3.0 : 2.0}
                    fill={color}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? 0.8 : 0.4}
                  />
                  <text
                    x="0"
                    y={v.y > 60 ? -3.5 : 4.5}
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize="2.4"
                    fontWeight="bold"
                    className="select-none pointer-events-none drop-shadow"
                  >
                    {v.name}
                  </text>
                </g>
              );
            })}
        </svg>

        {/* Map Scale & North Arrow */}
        <div className="absolute bottom-2 left-2 text-[9px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
          Scale: 1:50,000 | 10 km radius
        </div>
      </div>

      {/* Biosecurity Zone Legend */}
      <div className="grid grid-cols-3 gap-2 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0" />
          <span className="truncate">{t('zone1km', '१ किमी हालचाल बंदी')}</span>
        </div>
        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
          <span className="truncate">{t('zone5km', '५ किमी रिंग लस')}</span>
        </div>
        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-900/60">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shrink-0" />
          <span className="truncate">{t('zone10km', '१० किमी पाळत क्षेत्र')}</span>
        </div>
      </div>

      {/* Selected Village Detail Banner */}
      {selectedVillage && (
        <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <MapPin className="w-3.5 h-3.5 text-purple-600" />
              <span>{currentLanguage === 'en' ? selectedVillage.name : selectedVillage.nameMr}</span>
              <span className="text-[10px] text-slate-400 font-mono">
                (LGD {selectedVillage.id})
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {t('livestockCensus', 'पशुधन जनगणना')}: <strong>{selectedVillage.bovineCount}</strong> | {t('reportedCases', 'नोंद रुग्ण')}:{' '}
              <strong className="text-rose-600 dark:text-rose-400 font-bold">
                {selectedVillage.cases}
              </strong>
            </p>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              selectedVillage.zone === 'INFECTED'
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                : selectedVillage.zone === 'RING_VAC'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300'
            }`}
          >
            {selectedVillage.zone}
          </span>
        </div>
      )}
    </div>
  );
};

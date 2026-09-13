import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Thermometer,
  FileSearch,
} from 'lucide-react';
import { LabRequisition, labService } from '../../services/labService';
import { useLanguageStore } from '../../store/languageStore';
import { formatTagNumber } from '../../services/animalService';

export const AdminLabAuditView: React.FC = () => {
  const { currentLanguage } = useLanguageStore();
  const [requisitions, setRequisitions] = useState<LabRequisition[]>([]);

  useEffect(() => {
    const load = async () => {
      const list = await labService.getRequisitions();
      setRequisitions(list);
    };
    load();
  }, []);

  const confirmedCount = requisitions.filter((r) => r.status === 'LAB_CONFIRMED').length;
  const inTransitCount = requisitions.filter((r) => r.status === 'IN_TRANSIT').length;
  const testingCount = requisitions.filter((r) => r.status === 'TESTING').length;

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-purple-200 dark:border-purple-900/40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-600/20">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`text-base font-bold text-slate-900 dark:text-white ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
              {currentLanguage === 'en'
                ? 'District Diagnostic Lab Audit'
                : 'जिल्हा प्रयोगशाळा तपासणी व सत्यापन केंद्र'}
            </h1>
            <p className="text-[11px] text-slate-500 font-mono">
              BSL-2 / BSL-3 Confirmatory Testing & Cold-Chain Oversight
            </p>
          </div>
        </div>
      </div>

      {/* Audit Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 text-center">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-bold">
            {currentLanguage === 'en' ? 'Confirmed' : 'निश्चित अहवाल'}
          </span>
          <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{confirmedCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-purple-200 dark:border-purple-900/60 text-center">
          <span className="text-[10px] text-purple-600 dark:text-purple-400 block font-bold">
            {currentLanguage === 'en' ? 'In Testing' : 'तपासणी सुरू'}
          </span>
          <span className="text-base font-black text-purple-600 dark:text-purple-400">{testingCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-amber-200 dark:border-amber-900/60 text-center">
          <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-bold">
            {currentLanguage === 'en' ? 'In Transit' : 'मार्गावर'}
          </span>
          <span className="text-base font-black text-amber-600 dark:text-amber-400">{inTransitCount}</span>
        </div>
      </div>

      {/* Lab Network Performance */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
        <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
          <span>{currentLanguage === 'en' ? 'Accredited Lab Turnaround SLA' : 'मान्यताप्राप्त प्रयोगशाळा क्षमता व SLA'}</span>
          <span className="text-[10px] font-mono text-slate-400">DDL Network</span>
        </h2>

        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <strong className="text-slate-900 dark:text-white block font-bold">District Diagnostic Lab (DDL), Pune</strong>
              <span className="text-[10px] text-slate-500">RT-PCR & ELISA • Avg TAT: 24.2h</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
              98% Compliant
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <strong className="text-slate-900 dark:text-white block font-bold">State Disease Investigation Section (DIS)</strong>
              <span className="text-[10px] text-slate-500">Pathology & Smear ID • Avg TAT: 14.8h</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
              100% Compliant
            </span>
          </div>
        </div>
      </div>

      {/* Specimen Audit Trail */}
      <div className="space-y-3">
        {requisitions.length === 0 ? (
          <div className="p-8 text-center space-y-2 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <FlaskConical className="w-8 h-8 mx-auto text-slate-400" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {currentLanguage === 'en' ? 'No Laboratory Audit Records' : 'कोणतेही प्रयोगशाळा तपासणी रेकॉर्ड उपलब्ध नाही'}
            </p>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              {currentLanguage === 'en'
                ? 'Diagnostic lab audit records will appear here as field veterinarians dispatch cold-chain samples.'
                : 'क्षेत्रीय पशुवैद्यकांनी नमुने पाठवल्यावर येथे तपशील उपलब्ध होईल.'}
            </p>
          </div>
        ) : (
          requisitions.map((req) => (
          <div
            key={req.requisitionId}
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-purple-700 dark:text-purple-400">
                  {req.requisitionId}
                </span>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {req.suspectedDisease}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Tag: {formatTagNumber(req.animalTagId)} • {req.sampleType}
                </p>
              </div>

              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  req.status === 'LAB_CONFIRMED'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {req.status}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-purple-600" />
                <span>Cold Chain: <strong>{req.transitTempC}°C</strong></span>
              </span>
              <span className="font-mono text-slate-600 dark:text-slate-300 truncate max-w-[180px]">
                {req.destinationLab}
              </span>
            </div>
          </div>
        ))
        )}
      </div>
    </div>
  );
};

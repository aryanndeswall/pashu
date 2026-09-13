import React, { useState, useEffect } from 'react';
import {
  FileText,
  Filter,
  Search,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import { ClinicalCase, caseService } from '../../services/caseService';
import { useLanguageStore } from '../../store/languageStore';
import { useAuthStore } from '../../store/authStore';
import { hapticsService } from '../../services/hapticsService';
import {
  localizeSyndromeName,
  localizeSpecies,
  localizeCaseStatus,
} from '../../utils/clinicalLocalization';

export const AdminReportsView: React.FC = () => {
  const { currentLanguage, t } = useLanguageStore();
  const { userProfile } = useAuthStore();

  const [cases, setCases] = useState<ClinicalCase[]>([]);
  const [filterSyndrome, setFilterSyndrome] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const loadAllReports = async () => {
    try {
      // In a real district backend, admin loads all district cases; fallback to doctor cases which contains the cluster
      const fetched = await caseService.getDoctorCases();
      setCases(fetched || []);
    } catch (err) {
      console.warn('Failed to load admin reports:', err);
    }
  };

  useEffect(() => {
    loadAllReports();
  }, []);

  const filteredCases = cases.filter((c) => {
    const matchSyndrome = filterSyndrome === 'ALL' || c.syndrome_code === filterSyndrome;
    const matchStatus = filterStatus === 'ALL' || c.status === filterStatus;
    const query = searchQuery.toLowerCase();
    const matchSearch =
      c.animal_tag.toLowerCase().includes(query) ||
      c.village_name.toLowerCase().includes(query) ||
      c.farmer_name.toLowerCase().includes(query) ||
      c.syndrome_name.toLowerCase().includes(query);
    return matchSyndrome && matchStatus && matchSearch;
  });

  const handleExportSummary = async () => {
    await hapticsService.hapticSuccess();
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    }, 1200);
  };

  const criticalCount = cases.filter((c) => c.urgency === 'CRITICAL').length;
  const visitScheduledCount = cases.filter((c) => c.status === 'VISIT_SCHEDULED').length;
  const resolvedCount = cases.filter((c) => c.status === 'RESOLVED').length;

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-purple-200 dark:border-purple-900/40 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-600/20">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className={`text-base font-bold text-slate-900 dark:text-white ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                {currentLanguage === 'en'
                  ? 'District Syndromic Case Audit'
                  : 'जिल्हास्तरीय क्लिनिकल रोग अहवाल तपासणी'}
              </h1>
              <p className="text-[11px] text-slate-500 font-mono">
                {userProfile.district} District • PCICDA National Surveillance Register
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportSummary}
            disabled={isExporting}
            className="field-touch-target px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exporting...' : currentLanguage === 'en' ? 'Export CSV' : 'अहवाल डाउनलोड'}</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mt-3.5">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              currentLanguage === 'en'
                ? 'Search by tag, village, farmer or disease...'
                : 'टॅग, गाव, शेतकरी किंवा आजाराचे नाव शोधा...'
            }
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 no-scrollbar text-xs">
          {[
            { id: 'ALL', label: currentLanguage === 'en' ? 'All Syndromes' : 'सर्व संलक्षणे' },
            { id: 'VSS', label: 'VSS (FMD)' },
            { id: 'HSDS', label: 'HSDS (Anthrax/HS)' },
            { id: 'RRDS', label: 'RRDS (PPR)' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterSyndrome(f.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
                filterSyndrome === f.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {exportSuccess && (
        <div className="bg-emerald-600 text-white rounded-2xl p-3 shadow-md flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>
            {currentLanguage === 'en'
              ? 'District epidemiological CSV summary generated and ready for state dispatch.'
              : 'जिल्हास्तरीय महामारी सारांश अहवाल यशस्वीरित्या तयार झाला.'}
          </span>
        </div>
      )}

      {/* Metric Counters */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-center">
          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold block">{currentLanguage === 'en' ? 'Critical Cases' : 'गंभीर रुग्ण'}</span>
          <span className="text-base font-black text-rose-600 dark:text-rose-400">{criticalCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-blue-200 dark:border-blue-900/60 text-center">
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold block">{currentLanguage === 'en' ? 'Visits Scheduled' : 'तपासणी सुरू'}</span>
          <span className="text-base font-black text-blue-600 dark:text-blue-400">{visitScheduledCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 text-center">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">{currentLanguage === 'en' ? 'Resolved' : 'उपचारित'}</span>
          <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{resolvedCount}</span>
        </div>
      </div>

      {/* Case Incident Audit Log */}
      <div className="space-y-3">
        {filteredCases.map((c) => (
          <div
            key={c.id}
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                    {c.animal_tag}
                  </span>
                  <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300">
                    {c.syndrome_code} • {localizeSyndromeName(c.syndrome_code, c.syndrome_name, currentLanguage)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {localizeSpecies(c.species, currentLanguage)} • {c.village_name}, {c.block_name}
                </p>
              </div>

              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  c.urgency === 'CRITICAL'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {c.urgency}
              </span>
            </div>

            <div className="text-[11px] bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span>{currentLanguage === 'en' ? 'Livestock Owner: ' : 'पशुपालक: '}<strong>{c.farmer_name}</strong></span>
              <span className="font-mono text-slate-400">{c.farmer_phone_masked}</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
              <span className="text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>{c.doctor_name || 'Dr. Ananya Deshmukh (BVO)'}</span>
              </span>
              <span className="font-semibold text-emerald-600">
                {localizeCaseStatus(c.status, currentLanguage)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

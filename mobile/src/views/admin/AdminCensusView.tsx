import React, { useState, useEffect } from 'react';
import {
  Building2,
  Tag,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';
import { useLanguageStore } from '../../store/languageStore';
import { useAuthStore } from '../../store/authStore';
import { animalService, LocalAnimal } from '../../services/animalService';
import { getApiUrl } from '../../config/api';

export const AdminCensusView: React.FC = () => {
  const { currentLanguage } = useLanguageStore();
  const { userProfile } = useAuthStore();
  const [animals, setAnimals] = useState<LocalAnimal[]>([]);
  const [activeClusters, setActiveClusters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const [animalList, clusterRes] = await Promise.all([
          animalService.getAllAnimals(),
          fetch(getApiUrl('clusters/active')).catch(() => null),
        ]);
        if (active) {
          setAnimals(animalList || []);
          if (clusterRes && clusterRes.ok) {
            const clusterData = await clusterRes.json();
            setActiveClusters(Array.isArray(clusterData) ? clusterData : []);
          }
        }
      } catch (err) {
        console.warn('Failed to load census data:', err);
      } finally {
        if (active) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, []);

  const totalRegistered = animals.length;
  const upToDateVaccinations = animals.filter((a) => a.vaccinationStatus === 'UP_TO_DATE').length;
  const vacPercent = totalRegistered > 0 ? Math.round((upToDateVaccinations / totalRegistered) * 100) : 0;

  // Group animals by village / taluka
  const talukaGroups = animals.reduce((acc, animal) => {
    const groupKey = animal.villageName || 'District Herd';
    if (!acc[groupKey]) {
      acc[groupKey] = { total: 0, vaccinated: 0, bovines: 0, village: animal.villageName };
    }
    acc[groupKey].total += 1;
    if (animal.vaccinationStatus === 'UP_TO_DATE') {
      acc[groupKey].vaccinated += 1;
    }
    if (animal.species?.toLowerCase().includes('cow') || animal.species?.toLowerCase().includes('buffalo') || animal.species?.toLowerCase().includes('गाय') || animal.species?.toLowerCase().includes('म्हैस')) {
      acc[groupKey].bovines += 1;
    }
    return acc;
  }, {} as Record<string, { total: number; vaccinated: number; bovines: number; village?: string }>);

  const talukaList = Object.entries(talukaGroups).map(([name, stats]) => {
    const isEpicenter = activeClusters.some((c) => c.taluka?.toLowerCase() === name.toLowerCase());
    return {
      name,
      totalBovines: stats.total,
      taggedAadhaar: stats.total,
      taggingPercent: 100,
      fmdVaccinated: stats.vaccinated,
      status: isEpicenter ? 'EPICENTER_ZONE' : 'MONITORED_NORMAL',
    };
  });

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-purple-200 dark:border-purple-900/40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-600/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`text-base font-bold text-slate-900 dark:text-white ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
              {currentLanguage === 'en'
                ? 'District Livestock Census & Tagging'
                : 'जिल्हा पशुगणना व पशू आधार नोंदणी'}
            </h1>
            <p className="text-[11px] text-slate-500 font-mono">
              {userProfile.district || 'District'} • INAPH / Pashu Aadhaar Digital Registry
            </p>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 block font-semibold">{currentLanguage === 'en' ? 'Registered Herd' : 'नोंदणीकृत पशुधन'}</span>
          <span className="text-base font-black text-slate-900 dark:text-white">{totalRegistered}</span>
          <span className="text-[9px] text-slate-400 block">animals</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-purple-200 dark:border-purple-900/60 text-center">
          <span className="text-[10px] text-purple-600 dark:text-purple-400 block font-semibold">{currentLanguage === 'en' ? 'Pashu Aadhaar' : 'टॅगिंग पूर्ण'}</span>
          <span className="text-base font-black text-purple-600 dark:text-purple-400">100%</span>
          <span className="text-[9px] text-purple-500 block">compliance</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 text-center">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-semibold">{currentLanguage === 'en' ? 'Vaccination' : 'लसीकरण'}</span>
          <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{vacPercent}%</span>
          <span className="text-[9px] text-emerald-500 block">up-to-date</span>
        </div>
      </div>

      {/* Taluka Wise Breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-purple-600" />
            <span>{currentLanguage === 'en' ? 'Jurisdiction Livestock Registry' : 'तालुकानिहाय पशुधन नोंद'}</span>
          </h2>
          <span className="text-[10px] font-mono text-slate-400">Real-Time</span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading census records...</div>
        ) : talukaList.length === 0 ? (
          <div className="p-8 text-center space-y-2 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <Tag className="w-8 h-8 mx-auto text-slate-400" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {currentLanguage === 'en' ? 'No Registered Cattle Found' : 'कोणतेही नोंदणीकृत पशू आढळले नाहीत'}
            </p>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              {currentLanguage === 'en'
                ? 'Animals registered via the Pashu Aadhaar passbook will aggregate here automatically.'
                : 'पशू आधार पासबुकद्वारे नोंदवलेले पशू येथे प्रदर्शित होतील.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {talukaList.map((t) => (
              <div
                key={t.name}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">{t.name}</h3>
                    <p className="text-[11px] text-slate-500">
                      {t.totalBovines} animals • {t.taggedAadhaar} RFID tagged
                    </p>
                  </div>
                  <span
                    className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                      t.status === 'EPICENTER_ZONE'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {t.status === 'EPICENTER_ZONE' ? 'Epicenter Area' : 'Normal Surveillance'}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Tagging: {t.taggingPercent}%</span>
                    <span>Vaccination: {t.totalBovines > 0 ? Math.round((t.fmdVaccinated / t.totalBovines) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-600 h-full rounded-full"
                      style={{ width: `${t.totalBovines > 0 ? Math.round((t.fmdVaccinated / t.totalBovines) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  ShieldCheck,
  Database,
  Radio,
  BellRing,
  MapPin,
  Building2,
  AlertOctagon,
  Activity,
  Stethoscope,
  Syringe,
  FlaskConical,
  Video,
  FileText,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  PhoneCall,
  User,
} from 'lucide-react';
import { RadarSweep } from '../components/animations/RadarSweep';
import { CountUpTicker } from '../components/animations/CountUpTicker';
import { HealthCheckView } from './HealthCheckView';
import { useAuthStore } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';
import { useNavigationStore } from '../store/navigationStore';
import { CommandMapView } from '../components/gis/CommandMapView';
import { EpiCurveChart } from '../components/gis/EpiCurveChart';
import { SihDemoSimulatorCard } from '../components/gis/SihDemoSimulatorCard';
import { MarketClosureModal } from '../components/gis/MarketClosureModal';
import { VideoConsultModal } from '../components/consult/VideoConsultModal';
import { hapticsService } from '../services/hapticsService';

export const DashboardView: React.FC = () => {
  const { activeRole, userProfile } = useAuthStore();
  const { currentLanguage, t } = useLanguageStore();
  const setActiveTab = useNavigationStore((state) => state.setActiveTab);
  const [isMemoModalOpen, setIsMemoModalOpen] = useState(false);
  const [isVideoConsultOpen, setIsVideoConsultOpen] = useState(false);

  // ==========================================
  // 1. ADMIN DASHBOARD: Web-GIS Command War Room
  // ==========================================
  if (activeRole === 'admin') {
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
                {userProfile.district} {currentLanguage === 'en' ? 'District' : 'जिल्हा'} • {t('pcicdaOutbreakCode', 'PCICDA biosecurity command: AHM-2026-FMD-01')}
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
              <span>1 {t('declared', 'Declared')}</span>
            </strong>
            <span className="text-[9px] text-rose-500 font-bold block">OPS 0.84</span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-2.5 border border-amber-200 dark:border-amber-900 shadow-sm">
            <span className={`text-[10px] text-slate-400 block truncate ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
              {t('surveillanceVillages', 'Surveillance Villages')}
            </span>
            <strong className="text-lg font-black text-amber-600">
              4 {currentLanguage === 'en' ? 'Villages' : currentLanguage === 'hi' ? 'गांव' : 'गावे'}
            </strong>
            <span className={`text-[9px] text-amber-600 font-bold block ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
              {t('perimeter10km', '10 km Perimeter')}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-2.5 border border-purple-200 dark:border-purple-900 shadow-sm">
            <span className={`text-[10px] text-slate-400 block truncate ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
              {t('ringVaccinationTarget', 'Ring Vaccination Target')}
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
  }

  // ==========================================
  // 2. DOCTOR DASHBOARD: Clinical Field Operations
  // ==========================================
  if (activeRole === 'doctor') {
    return (
      <div className="space-y-4 pb-12 animate-in fade-in duration-200">
        {/* Doctor Header Banner */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-blue-200 dark:border-blue-900/50 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-sm font-bold text-slate-900 dark:text-white ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                {t('doctorDashboardTitle', 'Veterinary Field Operations Hub')}
              </h2>
              <p className="text-[11px] text-slate-500">
                {currentLanguage === 'en' ? userProfile.name : userProfile.nameMarathi} • {t('doctorDutyJurisdiction', 'Rahuri & Sangamner Taluka Jurisdiction')}
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono px-2 py-1 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold">
            VCI Verified
          </span>
        </div>

        {/* Urgent Clinical Alert Card */}
        <div className="bg-gradient-to-r from-rose-50 to-amber-50 dark:from-rose-950/40 dark:to-amber-950/40 border border-rose-300 dark:border-rose-800 rounded-2xl p-3.5 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className={`text-xs font-bold text-rose-950 dark:text-rose-200 flex items-center justify-between ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
              <span>{t('urgentAttentionTitle', 'Urgent Clinical Attention Required')}</span>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-600 text-white">
                FMD Cluster
              </span>
            </h3>
            <p className={`text-[11px] text-rose-800 dark:text-rose-300 mt-1 leading-relaxed ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
              {t('urgentAttentionDesc', 'Immediate on-field clinical inspection required for 2 suspected FMD cases in Rahuri cluster.')}
            </p>
          </div>
        </div>

        {/* 4 Clinical Duty Counters */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className={`text-[11px] font-medium ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                {t('pendingInvestigations', 'Pending Cases')}
              </span>
              <FileText className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
              <CountUpTicker end={4} durationMs={900} />
              <span className="text-[11px] font-normal text-slate-400">cases</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className={`text-[11px] font-medium ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                {t('vaccinatedToday', 'Vaccinated Today')}
              </span>
              <Syringe className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
              <CountUpTicker end={18} durationMs={900} />
              <span className="text-[11px] font-normal text-slate-400">cattle</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className={`text-[11px] font-medium ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                {t('samplesInTransit', 'In-Transit Samples')}
              </span>
              <FlaskConical className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
              <CountUpTicker end={2} durationMs={900} />
              <span className="text-[11px] font-normal text-slate-400">cold-chain</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className={`text-[11px] font-medium ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                {t('teleconsultRequests', 'Tele-Consults')}
              </span>
              <Video className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
              <CountUpTicker end={3} durationMs={900} />
              <span className="text-[11px] font-normal text-slate-400">requests</span>
            </div>
          </div>
        </div>

        {/* Quick Clinical Action Toolbar (52px Touch Targets) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className={`text-[10px] font-bold text-slate-400 uppercase tracking-wider block ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
            {t('quickActionTitle', 'Quick Clinical Actions')}
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={async () => {
                await hapticsService.hapticLight();
                setActiveTab('report');
              }}
              className="field-touch-target p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 flex items-center gap-2 text-xs font-bold transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="truncate">{t('runTriageAction', 'Run AI Triage')}</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                await hapticsService.hapticLight();
                setActiveTab('labs');
              }}
              className="field-touch-target p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 flex items-center gap-2 text-xs font-bold transition-all active:scale-95"
            >
              <FlaskConical className="w-4 h-4 text-purple-600 shrink-0" />
              <span className="truncate">{t('newLabRequisitionAction', 'Send Lab Sample')}</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                await hapticsService.hapticLight();
                setActiveTab('animals');
              }}
              className="field-touch-target p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center gap-2 text-xs font-bold transition-all active:scale-95"
            >
              <Syringe className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate">{t('logVaccineAction', 'Record Vaccine')}</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                await hapticsService.hapticLight();
                setIsVideoConsultOpen(true);
              }}
              className="field-touch-target p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-2 text-xs font-bold transition-all active:scale-95"
            >
              <Video className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="truncate">{t('callFarmerAction', 'Video Call Farmer')}</span>
            </button>
          </div>
        </div>

        {/* Active Clinical Field Queue */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className={`text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
              {t('clinicalQueueTitle', 'Active Clinical Case Queue')}
            </h3>
            <span className="text-[10px] font-bold text-blue-600">4 Active</span>
          </div>

          <div className="space-y-2">
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                    1002-9384-7561
                  </span>
                  <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-rose-100 text-rose-700">
                    VSS / FMD
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Gir Cow • Ramesh Patil (+91 9822000412) • Ashwi Budruk
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('report')}
                className="field-touch-target px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
              >
                <span>{t('investigateCaseBtn', 'Investigate')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                    1002-9384-7562
                  </span>
                  <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-100 text-amber-700">
                    HSDS / HS
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Murrah Buffalo • Suresh Shinde (+91 9423000819) • Rahuri Rural
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('report')}
                className="field-touch-target px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
              >
                <span>{t('investigateCaseBtn', 'Investigate')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Taluka Ring Vaccination Progress */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold text-slate-900 dark:text-white ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
              {t('talukaRingVacProgress', 'Taluka Ring-Vaccination Coverage')}
            </span>
            <span className="text-xs font-bold text-emerald-600 font-mono">1,240 / 3,550 (35%)</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full transition-all duration-700" style={{ width: '35%' }} />
          </div>
          <p className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>Rahuri Epicenter Buffer (5 km)</span>
            <span>2,310 remaining</span>
          </p>
        </div>

        {/* Diagnostic SQLite Core */}
        <HealthCheckView />

        {/* Doctor Video Tele-Consultation Modal */}
        <VideoConsultModal
          isOpen={isVideoConsultOpen}
          onClose={() => setIsVideoConsultOpen(false)}
          callerRole="doctor"
          targetPartyName="Ramesh Patil (रमेश पाटील)"
          targetPartyPhone="+91 9822000412"
          animalTag="1002-9384-7561"
          animalSpecies="Gir Cow (गीर गाय)"
          suspectedCondition="VSS / FMD"
        />
      </div>
    );
  }

  // ==========================================
  // 3. CONSUMER (FARMER) DASHBOARD: Herd & Local Status
  // ==========================================
  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* Live Geospatial Surveillance Widget */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {t('localPerimeterRadar', 'Local Surveillance Perimeter (5 km Radar)')}
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
          {t('noOutbreakFound', 'Zero outbreak rings detected within 5 km perimeter.')}
        </p>
      </div>

      {/* Metric Counters Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Offline Queue Count */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className={`text-[11px] font-medium ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
              {t('pendingReports', 'Pending Reports')}
            </span>
            <Database className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
            <CountUpTicker end={4} durationMs={900} />
            <span className="text-[11px] font-normal text-slate-400">offline</span>
          </div>
          <p className={`text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
            {t('securedInSqlite', 'Secured in SQLite')}
          </p>
        </div>

        {/* LGD Villages Monitored */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className={`text-[11px] font-medium ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
              {t('monitoredVillages', 'Monitored Villages')}
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
            <CountUpTicker end={26} durationMs={1000} />
            <span className="text-[11px] font-normal text-slate-400">villages</span>
          </div>
          <p className={`text-[10px] text-slate-500 dark:text-slate-400 mt-1 ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
            {t('lgdBordersAttached', 'LGD Boundaries Linked')}
          </p>
        </div>
      </div>

      {/* Active Weather Advisory Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/60 rounded-2xl p-3.5 flex items-start gap-3">
        <BellRing className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h3 className={`text-xs font-bold text-amber-900 dark:text-amber-200 ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
            {t('weatherWarningTitle', 'Precautionary Advisory: Weather Warning')}
          </h3>
          <p className={`text-[11px] text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
            {t('weatherWarningDesc', 'Monsoon conditions elevate risk of HS & BQ diseases. Advise prophylactic vaccination.')}
          </p>
        </div>
      </div>

      {/* Farmer Direct Tele-Consult CTA */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h4 className={`text-xs font-bold text-slate-900 dark:text-white ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
              {t('teleConsultDoctorCTA', 'Emergency Video Tele-Consult')}
            </h4>
            <p className="text-[11px] text-slate-500">
              {t('teleConsultDoctorDesc', 'Direct line with Dr. Ananya Deshmukh (M.V.Sc)')}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={async () => {
            await hapticsService.hapticLight();
            setIsVideoConsultOpen(true);
          }}
          className={`field-touch-target px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>{t('connectDoctorBtn', 'Call Doctor')}</span>
        </button>
      </div>

      {/* Collapsible SQLite Diagnostic Core */}
      <div className="pt-2">
        <HealthCheckView />
      </div>

      {/* Farmer Video Tele-Consultation Modal */}
      <VideoConsultModal
        isOpen={isVideoConsultOpen}
        onClose={() => setIsVideoConsultOpen(false)}
        callerRole="farmer"
        targetPartyName="Dr. Ananya Deshmukh (M.V.Sc)"
        targetPartyPhone="+91 9422001842"
        animalTag="1002-9384-7561"
        animalSpecies="Gir Cow (गीर गाय)"
        suspectedCondition="VSS / FMD"
      />
    </div>
  );
};

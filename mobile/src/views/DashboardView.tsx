import React, { useState, useEffect } from 'react';
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
  Phone,
  ArrowRight,
  User,
  Pill,
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
import { DoctorCaseActionModal } from '../components/consult/DoctorCaseActionModal';
import { ClinicalCase, caseService } from '../services/caseService';
import { hapticsService } from '../services/hapticsService';

export const DashboardView: React.FC = () => {
  const { activeRole, userProfile } = useAuthStore();
  const { currentLanguage, t } = useLanguageStore();
  const setActiveTab = useNavigationStore((state) => state.setActiveTab);
  const [isMemoModalOpen, setIsMemoModalOpen] = useState(false);
  const [isVideoConsultOpen, setIsVideoConsultOpen] = useState(false);

  // Cross-connection clinical cases state
  const [clinicalCases, setClinicalCases] = useState<ClinicalCase[]>([
    {
      id: 'CASE-20260908-7561AF',
      report_id: 'REP-1725738491001',
      farmer_id: 'usr_farmer_01',
      farmer_name: 'रमेश पाटील (Ramesh Patil)',
      farmer_phone_masked: '+91 9822X-XX412',
      doctor_id: 'usr_vet_02',
      doctor_name: 'Dr. Ananya Deshmukh',
      doctor_phone_masked: '+91 9422X-XX842',
      animal_tag: '1002-9384-7561',
      species: 'गाय (Gir Cow)',
      breed: 'गिर (Gir)',
      syndrome_code: 'VSS',
      syndrome_name: 'लाळ्या खुरकूत (FMD)',
      symptoms: 'तोंडातून फेसळ लाळ, खुरांमध्ये फोड व जखमा, उच्च ताप (१०४°F)',
      ai_differential: 'Vesicular Stomatitis / Foot-and-Mouth Disease (FMD)',
      urgency: 'HIGH',
      status: 'VISIT_SCHEDULED',
      interim_advice: '1. बाधित गाईला इतर जनावरांपासून किमान १५ मीटर दूर विलगीकरणात ठेवा.\n2. तोंड व खुरांचे व्रण पोटॅशियम परमँगनेटच्या पाण्याने धुवा.\n3. कोरडा चारा देऊ नका; मऊ भाताची पेज किंवा लापशी खाऊ घाला.',
      doctor_notes: 'क्लिनिकल तपासणी शेड्यूल केली आहे. आश्वी बुद्रुक क्लस्टरमध्ये रिंग व्हॅक्सिनेशन पथक रवाना केले आहे.',
      prescription: '१. Inj. Meloxicam 10ml I/M\n२. पोटॅशियम परमँगनेट माऊथ वॉश (दिवसातून २ वेळा)\n३. मऊ लापशी व भाताची पेज',
      visit_eta: 'आज दुपारी २:३० वाजता (Today 2:30 PM)',
      village_name: 'Ashwi Budruk',
      block_name: 'Rahuri',
      district_name: 'Ahmednagar',
      latitude: 19.3912,
      longitude: 74.6521,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'CASE-20260908-8819BC',
      report_id: 'REP-1725738491002',
      farmer_id: 'usr_farmer_02',
      farmer_name: 'सुरेश शिंदे (Suresh Shinde)',
      farmer_phone_masked: '+91 9423X-XX819',
      doctor_id: 'usr_vet_02',
      doctor_name: 'Dr. Ananya Deshmukh',
      doctor_phone_masked: '+91 9422X-XX842',
      animal_tag: '1002-9384-7562',
      species: 'म्हैस (Murrah Buffalo)',
      breed: 'मुऱ्हा (Murrah)',
      syndrome_code: 'HSDS',
      syndrome_name: 'घटसर्प (Hemorrhagic Septicemia)',
      symptoms: 'गळ्याला मोठी सूज, धाप लागणे, घरघर आवाज, अतिउच्च ताप',
      ai_differential: 'Hemorrhagic Septicemia (HS) संशयित',
      urgency: 'CRITICAL',
      status: 'AWAITING_DOCTOR',
      interim_advice: '1. जनावरास थंड व सावलीच्या जागी बसवा.\n2. गळ्यावर थंड पाण्याच्या पट्ट्या ठेवा.\n3. औषधोपचारासाठी डॉक्टरांची वाट पहा.',
      doctor_notes: '',
      prescription: '',
      visit_eta: 'डॉक्टर तातडीने मार्गस्थ (Urgent Dispatch)',
      village_name: 'Rahuri Rural',
      block_name: 'Rahuri',
      district_name: 'Ahmednagar',
      latitude: 19.3885,
      longitude: 74.6492,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);

  const [selectedCaseForDoctor, setSelectedCaseForDoctor] = useState<ClinicalCase | null>(null);
  const [isDoctorActionModalOpen, setIsDoctorActionModalOpen] = useState(false);
  const [activeConsultCase, setActiveConsultCase] = useState<ClinicalCase | null>(null);

  // Sync clinical cases from CaseService (Cloud + SQLite)
  const loadCases = async () => {
    try {
      const fetched = activeRole === 'doctor'
        ? await caseService.getDoctorCases()
        : await caseService.getFarmerCases();
      if (fetched && fetched.length > 0) {
        setClinicalCases(fetched);
      }
    } catch (err) {
      console.warn('Failed to load clinical cases:', err);
    }
  };

  useEffect(() => {
    loadCases();
    const interval = setInterval(loadCases, 10000);
    return () => clearInterval(interval);
  }, [activeRole]);

  const handleCaseUpdated = (updatedCase: ClinicalCase) => {
    setClinicalCases((prev) =>
      prev.map((c) => (c.id === updatedCase.id ? updatedCase : c))
    );
    if (selectedCaseForDoctor?.id === updatedCase.id) {
      setSelectedCaseForDoctor(updatedCase);
    }
  };

  const handleStartVideoConsult = (caseItem: ClinicalCase) => {
    setActiveConsultCase(caseItem);
    setIsVideoConsultOpen(true);
  };

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
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full">
              {clinicalCases.length} {currentLanguage === 'en' ? 'Active' : 'सक्रिय'}
            </span>
          </div>

          <div className="space-y-2.5">
            {clinicalCases.map((caseItem) => (
              <div
                key={caseItem.id}
                className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {caseItem.animal_tag}
                      </span>
                      <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300">
                        {caseItem.syndrome_code} / {caseItem.syndrome_name}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.2 rounded-full ${
                          caseItem.status === 'VISIT_SCHEDULED'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : caseItem.status === 'RESOLVED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {caseItem.status === 'VISIT_SCHEDULED'
                          ? '● भेट नियोजित'
                          : caseItem.status === 'RESOLVED'
                          ? '● पूर्ण'
                          : '● प्रलंबित'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {caseItem.species} • {caseItem.farmer_name} ({caseItem.farmer_phone_masked}) • {caseItem.village_name}
                    </p>
                  </div>
                </div>

                {/* Visit ETA or Prescription preview if doctor updated */}
                {caseItem.visit_eta && (
                  <div className="text-[11px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-xl flex items-center gap-1 font-semibold">
                    <Calendar className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                    <span>भेट वेळ: {caseItem.visit_eta}</span>
                  </div>
                )}

                {caseItem.prescription && (
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-xl flex items-center gap-1 font-medium truncate">
                    <Pill className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    <span className="truncate">Rx: {caseItem.prescription}</span>
                  </div>
                )}

                {/* Actions: Review & Rx, Video Call, Phone Call */}
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-200 dark:border-slate-700/60 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      hapticsService.hapticLight();
                      setSelectedCaseForDoctor(caseItem);
                      setIsDoctorActionModalOpen(true);
                    }}
                    className="field-touch-target px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-xs transition-transform active:scale-95"
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>तपासणी व औषध (Review & Rx)</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        hapticsService.hapticLight();
                        handleStartVideoConsult(caseItem);
                      }}
                      className="field-touch-target px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-transform active:scale-95"
                      title="Video Call Farmer"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>व्हिडिओ कॉल</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        hapticsService.hapticMedium();
                        window.location.href = 'tel:+919822000412';
                      }}
                      className="field-touch-target p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-transform active:scale-95"
                      title="Phone Call Farmer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
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

        {/* Doctor Case Review & Prescription Modal */}
        <DoctorCaseActionModal
          isOpen={isDoctorActionModalOpen}
          onClose={() => setIsDoctorActionModalOpen(false)}
          caseItem={selectedCaseForDoctor}
          onCaseUpdated={handleCaseUpdated}
          onStartVideoConsult={(item) => {
            setIsDoctorActionModalOpen(false);
            handleStartVideoConsult(item);
          }}
        />

        {/* Doctor Video Tele-Consultation Modal */}
        <VideoConsultModal
          isOpen={isVideoConsultOpen}
          onClose={() => {
            setIsVideoConsultOpen(false);
            setActiveConsultCase(null);
          }}
          caseId={activeConsultCase?.id || 'CASE-20260908-7561AF'}
          callerRole="doctor"
          targetPartyName={activeConsultCase?.farmer_name || 'Ramesh Patil (रमेश पाटील)'}
          targetPartyPhone={activeConsultCase?.farmer_phone_masked || '+91 9822000412'}
          animalTag={activeConsultCase?.animal_tag || '1002-9384-7561'}
          animalSpecies={activeConsultCase?.species || 'Gir Cow (गीर गाय)'}
          suspectedCondition={activeConsultCase?.syndrome_name || 'VSS / FMD'}
        />
      </div>
    );
  }

  // ==========================================
  // 3. CONSUMER (FARMER) DASHBOARD: Herd & Local Status
  // ==========================================
  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* 1. HERO BANNER: Report Symptoms & Instant AI Multimodal Triage */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-3xl p-4 text-white shadow-lg shadow-emerald-900/20 relative overflow-hidden">
        <div className="relative z-10 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-emerald-50">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
              <span>AI Triage & Doctor Sync 24x7</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/20 text-emerald-100">
              Offline First
            </span>
          </div>

          <div>
            <h2 className={`text-base font-black leading-tight ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
              {currentLanguage === 'en'
                ? 'Is Your Animal Sick or Showing Symptoms?'
                : currentLanguage === 'hi'
                ? 'क्या आपका पशु बीमार है या लक्षण दिख रहे हैं?'
                : 'पशूला ताप, लाळ, फोड किंवा लक्षणे दिसत आहेत का?'}
            </h2>
            <p className={`text-xs text-emerald-100 mt-1 leading-relaxed ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
              {currentLanguage === 'en'
                ? 'Describe symptoms, snap lesion photo, or record voice. AI provides instant first-aid while syncing with your local veterinarian.'
                : currentLanguage === 'hi'
                ? 'लक्षण बताएं, फोटो लें या बोलकर बताएं। डॉक्टर के आने तक AI तुरंत प्राथमिक उपचार बताएगा और नजदीकी डॉक्टर को रिपोर्ट भेजेगा।'
                : 'फोटो काढा किंवा बोलून लक्षणे सांगा. डॉक्टर येईपर्यंत AI तात्काळ प्रथमोपचार सांगेल आणि स्थानिक पशुवैद्यकाकडे केस पाठवेल.'}
            </p>
          </div>

          <button
            type="button"
            onClick={async () => {
              await hapticsService.hapticMedium();
              setActiveTab('report');
            }}
            className={`field-touch-target w-full py-3 px-4 rounded-2xl bg-white text-emerald-800 hover:bg-emerald-50 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-transform active:scale-98 ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}
          >
            <FileText className="w-4 h-4 text-emerald-700" />
            <span>
              {currentLanguage === 'en'
                ? 'Start AI Triage & Report Symptoms'
                : currentLanguage === 'hi'
                ? 'AI जांच व लक्षण दर्ज करें'
                : 'लक्षणे नोंदवा व झटपट AI सल्ला घ्या'}
            </span>
            <ArrowRight className="w-4 h-4 text-emerald-700" />
          </button>
        </div>

        {/* Decorative ambient background blur */}
        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 2. ACTIVE ANIMAL REPORT & VET SYNC STATUS CARD */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                {currentLanguage === 'en'
                  ? 'Active Case & Doctor Sync'
                  : currentLanguage === 'hi'
                  ? 'सक्रिय केस व डॉक्टर समन्वय'
                  : 'माझे नोंदवलेले केस व डॉक्टर समन्वय'}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">Synced with Rahuri Veterinary Dispensary</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
            <CheckCircle2 className="w-3 h-3" />
            <span>{currentLanguage === 'en' ? 'Doctor In-Sync' : 'डॉक्टरशी जोडलेले'}</span>
          </span>
        </div>

        {/* Dynamic List of Active Cases */}
        <div className="space-y-3">
          {clinicalCases.map((caseItem) => (
            <div
              key={caseItem.id}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {caseItem.animal_tag}
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300">
                      {caseItem.syndrome_code} / {caseItem.syndrome_name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                    {caseItem.species} • {caseItem.village_name} ({caseItem.block_name})
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    caseItem.status === 'VISIT_SCHEDULED'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      : caseItem.status === 'RESOLVED'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {caseItem.status === 'VISIT_SCHEDULED'
                    ? '● भेट नियोजित'
                    : caseItem.status === 'RESOLVED'
                    ? '● उपचार पूर्ण'
                    : '● डॉक्टर समन्वय चालू'}
                </span>
              </div>

              {/* Scheduled Visit Highlight Card if scheduled */}
              {caseItem.visit_eta && (
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-center gap-2 text-blue-900 dark:text-blue-200 text-xs font-bold">
                  <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="block text-[10px] uppercase text-blue-600 dark:text-blue-400 font-extrabold">
                      डॉक्टरांचे प्रत्यक्ष येण्याचे नियोजन (Scheduled Visit):
                    </span>
                    <span className="text-xs font-black text-blue-950 dark:text-white">
                      {caseItem.visit_eta}
                    </span>
                  </div>
                </div>
              )}

              {/* Doctor's Prescription if updated */}
              {caseItem.prescription && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-900 dark:text-emerald-200 text-xs font-bold">
                    <Pill className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>डॉक्टरांचा सल्ला व औषधोपचार (Doctor's Prescription):</span>
                  </div>
                  <p className="text-[11px] text-emerald-950 dark:text-emerald-100 font-medium whitespace-pre-line pl-4">
                    {caseItem.prescription}
                  </p>
                  {caseItem.doctor_notes && (
                    <p className="text-[10px] text-emerald-800 dark:text-emerald-300 italic pt-1 pl-4 border-t border-emerald-200/60">
                      टीप: {caseItem.doctor_notes}
                    </p>
                  )}
                </div>
              )}

              {/* Interim First-Aid Advice while Awaiting Doctor */}
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-200 text-xs font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    {currentLanguage === 'en'
                      ? 'Provisional First-Aid (Until Doctor Arrives):'
                      : 'डॉक्टर येईपर्यंत तात्पुरते प्रथमोपचार व काळजी:'}
                  </span>
                </div>
                <div className="text-[11px] text-amber-900 dark:text-amber-300/90 whitespace-pre-line pl-4 leading-relaxed font-medium">
                  {caseItem.interim_advice || (
                    '1. बाधित जनावरास इतर निरोगी जनावरांपासून वेगळे ठेवा.\n2. ताजे व स्वच्छ पाणी द्या.\n3. डॉक्टरांचे पथक येईपर्यंत विश्रांती द्या.'
                  )}
                </div>
              </div>

              {/* Doctor Sync Meta & Direct Quick Call */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <div className="text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">नियुक्त अधिकारी: </span>
                  <span>Dr. Ananya Deshmukh (BVO Rahuri • 2.4 km)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={async () => {
                      await hapticsService.hapticLight();
                      handleStartVideoConsult(caseItem);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-transform active:scale-95"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>व्हिडिओ सल्ला</span>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await hapticsService.hapticMedium();
                      window.location.href = 'tel:+919422001842';
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-transform active:scale-95"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>कॉल</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. NEARBY AVAILABLE DOCTORS PREVIEW CARD */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className={`text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
              {currentLanguage === 'en'
                ? 'Nearby Available Doctors on Duty'
                : currentLanguage === 'hi'
                ? 'निकटतम उपलब्ध पशु चिकित्सक'
                : 'जवळचे उपलब्ध पशुवैद्यकीय अधिकारी'}
            </h3>
          </div>
          <button
            type="button"
            onClick={async () => {
              await hapticsService.hapticLight();
              setActiveTab('doctors');
            }}
            className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-0.5"
          >
            <span>{currentLanguage === 'en' ? 'View All (4)' : 'सर्व पहा (४)'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Doctor Preview List */}
        <div className="space-y-2">
          {/* Doctor 1 */}
          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-xs shrink-0 border border-emerald-300 dark:border-emerald-800">
                <Stethoscope className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {currentLanguage === 'en' ? 'Dr. Ananya Deshmukh' : 'डॉ. अनन्या देशमुख'}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  BVO Rahuri • 2.4 km • <span className="text-emerald-600 font-bold">● उपस्थित</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                await hapticsService.hapticMedium();
                window.location.href = 'tel:+919422001842';
              }}
              className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
              aria-label="Call Dr. Deshmukh"
            >
              <Phone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Doctor 2: Pashu Sakhi */}
          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center text-xs shrink-0 border border-teal-300 dark:border-teal-800">
                <User className="w-4 h-4 text-teal-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {currentLanguage === 'en' ? 'Sunita Tai Gaikwad' : 'सुनीता ताई गायकवाड (पशु सखी)'}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  आश्वी बुद्रुक • 0.8 km • <span className="text-emerald-600 font-bold">● गावात उपस्थित</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                await hapticsService.hapticMedium();
                window.location.href = 'tel:+919881000311';
              }}
              className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
              aria-label="Call Sunita Tai"
            >
              <Phone className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Live Geospatial Surveillance Widget */}
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

      {/* 5. Metric Counters Grid */}
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

      {/* 6. Active Weather Advisory Banner */}
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

      {/* Collapsible SQLite Diagnostic Core */}
      <div className="pt-2">
        <HealthCheckView />
      </div>

      {/* Farmer Video Tele-Consultation Modal */}
      <VideoConsultModal
        isOpen={isVideoConsultOpen}
        onClose={() => {
          setIsVideoConsultOpen(false);
          setActiveConsultCase(null);
        }}
        caseId={activeConsultCase?.id || 'CASE-20260908-7561AF'}
        callerRole="farmer"
        targetPartyName={activeConsultCase?.doctor_name || 'Dr. Ananya Deshmukh (M.V.Sc)'}
        targetPartyPhone={activeConsultCase?.doctor_phone_masked || '+91 9422001842'}
        animalTag={activeConsultCase?.animal_tag || '1002-9384-7561'}
        animalSpecies={activeConsultCase?.species || 'Gir Cow (गीर गाय)'}
        suspectedCondition={activeConsultCase?.syndrome_name || 'VSS / FMD'}
      />
    </div>
  );
};

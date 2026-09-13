import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Database,
  Radio,
  BellRing,
  MapPin,
  Activity,
  Stethoscope,
  Video,
  FileText,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Phone,
  ArrowRight,
  User,
  Pill,
  Clock,
  ExternalLink,
  Eye,
  Camera,
  Volume2,
  VolumeX,
  AlertOctagon,
} from 'lucide-react';
import { RadarSweep } from '../../components/animations/RadarSweep';
import { CountUpTicker } from '../../components/animations/CountUpTicker';
import { HealthCheckView } from '../common/HealthCheckView';
import { useAuthStore } from '../../store/authStore';
import { useLanguageStore } from '../../store/languageStore';
import { useNavigationStore } from '../../store/navigationStore';
import { VideoConsultModal } from '../../components/consult/VideoConsultModal';
import { OfficialPrescriptionModal } from '../../components/consult/OfficialPrescriptionModal';
import { ClinicalCase, caseService } from '../../services/caseService';
import { hapticsService } from '../../services/hapticsService';
import {
  localizeSyndromeName,
  localizeSpecies,
  localizeCaseStatus,
} from '../../utils/clinicalLocalization';
import { getDoctorsEndpoint, getApiUrl } from '../../config/api';

export const FarmerDashboardView: React.FC = () => {
  const { currentLanguage, t } = useLanguageStore();
  const setActiveTab = useNavigationStore((state) => state.setActiveTab);
  const [isVideoConsultOpen, setIsVideoConsultOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [clinicalCases, setClinicalCases] = useState<ClinicalCase[]>([]);
  const [activeConsultCase, setActiveConsultCase] = useState<ClinicalCase | null>(null);
  const [selectedRxCase, setSelectedRxCase] = useState<ClinicalCase | null>(null);
  const [activeClusters, setActiveClusters] = useState<any[]>([]);
  const [nearbyDoctors, setNearbyDoctors] = useState<any[]>([]);
  const [speakingCaseId, setSpeakingCaseId] = useState<string | null>(null);

  const handleSpeakAdvice = (caseId: string, adviceText: string) => {
    if (!('speechSynthesis' in window)) return;
    if (speakingCaseId === caseId) {
      window.speechSynthesis.cancel();
      setSpeakingCaseId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const clean = adviceText.replace(/[*#•]/g, ' ').replace(/\s+/g, ' ').trim();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = currentLanguage === 'hi' ? 'hi-IN' : currentLanguage === 'mr' ? 'mr-IN' : 'en-IN';
    utterance.rate = 0.9;
    utterance.onend = () => setSpeakingCaseId(null);
    utterance.onerror = () => setSpeakingCaseId(null);
    setSpeakingCaseId(caseId);
    window.speechSynthesis.speak(utterance);
  };

  // Sync clinical cases, active outbreak clusters, and real doctors
  const loadDashboardData = async () => {
    try {
      const fetched = await caseService.getFarmerCases();
      setClinicalCases(fetched || []);
    } catch (err) {
      console.warn('Failed to load farmer clinical cases:', err);
    }

    try {
      const clusterRes = await fetch(getApiUrl('clusters/active'));
      if (clusterRes.ok) {
        const clusterData = await clusterRes.json();
        setActiveClusters(Array.isArray(clusterData) ? clusterData : []);
      }
    } catch {
      // offline or unreachable
    }

    try {
      const docRes = await fetch(getDoctorsEndpoint());
      if (docRes.ok) {
        const docData = await docRes.json();
        setNearbyDoctors(Array.isArray(docData) ? docData : []);
      }
    } catch {
      // offline or unreachable
    }
  };

  useEffect(() => {
    loadDashboardData();
    // Reactive instant listener: when doctor issues Rx or updates case, instantly update UI
    const unsubscribe = caseService.subscribe((updatedCase) => {
      setClinicalCases((prev) => {
        const index = prev.findIndex((c) => c.id === updatedCase.id);
        if (index >= 0) {
          const next = [...prev];
          next[index] = updatedCase;
          return next;
        } else {
          return [updatedCase, ...prev];
        }
      });
      setSelectedRxCase((current) => {
        if (current && current.id === updatedCase.id) {
          return updatedCase;
        }
        return current;
      });
    });

    const interval = setInterval(loadDashboardData, 10000);
    return () => {
      unsubscribe();
      clearInterval(interval);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleStartVideoConsult = (caseItem: ClinicalCase) => {
    setActiveConsultCase(caseItem);
    setIsVideoConsultOpen(true);
  };

  const handleOpenPrescription = (caseItem: ClinicalCase) => {
    setSelectedRxCase(caseItem);
    setIsPrescriptionModalOpen(true);
  };

  const pendingReportsCount = clinicalCases.filter((c) => c.status === 'AWAITING_DOCTOR').length;
  const villageCount = new Set(clinicalCases.map((c) => c.village_name).filter(Boolean)).size;

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* 0. DYNAMIC TOP PRIORITY BANNER (Shown only if active outbreak clusters exist) */}
      {activeClusters.length > 0 && (
        <div className="bg-rose-500/10 dark:bg-rose-500/20 backdrop-blur-md border border-rose-400 dark:border-rose-500/50 rounded-3xl p-4 flex items-start gap-3 shadow-lg shadow-rose-900/10">
          <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5 hazard-glow-pulse rounded-full" />
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-black text-rose-900 dark:text-rose-100 flex items-center justify-between ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
              <span>{activeClusters[0].primary_disease || (currentLanguage === 'en' ? 'Outbreak Alert' : 'रोग प्रादुर्भाव इशारा')}</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-600 text-white">
                {activeClusters[0].containment_radius_km || 5}km {currentLanguage === 'en' ? 'Zone' : 'परिसर'}
              </span>
            </h3>
            <p className={`text-xs text-rose-800 dark:text-rose-200/90 mt-1 leading-relaxed ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
              {currentLanguage === 'en'
                ? `An active ${activeClusters[0].primary_disease || 'syndromic'} cluster has been detected in ${activeClusters[0].district || 'your district'}. Please isolate healthy livestock.`
                : `${activeClusters[0].district || 'आपल्या परिसरात'} रोगाची लागण आढळली आहे. कृपया निरोगी जनावरांना वेगळे ठेवा.`}
            </p>
          </div>
        </div>
      )}

      {/* 1. HERO BANNER: Report Symptoms & Instant AI Multimodal Triage */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 rounded-3xl p-5 text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden">
        <div className="relative z-10 space-y-3">
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
            className={`field-touch-target w-full py-3.5 px-4 rounded-2xl bg-white text-emerald-800 hover:bg-emerald-50 font-black text-sm flex items-center justify-center gap-2 shadow-md transition-transform active:scale-98 ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}
          >
            <FileText className="w-5 h-5 text-emerald-700" />
            <span>
              {currentLanguage === 'en'
                ? 'Report Sick Animal Now'
                : currentLanguage === 'hi'
                ? 'बीमार पशु की रिपोर्ट करें'
                : 'आजारी जनावराची नोंद करा'}
            </span>
            <ArrowRight className="w-5 h-5 text-emerald-700" />
          </button>
        </div>

        {/* Decorative ambient background blur */}
        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 2. REAL CASES REPORTED BY THIS FARMER */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className={`text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
              {currentLanguage === 'en'
                ? 'My Reported Cases & Doctor Response'
                : currentLanguage === 'hi'
                ? 'मेरी दर्ज शिकायतें व डॉक्टर स्थिति'
                : 'माझे दाखल रुग्ण व डॉक्टरांची स्थिती'}
            </h3>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
            {clinicalCases.length} {currentLanguage === 'en' ? 'Cases' : 'केस'}
          </span>
        </div>

        {clinicalCases.length === 0 ? (
          <div className="p-6 text-center space-y-2 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {currentLanguage === 'en' ? 'No active illness reported' : 'सध्या कोणतीही आजारी नोंद नाही'}
            </p>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              {currentLanguage === 'en'
                ? 'Your livestock is healthy. Use "Report Sick Animal Now" above whenever any animal shows fever, lesions or symptoms.'
                : 'सर्व जनावरे सुरक्षित आहेत. लक्षणे दिसल्यास वरील बटणावर क्लिक करून अहवाल पाठवा.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {clinicalCases.map((caseItem) => (
              <div
                key={caseItem.id}
                className="p-3.5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3 shadow-xs"
              >
                {/* Header: Photo thumbnail, Tag, Syndrome and Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    {caseItem.photo_url ? (
                      <img
                        src={caseItem.photo_url}
                        alt="Lesion"
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-300 dark:border-slate-700 shadow-2xs shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-2xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 text-slate-500">
                        <Camera className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-xs font-black text-slate-900 dark:text-white">
                          {caseItem.animal_tag}
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300">
                          {caseItem.syndrome_code} / {localizeSyndromeName(caseItem.syndrome_code, caseItem.syndrome_name, currentLanguage)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                        {localizeSpecies(caseItem.species, currentLanguage)} • {caseItem.village_name}, {caseItem.block_name || 'Taluka'}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                      caseItem.status === 'VISIT_SCHEDULED'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : caseItem.status === 'IN_CONSULTATION'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        : caseItem.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {localizeCaseStatus(caseItem.status, currentLanguage)}
                  </span>
                </div>

                {/* Interim Advice / First-Aid Protocol Card */}
                <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-amber-50/90 dark:from-amber-950/40 dark:via-slate-900 dark:to-amber-950/30 p-3 rounded-2xl border-2 border-amber-300/70 dark:border-amber-800/60 text-[11px] text-amber-950 dark:text-amber-100 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-amber-200/60 dark:border-amber-800/40 pb-1.5">
                    <div className="font-black flex items-center gap-1.5 text-amber-900 dark:text-amber-200 text-xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>
                        {currentLanguage === 'en'
                          ? '⚡ AI Temporary First-Aid (Until Doctor Consult):'
                          : '⚡ तात्पुरते प्रथमोपचार व घरगुती काळजी:'}
                      </span>
                    </div>

                    {/* TTS Audio Listen Button */}
                    <button
                      type="button"
                      onClick={() => handleSpeakAdvice(caseItem.id, caseItem.interim_advice || '')}
                      className={`px-2.5 py-1 rounded-xl flex items-center gap-1 text-[10px] font-bold shadow-2xs transition-all active:scale-95 shrink-0 ${
                        speakingCaseId === caseItem.id
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                      title={currentLanguage === 'en' ? 'Listen in Audio' : 'आवाजात ऐका'}
                    >
                      {speakingCaseId === caseItem.id ? (
                        <>
                          <VolumeX className="w-3 h-3" />
                          <span>{currentLanguage === 'en' ? 'Stop' : 'थांबवा'}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" />
                          <span>{currentLanguage === 'en' ? 'Listen' : 'आवाजात ऐका'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="whitespace-pre-line text-[11px] leading-relaxed font-medium pl-1 text-slate-850 dark:text-slate-200">
                    {caseItem.interim_advice || (currentLanguage === 'en' ? 'Keep animal isolated in dry shade with clean water.' : 'जनावरास कोरड्या सावलीत वेगळे बांधा आणि स्वच्छ पाणी द्या.')}
                  </p>
                </div>

                {/* Official Veterinary e-Prescription (Rx) Container */}
                {caseItem.prescription ? (
                  <div className="bg-emerald-50/90 dark:bg-emerald-950/40 p-3.5 rounded-2xl border-2 border-emerald-300 dark:border-emerald-800 text-xs text-emerald-950 dark:text-emerald-100 space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800/80 pb-2">
                      <div className="flex items-center gap-1.5 font-black text-emerald-900 dark:text-emerald-200">
                        <span className="font-serif italic font-black text-lg text-emerald-700 dark:text-emerald-400 leading-none">℞</span>
                        <span className="text-[11px] uppercase tracking-wider">
                          {currentLanguage === 'en' ? 'Veterinary e-Prescription (Rx)' : 'शासकीय ई-प्रिस्क्रिप्शन (Rx)'}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{currentLanguage === 'en' ? 'Verified Doctor' : 'प्रमाणित डॉक्टर'}</span>
                      </span>
                    </div>

                    {/* Prescribing Doctor & Scheduled Visit ETA */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-semibold">
                          {currentLanguage === 'en' ? 'Prescribed by:' : 'औषधोपचार देणारे डॉक्टर:'}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {caseItem.doctor_name || 'Dr. Rajesh Sharma, LDO (VCI: MSVC-2018/04812)'}
                        </span>
                      </div>

                      {caseItem.visit_eta && (
                        <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-blue-100/80 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200">
                          <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="text-[10px] font-bold">
                            {currentLanguage === 'en' ? 'Visit ETA:' : 'भेट वेळ:'} {caseItem.visit_eta}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Medicines Overview */}
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/60 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {currentLanguage === 'en' ? 'Prescribed Medications:' : 'विहित औषधोपचार:'}
                      </span>
                      <p className="whitespace-pre-line text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed pl-1">
                        {caseItem.prescription}
                      </p>
                    </div>

                    {/* Button to open the full Official e-Prescription modal */}
                    <button
                      type="button"
                      onClick={() => handleOpenPrescription(caseItem)}
                      className="field-touch-target w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-98"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>
                        {currentLanguage === 'en' ? 'View & Print Official e-Prescription Slip' : 'अधिकृत ई-प्रिस्क्रिप्शन पावती पहा व प्रिंट करा'}
                      </span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </button>
                  </div>
                ) : (
                  /* When waiting for doctor review */
                  <div className="bg-amber-50/70 dark:bg-amber-950/20 p-2.5 rounded-2xl border border-amber-200 dark:border-amber-900/40 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                      <Clock className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
                      <div>
                        <p className="font-bold">
                          {currentLanguage === 'en' ? 'Case in Doctor Review Queue' : 'केस डॉक्टर तपासणी कक्षेत आहे'}
                        </p>
                        <p className="text-[10px] text-amber-700 dark:text-amber-400">
                          {currentLanguage === 'en' ? 'Dr. is reviewing symptoms and will issue e-Prescription shortly.' : 'डॉक्टर लक्षणे तपासत असून लवकरच औषधोपचार पाठवतील.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Video & Phone Call Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700/60 text-xs">
                  <div className="text-[11px] text-slate-500 truncate max-w-[170px]">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">डॉक्टर: </span>
                    <span>{caseItem.doctor_name || 'Assigned Veterinary Officer'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await hapticsService.hapticLight();
                        handleStartVideoConsult(caseItem);
                      }}
                      className="field-touch-target px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-xs transition-transform active:scale-95"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>{currentLanguage === 'en' ? 'Video Consult' : 'व्हिडिओ सल्ला'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await hapticsService.hapticMedium();
                        window.location.href = 'tel:+919422001842';
                      }}
                      className="field-touch-target p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                      aria-label="Call Doctor"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
            <span>{currentLanguage === 'en' ? `View All (${nearbyDoctors.length})` : `सर्व पहा (${nearbyDoctors.length})`}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Doctor Preview List */}
        <div className="space-y-2">
          {nearbyDoctors.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">
              {currentLanguage === 'en'
                ? 'No registered veterinarians on duty yet.'
                : 'सध्या कोणतेही नोंदणीकृत पशुवैद्यकीय अधिकारी उपलब्ध नाहीत.'}
            </p>
          ) : (
            nearbyDoctors.slice(0, 2).map((doc, idx) => (
              <div
                key={doc.id || idx}
                className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-xs shrink-0 border border-emerald-300 dark:border-emerald-800">
                    <Stethoscope className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {doc.full_name || 'Veterinary Officer'}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {doc.taluka || doc.district || 'Dispensary'} •{' '}
                      <span className="text-emerald-600 font-bold">
                        {currentLanguage === 'en' ? '● On Duty' : '● उपस्थित'}
                      </span>
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
                  aria-label="Call Doctor"
                >
                  <Phone className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
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
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className={`text-xs font-bold ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
              {t('pendingReports', 'Pending Reports')}
            </span>
            <Database className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-1 mt-2">
            <CountUpTicker end={pendingReportsCount} durationMs={900} />
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
            <CountUpTicker end={villageCount || 1} durationMs={1000} />
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
        caseId={activeConsultCase?.id || ''}
        callerRole="farmer"
        targetPartyName={activeConsultCase?.doctor_name || ''}
        targetPartyPhone={activeConsultCase?.doctor_phone_masked || ''}
        animalTag={activeConsultCase?.animal_tag || ''}
        animalSpecies={localizeSpecies(activeConsultCase?.species || '', currentLanguage)}
        suspectedCondition={localizeSyndromeName(activeConsultCase?.syndrome_code, activeConsultCase?.syndrome_name || '', currentLanguage)}
      />

      {/* Official Government Veterinary e-Prescription (Rx) Modal */}
      <OfficialPrescriptionModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => {
          setIsPrescriptionModalOpen(false);
          setSelectedRxCase(null);
        }}
        caseItem={selectedRxCase}
        onStartVideoConsult={(item) => {
          setIsPrescriptionModalOpen(false);
          handleStartVideoConsult(item);
        }}
      />
    </div>
  );
};

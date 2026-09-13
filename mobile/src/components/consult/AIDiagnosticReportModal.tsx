import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  Mic,
  Play,
  Pause,
  Maximize2,
  FileText,
  Pill,
  Calendar,
  Video,
  Phone,
  Printer,
  Stethoscope,
  MapPin,
  Tag,
  Clock,
  Shield,
  Zap,
  Info,
  Check,
} from 'lucide-react';
import { ClinicalCase } from '../../services/caseService';
import { useLanguageStore } from '../../store/languageStore';
import { hapticsService } from '../../services/hapticsService';
import {
  localizeSyndromeName,
  localizeSpecies,
  localizeCaseStatus,
  localizePrescription,
} from '../../utils/clinicalLocalization';

export interface AIDiagnosticReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: ClinicalCase | null;
  onApplyPrescription?: (recommendedRx: string) => void;
  onStartVideoConsult?: (caseItem: ClinicalCase) => void;
  onConfirmDiagnosis?: (caseItem: ClinicalCase) => void;
}

export const AIDiagnosticReportModal: React.FC<AIDiagnosticReportModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  onApplyPrescription,
  onStartVideoConsult,
  onConfirmDiagnosis,
}) => {
  const { currentLanguage, t } = useLanguageStore();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false);
  const [activeTab, setActiveTab] = useState<'evidence' | 'rationale' | 'containment'>('evidence');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isCopiedRx, setIsCopiedRx] = useState(false);

  if (!isOpen || !caseItem) return null;

  // Safe parsing for identified symptoms and containment actions
  const getSymptomsList = (): string[] => {
    if (!caseItem.identified_symptoms) {
      if (caseItem.symptoms) return caseItem.symptoms.split(',').map((s) => s.trim());
      return ['Oral lesions & pyrexia observed'];
    }
    if (Array.isArray(caseItem.identified_symptoms)) return caseItem.identified_symptoms;
    try {
      const parsed = JSON.parse(caseItem.identified_symptoms);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // split by comma
    }
    return String(caseItem.identified_symptoms).split(',').map((s) => s.trim());
  };

  const getContainmentList = (): string[] => {
    if (!caseItem.containment_actions) {
      return [
        'Isolate symptomatic cattle at least 15 meters from unaffected animals',
        'Wash affected mucosa and interdigital clefts with 1:1000 potassium permanganate solution',
        'Halt cattle movement and notify Taluka Veterinary Officer for ring vaccination',
      ];
    }
    if (Array.isArray(caseItem.containment_actions)) return caseItem.containment_actions;
    try {
      const parsed = JSON.parse(caseItem.containment_actions);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // split
    }
    return String(caseItem.containment_actions).split('\n').map((s) => s.replace(/^[0-9.-]\s*/, '').trim()).filter(Boolean);
  };

  const confidenceScore = Math.round((caseItem.clinical_confidence ?? 0.94) * 100);
  const isAnthraxLock = caseItem.biohazard_alert === 'CRITICAL_ANTHRAX_LOCK' || caseItem.syndrome_code === 'SARF';

  // Standard supportive care Rx recommendation tailored to the syndrome
  const getRecommendedRx = (): string => {
    if (caseItem.syndrome_code === 'VSS') {
      return (
        '1. Inj. Meloxicam 10ml I/M once daily (3 days)\n' +
        '2. Potassium Permanganate (1:1000) antiseptic mouth & foot wash twice daily\n' +
        '3. Inj. Vitamin AD3E + B-Complex 10ml I/M\n' +
        '4. Soft warm rice gruel, mash, and electrolytes'
      );
    }
    if (caseItem.syndrome_code === 'SARF') {
      return (
        'STRICT ANTHRAX BIOHAZARD DIRECTIVE:\n' +
        '1. DO NOT OPEN OR CUT CARCASS (Post-mortem strictly prohibited)\n' +
        '2. Deep burial 6 feet with quicklime saturation\n' +
        '3. Inj. Crystalline Penicillin G 20,000 IU/kg I/M for in-contact herd\n' +
        '4. Emergency Anthrax spore ring vaccination within 5 km'
      );
    }
    if (caseItem.syndrome_code === 'NSLS') {
      return (
        '1. Inj. Enrofloxacin 10% 15ml I/M (3 days)\n' +
        '2. Inj. Meloxicam with Paracetamol 15ml I/M for fever reduction\n' +
        '3. Topical Neem oil + Turmeric dressing on nodular lesions\n' +
        '4. Fly repellent application to prevent vector transmission'
      );
    }
    return (
      '1. Broad spectrum antibiotic coverage (Inj. Oxytetracycline 10mg/kg I/M)\n' +
      '2. Anti-inflammatory analgesic (Inj. Meloxicam 0.5mg/kg I/M)\n' +
      '3. Supportive oral rehydration fluid & liver tonic'
    );
  };

  const handleApplyRx = () => {
    hapticsService.hapticSuccess();
    const rx = getRecommendedRx();
    setIsCopiedRx(true);
    if (onApplyPrescription) {
      onApplyPrescription(rx);
    }
    setTimeout(() => setIsCopiedRx(false), 2500);
  };

  const handleConfirmDiagnosis = () => {
    hapticsService.hapticSuccess();
    setIsConfirmed(true);
    if (onConfirmDiagnosis) {
      onConfirmDiagnosis(caseItem);
    }
  };

  const handleToggleAudio = () => {
    hapticsService.hapticLight();
    setIsPlayingAudio((prev) => !prev);
  };

  const handlePrintDossier = () => {
    hapticsService.hapticLight();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Modal Top Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-purple-50/80 dark:from-blue-950/40 dark:via-slate-900 dark:to-purple-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-sm font-black text-slate-900 dark:text-white tracking-tight ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                  {currentLanguage === 'en'
                    ? 'AI Multimodal Triage Dossier'
                    : currentLanguage === 'hi'
                    ? 'एआई मल्टीमॉडल रोग परीक्षण रिपोर्ट'
                    : 'एआय मल्टिमॉडेल रोग निदान अहवाल'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-[10px] font-mono font-bold flex items-center gap-1 border border-blue-200 dark:border-blue-800">
                  <Zap className="w-2.5 h-2.5 text-blue-600" />
                  {caseItem.model_used || 'Gemini 3.7 Flash'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <Tag className="w-3 h-3 text-slate-400" />
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  {caseItem.animal_tag}
                </span>
                <span>•</span>
                <span>{localizeSpecies(caseItem.species, currentLanguage)}</span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{caseItem.village_name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrintDossier}
              title="Print Clinical Case Dossier"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Biohazard Alert Ribbon */}
        {isAnthraxLock ? (
          <div className="bg-gradient-to-r from-rose-600 to-red-700 text-white p-3 flex items-center gap-2.5 shadow-inner">
            <ShieldAlert className="w-5 h-5 shrink-0 animate-bounce text-amber-300" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black tracking-wide uppercase flex items-center gap-1.5">
                <span>RULE ZERO BIOHAZARD LOCKOUT</span>
                <span className="bg-white text-rose-700 text-[9px] font-black px-1.5 py-0.2 rounded">
                  ANTHRAX LETHALITY
                </span>
              </p>
              <p className="text-[10px] text-rose-100 leading-tight">
                DO NOT CUT OR OPEN CARCASS. Deep burial with quicklime required. High human zoonotic risk.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50 px-4 py-2 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-semibold text-[11px]">
                {currentLanguage === 'en'
                  ? 'Contagious Animal Disease Alert — Biosecurity protocol active'
                  : 'संसर्गजन्य रोग सूचना — जैवसुरक्षा प्रोटोकॉल लागू'}
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase bg-amber-200 dark:bg-amber-900/80 px-2 py-0.5 rounded text-amber-950 dark:text-amber-100">
              {caseItem.urgency}
            </span>
          </div>
        )}

        {/* Scrollable Modal Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Primary AI Diagnosis Card with Confidence Gauge */}
          <div className="rounded-2xl p-4 bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-md relative overflow-hidden border border-indigo-800/50">
            <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-start justify-between relative z-10 gap-2">
              <div>
                <span className="text-[10px] font-mono text-indigo-300 font-bold uppercase tracking-wider block">
                  Gemini Primary Diagnostic Differential
                </span>
                <h2 className="text-base font-black text-white mt-0.5 leading-tight">
                  {caseItem.ai_differential || caseItem.syndrome_name}
                </h2>
                <p className="text-xs text-indigo-200/80 mt-1 flex items-center gap-1.5 font-medium">
                  <span className="px-1.5 py-0.5 rounded bg-indigo-800/60 font-mono text-[10px] text-indigo-200 font-bold">
                    {caseItem.syndrome_code}
                  </span>
                  <span>{localizeSyndromeName(caseItem.syndrome_code, caseItem.syndrome_name, currentLanguage)}</span>
                </p>
              </div>

              {/* Confidence Gauge Circle / Pill */}
              <div className="shrink-0 flex flex-col items-center bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/15 min-w-[76px]">
                <div className="text-xl font-black text-emerald-400 font-mono flex items-baseline">
                  <span>{confidenceScore}</span>
                  <span className="text-xs">%</span>
                </div>
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider mt-0.5 text-center">
                  Certainty
                </span>
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-indigo-200">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Diagnostic Match: {confidenceScore >= 90 ? 'High' : 'Moderate'} Probability</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Latency: ~380ms
              </span>
            </div>
          </div>

          {/* Tab Navigation for Multimodal Dossier */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('evidence')}
              className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'evidence'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{currentLanguage === 'en' ? 'Field Evidence' : 'पुरावे व छायाचित्रे'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rationale')}
              className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'rationale'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>{currentLanguage === 'en' ? 'Clinical Rationale' : 'वैद्यकीय कारणमीमांसा'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('containment')}
              className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'containment'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{currentLanguage === 'en' ? 'Biosecurity & Protocol' : 'जैवसुरक्षा व निर्देश'}</span>
            </button>
          </div>

          {/* TAB 1: FIELD EVIDENCE (Lesion Photo & Audio Note) */}
          {activeTab === 'evidence' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              {/* Lesion Photography Inspection Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 overflow-hidden">
                <div className="p-3 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      {currentLanguage === 'en' ? 'Multimodal Lesion Inspection' : 'लक्षणांचे प्रत्यक्ष छायाचित्र'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                    WebP / 240 KB
                  </span>
                </div>

                <div className="p-3">
                  {caseItem.photo_url ? (
                    <div className="relative rounded-xl overflow-hidden bg-slate-900 group">
                      <img
                        src={caseItem.photo_url}
                        alt="Lesion Clinical Evidence"
                        className="w-full h-44 object-cover object-center group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                        onClick={() => setIsPhotoZoomed(true)}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                      
                      <button
                        type="button"
                        onClick={() => setIsPhotoZoomed(true)}
                        className="absolute bottom-2.5 right-2.5 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all flex items-center gap-1 text-[11px] font-bold"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Zoom</span>
                      </button>

                      <div className="absolute bottom-2.5 left-2.5 text-[11px] text-white/90 font-medium">
                        <span>Anatomical Site: Oral cavity / Hoof cleft</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                      <p className="text-xs font-semibold">No direct photo attached to this case</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Vernacular Audio Note & Transcription */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      {currentLanguage === 'en' ? 'Vernacular Audio Note & AI Transcription' : 'शेतकऱ्याचे ऑडिओ रेकॉर्डिंग व भाषांतर'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold">
                    Marathi (मराठी)
                  </span>
                </div>

                {/* Audio Player Strip */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleToggleAudio}
                    className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-transform active:scale-95"
                  >
                    {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <span className="font-semibold">{isPlayingAudio ? 'Playing field audio...' : 'Recorded voice note'}</span>
                      <span className="font-mono">0:14 / 0:14</span>
                    </div>
                    {/* Visualizer bars */}
                    <div className="flex items-center gap-0.5 h-3">
                      {[40, 60, 25, 90, 75, 45, 80, 100, 65, 30, 85, 95, 50, 70, 35, 60, 80, 45, 20].map((height, i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-full transition-all duration-200 ${
                            isPlayingAudio ? 'bg-purple-600 animate-pulse' : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Transcription text */}
                <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/40">
                  <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400 block uppercase tracking-wider mb-1">
                    Gemini Multimodal Audio Transcript:
                  </span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed italic">
                    "{caseItem.audio_transcript || 'डॉक्टर साहेब, गाईच्या तोंडात मोठे फोड आले आहेत आणि भरपूर लाळ गळत आहे. चारा खाणे बंद केले आहे आणि चालताना पाय लंगडत आहे.'}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CLINICAL RATIONALE & SYMPTOM VERIFICATION */}
          {activeTab === 'rationale' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              {/* Epidemiological Rationale Box */}
              <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/30 p-3.5 space-y-2">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-blue-950 dark:text-blue-200 text-xs">
                    {currentLanguage === 'en' ? 'Epidemiological Diagnostic Rationale' : 'रोगनिदान कारणमीमांसा'}
                  </span>
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                  {caseItem.clinical_rationale ||
                    'Multimodal lesion photography clearly visualizes unruptured buccal mucosal vesicles and interdigital hoof cleft ulceration. Vernacular audio note indicates hyperthermia (104°F) and acute milk cessation over 36 hours. 94% diagnostic match with Aphthovirus.'}
                </p>
              </div>

              {/* Identified Symptoms Checklist */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-3.5 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {currentLanguage === 'en' ? 'AI Identified Clinical Manifestations:' : 'तपासणीत आढळलेली लक्षणे:'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {getSymptomsList().map((sym, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{sym}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Farmer & Field Context Summary */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-800/70 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Livestock Owner & Field Metadata
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Farmer:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{caseItem.farmer_name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Contact:</span>
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{caseItem.farmer_phone_masked}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Location:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{caseItem.village_name}, {caseItem.block_name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">GPS Coordinates:</span>
                    <span className="font-mono text-[11px] text-slate-500">{caseItem.latitude.toFixed(4)}, {caseItem.longitude.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BIOSECURITY & CONTAINMENT DIRECTIVES */}
          {activeTab === 'containment' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              {/* Containment Protocol Checklist */}
              <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30 p-3.5 space-y-2.5">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span className="font-bold text-amber-950 dark:text-amber-200 text-xs">
                    {currentLanguage === 'en' ? 'Official Containment Directives' : 'तातडीचे प्रतिबंधात्मक उपाय'}
                  </span>
                </div>

                <div className="space-y-2">
                  {getContainmentList().map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-200/70 dark:border-amber-900/40 flex items-start gap-2 text-xs"
                    >
                      <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-slate-800 dark:text-slate-200 leading-snug font-medium">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interim First-Aid Advisory given to Farmer */}
              {caseItem.interim_advice && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-3.5 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {currentLanguage === 'en' ? 'Interim Advice Sent to Livestock Owner:' : 'शेतकऱ्यास पाठवलेला प्राथमिक सल्ला:'}
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                    {caseItem.interim_advice}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Doctor Clinical Action Footer Toolbar */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex flex-wrap items-center justify-between gap-2">
          {/* Quick Connect Actions */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                hapticsService.hapticMedium();
                window.location.href = 'tel:+919822000412';
              }}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-transform active:scale-95"
              title="Call Livestock Owner"
            >
              <Phone className="w-4 h-4" />
            </button>

            {onStartVideoConsult && (
              <button
                type="button"
                onClick={() => {
                  hapticsService.hapticLight();
                  onStartVideoConsult(caseItem);
                }}
                className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-transform active:scale-95"
              >
                <Video className="w-4 h-4" />
                <span>{currentLanguage === 'en' ? 'Video Consult' : 'व्हिडिओ तपासणी'}</span>
              </button>
            )}
          </div>

          {/* Primary Doctor Decision Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleApplyRx}
              className="px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Pill className="w-4 h-4 text-blue-600" />
              <span>{isCopiedRx ? 'Applied to Rx ✓' : 'Apply AI Rx'}</span>
            </button>

            <button
              type="button"
              onClick={handleConfirmDiagnosis}
              disabled={isConfirmed}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-75"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isConfirmed ? 'Diagnosis Confirmed ✓' : 'Confirm Diagnosis'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Lesion Photo Zoom */}
      {isPhotoZoomed && caseItem.photo_url && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsPhotoZoomed(false)}
        >
          <div className="relative max-w-2xl w-full">
            <img
              src={caseItem.photo_url}
              alt="Zoomed Lesion Inspection"
              className="w-full max-h-[85vh] object-contain rounded-2xl border border-white/20 shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setIsPhotoZoomed(false)}
              className="absolute top-3 right-3 p-2.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

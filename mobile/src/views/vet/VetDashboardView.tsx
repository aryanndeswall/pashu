import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Syringe,
  FlaskConical,
  Video,
  FileText,
  AlertTriangle,
  Calendar,
  Pill,
  Phone,
  Sparkles,
  Activity,
} from 'lucide-react';
import { CountUpTicker } from '../../components/animations/CountUpTicker';
import { HealthCheckView } from '../common/HealthCheckView';
import { DoctorCaseActionModal } from '../../components/consult/DoctorCaseActionModal';
import { VideoConsultModal } from '../../components/consult/VideoConsultModal';
import { AIDiagnosticReportModal } from '../../components/consult/AIDiagnosticReportModal';
import { ClinicalCase, caseService } from '../../services/caseService';
import { hapticsService } from '../../services/hapticsService';
import { useAuthStore } from '../../store/authStore';
import { useLanguageStore } from '../../store/languageStore';
import { useNavigationStore } from '../../store/navigationStore';
import {
  localizeSyndromeName,
  localizeSpecies,
  localizeCaseStatus,
  localizeVisitEta,
  localizePrescription,
} from '../../utils/clinicalLocalization';
import { animalService } from '../../services/animalService';
import { labService } from '../../services/labService';

export const VetDashboardView: React.FC = () => {
  const { userProfile } = useAuthStore();
  const { currentLanguage, t } = useLanguageStore();
  const setActiveTab = useNavigationStore((state) => state.setActiveTab);

  const [clinicalCases, setClinicalCases] = useState<ClinicalCase[]>([]);
  const [selectedCaseForDoctor, setSelectedCaseForDoctor] = useState<ClinicalCase | null>(null);
  const [selectedCaseForAIReport, setSelectedCaseForAIReport] = useState<ClinicalCase | null>(null);
  const [isDoctorActionModalOpen, setIsDoctorActionModalOpen] = useState(false);
  const [isAIReportModalOpen, setIsAIReportModalOpen] = useState(false);
  const [isVideoConsultOpen, setIsVideoConsultOpen] = useState(false);
  const [activeConsultCase, setActiveConsultCase] = useState<ClinicalCase | null>(null);
  const [animalList, setAnimalList] = useState<any[]>([]);
  const [requisitions, setRequisitions] = useState<any[]>([]);

  const loadDashboardData = async () => {
    try {
      const fetched = await caseService.getDoctorCases();
      setClinicalCases(fetched || []);
    } catch (err) {
      console.warn('Failed to load vet clinical cases:', err);
    }
    try {
      const animals = await animalService.getAllAnimals();
      setAnimalList(animals || []);
    } catch {
      // ignore
    }
    try {
      const reqs = await labService.getRequisitions();
      setRequisitions(reqs || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

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

  const pendingCasesCount = clinicalCases.filter((c) => c.status === 'AWAITING_DOCTOR').length;
  const vaccinatedCount = animalList.filter((a) => a.vaccinationStatus === 'UP_TO_DATE').length;
  const inTransitCount = requisitions.filter((r) => r.status === 'IN_TRANSIT').length;
  const teleconsultCount = clinicalCases.filter((c) => c.status === 'IN_CONSULTATION').length;
  const criticalCases = clinicalCases.filter((c) => c.urgency === 'CRITICAL');

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
              {currentLanguage === 'en' ? userProfile.name : userProfile.nameMarathi} • {t('doctorDutyJurisdiction', 'District Veterinary Network')}
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-1 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold">
          VCI Verified
        </span>
      </div>

      {/* Urgent Clinical Alert Card (Only if critical cases exist) */}
      {criticalCases.length > 0 && (
        <div className="bg-gradient-to-r from-rose-50 to-amber-50 dark:from-rose-950/40 dark:to-amber-950/40 border border-rose-300 dark:border-rose-800 rounded-2xl p-3.5 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className={`text-xs font-bold text-rose-950 dark:text-rose-200 flex items-center justify-between ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
              <span>{t('urgentAttentionTitle', 'Urgent Clinical Attention Required')}</span>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-600 text-white">
                {criticalCases[0].syndrome_code}
              </span>
            </h3>
            <p className={`text-[11px] text-rose-800 dark:text-rose-300 mt-1 leading-relaxed ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
              {currentLanguage === 'en'
                ? `Immediate on-field clinical inspection required for ${criticalCases.length} critical cases.`
                : `${criticalCases.length} तातडीच्या रुग्णांची प्रत्यक्ष पाहणी आवश्यक आहे.`}
            </p>
          </div>
        </div>
      )}

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
            <CountUpTicker end={pendingCasesCount} durationMs={900} />
            <span className="text-[11px] font-normal text-slate-400">cases</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className={`text-[11px] font-medium ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
              {t('vaccinatedToday', 'Vaccinated Herd')}
            </span>
            <Syringe className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
            <CountUpTicker end={vaccinatedCount} durationMs={900} />
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
            <CountUpTicker end={inTransitCount} durationMs={900} />
            <span className="text-[11px] font-normal text-slate-400">samples</span>
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
            <CountUpTicker end={teleconsultCount} durationMs={900} />
            <span className="text-[11px] font-normal text-slate-400">active</span>
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

        {clinicalCases.length === 0 ? (
          <div className="p-8 text-center space-y-2 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <Activity className="w-8 h-8 mx-auto text-slate-400 animate-pulse" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {currentLanguage === 'en' ? 'No pending patient cases' : 'सध्या कोणतेही प्रलंबित रुग्ण नाहीत'}
            </p>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              {currentLanguage === 'en'
                ? 'When a farmer submits a syndromic case report, it will appear here in real-time for video consultation & prescription.'
                : 'शेतकऱ्याने अहवाल पाठवताच येथे तात्काळ केस दाखल होईल.'}
            </p>
          </div>
        ) : (
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
                        {caseItem.syndrome_code} / {localizeSyndromeName(caseItem.syndrome_code, caseItem.syndrome_name, currentLanguage)}
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
                        {localizeCaseStatus(caseItem.status, currentLanguage)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {localizeSpecies(caseItem.species, currentLanguage)} • {currentLanguage === 'en' ? caseItem.farmer_name.replace(/[\u0900-\u097F()]/g, '').trim() || caseItem.farmer_name : caseItem.farmer_name} ({caseItem.farmer_phone_masked}) • {caseItem.village_name}
                    </p>
                  </div>
                </div>

                {/* AI Differential & Media Thumbnail Preview */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-[11px]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span className="truncate font-bold text-purple-950 dark:text-purple-200">
                      {caseItem.ai_differential || caseItem.syndrome_name}
                    </span>
                    {caseItem.clinical_confidence && (
                      <span className="text-[9px] font-mono font-bold bg-purple-200 dark:bg-purple-900/80 px-1.5 py-0.2 rounded text-purple-900 dark:text-purple-200 shrink-0">
                        {Math.round(caseItem.clinical_confidence * 100)}% Match
                      </span>
                    )}
                  </div>
                  {caseItem.photo_url && (
                    <img
                      src={caseItem.photo_url}
                      alt="Lesion thumbnail"
                      className="w-8 h-8 rounded-lg object-cover border border-purple-200 dark:border-purple-800 shrink-0 cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => {
                        setSelectedCaseForAIReport(caseItem);
                        setIsAIReportModalOpen(true);
                      }}
                      title="Click to inspect lesion photo"
                    />
                  )}
                </div>

                {/* Visit ETA or Prescription preview if doctor updated */}
                {caseItem.visit_eta && (
                  <div className="text-[11px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-xl flex items-center gap-1 font-semibold">
                    <Calendar className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                    <span>
                      {currentLanguage === 'en' ? 'Visit ETA: ' : currentLanguage === 'hi' ? 'भेंट समय: ' : 'भेट वेळ: '}
                      {localizeVisitEta(caseItem.visit_eta, currentLanguage)}
                    </span>
                  </div>
                )}

                {caseItem.prescription && (
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-xl flex items-center gap-1 font-medium truncate">
                    <Pill className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    <span className="truncate">Rx: {localizePrescription(caseItem.prescription, currentLanguage)}</span>
                  </div>
                )}

                {/* Actions: AI Report, Review & Rx, Video Call, Phone Call */}
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-200 dark:border-slate-700/60 text-xs gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        hapticsService.hapticLight();
                        setSelectedCaseForAIReport(caseItem);
                        setIsAIReportModalOpen(true);
                      }}
                      className="field-touch-target px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition-transform active:scale-95"
                      title="Inspect full AI multimodal diagnostic report"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>{currentLanguage === 'en' ? 'AI Report' : 'एआय अहवाल'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        hapticsService.hapticLight();
                        setSelectedCaseForDoctor(caseItem);
                        setIsDoctorActionModalOpen(true);
                      }}
                      className="field-touch-target px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition-transform active:scale-95"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>
                        {currentLanguage === 'en'
                          ? 'Review & Rx'
                          : currentLanguage === 'hi'
                          ? 'जांच व Rx'
                          : 'तपासणी व Rx'}
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        hapticsService.hapticLight();
                        handleStartVideoConsult(caseItem);
                      }}
                      className="field-touch-target px-2 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-transform active:scale-95"
                      title="Video Call Farmer"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{currentLanguage === 'en' ? 'Video' : 'व्हिडिओ'}</span>
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
        )}
      </div>

      {/* Taluka Ring Vaccination Progress (Real data calculated from registered herd) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold text-slate-900 dark:text-white ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
            {t('talukaRingVacProgress', 'Jurisdiction Vaccination Coverage')}
          </span>
          <span className="text-xs font-bold text-emerald-600 font-mono">
            {vaccinatedCount} / {animalList.length || 1} ({animalList.length > 0 ? Math.round((vaccinatedCount / animalList.length) * 100) : 0}%)
          </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-700"
            style={{ width: `${animalList.length > 0 ? Math.min(100, Math.round((vaccinatedCount / animalList.length) * 100)) : 0}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-400 flex items-center justify-between">
          <span>{userProfile.district || 'District'} Field Area</span>
          <span>{Math.max(0, animalList.length - vaccinatedCount)} cattle pending</span>
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
        caseId={activeConsultCase?.id || ''}
        callerRole="doctor"
        targetPartyName={activeConsultCase?.farmer_name || ''}
        targetPartyPhone={activeConsultCase?.farmer_phone_masked || ''}
        animalTag={activeConsultCase?.animal_tag || ''}
        animalSpecies={activeConsultCase?.species || ''}
        suspectedCondition={activeConsultCase?.syndrome_name || ''}
      />

      {/* AI Diagnostic Report Dossier Modal */}
      <AIDiagnosticReportModal
        isOpen={isAIReportModalOpen}
        onClose={() => {
          setIsAIReportModalOpen(false);
          setSelectedCaseForAIReport(null);
        }}
        caseItem={selectedCaseForAIReport}
        onApplyPrescription={(recommendedRx) => {
          if (selectedCaseForAIReport) {
            setSelectedCaseForDoctor({
              ...selectedCaseForAIReport,
              prescription: recommendedRx,
            });
            setIsAIReportModalOpen(false);
            setIsDoctorActionModalOpen(true);
          }
        }}
        onStartVideoConsult={(item) => {
          setIsAIReportModalOpen(false);
          handleStartVideoConsult(item);
        }}
        onConfirmDiagnosis={(item) => {
          handleCaseUpdated({
            ...item,
            status: item.status === 'AWAITING_DOCTOR' ? 'IN_CONSULTATION' : item.status,
          });
        }}
      />
    </div>
  );
};

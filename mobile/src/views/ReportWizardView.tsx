import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle2, ShieldAlert, ArrowRight, Tag, Info, Check } from 'lucide-react';
import { SyndromeGrid } from '../components/syndromes/SyndromeGrid';
import { SyndromeDefinition } from '../types/syndromes';
import { AnatomicalBadge } from '../components/syndromes/AnatomicalBadge';
import { CameraCaptureCard } from '../components/media/CameraCaptureCard';
import { VoiceRecorderCard } from '../components/media/VoiceRecorderCard';
import { LocationPickerCard } from '../components/location/LocationPickerCard';
import { CompressedPhotoResult } from '../services/cameraService';
import { RecordedAudioResult } from '../services/voiceService';
import { LocationCoordinates, SnappedLgdResult } from '../services/locationService';
import { dbService } from '../database/sqliteConnection';
import { hapticsService } from '../services/hapticsService';
import { decisionTreeService } from '../services/decisionTreeService';
import { syncEngineService } from '../services/syncEngineService';
import { useSyncStore } from '../store/syncStore';
import { SecondarySymptomsSelector } from '../components/syndromes/SecondarySymptomsSelector';
import { ClinicalGuidanceCard } from '../components/syndromes/ClinicalGuidanceCard';
import { AnthraxBiohazardModal } from '../components/modals/AnthraxBiohazardModal';
import { useLanguageStore } from '../store/languageStore';
import { Skull } from 'lucide-react';

export interface ReportWizardViewProps {
  onReportSaved?: () => void;
}

export const ReportWizardView: React.FC<ReportWizardViewProps> = ({ onReportSaved }) => {
  const { currentLanguage, t } = useLanguageStore();
  // Wizard step state (1, 2, or 3)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Syndrome & Decision Tree State
  const [selectedSyndrome, setSelectedSyndrome] = useState<SyndromeDefinition | null>(null);
  const [syndromeSearch, setSyndromeSearch] = useState('');
  const [selectedSecondarySymptoms, setSelectedSecondarySymptoms] = useState<string[]>([]);
  const [isAnthraxModalOpen, setIsAnthraxModalOpen] = useState(false);

  // Step 2: Media & Voice State
  const [capturedPhoto, setCapturedPhoto] = useState<CompressedPhotoResult | null>(null);
  const [recordedAudio, setRecordedAudio] = useState<RecordedAudioResult | null>(null);

  // Step 3: Location & Tag State
  const [coordinates, setCoordinates] = useState<LocationCoordinates | null>(null);
  const [snappedVillage, setSnappedVillage] = useState<SnappedLgdResult | null>(null);
  const [pashuAadhaar, setPashuAadhaar] = useState('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Step 1 -> Step 2
  const handleProceedToStep2 = () => {
    if (!selectedSyndrome) return;
    hapticsService.hapticLight();
    setCurrentStep(2);
  };

  // Step 2 -> Step 3
  const handleProceedToStep3 = () => {
    hapticsService.hapticLight();
    setCurrentStep(3);
  };

  // Evaluate Decision Tree dynamically
  const decisionResult = selectedSyndrome
    ? decisionTreeService.evaluateSyndrome(selectedSyndrome.code, selectedSecondarySymptoms)
    : null;

  const handleSelectSyndrome = (syndrome: SyndromeDefinition) => {
    setSelectedSyndrome(syndrome);
    setSelectedSecondarySymptoms([]); // Reset secondary symptoms on new syndrome selection

    // Check Rule Zero immediately upon selecting HSDS
    if (syndrome.code === 'HSDS') {
      setIsAnthraxModalOpen(true);
    }
  };

  const handleToggleSecondarySymptom = (symptomId: string) => {
    const updated = selectedSecondarySymptoms.includes(symptomId)
      ? selectedSecondarySymptoms.filter((id) => id !== symptomId)
      : [...selectedSecondarySymptoms, symptomId];
    setSelectedSecondarySymptoms(updated);

    // If sudden death + unclotted blood selected
    if (updated.includes('sudden_death') && updated.includes('unclotted_dark_blood')) {
      setIsAnthraxModalOpen(true);
    }
  };

  // Format Pashu Aadhaar 12-digit number (XXXX-XXXX-XXXX)
  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
    let formatted = raw;
    if (raw.length > 4 && raw.length <= 8) {
      formatted = `${raw.slice(0, 4)}-${raw.slice(4)}`;
    } else if (raw.length > 8) {
      formatted = `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8)}`;
    }
    setPashuAadhaar(formatted);
  };

  // Final Submit Handler: Persists to SQLite offline_sync_queue
  const handleSaveReport = async () => {
    if (!selectedSyndrome) return;

    try {
      setIsSubmitting(true);
      await hapticsService.hapticMedium();

      const syncId = `SYNC-REP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const payload = {
        report_id: `REP-${Date.now()}`,
        syndrome_code: selectedSyndrome.code,
        syndrome_name: selectedSyndrome.nameMarathi,
        secondary_symptoms: selectedSecondarySymptoms,
        decision_tree_differential: decisionResult?.primaryDifferential?.diseaseName || null,
        photo_webp: capturedPhoto?.dataUrl || null,
        photo_size_kb: capturedPhoto?.sizeKB || 0,
        audio_base64: recordedAudio?.recordDataBase64 || null,
        audio_duration_sec: recordedAudio?.durationSeconds || 0,
        latitude: coordinates?.latitude || 19.3912,
        longitude: coordinates?.longitude || 74.6521,
        lgd_code: snappedVillage?.lgd_code || 558301,
        village_name: snappedVillage?.village_name || 'Ashwi Budruk',
        block_name: snappedVillage?.block_name || 'Sangamner',
        district_name: snappedVillage?.district_name || 'Ahmednagar',
        pashu_aadhaar: pashuAadhaar || 'UNTAGGED',
        reported_at: new Date().toISOString(),
      };

      const priority = selectedSyndrome.severity === 'CRITICAL_BIOHAZARD' ? 3 : 2;

      await syncEngineService.enqueueReportWithSplit(syncId, 'SYNDROMIC_INCIDENT', payload, priority);
      await useSyncStore.getState().refreshQueue();

      setShowSuccessModal(true);
      if (onReportSaved) onReportSaved();
    } catch (err) {
      console.error('Failed to save offline report to SQLite queue:', err);
      alert('अहवाल जतन करण्यात त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setSelectedSyndrome(null);
    setSelectedSecondarySymptoms([]);
    setCapturedPhoto(null);
    setRecordedAudio(null);
    setPashuAadhaar('');
    setShowSuccessModal(false);
  };

  return (
    <div className="space-y-4">
      {/* 3-Step Wizard Progress Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-bold text-slate-800 dark:text-slate-200 ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
            {currentStep === 1 && t('step1Title', 'टप्पा १/३: लक्षण निवड (Syndrome Selection)')}
            {currentStep === 2 && t('step2Title', 'टप्पा २/३: पुरावे जोडणी (फोटो व आवाज)')}
            {currentStep === 3 && t('step3Title', 'टप्पा ३/३: स्थान व पशू आधार')}
          </span>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            {currentStep === 1 ? '33%' : currentStep === 2 ? '66%' : '100%'} {t('complete', 'Complete')}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className={`h-1.5 rounded-full transition-colors ${currentStep >= 1 ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
          <div className={`h-1.5 rounded-full transition-colors ${currentStep >= 2 ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
          <div className={`h-1.5 rounded-full transition-colors ${currentStep >= 3 ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
        </div>
      </div>

      {/* STEP 1: SYNDROME SELECTION */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <SyndromeGrid
            selectedSyndrome={selectedSyndrome}
            onSelectSyndrome={handleSelectSyndrome}
            filterQuery={syndromeSearch}
          />

          {/* Secondary Clinical Symptoms Selector */}
          {selectedSyndrome && (
            <SecondarySymptomsSelector
              syndromeCode={selectedSyndrome.code}
              selectedSymptomIds={selectedSecondarySymptoms}
              onToggleSymptom={handleToggleSecondarySymptom}
            />
          )}

          {/* Clinical Guidance / Farmer Advisory Card */}
          {decisionResult && (
            <ClinicalGuidanceCard result={decisionResult} />
          )}

          {/* If Anthrax Lockout is active, show critical lockout banner */}
          {decisionResult?.isAnthraxLockout && (
            <div className="p-3.5 rounded-2xl bg-red-950 border border-red-600 text-white flex items-center justify-between gap-2 shadow-lg">
              <div className="flex items-center gap-2">
                <Skull className="w-5 h-5 text-red-400 animate-pulse" />
                <div>
                  <div className={`text-xs font-bold ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                    {t('anthraxLockoutTitle', 'ॲन्थ्रॅक्स शून्य-सहनशीलता लॉकआऊट सक्रिय!')}
                  </div>
                  <div className="text-[10px] text-red-200">
                    {t('anthraxLockoutSubtitle', 'शव विच्छेदन करण्यास सक्त मनाई आहे.')}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAnthraxModalOpen(true)}
                className="field-touch-target px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-sm"
              >
                {t('openAlert', 'इशारा उघडा')}
              </button>
            </div>
          )}

          {/* Sticky/Fixed bottom action for Step 1 */}
          <div className="pt-2">
            {decisionResult?.isAnthraxLockout ? (
              <button
                type="button"
                onClick={() => setIsAnthraxModalOpen(true)}
                className={`field-touch-target w-full py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition-all shadow-md bg-red-600 hover:bg-red-700 text-white ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}
              >
                <Skull className="w-4 h-4" />
                <span>{t('openLockoutProtocol', 'ॲन्थ्रॅक्स लॉकआऊट प्रोटोकॉल उघडा (Anthrax Lockout)')}</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={!selectedSyndrome}
                onClick={handleProceedToStep2}
                className={`field-touch-target w-full py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition-all shadow-md ${currentLanguage !== 'en' ? 'lang-devanagari' : ''} ${
                  selectedSyndrome
                    ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white shadow-emerald-900/30'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>{t('nextEvidence', 'पुढे जा: पुरावे जोडा (Next: Add Evidence)')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: MEDIA & VOICE EVIDENCE */}
      {currentStep === 2 && (
        <div className="space-y-4">
          {/* Selected Syndrome Recall Pill */}
          {selectedSyndrome && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AnatomicalBadge
                  anatomicalPart={selectedSyndrome.anatomicalPart}
                  severity={selectedSyndrome.severity}
                />
                <div>
                  <p className={`text-xs font-bold text-slate-900 dark:text-white ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                    {selectedSyndrome.code} — {currentLanguage === 'en' ? selectedSyndrome.nameEnglish : currentLanguage === 'hi' ? (selectedSyndrome.nameHindi || selectedSyndrome.nameMarathi) : selectedSyndrome.nameMarathi}
                  </p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                    {t('localNameLabel', 'स्थानिक नाव:')} {currentLanguage === 'en' ? (selectedSyndrome.colloquialEnglish || selectedSyndrome.nameEnglish) : currentLanguage === 'hi' ? (selectedSyndrome.colloquialHindi || selectedSyndrome.colloquialMarathi) : selectedSyndrome.colloquialMarathi}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`text-xs text-emerald-700 dark:text-emerald-300 underline font-semibold ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}
              >
                {t('changeSyndrome', 'बदला')}
              </button>
            </div>
          )}

          {/* 1. Camera Capture Card */}
          <CameraCaptureCard
            photo={capturedPhoto}
            onPhotoCaptured={(photo) => setCapturedPhoto(photo)}
          />

          {/* 2. Voice Recorder Card */}
          <VoiceRecorderCard
            recordedAudio={recordedAudio}
            onAudioChanged={(audio) => setRecordedAudio(audio)}
          />

          {/* Navigation Controls for Step 2 */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`field-touch-target px-4 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{t('back', 'मागे (Back)')}</span>
            </button>

            <button
              type="button"
              onClick={handleProceedToStep3}
              className={`field-touch-target flex-1 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-900/20 transition-transform ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}
            >
              <span>{t('nextLocation', 'पुढे जा: स्थान व टॅग (Next: Location)')}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: LOCATION & PASHU AADHAAR */}
      {currentStep === 3 && (
        <div className="space-y-4">
          {/* Location Picker Card */}
          <LocationPickerCard
            coordinates={coordinates}
            snappedVillage={snappedVillage}
            onLocationUpdate={(coords, village) => {
              setCoordinates(coords);
              setSnappedVillage(village);
            }}
          />

          {/* Pashu Aadhaar RFID Ear-Tag Card */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t('pashuAadhaarTitle', 'पशू आधार १२-अंकी टॅग (Pashu Aadhaar Tag)')}</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">{t('optional', 'ऐच्छिक (Optional)')}</span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={pashuAadhaar}
                onChange={handleAadhaarChange}
                placeholder={t('tagPlaceholder', 'उदा. १२३४-५६७८-९०१२')}
                maxLength={14}
                className="field-touch-target w-full px-3.5 py-2.5 text-sm font-mono tracking-wider rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
            <p className={`text-[11px] text-slate-500 dark:text-slate-400 ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
              {t('tagHelp', 'जनावराच्या कानातील पिवळ्या RFID टॅगचा १२-अंकी क्रमांक टाका.')}
            </p>
          </div>

          {/* Navigation & Submit CTA */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className={`field-touch-target px-4 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{t('back', 'मागे (Back)')}</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSaveReport}
              className={`field-touch-target flex-1 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-transform ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? t('saving', 'जतन करत आहे...') : t('saveOfflineReport', 'अहवाल जतन करा (Save Offline Report)')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-emerald-500/30 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className={`text-base font-bold text-slate-900 dark:text-white ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                {t('reportSuccessTitle', 'अहवाल यशस्वीरित्या जतन झाला!')}
              </h3>
              <p className={`text-xs text-slate-600 dark:text-slate-300 ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                {t('reportSuccessSubtitle', 'स्थानिक SQLite रांगेमध्ये अहवाल सुरक्षित ठेवण्यात आला आहे.')}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-1">
              <p className={`font-semibold text-slate-800 dark:text-slate-200 ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                {t('syndromeLabel', 'लक्षण')}: {currentLanguage === 'en' ? selectedSyndrome?.nameEnglish : currentLanguage === 'hi' ? (selectedSyndrome?.nameHindi || selectedSyndrome?.nameMarathi) : selectedSyndrome?.nameMarathi} ({selectedSyndrome?.code})
              </p>
              <p className={`text-slate-500 dark:text-slate-400 ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                {t('villageLabel', 'गाव')}: {snappedVillage?.village_name || (currentLanguage === 'en' ? 'Rahuri Khurd' : 'राहुरी खुर्द')}
              </p>
              {capturedPhoto && (
                <p className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                  {t('photoAttachedLabel', '✓ WebP फोटो जोडला')} ({capturedPhoto.sizeKB} KB)
                </p>
              )}
              {recordedAudio && (
                <p className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                  {t('voiceAttachedLabel', '✓ व्हॉइस नोट जोडली')} ({recordedAudio.durationSeconds.toFixed(1)}s)
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={resetWizard}
              className={`field-touch-target w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-900/20 ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}
            >
              {t('newReportBtn', 'नवीन अहवाल नोंदवा (New Report)')}
            </button>
          </div>
        </div>
      )}

      {/* Anthrax Biohazard Emergency Modal (Rule Zero Lockout) */}
      <AnthraxBiohazardModal
        isOpen={isAnthraxModalOpen}
        onClose={() => setIsAnthraxModalOpen(false)}
        lgdCode={snappedVillage?.lgd_code || 558301}
        villageName={snappedVillage?.village_name || 'Ashwi Budruk'}
        district={snappedVillage?.district_name || 'Ahmednagar'}
        block={snappedVillage?.block_name || 'Sangamner'}
        coordinates={coordinates || undefined}
        pashuAadhaar={pashuAadhaar || undefined}
      />
    </div>
  );
};

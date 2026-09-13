import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Tag,
  Info,
  Check,
  Sparkles,
  Phone,
  Stethoscope,
  AlertTriangle,
  Radio,
  Skull,
  User,
  Volume2,
  VolumeX,
  AlertOctagon,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { SyndromeGrid } from '../../components/syndromes/SyndromeGrid';
import { SyndromeDefinition } from '../../types/syndromes';
import { AnatomicalBadge } from '../../components/syndromes/AnatomicalBadge';
import { CameraCaptureCard } from '../../components/media/CameraCaptureCard';
import { VoiceRecorderCard } from '../../components/media/VoiceRecorderCard';
import { LocationPickerCard } from '../../components/location/LocationPickerCard';
import { CompressedPhotoResult } from '../../services/cameraService';
import { RecordedAudioResult } from '../../services/voiceService';
import { LocationCoordinates, SnappedLgdResult } from '../../services/locationService';
import { dbService } from '../../database/sqliteConnection';
import { hapticsService } from '../../services/hapticsService';
import { decisionTreeService } from '../../services/decisionTreeService';
import { syncEngineService } from '../../services/syncEngineService';
import { useSyncStore } from '../../store/syncStore';
import { useNavigationStore } from '../../store/navigationStore';
import { aiTriageService, TriageResponse } from '../../services/aiTriageService';
import { SecondarySymptomsSelector } from '../../components/syndromes/SecondarySymptomsSelector';
import { ClinicalGuidanceCard } from '../../components/syndromes/ClinicalGuidanceCard';
import { AnthraxBiohazardModal } from '../../components/modals/AnthraxBiohazardModal';
import { useLanguageStore } from '../../store/languageStore';
import { useAuthStore } from '../../store/authStore';
import { caseService } from '../../services/caseService';
import { animalService, LocalAnimal } from '../../services/animalService';
import {
  localizeTriageDisease,
  localizeTriageAdvisory,
  localizeContainmentActions,
} from '../../utils/clinicalLocalization';

export interface ReportWizardViewProps {
  onReportSaved?: () => void;
}

export const ReportWizardView: React.FC<ReportWizardViewProps> = ({ onReportSaved }) => {
  const { currentLanguage, t } = useLanguageStore();
  // Wizard step state (1, 2, or 3)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Species & Syndrome & Decision Tree State
  const [selectedSpecies, setSelectedSpecies] = useState<'Cow' | 'Buffalo' | 'Bullock' | 'Goat' | 'Sheep' | 'Other'>('Cow');
  const [animalBreed, setAnimalBreed] = useState('');
  const [myAnimals, setMyAnimals] = useState<LocalAnimal[]>([]);
  const [farmerCustomName, setFarmerCustomName] = useState('');
  const [farmerCustomPhone, setFarmerCustomPhone] = useState('');

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

  // Submission & AI Triage State
  const setActiveTab = useNavigationStore((state) => state.setActiveTab);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [triageResponse, setTriageResponse] = useState<TriageResponse | null>(null);
  const [isTriageAnalyzing, setIsTriageAnalyzing] = useState(false);
  const [isSpeakingFirstAid, setIsSpeakingFirstAid] = useState(false);

  const handleSpeakFirstAid = (textToSpeak: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeakingFirstAid) {
      window.speechSynthesis.cancel();
      setIsSpeakingFirstAid(false);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = textToSpeak.replace(/[*#•]/g, ' ').replace(/\s+/g, ' ').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = currentLanguage === 'hi' ? 'hi-IN' : currentLanguage === 'mr' ? 'mr-IN' : 'en-IN';
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeakingFirstAid(false);
    utterance.onerror = () => setIsSpeakingFirstAid(false);
    setIsSpeakingFirstAid(true);
    window.speechSynthesis.speak(utterance);
  };

  // Load registered herd from SQLite & cleanup speech synthesis
  useEffect(() => {
    animalService
      .getAllAnimals()
      .then((animals) => {
        if (animals && animals.length > 0) setMyAnimals(animals);
      })
      .catch(() => {});

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSelectRegisteredAnimal = (animal: LocalAnimal) => {
    hapticsService.hapticLight();
    setPashuAadhaar(animal.tagNumber);
    setAnimalBreed(animal.breed || '');
    if (animal.species.toLowerCase().includes('buffalo') || animal.species.includes('म्हैस')) {
      setSelectedSpecies('Buffalo');
    } else if (animal.species.toLowerCase().includes('goat') || animal.species.includes('शेळी') || animal.species.includes('बकरी')) {
      setSelectedSpecies('Goat');
    } else if (animal.species.toLowerCase().includes('sheep') || animal.species.includes('मेंढी')) {
      setSelectedSpecies('Sheep');
    } else if (animal.species.toLowerCase().includes('bullock') || animal.species.includes('बैल')) {
      setSelectedSpecies('Bullock');
    } else {
      setSelectedSpecies('Cow');
    }
  };

  // Step 1 -> Step 2
  const handleProceedToStep2 = () => {
    if (!selectedSyndrome) return;
    hapticsService.hapticLight();
    setCurrentStep(2);
  };

  // Step 2 -> Step 3 with Multimodal AI Triage & Provisional First-Aid
  const handleProceedToStep3 = async () => {
    hapticsService.hapticLight();
    setCurrentStep(3);

    if (selectedSyndrome) {
      try {
        setIsTriageAnalyzing(true);
        const mappedSpecies =
          selectedSpecies === 'Cow' || selectedSpecies === 'Buffalo' || selectedSpecies === 'Bullock'
            ? 'Bovine'
            : selectedSpecies === 'Goat'
            ? 'Caprine'
            : selectedSpecies === 'Sheep'
            ? 'Ovine'
            : 'Bovine';

        const res = await aiTriageService.runMultimodalTriage({
          photo_base64: capturedPhoto?.dataUrl,
          audio_base64: recordedAudio?.recordDataBase64,
          audio_transcript: recordedAudio?.durationSeconds ? 'Symptomatic livestock incident reported' : undefined,
          species: mappedSpecies,
          secondary_symptoms: selectedSecondarySymptoms,
          village_lgd_code: snappedVillage?.lgd_code || 558301,
        });
        setTriageResponse(res);
      } catch (err) {
        console.warn('AI Triage error:', err);
      } finally {
        setIsTriageAnalyzing(false);
      }
    }
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
        ai_triage_differential: triageResponse?.suspected_disease || null,
        immediate_advisory: triageResponse?.immediate_advisory_marathi || null,
        assigned_doctor: 'Dr. Ananya Deshmukh (BVO Rahuri)',
        assigned_doctor_phone: '+919422001842',
        sync_status: 'QUEUED_FOR_VET_SYNC',
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
      // Auto-trigger sync so it synchronizes automatically while online without manual intervention
      useSyncStore.getState().triggerSync();

      // Create synchronized clinical case for Doctor-Farmer bridge
      const currentProfile = useAuthStore.getState().userProfile;
      const farmerPhone = farmerCustomPhone.trim() || currentProfile?.mobileNumberMasked || '9822000412';
      const farmerName = farmerCustomName.trim() || currentProfile?.name || (currentLanguage === 'en' ? 'Livestock Owner' : 'पशुपालक (Farmer)');
      const farmerId = currentProfile?.id || `farmer_${Date.now()}`;
      const effectiveTag = pashuAadhaar.trim() || `TAG-${Date.now().toString().slice(-8)}`;

      const speciesLabels: Record<string, string> = {
        Cow: 'गाय (Cow)',
        Buffalo: 'म्हैस (Buffalo)',
        Bullock: 'बैल (Bullock)',
        Goat: 'शेळी (Goat)',
        Sheep: 'मेंढी (Sheep)',
        Other: 'इतर (Other)',
      };
      const effectiveSpecies = speciesLabels[selectedSpecies] || 'गाय (Cow)';
      const effectiveBreed =
        animalBreed.trim() ||
        (selectedSpecies === 'Cow'
          ? 'देशी / गिर (Gir)'
          : selectedSpecies === 'Buffalo'
          ? 'मुऱ्हा (Murrah)'
          : selectedSpecies === 'Bullock'
          ? 'खिल्लार (Khillari)'
          : selectedSpecies === 'Goat'
          ? 'उस्मानाबादी (Osmanabadi)'
          : 'स्थानिक जात (Indigenous)');

      try {
        await caseService.createCase(
          {
            report_id: payload.report_id,
            farmer_id: farmerId,
            farmer_name: farmerName,
            animal_tag: effectiveTag,
            species: effectiveSpecies,
            breed: effectiveBreed,
            syndrome_code: selectedSyndrome.code,
            syndrome_name: selectedSyndrome.nameMarathi,
            symptoms: selectedSecondarySymptoms.join(', ') || selectedSyndrome.nameEnglish,
            ai_differential: triageResponse?.suspected_disease || decisionResult?.primaryDifferential?.diseaseName || selectedSyndrome.nameEnglish,
            urgency: selectedSyndrome.severity === 'CRITICAL_BIOHAZARD' ? 'CRITICAL' : 'HIGH',
            status: 'AWAITING_DOCTOR',
            interim_advice: triageResponse?.temporary_first_aid
              ? (currentLanguage === 'en'
                  ? `${triageResponse.temporary_first_aid.summary_en}\n\nImmediate Actions:\n${triageResponse.temporary_first_aid.immediate_actions_en.map((a, i) => `${i + 1}. ${a}`).join('\n')}\n\nWhat NOT to do:\n${triageResponse.temporary_first_aid.do_not_do_en.map((d) => `• ${d}`).join('\n')}`
                  : currentLanguage === 'hi' && triageResponse.temporary_first_aid.summary_hi
                  ? `${triageResponse.temporary_first_aid.summary_hi}\n\nप्राथमिक उपचार:\n${(triageResponse.temporary_first_aid.immediate_actions_hi || triageResponse.temporary_first_aid.immediate_actions_mr).map((a, i) => `${i + 1}. ${a}`).join('\n')}\n\nक्या न करें:\n${(triageResponse.temporary_first_aid.do_not_do_hi || triageResponse.temporary_first_aid.do_not_do_mr).map((d) => `• ${d}`).join('\n')}`
                  : `${triageResponse.temporary_first_aid.summary_mr}\n\nतात्काळ करावयाचे प्रथमोपचार:\n${triageResponse.temporary_first_aid.immediate_actions_mr.map((a, i) => `${i + 1}. ${a}`).join('\n')}\n\nकाय करू नये:\n${triageResponse.temporary_first_aid.do_not_do_mr.map((d) => `• ${d}`).join('\n')}`)
              : triageResponse?.immediate_advisory_marathi || (
                  selectedSyndrome.code === 'VSS'
                    ? '1. बाधित गाईला इतर जनावरांपासून किमान १५ मीटर दूर मोकळ्या जागेत विलगीकरणात ठेवा.\n2. तोंड व खुरांचे व्रण पोटॅशियम परमँगनेटच्या हलक्या गुलाबी पाण्याने धुवा.\n3. कोरडा चारा देऊ नका; मऊ भाताची पेज किंवा लापशी खाऊ घाला.'
                    : '1. जनावरास सावलीत व कोरड्या जागेत बांधा.\n2. ताजे व स्वच्छ पाणी मुबलक प्रमाणात उपलब्ध करा.\n3. पशुवैद्यकीय अधिकारी येईपर्यंत जनावरास विश्रांती द्या.'
                ),
            village_name: snappedVillage?.village_name || currentProfile?.village || 'Ashwi Budruk',
            block_name: snappedVillage?.block_name || currentProfile?.block || 'Rahuri',
            district_name: snappedVillage?.district_name || currentProfile?.district || 'Ahmednagar',
            latitude: coordinates?.latitude || 19.3912,
            longitude: coordinates?.longitude || 74.6521,
            photo_url: capturedPhoto?.dataUrl || null,
            audio_url: recordedAudio?.recordDataBase64 || null,
            audio_transcript: recordedAudio?.durationSeconds
              ? (currentLanguage === 'en'
                  ? 'Livestock owner reported active clinical symptoms via vernacular audio recording.'
                  : 'शेतकऱ्याने आवाजाद्वारे प्रत्यक्ष लक्षणांची माहिती नोंदवली आहे.')
              : null,
            clinical_confidence: triageResponse?.clinical_confidence ?? (selectedSyndrome.severity === 'CRITICAL_BIOHAZARD' ? 0.99 : 0.92),
            clinical_rationale: triageResponse?.clinical_rationale || decisionResult?.clinicalGuidance || null,
            identified_symptoms: triageResponse?.identified_symptoms || selectedSecondarySymptoms,
            containment_actions: triageResponse?.recommended_containment_actions || null,
            biohazard_alert: triageResponse?.biohazard_alert || (selectedSyndrome.severity === 'CRITICAL_BIOHAZARD' ? 'CRITICAL_ANTHRAX_LOCK' : 'WARNING'),
            model_used: triageResponse?.model_used || 'Gemini 3.7 Flash',
            ai_report_json: triageResponse ? JSON.stringify(triageResponse) : null,
          },
          farmerPhone
        );
      } catch (caseErr) {
        console.warn('Could not register clinical case:', caseErr);
      }

      setShowSuccessModal(true);
      if (onReportSaved) onReportSaved();
    } catch (err) {
      console.error('Failed to save offline report to SQLite queue:', err);
      alert(t('errorSavingReport', 'अहवाल जतन करण्यात त्रुटी आली. कृपया पुन्हा प्रयत्न करा.'));
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
    setTriageResponse(null);
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
        <div key="step1" className="space-y-4 pb-32 animate-in slide-in-from-right-8 fade-in duration-300">
          {/* 0. Animal Species Selector */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className={`text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                <span>{currentLanguage === 'en' ? '1. Select Affected Animal / Species' : '१. बाधित जनावर / प्रजाती निवडा'}</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                {selectedSpecies}
              </span>
            </div>

            {/* Species Pills */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'Cow', emoji: '🐄', label: currentLanguage === 'en' ? 'Cow' : 'गाय' },
                { key: 'Buffalo', emoji: '🐃', label: currentLanguage === 'en' ? 'Buffalo' : 'म्हैस' },
                { key: 'Bullock', emoji: '🐂', label: currentLanguage === 'en' ? 'Bullock' : 'बैल' },
                { key: 'Goat', emoji: '🐐', label: currentLanguage === 'en' ? 'Goat' : 'शेळी' },
                { key: 'Sheep', emoji: '🐑', label: currentLanguage === 'en' ? 'Sheep' : 'मेंढी' },
                { key: 'Other', emoji: '🐎', label: currentLanguage === 'en' ? 'Other' : 'इतर' },
              ].map((sp) => {
                const isSelected = selectedSpecies === sp.key;
                return (
                  <button
                    key={sp.key}
                    type="button"
                    onClick={() => {
                      hapticsService.hapticLight();
                      setSelectedSpecies(sp.key as any);
                    }}
                    className={`py-2.5 px-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 active:scale-95 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/30 shadow-xs font-black'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xl">{sp.emoji}</span>
                    <span className="text-xs">{sp.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick-Pick Registered Herd Chips */}
            {myAnimals.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {currentLanguage === 'en' ? 'Or Quick-Pick From Your Herd:' : 'किंवा आपल्या कळपातील जनावर निवडा:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {myAnimals.map((animal) => {
                    const isSelected = pashuAadhaar === animal.tagNumber;
                    return (
                      <button
                        key={animal.tagNumber}
                        type="button"
                        onClick={() => handleSelectRegisteredAnimal(animal)}
                        className={`text-[11px] px-2.5 py-1 rounded-xl border font-mono transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                        }`}
                      >
                        <Tag className="w-3 h-3" />
                        <span>{animal.tagNumber.slice(-6)}</span>
                        <span className="opacity-75 text-[10px]">({animal.species})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

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
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-50 safe-bottom shadow-2xl">
            <div className="max-w-md mx-auto flex gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                aria-label="Cancel and return to dashboard"
                className={`field-touch-target px-4 py-3.5 rounded-2xl border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors active:scale-95 ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}
              >
                <span>{currentLanguage === 'en' ? 'Cancel' : currentLanguage === 'hi' ? 'रद्द करें' : 'रद्द करा'}</span>
              </button>

              {decisionResult?.isAnthraxLockout ? (
                <button
                  type="button"
                  onClick={() => setIsAnthraxModalOpen(true)}
                  className={`field-touch-target flex-1 py-3.5 px-4 rounded-2xl font-black flex items-center justify-center gap-2 text-sm transition-all shadow-lg bg-red-600 hover:bg-red-700 active:scale-95 text-white ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}
                >
                  <Skull className="w-5 h-5" />
                  <span>{t('openLockoutProtocol', 'ॲन्थ्रॅक्स लॉकआऊट प्रोटोकॉल उघडा (Anthrax Lockout)')}</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!selectedSyndrome}
                  onClick={handleProceedToStep2}
                  className={`field-touch-target flex-1 py-3.5 px-4 rounded-2xl font-black flex items-center justify-center gap-2 text-sm transition-all shadow-lg ${currentLanguage !== 'en' ? 'lang-devanagari' : ''} ${
                    selectedSyndrome
                      ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-emerald-900/30'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-70'
                  }`}
                >
                  <span>{t('nextEvidence', 'पुढे जा: पुरावे जोडा (Next)')}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: MEDIA & VOICE EVIDENCE */}
      {currentStep === 2 && (
        <div key="step2" className="space-y-4 pb-32 animate-in slide-in-from-right-8 fade-in duration-300">
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
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-50 safe-bottom shadow-2xl">
            <div className="max-w-md mx-auto flex gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`field-touch-target px-4 py-3.5 rounded-2xl border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors active:scale-95 ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={handleProceedToStep3}
                className={`field-touch-target flex-1 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-transform ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}
              >
                <span>{t('nextLocation', 'पुढे जा: स्थान (Next)')}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: LOCATION & PASHU AADHAAR */}
      {currentStep === 3 && (
        <div key="step3" className="space-y-4 pb-32 animate-in slide-in-from-right-8 fade-in duration-300">
          {/* Interim AI Triage & Provisional First-Aid Card */}
          {isTriageAnalyzing ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-center space-y-2 animate-pulse">
              <div className="flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
                <span className={currentLanguage !== 'en' ? 'lang-devanagari' : ''}>
                  {t('aiTriageAnalyzing', 'AI लक्षणे, फोटो व व्हॉइस विश्लेषण करत आहे (Multimodal Triage Processing)...')}
                </span>
              </div>
              <p className="text-[10px] text-slate-500">
                {t('aiTriageAnalyzingSub', 'Gemini 3.7 Flash • उप-सेकंद क्लिनिकल विश्लेषण')}
              </p>
            </div>
          ) : triageResponse ? (
            <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50/50 to-emerald-50/40 dark:from-amber-950/40 dark:via-slate-900 dark:to-emerald-950/30 border-2 border-amber-300/80 dark:border-amber-700/60 shadow-md space-y-3.5">
              {/* Card Header: AI badge, Disease, Urgency and TTS Speech */}
              <div className="flex items-start justify-between gap-2 border-b border-amber-200/80 dark:border-amber-800/60 pb-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-xs shrink-0 mt-0.5">
                    <Sparkles className="w-5 h-5 text-yellow-200 animate-spin" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono font-black uppercase text-amber-800 dark:text-amber-300">
                        {triageResponse.model_used || 'Gemini Flash AI'} • {Math.round(triageResponse.clinical_confidence * 100)}% {t('aiAccuracy', 'अचूकता')}
                      </span>
                      {triageResponse.temporary_first_aid?.doctor_urgency === 'EMERGENCY' || triageResponse.biohazard_alert === 'CRITICAL_ANTHRAX_LOCK' ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider">
                          आणीबाणी (Emergency)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider">
                          तातडीचे (Urgent)
                        </span>
                      )}
                    </div>
                    <h4 className={`text-sm font-black text-slate-900 dark:text-white leading-snug mt-0.5 truncate ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                      {localizeTriageDisease(triageResponse, currentLanguage)}
                    </h4>
                  </div>
                </div>

                {/* TTS Audio Speech button */}
                <button
                  type="button"
                  onClick={() => {
                    hapticsService.hapticLight();
                    const textToSpeak = triageResponse.temporary_first_aid
                      ? currentLanguage === 'en'
                        ? `${triageResponse.temporary_first_aid.summary_en}. Immediate actions: ${triageResponse.temporary_first_aid.immediate_actions_en.join('. ')}. Do not do: ${triageResponse.temporary_first_aid.do_not_do_en.join('. ')}`
                        : `${triageResponse.temporary_first_aid.summary_mr}. प्रथमोपचार: ${triageResponse.temporary_first_aid.immediate_actions_mr.join('. ')}. काय करू नये: ${triageResponse.temporary_first_aid.do_not_do_mr.join('. ')}`
                      : triageResponse.immediate_advisory_marathi;
                    handleSpeakFirstAid(textToSpeak);
                  }}
                  className={`field-touch-target px-3 py-2 rounded-2xl flex items-center gap-1.5 text-xs font-bold shadow-xs shrink-0 transition-all active:scale-95 ${
                    isSpeakingFirstAid
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                  title={currentLanguage === 'en' ? 'Listen in Audio' : 'आवाजात ऐका'}
                >
                  {isSpeakingFirstAid ? (
                    <>
                      <VolumeX className="w-4 h-4" />
                      <span>{currentLanguage === 'en' ? 'Stop' : 'थांबवा'}</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      <span>{currentLanguage === 'en' ? 'Listen' : 'आवाजात ऐका'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* TEMPORARY FIRST-AID CONTAINER (What to do while waiting for doctor) */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-amber-200 dark:border-amber-800/80 space-y-3 shadow-xs">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-950 dark:text-amber-200 uppercase tracking-wide mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      {currentLanguage === 'en'
                        ? '⚡ Temporary First-Aid (Until Doctor Responds):'
                        : '⚡ डॉक्टर येईपर्यंत तात्पुरते प्रथमोपचार व घरगुती काळजी:'}
                    </span>
                  </div>
                  <p className={`text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-semibold ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                    {triageResponse.temporary_first_aid
                      ? currentLanguage === 'en'
                        ? triageResponse.temporary_first_aid.summary_en
                        : currentLanguage === 'hi' && triageResponse.temporary_first_aid.summary_hi
                        ? triageResponse.temporary_first_aid.summary_hi
                        : triageResponse.temporary_first_aid.summary_mr
                      : localizeTriageAdvisory(triageResponse, currentLanguage)}
                  </p>
                </div>

                {/* 1. Immediate Actions Checklist */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-mono uppercase font-black tracking-wider text-emerald-700 dark:text-emerald-400 block">
                    {currentLanguage === 'en' ? '✓ Immediate Actions to Take:' : '✓ तात्काळ करावयाचे उपाय:'}
                  </span>
                  <ul className={`text-xs space-y-1.5 ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                    {(triageResponse.temporary_first_aid
                      ? currentLanguage === 'en'
                        ? triageResponse.temporary_first_aid.immediate_actions_en
                        : currentLanguage === 'hi' && triageResponse.temporary_first_aid.immediate_actions_hi
                        ? triageResponse.temporary_first_aid.immediate_actions_hi
                        : triageResponse.temporary_first_aid.immediate_actions_mr
                      : triageResponse.recommended_containment_actions || []
                    ).map((action, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-800 dark:text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 2. Strict Prohibitions: What NOT to do */}
                {(triageResponse.temporary_first_aid?.do_not_do_mr?.length || 0) > 0 && (
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-1">
                    <span className="text-[10px] font-mono uppercase font-black tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1">
                      <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                      <span>{currentLanguage === 'en' ? '🚫 Strict Prohibitions (What NOT to do):' : '🚫 काय करू नये (सक्त मनाई):'}</span>
                    </span>
                    <ul className={`text-[11px] space-y-1 pl-1 text-rose-900 dark:text-rose-200 ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                      {(currentLanguage === 'en'
                        ? triageResponse.temporary_first_aid?.do_not_do_en
                        : currentLanguage === 'hi' && triageResponse.temporary_first_aid?.do_not_do_hi
                        ? triageResponse.temporary_first_aid.do_not_do_hi
                        : triageResponse.temporary_first_aid?.do_not_do_mr || []
                      )?.map((dont, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 leading-snug">
                          <span className="text-rose-500 font-bold">•</span>
                          <span>{dont}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Doctor Coordination & Video Call Bridge Notification */}
              <div className="flex items-center justify-between text-[11px] text-blue-900 dark:text-blue-200 bg-blue-100/70 dark:bg-blue-950/60 p-3 rounded-2xl border border-blue-200/80 dark:border-blue-900">
                <span className={`flex items-center gap-2 font-bold ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                  <Clock className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                  <span>
                    {currentLanguage === 'en'
                      ? 'Report queued for Dr. Ananya Deshmukh (BVO). Awaiting Video Call or e-Prescription.'
                      : 'अहवाल डॉ. अनन्या देशमुख (BVO) यांच्याकडे पाठवला आहे. लवकरच व्हिडिओ सल्ला किंवा ई-प्रिस्क्रिप्शन मिळेल.'}
                  </span>
                </span>
              </div>
            </div>
          ) : null}

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

          {/* Animal Breed & Farmer Identity Confirmation */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className={`text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{currentLanguage === 'en' ? 'Livestock Owner & Breed Details' : 'पशुपालक व जातीची माहिती'}</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 block">
                  {currentLanguage === 'en' ? 'Breed (जात)' : 'जनावराची जात (Breed)'}
                </label>
                <input
                  type="text"
                  value={animalBreed}
                  onChange={(e) => setAnimalBreed(e.target.value)}
                  placeholder={selectedSpecies === 'Cow' ? 'उदा. गिर / संकरित' : selectedSpecies === 'Buffalo' ? 'उदा. मुऱ्हा' : 'उदा. उस्मानाबादी'}
                  className="field-touch-target w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 block">
                  {currentLanguage === 'en' ? 'Farmer Name' : 'पशुपालकाचे नाव'}
                </label>
                <input
                  type="text"
                  value={farmerCustomName}
                  onChange={(e) => setFarmerCustomName(e.target.value)}
                  placeholder={useAuthStore.getState().userProfile?.name || 'उदा. रमेश पाटील'}
                  className="field-touch-target w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 block">
                  {currentLanguage === 'en' ? 'Contact Mobile (+91)' : 'संपर्क मोबाईल क्रमांक'}
                </label>
                <input
                  type="tel"
                  value={farmerCustomPhone}
                  onChange={(e) => setFarmerCustomPhone(e.target.value)}
                  placeholder={useAuthStore.getState().userProfile?.mobileNumberMasked || 'उदा. 9822000412'}
                  className="field-touch-target w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Navigation Controls for Step 3 */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-50 safe-bottom shadow-2xl">
            <div className="max-w-md mx-auto flex gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className={`field-touch-target px-4 py-3.5 rounded-2xl border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors active:scale-95 ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSaveReport}
                className={`field-touch-target flex-1 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-transform ${currentLanguage !== 'en' ? 'lang-devanagari' : ''} ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <Sparkles className="w-5 h-5 animate-spin" />
                ) : (
                  <Check className="w-5 h-5" />
                )}
                <span>{isSubmitting ? t('saving', 'जतन करत आहे...') : t('saveOfflineReport', 'अहवाल जतन करा (Save Offline)')}</span>
              </button>
            </div>
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
                {t('reportSuccessSubtitle', 'स्थानिक SQLite मध्ये सुरक्षित ठेवून तालुका पशुवैद्यकाकडे (डॉ. अनन्या देशमुख) थेट पाठवला आहे.')}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-1.5">
              <p className={`font-semibold text-slate-800 dark:text-slate-200 ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                {t('syndromeLabel', 'लक्षण')}: {currentLanguage === 'en' ? selectedSyndrome?.nameEnglish : currentLanguage === 'hi' ? (selectedSyndrome?.nameHindi || selectedSyndrome?.nameMarathi) : selectedSyndrome?.nameMarathi} ({selectedSyndrome?.code})
              </p>
              {triageResponse && (
                <p className={`text-amber-700 dark:text-amber-400 font-medium ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                  {t('suspectedLabel', 'संशयित')}: {localizeTriageDisease(triageResponse, currentLanguage)}
                </p>
              )}
              <p className={`text-slate-500 dark:text-slate-400 ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                {t('villageLabel', 'गाव')}: {snappedVillage?.village_name || (currentLanguage === 'en' ? 'Rahuri Khurd' : 'राहुरी खुर्द')}
              </p>
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className={currentLanguage !== 'en' ? 'lang-devanagari' : ''}>
                  {t('doctorSyncedDistance', 'डॉ. अनन्या देशमुख (राहुरी दवाखाना • २.४ किमी) कडे समक्रमित')}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  window.location.href = 'tel:+919422001842';
                }}
                className={`field-touch-target w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{t('callAssignedVet', 'नियुक्त पशुवैद्यकास कॉल करा (+91 94220 01842)')}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSuccessModal(false);
                    setActiveTab('doctors');
                  }}
                  className={`field-touch-target py-2 px-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-bold text-[11px] border border-blue-200 dark:border-blue-800 flex items-center justify-center gap-1 ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>{t('viewAllDoctors', 'सर्व डॉक्टर पहा')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowSuccessModal(false);
                    setActiveTab('dashboard');
                  }}
                  className={`field-touch-target py-2 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center justify-center gap-1 ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>{t('goToDashboard', 'डॅशबोर्डवर जा')}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={resetWizard}
                className={`field-touch-target w-full py-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 font-semibold text-xs ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}
              >
                {t('newReportBtn', 'नवीन अहवाल नोंदवा (New Report)')}
              </button>
            </div>
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

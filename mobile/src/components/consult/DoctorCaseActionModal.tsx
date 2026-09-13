import React, { useState } from 'react';
import {
  X,
  Stethoscope,
  Calendar,
  Clock,
  Pill,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Phone,
  Video,
  Send,
  MapPin,
  Tag,
  Sparkles,
} from 'lucide-react';
import { ClinicalCase, caseService } from '../../services/caseService';
import { useLanguageStore } from '../../store/languageStore';
import { hapticsService } from '../../services/hapticsService';
import { AIDiagnosticReportModal } from './AIDiagnosticReportModal';
import {
  localizeSyndromeName,
  localizeSpecies,
  localizeVisitEta,
  localizePrescription,
  localizeDoctorNotes,
} from '../../utils/clinicalLocalization';

export interface DoctorCaseActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: ClinicalCase | null;
  onCaseUpdated: (updatedCase: ClinicalCase) => void;
  onStartVideoConsult: (caseItem: ClinicalCase) => void;
}

export const DoctorCaseActionModal: React.FC<DoctorCaseActionModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  onCaseUpdated,
  onStartVideoConsult,
}) => {
  const { currentLanguage, t } = useLanguageStore();

  const [status, setStatus] = useState<ClinicalCase['status']>(
    caseItem?.status || 'VISIT_SCHEDULED'
  );
  const [isAIDossierOpen, setIsAIDossierOpen] = useState(false);
  const [visitEta, setVisitEta] = useState(
    caseItem?.visit_eta
      ? localizeVisitEta(caseItem.visit_eta, currentLanguage)
      : currentLanguage === 'en'
      ? 'Today at 2:30 PM'
      : 'आज दुपारी २:३० वाजता'
  );
  const [prescription, setPrescription] = useState(
    caseItem?.prescription
      ? localizePrescription(caseItem.prescription, currentLanguage)
      : currentLanguage === 'en'
      ? '1. Inj. Meloxicam 10ml I/M\n2. Potassium Permanganate mouth wash (twice daily)\n3. Soft warm porridge & rice gruel feed'
      : '१. Inj. Meloxicam 10ml I/M\n२. पोटॅशियम परमँगनेट माऊथ वॉश (दिवसातून २ वेळा)\n३. मऊ लापशी व भाताची पेज'
  );
  const [doctorNotes, setDoctorNotes] = useState(
    caseItem?.doctor_notes
      ? localizeDoctorNotes(caseItem.doctor_notes, currentLanguage)
      : currentLanguage === 'en'
      ? 'Animal exhibits symptoms of Foot-and-Mouth Disease (FMD). Ring vaccination required post-initial triage.'
      : 'गाईमध्ये लाळ्या खुरकूतची (FMD) लक्षणे दिसत आहेत. प्राथमिक तपासणी नंतर रिंग व्हॅक्सिनेशन आवश्यक.'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state when caseItem changes
  React.useEffect(() => {
    if (caseItem) {
      setStatus(caseItem.status);
      if (caseItem.visit_eta) setVisitEta(localizeVisitEta(caseItem.visit_eta, currentLanguage));
      if (caseItem.prescription) setPrescription(localizePrescription(caseItem.prescription, currentLanguage));
      if (caseItem.doctor_notes) setDoctorNotes(localizeDoctorNotes(caseItem.doctor_notes, currentLanguage));
      setSaveSuccess(false);
    }
  }, [caseItem, currentLanguage]);

  if (!isOpen || !caseItem) return null;

  const handleSaveUpdates = async () => {
    try {
      setIsSaving(true);
      await hapticsService.hapticSuccess();

      const updated = await caseService.updateCase(caseItem.id, {
        status,
        visit_eta: visitEta,
        prescription,
        doctor_notes: doctorNotes,
      });

      setSaveSuccess(true);
      if (updated) {
        onCaseUpdated(updated);
      }
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to update case:', err);
      alert(currentLanguage === 'en' ? 'Error saving updates.' : 'अपडेट जतन करताना त्रुटी आली.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-blue-50/50 dark:bg-blue-950/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-sm font-bold text-slate-900 dark:text-white ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                {currentLanguage === 'en'
                  ? 'Veterinary Examination & Prescription'
                  : currentLanguage === 'hi'
                  ? 'पशु चिकित्सा जांच व नुस्खा'
                  : 'वैद्यकीय तपासणी व औषधोपचार'}
              </h3>
              <span className="text-[11px] font-mono text-blue-600 font-bold">
                {caseItem.id}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {/* Farmer & Animal Overview */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {currentLanguage === 'en' ? 'Farmer & Location' : currentLanguage === 'hi' ? 'किसान व स्थान' : 'शेतकरी व ठिकाण'}
                </span>
                <p className="text-xs font-black text-slate-900 dark:text-white">
                  {currentLanguage === 'en' ? caseItem.farmer_name.replace(/[\u0900-\u097F()]/g, '').trim() || caseItem.farmer_name : caseItem.farmer_name} • {caseItem.farmer_phone_masked}
                </p>
                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  <span>{caseItem.village_name}, {caseItem.block_name} ({caseItem.district_name})</span>
                </p>
              </div>

              {/* Direct Call & Video Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    hapticsService.hapticLight();
                    window.location.href = 'tel:+919822000412';
                  }}
                  className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                  title="Call Farmer"
                >
                  <Phone className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    hapticsService.hapticLight();
                    onStartVideoConsult(caseItem);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1 shadow-xs"
                  title="Video Call Farmer"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>{currentLanguage === 'en' ? 'Video Call' : currentLanguage === 'hi' ? 'वीडियो कॉल' : 'व्हिडिओ कॉल'}</span>
                </button>
              </div>
            </div>

            {/* Animal & Syndrome Info */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block">
                  {currentLanguage === 'en' ? 'Animal Tag & Breed:' : currentLanguage === 'hi' ? 'पशु टैग व नस्ल:' : 'पशू टॅग व जात:'}
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {caseItem.animal_tag} ({localizeSpecies(caseItem.species, currentLanguage)})
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">
                  {currentLanguage === 'en' ? 'Syndrome / Disease:' : currentLanguage === 'hi' ? 'लक्षण / सिंड्रोम:' : 'लक्षण / सिंड्रोम:'}
                </span>
                <span className="font-bold text-rose-600">
                  {caseItem.syndrome_code} — {localizeSyndromeName(caseItem.syndrome_code, caseItem.syndrome_name, currentLanguage)}
                </span>
              </div>
            </div>

            {/* Enhanced Multimodal AI Diagnostic Insights Banner */}
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 border border-purple-200 dark:border-purple-800/60 space-y-2.5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-1.5 text-purple-900 dark:text-purple-200">
                  <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                  <span className="text-xs font-bold">
                    Gemini 3.7 Flash Diagnostic Insight
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900/80 text-purple-900 dark:text-purple-200 text-[10px] font-mono font-black">
                  {Math.round((caseItem.clinical_confidence ?? 0.94) * 100)}% Certainty
                </span>
              </div>

              <div className="text-xs text-slate-800 dark:text-slate-200">
                <p className="font-bold text-purple-950 dark:text-purple-100">
                  {caseItem.ai_differential || caseItem.syndrome_name}
                </p>
                {caseItem.audio_transcript && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 italic line-clamp-2">
                    "{caseItem.audio_transcript}"
                  </p>
                )}
              </div>

              {/* Action Buttons: View Full AI Dossier & Apply AI Rx */}
              <div className="flex items-center gap-2 pt-1 border-t border-purple-200/60 dark:border-purple-800/40">
                <button
                  type="button"
                  onClick={() => setIsAIDossierOpen(true)}
                  className="flex-1 py-1.5 px-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-xs transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>View Full AI Report</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    hapticsService.hapticSuccess();
                    let rx = '1. Inj. Meloxicam 10ml I/M\n2. Potassium Permanganate 1:1000 mouth & foot wash (twice daily)\n3. Soft warm porridge & mineral mixture';
                    if (caseItem.syndrome_code === 'SARF') {
                      rx = 'STRICT BIOHAZARD PROTOCOL:\n1. DO NOT OPEN CARCASS (Burial 6ft with lime)\n2. Inj. Penicillin G 20,000 IU/kg for in-contact herd\n3. Ring vaccination within 5 km';
                    } else if (caseItem.syndrome_code === 'NSLS') {
                      rx = '1. Inj. Enrofloxacin 10% 15ml I/M (3 days)\n2. Inj. Meloxicam with Paracetamol 15ml I/M\n3. Topical Neem Oil + Turmeric paste over nodules';
                    }
                    setPrescription(rx);
                  }}
                  className="py-1.5 px-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-950/60 border border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-300 font-bold text-[11px] flex items-center gap-1 transition-all active:scale-95"
                >
                  <Pill className="w-3.5 h-3.5 text-purple-600" />
                  <span>Apply AI Rx</span>
                </button>
              </div>
            </div>
          </div>

          {/* Status Selection Buttons */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
              {currentLanguage === 'en' ? 'Case Status:' : currentLanguage === 'hi' ? 'केस स्थिति:' : 'केस स्थिती:'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  id: 'AWAITING_DOCTOR',
                  label: currentLanguage === 'en' ? 'Pending' : currentLanguage === 'hi' ? 'लंबित' : 'प्रलंबित',
                  color: 'border-amber-400 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200',
                },
                {
                  id: 'VISIT_SCHEDULED',
                  label: currentLanguage === 'en' ? 'Visit Scheduled' : currentLanguage === 'hi' ? 'भेंट निर्धारित' : 'भेट निश्चित',
                  color: 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200',
                },
                {
                  id: 'RESOLVED',
                  label: currentLanguage === 'en' ? 'Resolved' : currentLanguage === 'hi' ? 'निराकृत' : 'पूर्ण',
                  color: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200',
                },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    hapticsService.hapticLight();
                    setStatus(st.id as any);
                  }}
                  className={`p-2 rounded-xl border text-center font-bold text-[11px] transition-all ${
                    status === st.id
                      ? `${st.color} ring-2 ring-blue-500 font-black`
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Field Visit ETA */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>
                {currentLanguage === 'en'
                  ? 'Field Visit Schedule / ETA:'
                  : currentLanguage === 'hi'
                  ? 'प्रत्यक्ष भेंट समय / ETA:'
                  : 'प्रत्यक्ष भेटीची वेळ / ETA:'}
              </span>
            </label>
            <input
              type="text"
              value={visitEta}
              onChange={(e) => setVisitEta(e.target.value)}
              placeholder={
                currentLanguage === 'en'
                  ? 'e.g. Today at 2:30 PM'
                  : currentLanguage === 'hi'
                  ? 'उदा. आज दोपहर २:३० बजे'
                  : 'उदा. आज दुपारी २:३० वाजता'
              }
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Prescription */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {currentLanguage === 'en'
                  ? 'Veterinary Prescription & Instructions:'
                  : currentLanguage === 'hi'
                  ? 'पशु चिकित्सा नुस्खा व निर्देश:'
                  : 'पशुवैद्यकीय औषधोपचार व सूचना:'}
              </span>
            </label>
            <textarea
              rows={3}
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
              placeholder={
                currentLanguage === 'en'
                  ? 'Medicine names, dosage and administration route...'
                  : currentLanguage === 'hi'
                  ? 'दवाइयों के नाम, खुराक व निर्देश...'
                  : 'औषधांची नावे, डोस व देण्याच्या पद्धती...'
              }
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 leading-relaxed"
            />
          </div>

          {/* Doctor Clinical Notes */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-purple-600" />
              <span>
                {currentLanguage === 'en'
                  ? 'Doctor Clinical Notes:'
                  : currentLanguage === 'hi'
                  ? 'डॉक्टर क्लीनिकल टिप्पणी:'
                  : 'डॉक्टर तपासणी टीप:'}
              </span>
            </label>
            <textarea
              rows={2}
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder={
                currentLanguage === 'en'
                  ? 'Clinical observations, biosecurity advice...'
                  : currentLanguage === 'hi'
                  ? 'क्लीनिकल प्रेक्षण, जैव सुरक्षा सलाह...'
                  : 'क्लिनिकल निरीक्षण, बायोसिक्युरिटी सल्ला...'
              }
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs"
          >
            {currentLanguage === 'en' ? 'Cancel' : currentLanguage === 'hi' ? 'रद्द करें' : 'रद्द करा'}
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveUpdates}
            className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 ${
              saveSuccess ? 'bg-emerald-600' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {currentLanguage === 'en'
                    ? 'Updates Saved!'
                    : currentLanguage === 'hi'
                    ? 'अपडेट सहेज लिया!'
                    : 'अपडेट जतन झाले!'}
                </span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>
                  {isSaving
                    ? currentLanguage === 'en'
                      ? 'Saving...'
                      : currentLanguage === 'hi'
                      ? 'सहेज रहे हैं...'
                      : 'जतन करत आहे...'
                    : currentLanguage === 'en'
                    ? 'Send to Farmer & Save'
                    : currentLanguage === 'hi'
                    ? 'किसान को भेजें व सहेजें'
                    : 'शेतकऱ्यास पाठवा व जतन करा'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Embedded Full AI Diagnostic Dossier Modal */}
      <AIDiagnosticReportModal
        isOpen={isAIDossierOpen}
        onClose={() => setIsAIDossierOpen(false)}
        caseItem={caseItem}
        onApplyPrescription={(recommendedRx) => {
          setPrescription(recommendedRx);
          setIsAIDossierOpen(false);
        }}
        onStartVideoConsult={(item) => {
          setIsAIDossierOpen(false);
          onStartVideoConsult(item);
        }}
      />
    </div>
  );
};

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
  const [visitEta, setVisitEta] = useState(caseItem?.visit_eta || 'आज दुपारी २:३० वाजता (Today 2:30 PM)');
  const [prescription, setPrescription] = useState(
    caseItem?.prescription ||
      '१. Inj. Meloxicam 10ml I/M\n२. पोटॅशियम परमँगनेट माऊथ वॉश (दिवसातून २ वेळा)\n३. मऊ लापशी व भाताची पेज'
  );
  const [doctorNotes, setDoctorNotes] = useState(
    caseItem?.doctor_notes ||
      'गाईमध्ये लाळ्या खुरकूतची (FMD) लक्षणे दिसत आहेत. प्राथमिक तपासणी नंतर रिंग व्हॅक्सिनेशन आवश्यक.'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state when caseItem changes
  React.useEffect(() => {
    if (caseItem) {
      setStatus(caseItem.status);
      if (caseItem.visit_eta) setVisitEta(caseItem.visit_eta);
      if (caseItem.prescription) setPrescription(caseItem.prescription);
      if (caseItem.doctor_notes) setDoctorNotes(caseItem.doctor_notes);
      setSaveSuccess(false);
    }
  }, [caseItem]);

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
      alert('अपडेट जतन करताना त्रुटी आली.');
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
                {currentLanguage === 'en' ? 'Veterinary Case Action & Prescription' : 'वैद्यकीय तपासणी व औषधोपचार'}
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
                  शेतकरी व ठिकाण (Farmer & Location)
                </span>
                <p className="text-xs font-black text-slate-900 dark:text-white">
                  {caseItem.farmer_name} • {caseItem.farmer_phone_masked}
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
                  <span>व्हिडिओ कॉल</span>
                </button>
              </div>
            </div>

            {/* Animal & Syndrome Info */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block">पशू टॅग व जात:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {caseItem.animal_tag} ({caseItem.species})
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">लक्षण / सिंड्रोम:</span>
                <span className="font-bold text-rose-600">
                  {caseItem.syndrome_code} — {caseItem.syndrome_name}
                </span>
              </div>
            </div>

            {/* AI Differential Badge */}
            {caseItem.ai_differential && (
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 flex items-center gap-1.5 text-purple-900 dark:text-purple-300">
                <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="text-[11px] font-semibold">
                  AI Differential: {caseItem.ai_differential}
                </span>
              </div>
            )}
          </div>

          {/* Status Selection Buttons */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
              केस स्थिती (Case Status):
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'AWAITING_DOCTOR', label: 'प्रलंबित (Pending)', color: 'border-amber-400 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200' },
                { id: 'VISIT_SCHEDULED', label: 'भेट निश्चित (Visit)', color: 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200' },
                { id: 'RESOLVED', label: 'पूर्ण (Resolved)', color: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200' },
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
              <span>प्रत्यक्ष भेटीची वेळ / ETA (Field Visit Schedule):</span>
            </label>
            <input
              type="text"
              value={visitEta}
              onChange={(e) => setVisitEta(e.target.value)}
              placeholder="उदा. आज दुपारी २:३० वाजता (Today 2:30 PM)"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Prescription */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-emerald-600" />
              <span>पशुवैद्यकीय औषधोपचार व सूचना (Prescription & Rx):</span>
            </label>
            <textarea
              rows={3}
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
              placeholder="औषधांची नावे, डोस व देण्याच्या पद्धती..."
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 leading-relaxed"
            />
          </div>

          {/* Doctor Clinical Notes */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-purple-600" />
              <span>डॉक्टर तपासणी टीप (Doctor Clinical Notes):</span>
            </label>
            <textarea
              rows={2}
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="क्लिनिकल निरीक्षण, बायोसिक्युरिटी सल्ला..."
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
            रद्द करा (Cancel)
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
                <span>अपडेट जतन झाले!</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{isSaving ? 'जतन करत आहे...' : 'शेतकऱ्यास पाठवा व जतन करा'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

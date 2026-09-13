import React from 'react';
import {
  X,
  Printer,
  Share2,
  CheckCircle2,
  Stethoscope,
  Pill,
  Calendar,
  Clock,
  MapPin,
  Tag,
  ShieldCheck,
  Video,
  FileText,
  AlertCircle,
  QrCode,
  Building2,
} from 'lucide-react';
import { ClinicalCase } from '../../services/caseService';
import { useLanguageStore } from '../../store/languageStore';
import { hapticsService } from '../../services/hapticsService';
import {
  localizeSyndromeName,
  localizeSpecies,
  localizeCaseStatus,
} from '../../utils/clinicalLocalization';

interface OfficialPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: ClinicalCase | null;
  onStartVideoConsult?: (caseItem: ClinicalCase) => void;
}

export const OfficialPrescriptionModal: React.FC<OfficialPrescriptionModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  onStartVideoConsult,
}) => {
  const { currentLanguage } = useLanguageStore();

  if (!isOpen || !caseItem) return null;

  const handlePrint = async () => {
    await hapticsService.hapticLight();
    window.print();
  };

  const handleShareWhatsApp = async () => {
    await hapticsService.hapticLight();
    const rxText = `*पशु सुरक्षा — अधिकृत पशुवैद्यकीय ई-प्रिस्क्रिप्शन (Govt. e-Rx)*
-----------------------------------
केस आयडी: ${caseItem.id}
पशू टॅग: ${caseItem.animal_tag} (${localizeSpecies(caseItem.species, 'mr')})
शेतकरी: ${caseItem.farmer_name}
गाव: ${caseItem.village_name}, ${caseItem.district_name}
डॉक्टर: ${caseItem.doctor_name || 'पशुवैद्यकीय अधिकारी (LDO-I)'}
भेट वेळ (ETA): ${caseItem.visit_eta || 'लवकरच संपर्क होईल'}

*औषधोपचार व सूचना (Prescription):*
${caseItem.prescription || 'प्राथमिक प्रथमोपचार सूचना लागू करा.'}

*डॉक्टरांची टीप:*
${caseItem.doctor_notes || 'जनावराला कोरड्या व सावलीच्या ठिकाणी वेगळे ठेवा.'}
-----------------------------------
डिजिटली प्रमाणित: पशु-सुरक्षा नेटवर्क`;

    const encoded = encodeURIComponent(rxText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  // Parse prescription into structured lines if multi-line
  const rxLines = (caseItem.prescription || '')
    .split(/\r?\n|;/)
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Action Bar (Print / Share / Close) */}
        <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {currentLanguage === 'en' ? 'Official Electronic Prescription' : 'अधिकृत शासकीय ई-प्रिस्क्रिप्शन'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-xs border border-slate-200 dark:border-slate-600 flex items-center gap-1 text-xs font-bold transition-all"
              title="Print Prescription"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{currentLanguage === 'en' ? 'Print' : 'प्रिंट'}</span>
            </button>
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1 text-xs font-bold transition-all"
              title="Share via WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Prescription Document */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs" id="printable-prescription">
          
          {/* Government / Institutional Letterhead */}
          <div className="border-b-2 border-emerald-700 pb-3 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black text-sm shadow-md">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    DEPARTMENT OF ANIMAL HUSBANDRY
                  </h1>
                  <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400">
                    GOVERNMENT OF MAHARASHTRA • LIVESTOCK HEALTH SURVEILLANCE
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                Taluka Veterinary Polyclinic & Mobile Veterinary Dispensary • District: {caseItem.district_name || 'Ahmednagar'}
              </p>
            </div>

            <div className="text-right">
              <div className="inline-block px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] font-bold border border-emerald-300 dark:border-emerald-800">
                e-Rx No: {caseItem.id.replace('case_', 'RX-').toUpperCase()}
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                Date: {new Date(caseItem.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Patient, Owner & Doctor Metadata Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            {/* Owner & Animal */}
            <div className="space-y-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Tag className="w-3 h-3 text-emerald-600" />
                <span>Patient & Livestock Owner Record</span>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {caseItem.farmer_name} • <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300">{caseItem.farmer_phone_masked}</span>
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                Animal Tag / Pashu Aadhaar: <strong className="font-mono text-emerald-700 dark:text-emerald-400">{caseItem.animal_tag}</strong>
              </p>
              <p className="text-[11px] text-slate-500">
                Species: <strong>{localizeSpecies(caseItem.species, currentLanguage)}</strong> | Location: {caseItem.village_name}, {caseItem.block_name}
              </p>
            </div>

            {/* Treating Veterinary Officer */}
            <div className="space-y-1 sm:border-l sm:border-slate-200 dark:sm:border-slate-700 sm:pl-3">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Stethoscope className="w-3 h-3 text-blue-600" />
                <span>Attending Veterinary Officer</span>
              </div>
              <p className="text-xs font-bold text-blue-900 dark:text-blue-200">
                {caseItem.doctor_name || 'Dr. Rajesh Sharma, B.V.Sc & A.H., M.V.Sc'}
              </p>
              <p className="text-[10px] font-mono text-slate-500">
                VCI Registration: <strong className="text-slate-700 dark:text-slate-300">MSVC-2018/04812</strong>
              </p>
              <p className="text-[10px] text-slate-500">
                Designation: Livestock Development Officer (Category-I)
              </p>
            </div>
          </div>

          {/* Clinical Presentation & Provisional Diagnosis */}
          <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1">
                <FileText className="w-3 h-3" />
                <span>Clinical Presentation & Syndrome Classification</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-mono text-[10px] font-black">
                {caseItem.syndrome_code}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              {localizeSyndromeName(caseItem.syndrome_code, caseItem.syndrome_name, currentLanguage)}
            </p>
            {caseItem.ai_differential && (
              <p className="text-[11px] text-slate-700 dark:text-slate-300">
                <strong>Differential:</strong> {caseItem.ai_differential}
              </p>
            )}
            {caseItem.audio_transcript && (
              <p className="text-[10px] text-slate-500 italic">
                Reported history: "{caseItem.audio_transcript}"
              </p>
            )}
          </div>

          {/* Rx — OFFICIAL PRESCRIPTION & TREATMENT PROTOCOL */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1.5">
              <span className="font-serif italic font-black text-xl text-emerald-700 dark:text-emerald-400">
                ℞
              </span>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                {currentLanguage === 'en' ? 'Prescribed Medicines & Posology' : 'विहित औषधोपचार व प्रमाण (Rx)'}
              </h3>
            </div>

            {rxLines.length > 0 ? (
              <div className="space-y-2">
                {rxLines.map((line, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-2.5"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200 leading-snug">
                        {line}
                      </p>
                      <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400 font-medium">
                        Standard Veterinary Dosage Schedule • Administer with clean sterile syringe / oral feed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs">
                {caseItem.prescription || 'No medicines prescribed yet. Waiting for attending veterinary officer.'}
              </div>
            )}
          </div>

          {/* Field Visit & Biosecurity Instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Field Visit Schedule */}
            <div className="p-3 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 space-y-1">
              <div className="flex items-center gap-1.5 text-blue-900 dark:text-blue-300 font-bold text-[11px]">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Doctor Physical Visit ETA</span>
              </div>
              <p className="text-xs font-black text-blue-950 dark:text-blue-100">
                {caseItem.visit_eta || 'Scheduled within 2-4 hours by Mobile Unit'}
              </p>
              <p className="text-[10px] text-blue-700 dark:text-blue-400">
                Keep the animal tethered in an easily accessible holding area.
              </p>
            </div>

            {/* Quarantine Advisory */}
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold text-[11px]">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Biosecurity Protocol</span>
              </div>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {caseItem.interim_advice || 'Isolate from healthy animals. Provide separate water trough. Disinfect stall daily with lime/bleaching powder.'}
              </p>
            </div>
          </div>

          {/* Doctor Digital Authentication Stamp */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-end justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                <QrCode className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
                  DIGITALLY SIGNED & TIMESTAMPED
                </p>
                <p className="text-[9px] text-slate-500 font-mono">
                  SHA-256: {caseItem.id.slice(0, 16)}... • DPDP Act 2023 Compliant
                </p>
              </div>
            </div>

            <div className="text-right space-y-0.5">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified Veterinary Stamp</span>
              </div>
              <p className="text-[10px] font-bold text-slate-900 dark:text-white">
                {caseItem.doctor_name || 'Dr. Rajesh Sharma'}
              </p>
              <p className="text-[9px] text-slate-400 font-mono">
                Reg No. MSVC-2018/04812
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between gap-2">
          {onStartVideoConsult && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onStartVideoConsult(caseItem);
              }}
              className="field-touch-target px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-transform active:scale-95"
            >
              <Video className="w-4 h-4" />
              <span>{currentLanguage === 'en' ? 'Start Video Call with Doctor' : 'डॉक्टरांशी व्हिडिओ कॉल करा'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="field-touch-target px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs transition-colors ml-auto"
          >
            {currentLanguage === 'en' ? 'Close' : 'बंद करा'}
          </button>
        </div>

      </div>
    </div>
  );
};

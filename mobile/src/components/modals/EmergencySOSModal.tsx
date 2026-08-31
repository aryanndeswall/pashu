import React from 'react';
import { AlertOctagon, Skull, PhoneCall, X, ShieldAlert } from 'lucide-react';
import { useNavigationStore } from '../../store/navigationStore';
import { hapticsService } from '../../services/hapticsService';
import { HazardBorder } from '../animations/HazardBorder';

export const EmergencySOSModal: React.FC = () => {
  const isOpen = useNavigationStore((state) => state.isEmergencyModalOpen);
  const setOpen = useNavigationStore((state) => state.setEmergencyModalOpen);

  if (!isOpen) return null;

  const handleClose = async () => {
    await hapticsService.hapticLight();
    setOpen(false);
  };

  const handleConfirmAlert = async () => {
    await hapticsService.hapticError();
    alert('आपत्कालीन सूचना नोंदवली आहे. IDSP व पशुसंवर्धन विभागाला तातडीने सतर्क केले जाईल.');
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Heavy Red Dark Backdrop */}
      <div
        className="fixed inset-0 bg-red-950/80 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Card with Glowing Hazard Border */}
      <div className="relative z-10 w-full max-w-sm">
        <HazardBorder isActive={true}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl border border-red-500/50">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-red-100 dark:border-red-900/40 pb-3 mb-4">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertOctagon className="w-6 h-6 animate-pulse" />
                <h2 className="text-base font-black uppercase tracking-wider lang-devanagari">
                  अति-तातडीक इशारा (BIOHAZARD)
                </h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close Alert"
                className="field-touch-target -mr-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Prominent Anthrax Warning Callout (WCAG AAA) */}
            <div className="bg-red-600 text-white p-4 rounded-xl mb-4 shadow-md text-center">
              <Skull className="w-10 h-10 mx-auto mb-1 text-red-100 animate-bounce" />
              <h3 className="text-xl font-black tracking-tight lang-devanagari">
                शव विच्छेदन करू नका!
              </h3>
              <p className="text-xs font-bold text-red-100 uppercase tracking-widest mt-0.5">
                DO NOT CUT CARCASS
              </p>
            </div>

            {/* Biohazard Advisory Explanation */}
            <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 lang-devanagari mb-5">
              <p className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <span>
                  <strong>काळपुळी (Anthrax) संशय:</strong> जनावराचे रक्त न गोठल्यास किंवा अचानक मृत्यू झाल्यास मृतदेह उघडू नका. मानवाला गंभीर संसर्ग होण्याचा धोका आहे.
                </span>
              </p>
              <p className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>
                  स्थानिक पशुवैद्यकीय अधिकारी किंवा १९६२ हेल्पलाईनवर संपर्क साधा. मृतदेहाभोवती चुना पसरवून ठेवा.
                </span>
              </p>
            </div>

            {/* Action Buttons (52px Touch Targets) */}
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleConfirmAlert}
                className="field-touch-target w-full bg-red-600 hover:bg-red-700 active:scale-98 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 lang-devanagari text-sm transition-transform"
              >
                <AlertOctagon className="w-5 h-5" />
                तातडीक बायोहॅझार्ड अहवाल नोंदवा
              </button>

              <a
                href="tel:1962"
                className="field-touch-target w-full border-2 border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 active:scale-98 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 lang-devanagari text-sm transition-transform"
              >
                <PhoneCall className="w-4 h-4" />
                १९६२ पशु हेल्पलाईनला कॉल करा
              </a>
            </div>
          </div>
        </HazardBorder>
      </div>
    </div>
  );
};

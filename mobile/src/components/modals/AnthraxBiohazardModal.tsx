import React, { useEffect, useState } from 'react';
import { HazardBorder } from '../animations/HazardBorder';
import { alarmAudioService } from '../../services/alarmAudioService';
import { idspAlertService } from '../../services/idspAlertService';
import { hapticsService } from '../../services/hapticsService';
import {
  Skull,
  AlertTriangle,
  Volume2,
  VolumeX,
  PhoneCall,
  Radio,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

interface AnthraxBiohazardModalProps {
  isOpen: boolean;
  onClose: () => void;
  lgdCode?: number;
  villageName?: string;
  district?: string;
  block?: string;
  coordinates?: { latitude: number; longitude: number };
  pashuAadhaar?: string;
}

export const AnthraxBiohazardModal: React.FC<AnthraxBiohazardModalProps> = ({
  isOpen,
  onClose,
  lgdCode = 558301,
  villageName = 'Ashwi Budruk',
  district = 'Ahmednagar',
  block = 'Sangamner',
  coordinates,
  pashuAadhaar,
}) => {
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [isAlertQueued, setIsAlertQueued] = useState(false);
  const [syncId, setSyncId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Trigger triple error haptic feedback
      hapticsService.hapticError();
      setTimeout(() => hapticsService.hapticError(), 200);

      // Play emergency warbling siren and spoken Marathi TTS warning
      alarmAudioService.playBiohazardSiren();
      setIsSirenActive(true);
      alarmAudioService.speakMarathiWarning();

      document.body.style.overflow = 'hidden';
    } else {
      alarmAudioService.stopBiohazardSiren();
      alarmAudioService.stopSpeech();
      setIsSirenActive(false);
      document.body.style.overflow = '';
    }

    return () => {
      alarmAudioService.stopBiohazardSiren();
      alarmAudioService.stopSpeech();
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleToggleSiren = () => {
    if (isSirenActive) {
      alarmAudioService.stopBiohazardSiren();
      setIsSirenActive(false);
    } else {
      alarmAudioService.playBiohazardSiren();
      setIsSirenActive(true);
    }
  };

  const handleReplayVoice = () => {
    alarmAudioService.speakMarathiWarning();
  };

  const handleDispatchIdspAlert = async () => {
    await hapticsService.hapticError();
    const id = await idspAlertService.dispatchIdspAlert({
      lgdCode,
      villageName,
      district,
      block,
      coordinates,
      syndrome: 'HSDS',
      primaryDisease: 'Anthrax (Bacillus anthracis)',
      pashuAadhaar,
      deadCount: 1,
    });

    setSyncId(id);
    setIsAlertQueued(true);
    alarmAudioService.stopBiohazardSiren();
    setIsSirenActive(false);
  };

  if (!isOpen) return null;

  const biosecurityProtocols = [
    '१. मृत जनावराचे शव उघडणे, कापणे किंवा कातडी काढणे पूर्णपणे बंदी (Strictly NO Incision)',
    '२. रक्ताचा नमुना फक्त कानाच्या टोकावरून काढावा (Ear-tip Blood Smear Only)',
    '३. शव ६ फूट खोल खड्ड्यात कळीच्या चुन्यासह पुरावे (Deep 6ft Burial with Quicklime)',
    '४. १ किमी परिसरातील सर्व जनावरांची हालचाल तत्काळ थांबवा (1 km Herd Movement Freeze)',
    '५. जिल्हा मानवी आरोग्य विभागाकडे (IDSP) त्वरित संपर्क शोध सुरू करा (Human Exposure Tracing)',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg my-auto">
        <HazardBorder isActive={true} className="rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-red-950 text-white p-5 sm:p-6 space-y-4 border border-red-700/80">
            {/* Top Biohazard Alarm Header */}
            <div className="flex items-center justify-between border-b border-red-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-600 text-white animate-pulse">
                  <Skull className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-red-300">
                    CRITICAL BIOHAZARD ALERT • RULE ZERO
                  </div>
                  <h2 className="text-base font-extrabold text-white lang-devanagari tracking-tight">
                    शव विच्छेदन करू नका! (DO NOT CUT!)
                  </h2>
                </div>
              </div>

              {/* Siren Audio Toggle */}
              <button
                type="button"
                onClick={handleToggleSiren}
                aria-label={isSirenActive ? 'Mute Siren' : 'Play Siren'}
                className="field-touch-target p-2 rounded-xl bg-red-900/80 border border-red-700 text-red-200 hover:text-white"
              >
                {isSirenActive ? <VolumeX className="w-5 h-5 text-amber-400" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>

            {/* Warning Description & Spores Warning */}
            <div className="bg-red-900/50 p-3.5 rounded-2xl border border-red-700/60 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs lang-devanagari">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>काळपुळी (ॲन्थ्रॅक्स) संसर्गाचा गंभीर धोका</span>
              </div>
              <p className="text-xs text-red-100 lang-devanagari leading-relaxed">
                जनावराचे शव हवेच्या संपर्कात आल्यास <strong>ॲन्थ्रॅक्सचे घातक बीजाणू (spores)</strong> तयार होतात, ज्यामुळे माणसांना व इतर जनावरांना प्राणघातक संसर्ग होतो. शव कोणत्याही परिस्थितीत कापू नका!
              </p>

              {/* Replay Spoken Warning */}
              <button
                type="button"
                onClick={handleReplayVoice}
                aria-label="Replay Marathi Voice Warning"
                className="field-touch-target mt-2 px-3 py-1.5 rounded-xl bg-red-800 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Volume2 className="w-4 h-4 text-amber-300" />
                <span>मराठी ध्वनी चेतावणी पुन्हा ऐका (Replay Voice Alert)</span>
              </button>
            </div>

            {/* 5-Point Biosecurity Disposal Protocol */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-red-200 tracking-wide uppercase">
                कडक जैविक सुरक्षा नियम (Mandatory Disposal Protocol):
              </h3>
              <div className="space-y-1.5 bg-black/40 p-3 rounded-2xl border border-red-800/60">
                {biosecurityProtocols.map((protocol, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px] text-red-100 lang-devanagari">
                    <span className="text-red-400 font-bold mt-0.5">•</span>
                    <span>{protocol}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Alert Status or Action CTAs */}
            {isAlertQueued ? (
              <div className="bg-emerald-950/80 border border-emerald-500 p-3.5 rounded-2xl text-center space-y-2">
                <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-extrabold">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>IDSP राष्ट्रीय सूचना नोंदवली! (Alert Queued: Priority 3)</span>
                </div>
                <p className="text-[11px] text-emerald-200 font-mono">
                  Sync ID: {syncId} • मानवी आरोग्य व जिल्हा अधिकाऱ्यांना सूचना पाठवली जाईल.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="field-touch-target w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
                >
                  समजले, बंद करा (Acknowledge & Close)
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <a
                  href="tel:1962"
                  className="field-touch-target py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700"
                >
                  <PhoneCall className="w-4 h-4 text-amber-400" />
                  <span>१९६२ आपत्कालीन कॉल</span>
                </a>

                <button
                  type="button"
                  onClick={handleDispatchIdspAlert}
                  className="field-touch-target py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-lg shadow-red-900/60 transition-transform active:scale-95"
                >
                  <Radio className="w-4 h-4 animate-ping" />
                  <span>IDSP राष्ट्रीय सूचना नोंदवा</span>
                </button>
              </div>
            )}
          </div>
        </HazardBorder>
      </div>
    </div>
  );
};

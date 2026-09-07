import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  FileText,
  Send,
  CheckCircle2,
  User,
  Sparkles,
  Stethoscope,
  Activity,
  Wifi,
  Clock,
  Plus,
  Trash2,
  Minimize2,
} from 'lucide-react';
import { useLanguageStore } from '../../store/languageStore';
import { hapticsService } from '../../services/hapticsService';

export interface VideoConsultModalProps {
  isOpen: boolean;
  onClose: () => void;
  callerRole?: 'doctor' | 'farmer';
  targetPartyName?: string;
  targetPartyPhone?: string;
  animalTag?: string;
  animalSpecies?: string;
  suspectedCondition?: string;
}

interface PrescriptionItem {
  id: string;
  medicine: string;
  dosage: string;
  instructions: string;
}

export const VideoConsultModal: React.FC<VideoConsultModalProps> = ({
  isOpen,
  onClose,
  callerRole = 'doctor',
  targetPartyName = 'Ramesh Patil (रमेश पाटील)',
  targetPartyPhone = '+91 9822000412',
  animalTag = '1002-9384-7561',
  animalSpecies = 'Gir Cow (गीर गाय)',
  suspectedCondition = 'VSS / FMD (लाळ्या खुरकूत संशयित)',
}) => {
  const { currentLanguage, t } = useLanguageStore();

  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [callDurationSec, setCallDurationSec] = useState(0);
  const [showRxDrawer, setShowRxDrawer] = useState(false);
  const [prescriptionSent, setPrescriptionSent] = useState(false);
  const [diagnosisText, setDiagnosisText] = useState(
    'FMD Stage-2 Oral Vesicles with Mild Pyrexia'
  );
  const [adviceNotes, setAdviceNotes] = useState(
    'Wash lesions with 1% potassium permanganate solution twice daily. Keep isolated in dry shaded pen.'
  );
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    {
      id: '1',
      medicine: 'Meloxicam + Paracetamol Bolus',
      dosage: '1 bolus BID x 3 days',
      instructions: 'Give orally after feed for pain and fever',
    },
    {
      id: '2',
      medicine: 'Povidone Iodine 5% + Boroglycerine',
      dosage: 'Apply topically TID',
      instructions: 'Gently apply on oral ulcers with clean sterile cotton',
    },
  ]);

  const [newMedicine, setNewMedicine] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [cameraActive, setCameraActive] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Call timer
  useEffect(() => {
    let timer: any = null;
    if (isOpen) {
      setCallDurationSec(0);
      setPrescriptionSent(false);
      timer = setInterval(() => {
        setCallDurationSec((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen]);

  // Handle camera stream via getUserMedia
  useEffect(() => {
    let active = true;

    async function setupCamera() {
      if (!isOpen) {
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }
        setCameraActive(false);
        return;
      }

      try {
        if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
            audio: true,
          });
          if (active) {
            mediaStreamRef.current = stream;
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
            setCameraActive(true);
          } else {
            stream.getTracks().forEach((t) => t.stop());
          }
        }
      } catch (err) {
        // Safe fallback in test or headless environments
        console.warn('Camera access not permitted or unavailable, using simulated stream:', err);
        setCameraActive(false);
      }
    }

    setupCamera();

    return () => {
      active = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    };
  }, [isOpen]);

  // Toggle video mute
  const toggleVideo = () => {
    hapticsService.hapticLight();
    if (mediaStreamRef.current) {
      const videoTracks = mediaStreamRef.current.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = isVideoMuted;
      });
    }
    setIsVideoMuted(!isVideoMuted);
  };

  // Toggle audio mute
  const toggleAudio = () => {
    hapticsService.hapticLight();
    if (mediaStreamRef.current) {
      const audioTracks = mediaStreamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = isAudioMuted;
      });
    }
    setIsAudioMuted(!isAudioMuted);
  };

  // End call
  const handleEndCall = async () => {
    await hapticsService.hapticWarning();
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    onClose();
  };

  const addPrescriptionItem = () => {
    if (!newMedicine.trim()) return;
    hapticsService.hapticLight();
    setPrescriptions((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        medicine: newMedicine.trim(),
        dosage: newDosage.trim() || 'As directed',
        instructions: 'Follow standard veterinary protocol',
      },
    ]);
    setNewMedicine('');
    setNewDosage('');
  };

  const removePrescriptionItem = (id: string) => {
    hapticsService.hapticLight();
    setPrescriptions((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSendPrescription = async () => {
    await hapticsService.hapticSuccess();
    setPrescriptionSent(true);
    setTimeout(() => {
      setShowRxDrawer(false);
    }, 1500);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Video Tele-Consultation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg h-[92vh] max-h-[820px] bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
        {/* Top Header Bar */}
        <div className="absolute top-0 inset-x-0 z-20 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/80 backdrop-blur-md flex items-center justify-center border border-blue-400/30 shadow-md">
              {callerRole === 'doctor' ? (
                <Stethoscope className="w-5 h-5 text-white" />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white tracking-wide truncate max-w-[180px]">
                  {targetPartyName}
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-300 flex items-center gap-1 font-mono">
                <span>{targetPartyPhone}</span> • <span>{animalSpecies}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/50 backdrop-blur-md border border-slate-700/60 text-[11px] font-mono font-semibold text-slate-200">
              <Clock className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>{formatTimer(callDurationSec)}</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-emerald-950/60 border border-emerald-700/50 text-[10px] font-mono text-emerald-300">
              <Wifi className="w-3 h-3 text-emerald-400" />
              <span>4G HD</span>
            </div>
          </div>
        </div>

        {/* Main Feed: Simulated Peer Field Stream (Animal Inspection) */}
        <div className="relative flex-1 bg-slate-900 overflow-hidden flex items-center justify-center">
          {/* Simulated Rural Field Feed Background */}
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 flex flex-col items-center justify-center text-center p-6 select-none">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-3xl bg-blue-950/50 border border-blue-500/30 flex items-center justify-center shadow-inner">
                <Activity className="w-12 h-12 text-blue-400 animate-pulse" />
              </div>
              <div className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-emerald-500 text-white shadow">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1 max-w-xs">
              <h4 className="text-white font-bold text-sm">
                {currentLanguage === 'en'
                  ? 'Live Rural Livestock Inspection Stream'
                  : currentLanguage === 'hi'
                  ? 'लाइव पशु स्वास्थ्य परीक्षण स्ट्रीम'
                  : 'थेट पशु तपासणी व्हिडिओ प्रवाह'}
              </h4>
              <p className="text-slate-400 text-xs font-mono">
                Tag: {animalTag} • {suspectedCondition}
              </p>
              <span className="inline-block px-3 py-1 rounded-full bg-blue-900/40 border border-blue-700/40 text-blue-300 text-[10px] font-medium mt-2">
                {currentLanguage === 'en'
                  ? 'Low-bandwidth WebRTC channel active (H.264 / 30fps)'
                  : 'कमी बँडविड्थ WebRTC चॅनेल सुरू आहे'}
              </span>
            </div>
          </div>

          {/* Picture-in-Picture Self Camera View */}
          <div className="absolute bottom-24 right-4 z-20 w-28 h-38 sm:w-32 sm:h-44 rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl bg-black">
            {cameraActive && !isVideoMuted ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400 p-2 text-center">
                <VideoOff className="w-6 h-6 mb-1 text-slate-500" />
                <span className="text-[10px] font-bold">
                  {isVideoMuted ? 'Camera Off' : 'No Camera'}
                </span>
              </div>
            )}
            <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[9px] text-white font-medium">
              You
            </div>
          </div>

          {/* Bottom Overlay Info Tag */}
          <div className="absolute bottom-24 left-4 z-20 px-3 py-1.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs space-y-0.5">
            <div className="font-bold flex items-center gap-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Ashwi Budruk Field Pen</span>
            </div>
            <p className="text-[10px] text-slate-300">
              Dr. Deshmukh ⇄ {targetPartyName.split(' ')[0]}
            </p>
          </div>
        </div>

        {/* Bottom Call Action Toolbar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800/80 flex items-center justify-around gap-2 z-20">
          {/* Mute Mic */}
          <button
            type="button"
            onClick={toggleAudio}
            className={`field-touch-target w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              isAudioMuted
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
            aria-label={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Mute Video */}
          <button
            type="button"
            onClick={toggleVideo}
            className={`field-touch-target w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              isVideoMuted
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
            aria-label={isVideoMuted ? 'Turn Camera On' : 'Turn Camera Off'}
          >
            {isVideoMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          {/* Doctor-Only Prescription Pad Trigger */}
          {callerRole === 'doctor' && (
            <button
              type="button"
              onClick={() => {
                hapticsService.hapticLight();
                setShowRxDrawer(!showRxDrawer);
              }}
              className={`field-touch-target px-3.5 h-12 rounded-2xl flex items-center gap-1.5 text-xs font-bold transition-all ${
                showRxDrawer
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-800 text-blue-400 hover:bg-slate-700 border border-blue-500/30'
              }`}
              aria-label="Toggle Clinical Prescription Pad"
            >
              <FileText className="w-4 h-4" />
              <span>{t('rxPrescriptionBtn', 'Rx Pad')}</span>
            </button>
          )}

          {/* End Call Button */}
          <button
            type="button"
            onClick={handleEndCall}
            className="field-touch-target px-5 h-12 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black flex items-center gap-2 text-xs shadow-lg shadow-rose-600/40 transition-transform active:scale-95"
            aria-label="End Consultation Call"
          >
            <PhoneOff className="w-5 h-5" />
            <span>{t('endCallBtn', 'End Call')}</span>
          </button>
        </div>

        {/* Clinical Prescription Pad Slide-Up Drawer */}
        {showRxDrawer && (
          <div className="absolute inset-x-0 bottom-0 z-30 bg-slate-900 border-t-2 border-blue-500/50 rounded-t-3xl p-4 shadow-2xl max-h-[75%] overflow-y-auto space-y-3 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-blue-600 text-white">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>Clinical E-Prescription (Rx)</span>
                    <span className="text-[10px] font-mono text-blue-400 bg-blue-950 px-1.5 py-0.5 rounded border border-blue-800">
                      VCI: MH-2018-8472
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Patient: {animalSpecies} ({animalTag}) • Farmer: {targetPartyName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowRxDrawer(false)}
                className="field-touch-target p-2 text-slate-400 hover:text-white"
                aria-label="Close Rx Drawer"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Diagnosis Input */}
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                Clinical Diagnosis
              </label>
              <input
                type="text"
                value={diagnosisText}
                onChange={(e) => setDiagnosisText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Prescribed Drugs List */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-300 block">
                Prescribed Medications & Dosages
              </span>
              {prescriptions.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-2"
                >
                  <div className="space-y-0.5 text-xs">
                    <strong className="text-white block">{item.medicine}</strong>
                    <span className="text-blue-400 font-mono text-[11px] block">
                      {item.dosage}
                    </span>
                    <span className="text-[10px] text-slate-400">{item.instructions}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePrescriptionItem(item.id)}
                    className="p-1 text-slate-500 hover:text-rose-400"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {/* Add New Drug Row */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Medicine name (e.g. Enrofloxacin)"
                  value={newMedicine}
                  onChange={(e) => setNewMedicine(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Dosage (e.g. 10ml IM SID)"
                  value={newDosage}
                  onChange={(e) => setNewDosage(e.target.value)}
                  className="w-32 px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={addPrescriptionItem}
                  className="field-touch-target p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400"
                  aria-label="Add prescription"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Advice & Quarantine Notes */}
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                Farmer Advisory & Biosecurity Instructions
              </label>
              <textarea
                rows={2}
                value={adviceNotes}
                onChange={(e) => setAdviceNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* Dispatch Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSendPrescription}
                disabled={prescriptionSent}
                className={`field-touch-target w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-xs shadow-lg transition-all ${
                  prescriptionSent
                    ? 'bg-emerald-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 active:scale-98'
                }`}
              >
                {prescriptionSent ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Prescription Sent via SMS & Passbook Updated!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send E-Prescription & SMS to Farmer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

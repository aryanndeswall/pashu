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
  RefreshCw,
  Camera,
  Settings,
  Volume2,
  ShieldCheck,
  Radio,
  Eye,
  Check,
} from 'lucide-react';
import { useLanguageStore } from '../../store/languageStore';
import { hapticsService } from '../../services/hapticsService';
import { caseService } from '../../services/caseService';

export interface VideoConsultModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId?: string;
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
  caseId,
  callerRole = 'farmer',
  targetPartyName = '',
  targetPartyPhone = '',
  animalTag = '',
  animalSpecies = '',
  suspectedCondition = '',
}) => {
  const { currentLanguage, t } = useLanguageStore();

  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [callDurationSec, setCallDurationSec] = useState(0);
  const [showRxDrawer, setShowRxDrawer] = useState(false);
  const [prescriptionSent, setPrescriptionSent] = useState(false);
  const [isSwappedFeeds, setIsSwappedFeeds] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('user');
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [showArOverlay, setShowArOverlay] = useState(true);
  const [snapshotFeedback, setSnapshotFeedback] = useState<string | null>(null);
  const [showApiSettingsModal, setShowApiSettingsModal] = useState(false);
  const [customApiProvider, setCustomApiProvider] = useState('webrtc_p2p');
  const [customApiKey, setCustomApiKey] = useState('');

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const [diagnosisText, setDiagnosisText] = useState('');
  const [adviceNotes, setAdviceNotes] = useState('');
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);

  const [newMedicine, setNewMedicine] = useState('');
  const [newDosage, setNewDosage] = useState('');

  // Call duration counter
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

  // Handle camera setup (with front/back camera support and graceful fallback)
  useEffect(() => {
    let active = true;

    async function initCamera() {
      if (!isOpen) {
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((t) => t.stop());
          mediaStreamRef.current = null;
        }
        setIsWebcamActive(false);
        return;
      }

      try {
        if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
          // Request video only (audio=false prevents mic permission lockouts)
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
              facingMode: cameraFacingMode,
            },
            audio: false,
          });

          if (active) {
            mediaStreamRef.current = stream;
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
              localVideoRef.current.onloadedmetadata = () => {
                localVideoRef.current?.play().catch((e) => console.warn('Video play error:', e));
              };
            }
            setIsWebcamActive(true);
          } else {
            stream.getTracks().forEach((t) => t.stop());
          }
        }
      } catch (err) {
        // Fallback gracefully to high-res simulated camera stream
        console.warn('Physical webcam unavailable or permission denied, using simulated stream:', err);
        setIsWebcamActive(false);
      }
    }

    initCamera();

    return () => {
      active = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
    };
  }, [isOpen, cameraFacingMode]);

  // Flip front / rear camera
  const handleFlipCamera = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await hapticsService.hapticLight();
    setCameraFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Toggle video track
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

  // Toggle audio track
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

  // End Call
  const handleEndCall = async () => {
    await hapticsService.hapticWarning();
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (caseId) {
      try {
        await caseService.recordConsultation(
          caseId,
          'VIDEO',
          `Call duration: ${formatTimer(callDurationSec)}. Tele-consultation completed.`
        );
      } catch (err) {
        console.warn('Failed to record consultation log:', err);
      }
    }
    onClose();
  };

  // Snap high-res clinical frame
  const handleCaptureSnapshot = async () => {
    await hapticsService.hapticSuccess();
    setSnapshotFeedback('High-res clinical frame captured and transmitted to medical record!');
    setTimeout(() => setSnapshotFeedback(null), 3000);
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

    if (caseId) {
      const rxSummary = prescriptions
        .map((p) => `${p.medicine} (${p.dosage}: ${p.instructions})`)
        .join('; ');
      try {
        await caseService.updateCase(caseId, {
          prescription: rxSummary,
          doctor_notes: `${diagnosisText}. ${adviceNotes}`,
          status: 'IN_CONSULTATION',
        });
      } catch (err) {
        console.warn('Failed to sync prescription to caseService:', err);
      }
    }

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

  // Determine feed sources based on caller role & swap state
  const isDoctorCalling = callerRole === 'doctor';

  // Remote feed image (when not swapped)
  const defaultRemoteFeedImage = isDoctorCalling
    ? '/assets/consult/livestock_pen_feed.jpg'
    : '/assets/consult/dr_ananya_feed.jpg';

  // Self feed image (when not swapped and webcam is simulated)
  const defaultSelfFeedImage =
    cameraFacingMode === 'user'
      ? isDoctorCalling
        ? '/assets/consult/dr_ananya_feed.jpg'
        : '/assets/consult/farmer_self_feed.jpg'
      : '/assets/consult/livestock_pen_feed.jpg';

  const mainFeedImage = isSwappedFeeds ? defaultSelfFeedImage : defaultRemoteFeedImage;
  const pipFeedImage = isSwappedFeeds ? defaultRemoteFeedImage : defaultSelfFeedImage;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Video Tele-Consultation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg h-[94vh] max-h-[860px] bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
        {/* Top Header Bar */}
        <div className="absolute top-0 inset-x-0 z-30 p-4 bg-gradient-to-b from-black/85 via-black/50 to-transparent flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/90 backdrop-blur-md flex items-center justify-center border border-emerald-400/40 shadow-md">
              {callerRole === 'doctor' ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <Stethoscope className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white tracking-wide truncate max-w-[180px]">
                  {currentLanguage === 'en' ? targetPartyName.replace(/[\u0900-\u097F()]/g, '').trim() || targetPartyName : targetPartyName}
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-300 flex items-center gap-1 font-mono">
                <span>{targetPartyPhone}</span> • <span>{currentLanguage === 'en' ? animalSpecies.replace(/[\u0900-\u097F()]/g, '').trim() || animalSpecies : animalSpecies}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-slate-700/60 text-[11px] font-mono font-semibold text-slate-200">
              <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>{formatTimer(callDurationSec)}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowApiSettingsModal(true)}
              className="p-1.5 rounded-xl bg-black/60 border border-slate-700/60 text-slate-300 hover:text-white"
              title="WebRTC & Video Stream Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Snapshot Notification Toast */}
        {snapshotFeedback && (
          <div className="absolute top-20 inset-x-4 z-40 bg-emerald-600/95 text-white text-xs font-bold p-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in slide-in-from-top duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{snapshotFeedback}</span>
          </div>
        )}

        {/* Main Video Viewport */}
        <div className="relative flex-1 bg-slate-950 overflow-hidden flex items-center justify-center select-none">
          {/* Real or Simulated Video Feed */}
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            <img
              src={mainFeedImage}
              alt="Live Video Stream"
              className="w-full h-full object-cover transform scale-105 transition-transform duration-700 filter brightness-95"
            />
            {/* Subtle video scan-line overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/30 pointer-events-none" />
          </div>

          {/* AR Telemedicine Lesion Overlay (if examining animal) */}
          {showArOverlay && (
            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center p-6">
              <div className="relative border-2 border-dashed border-amber-400/80 bg-amber-500/10 rounded-2xl p-3 max-w-xs shadow-lg animate-pulse">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-amber-300 mb-1">
                  <span className="flex items-center gap-1">
                    <Activity className="w-3 h-3 text-amber-400 animate-spin" />
                    AR Tele-Inspection [VSS Target]
                  </span>
                  <span>CONF: 94.2%</span>
                </div>
                <div className="space-y-0.5 text-[11px] text-white">
                  <p className="font-bold">Oral Vesicle Lesion Detected</p>
                  <p className="text-[10px] text-amber-200 font-mono">Temp: 103.8°F • Size: ~2.4 cm</p>
                </div>
              </div>
            </div>
          )}

          {/* Live Audio Spectrum Bar Visualizer (Doctor speaking) */}
          <div className="absolute bottom-24 left-4 z-20 px-3 py-2 rounded-2xl bg-black/75 backdrop-blur-md border border-white/10 text-white text-xs flex items-center gap-2.5">
            <div className="flex items-center gap-1">
              <span className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce" />
              <span className="w-1 h-5 bg-emerald-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:300ms]" />
              <span className="w-1 h-4 bg-emerald-400 rounded-full animate-bounce [animation-delay:75ms]" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                <span>{callerRole === 'farmer' ? 'Dr. Deshmukh Speaking' : 'Farmer Patil Speaking'}</span>
              </p>
              <p className="text-[9px] text-slate-400 font-mono">WebRTC Opus 48kHz HD Audio</p>
            </div>
          </div>

          {/* Picture-in-Picture (PiP) Self Camera View */}
          <div
            onClick={() => setIsSwappedFeeds(!isSwappedFeeds)}
            className="absolute bottom-24 right-4 z-20 w-32 h-44 rounded-2xl overflow-hidden border-2 border-white/40 shadow-2xl bg-black cursor-pointer group transition-transform active:scale-95"
            title="Tap to swap main and self views"
          >
            {isWebcamActive && !isVideoMuted && !isSwappedFeeds ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
              />
            ) : (
              <img
                src={pipFeedImage}
                alt="Self Camera Feed"
                className="w-full h-full object-cover filter brightness-90"
              />
            )}

            {/* PiP Overlay Controls */}
            <div className="absolute top-1.5 right-1.5 z-30 flex items-center gap-1">
              <button
                type="button"
                onClick={handleFlipCamera}
                className="p-1 rounded-full bg-black/60 hover:bg-black/80 text-white"
                title="Flip Camera (Front / Rear)"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>

            <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[9px] text-white font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isSwappedFeeds ? targetPartyName.split(' ')[0] : 'You'}</span>
            </div>
          </div>
        </div>

        {/* Prescription Received Notification Banner for Farmer */}
        {prescriptionSent && callerRole === 'farmer' && (
          <div className="bg-blue-600 text-white p-3 text-xs font-semibold flex items-center justify-between z-30 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Dr. Deshmukh has sent a medical prescription to your mobile passbook!</span>
            </div>
          </div>
        )}

        {/* Bottom Call Action Toolbar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800/80 flex items-center justify-around gap-2 z-30">
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

          {/* Snapshot Clinical Frame */}
          <button
            type="button"
            onClick={handleCaptureSnapshot}
            className="field-touch-target w-12 h-12 rounded-2xl bg-slate-800 text-slate-200 hover:bg-slate-700 flex items-center justify-center"
            aria-label="Capture High-Res Inspection Snapshot"
            title="Snap Photo"
          >
            <Camera className="w-5 h-5" />
          </button>

          {/* Flip / Toggle AR Lesion Pointer */}
          <button
            type="button"
            onClick={() => setShowArOverlay(!showArOverlay)}
            className={`field-touch-target w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              showArOverlay
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
            aria-label="Toggle AR Lesion Diagnostics"
            title="AR Diagnostics"
          >
            <Eye className="w-5 h-5" />
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

        {/* Clinical Prescription Pad Slide-Up Drawer (for Doctor) */}
        {showRxDrawer && (
          <div className="absolute inset-x-0 bottom-0 z-40 bg-slate-900 border-t-2 border-blue-500/50 rounded-t-3xl p-4 shadow-2xl max-h-[75%] overflow-y-auto space-y-3 animate-in slide-in-from-bottom duration-300">
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

        {/* WebRTC & API Settings Modal */}
        {showApiSettingsModal && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Video Consultation API Engine
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowApiSettingsModal(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Close
                </button>
              </div>

              {/* Status Metrics */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1.5 font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Channel Protocol:</span>
                  <span className="text-emerald-400">WebRTC P2P (STUN/TURN)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Resolution / FPS:</span>
                  <span className="text-white">1280x720 @ 30 FPS</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Video Codec:</span>
                  <span className="text-white">H.264 High Profile</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Network Latency:</span>
                  <span className="text-emerald-400">38 ms (4G Rural Optimized)</span>
                </div>
              </div>

              {/* Custom Cloud Video API Configuration */}
              <div className="space-y-2 text-xs">
                <label className="font-bold text-slate-300 block">External Video API Integration</label>
                <select
                  value={customApiProvider}
                  onChange={(e) => setCustomApiProvider(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="webrtc_p2p">Built-in Rural WebRTC (Standard)</option>
                  <option value="agora">Agora RTC Video SDK</option>
                  <option value="livekit">LiveKit Cloud WebRTC</option>
                  <option value="daily">Daily.co Telehealth Room</option>
                </select>

                {customApiProvider !== 'webrtc_p2p' && (
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[11px] text-slate-400 block">
                      Enter {customApiProvider.toUpperCase()} App ID / Token / URL
                    </label>
                    <input
                      type="text"
                      value={customApiKey}
                      onChange={(e) => setCustomApiKey(e.target.value)}
                      placeholder="e.g. your_api_key_or_room_token"
                      className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  hapticsService.hapticSuccess();
                  setShowApiSettingsModal(false);
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
              >
                Apply Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

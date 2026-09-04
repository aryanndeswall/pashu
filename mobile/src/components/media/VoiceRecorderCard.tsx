import React, { useState, useEffect } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Volume2, CheckCircle2 } from 'lucide-react';
import { voiceService, RecordedAudioResult } from '../../services/voiceService';
import { hapticsService } from '../../services/hapticsService';
import { useLanguageStore } from '../../store/languageStore';

export interface VoiceRecorderCardProps {
  recordedAudio: RecordedAudioResult | null;
  onAudioChanged: (audio: RecordedAudioResult | null) => void;
}

export const VoiceRecorderCard: React.FC<VoiceRecorderCardProps> = ({
  recordedAudio,
  onAudioChanged,
}) => {
  const { currentLanguage, t } = useLanguageStore();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    return () => {
      voiceService.stopPlayback();
    };
  }, []);

  const handleStartRecord = async () => {
    await hapticsService.hapticLight();
    setDuration(0);
    const started = await voiceService.startRecording((seconds) => {
      setDuration(seconds);
    });

    if (started) {
      setIsRecording(true);
      await hapticsService.hapticMedium();
    }
  };

  const handleStopRecord = async () => {
    await hapticsService.hapticMedium();
    const result = await voiceService.stopRecording();
    setIsRecording(false);
    onAudioChanged(result);
  };

  const handleTogglePlay = async () => {
    if (isPlaying) {
      voiceService.stopPlayback();
      setIsPlaying(false);
      await hapticsService.hapticLight();
    } else {
      await hapticsService.hapticLight();
      setIsPlaying(true);
      await voiceService.playAudio(() => {
        setIsPlaying(false);
      });
    }
  };

  const handleResetRecord = async () => {
    await hapticsService.hapticLight();
    voiceService.resetAudio();
    setIsPlaying(false);
    setDuration(0);
    onAudioChanged(null);
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const s = Math.floor(secs);
    const ms = Math.floor((secs - s) * 10);
    const padded = s < 10 ? `0${s}` : `${s}`;
    return `00:${padded}.${ms}`;
  };

  return (
    <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
            <Mic className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t('voiceCardTitle', '२. स्थानिक व्हॉइस नोट (Vernacular Audio Note)')}</span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {t('voiceCardSubtitle', 'मराठी किंवा हिंदीमध्ये लक्षणे सांगा (Max 30s)')}
          </p>
        </div>

        {recordedAudio && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{recordedAudio.durationSeconds.toFixed(1)}s • Audio</span>
          </span>
        )}
      </div>

      {/* Recording State */}
      {isRecording && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex flex-col items-center justify-center gap-3">
          <div className="flex items-center gap-1.5 h-8">
            {[40, 70, 90, 60, 100, 80, 50, 75].map((height, i) => (
              <div
                key={i}
                className="w-1.5 bg-red-500 rounded-full animate-pulse"
                style={{
                  height: `${height}%`,
                  animationDelay: `${i * 0.12}s`,
                  animationDuration: '0.6s',
                }}
              />
            ))}
          </div>

          <div className="text-center">
            <p className="text-lg font-mono font-bold text-red-600 dark:text-red-400">
              {formatTime(duration)} / 00:30.0
            </p>
            <p className={`text-[11px] text-red-700/80 dark:text-red-300/80 ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
              {t('recordingInProgress', 'रेकॉर्डिंग सुरू आहे... पूर्ण झाल्यावर थांबवा')}
            </p>
          </div>

          <button
            type="button"
            onClick={handleStopRecord}
            className={`field-touch-target px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-red-900/20 transition-all ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}
          >
            <Square className="w-4 h-4 fill-white" />
            <span>{t('stopRecording', 'थांबवा (Stop Recording)')}</span>
          </button>
        </div>
      )}

      {/* Idle State */}
      {!isRecording && !recordedAudio && (
        <div className="pt-1">
          <button
            type="button"
            onClick={handleStartRecord}
            className="field-touch-target w-full py-4 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/20 border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center gap-3 transition-colors text-slate-700 dark:text-slate-300 group"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-900/20 group-hover:scale-105 transition-transform">
              <Mic className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className={`text-xs font-bold text-slate-800 dark:text-slate-200 ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                {t('recordVoiceNote', 'व्हॉइस नोट रेकॉर्ड करा (Record Voice Note)')}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {t('speakSymptoms', 'लक्षणे बोलून सांगा (कमाल ३० सेकंद)')}
              </p>
            </div>
          </button>
        </div>
      )}

      {/* Recorded State */}
      {!isRecording && recordedAudio && (
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <p className={`text-xs font-bold text-slate-800 dark:text-slate-200 ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                  {t('audioReady', 'रेकॉर्ड केलेला ऑडिओ (Audio Ready)')}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t('durationSec', 'कालावधी')}: {recordedAudio.durationSeconds.toFixed(1)}s • {recordedAudio.mimeType}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTogglePlay}
              className={`field-touch-target px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-transform ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-white" />
                  <span>{t('pause', 'थांबवा')}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>{t('play', 'ऐका (Play)')}</span>
                </>
              )}
            </button>
          </div>

          <div className="flex justify-end pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
            <button
              type="button"
              onClick={handleResetRecord}
              className={`field-touch-target px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition-colors ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}
            >
              <RotateCcw className="w-3 h-3 text-slate-400" />
              <span>{t('rerecord', 'पुन्हा रेकॉर्ड करा (Re-record)')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


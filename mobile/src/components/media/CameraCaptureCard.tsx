import React, { useState } from 'react';
import { Camera, Image as ImageIcon, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { cameraService, CompressedPhotoResult } from '../../services/cameraService';
import { hapticsService } from '../../services/hapticsService';

export interface CameraCaptureCardProps {
  photo: CompressedPhotoResult | null;
  onPhotoCaptured: (photo: CompressedPhotoResult | null) => void;
}

export const CameraCaptureCard: React.FC<CameraCaptureCardProps> = ({
  photo,
  onPhotoCaptured,
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCapture = async (source: 'camera' | 'photos') => {
    try {
      setIsCapturing(true);
      setErrorMsg(null);
      await hapticsService.hapticLight();
      const result = await cameraService.captureLesionPhoto(source);
      onPhotoCaptured(result);
      await hapticsService.hapticMedium();
    } catch (err: any) {
      console.warn('Camera capture cancelled or failed:', err);
      // Only set error if not cancelled
      if (err?.message && !err.message.includes('cancel')) {
        setErrorMsg('फोटो काढण्यात अडचण आली. पुन्हा प्रयत्न करा.');
      }
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRemovePhoto = async () => {
    await hapticsService.hapticLight();
    onPhotoCaptured(null);
  };

  return (
    <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 lang-devanagari flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>१. जनावराचा फोटो (Lesion Photo)</span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            स्वयंचलित WebP कॉम्प्रेशन (&lt;300 KB)
          </p>
        </div>

        {photo && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>WebP • {photo.sizeKB} KB</span>
          </span>
        )}
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs lang-devanagari">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {!photo ? (
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            disabled={isCapturing}
            onClick={() => handleCapture('camera')}
            className="field-touch-target p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800/60 flex flex-col items-center justify-center gap-1.5 transition-transform active:scale-98 text-emerald-800 dark:text-emerald-300"
          >
            <Camera className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold lang-devanagari">कॅमेरा उघडा</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Take Photo</span>
          </button>

          <button
            type="button"
            disabled={isCapturing}
            onClick={() => handleCapture('photos')}
            className="field-touch-target p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-1.5 transition-transform active:scale-98 text-slate-700 dark:text-slate-300"
          >
            <ImageIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
            <span className="text-xs font-bold lang-devanagari">गॅलरी निवडा</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Upload Gallery</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-black/5 dark:bg-black/30">
            <img
              src={photo.dataUrl}
              alt="Cattle Lesion"
              className="w-full h-44 object-cover"
            />
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
              <span className="px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-mono backdrop-blur-xs">
                {photo.width} × {photo.height}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-600/90 text-white text-[10px] font-bold backdrop-blur-xs">
                ✓ संकलित
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleCapture('camera')}
              className="field-touch-target flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 lang-devanagari transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>बदला (Retake)</span>
            </button>
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="field-touch-target px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold lang-devanagari transition-colors"
            >
              काढून टाका (Remove)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

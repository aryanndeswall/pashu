import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';
import { Shield, Lock, Unlock, Delete, AlertCircle, Sparkles, LogOut } from 'lucide-react';
import { hapticsService } from '../services/hapticsService';

interface OfflinePinViewProps {
  mode: 'setup' | 'unlock';
}

export const OfflinePinView: React.FC<OfflinePinViewProps> = ({ mode }) => {
  const {
    userProfile,
    setupOfflinePin,
    unlockWithPin,
    logout,
    failedPinAttempts,
    lockoutUntil,
  } = useAuthStore();

  const { currentLanguage, t } = useLanguageStore();

  const [pin, setPin] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);

  // Monitor lockout countdown
  useEffect(() => {
    if (!lockoutUntil) {
      setLockoutRemaining(0);
      return;
    }

    const checkLockout = () => {
      const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
      setLockoutRemaining(remaining);
    };

    checkLockout();
    const timer = setInterval(checkLockout, 1000);
    return () => clearInterval(timer);
  }, [lockoutUntil]);

  const handleNumberClick = async (digit: string) => {
    if (lockoutRemaining > 0) return;
    if (pin.length >= 4) return;

    hapticsService.hapticLight();
    const nextPin = pin + digit;
    setPin(nextPin);
    setError(null);

    // When 4 digits are entered
    if (nextPin.length === 4) {
      if (mode === 'setup') {
        if (!isConfirming) {
          // Move to confirm step
          setFirstPin(nextPin);
          setPin('');
          setIsConfirming(true);
        } else {
          // Verify matching confirmation
          if (nextPin === firstPin) {
            await setupOfflinePin(nextPin);
          } else {
            setError(
              currentLanguage === 'en'
                ? 'PINs do not match. Please try again.'
                : 'सुरक्षा पिन जुळत नाही. कृपया पुन्हा प्रयत्न करा.'
            );
            setPin('');
            setFirstPin('');
            setIsConfirming(false);
            hapticsService.hapticError();
          }
        }
      } else {
        // Unlock mode
        const ok = await unlockWithPin(nextPin);
        if (!ok) {
          setError(
            currentLanguage === 'en'
              ? 'Incorrect Security PIN. Use 1234 for demo.'
              : 'चुकीचा सुरक्षा पिन. डेमोसाठी 1234 वापरा.'
          );
          setPin('');
        }
      }
    }
  };

  const handleBackspace = () => {
    if (lockoutRemaining > 0) return;
    if (pin.length > 0) {
      hapticsService.hapticLight();
      setPin(pin.slice(0, -1));
      setError(null);
    }
  };

  const handleClear = () => {
    hapticsService.hapticLight();
    setPin('');
    setError(null);
  };

  const handleFillDemoPin = async () => {
    if (mode === 'setup') {
      await setupOfflinePin('1234');
    } else {
      await unlockWithPin('1234');
    }
  };

  const getTitle = () => {
    if (mode === 'setup') {
      return isConfirming
        ? currentLanguage === 'en'
          ? 'Confirm 4-Digit Offline PIN'
          : 'सुरक्षा पिन पुन्हा प्रविष्ट करा'
        : currentLanguage === 'en'
        ? 'Set 4-Digit Offline PIN'
        : '४-अंकी ऑफलाइन सुरक्षा पिन तयार करा';
    }
    return currentLanguage === 'en'
      ? 'Unlock Offline Session'
      : 'ऑफलाइन सुरक्षा पिन प्रविष्ट करा';
  };

  const getSubtitle = () => {
    if (lockoutRemaining > 0) {
      return currentLanguage === 'en'
        ? `Too many failed attempts. Locked for ${lockoutRemaining}s.`
        : `अनेक अयशस्वी प्रयत्न. ${lockoutRemaining} सेकंदांसाठी लॉक केले.`;
    }
    if (mode === 'setup') {
      return currentLanguage === 'en'
        ? 'Used to quickly unlock the app in cellular dead zones without mobile OTP.'
        : 'नेटवर्क नसलेल्या भागात मोबाईल OTP शिवाय ॲप सुरू करण्यासाठी वापरला जातो.';
    }
    return `${userProfile.nameMarathi || userProfile.name} (${userProfile.role.toUpperCase()})`;
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="text-center space-y-2 pt-2">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-md mb-1">
          {mode === 'setup' ? <Shield className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
        </div>
        <h1 className={`text-xl font-black text-slate-900 dark:text-white ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
          {getTitle()}
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
          {getSubtitle()}
        </p>
      </div>

      {/* 4 Animated PIN Indicator Dots */}
      <div className="flex items-center justify-center gap-4 py-2">
        {[0, 1, 2, 3].map((index) => {
          const isFilled = index < pin.length;
          return (
            <div
              key={index}
              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                isFilled
                  ? 'bg-emerald-600 dark:bg-emerald-500 scale-125 ring-4 ring-emerald-500/20'
                  : 'bg-slate-300 dark:bg-slate-700'
              }`}
            />
          );
        })}
      </div>

      {/* Error / Lockout Alert */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center justify-center gap-1.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Custom 3x4 Numeric Keypad */}
      <div className="max-w-[280px] mx-auto grid grid-cols-3 gap-3.5">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => handleNumberClick(digit)}
            disabled={lockoutRemaining > 0}
            className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-2xl font-black text-slate-900 dark:text-white shadow-xs hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all duration-150 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {digit}
          </button>
        ))}

        {/* Clear Button */}
        <button
          type="button"
          onClick={handleClear}
          disabled={lockoutRemaining > 0}
          className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
        >
          {currentLanguage === 'en' ? 'CLEAR' : 'साफ करा'}
        </button>

        {/* Zero */}
        <button
          type="button"
          onClick={() => handleNumberClick('0')}
          disabled={lockoutRemaining > 0}
          className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-2xl font-black text-slate-900 dark:text-white shadow-xs hover:border-emerald-500 hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
        >
          0
        </button>

        {/* Backspace Button */}
        <button
          type="button"
          onClick={handleBackspace}
          disabled={lockoutRemaining > 0}
          aria-label="Delete last digit"
          className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
        >
          <Delete className="w-6 h-6" />
        </button>
      </div>

      {/* SIH Hackathon Demo 1-Click Fast Unlock */}
      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={handleFillDemoPin}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>⚡ SIH Demo: Instant Unlock with PIN (1234)</span>
        </button>

        {mode === 'unlock' && (
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-slate-500 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('switchUserAccount', 'दुसऱ्या खात्यातून लॉगिन करा (Switch Account)')}</span>
          </button>
        )}
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore, maskPhoneNumber } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';
import { ArrowLeft, ShieldCheck, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

export const OtpVerificationView: React.FC = () => {
  const {
    activeRole,
    pendingPhone,
    setLoginStep,
    verifyOtp,
    requestOtp,
    otpError,
    otpCountdown,
    decrementCountdown,
  } = useAuthStore();

  const { currentLanguage, t } = useLanguageStore();

  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 1-second interval for countdown timer
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const interval = setInterval(() => {
      decrementCountdown();
    }, 1000);
    return () => clearInterval(interval);
  }, [otpCountdown, decrementCountdown]);

  const handleDigitChange = (index: number, val: string) => {
    const char = val.replace(/\D/g, '').slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = char;
    setDigits(nextDigits);
    setLocalError(null);

    // Auto-advance to next input
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const nextDigits = ['', '', '', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      nextDigits[i] = pasted[i];
    }
    setDigits(nextDigits);
    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleAutoFillDemo = () => {
    setDigits(['1', '2', '3', '4', '5', '6']);
    setLocalError(null);
    inputRefs.current[5]?.focus();
  };

  const handleResend = async () => {
    if (otpCountdown > 0) return;
    setLocalError(null);
    await requestOtp(pendingPhone || '9822000412');
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length !== 6) {
      setLocalError(
        currentLanguage === 'en'
          ? 'Please enter all 6 digits of the OTP.'
          : 'कृपया सर्व ६ अंक प्रविष्ट करा.'
      );
      return;
    }

    setIsVerifying(true);
    const ok = await verifyOtp(code);
    setIsVerifying(false);

    if (!ok && !otpError) {
      setLocalError(
        currentLanguage === 'en'
          ? 'Verification failed. Use SIH Demo OTP 123456.'
          : 'पडताळणी अयशस्वी. डेमो OTP 123456 वापरा.'
      );
    }
  };

  const maskedDisplay = pendingPhone ? maskPhoneNumber(pendingPhone) : '+91 9822X-XX412';

  const roleAccent = {
    consumer: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    doctor: 'bg-blue-600 hover:bg-blue-700 text-white',
    admin: 'bg-purple-600 hover:bg-purple-700 text-white',
  }[activeRole];

  return (
    <div className="max-w-md mx-auto p-4 space-y-5 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => setLoginStep('login')}
          className="field-touch-target inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('changeMobile', 'नंबर बदला')}</span>
        </button>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          पायरी २/३ (Step 2/3)
        </span>
      </div>

      {/* Screen Title */}
      <div className="text-center space-y-1.5 pt-1">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-emerald-600 mb-1">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className={`text-xl font-black text-slate-900 dark:text-white ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
          {currentLanguage === 'en'
            ? 'Verify OTP'
            : 'ओटीपी पडताळणी करा'}
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          <span>{currentLanguage === 'en' ? 'Code sent to: ' : 'या क्रमांकावर पाठवलेला कोड: '}</span>
          <span className="font-bold text-slate-900 dark:text-white font-mono">{maskedDisplay}</span>
        </p>
      </div>

      {/* Verification Form */}
      <form onSubmit={handleVerify} className="space-y-5">
        {/* Error Alert */}
        {(localError || otpError) && (
          <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 rounded-xl p-3 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{localError || otpError}</span>
          </div>
        )}

        {/* 6 Digit Inputs */}
        <div className="flex items-center justify-center gap-2">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => { inputRefs.current[idx] = el; }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              className="w-12 h-14 text-center text-xl font-extrabold font-mono bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 focus:border-emerald-600 dark:focus:border-emerald-500 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs"
            />
          ))}
        </div>

        {/* SIH Hackathon Demo 1-Click Auto-Fill */}
        <button
          type="button"
          onClick={handleAutoFillDemo}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>⚡ SIH Demo: Auto-Fill OTP (123456)</span>
        </button>

        {/* Resend Countdown / Link */}
        <div className="text-center">
          {otpCountdown > 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {currentLanguage === 'en'
                ? `Resend OTP in ${otpCountdown}s`
                : `पुन्हा ओटीपी पाठवा: ${otpCountdown} सेकंद`}
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="field-touch-target text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 underline inline-flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t('resendOtp', 'पुन्हा ओटीपी पाठवा (Resend OTP)')}</span>
            </button>
          )}
        </div>

        {/* Submit 52px Button */}
        <button
          type="submit"
          disabled={isVerifying}
          className={`w-full min-h-[52px] rounded-xl text-sm font-bold shadow-sm transition-transform active:scale-[0.98] flex items-center justify-center gap-2 ${roleAccent} ${
            isVerifying ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          <span>
            {isVerifying
              ? t('verifying', 'पडताळणी करत आहे...')
              : t('verifyAndContinue', 'सत्यापित करा व पुढे जा (Verify & Continue)')}
          </span>
        </button>
      </form>
    </div>
  );
};

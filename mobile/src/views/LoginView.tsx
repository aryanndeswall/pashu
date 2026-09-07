import React, { useState } from 'react';
import { useAuthStore, DEMO_PERSONAS } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';
import { ArrowLeft, Phone, ShieldCheck, Sparkles, AlertCircle, Volume2 } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { activeRole, setLoginStep, requestOtp, otpError } = useAuthStore();
  const { currentLanguage, setLanguage, t } = useLanguageStore();

  const [phone, setPhone] = useState('');
  const [secondaryId, setSecondaryId] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleMeta = {
    consumer: {
      badge:
        currentLanguage === 'en'
          ? 'Livestock Owner / Farmer'
          : currentLanguage === 'hi'
          ? 'पशुपालक (Livestock Owner)'
          : 'पशुपालक (Livestock Owner)',
      badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      accentBorder: 'focus:border-emerald-500 focus:ring-emerald-500/20',
      demoPhone: '9822000412',
      demoId: '',
      voicePrompt:
        currentLanguage === 'en'
          ? 'Please enter your 10-digit mobile number.'
          : currentLanguage === 'hi'
          ? 'कृपया अपना १०-अंकीय मोबाइल नंबर दर्ज करें।'
          : 'कृपया आपला १०-अंकी मोबाईल नंबर प्रविष्ट करा.',
    },
    doctor: {
      badge:
        currentLanguage === 'en'
          ? 'Veterinarian & Para-vet'
          : currentLanguage === 'hi'
          ? 'पशु चिकित्सक / पशु सखी (Veterinarian)'
          : 'पशुवैद्य / पशु सखी (Veterinarian)',
      badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-800',
      btnClass: 'bg-blue-600 hover:bg-blue-700 text-white',
      accentBorder: 'focus:border-blue-500 focus:ring-blue-500/20',
      demoPhone: '9423000819',
      demoId: 'MH-VET-2024-8819',
      voicePrompt:
        currentLanguage === 'en'
          ? 'Please enter your mobile number and VCI License / Sakhi ID.'
          : currentLanguage === 'hi'
          ? 'कृपया अपना मोबाइल नंबर व पशु चिकित्सा परिषद पंजीकरण दर्ज करें।'
          : 'कृपया आपला मोबाईल नंबर व पशुवैद्यकीय परवाना क्रमांक प्रविष्ट करा.',
    },
    admin: {
      badge:
        currentLanguage === 'en'
          ? 'District Officer (DVO)'
          : currentLanguage === 'hi'
          ? 'जिला अधिकारी (District Officer)'
          : 'जिल्हा अधिकारी (District Officer)',
      badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-800',
      btnClass: 'bg-purple-600 hover:bg-purple-700 text-white',
      accentBorder: 'focus:border-purple-500 focus:ring-purple-500/20',
      demoPhone: '9158000001',
      demoId: 'DVO-AHM-001',
      voicePrompt:
        currentLanguage === 'en'
          ? 'Please enter your official mobile number and authorization passkey.'
          : currentLanguage === 'hi'
          ? 'कृपया अधिकृत मोबाइल नंबर व शासकीय पासकोड दर्ज करें।'
          : 'कृपया अधिकृत मोबाईल नंबर व शासकीय पासकोड प्रविष्ट करा.',
    },
  }[activeRole];

  const handlePhoneChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setPhone(cleaned);
    if (localError) setLocalError(null);
  };

  const handleFillDemo = () => {
    setPhone(roleMeta.demoPhone);
    if (roleMeta.demoId) setSecondaryId(roleMeta.demoId);
    setLocalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (phone.length !== 10) {
      setLocalError(
        currentLanguage === 'en'
          ? 'Please enter a valid 10-digit Indian mobile number.'
          : currentLanguage === 'hi'
          ? 'कृपया वैध १०-अंकीय मोबाइल नंबर दर्ज करें।'
          : 'कृपया वैध १०-अंकी मोबाईल नंबर प्रविष्ट करा.'
      );
      return;
    }

    if (activeRole === 'doctor' && !secondaryId.trim()) {
      setLocalError(
        currentLanguage === 'en'
          ? 'Veterinary Council registration / Sakhi ID is required.'
          : currentLanguage === 'hi'
          ? 'पशु चिकित्सा परिषद पंजीकरण क्रमांक या सखी आईडी आवश्यक है।'
          : 'पशुवैद्यकीय नोंदणी क्रमांक किंवा सखी आयडी आवश्यक आहे.'
      );
      return;
    }

    if (activeRole === 'admin' && !secondaryId.trim()) {
      setLocalError(
        currentLanguage === 'en'
          ? 'District officer authorization passkey is required.'
          : currentLanguage === 'hi'
          ? 'जिला अधिकारी शासकीय पासकोड आवश्यक है।'
          : 'जिल्हा अधिकारी शासकीय पासकोड आवश्यक आहे.'
      );
      return;
    }

    setIsSubmitting(true);
    const ok = await requestOtp(phone, secondaryId);
    setIsSubmitting(false);

    if (!ok) {
      setLocalError(
        currentLanguage === 'en'
          ? 'Could not send OTP. Please check mobile number format.'
          : currentLanguage === 'hi'
          ? 'ओटीपी नहीं भेजा जा सका। कृपया नंबर जांचें।'
          : 'ओटीपी पाठवता आला नाही. कृपया नंबर तपासा.'
      );
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-5 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => setLoginStep('portal')}
          className="field-touch-target inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>
            {t(
              'backToPortal',
              currentLanguage === 'en'
                ? 'Back to Portal'
                : currentLanguage === 'hi'
                ? 'पीछे (Portal)'
                : 'मागे (Portal)'
            )}
          </span>
        </button>

        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${roleMeta.badgeClass}`}>
          {roleMeta.badge}
        </span>
      </div>

      {/* 1-Tap Quick Language Switcher Bar */}
      <div className="flex items-center justify-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 max-w-xs mx-auto shadow-inner">
        {(['hi', 'mr', 'en'] as const).map((lang) => {
          const isActive = currentLanguage === lang;
          const label = lang === 'hi' ? '🇮🇳 हिंदी' : lang === 'mr' ? '🇮🇳 मराठी' : '🌐 English';
          return (
            <button
              key={lang}
              type="button"
              onClick={() => setLanguage(lang)}
              className={`field-touch-target flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Screen Title & Voice Prompt Banner */}
      <div className="space-y-1">
        <h1 className={`text-xl font-black text-slate-900 dark:text-white ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
          {currentLanguage === 'en'
            ? 'Sign In with Mobile'
            : currentLanguage === 'hi'
            ? 'मोबाइल द्वारा लॉगिन करें'
            : 'मोबाईलद्वारे लॉगिन करा'}
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          {currentLanguage === 'en'
            ? 'We will send a 6-digit OTP code to verify your identity.'
            : currentLanguage === 'hi'
            ? 'आपकी पहचान सत्यापित करने के लिए ६-अंकों का OTP भेजा जाएगा।'
            : 'तुमची ओळख पडताळण्यासाठी ६-अंकी OTP पाठवला जाईल.'}
        </p>

        {/* Vernacular Voice Prompt Banner */}
        <div className="mt-2.5 flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-[11px] text-slate-700 dark:text-slate-300">
          <Volume2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="lang-devanagari">{roleMeta.voicePrompt}</span>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Error Alert */}
        {(localError || otpError) && (
          <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 rounded-xl p-3 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{localError || otpError}</span>
          </div>
        )}

        {/* Mobile Number Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            {t('mobileLabel', 'मोबाईल नंबर (Mobile Number)')} <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center gap-1.5 text-xs font-extrabold text-slate-500 dark:text-slate-400 select-none pointer-events-none">
              <Phone className="w-3.5 h-3.5" />
              <span>+91</span>
            </div>
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="98XXXXXXXX"
              maxLength={10}
              autoFocus
              className={`w-full min-h-[52px] pl-16 pr-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-base font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 ${roleMeta.accentBorder}`}
            />
          </div>
        </div>

        {/* Doctor Specific Field: VCI License */}
        {activeRole === 'doctor' && (
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {t('vciLabel', 'पशुवैद्यकीय परिषद नोंदणी / सखी आयडी (VCI Reg No / Sakhi ID)')} <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <ShieldCheck className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={secondaryId}
                onChange={(e) => setSecondaryId(e.target.value)}
                placeholder="MH-VET-2024-XXXX / SAKHI-01"
                className={`w-full min-h-[52px] pl-10 pr-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 ${roleMeta.accentBorder}`}
              />
            </div>
          </div>
        )}

        {/* Admin Specific Field: Admin Passkey */}
        {activeRole === 'admin' && (
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {t('adminPasskeyLabel', 'शासकीय पासकोड / Authorization Passkey')} <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <ShieldCheck className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="password"
                value={secondaryId}
                onChange={(e) => setSecondaryId(e.target.value)}
                placeholder="DVO-AHM-001"
                className={`w-full min-h-[52px] pl-10 pr-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 ${roleMeta.accentBorder}`}
              />
            </div>
          </div>
        )}

        {/* SIH Hackathon Demo Quick Fill Button */}
        <button
          type="button"
          onClick={handleFillDemo}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>
            {t(
              'fillDemoCredentials',
              currentLanguage === 'en'
                ? '⚡ SIH Demo: Fill Test Persona Details'
                : currentLanguage === 'hi'
                ? '⚡ SIH Demo: टेस्ट विवरण भरें (Auto-Fill)'
                : '⚡ SIH Demo: चाचणी तपशील भरा'
            )}
          </span>
        </button>

        {/* Primary 52px Action Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full min-h-[52px] rounded-xl text-sm font-bold shadow-sm transition-transform active:scale-[0.98] flex items-center justify-center gap-2 ${roleMeta.btnClass} ${
            isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          <span>
            {isSubmitting
              ? t(
                  'sendingOtp',
                  currentLanguage === 'en'
                    ? 'Sending OTP...'
                    : currentLanguage === 'hi'
                    ? 'ओटीपी भेजा जा रहा है...'
                    : 'ओटीपी पाठवत आहे...'
                )
              : t(
                  'sendOtpButton',
                  currentLanguage === 'en'
                    ? 'Send OTP'
                    : currentLanguage === 'hi'
                    ? 'ओटीपी भेजें (Send OTP)'
                    : 'ओटीपी पाठवा (Send OTP)'
                )}
          </span>
        </button>
      </form>
    </div>
  );
};

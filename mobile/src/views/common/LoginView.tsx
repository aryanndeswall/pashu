import React, { useState } from 'react';
import {
  useAuthStore,
  REAL_FARMER_USERS,
  REAL_VET_USERS,
  REAL_ADMIN_USERS,
} from '../../store/authStore';
import { useLanguageStore } from '../../store/languageStore';
import {
  ArrowLeft,
  Mail,
  Lock,
  AlertCircle,
  Volume2,
  User,
  Phone,
  BadgeCheck,
  ShieldAlert,
  Building2,
  Sparkles,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const {
    activeRole,
    setLoginStep,
    loginWithEmail,
    registerWithEmail,
    loginAsSpecificUser,
    otpError,
  } = useAuthStore();
  const { currentLanguage, setLanguage, t } = useLanguageStore();

  // Admin is always signin-only — no self-registration
  const isAdmin = activeRole === 'admin';
  const isDoctor = activeRole === 'doctor';

  const [mode, setMode] = useState<'signin' | 'signup'>(isAdmin ? 'signin' : 'signin');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      badgeClass:
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      accentBorder: 'focus:border-emerald-500 focus:ring-emerald-500/20',
      voicePrompt:
        currentLanguage === 'en'
          ? 'Enter email and password to access or create your farmer account.'
          : 'खाते ॲक्सेस किंवा तयार करण्यासाठी ईमेल व पासवर्ड टाका.',
    },
    doctor: {
      badge:
        currentLanguage === 'en'
          ? 'Veterinarian & Para-vet'
          : currentLanguage === 'hi'
          ? 'पशु चिकित्सक / पशु सखी'
          : 'पशुवैद्य / पशु सखी',
      badgeClass:
        'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-800',
      btnClass: 'bg-blue-600 hover:bg-blue-700 text-white',
      accentBorder: 'focus:border-blue-500 focus:ring-blue-500/20',
      voicePrompt:
        currentLanguage === 'en'
          ? 'VCI License / Para-vet ID required for all veterinary accounts.'
          : 'सर्व पशुवैद्यकीय खात्यांसाठी VCI परवाना क्रमांक आवश्यक आहे.',
    },
    admin: {
      badge:
        currentLanguage === 'en'
          ? 'District Officer (DVO)'
          : currentLanguage === 'hi'
          ? 'जिला अधिकारी (DVO)'
          : 'जिल्हा अधिकारी (DVO)',
      badgeClass:
        'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-800',
      btnClass: 'bg-purple-600 hover:bg-purple-700 text-white',
      accentBorder: 'focus:border-purple-500 focus:ring-purple-500/20',
      voicePrompt:
        currentLanguage === 'en'
          ? 'Admin accounts are provisioned by AHVD. Contact your district IT cell if locked out.'
          : 'प्रशासक खाती AHVD कार्यालयाद्वारे तयार केली जातात.',
    },
  }[activeRole];

  const secondaryIdMeta = {
    consumer: null,
    doctor: {
      label: currentLanguage === 'en' ? 'VCI License / Registration No.' : 'VCI परवाना / नोंदणी क्रमांक',
      placeholder: 'MH-VET-2024-8819',
      hint:
        currentLanguage === 'en'
          ? 'Format: MH-VET-YYYY-NNNN or MH-PARA-NNNN'
          : 'उदा: MH-VET-2024-8819 किंवा MH-PARA-1234',
      Icon: BadgeCheck,
    },
    admin: {
      label: currentLanguage === 'en' ? 'Employee / DVO ID' : 'कर्मचारी / DVO आयडी',
      placeholder: 'DVO-AHM-001',
      hint:
        currentLanguage === 'en'
          ? 'Issued by District Animal Husbandry Department'
          : 'जिल्हा पशुसंवर्धन विभागाद्वारे जारी',
      Icon: Building2,
    },
  }[activeRole];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Name required for signup
    if (mode === 'signup' && !name.trim()) {
      setLocalError(currentLanguage === 'en' ? 'Please enter your full name.' : 'कृपया पूर्ण नाव प्रविष्ट करा.');
      return;
    }

    if (!email || !email.includes('@')) {
      setLocalError(
        currentLanguage === 'en' ? 'Please enter a valid email address.' : 'कृपया वैध ईमेल दर्ज करें।',
      );
      return;
    }

    if (password.length < 6) {
      setLocalError(
        currentLanguage === 'en'
          ? 'Password must be at least 6 characters.'
          : 'पासवर्ड कम से कम ६ अक्षरों का होना चाहिए।',
      );
      return;
    }

    // Secondary ID required for doctor (always) and admin (always)
    if ((isDoctor || isAdmin) && !secondaryId.trim()) {
      const label = isDoctor
        ? (currentLanguage === 'en' ? 'VCI License number is required.' : 'VCI परवाना क्रमांक आवश्यक आहे.')
        : (currentLanguage === 'en' ? 'Employee ID is required.' : 'कर्मचारी आयडी आवश्यक आहे.');
      setLocalError(label);
      return;
    }

    setIsSubmitting(true);
    let ok = false;
    if (mode === 'signup') {
      ok = await registerWithEmail(email, password, name, phone, secondaryId.trim());
    } else {
      ok = await loginWithEmail(email, password, secondaryId.trim() || undefined);
    }
    setIsSubmitting(false);

    if (!ok && !otpError) {
      setLocalError(
        mode === 'signup'
          ? 'Registration failed. Please verify your details.'
          : 'Login failed. Please check your credentials.',
      );
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => setLoginStep('portal')}
          className="field-touch-target inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('backToPortal', currentLanguage === 'en' ? 'Back to Portal' : 'मागे (Portal)')}</span>
        </button>
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${roleMeta.badgeClass}`}>
          {roleMeta.badge}
        </span>
      </div>

      {/* Language switcher */}
      <div className="flex items-center justify-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 max-w-xs mx-auto shadow-inner">
        {(['hi', 'mr', 'en'] as const).map((lang) => {
          const isActive = currentLanguage === lang;
          const label = lang === 'hi' ? '🇮🇳 हिंदी' : lang === 'mr' ? '🇮🇳 मराठी' : '🌐 English';
          return (
            <button
              key={lang}
              type="button"
              onClick={() => setLanguage(lang)}
              className={`field-touch-target flex-1 py-1 px-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                isActive ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Sign In / Register toggle — Admin sees sign-in only */}
      {!isAdmin ? (
        <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-1 rounded-2xl border border-slate-300 dark:border-slate-700">
          <button
            type="button"
            onClick={() => { setMode('signin'); setLocalError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'signin'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {currentLanguage === 'en' ? 'Sign In' : 'लॉगिन करा'}
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setLocalError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'signup'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {currentLanguage === 'en' ? 'Register' : 'नवीन नोंदणी करा'}
          </button>
        </div>
      ) : (
        /* Admin: no self-registration banner */
        <div className="flex items-start gap-2.5 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 rounded-xl p-3">
          <ShieldAlert className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-purple-800 dark:text-purple-300 font-medium leading-relaxed">
            {currentLanguage === 'en'
              ? 'Admin accounts are provisioned by the AHVD IT cell — self-registration is not permitted. Contact your district office if you need access.'
              : 'प्रशासक खाती AHVD कार्यालयाद्वारे तयार केली जातात — स्व-नोंदणी परवानगी नाही. ऍक्सेसची गरज असल्यास जिल्हा कार्यालयाशी संपर्क करा.'}
          </p>
        </div>
      )}

      <div className="space-y-1">
        <h1 className={`text-xl font-black text-slate-900 dark:text-white ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
          {isAdmin
            ? (currentLanguage === 'en' ? 'Admin Sign In' : 'प्रशासक लॉगिन')
            : mode === 'signin'
            ? (currentLanguage === 'en' ? 'Sign In' : 'लॉगिन करा')
            : (currentLanguage === 'en' ? 'Create Account' : 'नवीन खाते तयार करा')}
        </h1>
        <div className="mt-2 flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-[11px] text-slate-700 dark:text-slate-300">
          <Volume2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="lang-devanagari">{roleMeta.voicePrompt}</span>
        </div>
      </div>

      {/* 1-Tap Real User Quick Select */}
      <div className="p-3 bg-slate-100 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{currentLanguage === 'en' ? 'Quick 1-Tap Login as Real User:' : 'थेट प्रत्यक्ष युजर म्हणून लॉगिन करा:'}</span>
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(isDoctor ? REAL_VET_USERS : isAdmin ? REAL_ADMIN_USERS : REAL_FARMER_USERS).map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => loginAsSpecificUser(user)}
              className="text-[11px] py-1 px-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-200 hover:border-emerald-500 hover:text-emerald-600 active:scale-95 transition-all flex items-center gap-1 shadow-2xs"
            >
              <span>{user.avatarEmoji}</span>
              <span>{currentLanguage === 'en' ? user.name : (user.nameMarathi || user.name)}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
        {(localError || otpError) && (
          <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 rounded-xl p-3 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{localError || otpError}</span>
          </div>
        )}

        {/* Name — signup only, not for admin */}
        {mode === 'signup' && !isAdmin && (
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {currentLanguage === 'en' ? 'Full Name' : 'पूर्ण नाव'} <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={currentLanguage === 'en' ? 'e.g. Ramesh Patil / Dr. Anjali' : 'उदा. रमेश पाटील'}
                className={`w-full min-h-[50px] pl-10 pr-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 ${roleMeta.accentBorder}`}
              />
            </div>
          </div>
        )}

        {/* Phone — consumer signup only */}
        {mode === 'signup' && !isAdmin && !isDoctor && (
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {currentLanguage === 'en' ? 'Mobile Number' : 'मोबाईल नंबर'}
            </label>
            <div className="relative flex items-center">
              <Phone className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9822000412"
                className={`w-full min-h-[50px] pl-10 pr-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 ${roleMeta.accentBorder}`}
              />
            </div>
          </div>
        )}

        {/* Email */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            {t('emailLabel', 'Email Address')} <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center">
            <Mail className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isAdmin ? 'dvo@ahvd.gov.in' : 'user@village.com'}
              className={`w-full min-h-[50px] pl-10 pr-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 ${roleMeta.accentBorder}`}
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            {t('passwordLabel', 'Password')} <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full min-h-[50px] pl-10 pr-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 ${roleMeta.accentBorder}`}
            />
          </div>
        </div>

        {/* Secondary ID — Doctor & Admin */}
        {secondaryIdMeta && (
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {secondaryIdMeta.label} <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <secondaryIdMeta.Icon className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={secondaryId}
                onChange={(e) => setSecondaryId(e.target.value)}
                placeholder={secondaryIdMeta.placeholder}
                className={`w-full min-h-[50px] pl-10 pr-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 ${roleMeta.accentBorder}`}
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-1">{secondaryIdMeta.hint}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full min-h-[52px] rounded-xl text-sm font-bold shadow-sm transition-transform active:scale-[0.98] flex items-center justify-center gap-2 ${roleMeta.btnClass} ${
            isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          <span>
            {isSubmitting
              ? mode === 'signup'
                ? 'Creating account...'
                : 'Signing in...'
              : mode === 'signup'
              ? 'Create Account & Sign In'
              : 'Sign In'}
          </span>
        </button>
      </form>
    </div>
  );
};

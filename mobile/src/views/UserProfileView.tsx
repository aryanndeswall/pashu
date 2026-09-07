import React from 'react';
import { useAuthStore, UserRole, DEMO_PERSONAS } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';
import { useSyncStore } from '../store/syncStore';
import {
  User,
  ShieldCheck,
  MapPin,
  KeyRound,
  Globe,
  RefreshCw,
  LogOut,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Users,
} from 'lucide-react';

interface UserProfileViewProps {
  onClose?: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ onClose }) => {
  const { userProfile, activeRole, switchRole, logout, setLoginStep } = useAuthStore();
  const { currentLanguage, setLanguage, t } = useLanguageStore();
  const pendingCount = useSyncStore((state) => state.pendingCount);

  const roleStyles = {
    consumer: {
      badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
      tag:
        currentLanguage === 'en'
          ? 'Farmer'
          : currentLanguage === 'hi'
          ? 'पशुपालक (किसान)'
          : 'पशुपालक (Farmer)',
    },
    doctor: {
      badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300',
      tag:
        currentLanguage === 'en'
          ? 'Veterinarian'
          : currentLanguage === 'hi'
          ? 'पशु चिकित्सक'
          : 'पशुवैद्य (Veterinarian)',
    },
    admin: {
      badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300',
      tag:
        currentLanguage === 'en'
          ? 'District Officer (DVO)'
          : currentLanguage === 'hi'
          ? 'जिला अधिकारी (DVO)'
          : 'जिल्हा अधिकारी (DVO)',
    },
  }[activeRole];

  const handleChangePin = () => {
    setLoginStep('pin_setup');
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-5 animate-in fade-in duration-200 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="field-touch-target inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>
              {t(
                'backToDashboard',
                currentLanguage === 'en'
                  ? 'Back'
                  : currentLanguage === 'hi'
                  ? 'पीछे (Back)'
                  : 'मागे (Back)'
              )}
            </span>
          </button>
        )}
        <h1 className="text-base font-bold text-slate-900 dark:text-white">
          {t(
            'userProfileTitle',
            currentLanguage === 'en'
              ? 'User Profile & Security'
              : currentLanguage === 'hi'
              ? 'उपयोगकर्ता प्रोफ़ाइल व सुरक्षा'
              : 'वापरकर्ता प्रोफाइल व सुरक्षा'
          )}
        </h1>
        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${roleStyles.badge}`}>
          {roleStyles.tag}
        </span>
      </div>

      {/* Main Profile Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-3">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
              {currentLanguage === 'hi'
                ? userProfile.nameHindi || userProfile.name
                : currentLanguage === 'mr'
                ? userProfile.nameMarathi || userProfile.name
                : userProfile.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {currentLanguage === 'hi'
                ? userProfile.titleHindi || userProfile.titleEnglish
                : currentLanguage === 'mr'
                ? userProfile.titleMarathi || userProfile.titleEnglish
                : userProfile.titleEnglish}
            </p>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-600 dark:text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span className="truncate">{userProfile.block}, {userProfile.district}</span>
            </div>
          </div>
        </div>

        {/* DPDP Act 2023 Masked Identifier Box */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {currentLanguage === 'en'
                ? 'Registered Mobile (DPDP Act 2023)'
                : currentLanguage === 'hi'
                ? 'पंजीकृत मोबाइल (DPDP Act 2023)'
                : 'नोंदणीकृत मोबाईल (DPDP Act 2023)'}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>
                {currentLanguage === 'en'
                  ? 'Verified'
                  : currentLanguage === 'hi'
                  ? 'सत्यापित'
                  : 'सत्यापित'}
              </span>
            </span>
          </div>
          <p className="text-sm font-bold font-mono text-slate-900 dark:text-white tracking-wide">
            {userProfile.mobileNumberMasked}
          </p>
          {userProfile.licenseOrId && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              {currentLanguage === 'en'
                ? 'ID / License: '
                : currentLanguage === 'hi'
                ? 'आईडी / लाइसेंस: '
                : 'ID / परवाना: '}
              {userProfile.licenseOrId}
            </p>
          )}
        </div>
      </div>

      {/* Offline Status & Security Actions */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          {currentLanguage === 'en'
            ? 'Security & Offline Management'
            : currentLanguage === 'hi'
            ? 'सुरक्षा व ऑफ़लाइन प्रबंधन'
            : 'सुरक्षा व ऑफलाइन व्यवस्थापन'}
        </h3>

        {/* Change Offline PIN */}
        <button
          type="button"
          onClick={handleChangePin}
          className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {currentLanguage === 'en'
                  ? 'Change 4-Digit Offline PIN'
                  : currentLanguage === 'hi'
                  ? '४-अंकीय ऑफ़लाइन सुरक्षा पिन बदलें'
                  : '४-अंकी ऑफलाइन सुरक्षा पिन बदला'}
              </p>
              <p className="text-[11px] text-slate-500">
                {currentLanguage === 'en'
                  ? 'Used for fast offline login without mobile OTP'
                  : currentLanguage === 'hi'
                  ? 'नेटवर्क न होने पर त्वरित लॉगिन के लिए सुरक्षा पिन'
                  : 'नेटवर्क नसताना जलद लॉगिनसाठी सुरक्षा पिन'}
              </p>
            </div>
          </div>
        </button>

        {/* Offline Queue Status */}
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {currentLanguage === 'en'
                  ? 'Offline Sync Queue'
                  : currentLanguage === 'hi'
                  ? 'ऑफ़लाइन सिंक कतार (Sync Queue)'
                  : 'ऑफलाइन सिंक रांग (Sync Queue)'}
              </p>
              <p className="text-[11px] text-slate-500">
                {pendingCount === 0
                  ? currentLanguage === 'en'
                    ? 'All records safely stored in cloud'
                    : currentLanguage === 'hi'
                    ? 'सभी डेटा क्लाउड पर सुरक्षित है'
                    : 'सर्व डेटा क्लाउडवर सुरक्षित आहे'
                  : currentLanguage === 'en'
                  ? `${pendingCount} report(s) pending sync`
                  : currentLanguage === 'hi'
                  ? `${pendingCount} रिपोर्ट सिंक बाकी हैं`
                  : `${pendingCount} अहवाल सिंक बाकी आहेत`}
              </p>
            </div>
          </div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            pendingCount === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {pendingCount === 0 ? 'Up-to-Date' : `${pendingCount} Pending`}
          </span>
        </div>
      </div>

      {/* Language Preference */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          {currentLanguage === 'en'
            ? 'Language Preference'
            : currentLanguage === 'hi'
            ? 'भाषा प्राथमिकता (Language)'
            : 'भाषा प्राधान्य (Language)'}
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {(['hi', 'en', 'mr'] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setLanguage(lang)}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                currentLanguage === lang
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>{lang === 'hi' ? 'हिंदी' : lang === 'mr' ? 'मराठी' : 'English'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* SIH Hackathon Demo Quick Role Switcher */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 px-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>SIH Demo: 1-Tap Persona Switcher</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => switchRole('consumer')}
            className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-colors ${
              activeRole === 'consumer'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            👨‍🌾 {currentLanguage === 'en' ? 'Farmer' : currentLanguage === 'hi' ? 'पशुपालक' : 'पशुपालक'}
          </button>
          <button
            type="button"
            onClick={() => switchRole('doctor')}
            className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-colors ${
              activeRole === 'doctor'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            🩺 {currentLanguage === 'en' ? 'Doctor' : currentLanguage === 'hi' ? 'पशु चिकित्सक' : 'पशुवैद्य'}
          </button>
          <button
            type="button"
            onClick={() => switchRole('admin')}
            className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-colors ${
              activeRole === 'admin'
                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            🏛️ {currentLanguage === 'en' ? 'Admin' : currentLanguage === 'hi' ? 'जिला अधिकारी' : 'DVO'}
          </button>
        </div>
      </div>

      {/* Logout Action */}
      <div className="pt-3">
        <button
          type="button"
          onClick={logout}
          className="w-full min-h-[52px] rounded-xl border-2 border-red-500/80 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
        >
          <LogOut className="w-4 h-4" />
          <span>
            {t(
              'signOutButton',
              currentLanguage === 'en'
                ? 'Sign Out'
                : currentLanguage === 'hi'
                ? 'लॉगआउट करें (Sign Out)'
                : 'लॉगआउट करा (Sign Out)'
            )}
          </span>
        </button>
      </div>
    </div>
  );
};

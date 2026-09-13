import React, { useState } from 'react';
import {
  useAuthStore,
  UserRole,
  REAL_FARMER_USERS,
  REAL_VET_USERS,
  REAL_ADMIN_USERS,
  RealUserAccount,
} from '../../store/authStore';
import { useLanguageStore } from '../../store/languageStore';
import {
  Shield,
  UserCheck,
  Stethoscope,
  Building2,
  ArrowRight,
  Globe,
  MapPin,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const RolePortalView: React.FC = () => {
  const { selectRoleAndProceed, loginAsSpecificUser } = useAuthStore();
  const { currentLanguage, setLanguage, t } = useLanguageStore();
  const [activeUserTab, setActiveUserTab] = useState<'farmers' | 'vets' | 'admin'>('farmers');

  const personas = [
    {
      role: 'consumer' as UserRole,
      titleMarathi: 'पशुपालक (शेतकरी)',
      titleHindi: 'पशुपालक (किसान)',
      titleEnglish: 'Livestock Owner / Farmer',
      subtitleMarathi: 'दुग्ध उत्पादक, शेळी-मेंढी पालक व ग्रामीण पशुपालक',
      subtitleHindi: 'दुग्ध उत्पादक, बकरी पालक व ग्रामीण पशुपालक',
      subtitleEnglish: 'Dairy farmer, smallholder & rural livestock owner',
      icon: UserCheck,
      color: {
        border: 'border-emerald-500/40 hover:border-emerald-600',
        bg: 'bg-emerald-50/40 dark:bg-emerald-950/20',
        iconBg: 'bg-emerald-600 text-white',
        btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        tag: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
      },
      tagKey: 'tagOtpLogin',
      tagFallback: 'मोबाईल OTP लॉगिन',
    },
    {
      role: 'doctor' as UserRole,
      titleMarathi: 'पशुवैद्य / पशु सखी',
      titleHindi: 'पशु चिकित्सक / पशु सखी',
      titleEnglish: 'Veterinarian & Para-vet',
      subtitleMarathi: 'पशुधन विकास अधिकारी (LDO) व क्षेत्रीय पॅरा-वेट',
      subtitleHindi: 'पशुधन विकास अधिकारी (LDO) व क्षेत्रीय पैरा-वेट',
      subtitleEnglish: 'Field Veterinarian, Para-vet & Pashu Sakhi',
      icon: Stethoscope,
      color: {
        border: 'border-blue-500/40 hover:border-blue-600',
        bg: 'bg-blue-50/40 dark:bg-blue-950/20',
        iconBg: 'bg-blue-600 text-white',
        btn: 'bg-blue-600 hover:bg-blue-700 text-white',
        tag: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300',
      },
      tagKey: 'tagVciLogin',
      tagFallback: 'VCI नोंदणी / परवाना लॉगिन',
    },
    {
      role: 'admin' as UserRole,
      titleMarathi: 'जिल्हा अधिकारी (DVO)',
      titleHindi: 'जिला पशुपालन अधिकारी (DVO)',
      titleEnglish: 'District Animal Husbandry Officer',
      subtitleMarathi: 'जिल्हा पशुसंवर्धन विभाग व महामारी नियंत्रण केंद्र',
      subtitleHindi: 'जिला पशुपालन विभाग व महामारी नियंत्रण केंद्र',
      subtitleEnglish: 'District Animal Husbandry & Epidemiology Unit',
      icon: Building2,
      color: {
        border: 'border-purple-500/40 hover:border-purple-600',
        bg: 'bg-purple-50/40 dark:bg-purple-950/20',
        iconBg: 'bg-purple-600 text-white',
        btn: 'bg-purple-600 hover:bg-purple-700 text-white',
        tag: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300',
      },
      tagKey: 'tagAdminLogin',
      tagFallback: 'शासकीय पासकोड लॉगिन',
    },
  ];

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Branding Header */}
      <div className="text-center space-y-2 pt-3">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 mb-1">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className={`text-2xl font-black text-slate-900 dark:text-white tracking-tight ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
          {t('rolePortalTitle', 'पशु सुरक्षा — प्रवेश पोर्टल')}
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium max-w-xs mx-auto">
          {t('rolePortalSubtitle', 'National Livestock Health Surveillance & Biohazard Containment System')}
        </p>
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

      {/* Real Field Users & 1-Tap Evaluation Switcher */}
      <div className="p-3.5 bg-gradient-to-br from-slate-50 via-emerald-50/20 to-blue-50/20 dark:from-slate-900/90 dark:via-emerald-950/10 dark:to-blue-950/10 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {currentLanguage === 'en' ? 'Select Active Field User (Real Personas)' : 'प्रत्यक्ष क्षेत्रीय युजर्स (Real Users)'}
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            1-Tap Login
          </span>
        </div>

        {/* Tab Pills */}
        <div className="flex bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveUserTab('farmers')}
            className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all ${
              activeUserTab === 'farmers'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            👨‍🌾 {currentLanguage === 'en' ? 'Farmers (4)' : 'शेतकरी (४)'}
          </button>
          <button
            type="button"
            onClick={() => setActiveUserTab('vets')}
            className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all ${
              activeUserTab === 'vets'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            👩‍⚕️ {currentLanguage === 'en' ? 'Doctors & Para (4)' : 'पशुवैद्य (४)'}
          </button>
          <button
            type="button"
            onClick={() => setActiveUserTab('admin')}
            className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all ${
              activeUserTab === 'admin'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🏛️ {currentLanguage === 'en' ? 'Admin' : 'प्रशासक'}
          </button>
        </div>

        {/* User Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(activeUserTab === 'farmers' ? REAL_FARMER_USERS : activeUserTab === 'vets' ? REAL_VET_USERS : REAL_ADMIN_USERS).map((user) => {
            const displayName =
              currentLanguage === 'en'
                ? user.name
                : currentLanguage === 'hi'
                ? user.nameHindi || user.nameMarathi || user.name
                : user.nameMarathi || user.name;
            const displayTitle =
              currentLanguage === 'en'
                ? user.titleEnglish
                : currentLanguage === 'hi'
                ? user.titleHindi || user.titleMarathi
                : user.titleMarathi;

            return (
              <button
                key={user.id}
                type="button"
                onClick={() => loginAsSpecificUser(user)}
                className="text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 transition-all hover:shadow-sm active:scale-95 flex items-start gap-2.5 group cursor-pointer"
              >
                <span className="text-2xl p-1 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:scale-105 transition-transform shrink-0">
                  {user.avatarEmoji}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-xs font-bold text-slate-900 dark:text-white truncate ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                      {displayName}
                    </p>
                    {user.licenseOrId && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                        {user.licenseOrId}
                      </span>
                    )}
                  </div>
                  <p className={`text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold truncate ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                    {displayTitle}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {user.specializationOrHerd}
                  </p>
                  <div className="flex items-center justify-between pt-1 mt-1 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-400">
                    <span className="flex items-center gap-0.5 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{user.workplace}</span>
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center shrink-0">
                      Login →
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3 Stakeholder Persona Cards */}
      <div className="space-y-4">
        {personas.map((p) => {
          const IconComp = p.icon;
          const title =
            currentLanguage === 'en'
              ? p.titleEnglish
              : currentLanguage === 'hi'
              ? p.titleHindi
              : p.titleMarathi;
          const subtitle =
            currentLanguage === 'en'
              ? p.subtitleEnglish
              : currentLanguage === 'hi'
              ? p.subtitleHindi
              : p.subtitleMarathi;
          const secondaryTitle =
            currentLanguage === 'en'
              ? null
              : p.titleEnglish;

          return (
            <div
              key={p.role}
              data-testid={`role-card-${p.role}`}
              onClick={() => selectRoleAndProceed(p.role)}
              className={`rounded-2xl border ${p.color.border} ${p.color.bg} p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer relative group`}
            >
              {/* Top Row: Icon & Tag */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${p.color.iconBg} shadow-xs`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className={`text-base font-bold text-slate-900 dark:text-white ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                      {title}
                    </h2>
                    {secondaryTitle && (
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {secondaryTitle}
                      </p>
                    )}
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.color.tag}`}>
                  {t(p.tagKey, p.tagFallback)}
                </span>
              </div>

              {/* Subtitle Description */}
              <p className={`text-xs text-slate-600 dark:text-slate-300 mb-4 ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                {subtitle}
              </p>

              {/* 52px Minimum CTA Button */}
              <button
                type="button"
                className={`w-full min-h-[52px] rounded-xl text-xs font-bold transition-transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-xs ${p.color.btn}`}
              >
                <span>{t('enterAsRole', 'प्रवेश करा')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Language Switcher Footer */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
          <Globe className="w-3.5 h-3.5" />
          <span>{t('selectLanguage', 'Select Language')}:</span>
        </div>
        <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setLanguage('mr')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              currentLanguage === 'mr'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            मराठी
          </button>
          <button
            type="button"
            onClick={() => setLanguage('hi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              currentLanguage === 'hi'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            हिंदी
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              currentLanguage === 'en'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            English
          </button>
        </div>
      </div>
    </div>
  );
};

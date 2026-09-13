import React from 'react';
import { useAuthStore, UserRole } from '../../store/authStore';
import { useLanguageStore } from '../../store/languageStore';
import {
  Shield,
  UserCheck,
  Stethoscope,
  Building2,
  CheckCircle2,
  LogOut,
  Info,
} from 'lucide-react';

interface RoleSelectionViewProps {
  onClose?: () => void;
}

/**
 * Read-only role information screen shown when the user taps the role badge
 * after authentication. Role switching requires logout + re-login through the
 * correct portal — this screen explains that and provides a Logout button.
 */
export const RoleSelectionView: React.FC<RoleSelectionViewProps> = ({ onClose }) => {
  const { activeRole, userProfile, logout } = useAuthStore();
  const { currentLanguage, t } = useLanguageStore();

  const personas = [
    {
      role: 'consumer' as UserRole,
      titleMarathi: 'पशुपालक',
      titleHindi: 'पशुपालक (किसान)',
      titleEnglish: 'Livestock Owner / Farmer',
      subtitleMarathi: 'दुग्ध उत्पादक, शेळी-मेंढी पालक व पशुपालक',
      subtitleHindi: 'दुग्ध उत्पादक, बकरी पालक व पशुपालक',
      subtitleEnglish: 'Dairy farmer, smallholder & livestock owner',
      icon: UserCheck,
      color: {
        border: 'border-emerald-500/40',
        activeBorder: 'border-emerald-600 ring-2 ring-emerald-500/30',
        bg: 'bg-emerald-50/40 dark:bg-emerald-950/20',
        iconBg: 'bg-emerald-600 text-white',
        dimIconBg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
      },
      capabilitiesEnglish: [
        '1-Tap Syndromic Reporting (Photo & Vernacular Voice)',
        'Pashu Aadhaar 12-digit RFID Digital Health Passbook',
        'Direct 1962 Toll-Free Veterinary Helpline Integration',
      ],
    },
    {
      role: 'doctor' as UserRole,
      titleMarathi: 'पशुवैद्य / पशु सखी',
      titleHindi: 'पशु चिकित्सक / पशु सखी',
      titleEnglish: 'Veterinarian & Para-vet',
      subtitleMarathi: 'पशुधन विकास अधिकारी व क्षेत्रीय पॅरा-वेट',
      subtitleHindi: 'पशुधन विकास अधिकारी व क्षेत्रीय पैरा-वेट',
      subtitleEnglish: 'Field Veterinarian & Para-vet / Pashu Sakhi',
      icon: Stethoscope,
      color: {
        border: 'border-blue-500/40',
        activeBorder: 'border-blue-600 ring-2 ring-blue-500/30',
        bg: 'bg-blue-50/40 dark:bg-blue-950/20',
        iconBg: 'bg-blue-600 text-white',
        dimIconBg: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
      },
      capabilitiesEnglish: [
        '8-Syndrome Clinical Triage & Differential Diagnosis',
        'Anthrax Rule Zero Immediate Biohazard Lockout Protocol',
        'e-LRF Digital Lab Referral & 24h Cold-Chain SLA Tracking',
      ],
    },
    {
      role: 'admin' as UserRole,
      titleMarathi: 'जिल्हा अधिकारी (DVO)',
      titleHindi: 'जिला पशुपालन अधिकारी (DVO)',
      titleEnglish: 'District Animal Husbandry Officer',
      subtitleMarathi: 'जिल्हा पशुसंवर्धन विभाग व एपिडेमियोलॉजिस्ट',
      subtitleHindi: 'जिला पशुपालन विभाग व महामारी विशेषज्ञ',
      subtitleEnglish: 'District Animal Husbandry & Epidemiology Unit',
      icon: Building2,
      color: {
        border: 'border-purple-500/40',
        activeBorder: 'border-purple-600 ring-2 ring-purple-500/30',
        bg: 'bg-purple-50/40 dark:bg-purple-950/20',
        iconBg: 'bg-purple-600 text-white',
        dimIconBg: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
      },
      capabilitiesEnglish: [
        'Live Outbreak Command & Spatial Cluster Hexagons',
        'Automated 1km-5km-10km Biosecurity Containment Rings',
        '1-Click Statutory Market Closure & Quarantine Orders',
      ],
    },
  ];

  const handleLogout = async () => {
    await logout();
    onClose?.();
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-5 pb-12">
      {/* Header */}
      <div className="text-center space-y-1.5 pt-2">
        <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-emerald-600 text-white shadow-md mb-1">
          <Shield className="w-7 h-7" />
        </div>
        <h1 className={`text-xl font-extrabold text-slate-900 dark:text-white tracking-tight ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
          {t('roleInfoTitle', 'Your Role & Permissions')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {t('roleInfoSubtitle', 'Role is locked to your account credentials')}
        </p>
      </div>

      {/* Role-locked info notice */}
      <div className="flex items-start gap-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3">
        <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
          {currentLanguage === 'en'
            ? 'Your role is permanently bound to your login credentials. To use a different role, log out and sign in through the correct portal.'
            : 'तुमची भूमिका तुमच्या लॉगिन क्रेडेंशियलशी जोडलेली आहे. वेगळी भूमिका वापरण्यासाठी, लॉग आउट करा आणि योग्य पोर्टलद्वारे साइन इन करा.'}
        </p>
      </div>

      {/* Role cards — active is highlighted, others dimmed */}
      <div className="space-y-4">
        {personas.map((p) => {
          const isActive = activeRole === p.role;
          const IconComp = p.icon;

          const title =
            currentLanguage === 'en'
              ? p.titleEnglish
              : currentLanguage === 'hi'
              ? p.titleHindi
              : p.titleMarathi;

          return (
            <div
              key={p.role}
              className={`rounded-2xl border transition-all duration-200 p-4 relative ${
                isActive
                  ? `${p.color.activeBorder} ${p.color.bg} shadow-md`
                  : 'border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 opacity-40'
              }`}
            >
              {isActive && (
                <div className="absolute top-3 right-3 flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t('activeRoleBadge', 'Your Role')}</span>
                </div>
              )}

              <div className="flex items-start gap-3 mb-3">
                <div
                  className={`p-2.5 rounded-xl shadow-xs flex-shrink-0 ${
                    isActive ? p.color.iconBg : p.color.dimIconBg
                  }`}
                >
                  <IconComp className="w-5 h-5" />
                </div>
                <div className="pr-16">
                  <h3 className={`text-base font-bold text-slate-900 dark:text-white ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                    {title}
                  </h3>
                  {currentLanguage !== 'en' && (
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {p.titleEnglish}
                    </p>
                  )}
                </div>
              </div>

              {isActive && (
                <>
                  <div className="space-y-1.5 mb-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px]">
                    {p.capabilitiesEnglish.map((cap, i) => (
                      <div key={i} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>

                  {userProfile.licenseOrId && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      <span className="font-semibold">ID: </span>
                      <span className="font-mono">{userProfile.licenseOrId}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Logout CTA */}
      <button
        type="button"
        onClick={handleLogout}
        className="w-full min-h-[52px] rounded-xl text-sm font-bold bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        <span>{t('logoutToSwitch', 'Log Out to Switch Roles')}</span>
      </button>
    </div>
  );
};

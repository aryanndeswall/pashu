import React from 'react';
import { useAuthStore, UserRole, DEMO_PERSONAS } from '../store/authStore';
import { Shield, UserCheck, Stethoscope, Building2, CheckCircle2, ArrowRight } from 'lucide-react';

interface RoleSelectionViewProps {
  onRoleSelected?: (role: UserRole) => void;
}

export const RoleSelectionView: React.FC<RoleSelectionViewProps> = ({ onRoleSelected }) => {
  const { activeRole, switchRole } = useAuthStore();

  const handleSelectRole = (role: UserRole) => {
    switchRole(role);
    onRoleSelected?.(role);
  };

  const personas = [
    {
      role: 'consumer' as UserRole,
      titleMarathi: 'पशुपालक',
      titleEnglish: 'Livestock Owner / Farmer',
      subtitle: 'दुग्ध उत्पादक, शेळी-मेंढी पालक व पशुपालक',
      icon: UserCheck,
      color: {
        border: 'border-emerald-500/40',
        activeBorder: 'border-emerald-600 ring-2 ring-emerald-500/30',
        bg: 'bg-emerald-50/40 dark:bg-emerald-950/20',
        badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
        iconBg: 'bg-emerald-600 text-white',
        btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      },
      profile: DEMO_PERSONAS.consumer,
      capabilities: [
        '१-टॅप लक्षण नोंदणी (फोटो व आवाज पुरावे)',
        'जनावरांचा पशू आधार डिजिटल पासबुक',
        'थेट स्थानिक पशु सखीशी संपर्क (1962)',
      ],
    },
    {
      role: 'doctor' as UserRole,
      titleMarathi: 'पशुवैद्य / पशु सखी',
      titleEnglish: 'Veterinarian & Para-vet',
      subtitle: 'पशुधन विकास अधिकारी व क्षेत्रीय पॅरा-वेट',
      icon: Stethoscope,
      color: {
        border: 'border-blue-500/40',
        activeBorder: 'border-blue-600 ring-2 ring-blue-500/30',
        bg: 'bg-blue-50/40 dark:bg-blue-950/20',
        badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300',
        iconBg: 'bg-blue-600 text-white',
        btn: 'bg-blue-600 hover:bg-blue-700 text-white',
      },
      profile: DEMO_PERSONAS.doctor,
      capabilities: [
        '८-लक्षणे क्लिनिकल ट्रायज व फरक निदान',
        'ॲन्थ्रॅक्स शून्य-सहनशीलता तात्काळ लॉकआऊट',
        'e-LRF लॅब नमुना नोंदणी व कोल्ड-चेन टाइमर',
      ],
    },
    {
      role: 'admin' as UserRole,
      titleMarathi: 'जिल्हा अधिकारी (DVO)',
      titleEnglish: 'District Animal Husbandry Officer',
      subtitle: 'जिल्हा पशुसंवर्धन विभाग व एपिडेमियोलॉजिस्ट',
      icon: Building2,
      color: {
        border: 'border-purple-500/40',
        activeBorder: 'border-purple-600 ring-2 ring-purple-500/30',
        bg: 'bg-purple-50/40 dark:bg-purple-950/20',
        badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300',
        iconBg: 'bg-purple-600 text-white',
        btn: 'bg-purple-600 hover:bg-purple-700 text-white',
      },
      profile: DEMO_PERSONAS.admin,
      capabilities: [
        'थेट उद्रेक नियंत्रण व क्लस्टर नकाशे',
        '१-५-१० किमी क्षेत्र सीमा निर्धारण',
        '१-क्लिक बाजार बंदी व क्वारंटाईन आदेश',
      ],
    },
  ];

  return (
    <div className="max-w-xl mx-auto p-4 space-y-5 pb-12">
      {/* App & Screen Header */}
      <div className="text-center space-y-1.5 pt-2">
        <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-emerald-600 text-white shadow-md mb-1">
          <Shield className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white lang-devanagari tracking-tight">
          पशु सुरक्षा — भूमिका निवडा
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Select User Role for Offline Field Operations
        </p>
      </div>

      {/* 3 Persona Selection Cards */}
      <div className="space-y-4">
        {personas.map((p) => {
          const isActive = activeRole === p.role;
          const IconComp = p.icon;

          return (
            <div
              key={p.role}
              onClick={() => handleSelectRole(p.role)}
              className={`rounded-2xl border transition-all duration-200 p-4 relative cursor-pointer ${
                isActive
                  ? `${p.color.activeBorder} ${p.color.bg} shadow-md`
                  : `border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs`
              }`}
            >
              {/* Active Badge */}
              {isActive && (
                <div className="absolute top-3 right-3 flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>सक्रिय भूमिका (Active)</span>
                </div>
              )}

              {/* Card Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className={`p-2.5 rounded-xl ${p.color.iconBg} shadow-xs flex-shrink-0`}>
                  <IconComp className="w-5 h-5" />
                </div>
                <div className="pr-16">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white lang-devanagari">
                    {p.titleMarathi}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {p.titleEnglish}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 lang-devanagari mt-0.5">
                    {p.subtitle}
                  </p>
                </div>
              </div>

              {/* Persona Capabilities */}
              <div className="space-y-1.5 mb-3.5 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px]">
                {p.capabilities.map((cap, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-700 dark:text-slate-300 lang-devanagari">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                    <span>{cap}</span>
                  </div>
                ))}
              </div>

              {/* Profile Details & CTA */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[11px]">
                  <span className="text-slate-400">वापरकर्ता: </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {p.profile.nameMarathi}
                  </span>
                  <span className="text-slate-400 ml-1">({p.profile.block})</span>
                </div>

                <button
                  type="button"
                  aria-label={`Select ${p.titleEnglish}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectRole(p.role);
                  }}
                  className={`field-touch-target px-3.5 py-1.5 rounded-xl text-xs font-bold transition-transform active:scale-95 flex items-center gap-1.5 shadow-xs ${
                    isActive ? p.color.btn : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <span>{isActive ? 'निवडले आहे' : 'हा रोल निवडा'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

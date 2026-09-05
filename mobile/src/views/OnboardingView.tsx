import React, { useState } from 'react';
import { useAuthStore, maskPhoneNumber } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';
import { ArrowLeft, User, MapPin, CheckCircle2, ChevronRight, Building, Sparkles } from 'lucide-react';

const MAHARASHTRA_DISTRICTS: Record<string, string[]> = {
  Ahmednagar: ['Rahuri', 'Sangamner', 'Kopargaon', 'Shrirampur', 'Akole', 'Parner', 'Nevasa'],
  Pune: ['Haveli', 'Baramati', 'Shirur', 'Junner', 'Khed', 'Indapur'],
  Solapur: ['Pandharpur', 'Barshi', 'Malshiras', 'Madha', 'Karmala'],
  Nashik: ['Niphad', 'Sinnar', 'Yeola', 'Malegaon', 'Dindori'],
  Satara: ['Karad', 'Phaltan', 'Wai', 'Koregaon', 'Khandala'],
};

export const OnboardingView: React.FC = () => {
  const {
    activeRole,
    pendingPhone,
    pendingSecondaryId,
    setLoginStep,
    completeOnboarding,
  } = useAuthStore();

  const { currentLanguage, t } = useLanguageStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState('');
  const [district, setDistrict] = useState('Ahmednagar');
  const [block, setBlock] = useState('Rahuri');
  const [village, setVillage] = useState('Rahuri Khurd');
  const [subDetail, setSubDetail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableBlocks = MAHARASHTRA_DISTRICTS[district] || ['Central Block'];

  const handleDistrictChange = (d: string) => {
    setDistrict(d);
    const blocks = MAHARASHTRA_DISTRICTS[d] || ['Central Block'];
    setBlock(blocks[0]);
  };

  const handleQuickFillDemo = () => {
    if (activeRole === 'consumer') {
      setFullName('Ramesh Patil (रमेश पाटील)');
      setDistrict('Ahmednagar');
      setBlock('Rahuri');
      setVillage('Rahuri Khurd');
      setSubDetail('Dairy Cattle & Buffalo (गिर गाय व म्हैस)');
    } else if (activeRole === 'doctor') {
      setFullName('Dr. Anjali Deshmukh (डॉ. अंजली देशमुख)');
      setDistrict('Ahmednagar');
      setBlock('Rahuri');
      setVillage('Dispensary No. 1');
      setSubDetail('Government Veterinary Dispensary');
    } else {
      setFullName('Dr. S. K. Kulkarni (डॉ. एस. के. कुलकर्णी)');
      setDistrict('Ahmednagar');
      setBlock('District HQ');
      setVillage('Command Center');
      setSubDetail('District Veterinary Polyclinic');
    }
    setError(null);
  };

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError(
        currentLanguage === 'en'
          ? 'Please enter your full name.'
          : 'कृपया आपले पूर्ण नाव प्रविष्ट करा.'
      );
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!village.trim()) {
      setError(
        currentLanguage === 'en'
          ? 'Please enter your village or clinic name.'
          : 'कृपया आपले गाव किंवा दवाखान्याचे नाव प्रविष्ट करा.'
      );
      return;
    }

    setIsSubmitting(true);
    await completeOnboarding({
      name: fullName,
      nameMarathi: fullName,
      district,
      block,
      village,
      licenseOrId: pendingSecondaryId || subDetail,
    });
    setIsSubmitting(false);
  };

  const maskedPhone = pendingPhone ? maskPhoneNumber(pendingPhone) : '+91 9822X-XX412';

  const roleLabels = {
    consumer: {
      title: 'पशुपालक नोंदणी (Farmer Registration)',
      badge: 'पशुपालक',
      subPrompt: 'जनावरांचा प्रकार / मुख्य पशुधन (उदा. गाई, म्हशी, शेळ्या):',
      subPlaceholder: 'उदा. ४ गिर गाई, २ म्हशी',
    },
    doctor: {
      title: 'पशुवैद्य / सखी नोंदणी (Veterinarian Registration)',
      badge: 'पशुवैद्य',
      subPrompt: 'नेमणूक दवाखाना / कार्यक्षेत्र (Clinic / Dispensary):',
      subPlaceholder: 'उदा. पशुवैद्यकीय दवाखाना राहुरी',
    },
    admin: {
      title: 'जिल्हा अधिकारी नोंदणी (Admin Registration)',
      badge: 'जिल्हा अधिकारी',
      subPrompt: 'शासकीय पदनाम व कक्ष (Official Designation):',
      subPlaceholder: 'उदा. जिल्हा पशुसंवर्धन अधिकारी (DVO)',
    },
  }[activeRole];

  return (
    <div className="max-w-md mx-auto p-4 space-y-5 animate-in fade-in duration-200">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => {
            if (step === 2) setStep(1);
            else setLoginStep('otp');
          }}
          className="field-touch-target inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{step === 2 ? t('previous', 'मागील') : t('changeOtp', 'OTP बदला')}</span>
        </button>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          पायरी {step}/२ (Step {step}/2)
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-emerald-600 h-full transition-all duration-300"
          style={{ width: step === 1 ? '50%' : '100%' }}
        />
      </div>

      {/* Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
            {roleLabels.badge}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {maskedPhone}
          </span>
        </div>
        <h1 className={`text-xl font-black text-slate-900 dark:text-white ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
          {roleLabels.title}
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          {step === 1
            ? 'पायरी १: वैयक्तिक माहिती प्रविष्ट करा (Personal Information)'
            : 'पायरी २: स्थानिक स्वराज्य संस्था व कार्यक्षेत्र (LGD Hierarchy)'}
        </p>
      </div>

      {/* Quick Fill Demo Button */}
      <button
        type="button"
        onClick={handleQuickFillDemo}
        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
      >
        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
        <span>⚡ SIH Demo: Auto-Fill Profile Details</span>
      </button>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 rounded-xl text-xs text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Step 1: Personal Details */}
      {step === 1 && (
        <form onSubmit={handleStep1Next} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {t('fullNameLabel', 'पूर्ण नाव (Full Name in Marathi/English)')} <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="उदा. रमेश पाटील / Dr. Anjali Deshmukh"
                autoFocus
                className="w-full min-h-[52px] pl-10 pr-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {roleLabels.subPrompt}
            </label>
            <div className="relative flex items-center">
              <Building className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={subDetail}
                onChange={(e) => setSubDetail(e.target.value)}
                placeholder={roleLabels.subPlaceholder}
                className="w-full min-h-[52px] pl-10 pr-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full min-h-[52px] rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>{t('nextJurisdiction', 'पुढील: कार्यक्षेत्र निवडा (Next)')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Step 2: LGD Administrative Details */}
      {step === 2 && (
        <form onSubmit={handleStep2Submit} className="space-y-4">
          {/* State */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              राज्य (State)
            </label>
            <input
              type="text"
              readOnly
              value="महाराष्ट्र (Maharashtra)"
              className="w-full min-h-[52px] px-4 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 select-none cursor-not-allowed"
            />
          </div>

          {/* District Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              जिल्हा (LGD District) <span className="text-red-500">*</span>
            </label>
            <select
              value={district}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full min-h-[52px] px-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              {Object.keys(MAHARASHTRA_DISTRICTS).map((dist) => (
                <option key={dist} value={dist}>
                  {dist} ({dist === 'Ahmednagar' ? 'अहिल्यानगर / अहमदनगर' : dist})
                </option>
              ))}
            </select>
          </div>

          {/* Block / Taluka Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              तालुका / ब्लॉक (LGD Taluka/Block) <span className="text-red-500">*</span>
            </label>
            <select
              value={block}
              onChange={(e) => setBlock(e.target.value)}
              className="w-full min-h-[52px] px-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              {availableBlocks.map((blk) => (
                <option key={blk} value={blk}>
                  {blk}
                </option>
              ))}
            </select>
          </div>

          {/* Village / Local Jurisdiction */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              गाव / स्थानिक केंद्र (Village / Local Facility) <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <MapPin className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="उदा. राहुरी खुर्द / चिंचोडी"
                className="w-full min-h-[52px] pl-10 pr-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full min-h-[52px] rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-transform active:scale-[0.98] flex items-center justify-center gap-2 ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isSubmitting
                ? t('savingProfile', 'जतन करत आहे...')
                : t('saveAndSetupPin', 'नोंदणी पूर्ण करा व सुरक्षा पिन सेट करा')}
            </span>
          </button>
        </form>
      )}
    </div>
  );
};

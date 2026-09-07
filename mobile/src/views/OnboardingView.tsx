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

  const { currentLanguage, setLanguage, t } = useLanguageStore();

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
      setFullName(
        currentLanguage === 'en'
          ? 'Ramesh Patil'
          : currentLanguage === 'hi'
          ? 'Ramesh Patil (रमेश पाटिल)'
          : 'Ramesh Patil (रमेश पाटील)'
      );
      setDistrict('Ahmednagar');
      setBlock('Rahuri');
      setVillage(currentLanguage === 'en' ? 'Rahuri Khurd' : currentLanguage === 'hi' ? 'राहुरी खुर्द' : 'राहुरी खुर्द');
      setSubDetail(
        currentLanguage === 'en'
          ? 'Dairy Cattle & Buffalo'
          : currentLanguage === 'hi'
          ? 'गिर गाय व मुर्रा भैंस'
          : 'गिर गाय व म्हैस'
      );
    } else if (activeRole === 'doctor') {
      setFullName(
        currentLanguage === 'en'
          ? 'Dr. Anjali Deshmukh'
          : currentLanguage === 'hi'
          ? 'Dr. Anjali Deshmukh (डॉ. अंजलि देशमुख)'
          : 'Dr. Anjali Deshmukh (डॉ. अंजली देशमुख)'
      );
      setDistrict('Ahmednagar');
      setBlock('Rahuri');
      setVillage(currentLanguage === 'en' ? 'Dispensary No. 1' : 'पशु चिकित्सालय क्रमांक १');
      setSubDetail(
        currentLanguage === 'en'
          ? 'Government Veterinary Dispensary'
          : currentLanguage === 'hi'
          ? 'राजकीय पशु चिकित्सालय राहुरी'
          : 'पशुवैद्यकीय दवाखाना राहुरी'
      );
    } else {
      setFullName(
        currentLanguage === 'en'
          ? 'Dr. S. K. Kulkarni'
          : currentLanguage === 'hi'
          ? 'Dr. S. K. Kulkarni (डॉ. एस. के. कुलकर्णी)'
          : 'Dr. S. K. Kulkarni (डॉ. एस. के. कुलकर्णी)'
      );
      setDistrict('Ahmednagar');
      setBlock('District HQ');
      setVillage('Command Center');
      setSubDetail(
        currentLanguage === 'en'
          ? 'District Veterinary Polyclinic'
          : currentLanguage === 'hi'
          ? 'जिला पशु चिकित्सालय व वॉर रूम'
          : 'जिल्हा पशुवैद्यकीय दवाखाना'
      );
    }
    setError(null);
  };

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError(
        currentLanguage === 'en'
          ? 'Please enter your full name.'
          : currentLanguage === 'hi'
          ? 'कृपया अपना पूरा नाम दर्ज करें।'
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
          : currentLanguage === 'hi'
          ? 'कृपया अपना गांव या चिकित्सालय का नाम दर्ज करें।'
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
      title:
        currentLanguage === 'en'
          ? 'Farmer Registration'
          : currentLanguage === 'hi'
          ? 'पशुपालक पंजीकरण (Farmer Registration)'
          : 'पशुपालक नोंदणी (Farmer Registration)',
      badge:
        currentLanguage === 'en'
          ? 'Farmer'
          : currentLanguage === 'hi'
          ? 'पशुपालक'
          : 'पशुपालक',
      subPrompt:
        currentLanguage === 'en'
          ? 'Livestock Types / Primary Animals (e.g. Cow, Buffalo, Goat):'
          : currentLanguage === 'hi'
          ? 'पशुओं का प्रकार / मुख्य पशुधन (उदा. गाय, भैंस, बकरी):'
          : 'जनावरांचा प्रकार / मुख्य पशुधन (उदा. गाई, म्हशी, शेळ्या):',
      subPlaceholder:
        currentLanguage === 'en'
          ? 'e.g. 4 Gir Cows, 2 Buffaloes'
          : currentLanguage === 'hi'
          ? 'उदा. ४ गिर गाय, २ भैंस'
          : 'उदा. ४ गिर गाई, २ म्हशी',
    },
    doctor: {
      title:
        currentLanguage === 'en'
          ? 'Veterinarian / Para-vet Registration'
          : currentLanguage === 'hi'
          ? 'पशु चिकित्सक / सखी पंजीकरण (Veterinarian Registration)'
          : 'पशुवैद्य / सखी नोंदणी (Veterinarian Registration)',
      badge:
        currentLanguage === 'en'
          ? 'Veterinarian'
          : currentLanguage === 'hi'
          ? 'पशु चिकित्सक'
          : 'पशुवैद्य',
      subPrompt:
        currentLanguage === 'en'
          ? 'Assigned Clinic / Dispensary Jurisdiction:'
          : currentLanguage === 'hi'
          ? 'नियुक्त औषधालय / कार्यक्षेत्र (Clinic / Dispensary):'
          : 'नेमणूक दवाखाना / कार्यक्षेत्र (Clinic / Dispensary):',
      subPlaceholder:
        currentLanguage === 'en'
          ? 'e.g. Rahuri Veterinary Dispensary'
          : currentLanguage === 'hi'
          ? 'उदा. पशु चिकित्सालय राहुरी'
          : 'उदा. पशुवैद्यकीय दवाखाना राहुरी',
    },
    admin: {
      title:
        currentLanguage === 'en'
          ? 'District Officer Registration'
          : currentLanguage === 'hi'
          ? 'जिला अधिकारी पंजीकरण (Admin Registration)'
          : 'जिल्हा अधिकारी नोंदणी (Admin Registration)',
      badge:
        currentLanguage === 'en'
          ? 'District Officer'
          : currentLanguage === 'hi'
          ? 'जिला अधिकारी'
          : 'जिल्हा अधिकारी',
      subPrompt:
        currentLanguage === 'en'
          ? 'Official Designation & Department:'
          : currentLanguage === 'hi'
          ? 'शासकीय पदनाम व कक्ष (Official Designation):'
          : 'शासकीय पदनाम व कक्ष (Official Designation):',
      subPlaceholder:
        currentLanguage === 'en'
          ? 'e.g. District Veterinary Officer (DVO)'
          : currentLanguage === 'hi'
          ? 'उदा. जिला पशुपालन अधिकारी (DVO)'
          : 'उदा. जिल्हा पशुसंवर्धन अधिकारी (DVO)',
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
          <span>{step === 2 ? t('previous', 'पिछला') : t('changeOtp', 'OTP बदलें')}</span>
        </button>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {currentLanguage === 'en'
            ? `Step ${step}/2`
            : currentLanguage === 'hi'
            ? `चरण ${step}/२ (Step ${step}/2)`
            : `पायरी ${step}/२ (Step ${step}/2)`}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-emerald-600 h-full transition-all duration-300"
          style={{ width: step === 1 ? '50%' : '100%' }}
        />
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
            ? currentLanguage === 'en'
              ? 'Step 1: Enter Personal Information'
              : currentLanguage === 'hi'
              ? 'चरण १: व्यक्तिगत जानकारी दर्ज करें (Personal Information)'
              : 'पायरी १: वैयक्तिक माहिती प्रविष्ट करा (Personal Information)'
            : currentLanguage === 'en'
              ? 'Step 2: Local Government & Jurisdiction (LGD Hierarchy)'
              : currentLanguage === 'hi'
              ? 'चरण २: स्थानीय स्वशासन व कार्यक्षेत्र (LGD Hierarchy)'
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
        <span>
          {currentLanguage === 'en'
            ? '⚡ SIH Demo: Auto-Fill Profile Details'
            : currentLanguage === 'hi'
            ? '⚡ SIH Demo: प्रोफाइल विवरण स्वतः भरें (Auto-Fill)'
            : '⚡ SIH Demo: Auto-Fill Profile Details'}
        </span>
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
              {t(
                'fullNameLabel',
                currentLanguage === 'en'
                  ? 'Full Name (in Hindi/English)'
                  : currentLanguage === 'hi'
                  ? 'पूरा नाम (हिंदी/अंग्रेजी में)'
                  : 'पूर्ण नाव (मराठी/इंग्रजी)'
              )}{' '}
              <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={
                  currentLanguage === 'en'
                    ? 'e.g. Ramesh Patil / Dr. Anjali Deshmukh'
                    : currentLanguage === 'hi'
                    ? 'उदा. रमेश पाटिल / डॉ. अंजलि देशमुख'
                    : 'उदा. रमेश पाटील / Dr. Anjali Deshmukh'
                }
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
            <span>
              {t(
                'nextJurisdiction',
                currentLanguage === 'en'
                  ? 'Next: Select Jurisdiction'
                  : currentLanguage === 'hi'
                  ? 'आगे बढ़ें: कार्यक्षेत्र चुनें (Next)'
                  : 'पुढील: कार्यक्षेत्र निवडा (Next)'
              )}
            </span>
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
              {currentLanguage === 'en' ? 'State' : 'राज्य (State)'}
            </label>
            <input
              type="text"
              readOnly
              value={currentLanguage === 'en' ? 'Maharashtra' : 'महाराष्ट्र (Maharashtra)'}
              className="w-full min-h-[52px] px-4 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 select-none cursor-not-allowed"
            />
          </div>

          {/* District Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {currentLanguage === 'en'
                ? 'District (LGD District)'
                : currentLanguage === 'hi'
                ? 'जिला (LGD District)'
                : 'जिल्हा (LGD District)'}{' '}
              <span className="text-red-500">*</span>
            </label>
            <select
              value={district}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full min-h-[52px] px-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              {Object.keys(MAHARASHTRA_DISTRICTS).map((dist) => (
                <option key={dist} value={dist}>
                  {dist}{' '}
                  {dist === 'Ahmednagar'
                    ? currentLanguage === 'en'
                      ? '(Ahilyanagar / Ahmednagar)'
                      : currentLanguage === 'hi'
                      ? '(अहिल्यानगर / अहमदनगर)'
                      : '(अहिल्यानगर / अहमदनगर)'
                    : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Block / Taluka Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {currentLanguage === 'en'
                ? 'Taluka / Block (LGD Block)'
                : currentLanguage === 'hi'
                ? 'तहसील / ब्लॉक (LGD Block)'
                : 'तालुका / ब्लॉक (LGD Taluka/Block)'}{' '}
              <span className="text-red-500">*</span>
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
              {currentLanguage === 'en'
                ? 'Village / Local Facility'
                : currentLanguage === 'hi'
                ? 'गांव / स्थानीय केंद्र (Village / Local Facility)'
                : 'गाव / स्थानिक केंद्र (Village / Local Facility)'}{' '}
              <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <MapPin className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder={
                  currentLanguage === 'en'
                    ? 'e.g. Rahuri Khurd'
                    : currentLanguage === 'hi'
                    ? 'उदा. राहुरी खुर्द / चिंचोड़ी'
                    : 'उदा. राहुरी खुर्द / चिंचोडी'
                }
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
                ? t(
                    'savingProfile',
                    currentLanguage === 'en'
                      ? 'Saving Profile...'
                      : currentLanguage === 'hi'
                      ? 'सहेजा जा रहा है...'
                      : 'जतन करत आहे...'
                  )
                : t(
                    'saveAndSetupPin',
                    currentLanguage === 'en'
                      ? 'Complete Registration & Set PIN'
                      : currentLanguage === 'hi'
                      ? 'पंजीकरण पूर्ण करें व सुरक्षा पिन सेट करें'
                      : 'नोंदणी पूर्ण करा व सुरक्षा पिन सेट करा'
                  )}
            </span>
          </button>
        </form>
      )}
    </div>
  );
};

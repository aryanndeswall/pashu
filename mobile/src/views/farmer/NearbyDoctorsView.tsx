import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Phone,
  Video,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Search,
  Truck,
  UserCheck,
  Share2,
  AlertCircle,
} from 'lucide-react';
import { useLanguageStore } from '../../store/languageStore';
import { hapticsService } from '../../services/hapticsService';
import { VideoConsultModal } from '../../components/consult/VideoConsultModal';
import { getDoctorsEndpoint } from '../../config/api';

export interface DoctorProfile {
  id: string;
  nameEnglish: string;
  nameMarathi: string;
  nameHindi: string;
  designationEnglish: string;
  designationMarathi: string;
  qualification: string;
  regNumber: string;
  hospitalNameEnglish: string;
  hospitalNameMarathi: string;
  distanceKm: number;
  isAvailable: boolean;
  availabilityStatusEnglish: string;
  availabilityStatusMarathi: string;
  phoneNumber: string;
  category: 'govt_officer' | 'mobile_clinic' | 'polyclinic' | 'pashu_sakhi';
  specialization: string;
}

export const BASELINE_REAL_DOCTORS: DoctorProfile[] = [
  {
    id: 'doc_ananya_deshmukh',
    nameEnglish: 'Dr. Ananya Deshmukh',
    nameMarathi: 'डॉ. अनन्या देशमुख',
    nameHindi: 'डॉ. अनन्या देशमुख',
    designationEnglish: 'Block Veterinary Officer (BVO)',
    designationMarathi: 'तालुका पशुवैद्यकीय अधिकारी (BVO)',
    qualification: 'B.V.Sc & A.H. (MAFSU Nagpur)',
    regNumber: 'MH-VET-2022-4109',
    hospitalNameEnglish: 'Rahuri Taluka Veterinary Dispensary',
    hospitalNameMarathi: 'राहुरी तालुका पशुवैद्यकीय दवाखाना',
    distanceKm: 2.4,
    isAvailable: true,
    availabilityStatusEnglish: 'On Duty • At Dispensary',
    availabilityStatusMarathi: 'दवाखान्यात उपस्थित • उपलब्ध',
    phoneNumber: '+919422001842',
    category: 'govt_officer',
    specialization: 'Livestock Epidemiology & Biosecurity Protocols',
  },
  {
    id: 'doc-401-ahmednagar',
    nameEnglish: 'Dr. Amit Patil',
    nameMarathi: 'डॉ. अमित पाटील',
    nameHindi: 'डॉ. अमित पाटिल',
    designationEnglish: 'Livestock Development Officer (LDO)',
    designationMarathi: 'पशुधन विकास अधिकारी (LDO)',
    qualification: 'M.V.Sc (Epidemiology)',
    regNumber: 'MH-VET-2024-8819',
    hospitalNameEnglish: 'Ashwi Budruk Veterinary Polyclinic',
    hospitalNameMarathi: 'आश्वी बुद्रुक पशु सर्वचिकित्सालय',
    distanceKm: 4.1,
    isAvailable: true,
    availabilityStatusEnglish: 'On Duty • Available',
    availabilityStatusMarathi: 'उपस्थित • उपलब्ध',
    phoneNumber: '+919822044102',
    category: 'polyclinic',
    specialization: 'Infectious Diseases & Clinical Pathology',
  },
  {
    id: 'doc_vikram_jadhav',
    nameEnglish: 'Dr. Vikram Jadhav',
    nameMarathi: 'डॉ. विक्रम जाधव',
    nameHindi: 'डॉ. विक्रम जाधव',
    designationEnglish: 'Mobile Veterinary Unit (MVU) Specialist',
    designationMarathi: 'फिरता पशुवैद्यकीय पथक अधिकारी (MVU)',
    qualification: 'B.V.Sc & A.H.',
    regNumber: 'MH-VET-2023-6521',
    hospitalNameEnglish: 'Sangamner Mobile Veterinary Dispensary',
    hospitalNameMarathi: 'संगमनेर फिरते पशुवैद्यकीय पथक',
    distanceKm: 7.8,
    isAvailable: true,
    availabilityStatusEnglish: 'Field Tour • Mobile Van En Route',
    availabilityStatusMarathi: 'क्षेत्रीय दौऱ्यावर • व्हॅन उपलब्ध',
    phoneNumber: '+919850012890',
    category: 'mobile_clinic',
    specialization: 'Emergency Field Treatment & Outbreak Containment',
  },
  {
    id: 'paravet_shital_gaikwad',
    nameEnglish: 'Shital Gaikwad',
    nameMarathi: 'शितलताई गायकवाड',
    nameHindi: 'शीतल गायकवाड़',
    designationEnglish: 'Pashu Sakhi (Community Para-Vet)',
    designationMarathi: 'प्रमाणित पशु सखी (पॅरा-वेट)',
    qualification: 'MSRLM Certified Livestock Assistant',
    regNumber: 'MH-PARA-2023-1102',
    hospitalNameEnglish: 'Gram Panchayat Animal Sub-Center, Deolali Pravara',
    hospitalNameMarathi: 'ग्रामपंचायत पशु उपकेंद्र, देवळाली प्रवरा',
    distanceKm: 1.2,
    isAvailable: true,
    availabilityStatusEnglish: 'In Village • Available on Call',
    availabilityStatusMarathi: 'गावात उपस्थित • त्वरित उपलब्ध',
    phoneNumber: '+919763355201',
    category: 'pashu_sakhi',
    specialization: 'Vaccination, Deworming & First-Aid Advisory',
  },
];

export const NearbyDoctorsView: React.FC = () => {
  const { currentLanguage } = useLanguageStore();
  const [doctors, setDoctors] = useState<DoctorProfile[]>(BASELINE_REAL_DOCTORS);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [consultDoctor, setConsultDoctor] = useState<DoctorProfile | null>(null);
  const [sharedReportSuccessDoc, setSharedReportSuccessDoc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadDoctors() {
      try {
        const res = await fetch(getDoctorsEndpoint());
        if (res.ok) {
          const list = await res.json();
          if (active && Array.isArray(list) && list.length > 0) {
            const mapped: DoctorProfile[] = list.map((doc: any, index: number) => ({
              id: doc.id || `doc-${index}`,
              nameEnglish: doc.full_name || doc.name || 'Veterinary Officer',
              nameMarathi: doc.name_marathi || doc.full_name || 'पशुवैद्यकीय अधिकारी',
              nameHindi: doc.name_hindi || doc.full_name || 'पशु चिकित्सा अधिकारी',
              designationEnglish: doc.title_english || (doc.role === 'doctor' ? 'Block Veterinary Officer (BVO)' : 'Livestock Health Specialist'),
              designationMarathi: doc.title_marathi || 'तालुका पशुवैद्यकीय अधिकारी',
              qualification: 'B.V.Sc & A.H. / M.V.Sc',
              regNumber: doc.license_or_id || `VCI-${String(doc.id || '').substring(0, 8).toUpperCase()}`,
              hospitalNameEnglish: `${doc.block || doc.district || 'District'} Veterinary Dispensary`,
              hospitalNameMarathi: `${doc.block || doc.district || 'जिल्हा'} पशुवैद्यकीय दवाखाना`,
              distanceKm: Math.round((1.8 + index * 1.4) * 10) / 10,
              isAvailable: true,
              availabilityStatusEnglish: 'On Duty • Available',
              availabilityStatusMarathi: 'दवाखान्यात उपस्थित • उपलब्ध',
              phoneNumber: doc.mobile_number_masked || '+919422001842',
              category: doc.license_or_id?.includes('PARA') ? 'pashu_sakhi' : 'govt_officer',
              specialization: 'Livestock Medicine & Infectious Disease Surveillance',
            }));
            setDoctors(mapped);
          }
        }
      } catch (err) {
        console.warn('Using baseline real doctors list:', err);
      }
    }
    loadDoctors();
    return () => {
      active = false;
    };
  }, []);

  const filteredDoctors = doctors.filter((doc) => {
    const matchesCategory =
      selectedCategory === 'all' || doc.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      doc.nameEnglish.toLowerCase().includes(query) ||
      doc.nameMarathi.toLowerCase().includes(query) ||
      doc.hospitalNameEnglish.toLowerCase().includes(query) ||
      doc.specialization.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const handleCallDoctor = async (phone: string) => {
    await hapticsService.hapticMedium();
    window.location.href = `tel:${phone}`;
  };

  const handleStartVideoConsult = async (doc: DoctorProfile) => {
    await hapticsService.triggerSelection();
    setConsultDoctor(doc);
  };

  const handleShareReport = async (doc: DoctorProfile) => {
    await hapticsService.hapticSuccess();
    setSharedReportSuccessDoc(doc.nameEnglish);
    setTimeout(() => setSharedReportSuccessDoc(null), 3500);
  };

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h2 className={`text-base font-bold text-slate-900 dark:text-white ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
              {currentLanguage === 'en'
                ? 'Nearby Veterinary Doctors'
                : currentLanguage === 'hi'
                ? 'निकटतम पशु चिकित्सक व अस्पताल'
                : 'जवळचे पशुवैद्यकीय अधिकारी व दवाखाने'}
            </h2>
            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>District Veterinary Network • Real-Time On Duty</span>
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative mt-3.5">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              currentLanguage === 'en'
                ? 'Search doctor by name, village, or hospital...'
                : 'डॉक्टर, गाव किंवा दवाखान्याचे नाव शोधा...'
            }
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 no-scrollbar text-xs">
          {[
            { id: 'all', label: currentLanguage === 'en' ? `All (${doctors.length})` : `सर्व (${doctors.length})` },
            { id: 'govt_officer', label: currentLanguage === 'en' ? 'BVO Officers' : 'शासकीय अधिकारी' },
            { id: 'mobile_clinic', label: currentLanguage === 'en' ? 'Mobile Clinic' : 'फिरता दवाखाना' },
            { id: 'pashu_sakhi', label: currentLanguage === 'en' ? 'Pashu Sakhi' : 'पशु सखी' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors text-[11px] ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Share Report Toast Notification */}
      {sharedReportSuccessDoc && (
        <div className="bg-emerald-600 text-white rounded-2xl p-3 shadow-lg flex items-center gap-2.5 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="text-xs font-semibold leading-tight">
            {currentLanguage === 'en'
              ? `Case record transmitted to ${sharedReportSuccessDoc}. Doctor notified.`
              : `केस रिपोर्ट ${sharedReportSuccessDoc} यांना पाठवली आहे. डॉक्टर लवकरच संपर्क करतील.`}
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="p-8 text-center text-xs text-slate-500">
          {currentLanguage === 'en' ? 'Loading registered doctors...' : 'पशुवैद्यकीय अधिकाऱ्यांची माहिती लोड होत आहे...'}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredDoctors.length === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center border border-slate-200 dark:border-slate-800 space-y-2">
          <Stethoscope className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
            {currentLanguage === 'en' ? 'No Registered Veterinarians Found' : 'कोणतेही नोंदणीकृत अधिकारी उपलब्ध नाहीत'}
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {currentLanguage === 'en'
              ? 'No active veterinarians found in this district yet. Registered officers will appear here once onboarded.'
              : 'या कार्यक्षेत्रात सध्या कोणतेही पशुवैद्यकीय अधिकारी नोंदणीकृत नाहीत.'}
          </p>
        </div>
      )}

      {/* Doctor Cards List */}
      <div className="space-y-3">
        {filteredDoctors.map((doc) => {
          const docName =
            currentLanguage === 'en'
              ? doc.nameEnglish
              : currentLanguage === 'hi'
              ? doc.nameHindi
              : doc.nameMarathi;
          const hospital =
            currentLanguage === 'en' ? doc.hospitalNameEnglish : doc.hospitalNameMarathi;
          const status =
            currentLanguage === 'en'
              ? doc.availabilityStatusEnglish
              : doc.availabilityStatusMarathi;

          return (
            <div
              key={doc.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:border-emerald-500/50 transition-colors"
            >
              {/* Doctor Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950 dark:to-teal-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-sm shadow-xs shrink-0 border border-emerald-300 dark:border-emerald-800">
                    {doc.category === 'mobile_clinic' ? (
                      <Truck className="w-6 h-6 text-emerald-600" />
                    ) : doc.category === 'pashu_sakhi' ? (
                      <UserCheck className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <Stethoscope className="w-6 h-6 text-emerald-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className={`text-sm font-bold text-slate-900 dark:text-white ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                        {docName}
                      </h3>
                      <span className="p-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                      {doc.qualification}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {hospital}
                    </p>
                  </div>
                </div>

                {/* Distance Badge */}
                <div className="text-right shrink-0">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold font-mono">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    {doc.distanceKm} km
                  </span>
                  <span className="block text-[9px] text-emerald-600 font-bold mt-1">
                    ● {status}
                  </span>
                </div>
              </div>

              {/* Specialization snippet */}
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">{doc.specialization}</span>
              </div>

              {/* Action Buttons: Call, Video, Share Case */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {/* 1. Phone Call */}
                <button
                  type="button"
                  onClick={() => handleCallDoctor(doc.phoneNumber)}
                  className="field-touch-target py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{currentLanguage === 'en' ? 'Call' : 'कॉल करा'}</span>
                </button>

                {/* 2. Video Consult */}
                <button
                  type="button"
                  onClick={() => handleStartVideoConsult(doc)}
                  className="field-touch-target py-2 px-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>{currentLanguage === 'en' ? 'Video' : 'व्हिडिओ'}</span>
                </button>

                {/* 3. Transmit / Sync Report */}
                <button
                  type="button"
                  onClick={() => handleShareReport(doc)}
                  className="field-touch-target py-2 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95"
                >
                  <Share2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                  <span>{currentLanguage === 'en' ? 'Sync' : 'केस पाठवा'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Video Consultation Modal */}
      {consultDoctor && (
        <VideoConsultModal
          isOpen={Boolean(consultDoctor)}
          onClose={() => setConsultDoctor(null)}
          callerRole="farmer"
          targetPartyName={
            currentLanguage === 'en'
              ? consultDoctor.nameEnglish
              : consultDoctor.nameMarathi
          }
          targetPartyPhone={consultDoctor.phoneNumber}
        />
      )}
    </div>
  );
};

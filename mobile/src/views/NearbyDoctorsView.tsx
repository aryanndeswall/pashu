import React, { useState } from 'react';
import {
  Stethoscope,
  Phone,
  Video,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Search,
  Filter,
  Truck,
  UserCheck,
  Building2,
  ChevronRight,
  AlertCircle,
  Share2,
} from 'lucide-react';
import { useLanguageStore } from '../store/languageStore';
import { hapticsService } from '../services/hapticsService';
import { VideoConsultModal } from '../components/consult/VideoConsultModal';

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

export const DEMO_NEARBY_DOCTORS: DoctorProfile[] = [
  {
    id: 'doc-01',
    nameEnglish: 'Dr. Ananya Deshmukh',
    nameMarathi: 'डॉ. अनन्य देशपांडे / देशमुख',
    nameHindi: 'डॉ. अनन्या देशमुख',
    designationEnglish: 'Block Veterinary Officer (BVO)',
    designationMarathi: 'तालुका पशुवैद्यकीय अधिकारी',
    qualification: 'M.V.Sc (Clinical Medicine), B.V.Sc & A.H.',
    regNumber: 'VCI/MSVC-2018-09412',
    hospitalNameEnglish: 'Taluka Veterinary Dispensary Grade-1, Rahuri',
    hospitalNameMarathi: 'श्रेणी-१ पशुवैद्यकीय दवाखाना, राहुरी खुर्द',
    distanceKm: 2.4,
    isAvailable: true,
    availabilityStatusEnglish: 'On Duty • Available Now',
    availabilityStatusMarathi: 'दवाखान्यात उपस्थित • तात्काळ उपलब्ध',
    phoneNumber: '+919422001842',
    category: 'govt_officer',
    specialization: 'Cattle & Buffalo Infectious Diseases, FMD/LSD Expert',
  },
  {
    id: 'doc-02',
    nameEnglish: 'Dr. Suresh Patil',
    nameMarathi: 'डॉ. सुरेश पाटील',
    nameHindi: 'डॉ. सुरेश पाटिल',
    designationEnglish: 'Mobile Veterinary Dispensary (MVD) In-Charge',
    designationMarathi: 'फिरते पशुवैद्यकीय पथक प्रमुख',
    qualification: 'B.V.Sc & A.H. (MAFVU)',
    regNumber: 'VCI/MSVC-2015-05814',
    hospitalNameEnglish: 'Sangamner Mobile Rural Clinic (MVD Van #04)',
    hospitalNameMarathi: 'संगमनेर फिरता पशुवैद्यकीय दवाखाना (वाहन क्र. ४)',
    distanceKm: 4.8,
    isAvailable: true,
    availabilityStatusEnglish: 'On Field Emergency Route',
    availabilityStatusMarathi: 'गावांच्या क्षेत्रभेटीवर • उपलब्ध',
    phoneNumber: '+919822000412',
    category: 'mobile_clinic',
    specialization: 'Emergency Dystocia, Wound Debridement & Field Vaccinations',
  },
  {
    id: 'doc-03',
    nameEnglish: 'Dr. Vikram Shinde',
    nameMarathi: 'डॉ. विक्रम शिंदे',
    nameHindi: 'डॉ. विक्रम शिंदे',
    designationEnglish: 'Senior Disease Investigation Specialist',
    designationMarathi: 'वरिष्ठ रोग अन्वेषण अधिकारी',
    qualification: 'M.V.Sc (Veterinary Pathology)',
    regNumber: 'VCI/MSVC-2012-03119',
    hospitalNameEnglish: 'District Veterinary Polyclinic, Ahmednagar',
    hospitalNameMarathi: 'जिल्हा पशुवैद्यकीय सर्वचिकित्सालय, अहमदनगर',
    distanceKm: 14.5,
    isAvailable: true,
    availabilityStatusEnglish: 'Lab Diagnostics On-Call',
    availabilityStatusMarathi: 'प्रयोगशाळा तपासणी • उपलब्ध',
    phoneNumber: '+919423000819',
    category: 'polyclinic',
    specialization: 'Anthrax Diagnostic Smears, Cold Chain PCR, Post-Mortem',
  },
  {
    id: 'doc-04',
    nameEnglish: 'Sunita Tai Gaikwad',
    nameMarathi: 'सुनीता ताई गायकवाड (पशु सखी)',
    nameHindi: 'सुनीता ताई गायकवाड (पशु सखी)',
    designationEnglish: 'Certified Paravet & Pashu Sakhi (MSRLM)',
    designationMarathi: 'प्रमाणित पशु सखी (पशु संवर्धन मित्र)',
    qualification: 'Diploma in Livestock Extension & First-Aid',
    regNumber: 'PS-MAHA-AHM-0412',
    hospitalNameEnglish: 'Ashwi Budruk Gram Panchayat Health Post',
    hospitalNameMarathi: 'आश्वी बुद्रुक ग्रामपंचायत पशुसेवा केंद्र',
    distanceKm: 0.8,
    isAvailable: true,
    availabilityStatusEnglish: 'Village Resident • Available',
    availabilityStatusMarathi: 'गावात उपस्थित • घरपोच प्रथमोपचार',
    phoneNumber: '+919881000311',
    category: 'pashu_sakhi',
    specialization: 'Thermometry, Deworming, Mineral Mixture & Rapid Triage',
  },
];

export const NearbyDoctorsView: React.FC = () => {
  const { currentLanguage, t } = useLanguageStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [consultDoctor, setConsultDoctor] = useState<DoctorProfile | null>(null);
  const [sharedReportSuccessDoc, setSharedReportSuccessDoc] = useState<string | null>(null);

  const filteredDoctors = DEMO_NEARBY_DOCTORS.filter((doc) => {
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
              <span>Rahuri & Sangamner Taluka Jurisdiction • 24x7 Support</span>
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
            { id: 'all', label: currentLanguage === 'en' ? 'All (4)' : 'सर्व (४)' },
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
              ? `Case record & symptoms transmitted to ${sharedReportSuccessDoc}. Doctor has been alerted.`
              : `केस रिपोर्ट व लक्षणे ${sharedReportSuccessDoc} यांना पाठवली आहेत. डॉक्टर लवकरच संपर्क करतील.`}
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
          animalTag="1002-9384-7561"
          animalSpecies="Gir Cow (गीर गाय)"
          suspectedCondition="VSS / FMD (लाळ्या खुरकूत)"
        />
      )}
    </div>
  );
};

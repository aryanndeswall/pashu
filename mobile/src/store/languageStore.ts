import { create } from 'zustand';

export type SupportedLanguage = 'mr' | 'hi' | 'en';

export interface LanguageOption {
  code: SupportedLanguage;
  nativeName: string;
  englishName: string;
  badgeCode: string;
  description: string;
  flagEmoji: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'mr',
    nativeName: 'मराठी',
    englishName: 'Marathi',
    badgeCode: 'MR',
    description: 'प्राथमिक भाषा (महाराष्ट्र / अहमदनगर)',
    flagEmoji: '🇮🇳',
  },
  {
    code: 'hi',
    nativeName: 'हिंदी',
    englishName: 'Hindi',
    badgeCode: 'HI',
    description: 'राष्ट्रीय भाषा (समग्र भारत)',
    flagEmoji: '🇮🇳',
  },
  {
    code: 'en',
    nativeName: 'English',
    englishName: 'English',
    badgeCode: 'EN',
    description: 'Administrative & Jury Presentation',
    flagEmoji: '🌐',
  },
];

export const UI_TRANSLATIONS: Record<string, Record<SupportedLanguage, string>> = {
  appName: {
    mr: 'पशु सुरक्षा',
    hi: 'पशु सुरक्षा',
    en: 'Pashu-Suraksha',
  },
  appSubtitle: {
    mr: 'राष्ट्रीय पशु आरोग्य पाळत',
    hi: 'राष्ट्रीय पशु स्वास्थ्य निगरानी',
    en: 'National Livestock Surveillance',
  },
  welcome: {
    mr: 'स्वागत आहे',
    hi: 'स्वागत है',
    en: 'Welcome',
  },
  switchRole: {
    mr: 'भूमिका बदला',
    hi: 'भूमिका बदलें',
    en: 'Switch Role',
  },
  goToApp: {
    mr: 'अ‍ॅपवर जा',
    hi: 'ऐप पर जाएं',
    en: 'Go to App',
  },
  roleConsumer: {
    mr: 'पशुपालक',
    hi: 'पशुपालक',
    en: 'Farmer',
  },
  roleDoctor: {
    mr: 'पशुवैद्य',
    hi: 'पशु चिकित्सक',
    en: 'Veterinarian',
  },
  roleAdmin: {
    mr: 'अधिकारी',
    hi: 'अधिकारी',
    en: 'Officer',
  },
  roleConsumerDesc: {
    mr: 'पशुपालक (Farmer / Consumer)',
    hi: 'पशुपालक (Farmer / Consumer)',
    en: 'Livestock Owner / Farmer',
  },
  roleDoctorDesc: {
    mr: 'पशुवैद्य (Veterinarian / Doctor)',
    hi: 'पशु चिकित्सक (Veterinarian / Doctor)',
    en: 'Field Veterinarian & Para-vet',
  },
  roleAdminDesc: {
    mr: 'जिल्हा अधिकारी (District Admin)',
    hi: 'जिला अधिकारी (District Admin)',
    en: 'District Animal Husbandry Officer',
  },
  roleDemoInstruction: {
    mr: 'सादरीकरणासाठी १-क्लिक मध्ये भूमिका बदला (Switch roles instantly for live demo):',
    hi: 'प्रस्तुति के लिए १-क्लिक में भूमिका बदलें (Switch roles instantly for live demo):',
    en: 'Switch roles instantly with 1-click for the live presentation:',
  },
  select: {
    mr: 'निवडा',
    hi: 'चुनें',
    en: 'Select',
  },
  activeRole: {
    mr: 'सक्रिय भूमिका',
    hi: 'सक्रिय भूमिका',
    en: 'Active Role',
  },

  // Tabs
  reportTab: {
    mr: 'लक्षणे नोंदवा',
    hi: 'लक्षण दर्ज करें',
    en: 'Report',
  },
  doctorReportTab: {
    mr: '८ लक्षणे',
    hi: '८ लक्षण',
    en: '8 Syndromes',
  },
  dashboardTab: {
    mr: 'स्थानिक स्थिती',
    hi: 'स्थानिक स्थिति',
    en: 'Status',
  },
  animalsTab: {
    mr: 'माझे पशु',
    hi: 'मेरे पशु',
    en: 'My Animals',
  },
  labsTab: {
    mr: 'लॅब अहवाल',
    hi: 'लैब रिपोर्ट',
    en: 'Lab Samples',
  },
  warRoomTab: {
    mr: 'वॉर रूम (GIS)',
    hi: 'वॉर रूम (GIS)',
    en: 'War Room',
  },

  // Report View Banners
  fieldReportTitle: {
    mr: 'लक्षण अहवाल नोंदणी (Syndromic Field Report)',
    hi: 'लक्षण रिपोर्ट पंजीकरण (Syndromic Field Report)',
    en: 'Syndromic Field Report',
  },
  fieldReportSubtitle: {
    mr: '३ टप्प्यांत लक्षणे, फोटो, व्हॉइस व LGD स्थान नोंदवा',
    hi: '३ चरणों में लक्षण, फोटो, आवाज व LGD स्थान दर्ज करें',
    en: 'Record symptoms, photos, voice notes & GPS in 3 easy steps',
  },
  step1Title: {
    mr: 'टप्पा १/३: लक्षण निवड (Syndrome Selection)',
    hi: 'चरण १/३: लक्षण चयन (Syndrome Selection)',
    en: 'Step 1/3: Syndrome Selection',
  },
  step2Title: {
    mr: 'टप्पा २/३: पुरावे जोडणी (फोटो व आवाज)',
    hi: 'चरण २/३: प्रमाण जोड़ें (फोटो व आवाज)',
    en: 'Step 2/3: Attach Evidence (Photo & Voice)',
  },
  step3Title: {
    mr: 'टप्पा ३/३: स्थान व पशू आधार',
    hi: 'चरण ३/३: स्थान व पशु आधार',
    en: 'Step 3/3: Location & Tag Registration',
  },
  complete: {
    mr: 'पूर्ण',
    hi: 'पूर्ण',
    en: 'Complete',
  },

  // Wizard Buttons & Actions
  nextStep: {
    mr: 'पुढे जा (Next Step)',
    hi: 'आगे बढ़ें (Next Step)',
    en: 'Next Step',
  },
  nextEvidence: {
    mr: 'पुढे जा: पुरावे जोडा (Next: Add Evidence)',
    hi: 'आगे बढ़ें: प्रमाण जोड़ें (Next: Add Evidence)',
    en: 'Next: Attach Evidence',
  },
  nextLocation: {
    mr: 'पुढे जा: स्थान व टॅग (Next: Location)',
    hi: 'आगे बढ़ें: स्थान व टैग (Next: Location)',
    en: 'Next: Location & Tag',
  },
  back: {
    mr: 'मागे (Back)',
    hi: 'पीछे (Back)',
    en: 'Back',
  },
  saveOfflineReport: {
    mr: 'अहवाल जतन करा (Save Offline Report)',
    hi: 'ऑफ़लाइन रिपोर्ट सहेजें (Save Offline Report)',
    en: 'Save Offline Report',
  },
  saving: {
    mr: 'जतन करत आहे...',
    hi: 'सहेजा जा रहा है...',
    en: 'Saving...',
  },
  changeSyndrome: {
    mr: 'बदला',
    hi: 'बदलें',
    en: 'Change',
  },
  localNameLabel: {
    mr: 'स्थानिक नाव:',
    hi: 'स्थानीय नाम:',
    en: 'Local Name:',
  },

  // Anthrax Biohazard Lockout Banner
  anthraxLockoutTitle: {
    mr: 'ॲन्थ्रॅक्स शून्य-सहनशीलता लॉकआऊट सक्रिय!',
    hi: 'एंथ्रेक्स शून्य-सहनशीलता लॉकआउट सक्रिय!',
    en: 'Anthrax Zero-Tolerance Lockout Active!',
  },
  anthraxLockoutSubtitle: {
    mr: 'शव विच्छेदन करण्यास सक्त मनाई आहे.',
    hi: 'शव विच्छेदन करना सख्त मना है।',
    en: 'Carcass post-mortem strictly prohibited.',
  },
  openAlert: {
    mr: 'इशारा उघडा',
    hi: 'चेतावनी खोलें',
    en: 'Open Alert',
  },
  openLockoutProtocol: {
    mr: 'ॲन्थ्रॅक्स लॉकआऊट प्रोटोकॉल उघडा (Anthrax Lockout)',
    hi: 'एंथ्रेक्स लॉकआउट प्रोटोकॉल खोलें (Anthrax Lockout)',
    en: 'Open Anthrax Lockout Protocol',
  },

  // Media Capture
  photoCardTitle: {
    mr: '१. जनावराचा फोटो (Lesion Photo)',
    hi: '१. पशु के घाव का फोटो (Lesion Photo)',
    en: '1. Animal Lesion Photo',
  },
  photoCardSubtitle: {
    mr: 'स्वयंचलित WebP कॉम्प्रेशन (<300 KB)',
    hi: 'स्वचालित WebP कम्प्रेशन (<300 KB)',
    en: 'Auto WebP Compression (<300 KB)',
  },
  openCamera: {
    mr: 'कॅमेरा उघडा',
    hi: 'कैमरा खोलें',
    en: 'Open Camera',
  },
  takePhoto: {
    mr: 'फोटो काढा',
    hi: 'फोटो लें',
    en: 'Take Photo',
  },
  selectGallery: {
    mr: 'गॅलरी निवडा',
    hi: 'गैलरी चुनें',
    en: 'Gallery',
  },
  uploadGallery: {
    mr: 'गॅलरी अपलोड',
    hi: 'गैलरी अपलोड',
    en: 'Upload Gallery',
  },
  retake: {
    mr: 'बदला (Retake)',
    hi: 'बदलें (Retake)',
    en: 'Retake Photo',
  },
  remove: {
    mr: 'काढून टाका (Remove)',
    hi: 'हटाएं (Remove)',
    en: 'Remove',
  },
  collected: {
    mr: '✓ संकलित',
    hi: '✓ संकलित',
    en: '✓ Captured',
  },

  // Voice Note
  voiceCardTitle: {
    mr: '२. स्थानिक व्हॉइस नोट (Vernacular Audio Note)',
    hi: '२. स्थानिक वॉयस नोट (Vernacular Audio Note)',
    en: '2. Vernacular Voice Note',
  },
  voiceCardSubtitle: {
    mr: 'मराठी किंवा हिंदीमध्ये लक्षणे सांगा (Max 30s)',
    hi: 'मराठी या हिंदी में लक्षण बताएं (Max 30s)',
    en: 'Describe symptoms in voice note (Max 30s)',
  },
  recordVoiceNote: {
    mr: 'व्हॉइस नोट रेकॉर्ड करा (Record Voice Note)',
    hi: 'वॉयस नोट रिकॉर्ड करें (Record Voice Note)',
    en: 'Record Voice Note',
  },
  speakSymptoms: {
    mr: 'लक्षणे बोलून सांगा (कमाल ३० सेकंद)',
    hi: 'लक्षण बोलकर बताएं (अधिकतम ३० सेकंड)',
    en: 'Speak observed symptoms (Max 30s)',
  },
  recordingInProgress: {
    mr: 'रेकॉर्डिंग सुरू आहे... पूर्ण झाल्यावर थांबवा',
    hi: 'रिकॉर्डिंग जारी है... पूरा होने पर रोकें',
    en: 'Recording in progress... Stop when done',
  },
  stopRecording: {
    mr: 'थांबवा (Stop Recording)',
    hi: 'रोकें (Stop Recording)',
    en: 'Stop Recording',
  },
  audioReady: {
    mr: 'रेकॉर्ड केलेला ऑडिओ (Audio Ready)',
    hi: 'रिकॉर्ड किया गया ऑडियो (Audio Ready)',
    en: 'Recorded Audio Ready',
  },
  durationSec: {
    mr: 'कालावधी',
    hi: 'अवधि',
    en: 'Duration',
  },
  play: {
    mr: 'ऐका (Play)',
    hi: 'सुनें (Play)',
    en: 'Play Audio',
  },
  pause: {
    mr: 'थांबवा',
    hi: 'रोकें',
    en: 'Pause',
  },
  rerecord: {
    mr: 'पुन्हा रेकॉर्ड करा (Re-record)',
    hi: 'पुनः रिकॉर्ड करें (Re-record)',
    en: 'Re-record',
  },

  // Location & Tag
  locationCardTitle: {
    mr: 'स्थान व LGD गाव (Location & LGD Village)',
    hi: 'स्थान व LGD ग्राम (Location & LGD Village)',
    en: 'Location & LGD Village',
  },
  locationCardSubtitle: {
    mr: 'स्थानिक ग्रामपंचायत मॅपिंग',
    hi: 'स्थानीय ग्राम पंचायत मिलान',
    en: 'Gram Panchayat Geotag',
  },
  gpsAccuracy: {
    mr: 'GPS अचूकता',
    hi: 'GPS सटीकता',
    en: 'GPS Accuracy',
  },
  goodSignal: {
    mr: '✓ चांगला सिग्नल',
    hi: '✓ अच्छा सिग्नल',
    en: '✓ Strong Signal',
  },
  weakSignal: {
    mr: '⚠ कमजोर सिग्नल',
    hi: '⚠ कमजोर सिग्नल',
    en: '⚠ Weak Signal',
  },
  latLabel: {
    mr: 'अक्षांश',
    hi: 'अक्षांश',
    en: 'Lat',
  },
  lngLabel: {
    mr: 'रेखांश',
    hi: 'रेखांश',
    en: 'Lng',
  },
  villageLabel: {
    mr: 'गाव',
    hi: 'ग्राम',
    en: 'Village',
  },
  blockPrefix: {
    mr: 'ता.',
    hi: 'तहसील',
    en: 'Block',
  },
  districtPrefix: {
    mr: 'जि.',
    hi: 'जिला',
    en: 'Dist.',
  },
  changeVillage: {
    mr: 'गाव बदला',
    hi: 'ग्राम बदलें',
    en: 'Change Village',
  },
  searchVillage: {
    mr: 'गाव किंवा तालुका शोधा (Search village)...',
    hi: 'ग्राम या तहसील खोजें (Search village)...',
    en: 'Search village or block...',
  },
  pashuAadhaarTitle: {
    mr: 'पशू आधार १२-अंकी टॅग (Pashu Aadhaar Tag)',
    hi: 'पशु आधार १२-अंकीय टैग (Pashu Aadhaar Tag)',
    en: 'Pashu Aadhaar 12-Digit Tag',
  },
  optional: {
    mr: 'ऐच्छिक (Optional)',
    hi: 'वैकल्पिक (Optional)',
    en: 'Optional',
  },
  tagPlaceholder: {
    mr: 'उदा. १२३४-५६७८-९०१२',
    hi: 'उदा. १२३४-५६७८-९०१२',
    en: 'e.g. 1234-5678-9012',
  },
  tagHelp: {
    mr: 'जनावराच्या कानातील पिवळ्या RFID टॅगचा १२-अंकी क्रमांक टाका.',
    hi: 'पशु के कान के पीले आरएफआईडी टैग का १२-अंकीय नंबर दर्ज करें।',
    en: 'Enter the 12-digit RFID number from the yellow ear tag.',
  },

  // Secondary Symptoms
  selectObservedSymptoms: {
    mr: 'तपशीलवार लक्षणे निवडा (Select Observed Symptoms):',
    hi: 'विस्तृत लक्षण चुनें (Select Observed Symptoms):',
    en: 'Select Observed Symptoms:',
  },
  selectedCount: {
    mr: 'निवडले',
    hi: 'चुने गए',
    en: 'selected',
  },

  // Clinical Guidance & Advisory
  farmerAdvisoryTitle: {
    mr: 'पशुपालकांसाठी महत्त्वाची काळजी (Farmer Advisory)',
    hi: 'पशुपालकों के लिए आवश्यक सलाह (Farmer Advisory)',
    en: 'Farmer Biosecurity Advisory',
  },
  suspectedDisease: {
    mr: 'संशयित आजार:',
    hi: 'संभावित रोग:',
    en: 'Suspected Disease:',
  },
  helplineBtn: {
    mr: 'पशु सखी हेल्पलाइन (१९६२)',
    hi: 'पशु सखी हेल्पलाइन (१९६२)',
    en: 'Helpline (1962)',
  },
  helpline24x7: {
    mr: 'टोल-फ्री २४x७ सेवा',
    hi: 'टोल-फ्री २४x७ सेवा',
    en: 'Toll-free 24x7 Service',
  },

  // Success Modal
  reportSuccessTitle: {
    mr: 'अहवाल यशस्वीरित्या जतन झाला!',
    hi: 'रिपोर्ट सफलतापूर्वक सहेजी गई!',
    en: 'Report Saved Successfully!',
  },
  reportSuccessSubtitle: {
    mr: 'स्थानिक SQLite रांगेमध्ये अहवाल सुरक्षित ठेवण्यात आला आहे.',
    hi: 'स्थानीय SQLite कतार में रिपोर्ट सुरक्षित रूप से सहेजी गई है।',
    en: 'Securely enqueued in offline SQLite sync queue.',
  },
  syndromeLabel: {
    mr: 'लक्षण',
    hi: 'लक्षण',
    en: 'Syndrome',
  },
  photoAttachedLabel: {
    mr: '✓ WebP फोटो जोडला',
    hi: '✓ WebP फोटो संलग्न',
    en: '✓ WebP photo attached',
  },
  voiceAttachedLabel: {
    mr: '✓ व्हॉइस नोट जोडली',
    hi: '✓ वॉयस नोट संलग्न',
    en: '✓ Voice note attached',
  },
  newReportBtn: {
    mr: 'नवीन अहवाल नोंदवा (New Report)',
    hi: 'नई रिपोर्ट दर्ज करें (New Report)',
    en: 'Record New Report',
  },

  // Severity Badges
  severityEmergency: {
    mr: 'आपत्कालीन',
    hi: 'आपातकालीन',
    en: 'EMERGENCY',
  },
  severityContagion: {
    mr: 'तीव्र संसर्ग',
    hi: 'अति संक्रामक',
    en: 'HIGH CONTAGION',
  },
  severityTarget: {
    mr: 'लक्ष्य',
    hi: 'लक्षित',
    en: 'TARGET',
  },
  severityRoutine: {
    mr: 'सामान्य',
    hi: 'सामान्य',
    en: 'ROUTINE',
  },

  // Role Selection View
  roleSelectorTitle: {
    mr: 'पशु सुरक्षा — भूमिका निवडा',
    hi: 'पशु सुरक्षा — भूमिका चुनें',
    en: 'Pashu-Suraksha — Select Role',
  },
  roleSelectorSubtitle: {
    mr: 'फील्ड ऑपरेशन्ससाठी वापरकर्ता भूमिका निवडा',
    hi: 'फ़ील्ड ऑपरेशन्स के लिए उपयोगकर्ता भूमिका चुनें',
    en: 'Select User Role for Field Operations',
  },
  activeRoleBadge: {
    mr: 'सक्रिय भूमिका (Active)',
    hi: 'सक्रिय भूमिका (Active)',
    en: 'Active Role',
  },
  userPrefix: {
    mr: 'वापरकर्ता: ',
    hi: 'उपयोगकर्ता: ',
    en: 'User: ',
  },
  selectThisRole: {
    mr: 'हा रोल निवडा',
    hi: 'यह रोल चुनें',
    en: 'Select Role',
  },
  alreadySelected: {
    mr: 'निवडले आहे',
    hi: 'चुना हुआ है',
    en: 'Selected',
  },

  // Emergency SOS Modal
  emergencyBiohazardTitle: {
    mr: 'अति-तातडीक इशारा (BIOHAZARD)',
    hi: 'अति-आपातकालीन चेतावनी (BIOHAZARD)',
    en: 'BIOHAZARD EMERGENCY',
  },
  doNotCutTitle: {
    mr: 'शव विच्छेदन करू नका!',
    hi: 'शव विच्छेदन न करें!',
    en: 'DO NOT CUT CARCASS!',
  },
  doNotCutSubtitle: {
    mr: 'DO NOT CUT CARCASS',
    hi: 'DO NOT CUT CARCASS',
    en: 'DO NOT CUT CARCASS',
  },
  anthraxSuspectDesc: {
    mr: 'काळपुळी (Anthrax) संशय: जनावराचे रक्त न गोठल्यास किंवा अचानक मृत्यू झाल्यास मृतदेह उघडू नका. मानवाला गंभीर संसर्ग होण्याचा धोका आहे.',
    hi: 'एंथ्रेक्स संशय: यदि पशु का खून न जम रहा हो या अचानक मृत्यु हुई हो, तो शव न खोलें। मनुष्यों में गंभीर संक्रमण का खतरा है।',
    en: 'Anthrax Suspected: If unclotted dark blood oozes or sudden death occurs, do not cut or open carcass. Fatal zoonotic risk.',
  },
  contactVetDesc: {
    mr: 'स्थानिक पशुवैद्यकीय अधिकारी किंवा १९६२ हेल्पलाईनवर संपर्क साधा. मृतदेहाभोवती चुना पसरवून ठेवा.',
    hi: 'स्थानीय पशु चिकित्सक या १९६२ हेल्पलाइन पर संपर्क करें। शव के चारों ओर चूना छिड़कें।',
    en: 'Contact local veterinary officer or 1962 helpline immediately. Spread quicklime around the carcass.',
  },
  submitBiohazardBtn: {
    mr: 'तातडीक बायोहॅझार्ड अहवाल नोंदवा',
    hi: 'आपातकालीन बायोहाज़ार्ड रिपोर्ट दर्ज करें',
    en: 'Submit Biohazard Emergency Report',
  },
  callHelplineBtn: {
    mr: '१९६२ पशु हेल्पलाईनला कॉल करा',
    hi: '१९६२ पशु हेल्पलाइन पर कॉल करें',
    en: 'Call 1962 Livestock Helpline',
  },

  // Dashboard View
  commandWarRoomTitle: {
    mr: 'जिल्हा नियंत्रण कक्ष (GIS Command War Room)',
    hi: 'जिला नियंत्रण कक्ष (GIS Command War Room)',
    en: 'District GIS Command War Room',
  },
  marketClosureBtn: {
    mr: 'बाजार बंदी आदेश',
    hi: 'बाजार बंदी आदेश',
    en: 'Market Closure Order',
  },
  activeClusters: {
    mr: 'सक्रिय क्लस्टर',
    hi: 'सक्रिय क्लस्टर',
    en: 'Active Clusters',
  },
  declared: {
    mr: 'घोषित',
    hi: 'घोषित',
    en: 'declared',
  },
  surveillanceVillages: {
    mr: 'पाळत गावे (LGD)',
    hi: 'निगरानी ग्राम (LGD)',
    en: 'Surveillance Villages',
  },
  perimeter10km: {
    mr: '१० किमी परिमिती',
    hi: '१० किमी परिधि',
    en: '10km Perimeter',
  },
  ringVaccinationTarget: {
    mr: 'रिंग लसीकरण लक्ष्य',
    hi: 'रिंग टीकाकरण लक्ष्य',
    en: 'Ring Vaccination Target',
  },
  localPerimeterRadar: {
    mr: 'स्थानिक पाळत परिमिती (5 km Radar)',
    hi: 'स्थानीय निगरानी परिधि (5 km Radar)',
    en: 'Local Surveillance Perimeter (5 km Radar)',
  },
  noOutbreakFound: {
    mr: '५ किमी परिघात कोणतीही संसर्गजन्य हालचाल आढळलेली नाही (Zero Outbreak Rings).',
    hi: '५ किमी परिधि में कोई संक्रामक गतिविधि नहीं पाई गई (Zero Outbreak Rings).',
    en: 'No infectious disease activity detected in 5 km perimeter (Zero Outbreak Rings).',
  },
  pendingReports: {
    mr: 'प्रलंबित अहवाल',
    hi: 'लंबित रिपोर्ट',
    en: 'Pending Reports',
  },
  securedInSqlite: {
    mr: 'SQLite मध्ये सुरक्षित',
    hi: 'SQLite में सुरक्षित',
    en: 'Secured in SQLite',
  },
  monitoredVillages: {
    mr: 'निरीक्षण गावे',
    hi: 'निगरानी ग्राम',
    en: 'Monitored Villages',
  },
  lgdBordersAttached: {
    mr: 'LGD सीमा संलग्न',
    hi: 'LGD सीमा संलग्न',
    en: 'LGD Boundaries Linked',
  },
  weatherWarningTitle: {
    mr: 'दक्षता सूचना: हवामान बदल (Weather Warning)',
    hi: 'सतर्कता सूचना: मौसम परिवर्तन (Weather Warning)',
    en: 'Weather Warning: High Risk Period',
  },
  weatherWarningDesc: {
    mr: 'पावसामुळे घटसर्प (HS) व एकटांग्या (BQ) रोगाचा धोका वाढला आहे. पशुपालकांना लसीकरणाचा सल्ला द्या.',
    hi: 'बारिश के कारण गलघोंटू (HS) और लंगड़ा बुखार (BQ) का जोखिम बढ़ गया है। पशुपालकों को टीकाकरण की सलाह दें।',
    en: 'Monsoon conditions elevate risk of Hemorrhagic Septicemia (HS) and Black Quarter (BQ). Ring vaccination advised.',
  },

  // General Status
  offlineStatus: {
    mr: 'ऑफलाइन',
    hi: 'ऑफ़लाइन',
    en: 'Offline',
  },
  onlineStatus: {
    mr: 'ऑनलाइन',
    hi: 'ऑनलाइन',
    en: 'Online',
  },
  syncing: {
    mr: 'सिंक...',
    hi: 'सिंक...',
    en: 'Sync...',
  },
  selectLanguage: {
    mr: 'भाषा निवडा (Select Language)',
    hi: 'भाषा चुनें (Select Language)',
    en: 'Select Language',
  },
  languageDescription: {
    mr: 'तुमच्या पसंतीची भाषा निवडा (Select your preferred language):',
    hi: 'अपनी पसंदीदा भाषा चुनें (Select your preferred language):',
    en: 'Select your preferred language for livestock surveillance:',
  },
  close: {
    mr: 'बंद करा',
    hi: 'बंद करें',
    en: 'Close',
  },
  activeBadge: {
    mr: 'सक्रिय',
    hi: 'सक्रिय',
    en: 'Active',
  },

  // Animal Registry & Passbook
  cattlePassbookTitle: {
    mr: 'पशू आधार पासबुक (Cattle Registry)',
    hi: 'पशु आधार पासबुक (Cattle Registry)',
    en: 'Cattle Health Passbook',
  },
  cattlePassbookSubtitle: {
    mr: 'डिजिटल आरोग्य पासबुक आणि आरएफआईडी नोंदी',
    hi: 'डिजिटल स्वास्थ्य पासबुक व आरएफआईडी रिकॉर्ड',
    en: 'Offline Digital Health Passbook & RFID Records',
  },
  newRegistration: {
    mr: '+ नवीन नोंदणी',
    hi: '+ नया पंजीकरण',
    en: '+ New Animal',
  },
  totalAnimals: {
    mr: 'एकूण पशु',
    hi: 'कुल पशु',
    en: 'Total Animals',
  },
  vaccinesComplete: {
    mr: 'लस पूर्ण',
    hi: 'टीकाकरण पूर्ण',
    en: 'Up to Date',
  },
  boosterDue: {
    mr: 'बूस्टर वेळ',
    hi: 'बूस्टर देय',
    en: 'Booster Due',
  },
  vaccineOverdue: {
    mr: 'लस थकीत',
    hi: 'टीकाकरण बकाया',
    en: 'Overdue',
  },
  myCattle: {
    mr: 'माझे पशु',
    hi: 'मेरे पशु',
    en: 'My Cattle',
  },
  searchTag: {
    mr: 'टॅग क्रमांक शोधा',
    hi: 'टैग संख्या खोजें',
    en: 'Search Tag',
  },
  speciesBreed: {
    mr: 'प्रजाती व जात',
    hi: 'प्रजाति व नस्ल',
    en: 'Species & Breed',
  },
  age: {
    mr: 'वय',
    hi: 'आयु',
    en: 'Age',
  },
  months: {
    mr: 'महिने',
    hi: 'महीने',
    en: 'months',
  },
  years: {
    mr: 'वर्षे',
    hi: 'वर्ष',
    en: 'years',
  },
};

interface LanguageState {
  currentLanguage: SupportedLanguage;
  isSelectorOpen: boolean;
  setLanguage: (lang: SupportedLanguage) => void;
  setSelectorOpen: (open: boolean) => void;
  t: (key: string, defaultText?: string) => string;
}

const getInitialLanguage = (): SupportedLanguage => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = localStorage.getItem('pashu_language') as SupportedLanguage;
    if (saved === 'mr' || saved === 'hi' || saved === 'en') {
      return saved;
    }
  }
  return 'mr';
};

export const useLanguageStore = create<LanguageState>((set, get) => ({
  currentLanguage: getInitialLanguage(),
  isSelectorOpen: false,

  setLanguage: (lang: SupportedLanguage) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('pashu_language', lang);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
    set({ currentLanguage: lang, isSelectorOpen: false });
  },

  setSelectorOpen: (open: boolean) => set({ isSelectorOpen: open }),

  t: (key: string, defaultText?: string): string => {
    const lang = get().currentLanguage;
    const translation = UI_TRANSLATIONS[key];
    if (translation && translation[lang]) {
      return translation[lang];
    }
    return defaultText ?? key;
  },
}));

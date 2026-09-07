export type SyndromeSeverity =
  | 'ROUTINE_ENDEMIC'
  | 'ELEVATED'
  | 'HIGH_CONTAGION'
  | 'CRITICAL_BIOHAZARD';

export type SyndromeCategory =
  | 'VSS'
  | 'NSLS'
  | 'HSDS'
  | 'AROS'
  | 'CMSS'
  | 'SARF'
  | 'HES'
  | 'NAS';

export interface SyndromeDefinition {
  code: SyndromeCategory;
  nameEnglish: string;
  nameMarathi: string;
  nameHindi?: string;
  colloquialMarathi: string;
  colloquialHindi?: string;
  colloquialEnglish?: string;
  anatomicalPart:
    | 'mouth_hoof'
    | 'skin_lumps'
    | 'sudden_death_blood'
    | 'respiratory'
    | 'swollen_quarter'
    | 'reproductive'
    | 'enteric'
    | 'neurological';
  severity: SyndromeSeverity;
  descriptionEnglish: string;
  descriptionMarathi: string;
  descriptionHindi?: string;
  commonSuspects: string[];
  isZoonotic: boolean;
}

export interface SecondarySymptomDefinition {
  id: string;
  nameMarathi: string;
  nameHindi?: string;
  nameEnglish: string;
  isHighRisk?: boolean;
}

export interface DifferentialDiagnosis {
  diseaseName: string;
  diseaseNameEnglish?: string;
  diseaseNameMarathi: string;
  diseaseNameHindi?: string;
  icd11OrOieCode: string;
  confidence: 'CONFIRMED_ALERT' | 'HIGHLY_PROBABLE' | 'SUSPECTED';
  isBiohazard: boolean;
  isIdspNotifiable: boolean;
  recommendedAction: string;
  recommendedActionEnglish?: string;
  recommendedActionMarathi: string;
  recommendedActionHindi?: string;
}

export interface DecisionTreeResult {
  isAnthraxLockout: boolean;
  urgencyLevel: SyndromeSeverity;
  primaryDifferential: DifferentialDiagnosis;
  secondaryDifferentials: DifferentialDiagnosis[];
  clinicalGuidance?: string;
  farmerAdvisory?: string;
  farmerAdvisoryEnglish?: string;
  farmerAdvisoryMarathi?: string;
  farmerAdvisoryHindi?: string;
  idspNotifiable?: boolean;
  recommendedAction?: string;
  recommendedActionMarathi?: string;
  recommendedActionHindi?: string;
  statutoryAdvisory?: string;
  statutoryAdvisoryMarathi?: string;
  statutoryAdvisoryHindi?: string;
}

export const SYNDROME_TAXONOMY: SyndromeDefinition[] = [
  {
    code: 'VSS',
    nameEnglish: 'Vesicular & Salivation Syndrome',
    nameMarathi: 'तोंड आणि खुरांचे फोड',
    nameHindi: 'मुंह और खुर के छाले',
    colloquialMarathi: 'लाळ गळणे, खुरकुत',
    colloquialHindi: 'लार गिरना, खुरपका-मुंहपका (FMD)',
    colloquialEnglish: 'Drooling, Foot & Mouth Disease',
    anatomicalPart: 'mouth_hoof',
    severity: 'HIGH_CONTAGION',
    descriptionEnglish: 'Blisters on snout, tongue, hooves; excessive drooling; severe lameness and refusal to feed.',
    descriptionMarathi: 'तोंडात व जिभेवर फोड, पांढरी लाळ गळणे, खुरांमध्ये जखमा होऊन लंगडणे.',
    descriptionHindi: 'मुंह, जीभ और खुरों पर छाले, लार गिरना, लंगड़ापन और चारा न खाना.',
    commonSuspects: ['Foot & Mouth Disease (FMD)', 'Vesicular Stomatitis'],
    isZoonotic: false,
  },
  {
    code: 'NSLS',
    nameEnglish: 'Nodular Skin Lesion Syndrome',
    nameMarathi: 'लंपी त्वचा / अंगावर गाठी',
    nameHindi: 'लम्पी त्वचा / शरीर पर गांठें',
    colloquialMarathi: 'अंगावर गाठी, लंपी रोग',
    colloquialHindi: 'त्वचा पर गांठें, लम्पी रोग',
    colloquialEnglish: 'Skin Nodules, Lumpy Skin Disease',
    anatomicalPart: 'skin_lumps',
    severity: 'HIGH_CONTAGION',
    descriptionEnglish: 'Hard, raised nodules/lumps across skin, high fever, swollen superficial lymph nodes, leg edema.',
    descriptionMarathi: 'संपूर्ण अंगावर कडक गाठी, प्रचंड ताप, पायाला सूज आणि डोळ्यातून पाणी.',
    descriptionHindi: 'पूरे शरीर पर कड़ी गांठें, तेज बुखार, पैरों में सूजन और आंखों से पानी बहना.',
    commonSuspects: ['Lumpy Skin Disease (LSD)', 'Pseudo-lumpy skin'],
    isZoonotic: false,
  },
  {
    code: 'HSDS',
    nameEnglish: 'Hyperacute Sudden Death Syndrome',
    nameMarathi: 'अचानक मृत्यू / काळी माती',
    nameHindi: 'अचानक मृत्यु / गिल्टी रोग',
    colloquialMarathi: 'रक्तस्त्राव, काळपुळी (विच्छेदन बंदी)',
    colloquialHindi: 'खून बहना, एंथ्रेक्स (शव चीरफाड़ निषेध)',
    colloquialEnglish: 'Dark Bleeding, Anthrax (DO NOT CUT)',
    anatomicalPart: 'sudden_death_blood',
    severity: 'CRITICAL_BIOHAZARD',
    descriptionEnglish: 'Sudden collapse and death within hours; dark unclotted blood oozing from mouth, nose, rectum; no rigor mortis.',
    descriptionMarathi: 'जनावराचा अचानक मृत्यू; नाक, तोंड व गुदद्वारातून काळे न गोठणारे रक्त येणे. शव विच्छेदन करू नये!',
    descriptionHindi: 'पशु की अचानक मृत्यु; नाक, मुंह व गुदा से न जमने वाला काला खून आना. शव चीरफाड़ बिल्कुल न करें!',
    commonSuspects: ['Anthrax (काळपुळी)', 'Acute Lightning Strike'],
    isZoonotic: true,
  },
  {
    code: 'AROS',
    nameEnglish: 'Acute Respiratory & Cough Syndrome',
    nameMarathi: 'श्वसनाचा तीव्र त्रास / ठसका',
    nameHindi: 'सांस लेने में तकलीफ / धौंकनी',
    colloquialMarathi: 'घटसर्प, खोकला, धाप लागणे',
    colloquialHindi: 'गलघोंटू (HS), खांसी, तेज सांस',
    colloquialEnglish: 'Grunting Breath, Hemorrhagic Septicemia',
    anatomicalPart: 'respiratory',
    severity: 'ELEVATED',
    descriptionEnglish: 'High fever, profuse oculonasal discharge, rapid grunting breath, extended neck, painful cough.',
    descriptionMarathi: 'मान ताणून धापा टाकणे, नाकातून घट्ट शेंबूड, डोळ्यातून पाणी, घशात घरघर आवाज.',
    descriptionHindi: 'गर्दन तानकर तेज सांस लेना, नाक से गाढ़ा स्राव, गले में घरघराहट और दर्दनाक खांसी.',
    commonSuspects: ['Hemorrhagic Septicemia (HS)', 'PPR (शेळी-मेंढी)', 'CBPP'],
    isZoonotic: false,
  },
  {
    code: 'CMSS',
    nameEnglish: 'Crepitant Muscular Swelling Syndrome',
    nameMarathi: 'मान-पायाची सूज / एकटांग्या',
    nameHindi: 'गर्दन-पैर में सूजन / लंगड़ा बुखार',
    colloquialMarathi: 'फऱ्या, दाबल्यावर चरचर आवाज',
    colloquialHindi: 'ब्लैक क्वार्टर (BQ), चरचराहट की आवाज',
    colloquialEnglish: 'Black Quarter, Crepitant Swelling',
    anatomicalPart: 'swollen_quarter',
    severity: 'ELEVATED',
    descriptionEnglish: 'Hot, painful crepitant swelling over shoulder or thigh crackling under thumb pressure; severe lameness; rapid death.',
    descriptionMarathi: 'खांद्यावर किंवा पाठीवर गरम सूज, दाबल्यास चरचर आवाज येणे, जनावर एका पायाने लंगडणे.',
    descriptionHindi: 'कंधे या पुट्ठे पर गर्म व दर्दनाक सूजन, दबाने पर चरचर आवाज और गंभीर लंगड़ापन.',
    commonSuspects: ['Black Quarter (BQ - फऱ्या)', 'Malignant Edema'],
    isZoonotic: false,
  },
  {
    code: 'SARF',
    nameEnglish: 'Storm Abortion & Reproductive Failure',
    nameMarathi: 'गाभण जनावरांचा गर्भपात',
    nameHindi: 'गर्भवती पशुओं का गर्भपात',
    colloquialMarathi: 'सलग गर्भपात, वार अडकणे',
    colloquialHindi: 'ब्रुसेलोसिस, जेर न गिरना',
    colloquialEnglish: 'Late-Term Abortion, Brucellosis',
    anatomicalPart: 'reproductive',
    severity: 'ELEVATED',
    descriptionEnglish: 'Late-term abortion in multiple cows/goats within 14 days, retained fetal membranes, orchitis in breeding bulls.',
    descriptionMarathi: 'कळपातील अनेक गाभण जनावरांचा ७-८ व्या महिन्यात गर्भपात, वार न पडणे.',
    descriptionHindi: 'झुंड में कई पशुओं का ७-८वें महीने में गर्भपात और जेर का रुक जाना.',
    commonSuspects: ['Brucellosis (ब्रूसेलोसिस)', 'Campylobacteriosis'],
    isZoonotic: true,
  },
  {
    code: 'HES',
    nameEnglish: 'Hemorrhagic Enteric Syndrome',
    nameMarathi: 'रक्ताची हगवण / संडास',
    nameHindi: 'खूनी दस्त / पेचिश',
    colloquialMarathi: 'रक्ताचे जुलाब, हगवण',
    colloquialHindi: 'रक्तयुक्त दस्त, एंटरोटॉक्सेमिया',
    colloquialEnglish: 'Bloody Diarrhea, Enterotoxemia',
    anatomicalPart: 'enteric',
    severity: 'ROUTINE_ENDEMIC',
    descriptionEnglish: 'Profuse watery or mucous diarrhea mixed with dark blood clots, rapid dehydration, sunken eyeballs.',
    descriptionMarathi: 'दुर्गंधीयुक्त रक्ताचे पातळ जुलाब, पोटदुखी, डोळे खोल जाणे, तीव्र अशक्तपणा.',
    descriptionHindi: 'खून मिले पतले बदबूदार दस्त, पेट दर्द, आंखें धंसना और अत्यधिक कमजोरी.',
    commonSuspects: ['Enterotoxaemia (ET - फड़किया)', 'Coccidiosis', 'BVD'],
    isZoonotic: false,
  },
  {
    code: 'NAS',
    nameEnglish: 'Neurological & Agitation Syndrome',
    nameMarathi: 'पिसाळणे / चक्कर येणे',
    nameHindi: 'पागलपन / चक्कर आना',
    colloquialMarathi: 'वेडेवाकडे फिरणे, चावणे',
    colloquialHindi: 'गोल-गोल घूमना, रेबीज',
    colloquialEnglish: 'Circling, Aggression, Rabies',
    anatomicalPart: 'neurological',
    severity: 'HIGH_CONTAGION',
    descriptionEnglish: 'Incessant circling, head pressing against walls, hyper-aggression, inability to swallow water, tremors, paralysis.',
    descriptionMarathi: 'भिंतीवर डोके आपटणे, गोल गोल फिरणे, पाणी पिण्यास असमर्थ, पिसाळल्यासारखे चावणे.',
    descriptionHindi: 'दीवार से सिर टकराना, गोल चक्कर काटना, पानी न निगल पाना और काटने दौड़ना.',
    commonSuspects: ['Rabies (रेबीज)', 'Listeriosis', 'BSE / Scrapie'],
    isZoonotic: true,
  },
];

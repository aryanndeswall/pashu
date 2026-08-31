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
  colloquialMarathi: string;
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
  commonSuspects: string[];
  isZoonotic: boolean;
}

export const SYNDROME_TAXONOMY: SyndromeDefinition[] = [
  {
    code: 'VSS',
    nameEnglish: 'Vesicular & Salivation Syndrome',
    nameMarathi: 'तोंड आणि खुरांचे फोड',
    colloquialMarathi: 'लाळ गळणे, खुरकुत',
    anatomicalPart: 'mouth_hoof',
    severity: 'HIGH_CONTAGION',
    descriptionEnglish: 'Blisters on snout, tongue, hooves; excessive drooling; severe lameness and refusal to feed.',
    descriptionMarathi: 'तोंडात व जिभेवर फोड, पांढरी लाळ गळणे, खुरांमध्ये जखमा होऊन लंगडणे.',
    commonSuspects: ['Foot & Mouth Disease (FMD)', 'Vesicular Stomatitis'],
    isZoonotic: false,
  },
  {
    code: 'NSLS',
    nameEnglish: 'Nodular Skin Lesion Syndrome',
    nameMarathi: 'लंपी त्वचा / अंगावर गाठी',
    colloquialMarathi: 'अंगावर गाठी, लंपी रोग',
    anatomicalPart: 'skin_lumps',
    severity: 'HIGH_CONTAGION',
    descriptionEnglish: 'Hard, raised nodules/lumps across skin, high fever, swollen superficial lymph nodes, leg edema.',
    descriptionMarathi: 'संपूर्ण अंगावर कडक गाठी, प्रचंड ताप, पायाला सूज आणि डोळ्यातून पाणी.',
    commonSuspects: ['Lumpy Skin Disease (LSD)', 'Pseudo-lumpy skin'],
    isZoonotic: false,
  },
  {
    code: 'HSDS',
    nameEnglish: 'Hyperacute Sudden Death Syndrome',
    nameMarathi: 'अचानक मृत्यू / काळी माती',
    colloquialMarathi: 'रक्तस्त्राव, काळपुळी (विच्छेदन बंदी)',
    anatomicalPart: 'sudden_death_blood',
    severity: 'CRITICAL_BIOHAZARD',
    descriptionEnglish: 'Sudden collapse and death within hours; dark unclotted blood oozing from mouth, nose, rectum; no rigor mortis.',
    descriptionMarathi: 'जनावराचा अचानक मृत्यू; नाक, तोंड व गुदद्वारातून काळे न गोठणारे रक्त येणे. शव विच्छेदन करू नये!',
    commonSuspects: ['Anthrax (काळपुळी)', 'Acute Lightning Strike'],
    isZoonotic: true,
  },
  {
    code: 'AROS',
    nameEnglish: 'Acute Respiratory & Cough Syndrome',
    nameMarathi: 'श्वसनाचा तीव्र त्रास / ठसका',
    colloquialMarathi: 'घटसर्प, खोकला, धाप लागणे',
    anatomicalPart: 'respiratory',
    severity: 'ELEVATED',
    descriptionEnglish: 'High fever, profuse oculonasal discharge, rapid grunting breath, extended neck, painful cough.',
    descriptionMarathi: 'मान ताणून धापा टाकणे, नाकातून घट्ट शेंबूड, डोळ्यातून पाणी, घशात घरघर आवाज.',
    commonSuspects: ['Hemorrhagic Septicemia (HS)', 'PPR (शेळी-मेंढी)', 'CBPP'],
    isZoonotic: false,
  },
  {
    code: 'CMSS',
    nameEnglish: 'Crepitant Muscular Swelling Syndrome',
    nameMarathi: 'मान-पायाची सूज / एकटांग्या',
    colloquialMarathi: 'फऱ्या, दाबल्यावर चरचर आवाज',
    anatomicalPart: 'swollen_quarter',
    severity: 'ELEVATED',
    descriptionEnglish: 'Hot, painful crepitant swelling over shoulder or thigh crackling under thumb pressure; severe lameness; rapid death.',
    descriptionMarathi: 'खांद्यावर किंवा पाठीवर गरम सूज, दाबल्यास चरचर आवाज येणे, जनावर एका पायाने लंगडणे.',
    commonSuspects: ['Black Quarter (BQ - फऱ्या)', 'Malignant Edema'],
    isZoonotic: false,
  },
  {
    code: 'SARF',
    nameEnglish: 'Storm Abortion & Reproductive Failure',
    nameMarathi: 'गाभण जनावरांचा गर्भपात',
    colloquialMarathi: 'सलग गर्भपात, वार अडकणे',
    anatomicalPart: 'reproductive',
    severity: 'ELEVATED',
    descriptionEnglish: 'Late-term abortion in multiple cows/goats within 14 days, retained fetal membranes, orchitis in breeding bulls.',
    descriptionMarathi: 'कळपातील अनेक गाभण जनावरांचा ७-८ व्या महिन्यात गर्भपात, वार न पडणे.',
    commonSuspects: ['Brucellosis (ब्रूसेलोसिस)', 'Campylobacteriosis'],
    isZoonotic: true,
  },
  {
    code: 'HES',
    nameEnglish: 'Hemorrhagic Enteric Syndrome',
    nameMarathi: 'रक्ताची हगवण / संडास',
    colloquialMarathi: 'रक्ताचे जुलाब, हगवण',
    anatomicalPart: 'enteric',
    severity: 'ROUTINE_ENDEMIC',
    descriptionEnglish: 'Profuse watery or mucous diarrhea mixed with dark blood clots, rapid dehydration, sunken eyeballs.',
    descriptionMarathi: 'दुर्गंधीयुक्त रक्ताचे पातळ जुलाब, पोटदुखी, डोळे खोल जाणे, तीव्र अशक्तपणा.',
    commonSuspects: ['Enterotoxaemia (ET - फड़किया)', 'Coccidiosis', 'BVD'],
    isZoonotic: false,
  },
  {
    code: 'NAS',
    nameEnglish: 'Neurological & Agitation Syndrome',
    nameMarathi: 'पिसाळणे / चक्कर येणे',
    colloquialMarathi: 'वेडेवाकडे फिरणे, चावणे',
    anatomicalPart: 'neurological',
    severity: 'HIGH_CONTAGION',
    descriptionEnglish: 'Incessant circling, head pressing against walls, hyper-aggression, inability to swallow water, tremors, paralysis.',
    descriptionMarathi: 'भिंतीवर डोके आपटणे, गोल गोल फिरणे, पाणी पिण्यास असमर्थ, पिसाळल्यासारखे चावणे.',
    commonSuspects: ['Rabies (रेबीज)', 'Listeriosis', 'BSE / Scrapie'],
    isZoonotic: true,
  },
];

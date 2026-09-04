import {
  SyndromeCategory,
  SecondarySymptomDefinition,
  DifferentialDiagnosis,
  DecisionTreeResult,
} from '../types/syndromes';

export const SECONDARY_SYMPTOMS_BY_SYNDROME: Record<SyndromeCategory, SecondarySymptomDefinition[]> = {
  VSS: [
    { id: 'oral_vesicles', nameMarathi: 'तोंडातील व जिभेवर फोड', nameEnglish: 'Oral blisters & mucosal erosions' },
    { id: 'hoof_lesions', nameMarathi: 'खुरांमधील जखमा व लंगडणे', nameEnglish: 'Interdigital hoof lesions & lameness' },
    { id: 'ropey_salivation', nameMarathi: 'तोंडातून लाळेच्या लांब तारा गळणे', nameEnglish: 'Profuse ropey salivation' },
    { id: 'fever_high', nameMarathi: 'तीव्र ताप (>१०४°F)', nameEnglish: 'High systemic fever (>104°F)' },
  ],
  NSLS: [
    { id: 'cutaneous_nodules', nameMarathi: 'अंगावर २-५ सेमी कडक गाठी', nameEnglish: 'Firm cutaneous nodules (2-5cm)' },
    { id: 'limb_edema', nameMarathi: 'पायांना व गळ्याला तीव्र सूज', nameEnglish: 'Limb and dewlap edema' },
    { id: 'lacrimation', nameMarathi: 'डोळ्यांतून पाणी व नाकातून स्राव', nameEnglish: 'Lacrimation and nasal discharge' },
    { id: 'fever', nameMarathi: 'सतत ताप व भूक मंदावणे', nameEnglish: 'Persistent fever and inappetence' },
  ],
  HSDS: [
    { id: 'sudden_death', nameMarathi: 'अचानक मृत्यू (<२ तासात)', nameEnglish: 'Sudden collapse and death within 2h', isHighRisk: true },
    { id: 'unclotted_dark_blood', nameMarathi: 'नाक/तोंडातून न गोठणारे काळे रक्त', nameEnglish: 'Unclotted dark tarry blood from orifices', isHighRisk: true },
    { id: 'rapid_bloat', nameMarathi: 'पोट अतिशय फुगणे (आकडणे नसणे)', nameEnglish: 'Rapid post-mortem bloat, absent rigor mortis', isHighRisk: true },
  ],
  AROS: [
    { id: 'swollen_throat_brisket', nameMarathi: 'घसा व छातीवर गरम वेदनारहित सूज', nameEnglish: 'Edematous hot throat & brisket swelling' },
    { id: 'grunting_dyspnea', nameMarathi: 'धाप लागणे व घोरण्याचा आवाज', nameEnglish: 'Severe grunting dyspnea with extended neck' },
    { id: 'tongue_protrusion', nameMarathi: 'जीभ बाहेर पडणे व लाळ गळणे', nameEnglish: 'Protruding swollen cyanotic tongue' },
  ],
  CMSS: [
    { id: 'crepitant_swelling', nameMarathi: 'पाठीवर/खांद्यावर हवेची सूज (चरचर आवाज)', nameEnglish: 'Hot crepitant muscular swelling with gas crackle' },
    { id: 'severe_lameness', nameMarathi: 'एका पायाने तीव्र लंगडणे', nameEnglish: 'Severe acute single-limb lameness' },
    { id: 'fever_depression', nameMarathi: 'तीव्र ताप व खाली खचणे', nameEnglish: 'High fever and rapid recumbency' },
  ],
  SARF: [
    { id: 'late_term_abortion', nameMarathi: '७ ते ९ व्या महिन्यात अचानक गर्भपात', nameEnglish: 'Third-trimester storm abortion (7-9 months)', isHighRisk: true },
    { id: 'retained_placenta', nameMarathi: 'वार अडकून दुर्गंधीयुक्त सडणे', nameEnglish: 'Retained placenta with necrotic odor', isHighRisk: true },
    { id: 'testicular_swelling', nameMarathi: 'वळूच्या अंडवृद्धी व सूज', nameEnglish: 'Severe orchitis in breeding bulls' },
  ],
  HES: [
    { id: 'bloody_diarrhea', nameMarathi: 'काळ्या रक्ताचे दुर्गंधीयुक्त जुलाब', nameEnglish: 'Hemorrhagic foul-smelling dark diarrhea' },
    { id: 'severe_dehydration', nameMarathi: 'डोळे खोल जाणे व कोरडे पडणे', nameEnglish: 'Sunken eyes and skin tenting dehydration' },
    { id: 'colic_pain', nameMarathi: 'पोटदुखी, पाय पोटावर मारणे', nameEnglish: 'Abdominal colic, groaning, straining' },
  ],
  NAS: [
    { id: 'aggressive_behavior', nameMarathi: 'अचानक आक्रमक होणे, चावणे', nameEnglish: 'Furious unprovoked aggression, biting', isHighRisk: true },
    { id: 'hypersalivation_choking', nameMarathi: 'पाणी न पिणे, खोकल्यासारखा घोगरा आवाज', nameEnglish: 'Hydrophobia, inability to swallow, frothing', isHighRisk: true },
    { id: 'paralysis_circling', nameMarathi: 'गोल गोल फिरणे, मागच्या पायांचा पक्षाघात', nameEnglish: 'Incessant circling, posterior paralysis', isHighRisk: true },
  ],
};

class DecisionTreeService {
  /**
   * Deterministic Offline Veterinary Rule Evaluation Engine
   */
  evaluateSyndrome(
    syndromeCode: SyndromeCategory,
    selectedSymptomIds: string[] = [],
    _species: string = 'Bovine'
  ): DecisionTreeResult {
    // RULE ZERO CHECK:
    // Any report of HSDS OR sudden death with unclotted orifice bleeding enforces absolute biohazard lockout
    const isRuleZeroTriggered =
      syndromeCode === 'HSDS' ||
      (selectedSymptomIds.includes('sudden_death') &&
        selectedSymptomIds.includes('unclotted_dark_blood'));

    if (isRuleZeroTriggered) {
      return {
        isAnthraxLockout: true,
        urgencyLevel: 'CRITICAL_BIOHAZARD',
        idspNotifiable: true,
        primaryDifferential: {
          diseaseName: 'Anthrax (Bacillus anthracis)',
          diseaseNameMarathi: 'काळपुळी (ॲन्थ्रॅक्स)',
          icd11OrOieCode: '1B90 / OIE-1.1.2',
          confidence: 'CONFIRMED_ALERT',
          isBiohazard: true,
          isIdspNotifiable: true,
          recommendedAction:
            'CRITICAL BIOHAZARD PROTOCOL: Post-mortem necropsy strictly prohibited. Take peripheral ear-tip blood smear only. 6ft deep burial with unslaked quicklime.',
          recommendedActionMarathi:
            'कडक जैविक सुरक्षा नियम: शव विच्छेदन (पोस्टमॉर्टम) पूर्णपणे बंदी! केवळ कानाच्या टोकावरून रक्ताचा नमुना घ्या. ६ फूट खोल खड्ड्यात कळीच्या चुन्यासह पुरणे.',
        },
        secondaryDifferentials: [
          {
            diseaseName: 'Acute Lightning Strike',
            diseaseNameMarathi: 'वीज कोसळणे',
            icd11OrOieCode: 'VET-TRAUMA-01',
            confidence: 'SUSPECTED',
            isBiohazard: false,
            isIdspNotifiable: false,
            recommendedAction: 'Inspect for superficial singe marks along limbs.',
            recommendedActionMarathi: 'पायांवर वीजेच्या भाजण्याच्या खुणा तपासा.',
          },
        ],
        clinicalGuidance:
          'RULE ZERO ENFORCED: Bacillus anthracis spores form upon atmospheric exposure. Never incision or open carcass. Notify District Animal Husbandry and IDSP health teams within 1 hour.',
        farmerAdvisory:
          'तातडीक इशारा: मृत जनावराचे शव कापू नका किंवा कातडी काढू नका! हवेत घातक बीजाणू पसरून माणसे व इतर जनावरे दगावू शकतात. कळीच्या चुन्यासह ६ फूट खड्ड्यात पुरा. १९६२ वर संपर्क करा.',
      };
    }

    // Standard 7-Syndrome Differential Evaluation
    switch (syndromeCode) {
      case 'VSS':
        return {
          isAnthraxLockout: false,
          urgencyLevel: 'HIGH_CONTAGION',
          idspNotifiable: false,
          primaryDifferential: {
            diseaseName: 'Foot-and-Mouth Disease (FMD)',
            diseaseNameMarathi: 'लाळ्या खुरकूत (FMD)',
            icd11OrOieCode: 'OIE-1.1.1',
            confidence: selectedSymptomIds.length >= 2 ? 'HIGHLY_PROBABLE' : 'SUSPECTED',
            isBiohazard: false,
            isIdspNotifiable: false,
            recommendedAction:
              'Strict movement quarantine. Potassium permanganate (1:1000) mouth wash, boric acid in glycerin application.',
            recommendedActionMarathi:
              'कळपाचे तत्काळ विलगीकरण. पोटॅशियम परमँगनेटच्या (लाल औषध) पाण्याने तोंड स्वच्छ धुवावे, ग्लिसरीन लावावे.',
          },
          secondaryDifferentials: [
            {
              diseaseName: 'Vesicular Stomatitis',
              diseaseNameMarathi: 'व्हेसिक्युलर स्टोमॅटायटिस',
              icd11OrOieCode: 'OIE-1.1.4',
              confidence: 'SUSPECTED',
              isBiohazard: false,
              isIdspNotifiable: false,
              recommendedAction: 'Collect vesicle epithelium in viral transport medium (VTM).',
              recommendedActionMarathi: 'तोंडातील फोडांचे आवरण व्हीटीएम बाटलीत जमा करा.',
            },
          ],
          clinicalGuidance:
            'Aphthovirus serotypes (O, A, Asia-1) endemic in Maharashtra. Disinfect sheds with 4% sodium carbonate. Milk yields will drop severely.',
          farmerAdvisory:
            'आजारी जनावरांना चरण्यासाठी बाहेर सोडू नका. गोठ्यात चुना शिंपडा आणि चारा-पाणी पूर्णपणे वेगळे ठेवा.',
        };

      case 'NSLS':
        return {
          isAnthraxLockout: false,
          urgencyLevel: 'HIGH_CONTAGION',
          idspNotifiable: false,
          primaryDifferential: {
            diseaseName: 'Lumpy Skin Disease (LSD)',
            diseaseNameMarathi: 'लंपी त्वचा रोग (LSD)',
            icd11OrOieCode: 'OIE-1.4.13',
            confidence: selectedSymptomIds.includes('cutaneous_nodules') ? 'HIGHLY_PROBABLE' : 'SUSPECTED',
            isBiohazard: false,
            isIdspNotifiable: false,
            recommendedAction:
              'Vector control (fly/tick spraying with cypermethrin). Isolate cattle. Goat pox homologous vaccination within 5km ring.',
            recommendedActionMarathi:
              'डास व गोचीड प्रतिबंधक फवारणी करा. बाधित जनावरांचे विलगीकरण करा. ५ किमी परिघात गोट पॉक्स लसीकरण आवश्यक.',
          },
          secondaryDifferentials: [
            {
              diseaseName: 'Pseudo-lumpy skin (Bovine Herpesvirus 2)',
              diseaseNameMarathi: 'स्यूडो-लंपी त्वचा रोग',
              icd11OrOieCode: 'VET-HERP-02',
              confidence: 'SUSPECTED',
              isBiohazard: false,
              isIdspNotifiable: false,
              recommendedAction: 'Check nodule depth: lesions are superficial with depressed centers.',
              recommendedActionMarathi: 'गाठी त्वचेवर वरवरच्या असून मध्यभागी खळगा असतो.',
            },
          ],
          clinicalGuidance:
            'Capripoxvirus vector-borne transmission via biting insects (Stomoxys, Aedes). Skin nodules persist for months.',
          farmerAdvisory:
            'गोठ्यात धूर व गोचीड फवारणी करा. जनावरांच्या अंगावरील गाठींवर कडूनिंब आणि हळदीचा लेप लावा.',
        };

      case 'AROS':
        return {
          isAnthraxLockout: false,
          urgencyLevel: 'HIGH_CONTAGION',
          idspNotifiable: false,
          primaryDifferential: {
            diseaseName: 'Haemorrhagic Septicaemia (HS / Pasteurellosis)',
            diseaseNameMarathi: 'गळसुजी / घटसर्प (HS)',
            icd11OrOieCode: 'OIE-1.1.8',
            confidence: selectedSymptomIds.includes('swollen_throat_brisket') ? 'HIGHLY_PROBABLE' : 'SUSPECTED',
            isBiohazard: false,
            isIdspNotifiable: false,
            recommendedAction:
              'Immediate broad-spectrum antibiotic intervention (Oxytetracycline / Enrofloxacin). Ring vaccination with HS oil adjuvant.',
            recommendedActionMarathi:
              'तातडीने ॲन्टीबायोटिक उपचार सुरू करा. घशाची सूज वाढल्यास ट्रेकिओस्टॉमीची तयारी ठेवा.',
          },
          secondaryDifferentials: [
            {
              diseaseName: 'Peste des Petits Ruminants (PPR)',
              diseaseNameMarathi: 'शेळ्या-मेंढ्यांमधील देवी / पीपीआर',
              icd11OrOieCode: 'OIE-1.1.11',
              confidence: 'SUSPECTED',
              isBiohazard: false,
              isIdspNotifiable: false,
              recommendedAction: 'Evaluate for concurrent mouth erosions and pneumonia in small ruminants.',
              recommendedActionMarathi: 'शेळ्या-मेंढ्यांमध्ये तोंडात फोड व न्यूमोनिया तपासा.',
            },
          ],
          clinicalGuidance:
            'Pasteurella multocida serotype B:2. High mortality within 24 hours of submandibular edema. Rain and stress are triggers.',
          farmerAdvisory:
            'जनावराला पावसाच्या पाण्यात भिजवू नका. घशावर सूज दिसताच घरगुती उपचारात वेळ न घालवता पशुवैद्यांना बोलवा.',
        };

      case 'CMSS':
        return {
          isAnthraxLockout: false,
          urgencyLevel: 'ELEVATED',
          idspNotifiable: false,
          primaryDifferential: {
            diseaseName: 'Black Quarter (BQ)',
            diseaseNameMarathi: 'फऱ्या / एकटांग्या (BQ)',
            icd11OrOieCode: 'OIE-1.1.7',
            confidence: selectedSymptomIds.includes('crepitant_swelling') ? 'HIGHLY_PROBABLE' : 'SUSPECTED',
            isBiohazard: false,
            isIdspNotifiable: false,
            recommendedAction:
              'High-dose Crystalline Penicillin administered intravenously/intramuscularly early in course. Deep carcass burial.',
            recommendedActionMarathi:
              'पेनिसिलिनचे उच्च डोस त्वरित द्यावे. बाधित भागावर दाब दिल्यास चरचर आवाज येतो.',
          },
          secondaryDifferentials: [
            {
              diseaseName: 'Malignant Edema (Clostridium septicum)',
              diseaseNameMarathi: 'मॅलिग्नंट एडीमा',
              icd11OrOieCode: 'VET-CLOST-02',
              confidence: 'SUSPECTED',
              isBiohazard: false,
              isIdspNotifiable: false,
              recommendedAction: 'Differentiate by lack of crepitant gas in early wound contamination.',
              recommendedActionMarathi: 'जखमेतून संसर्ग झाल्यास चरचर आवाज कमी असतो.',
            },
          ],
          clinicalGuidance:
            'Clostridium chauvoei endospores in deep soil. Typically affects 6-24 month calves in prime nutritional condition.',
          farmerAdvisory:
            'तरुण वासरांना चरताना पायावर किंवा खांद्यावर गरम सूज दिसल्यास ताबडतोब उपचार सुरू करा.',
        };

      case 'SARF':
        return {
          isAnthraxLockout: false,
          urgencyLevel: 'ELEVATED',
          idspNotifiable: true,
          primaryDifferential: {
            diseaseName: 'Brucellosis (Brucella abortus)',
            diseaseNameMarathi: 'ब्रुसेलोसिस (संसर्गजन्य गर्भपात)',
            icd11OrOieCode: '1B95 / OIE-1.1.5',
            confidence: selectedSymptomIds.includes('late_term_abortion') ? 'HIGHLY_PROBABLE' : 'SUSPECTED',
            isBiohazard: false,
            isIdspNotifiable: true,
            recommendedAction:
              'Collect serum for Rose Bengal Plate Test (RBPT). Never touch aborted fetus or placenta with bare hands (zoonotic).',
            recommendedActionMarathi:
              'वार किंवा पडलेल्या गर्भाला उघड्या हाताने स्पर्श करू नका (माणसांना ताप येऊ शकतो). आरबीपीटी चाचणीसाठी रक्त नमुना घ्या.',
          },
          secondaryDifferentials: [
            {
              diseaseName: 'Campylobacteriosis',
              diseaseNameMarathi: 'कॅम्पायलोबॅक्टर संसर्ग',
              icd11OrOieCode: 'VET-REPR-03',
              confidence: 'SUSPECTED',
              isBiohazard: false,
              isIdspNotifiable: false,
              recommendedAction: 'Vaginal mucus agglutination testing.',
              recommendedActionMarathi: 'योनीमार्गातील स्त्रावाची प्रयोगशाळेत तपासणी करा.',
            },
          ],
          clinicalGuidance:
            'Zoonotic hazard: Causes Undulant Fever in humans via raw milk or handling aborted fetuses. Enforce gloves and PPE.',
          farmerAdvisory:
            'गर्भपाताची घाण व वार हाताळताना रबरी हातमोजे वापरा. कच्चे दूध पिऊ नका; दूध चांगले उकळूनच प्या.',
        };

      case 'HES':
        return {
          isAnthraxLockout: false,
          urgencyLevel: 'ROUTINE_ENDEMIC',
          idspNotifiable: false,
          primaryDifferential: {
            diseaseName: 'Enterotoxaemia (Clostridium perfringens Type D)',
            diseaseNameMarathi: 'आंत्रविषार (फड़किया)',
            icd11OrOieCode: 'VET-ENTERO-01',
            confidence: selectedSymptomIds.includes('bloody_diarrhea') ? 'HIGHLY_PROBABLE' : 'SUSPECTED',
            isBiohazard: false,
            isIdspNotifiable: false,
            recommendedAction:
              'Fluid therapy with electrolytes. Clostridial antitoxin if available. Reduce grain feeding.',
            recommendedActionMarathi:
              'इलेक्ट्रोलाइट्स व सलाईनचे पाणी द्या. धान्याचा खुराक कमी करून सुका चारा द्या.',
          },
          secondaryDifferentials: [
            {
              diseaseName: 'Bovine Coccidiosis',
              diseaseNameMarathi: 'कॉकसिडिओसिस (हगवण)',
              icd11OrOieCode: 'VET-PROTO-01',
              confidence: 'SUSPECTED',
              isBiohazard: false,
              isIdspNotifiable: false,
              recommendedAction: 'Fecal sample examination for oocysts. Amprolium therapy.',
              recommendedActionMarathi: 'शेण नमुना तपासा व ॲम्प्रोलियम औषध द्या.',
            },
          ],
          clinicalGuidance:
            'Pulpy kidney disease in sheep/goats, hemorrhagic enteritis in calves after sudden change to lush green or grain rations.',
          farmerAdvisory:
            'जनावरांना अचानक जास्तीचा हिरवा चारा किंवा धान्य खाऊ घालू नका. स्वच्छ आणि ताजे पाणी मुबलक द्या.',
        };

      case 'NAS':
        return {
          isAnthraxLockout: false,
          urgencyLevel: 'CRITICAL_BIOHAZARD',
          idspNotifiable: true,
          primaryDifferential: {
            diseaseName: 'Rabies (Lyssavirus)',
            diseaseNameMarathi: 'रेबीज (पिसाळणे)',
            icd11OrOieCode: '1C62 / OIE-1.1.13',
            confidence: selectedSymptomIds.includes('aggressive_behavior') ? 'HIGHLY_PROBABLE' : 'SUSPECTED',
            isBiohazard: true,
            isIdspNotifiable: true,
            recommendedAction:
              'CRITICAL ZOONOSIS: Extreme caution. Secure animal in isolated stall. Do not examine oral cavity with bare hands. Contact human health center immediately.',
            recommendedActionMarathi:
              'अतिसंवेदनशील जैविक धोका: जनावराच्या तोंडाला अजिबात हात लावू नका! बाधित व्यक्तींना तत्काळ सरकारी रुग्णालयात रेबीज लस देण्यास पाठवा.',
          },
          secondaryDifferentials: [
            {
              diseaseName: 'Bovine Encephalopathy / Listeriosis',
              diseaseNameMarathi: 'लिस्टेरियोसिस',
              icd11OrOieCode: 'VET-NEURO-02',
              confidence: 'SUSPECTED',
              isBiohazard: false,
              isIdspNotifiable: false,
              recommendedAction: 'Observe for unilateral facial paralysis or circling.',
              recommendedActionMarathi: 'चेहऱ्याचा एका बाजूचा पक्षाघात किंवा गोल फिरणे तपासा.',
            },
          ],
          clinicalGuidance:
            '100% fatal zoonotic encephalomyelitis. Cattle exhibit abnormal bellowing, choking-like salivation, and furious biting of wooden fences.',
          farmerAdvisory:
            'जनावराच्या लाळेचा मानवी त्वचेशी किंवा डोळ्यांशी संपर्क येऊ देऊ नका. प्राण्याला इतर सर्व जनावरांपासून दूर मजबूत जागेत बांधा.',
        };
    }
  }
}

export const decisionTreeService = new DecisionTreeService();

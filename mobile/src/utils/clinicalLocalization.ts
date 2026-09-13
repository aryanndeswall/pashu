import { SupportedLanguage } from '../store/languageStore';
import { ClinicalCase } from '../services/caseService';

/**
 * Normalizes and translates syndrome codes and disease names
 */
export function localizeSyndromeName(
  code: string = '',
  name: string = '',
  lang: SupportedLanguage = 'mr'
): string {
  const upperCode = (code || '').toUpperCase().trim();
  const lowerName = (name || '').toLowerCase();

  // 1. English translations
  if (lang === 'en') {
    if (upperCode === 'VSS' || lowerName.includes('fmd') || lowerName.includes('लाळ्या') || lowerName.includes('खुरकूत') || lowerName.includes('खऱ्या')) {
      return 'Foot-and-Mouth Disease (FMD)';
    }
    if (upperCode === 'BRDS' || lowerName.includes('respiratory') || lowerName.includes('श्वसन')) {
      return 'Bovine Respiratory Disease (BRDS)';
    }
    if (upperCode === 'HSDS' || lowerName.includes('hemorrhagic') || lowerName.includes('घटसर्प') || lowerName.includes('गलघोंटू')) {
      return 'Hemorrhagic Septicemia (HS)';
    }
    if (upperCode === 'NSLS' || lowerName.includes('lumpy') || lowerName.includes('लम्पी') || lowerName.includes('गाठी')) {
      return 'Lumpy Skin Disease (LSD)';
    }
    if (upperCode === 'BQ' || lowerName.includes('black') || lowerName.includes('फऱ्या') || lowerName.includes('लंगड़ा')) {
      return 'Black Quarter (BQ)';
    }
    if (upperCode === 'MAST' || lowerName.includes('mastitis') || lowerName.includes('स्तनदाह') || lowerName.includes('थनैला')) {
      return 'Bovine Mastitis';
    }
    if (upperCode === 'ANTH' || lowerName.includes('anthrax') || lowerName.includes('अँथ्रॅक्स') || lowerName.includes('एंथ्रेक्स')) {
      return 'Anthrax (Acute)';
    }
    if (upperCode === 'PPR' || lowerName.includes('peste') || lowerName.includes('पीपीआर')) {
      return 'Peste des Petits Ruminants (PPR)';
    }
    if (upperCode === 'ET' || lowerName.includes('enterotoxemia') || lowerName.includes('आंत्रविषार')) {
      return 'Enterotoxemia (ET)';
    }
    if (upperCode === 'CSF' || lowerName.includes('swine') || lowerName.includes('स्वाइन')) {
      return 'Classical Swine Fever (CSF)';
    }

    // Strip any residual Marathi/Devanagari characters and parentheses if present
    const cleaned = name.replace(/[\u0900-\u097F]/g, '').replace(/[()\/]/g, ' ').replace(/\s+/g, ' ').trim();
    return cleaned || code || 'Clinical Syndrome';
  }

  // 2. Hindi translations
  if (lang === 'hi') {
    if (upperCode === 'VSS' || lowerName.includes('fmd') || lowerName.includes('लाळ्या') || lowerName.includes('खुरकूत') || lowerName.includes('खऱ्या')) {
      return 'खुरपका-मुंहपका (FMD)';
    }
    if (upperCode === 'BRDS' || lowerName.includes('respiratory') || lowerName.includes('श्वसन')) {
      return 'श्वसन रोग (BRDS)';
    }
    if (upperCode === 'HSDS' || lowerName.includes('hemorrhagic') || lowerName.includes('घटसर्प') || lowerName.includes('गलघोंटू')) {
      return 'गलघोंटू (HS)';
    }
    if (upperCode === 'NSLS' || lowerName.includes('lumpy') || lowerName.includes('लम्पी') || lowerName.includes('गाठी')) {
      return 'लम्पी त्वचा रोग (LSD)';
    }
    if (upperCode === 'BQ' || lowerName.includes('black') || lowerName.includes('फऱ्या') || lowerName.includes('लंगड़ा')) {
      return 'लंगड़ा बुखार (BQ)';
    }
    if (upperCode === 'MAST' || lowerName.includes('mastitis') || lowerName.includes('स्तनदाह') || lowerName.includes('थनैला')) {
      return 'थनैला रोग (Mastitis)';
    }
    if (upperCode === 'ANTH' || lowerName.includes('anthrax') || lowerName.includes('अँथ्रॅक्स') || lowerName.includes('एंथ्रेक्स')) {
      return 'एंथ्रेक्स (Anthrax)';
    }
    return name;
  }

  // 3. Marathi (default)
  if (upperCode === 'VSS' || lowerName.includes('fmd')) {
    return 'लाळ्या खुरकूत (FMD)';
  }
  if (upperCode === 'BRDS' || lowerName.includes('respiratory')) {
    return 'श्वसन रोग (BRDS)';
  }
  if (upperCode === 'HSDS' || lowerName.includes('hemorrhagic')) {
    return 'घटसर्प (Hemorrhagic Septicemia)';
  }
  if (upperCode === 'NSLS' || lowerName.includes('lumpy')) {
    return 'लम्पी त्वचा रोग (LSD)';
  }
  if (upperCode === 'BQ' || lowerName.includes('black')) {
    return 'फऱ्या (Black Quarter)';
  }
  return name;
}

/**
 * Localizes animal species and breed display strings
 */
export function localizeSpecies(speciesStr: string = '', lang: SupportedLanguage = 'mr'): string {
  const lower = speciesStr.toLowerCase();

  if (lang === 'en') {
    if (lower.includes('gir')) return 'Cow (Gir)';
    if (lower.includes('cow') || lower.includes('गाय') || lower.includes('गोवंश')) return 'Cow';
    if (lower.includes('murrah')) return 'Buffalo (Murrah)';
    if (lower.includes('buffalo') || lower.includes('म्हैस') || lower.includes('भैंस')) return 'Buffalo';
    if (lower.includes('osmanabadi')) return 'Goat (Osmanabadi)';
    if (lower.includes('goat') || lower.includes('शेळी') || lower.includes('बकरी')) return 'Goat';
    if (lower.includes('sheep') || lower.includes('मेंढी') || lower.includes('भेड़')) return 'Sheep';
    
    // Clean out Devanagari script for English mode
    const cleaned = speciesStr.replace(/[\u0900-\u097F]/g, '').replace(/[()\/]/g, ' ').replace(/\s+/g, ' ').trim();
    return cleaned || 'Cattle';
  }

  if (lang === 'hi') {
    if (lower.includes('gir') || lower.includes('गीर')) return 'गाय (गीर)';
    if (lower.includes('cow') || lower.includes('गाय')) return 'गाय';
    if (lower.includes('murrah') || lower.includes('मुऱ्हा')) return 'भैंस (मुर्रा)';
    if (lower.includes('buffalo') || lower.includes('म्हैस') || lower.includes('भैंस')) return 'भैंस';
    if (lower.includes('goat') || lower.includes('शेळी') || lower.includes('बकरी')) return 'बकरी';
    if (lower.includes('sheep') || lower.includes('मेंढी') || lower.includes('भेड़')) return 'भेड़';
    return speciesStr;
  }

  // Marathi default
  return speciesStr;
}

/**
 * Localizes case clinical workflow statuses
 */
export function localizeCaseStatus(
  status: ClinicalCase['status'],
  lang: SupportedLanguage = 'mr'
): string {
  switch (status) {
    case 'VISIT_SCHEDULED':
      return lang === 'en' ? '● Visit Scheduled' : lang === 'hi' ? '● भेंट निर्धारित' : '● भेट नियोजित';
    case 'RESOLVED':
      return lang === 'en' ? '● Treatment Completed' : lang === 'hi' ? '● उपचार पूर्ण' : '● उपचार पूर्ण';
    case 'IN_CONSULTATION':
      return lang === 'en' ? '● Tele-Consult Active' : lang === 'hi' ? '● परामर्श जारी' : '● सल्ला सुरू';
    case 'AWAITING_DOCTOR':
    default:
      return lang === 'en' ? '● Doctor Sync Active' : lang === 'hi' ? '● डॉक्टर समन्वय जारी' : '● डॉक्टर समन्वय चालू';
  }
}

/**
 * Localizes interim emergency first-aid advice instructions
 */
export function localizeInterimAdvice(
  advice: string | undefined,
  lang: SupportedLanguage = 'mr',
  syndromeCode: string = ''
): string {
  const code = (syndromeCode || '').toUpperCase();
  const text = advice || '';

  if (lang === 'en') {
    // FMD or oral/hoof sores
    if (code === 'VSS' || text.includes('विलगीकरणात') || text.includes('पोटॅशियम') || text.includes('तोंडा')) {
      return (
        '1. Isolate the affected animal at least 15 meters away from healthy livestock.\n' +
        '2. Gently wash mouth and hoof lesions with mild pink potassium permanganate solution.\n' +
        '3. Avoid feeding coarse dry fodder; provide soft warm rice gruel or porridge.'
      );
    }
    // HS / swollen neck / respiratory
    if (code === 'HSDS' || text.includes('सावलीच्या') || text.includes('पट्ट्या') || text.includes('गळ्यावर')) {
      return (
        '1. Place the animal in a well-ventilated, shaded and quiet shelter.\n' +
        '2. Apply cold water compresses gently over the swollen neck area.\n' +
        '3. Avoid exertion and await rapid veterinary field team arrival.'
      );
    }
    // Lumpy Skin Disease
    if (code === 'NSLS' || text.includes('सावलीत व कोरड्या')) {
      return (
        '1. Tether the animal in a shaded, dry pen with mosquito & fly nets.\n' +
        '2. Provide ample clean drinking water supplemented with mineral salts.\n' +
        '3. Rest the animal and await assigned veterinary medical officer.'
      );
    }
    // If text already in English and doesn't contain Devanagari
    if (text && !/[\u0900-\u097F]/.test(text)) {
      return text;
    }
    // Fallback general advice in English
    return (
      '1. Isolate the affected animal from healthy livestock immediately.\n' +
      '2. Provide plenty of fresh, clean drinking water.\n' +
      '3. Keep the animal rested until the veterinary medical team arrives.'
    );
  }

  if (lang === 'hi') {
    if (code === 'VSS' || text.includes('विलगीकरणात') || text.includes('पोटॅशियम') || text.includes('तोंडा')) {
      return (
        '1. संक्रमित पशु को अन्य पशुओं से कम से कम 15 मीटर दूर अलग रखें।\n' +
        '2. मुंह व खुरों के छालों को हल्के गुलाबी पोटेशियम परमैंगनेट पानी से धोएं।\n' +
        '3. सूखा चारा न दें; मुलायम चावल की मांड या दलिया खिलाएं।'
      );
    }
    if (code === 'HSDS' || text.includes('सावलीच्या') || text.includes('पट्ट्या') || text.includes('गळ्यावर')) {
      return (
        '1. पशु को ठंडी व छायादार जगह पर आराम से रखें।\n' +
        '2. गले की सूजन पर ठंडे पानी की पट्टियां रखें।\n' +
        '3. दवा और उपचार के लिए पशु चिकित्सक के आने की प्रतीक्षा करें।'
      );
    }
    if (text && !/[\u0900-\u097F]/.test(text)) {
      return text;
    }
    return (
      '1. संक्रमित पशु को अन्य स्वस्थ पशुओं से अलग रखें।\n' +
      '2. भरपूर ताजा और स्वच्छ पानी उपलब्ध कराएं।\n' +
      '3. पशु चिकित्सा दल के आने तक पशु को विश्राम दें।'
    );
  }

  // Marathi default
  return text || (
    '1. बाधित जनावरास इतर निरोगी जनावरांपासून वेगळे ठेवा.\n' +
    '2. ताजे व स्वच्छ पाणी मुबलक प्रमाणात द्या.\n' +
    '3. डॉक्टरांचे पथक येईपर्यंत जनावरास विश्रांती द्या.'
  );
}

/**
 * Localizes field visit schedule time / ETA strings
 */
export function localizeVisitEta(eta: string = '', lang: SupportedLanguage = 'mr'): string {
  if (!eta) return '';

  if (lang === 'en') {
    if (eta.toLowerCase().includes('today') || eta.includes('PM') || eta.includes('AM')) {
      // Extract English inside parenthesis or clean English text
      const parenMatch = eta.match(/\(([^)]+)\)/);
      if (parenMatch && parenMatch[1]) {
        return parenMatch[1].replace(/[\u0900-\u097F]/g, '').trim();
      }
      return eta.replace(/[\u0900-\u097F]/g, '').replace(/[()]/g, '').trim();
    }
    if (eta.includes('२:३०') || eta.includes('2:30')) return 'Today at 2:30 PM';
    if (eta.includes('४:३०') || eta.includes('4:30')) return 'Today at 4:30 PM';
    if (eta.includes('मार्गस्थ') || eta.includes('Urgent')) return 'Doctor Dispatched (Urgent)';
    
    // Remove Devanagari
    const cleaned = eta.replace(/[\u0900-\u097F]/g, '').replace(/[()]/g, '').trim();
    return cleaned || 'Scheduled Today';
  }

  if (lang === 'hi') {
    if (eta.includes('२:३०') || eta.includes('2:30')) return 'आज दोपहर २:३० बजे';
    if (eta.includes('४:३०') || eta.includes('4:30')) return 'आज शाम ४:३० बजे';
    if (eta.includes('मार्गस्थ') || eta.includes('Urgent')) return 'चिकित्सक मार्गस्थ (तत्काल)';
    return eta;
  }

  return eta;
}

/**
 * Localizes doctor prescriptions
 */
export function localizePrescription(prescription: string = '', lang: SupportedLanguage = 'mr'): string {
  if (!prescription) return '';

  if (lang === 'en') {
    if (prescription.includes('Meloxicam') && (prescription.includes('पोटॅशियम') || prescription.includes('लापशी'))) {
      return (
        '1. Inj. Meloxicam 10ml I/M\n' +
        '2. Potassium Permanganate mouth wash (twice daily)\n' +
        '3. Soft warm porridge and rice gruel diet'
      );
    }
    // If contains Devanagari numerals, convert to standard numerals
    let englishRx = prescription
      .replace(/१\./g, '1.')
      .replace(/२\./g, '2.')
      .replace(/३\./g, '3.')
      .replace(/४\./g, '4.');

    if (englishRx.includes('पोटॅशियम परमँगनेट')) {
      englishRx = englishRx.replace(/पोटॅशियम परमँगनेट माऊथ वॉश \(दिवसातून २ वेळा\)/g, 'Potassium Permanganate mouth wash (BID)');
    }
    if (englishRx.includes('मऊ लापशी व भाताची पेज')) {
      englishRx = englishRx.replace(/मऊ लापशी व भाताची पेज/g, 'Soft rice gruel and porridge feed');
    }
    return englishRx;
  }

  return prescription;
}

/**
 * Localizes doctor notes
 */
export function localizeDoctorNotes(notes: string = '', lang: SupportedLanguage = 'mr'): string {
  if (!notes) return '';

  if (lang === 'en') {
    if (notes.includes('रिंग व्हॅक्सिनेशन')) {
      return 'Clinical examination scheduled. Rapid ring vaccination team deployed to Ashwi Budruk cluster.';
    }
    if (notes.includes('लाळ्या खुरकूतची')) {
      return 'Animal exhibits classic FMD lesions. Ring vaccination required post-initial triage.';
    }
    // Clean out Devanagari if present
    if (!/[\u0900-\u097F]/.test(notes)) {
      return notes;
    }
    return notes.replace(/[\u0900-\u097F]/g, '').trim() || 'Clinical triage in progress.';
  }

  return notes;
}

/**
 * Localizes suspected disease diagnosis across English, Hindi, and Marathi
 */
export function localizeTriageDisease(
  triage: {
    syndrome_code?: string;
    syndrome_name_en?: string;
    syndrome_name_hindi?: string;
    syndrome_name_marathi?: string;
    suspected_disease?: string;
    suspected_disease_en?: string;
    suspected_disease_hi?: string;
  } | null | undefined,
  lang: SupportedLanguage = 'mr'
): string {
  if (!triage) return '';

  if (lang === 'en') {
    if (triage.suspected_disease_en) return triage.suspected_disease_en;
    if (triage.syndrome_name_en) return triage.syndrome_name_en;
    if (triage.suspected_disease) {
      const parenMatch = triage.suspected_disease.match(/\(([^)]+)\)/);
      if (parenMatch && /[a-zA-Z]/.test(parenMatch[1])) {
        return parenMatch[1].trim();
      }
      return localizeSyndromeName(triage.syndrome_code, triage.suspected_disease, 'en');
    }
    return localizeSyndromeName(triage.syndrome_code, '', 'en');
  }

  if (lang === 'hi') {
    if (triage.suspected_disease_hi) return triage.suspected_disease_hi;
    if (triage.syndrome_name_hindi) return triage.syndrome_name_hindi;
    return localizeSyndromeName(triage.syndrome_code, triage.suspected_disease || '', 'hi');
  }

  // Marathi default
  return (
    triage.suspected_disease ||
    triage.syndrome_name_marathi ||
    localizeSyndromeName(triage.syndrome_code, '', 'mr')
  );
}

/**
 * Localizes immediate emergency advisory text across English, Hindi, and Marathi
 */
export function localizeTriageAdvisory(
  triage: {
    syndrome_code?: string;
    immediate_advisory_marathi?: string;
    immediate_advisory_hindi?: string;
    immediate_advisory_en?: string;
  } | null | undefined,
  lang: SupportedLanguage = 'mr'
): string {
  if (!triage) return '';

  if (lang === 'en') {
    if (triage.immediate_advisory_en && !/[\u0900-\u097F]/.test(triage.immediate_advisory_en)) {
      return triage.immediate_advisory_en;
    }
    return localizeInterimAdvice(triage.immediate_advisory_marathi, 'en', triage.syndrome_code);
  }

  if (lang === 'hi') {
    if (triage.immediate_advisory_hindi) {
      return triage.immediate_advisory_hindi;
    }
    return localizeInterimAdvice(triage.immediate_advisory_marathi, 'hi', triage.syndrome_code);
  }

  // Marathi default
  return (
    triage.immediate_advisory_marathi ||
    localizeInterimAdvice('', 'mr', triage.syndrome_code)
  );
}

/**
 * Localizes recommended biosecurity containment checklist items
 */
export function localizeContainmentActions(
  actions: string[] = [],
  lang: SupportedLanguage = 'mr',
  _syndromeCode: string = '',
  actionsEn?: string[]
): string[] {
  if (!actions || actions.length === 0) return [];

  if (lang === 'en') {
    if (actionsEn && actionsEn.length > 0) {
      return actionsEn;
    }
    return actions.map((act) => {
      const lower = act.toLowerCase();
      if (act.includes('विलगीकरण') || lower.includes('isolate') || lower.includes('isolation')) {
        return 'Isolate affected livestock immediately (15m buffer)';
      }
      if (act.includes('पोटॅशियम') || lower.includes('permanganate') || act.includes('निर्जंतुकीकरण')) {
        return 'Disinfect shed and lesions with mild antiseptic wash';
      }
      if (act.includes('पाचारण') || act.includes('बोलवा') || act.includes('उपचार') || lower.includes('veterinary')) {
        return 'Dispatch emergency call to local field veterinarian';
      }
      if (act.includes('दूध') || act.includes('विक्री') || act.includes('वाहतूक') || lower.includes('freeze')) {
        return 'Halt milk sale and animal transit from the farm';
      }
      if (act.includes('लसीकरण') || lower.includes('vaccination')) {
        return 'Initiate ring vaccination protocol for perimeter herd';
      }
      if (act.includes('कीटक') || act.includes('धूर') || lower.includes('vector')) {
        return 'Enforce vector control and fly repellents around shed';
      }
      if (act.includes('भांडी वेगळी') || lower.includes('trough')) {
        return 'Separate feed and water troughs from healthy animals';
      }
      if (act.includes('शवविच्छेदन') || lower.includes('carcass')) {
        return 'Strictly prohibit opening or skinning of carcass';
      }
      if (!/[\u0900-\u097F]/.test(act)) {
        return act;
      }
      const cleaned = act.replace(/[\u0900-\u097F]/g, '').replace(/[()\/]/g, ' ').replace(/\s+/g, ' ').trim();
      return cleaned || 'Implement biosecurity quarantine measures';
    });
  }

  if (lang === 'hi') {
    return actions.map((act) => {
      if (act.includes('विलगीकरण')) {
        return 'संक्रमित पशु को तुरंत अन्य पशुओं से अलग रखें (विलगीकरण)';
      }
      if (act.includes('पोटॅशियम') || act.includes('निर्जंतुकीकरण')) {
        return 'पोटैशियम परमैंगनेट घोल से मुंह और पैरों की सफाई करें';
      }
      if (act.includes('पाचारण') || act.includes('बोलवा') || act.includes('उपचार')) {
        return 'स्थानीय पशु चिकित्सक को तत्काल उपचार हेतु बुलाएं';
      }
      if (act.includes('दूध') || act.includes('विक्री') || act.includes('वाहतूक')) {
        return 'दूध और पशुओं की बिक्री व आवागमन तुरंत रोकें';
      }
      if (act.includes('लसीकरण')) {
        return 'परिसर के स्वस्थ पशुओं का रिंग टीकाकरण कराएं';
      }
      if (act.includes('कीटक') || act.includes('धूर')) {
        return 'बाड़े में नीम का धुआं करें और मक्खी-मच्छरों से बचाव करें';
      }
      if (act.includes('भांडी वेगळी')) {
        return 'चारा और पानी के बर्तन तुरंत अलग करें';
      }
      if (act.includes('शवविच्छेदन')) {
        return 'शव का पोस्टमार्टम कतई न करें';
      }
      return act;
    });
  }

  return actions;
}

// ponytail: ClinicalCase client service for Doctor-Farmer cross-connection & offline SQLite sync
import { dbService } from '../database/sqliteConnection';
import { getCasesEndpoint, getCaseConsultEndpoint } from '../config/api';

export interface ClinicalCase {
  id: string;
  report_id?: string;
  farmer_id: string;
  farmer_name: string;
  farmer_phone_masked: string;
  doctor_id?: string;
  doctor_name?: string;
  doctor_phone_masked?: string;
  animal_tag: string;
  species: string;
  breed?: string;
  syndrome_code: string;
  syndrome_name: string;
  symptoms?: string;
  ai_differential?: string;
  urgency: 'NORMAL' | 'HIGH' | 'CRITICAL';
  status: 'AWAITING_DOCTOR' | 'IN_CONSULTATION' | 'VISIT_SCHEDULED' | 'RESOLVED';
  interim_advice?: string;
  doctor_notes?: string;
  prescription?: string;
  visit_eta?: string;
  state_name?: string;
  village_name: string;
  block_name: string;
  district_name: string;
  latitude: number;
  longitude: number;
  // Multimodal AI Report Fields
  photo_url?: string | null;
  audio_url?: string | null;
  audio_transcript?: string | null;
  clinical_confidence?: number | null;
  clinical_rationale?: string | null;
  identified_symptoms?: string[] | string | null;
  containment_actions?: string[] | string | null;
  biohazard_alert?: string | null;
  model_used?: string | null;
  ai_report_json?: string | null;
  created_at: string;
  updated_at: string;
}

export const SEEDED_DOCTOR_CASES: ClinicalCase[] = [
  {
    id: 'CASE-2026-FMD01',
    report_id: 'REP-172614001',
    farmer_id: 'usr_farmer_ramesh',
    farmer_name: 'रमेश सखाराम पाटील (Ramesh Patil)',
    farmer_phone_masked: '+91 9822X-XX412',
    doctor_id: 'doc_rahul_01',
    doctor_name: 'Dr. Rahul Sharma',
    doctor_phone_masked: '+91 9422X-XX842',
    animal_tag: '100294819201',
    species: 'गाय (Cow)',
    breed: 'गिर (Gir)',
    syndrome_code: 'VSS',
    syndrome_name: 'लाळ्या खुरकूत (Foot & Mouth Disease - FMD)',
    symptoms: 'तोंडात पांढरे फोड, अतिप्रमाणात लाळ गळणे, खुरांमध्ये खोल जखमा, पाय लंगडणे',
    ai_differential: 'लाळ्या खुरकूत (Foot & Mouth Disease - Aphthovirus)',
    clinical_confidence: 0.94,
    biohazard_alert: 'WARNING',
    clinical_rationale: 'Multimodal lesion photography clearly visualizes unruptured buccal mucosal vesicles and interdigital hoof cleft ulceration. Vernacular audio note indicates hyperthermia (104°F) and acute milk cessation over 36 hours. 94% diagnostic match with Aphthovirus.',
    identified_symptoms: [
      'तोंडात फोड (Oral Vesicles)',
      'लाळ गळणे (Hypersalivation)',
      'खुरांत व्रण (Interdigital Ulcers)',
      'लंगडणे (Lameness)',
      'ताप (Pyrexia)',
    ],
    audio_transcript: 'डॉक्टर साहेब, गाईच्या तोंडात मोठे फोड आले आहेत आणि भरपूर लाळ गळत आहे. मागच्या दोन दिवसांपासून गाईने चारा खाणे बंद केले आहे आणि चालताना लंगडत आहे.',
    containment_actions: [
      '15-meter quarantine from unaffected cattle herd',
      'Wash oral and hoof lesions with 1:1000 potassium permanganate solution twice daily',
      'Immediate suspension of raw unpasteurized milk transport',
      'Mobilize rapid 5 km taluka ring vaccination buffer',
    ],
    model_used: 'Gemini 3.7 Flash',
    photo_url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=800&q=80',
    urgency: 'HIGH',
    status: 'AWAITING_DOCTOR',
    interim_advice: '1. बाधित गाईला इतर जनावरांपासून किमान १५ मीटर दूर विलगीकरणात ठेवा.\n2. तोंड व खुरांचे व्रण पोटॅशियम परमँगनेटच्या हलक्या गुलाबी पाण्याने धुवा.\n3. मऊ लापशी किंवा भाताची पेज खाऊ घाला.',
    doctor_notes: '',
    prescription: '1. Inj. Meloxicam 10ml I/M\n2. Potassium Permanganate 1:1000 mouth & foot wash (BD)\n3. Soft warm porridge & mineral mixture supplement',
    visit_eta: 'Today at 2:30 PM',
    village_name: 'Ashwi Budruk',
    block_name: 'Rahuri',
    district_name: 'Ahmednagar',
    latitude: 19.3912,
    longitude: 74.6521,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'CASE-2026-ANTH02',
    report_id: 'REP-172614002',
    farmer_id: 'usr_farmer_balasaheb',
    farmer_name: 'बाळासाहेब विठ्ठल गाडे (Balasaheb Gade)',
    farmer_phone_masked: '+91 9423X-XX109',
    doctor_id: 'doc_rahul_01',
    doctor_name: 'Dr. Rahul Sharma',
    doctor_phone_masked: '+91 9422X-XX842',
    animal_tag: '100847291044',
    species: 'म्हैस (Buffalo)',
    breed: 'मुऱ्हा (Murrah)',
    syndrome_code: 'SARF',
    syndrome_name: 'काळपुळी (Anthrax - Bacillus anthracis)',
    symptoms: 'अचानक मृत्यू, नाक व गुदद्वारातून काळे न गोठणारे रक्त, पोट फुगणे',
    ai_differential: 'काळपुळी / ॲन्थ्रॅक्स (Anthrax - Bacillus anthracis)',
    clinical_confidence: 0.99,
    biohazard_alert: 'CRITICAL_ANTHRAX_LOCK',
    clinical_rationale: 'CRITICAL RULE ZERO ACTIVATION: Verified sudden peracute mortality with continuous non-clotting dark pitch-like blood oozing from oral, nasal, and rectal orifices without rigor mortis. High zoonotic hazard.',
    identified_symptoms: [
      'अचानक मृत्यू (Sudden Peracute Death)',
      'नैसर्गिक छिद्रांतून रक्तस्त्राव (Orifice Bleeding)',
      'अगोठलेले काळे रक्त (Unclotted Tarry Blood)',
      'पोट फुगणे (Tympanites)',
    ],
    audio_transcript: 'सकाळी चरताना म्हैस अचानक खाली पडली आणि जागीच दगावली. नाकातून आणि गुदद्वारातून काळे रक्त वाहत आहे. कृपया लवकर या.',
    containment_actions: [
      'DO NOT CUT OR OPEN CARCASS (Strict Post-Mortem Prohibition)',
      'Enforce complete 1 km biohazard movement freeze zone',
      'Safe deep carcass burial in 6-foot pit saturated with quicklime',
      'Administer emergency Anthrax Spore Ring Vaccine within 5 km radius',
    ],
    model_used: 'Gemini 3.7 Flash (Rule Zero Safety Engine)',
    photo_url: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80',
    urgency: 'CRITICAL',
    status: 'AWAITING_DOCTOR',
    interim_advice: 'धोका! मृत जनावराचे शव कापू नका (DO NOT OPEN CARCASS). मानवाला संसर्ग होण्याचा तीव्र धोका आहे. शव ६ फूट खोल चुन्याच्या थरात गाडा.',
    doctor_notes: 'Automated 1 km containment perimeter activated. Sample collected via ear tip blood smear only without incision.',
    prescription: 'STRICT BIOHAZARD PROTOCOL: Crystalline Penicillin G 20,000 IU/kg for in-contact cattle herd. Quarantined.',
    visit_eta: 'Immediate (En Route)',
    village_name: 'Babhaleshwar',
    block_name: 'Rahata',
    district_name: 'Ahmednagar',
    latitude: 19.5512,
    longitude: 74.4521,
    created_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  },
  {
    id: 'CASE-2026-LSD03',
    report_id: 'REP-172614003',
    farmer_id: 'usr_farmer_sunita',
    farmer_name: 'सुनिता ज्ञानेश्वर शिंदे (Sunita Shinde)',
    farmer_phone_masked: '+91 9765X-XX318',
    doctor_id: 'doc_rahul_01',
    doctor_name: 'Dr. Rahul Sharma',
    doctor_phone_masked: '+91 9422X-XX842',
    animal_tag: '100918274612',
    species: 'बैल (Bullock)',
    breed: 'खिल्लार (Khillari)',
    syndrome_code: 'NSLS',
    syndrome_name: 'लंपी त्वचा रोग (LSD - Capripoxvirus)',
    symptoms: 'त्वचेवर २ ते ५ सेमी आकाराच्या कडक गाठी, डोळ्यातून पाणी, ताप, अशक्तपणा',
    ai_differential: 'लंपी त्वचा रोग (Lumpy Skin Disease - Capripoxvirus)',
    clinical_confidence: 0.91,
    biohazard_alert: 'WARNING',
    clinical_rationale: 'Photographic inspection shows characteristic circumscribed, firm round cutaneous nodules (20-40mm) distributed over the neck, brisket, and flank regions with enlarged prescapular lymph nodes.',
    identified_symptoms: [
      'त्वचेवर गाठी (Cutaneous Nodules)',
      'लसिकाग्रंथी सूज (Lymphadenopathy)',
      'ताप (Fever)',
      'डोळ्यातून स्त्राव (Lacrimation)',
    ],
    audio_transcript: 'बैलाच्या मानेवर आणि पाठीवर लहान लहान खडे आल्यासारख्या कडक गाठी झाल्या आहेत. डोळ्यातून पाणी येत आहे आणि अंग खूप गरम आहे.',
    containment_actions: [
      'Separate bullock from herd; apply neem oil smoke repellent against biting flies',
      'Daily antiseptic dressing of superficial necrotic nodular scabs',
      'Restrict livestock movement within 5 km taluka sector',
    ],
    model_used: 'Gemini 3.7 Flash',
    photo_url: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=800&q=80',
    urgency: 'HIGH',
    status: 'VISIT_SCHEDULED',
    interim_advice: '1. जनावरास डास व माश्यांपासून वाचवण्यासाठी कडुनिंबाच्या पानांचा धूर करा.\n2. अंगावरील गाठींवर निंबोळी तेल लावा.\n3. भरपूर ताजे पाणी व मऊ चारा द्या.',
    doctor_notes: 'Prescapular lymphadenopathy present. Secondary bacterial infection prophylaxis administered.',
    prescription: '1. Inj. Enrofloxacin 10% 15ml I/M (3 days)\n2. Inj. Meloxicam with Paracetamol 15ml I/M\n3. Topical Neem Oil + Turmeric paste over nodules',
    visit_eta: 'Tomorrow at 10:00 AM',
    village_name: 'Sangamner Khurd',
    block_name: 'Sangamner',
    district_name: 'Ahmednagar',
    latitude: 19.5712,
    longitude: 74.2121,
    created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
  },
];

class CaseService {
  private maskPhone(phone: string): string {
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 10) return '+91 98XXX-XXXXX';
    const last10 = clean.slice(-10);
    return `+91 ${last10.slice(0, 4)}X-XX${last10.slice(-3)}`;
  }

  private normalizeList(val: any): string | null {
    if (!val) return null;
    if (Array.isArray(val)) return JSON.stringify(val);
    return String(val);
  }

  /**
   * Creates a new clinical case from triage and syncs to both local SQLite and Cloud API
   */
  async createCase(
    caseData: Partial<ClinicalCase>,
    farmerRawPhone: string
  ): Promise<ClinicalCase> {
    const caseId = caseData.id || `CASE-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const now = new Date().toISOString();
    const maskedPhone = this.maskPhone(farmerRawPhone);

    const fullCase: ClinicalCase = {
      id: caseId,
      report_id: caseData.report_id || `REP-${Date.now()}`,
      farmer_id: caseData.farmer_id || 'usr_farmer_local',
      farmer_name: caseData.farmer_name || 'शेतकरी (स्थानिक)',
      farmer_phone_masked: caseData.farmer_phone_masked || maskedPhone,
      doctor_id: caseData.doctor_id || undefined,
      doctor_name: caseData.doctor_name || 'Assigned Veterinarian',
      doctor_phone_masked: caseData.doctor_phone_masked || '+91 9422X-XX842',
      animal_tag: caseData.animal_tag || '100000000001',
      species: caseData.species || 'गाय (Cow)',
      breed: caseData.breed || 'गिर (Gir)',
      syndrome_code: caseData.syndrome_code || 'VSS',
      syndrome_name: caseData.syndrome_name || 'लाळ्या खुरकूत (FMD)',
      symptoms: caseData.symptoms || 'तोंडातून लाळ गळणे, खुरांमध्ये व्रण, ताप',
      ai_differential: caseData.ai_differential || 'Vesicular Stomatitis / Foot-and-Mouth Disease',
      urgency: caseData.urgency || 'HIGH',
      status: caseData.status || 'AWAITING_DOCTOR',
      interim_advice: caseData.interim_advice || (
        '1. बाधित गाईला इतर जनावरांपासून किमान १५ मीटर दूर विलगीकरणात ठेवा.\n' +
        '2. तोंड व खुरांचे व्रण पोटॅशियम परमँगनेटच्या हलक्या गुलाबी पाण्याने धुवा.\n' +
        '3. कोरडा चारा देऊ नका; मऊ भाताची पेज किंवा लापशी खाऊ घाला.'
      ),
      doctor_notes: caseData.doctor_notes || '',
      prescription: caseData.prescription || '',
      visit_eta: caseData.visit_eta || '',
      state_name: caseData.state_name || '',
      village_name: caseData.village_name || 'Village',
      block_name: caseData.block_name || 'Block',
      district_name: caseData.district_name || 'District',
      latitude: caseData.latitude || 19.3912,
      longitude: caseData.longitude || 74.6521,
      photo_url: caseData.photo_url || null,
      audio_url: caseData.audio_url || null,
      audio_transcript: caseData.audio_transcript || null,
      clinical_confidence: caseData.clinical_confidence ?? 0.92,
      clinical_rationale: caseData.clinical_rationale || null,
      identified_symptoms: caseData.identified_symptoms || null,
      containment_actions: caseData.containment_actions || null,
      biohazard_alert: caseData.biohazard_alert || 'WARNING',
      model_used: caseData.model_used || 'Gemini 3.7 Flash',
      ai_report_json: caseData.ai_report_json || null,
      created_at: now,
      updated_at: now,
    };

    // 1. Save to local SQLite
    await dbService.execute(
      `INSERT OR REPLACE INTO clinical_cases (
        id, report_id, farmer_id, farmer_name, farmer_phone_masked,
        doctor_id, doctor_name, doctor_phone_masked, animal_tag, species,
        breed, syndrome_code, syndrome_name, symptoms, ai_differential,
        urgency, status, interim_advice, doctor_notes, prescription,
        visit_eta, village_name, block_name, district_name, latitude,
        longitude, photo_url, audio_url, audio_transcript, clinical_confidence,
        clinical_rationale, identified_symptoms, containment_actions,
        biohazard_alert, model_used, ai_report_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fullCase.id,
        fullCase.report_id,
        fullCase.farmer_id,
        fullCase.farmer_name,
        fullCase.farmer_phone_masked,
        fullCase.doctor_id,
        fullCase.doctor_name,
        fullCase.doctor_phone_masked,
        fullCase.animal_tag,
        fullCase.species,
        fullCase.breed,
        fullCase.syndrome_code,
        fullCase.syndrome_name,
        fullCase.symptoms,
        fullCase.ai_differential,
        fullCase.urgency,
        fullCase.status,
        fullCase.interim_advice,
        fullCase.doctor_notes,
        fullCase.prescription,
        fullCase.visit_eta,
        fullCase.village_name,
        fullCase.block_name,
        fullCase.district_name,
        fullCase.latitude,
        fullCase.longitude,
        fullCase.photo_url,
        fullCase.audio_url,
        fullCase.audio_transcript,
        fullCase.clinical_confidence,
        fullCase.clinical_rationale,
        this.normalizeList(fullCase.identified_symptoms),
        this.normalizeList(fullCase.containment_actions),
        fullCase.biohazard_alert,
        fullCase.model_used,
        fullCase.ai_report_json,
        fullCase.created_at,
        fullCase.updated_at,
      ]
    );

    // 2. Attempt online synchronization
    try {
      const response = await fetch(getCasesEndpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_id: fullCase.report_id,
          farmer_id: fullCase.farmer_id,
          farmer_name: fullCase.farmer_name,
          farmer_phone: farmerRawPhone,
          doctor_id: fullCase.doctor_id,
          doctor_name: fullCase.doctor_name,
          animal_tag: fullCase.animal_tag,
          species: fullCase.species,
          breed: fullCase.breed,
          syndrome_code: fullCase.syndrome_code,
          syndrome_name: fullCase.syndrome_name,
          symptoms: fullCase.symptoms,
          ai_differential: fullCase.ai_differential,
          urgency: fullCase.urgency,
          interim_advice: fullCase.interim_advice,
          photo_url: fullCase.photo_url,
          audio_url: fullCase.audio_url,
          audio_transcript: fullCase.audio_transcript,
          clinical_confidence: fullCase.clinical_confidence,
          clinical_rationale: fullCase.clinical_rationale,
          identified_symptoms: this.normalizeList(fullCase.identified_symptoms),
          containment_actions: this.normalizeList(fullCase.containment_actions),
          biohazard_alert: fullCase.biohazard_alert,
          model_used: fullCase.model_used,
          ai_report_json: fullCase.ai_report_json,
          state_name: fullCase.state_name,
          village_name: fullCase.village_name,
          block_name: fullCase.block_name,
          district_name: fullCase.district_name,
          latitude: fullCase.latitude,
          longitude: fullCase.longitude,
        }),
      });

      if (response.ok) {
        const serverCase = await response.json();
        this.notifyListeners(serverCase);
        return serverCase;
      }
    } catch (e) {
      console.warn('Network offline or backend unreachable; case stored in local SQLite:', e);
    }

    this.notifyListeners(fullCase);
    return fullCase;
  }

  private listeners: Set<(caseItem: ClinicalCase) => void> = new Set();

  /**
   * Subscribe to real-time clinical case changes (new reports, prescriptions, status updates)
   */
  subscribe(listener: (caseItem: ClinicalCase) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Broadcast change to all active subscribers
   */
  notifyListeners(caseItem: ClinicalCase): void {
    this.listeners.forEach((fn) => {
      try {
        fn(caseItem);
      } catch (err) {
        console.warn('Error in caseService subscriber:', err);
      }
    });
  }

  /**
   * Retrieves active cases assigned to doctor (from cloud or local SQLite)
   */
  async getDoctorCases(doctorId?: string): Promise<ClinicalCase[]> {
    // 1. Try fetching from Cloud API
    try {
      const url = doctorId
        ? `${getCasesEndpoint()}?doctor_id=${encodeURIComponent(doctorId)}`
        : getCasesEndpoint();
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        const cases: ClinicalCase[] = data.items || [];
        // Cache to local SQLite
        for (const c of cases) {
          await dbService.execute(
            `INSERT OR REPLACE INTO clinical_cases (
              id, report_id, farmer_id, farmer_name, farmer_phone_masked,
              doctor_id, doctor_name, doctor_phone_masked, animal_tag, species,
              breed, syndrome_code, syndrome_name, symptoms, ai_differential,
              urgency, status, interim_advice, doctor_notes, prescription,
              visit_eta, village_name, block_name, district_name, latitude,
              longitude, photo_url, audio_url, audio_transcript, clinical_confidence,
              clinical_rationale, identified_symptoms, containment_actions,
              biohazard_alert, model_used, ai_report_json, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              c.id, c.report_id, c.farmer_id, c.farmer_name, c.farmer_phone_masked,
              c.doctor_id, c.doctor_name, c.doctor_phone_masked, c.animal_tag, c.species,
              c.breed, c.syndrome_code, c.syndrome_name, c.symptoms, c.ai_differential,
              c.urgency, c.status, c.interim_advice, c.doctor_notes, c.prescription,
              c.visit_eta, c.village_name, c.block_name, c.district_name, c.latitude,
              c.longitude, c.photo_url, c.audio_url, c.audio_transcript, c.clinical_confidence,
              c.clinical_rationale, this.normalizeList(c.identified_symptoms),
              this.normalizeList(c.containment_actions), c.biohazard_alert, c.model_used,
              c.ai_report_json, c.created_at, c.updated_at
            ]
          );
        }
        if (cases.length > 0) return cases;
      }
    } catch (e) {
      console.warn('Could not fetch doctor cases from cloud API, reading local SQLite:', e);
    }

    // 2. Fallback to local SQLite
    const localRows = await dbService.query<ClinicalCase>(
      `SELECT * FROM clinical_cases ORDER BY created_at DESC`
    );

    if (localRows && localRows.length > 0) {
      return localRows;
    }

    // 3. Seed realistic default clinical cases with AI reports
    for (const sc of SEEDED_DOCTOR_CASES) {
      await dbService.execute(
        `INSERT OR REPLACE INTO clinical_cases (
          id, report_id, farmer_id, farmer_name, farmer_phone_masked,
          doctor_id, doctor_name, doctor_phone_masked, animal_tag, species,
          breed, syndrome_code, syndrome_name, symptoms, ai_differential,
          urgency, status, interim_advice, doctor_notes, prescription,
          visit_eta, village_name, block_name, district_name, latitude,
          longitude, photo_url, audio_url, audio_transcript, clinical_confidence,
          clinical_rationale, identified_symptoms, containment_actions,
          biohazard_alert, model_used, ai_report_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sc.id, sc.report_id, sc.farmer_id, sc.farmer_name, sc.farmer_phone_masked,
          sc.doctor_id, sc.doctor_name, sc.doctor_phone_masked, sc.animal_tag, sc.species,
          sc.breed, sc.syndrome_code, sc.syndrome_name, sc.symptoms, sc.ai_differential,
          sc.urgency, sc.status, sc.interim_advice, sc.doctor_notes, sc.prescription,
          sc.visit_eta, sc.village_name, sc.block_name, sc.district_name, sc.latitude,
          sc.longitude, sc.photo_url, sc.audio_url, sc.audio_transcript, sc.clinical_confidence,
          sc.clinical_rationale, this.normalizeList(sc.identified_symptoms),
          this.normalizeList(sc.containment_actions), sc.biohazard_alert, sc.model_used,
          sc.ai_report_json, sc.created_at, sc.updated_at
        ]
      );
    }

    return SEEDED_DOCTOR_CASES;
  }

  /**
   * Retrieves farmer's submitted cases
   */
  async getFarmerCases(farmerId?: string): Promise<ClinicalCase[]> {
    try {
      const response = await fetch(getCasesEndpoint(), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        const cases: ClinicalCase[] = data.items || [];
        for (const c of cases) {
          await dbService.execute(
            `INSERT OR REPLACE INTO clinical_cases (
              id, report_id, farmer_id, farmer_name, farmer_phone_masked,
              doctor_id, doctor_name, doctor_phone_masked, animal_tag, species,
              breed, syndrome_code, syndrome_name, symptoms, ai_differential,
              urgency, status, interim_advice, doctor_notes, prescription,
              visit_eta, village_name, block_name, district_name, latitude,
              longitude, photo_url, audio_url, audio_transcript, clinical_confidence,
              clinical_rationale, identified_symptoms, containment_actions,
              biohazard_alert, model_used, ai_report_json, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              c.id, c.report_id, c.farmer_id, c.farmer_name, c.farmer_phone_masked,
              c.doctor_id, c.doctor_name, c.doctor_phone_masked, c.animal_tag, c.species,
              c.breed, c.syndrome_code, c.syndrome_name, c.symptoms, c.ai_differential,
              c.urgency, c.status, c.interim_advice, c.doctor_notes, c.prescription,
              c.visit_eta, c.village_name, c.block_name, c.district_name, c.latitude,
              c.longitude, c.photo_url, c.audio_url, c.audio_transcript, c.clinical_confidence,
              c.clinical_rationale, this.normalizeList(c.identified_symptoms),
              this.normalizeList(c.containment_actions), c.biohazard_alert, c.model_used,
              c.ai_report_json, c.created_at, c.updated_at
            ]
          );
        }
        if (cases.length > 0) return cases;
      }
    } catch (e) {
      console.warn('Could not fetch farmer cases from cloud API, fallback to local SQLite:', e);
    }

    const localRows = await dbService.query<ClinicalCase>(
      `SELECT * FROM clinical_cases ORDER BY created_at DESC`
    );
    return localRows || [];
  }

  /**
   * Doctor updates case status, writes prescription or sets visit ETA
   */
  async updateCase(
    caseId: string,
    updates: {
      status?: 'AWAITING_DOCTOR' | 'IN_CONSULTATION' | 'VISIT_SCHEDULED' | 'RESOLVED';
      doctor_notes?: string;
      prescription?: string;
      visit_eta?: string;
      doctor_id?: string;
      doctor_name?: string;
      ai_differential?: string;
    }
  ): Promise<ClinicalCase | null> {
    const now = new Date().toISOString();

    // 1. Update in local SQLite
    await dbService.execute(
      `UPDATE clinical_cases SET status = ?, doctor_notes = ?, prescription = ?, visit_eta = ?, updated_at = ? WHERE id = ?`,
      [
        updates.status || 'VISIT_SCHEDULED',
        updates.doctor_notes || '',
        updates.prescription || '',
        updates.visit_eta || '',
        now,
        caseId,
      ]
    );

    // 2. Sync to Cloud API
    try {
      const response = await fetch(getCasesEndpoint(caseId), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedServer = await response.json();
        this.notifyListeners(updatedServer);
        return updatedServer;
      }
    } catch (e) {
      console.warn('Network offline or backend unreachable; updated in local SQLite:', e);
    }

    const rows = await dbService.query<ClinicalCase>(
      `SELECT * FROM clinical_cases WHERE id = ?`,
      [caseId]
    );
    const updatedLocal = rows[0] || null;
    if (updatedLocal) {
      this.notifyListeners(updatedLocal);
    }
    return updatedLocal;
  }

  /**
   * Records a live tele-consultation event between Doctor and Farmer
   */
  async recordConsultation(
    caseId: string,
    channel: 'VIDEO' | 'AUDIO' | 'FIELD_VISIT',
    notes?: string
  ): Promise<void> {
    await this.updateCase(caseId, {
      status: 'IN_CONSULTATION',
      doctor_notes: notes ? `[${channel} Consult]: ${notes}` : undefined,
    });

    try {
      await fetch(getCaseConsultEndpoint(caseId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, notes }),
      });
    } catch (e) {
      console.warn('Could not record consultation to cloud API:', e);
    }
  }
}

export const caseService = new CaseService();

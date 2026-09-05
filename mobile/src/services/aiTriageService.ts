import { API_CONFIG, getTriageEndpoint } from '../config/api';

export type SyndromeCode = 'VSS' | 'NSLS' | 'HSDS' | 'AROS' | 'CMSS' | 'SARF' | 'HES' | 'NAS';
export type BiohazardAlert = 'NONE' | 'WARNING' | 'CRITICAL_ANTHRAX_LOCK';

export interface TriageRequest {
  photo_base64?: string;
  audio_base64?: string;
  audio_transcript?: string;
  species?: string;
  secondary_symptoms?: string[];
  village_lgd_code?: number;
}

export interface TriageResponse {
  syndrome_code: SyndromeCode;
  syndrome_name_en: string;
  syndrome_name_marathi: string;
  suspected_disease: string;
  clinical_confidence: number;
  biohazard_alert: BiohazardAlert;
  clinical_rationale: string;
  identified_symptoms: string[];
  immediate_advisory_marathi: string;
  immediate_advisory_hindi: string;
  recommended_containment_actions: string[];
  inference_time_ms: number;
  model_used: string;
}

class AITriageService {
  /**
   * Run multimodal triage with sub-second cloud inference and local offline fallback
   */
  async runMultimodalTriage(data: TriageRequest): Promise<TriageResponse> {
    const startTime = performance.now();

    // 1. Check for immediate client-side Anthrax Rule Zero triggers
    const combinedSignals = `${data.audio_transcript || ''} ${(data.secondary_symptoms || []).join(' ')}`.toLowerCase();
    const isAnthrax =
      combinedSignals.includes('sudden death') ||
      combinedSignals.includes('unclotted blood') ||
      combinedSignals.includes('अचानक मृत्यू') ||
      combinedSignals.includes('रक्तस्त्राव') ||
      combinedSignals.includes('काळपुळी');

    if (isAnthrax) {
      return this.generateOfflineAnthraxResponse(startTime);
    }

    // 2. Attempt cloud call to FastAPI / Gemini gateway
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeoutMs);

      const resp = await fetch(getTriageEndpoint(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (resp.ok) {
        const json: TriageResponse = await resp.json();
        return json;
      }
    } catch {
      // Network failure, timeout or offline barn dead zone -> proceed to on-device heuristic
    }

    // 3. Resilient On-Device Heuristic Evaluation
    return this.evaluateOnDevice(data, combinedSignals, startTime);
  }

  private generateOfflineAnthraxResponse(startTime: number): TriageResponse {
    const duration = Math.round(performance.now() - startTime);
    return {
      syndrome_code: 'SARF',
      syndrome_name_en: 'Sudden Death with Bleeding Syndrome',
      syndrome_name_marathi: 'काळपुळी (पटकी / ॲन्थ्रॅक्स)',
      suspected_disease: 'काळपुळी / ॲन्थ्रॅक्स (Anthrax - Bacillus anthracis)',
      clinical_confidence: 0.99,
      biohazard_alert: 'CRITICAL_ANTHRAX_LOCK',
      clinical_rationale:
        'तातडीचा धोका: अचानक मृत्यू व नैसर्गिक छिद्रांमधून न गोठणारे रक्तस्त्राव हे ॲन्थ्रॅक्सचे (काळपुळी) प्राथमिक लक्षण आहे. मानवास संसर्ग होण्याचा अतिधोका आहे.',
      identified_symptoms: ['अचानक मृत्यू (Sudden Death)', 'छिद्रांतून रक्तस्त्राव (Orifice Bleeding)'],
      immediate_advisory_marathi:
        'धोका! मृत जनावराचे शव कापू नका (DO NOT OPEN CARCASS). मानवाला संसर्ग होण्याचा तीव्र धोका आहे. शव ६ फूट खोल चुन्याच्या थरात गाडा.',
      immediate_advisory_hindi:
        'खतरा! मृत पशु का पोस्टमार्टम न करें। यह बीमारी इंसानों में भी फैल सकती है। शव को 6 फीट गहरे गड्ढे में चूना डालकर दफनाएं।',
      recommended_containment_actions: [
        'शवविच्छेदन त्वरित थांबवा (Movement Freeze)',
        'परिसरात जनावरे व मानवी हालचाली प्रतिबंधित करा',
        'तालुका पशुवैद्यकीय अधिकाऱ्यांना तात्काळ कळवा',
        '५ किमी परिघात रिंग लसीकरण सुरू करा',
      ],
      inference_time_ms: duration,
      model_used: 'OnDevice-RuleZeroSafety',
    };
  }

  private evaluateOnDevice(data: TriageRequest, combinedSignals: string, startTime: number): TriageResponse {
    const duration = Math.round(performance.now() - startTime);

    if (
      combinedSignals.includes('लाळ') ||
      combinedSignals.includes('फोड') ||
      combinedSignals.includes('खुर') ||
      combinedSignals.includes('fmd') ||
      combinedSignals.includes('blister') ||
      combinedSignals.includes('saliva')
    ) {
      return {
        syndrome_code: 'VSS',
        syndrome_name_en: 'Vesicular Stomatitis Syndrome',
        syndrome_name_marathi: 'लाळ्या खुरकूत संलक्षण',
        suspected_disease: 'लाळ्या खुरकूत (Foot & Mouth Disease - FMD)',
        clinical_confidence: 0.94,
        biohazard_alert: 'WARNING',
        clinical_rationale: 'तोंडातील फोड, पांढरी लाळ गळणे आणि पायातील खुरांच्या जखमा हे लाळ्या खुरकूत (FMD) आजाराचे स्पष्ट संकेत आहेत.',
        identified_symptoms: ['तोंडात फोड (Oral Vesicles)', 'लाळ गळणे (Hypersalivation)'],
        immediate_advisory_marathi:
          'बाधित जनावराला तात्काळ इतर जनावरांपासून वेगळे (किमान १५ मीटर) बांधा. पोटॅशियम परमँगनेटच्या पाण्याने (१:१०००) तोंड व पाय स्वच्छ धुवा. निरोगी जनावरांचे दूध आधी काढा.',
        immediate_advisory_hindi:
          'संक्रमित पशु को तुरंत अन्य पशुओं से अलग (कम से कम 15 मीटर दूर) बांधें। पोटाश (लाल दवा) के हल्के घोल से मुंह और खुरों को धोएं।',
        recommended_containment_actions: [
          'बाधित जनावरांचे विलगीकरण (15m Isolation)',
          'पोटॅशियम परमँगनेट द्रावणाने निर्जंतुकीकरण',
          'दूध व जनावरांची बाजारात विक्री तात्काळ थांबवा',
        ],
        inference_time_ms: duration,
        model_used: 'OnDevice-HeuristicEvaluator',
      };
    }

    if (
      combinedSignals.includes('गाठी') ||
      combinedSignals.includes('लंपी') ||
      combinedSignals.includes('त्वचा') ||
      combinedSignals.includes('lump') ||
      combinedSignals.includes('nodule')
    ) {
      return {
        syndrome_code: 'NSLS',
        syndrome_name_en: 'Nodular Skin Lesion Syndrome',
        syndrome_name_marathi: 'लंपी त्वचा संलक्षण',
        suspected_disease: 'लंपी त्वचा रोग (Lumpy Skin Disease - LSD)',
        clinical_confidence: 0.92,
        biohazard_alert: 'WARNING',
        clinical_rationale: 'त्वचेवर २-५ सेमी आकाराच्या कडक गाठी आणि ताप हे लंपी त्वचा रोगाचे (LSD) लक्षण आहे.',
        identified_symptoms: ['त्वचेवर गाठी (Nodular Skin Lesions)'],
        immediate_advisory_marathi:
          'गोठ्यात डास व माश्यांचा प्रादुर्भाव रोखण्यासाठी कडुनिंबाचा धूर करा. निंबोळी तेलाचा लेप अंगावरील गाठींवर लावा. जनावरांची वाहतूक पूर्णपणे थांबवा.',
        immediate_advisory_hindi:
          'मक्खी और मच्छरों से बचाव के लिए नीम के पत्तों का धुआं करें। पशु को छायादार जगह पर रखें और नीम के तेल का लेप करें।',
        recommended_containment_actions: [
          'कीटक व माश्यांचे नियंत्रण (Vector Control)',
          'गोठ्याची स्वच्छता व निंबोळी धूर',
          'परिसरातील निरोगी जनावरांचे गोटपॉक्स लसीकरण',
        ],
        inference_time_ms: duration,
        model_used: 'OnDevice-HeuristicEvaluator',
      };
    }

    if (
      combinedSignals.includes('घसा') ||
      combinedSignals.includes('घटसर्प') ||
      combinedSignals.includes('गळघोटू') ||
      combinedSignals.includes('घरघर') ||
      combinedSignals.includes('throat') ||
      combinedSignals.includes('swelling') ||
      combinedSignals.includes('galghotu') ||
      combinedSignals.includes('ghatwasa') ||
      combinedSignals.includes('hs')
    ) {
      return {
        syndrome_code: 'HSDS',
        syndrome_name_en: 'Hemorrhagic Septicemic Disease',
        syndrome_name_marathi: 'घटसर्प संलक्षण',
        suspected_disease: 'घटसर्प / गळघोटू (Hemorrhagic Septicemia - HS)',
        clinical_confidence: 0.91,
        biohazard_alert: 'WARNING',
        clinical_rationale: 'घशाखालील तीव्र सूज आणि श्वास घेताना घरघर आवाज हे घटसर्पाचे (HS) अतिगंभीर लक्षण आहे.',
        identified_symptoms: ['घशाखालील सूज (Submandibular Edema)', 'श्वासास अडथळा (Dyspnea)'],
        immediate_advisory_marathi:
          'अतितातडीची स्थिती! पशुवैद्यकीय डॉक्टरांकडून तातडीने प्रतिजैविके (सल्फोनामाइड / Antibiotics) टोचून घ्या. जनावराला मोकळ्या हवेत बांधा.',
        immediate_advisory_hindi:
          'आपातकालीन स्थिति! पशु चिकित्सक से तुरंत एंटीबायोटिक का टीका लगवाएं। पशु को खुली हवा में रखें।',
        recommended_containment_actions: [
          'तातडीने पशुवैद्यकीय उपचार बोलवा',
          'पाणी व खाद्याची भांडी वेगळी करा',
        ],
        inference_time_ms: duration,
        model_used: 'OnDevice-HeuristicEvaluator',
      };
    }

    // Default fallback
    return {
      syndrome_code: 'VSS',
      syndrome_name_en: 'Vesicular Stomatitis Syndrome',
      syndrome_name_marathi: 'लाळ्या खुरकूत संलक्षण',
      suspected_disease: 'संशयित लाळ्या खुरकूत (Suspected Vesicular)',
      clinical_confidence: 0.78,
      biohazard_alert: 'NONE',
      clinical_rationale: 'प्राथमिक लक्षणांवरून संशयित लाळ्या खुरकूत आजाराचे वर्गीकरण केले आहे.',
      identified_symptoms: data.secondary_symptoms || ['सामान्य अस्वस्थता'],
      immediate_advisory_marathi: 'जनावरावर लक्ष ठेवा आणि जवळच्या पशुवैद्यकीय दवाखान्याशी संपर्क साधा.',
      immediate_advisory_hindi: 'पशु की निगरानी करें और नजदीकी पशु चिकित्सालय से संपर्क करें।',
      recommended_containment_actions: ['जनावराचे विलगीकरण करा', 'स्थानिक पशुवैद्यकास पाचारण करा'],
      inference_time_ms: duration,
      model_used: 'OnDevice-Default',
    };
  }
}

export const aiTriageService = new AITriageService();

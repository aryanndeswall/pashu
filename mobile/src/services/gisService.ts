export interface EpiCurvePoint {
  date: string;
  dayIndex: number;
  suspectedCases: number;
  confirmedCases: number;
  mortalityCount: number;
  reproductionNumber: number;
}

export interface EpiCurveResponse {
  districtName: string;
  syndromeCode: string;
  totalSuspected: number;
  totalConfirmed: number;
  totalDeaths: number;
  peakDay: string;
  currentRt: number;
  points: EpiCurvePoint[];
}

export interface MarketClosureMemoRequest {
  clusterId: string;
  districtName: string;
  magistrateName: string;
  affectedVillages: string[];
  closedHaats: string[];
  quarantineCheckpoints: string[];
}

export interface MarketClosureMemoResponse {
  memoReferenceNo: string;
  issuedAt: string;
  actCitation: string;
  orderHeadlineMr: string;
  orderHeadlineEn: string;
  fullMemoMarathi: string;
  fullMemoEnglish: string;
  affectedVillages: string[];
  closedHaats: string[];
  quarantineCheckpoints: string[];
  signatory: string;
}

export interface SimulationStepState {
  stepNumber: number;
  stepTitle: string;
  stepTitleMr: string;
  component: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED';
  metrics: Record<string, any>;
  metricsEnglish?: Record<string, any>;
}

export const AHMEDNAGAR_EPI_DATA: EpiCurvePoint[] = [
  { date: '2026-08-22', dayIndex: 1, suspectedCases: 1, confirmedCases: 0, mortalityCount: 0, reproductionNumber: 1.2 },
  { date: '2026-08-23', dayIndex: 2, suspectedCases: 2, confirmedCases: 0, mortalityCount: 0, reproductionNumber: 1.55 },
  { date: '2026-08-24', dayIndex: 3, suspectedCases: 5, confirmedCases: 1, mortalityCount: 0, reproductionNumber: 2.1 },
  { date: '2026-08-25', dayIndex: 4, suspectedCases: 9, confirmedCases: 3, mortalityCount: 0, reproductionNumber: 2.45 },
  { date: '2026-08-26', dayIndex: 5, suspectedCases: 16, confirmedCases: 7, mortalityCount: 1, reproductionNumber: 2.7 },
  { date: '2026-08-27', dayIndex: 6, suspectedCases: 28, confirmedCases: 14, mortalityCount: 1, reproductionNumber: 2.85 },
  { date: '2026-08-28', dayIndex: 7, suspectedCases: 34, confirmedCases: 22, mortalityCount: 2, reproductionNumber: 2.6 },
  { date: '2026-08-29', dayIndex: 8, suspectedCases: 24, confirmedCases: 18, mortalityCount: 1, reproductionNumber: 1.8 },
  { date: '2026-08-30', dayIndex: 9, suspectedCases: 15, confirmedCases: 12, mortalityCount: 0, reproductionNumber: 1.3 },
  { date: '2026-08-31', dayIndex: 10, suspectedCases: 9, confirmedCases: 8, mortalityCount: 0, reproductionNumber: 0.95 },
  { date: '2026-09-01', dayIndex: 11, suspectedCases: 5, confirmedCases: 4, mortalityCount: 0, reproductionNumber: 0.8 },
  { date: '2026-09-02', dayIndex: 12, suspectedCases: 3, confirmedCases: 2, mortalityCount: 0, reproductionNumber: 0.72 },
  { date: '2026-09-03', dayIndex: 13, suspectedCases: 2, confirmedCases: 1, mortalityCount: 0, reproductionNumber: 0.68 },
  { date: '2026-09-04', dayIndex: 14, suspectedCases: 1, confirmedCases: 1, mortalityCount: 0, reproductionNumber: 0.65 },
];

export const AHMEDNAGAR_SIMULATION_STEPS: SimulationStepState[] = [
  {
    stepNumber: 1,
    stepTitle: 'Field Syndromic Ingestion (Ashwi Budruk)',
    stepTitleMr: 'शेतकरी अहवाल: आश्वी बुद्रुक (राहुरी)',
    component: 'Mobile APK / SQLite Offline Core',
    status: 'COMPLETED',
    metrics: {
      tagId: '1002-9384-7561',
      village: 'Ashwi Budruk (राहुरी)',
      symptoms: 'लाळ गळणे, तोंडात व पायात फोड',
      offlineSaveTimeMs: 14,
    },
    metricsEnglish: {
      tagId: '1002-9384-7561',
      village: 'Ashwi Budruk (Rahuri)',
      symptoms: 'Salivation, oral & foot blisters',
      offlineSaveTimeMs: '14 ms',
    },
  },
  {
    stepNumber: 2,
    stepTitle: 'Google Gemini 3.7 Flash Multimodal Triage',
    stepTitleMr: 'गुगल जेमिनी ३.७ फ्लॅश एआय ट्रायज',
    component: 'GenAI Multimodal Perception Gateway',
    status: 'COMPLETED',
    metrics: {
      syndromeCode: 'SYN_VESICULAR (खुरकूत)',
      confidence: '96%',
      ruleZeroAnthrax: 'CLEAR (सुरक्षित)',
      latencyMs: 680,
    },
    metricsEnglish: {
      syndromeCode: 'SYN_VESICULAR (FMD)',
      confidence: '96%',
      ruleZeroAnthrax: 'CLEAR (Safe)',
      latencyMs: '680 ms',
    },
  },
  {
    stepNumber: 3,
    stepTitle: 'Spatio-Temporal SaTScan Outbreak Escalation',
    stepTitleMr: 'सॅटस्कॅन (SaTScan) स्थानिक उद्रेक घोषणा',
    component: 'Spatial Permutation Engine',
    status: 'COMPLETED',
    metrics: {
      window: '५ किमी / ७२ तास',
      attackRate: '२.७६% (> १.५% मर्यादा)',
      opsScore: '0.84',
      status: 'OUTBREAK_DECLARED',
    },
    metricsEnglish: {
      window: '5 km / 72 hours',
      attackRate: '2.76% (> 1.5% threshold)',
      opsScore: '0.84',
      status: 'OUTBREAK_DECLARED',
    },
  },
  {
    stepNumber: 4,
    stepTitle: 'Dynamic Geodetic Biosecurity Buffer Generation',
    stepTitleMr: 'बायोसिक्युरिटी containment बफर निर्मिती',
    component: 'PostGIS / Geodesic Topology Engine',
    status: 'COMPLETED',
    metrics: {
      infectedZone: '१.० किमी (हालचाल बंदी)',
      ringVacZone: '५.० किमी (रिंग लसीकरण)',
      surveillanceZone: '१०.० किमी (पाळत परिमिती)',
    },
    metricsEnglish: {
      infectedZone: '1.0 km (Movement Ban)',
      ringVacZone: '5.0 km (Ring Vaccination)',
      surveillanceZone: '10.0 km (Surveillance)',
    },
  },
  {
    stepNumber: 5,
    stepTitle: 'e-LRF Specimen Requisition & Cold-Chain Transit',
    stepTitleMr: 'इ-प्रयोगशाळा मागणीपत्र व ४८ तास कोल्ड-चेन',
    component: 'Diagnostic Specimen Service',
    status: 'COMPLETED',
    metrics: {
      requisitionId: 'LRF-20260904-0941',
      sample: 'Vesicular Swab (FMD)',
      tempC: '3.8°C (२°C-८°C योग्य)',
      slaRemaining: '३२ तास शिल्लक',
    },
    metricsEnglish: {
      requisitionId: 'LRF-20260904-0941',
      sample: 'Vesicular Swab (FMD)',
      tempC: '3.8°C (2°C-8°C optimal)',
      slaRemaining: '32 hours left',
    },
  },
  {
    stepNumber: 6,
    stepTitle: 'RT-PCR Laboratory Confirmation Escalation',
    stepTitleMr: 'आरटी-पीसीआर प्रयोगशाळा निश्चिती (LAB_CONFIRMED)',
    component: 'District Diagnostic Lab (DDL), Pune',
    status: 'COMPLETED',
    metrics: {
      assay: 'RT-PCR (VP1 Gene)',
      result: 'POSITIVE (होकारार्थी)',
      cycleThreshold: '21.4',
      escalation: 'LAB_CONFIRMED',
    },
    metricsEnglish: {
      assay: 'RT-PCR (VP1 Gene)',
      result: 'POSITIVE',
      cycleThreshold: '21.4',
      escalation: 'LAB_CONFIRMED',
    },
  },
  {
    stepNumber: 7,
    stepTitle: 'Statutory PCICDA Market Closure & IDSP Alert',
    stepTitleMr: 'PCICDA कायदा बाजार बंदी आदेश व IDSP अलर्ट',
    component: 'District Magistrate Command & One-Health Bridge',
    status: 'COMPLETED',
    metrics: {
      actCitation: 'PCICDA 2009 (Sections 6, 10, 20)',
      marketsClosed: 'राहुरी व संगमनेर आठवडे बाजार',
      idspFeverSurvey: '१२ व्यक्तींची तपासणी',
      containment: 'ACTIVE & ENFORCED',
    },
    metricsEnglish: {
      actCitation: 'PCICDA 2009 (Sections 6, 10, 20)',
      marketsClosed: 'Rahuri & Sangamner Haats',
      idspFeverSurvey: '12 persons screened',
      containment: 'ACTIVE & ENFORCED',
    },
  },
];

class GisService {
  async getEpiCurve(_district: string = 'Ahmednagar'): Promise<EpiCurveResponse> {
    const totalSuspected = AHMEDNAGAR_EPI_DATA.reduce((acc, p) => acc + p.suspectedCases, 0);
    const totalConfirmed = AHMEDNAGAR_EPI_DATA.reduce((acc, p) => acc + p.confirmedCases, 0);
    const totalDeaths = AHMEDNAGAR_EPI_DATA.reduce((acc, p) => acc + p.mortalityCount, 0);

    return {
      districtName: 'Ahmednagar',
      syndromeCode: 'SYN_VESICULAR',
      totalSuspected,
      totalConfirmed,
      totalDeaths,
      peakDay: '2026-08-28',
      currentRt: 0.65,
      points: AHMEDNAGAR_EPI_DATA,
    };
  }

  generateMarketClosureOrder(params: MarketClosureMemoRequest): MarketClosureMemoResponse {
    const year = new Date().getFullYear();
    const refNum = `ADM/PCICDA/AHM/${year}/ORD-4821`;
    const citation =
      'The Prevention and Control of Infectious and Contagious Diseases in Animals Act, 2009 (Sections 6, 10 & 20)';

    const headlineMr = `${params.districtName} जिल्ह्यात संसर्गजन्य लाळ्या-खुरकूत (FMD) उद्रेक नियंत्रण: आठवडे पशु बाजार तात्काळ बंदी आदेश`;
    const headlineEn = `Statutory Order: Immediate Closure of Livestock Markets in ${params.districtName} District (PCICDA Act 2009)`;

    const villages = params.affectedVillages.join(', ');
    const haats = params.closedHaats.join(', ');
    const checkpoints = params.quarantineCheckpoints.join(', ');

    const memoMr = `कार्यालय: जिल्हा दंडाधिकारी व अध्यक्ष, जिल्हा आपत्ती व्यवस्थापन प्राधिकरण, ${params.districtName}

संदर्भ क्रमांक: ${refNum}
दिनांक: ${new Date().toISOString().slice(0, 10)}
कायदा संदर्भ: प्राण्यांमधील संसर्गजन्य रोगांचे प्रतिबंध व नियंत्रण कायदा, २००९ (कलम ६, १० व २०)

विषय: संसर्गजन्य पशु उद्रेक (क्लस्टर ${params.clusterId}) नियंत्रणार्थ १० किमी पाळत क्षेत्रात आठवडे पशु बाजार बंदी व हालचाल निर्बंध लागू करणेबाबत.

आदेश:
१. ${params.districtName} जिल्ह्यातील ${villages} या गावांच्या १० किमी परिघातील संपूर्ण क्षेत्र 'नियंत्रित क्षेत्र (Controlled Zone)' म्हणून घोषित करण्यात येत आहे.
२. कलम १० अन्वये पुढील आदेशापर्यंत ${haats} या सर्व आठवडे पशु बाजारांचे आयोजन पूर्णतः बंद राहील.
३. कलम २० अन्वये पोलीस यंत्रणेच्या सहकार्याने ${checkpoints} येथे पशु वाहतूक तपासणी नाके तात्काळ कार्यान्वित करण्यात यावेत.
४. नियमांचे उल्लंघन करणाऱ्यांविरुद्ध भारतीय न्याय संहिता (BNS) व PCICDA २००९ नुसार फौजदारी कारवाई केली जाईल.

स्वाक्षरी:
${params.magistrateName}
जिल्हा दंडाधिकारी, ${params.districtName}`;

    const memoEn = `OFFICE OF THE DISTRICT MAGISTRATE & COLLECTOR, ${params.districtName.toUpperCase()}

Order Reference: ${refNum}
Statutory Authority: ${citation}

Subject: Enforcement of 10 km Biosecurity Containment & Livestock Market Haat Prohibition (Cluster: ${params.clusterId})

ORDER:
1. In exercise of powers conferred under Section 6 of PCICDA 2009, the 10 km radius around villages (${villages}) is hereby declared a CONTROLLED BIOSECURITY ZONE.
2. Under Section 10 of the Act, all livestock trade, fairs, and markets including (${haats}) are strictly suspended with immediate effect.
3. Under Section 20, local police and transport authorities shall enforce 24x7 livestock movement check-posts at: ${checkpoints}.
4. Any violation shall attract penal prosecution under Section 32 of PCICDA 2009 and Section 223 of Bharatiya Nyaya Sanhita (BNS).

Issued by:
${params.magistrateName}
District Collector & District Magistrate, ${params.districtName}`;

    return {
      memoReferenceNo: refNum,
      issuedAt: new Date().toISOString(),
      actCitation: citation,
      orderHeadlineMr: headlineMr,
      orderHeadlineEn: headlineEn,
      fullMemoMarathi: memoMr,
      fullMemoEnglish: memoEn,
      affectedVillages: params.affectedVillages,
      closedHaats: params.closedHaats,
      quarantineCheckpoints: params.quarantineCheckpoints,
      signatory: params.magistrateName,
    };
  }

  async dispatchIdspAlert(params: {
    clusterId: string;
    disease: string;
    contacts: number;
  }): Promise<{ dispatchId: string; status: string }> {
    return {
      dispatchId: `IDSP-DSU-AHM-${Date.now()}`,
      status: 'DISPATCHED_TO_NCDC_PORTAL',
    };
  }
}

export const gisService = new GisService();

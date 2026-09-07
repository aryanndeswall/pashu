import { dbService } from '../database/sqliteConnection';
import { getApiUrl } from '../config/api';

export type ColdChainStatus = 'OPTIMAL' | 'WARNING' | 'BREACHED';
export type RequisitionStatus =
  | 'PENDING'
  | 'IN_TRANSIT'
  | 'RECEIVED'
  | 'TESTING'
  | 'LAB_CONFIRMED'
  | 'NEGATIVE';

export interface ColdChainMetrics {
  elapsedHours: number;
  remainingHours: number;
  percentElapsed: number;
  coldChainStatus: ColdChainStatus;
  isBreached: boolean;
  currentTempC: number;
  advisoryMessage: string;
  advisoryMessageMr: string;
}

export interface LabRequisition {
  requisitionId: string;
  animalTagId: string;
  incidentId?: string;
  clusterId?: string;
  vetId: string;
  villageName?: string;
  districtName?: string;
  sampleType: string;
  suspectedDisease: string;
  preservative?: string;
  destinationLab: string;
  status: RequisitionStatus;
  transitTempC: number;
  tempBreached: boolean;
  collectedAt: string;
  dispatchedAt: string;
  receivedAt?: string;
  testType?: string;
  testResult?: 'POSITIVE' | 'NEGATIVE' | 'INCONCLUSIVE';
  resultNotes?: string;
  pathologistId?: string;
  confirmedAt?: string;
  qrPayload?: string;
  coldChain: ColdChainMetrics;
}

export interface LabRequisitionCreatePayload {
  animalTagId: string;
  incidentId?: string;
  clusterId?: string;
  vetId?: string;
  villageName?: string;
  districtName?: string;
  sampleType: string;
  suspectedDisease: string;
  preservative?: string;
  destinationLab: string;
  initialTempC?: number;
  collectedAt?: string;
}

export function calculateColdChainMetrics(
  collectedAtIso: string,
  currentTempC: number,
  nowIso?: string
): ColdChainMetrics {
  const collectedDate = new Date(collectedAtIso);
  const nowDate = nowIso ? new Date(nowIso) : new Date();

  const diffMs = Math.max(0, nowDate.getTime() - collectedDate.getTime());
  const elapsedHours = Number((diffMs / (1000 * 60 * 60)).toFixed(1));
  const remainingHours = Number(Math.max(0, 48.0 - elapsedHours).toFixed(1));
  const percentElapsed = Number(Math.min(100.0, (elapsedHours / 48.0) * 100.0).toFixed(1));

  let status: ColdChainStatus = 'OPTIMAL';
  let isBreached = false;
  let advisory = 'Optimal cold-chain maintained (2°C–8°C). Sample viability intact.';
  let advisoryMr = 'कोल्ड-चेन योग्य राखली आहे (२°C ते ८°C). नमुना सुरक्षित.';

  if (currentTempC > 12.0 || elapsedHours >= 48.0) {
    status = 'BREACHED';
    isBreached = true;
    advisory = 'Cold-chain compromised! Temperature > 12°C or SLA > 48h expired. Sample viability impaired.';
    advisoryMr = 'कोल्ड-चेन मर्यादा ओलांडली! तापमान १२°C पेक्षा जास्त किंवा ४८ तास उलटून गेले. नमुना खराब होण्याची शक्यता.';
  } else if (currentTempC > 8.0 || elapsedHours >= 36.0) {
    status = 'WARNING';
    isBreached = false;
    advisory = 'Temperature or transit time elevated. Expedite delivery to diagnostic lab.';
    advisoryMr = 'तापमान किंवा प्रवासाचा वेळ वाढला आहे. लवकरात लवकर प्रयोगशाळेत नमुना पोहोचवा.';
  }

  return {
    elapsedHours,
    remainingHours,
    percentElapsed,
    coldChainStatus: status,
    isBreached,
    currentTempC,
    advisoryMessage: advisory,
    advisoryMessageMr: advisoryMr,
  };
}

export function generateRequisitionId(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `LRF-${y}${m}${d}-${rand}`;
}

export function generateQrPayload(req: {
  requisitionId: string;
  animalTagId: string;
  suspectedDisease: string;
  sampleType: string;
  destinationLab: string;
  collectedAt: string;
}): string {
  return JSON.stringify({
    req_id: req.requisitionId,
    tag: req.animalTagId,
    disease: req.suspectedDisease,
    sample: req.sampleType,
    lab: req.destinationLab,
    collected: req.collectedAt,
  });
}

// Pre-seeded Ahmednagar district requisitions
function getInitialRequisitions(): LabRequisition[] {
  const now = new Date();
  const collected16hAgo = new Date(now.getTime() - 16 * 3600 * 1000).toISOString();
  const dispatched15hAgo = new Date(now.getTime() - 15.5 * 3600 * 1000).toISOString();

  const req1Id = 'LRF-20260904-0941';
  const req1Metrics = calculateColdChainMetrics(collected16hAgo, 3.8);

  const collected42hAgo = new Date(now.getTime() - 42 * 3600 * 1000).toISOString();
  const req2Id = 'LRF-20260903-8124';
  const req2Metrics = calculateColdChainMetrics(collected42hAgo, 7.2);

  return [
    {
      requisitionId: req1Id,
      animalTagId: '100293847561',
      incidentId: 'INC-ASHWI-01',
      clusterId: 'CL-SYN_VESICULAR-558301',
      vetId: 'VET-MAH-4821',
      villageName: 'Ashwi Budruk (राहुरी)',
      districtName: 'Ahmednagar',
      sampleType: 'Vesicular Swab (FMD Suspect)',
      suspectedDisease: 'Foot-and-Mouth Disease (खुरकूत)',
      preservative: '50% Glycerol Phosphate Buffered Saline (pH 7.4-7.6)',
      destinationLab: 'District Diagnostic Lab (DDL), Pune',
      status: 'IN_TRANSIT',
      transitTempC: 3.8,
      tempBreached: false,
      collectedAt: collected16hAgo,
      dispatchedAt: dispatched15hAgo,
      qrPayload: generateQrPayload({
        requisitionId: req1Id,
        animalTagId: '100293847561',
        suspectedDisease: 'FMD Suspect',
        sampleType: 'Vesicular Swab',
        destinationLab: 'DDL Pune',
        collectedAt: collected16hAgo,
      }),
      coldChain: req1Metrics,
    },
    {
      requisitionId: req2Id,
      animalTagId: '100293847562',
      incidentId: 'INC-RAHURI-02',
      clusterId: 'CL-SYN_CUTANEOUS-558302',
      vetId: 'VET-MAH-4821',
      villageName: 'Rahuri Rural',
      districtName: 'Ahmednagar',
      sampleType: 'Skin Scab (LSD Suspect)',
      suspectedDisease: 'Lumpy Skin Disease (लम्पी त्वचा रोग)',
      preservative: 'Viral Transport Medium (VTM)',
      destinationLab: 'State Disease Investigation Section (DIS), Pune',
      status: 'TESTING',
      transitTempC: 7.2,
      tempBreached: false,
      collectedAt: collected42hAgo,
      dispatchedAt: collected42hAgo,
      receivedAt: new Date(now.getTime() - 4 * 3600 * 1000).toISOString(),
      testType: 'RT-PCR',
      qrPayload: generateQrPayload({
        requisitionId: req2Id,
        animalTagId: '100293847562',
        suspectedDisease: 'LSD Suspect',
        sampleType: 'Skin Scab',
        destinationLab: 'DIS Pune',
        collectedAt: collected42hAgo,
      }),
      coldChain: req2Metrics,
    },
  ];
}

class MobileLabService {
  private inMemoryRequisitions: LabRequisition[] = getInitialRequisitions();
  private isInitialized = false;

  async initDb(): Promise<void> {
    if (this.isInitialized) return;

    try {
      if (dbService && dbService.isNative) {
        await dbService.execute(`
          CREATE TABLE IF NOT EXISTS lab_requisitions (
            requisition_id TEXT PRIMARY KEY,
            animal_tag_id TEXT NOT NULL,
            incident_id TEXT,
            cluster_id TEXT,
            vet_id TEXT NOT NULL,
            village_name TEXT,
            district_name TEXT,
            sample_type TEXT NOT NULL,
            suspected_disease TEXT NOT NULL,
            preservative TEXT,
            destination_lab TEXT NOT NULL,
            status TEXT NOT NULL,
            transit_temp_c REAL NOT NULL,
            temp_breached INTEGER NOT NULL,
            collected_at TEXT NOT NULL,
            dispatched_at TEXT NOT NULL,
            received_at TEXT,
            test_type TEXT,
            test_result TEXT,
            result_notes TEXT,
            pathologist_id TEXT,
            confirmed_at TEXT,
            qr_payload TEXT
          );
        `);
      }
      this.isInitialized = true;
    } catch (err) {
      console.warn('SQLite not available for lab service; running in-memory fallback:', err);
      this.isInitialized = true;
    }
  }

  async getRequisitions(): Promise<LabRequisition[]> {
    await this.initDb();
    // Recompute cold chain metrics for real-time accuracy
    return this.inMemoryRequisitions.map((req) => ({
      ...req,
      coldChain: calculateColdChainMetrics(req.collectedAt, req.transitTempC),
    }));
  }

  async getRequisitionById(requisitionId: string): Promise<LabRequisition | null> {
    await this.initDb();
    const req = this.inMemoryRequisitions.find((r) => r.requisitionId === requisitionId);
    if (!req) return null;
    return {
      ...req,
      coldChain: calculateColdChainMetrics(req.collectedAt, req.transitTempC),
    };
  }

  async createRequisition(payload: LabRequisitionCreatePayload): Promise<LabRequisition> {
    await this.initDb();
    const requisitionId = generateRequisitionId();
    const collectedAt = payload.collectedAt || new Date().toISOString();
    const dispatchedAt = new Date().toISOString();
    const temp = payload.initialTempC ?? 4.0;
    const tempBreached = temp > 12.0;

    const qrPayload = generateQrPayload({
      requisitionId,
      animalTagId: payload.animalTagId,
      suspectedDisease: payload.suspectedDisease,
      sampleType: payload.sampleType,
      destinationLab: payload.destinationLab,
      collectedAt,
    });

    const newReq: LabRequisition = {
      requisitionId,
      animalTagId: payload.animalTagId,
      incidentId: payload.incidentId,
      clusterId: payload.clusterId,
      vetId: payload.vetId || 'VET-MAH-4821',
      villageName: payload.villageName || 'Ashwi Budruk',
      districtName: payload.districtName || 'Ahmednagar',
      sampleType: payload.sampleType,
      suspectedDisease: payload.suspectedDisease,
      preservative: payload.preservative || '50% Glycerol-PBS (pH 7.4-7.6)',
      destinationLab: payload.destinationLab,
      status: 'IN_TRANSIT',
      transitTempC: temp,
      tempBreached,
      collectedAt,
      dispatchedAt,
      qrPayload,
      coldChain: calculateColdChainMetrics(collectedAt, temp),
    };

    this.inMemoryRequisitions.unshift(newReq);

    // Attempt direct cloud sync if online (skip in test runner)
    if (
      (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') ||
      (typeof import.meta !== 'undefined' && (import.meta as any).env?.MODE === 'test')
    ) {
      return newReq;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      await fetch(getApiUrl('labs/requisitions'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          animal_tag_id: payload.animalTagId,
          incident_id: payload.incidentId,
          cluster_id: payload.clusterId,
          vet_id: payload.vetId || 'VET-MAH-4821',
          village_name: payload.villageName || 'Ashwi Budruk',
          district_name: payload.districtName || 'Ahmednagar',
          sample_type: payload.sampleType,
          suspected_disease: payload.suspectedDisease,
          preservative: payload.preservative || '50% Glycerol-PBS (pH 7.4-7.6)',
          destination_lab: payload.destinationLab,
          initial_temp_c: temp,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch {
      // Offline or network error; local state preserved
    }

    return newReq;
  }

  async logTemperature(
    requisitionId: string,
    tempC: number,
    _checkpoint?: string
  ): Promise<LabRequisition> {
    await this.initDb();
    const req = this.inMemoryRequisitions.find((r) => r.requisitionId === requisitionId);
    if (!req) {
      throw new Error(`Requisition ${requisitionId} not found`);
    }

    req.transitTempC = tempC;
    if (tempC > 12.0) {
      req.tempBreached = true;
    }
    req.coldChain = calculateColdChainMetrics(req.collectedAt, tempC);
    return req;
  }

  async submitLabResult(
    requisitionId: string,
    testType: string,
    testResult: 'POSITIVE' | 'NEGATIVE' | 'INCONCLUSIVE',
    pathologistId: string = 'PATH-DDL-102',
    notes?: string
  ): Promise<LabRequisition> {
    await this.initDb();
    const req = this.inMemoryRequisitions.find((r) => r.requisitionId === requisitionId);
    if (!req) {
      throw new Error(`Requisition ${requisitionId} not found`);
    }

    req.testType = testType;
    req.testResult = testResult;
    req.pathologistId = pathologistId;
    req.resultNotes = notes;

    if (testResult === 'POSITIVE') {
      req.status = 'LAB_CONFIRMED';
      req.confirmedAt = new Date().toISOString();
    } else if (testResult === 'NEGATIVE') {
      req.status = 'NEGATIVE';
    } else {
      req.status = 'TESTING';
    }

    req.coldChain = calculateColdChainMetrics(req.collectedAt, req.transitTempC);
    return req;
  }

  clearStore(): void {
    this.inMemoryRequisitions = getInitialRequisitions();
  }
}

export const labService = new MobileLabService();

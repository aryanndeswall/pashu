import { describe, it, expect, beforeEach } from 'vitest';
import {
  labService,
  calculateColdChainMetrics,
  generateRequisitionId,
  generateQrPayload,
} from '../services/labService';

describe('mobile labService & Cold Chain SLA Engine (LAB-01, LAB-02, LAB-03)', () => {
  beforeEach(() => {
    labService.clearStore();
  });

  it('calculates 48-hour cold chain SLA metrics accurately across all compliance thresholds', () => {
    const fixedNow = '2026-09-04T12:00:00.000Z';

    // 10 hours elapsed -> 38h remaining, OPTIMAL
    const collected10hAgo = '2026-09-04T02:00:00.000Z';
    const metricsOptimal = calculateColdChainMetrics(collected10hAgo, 4.0, fixedNow);
    expect(metricsOptimal.elapsedHours).toBe(10.0);
    expect(metricsOptimal.remainingHours).toBe(38.0);
    expect(metricsOptimal.coldChainStatus).toBe('OPTIMAL');
    expect(metricsOptimal.isBreached).toBe(false);

    // 38 hours elapsed -> 10h remaining, WARNING
    const collected38hAgo = '2026-09-02T22:00:00.000Z';
    const metricsWarning = calculateColdChainMetrics(collected38hAgo, 4.5, fixedNow);
    expect(metricsWarning.elapsedHours).toBe(38.0);
    expect(metricsWarning.remainingHours).toBe(10.0);
    expect(metricsWarning.coldChainStatus).toBe('WARNING');
    expect(metricsWarning.isBreached).toBe(false);

    // 50 hours elapsed -> 0h remaining, BREACHED
    const collected50hAgo = '2026-09-02T10:00:00.000Z';
    const metricsExpired = calculateColdChainMetrics(collected50hAgo, 4.0, fixedNow);
    expect(metricsExpired.elapsedHours).toBe(50.0);
    expect(metricsExpired.remainingHours).toBe(0.0);
    expect(metricsExpired.coldChainStatus).toBe('BREACHED');
    expect(metricsExpired.isBreached).toBe(true);

    // Temperature > 12°C -> BREACHED regardless of hours
    const metricsHot = calculateColdChainMetrics(collected10hAgo, 13.8, fixedNow);
    expect(metricsHot.coldChainStatus).toBe('BREACHED');
    expect(metricsHot.isBreached).toBe(true);
  });

  it('generates unique e-LRF IDs and QR code payload strings', () => {
    const id1 = generateRequisitionId();
    const id2 = generateRequisitionId();
    expect(id1).toMatch(/^LRF-\d{8}-\d{4}$/);
    expect(id2).toMatch(/^LRF-\d{8}-\d{4}$/);

    const qr = generateQrPayload({
      requisitionId: 'LRF-20260904-1001',
      animalTagId: '100293847561',
      suspectedDisease: 'FMD Suspect',
      sampleType: 'Vesicular Swab',
      destinationLab: 'DDL Pune',
      collectedAt: new Date().toISOString(),
    });

    const parsed = JSON.parse(qr);
    expect(parsed.req_id).toBe('LRF-20260904-1001');
    expect(parsed.tag).toBe('100293847561');
    expect(parsed.disease).toBe('FMD Suspect');
    expect(parsed.sample).toBe('Vesicular Swab');
  });

  it('creates an e-LRF requisition offline with default optimal cold chain status', async () => {
    const newReq = await labService.createRequisition({
      animalTagId: '100293847563',
      sampleType: 'Whole Blood (EDTA)',
      suspectedDisease: 'Haemorrhagic Septicaemia (घटसर्प)',
      destinationLab: 'District Diagnostic Lab (DDL), Ahmednagar',
      initialTempC: 4.2,
    });

    expect(newReq.requisitionId).toMatch(/^LRF-\d{8}-\d{4}$/);
    expect(newReq.animalTagId).toBe('100293847563');
    expect(newReq.status).toBe('IN_TRANSIT');
    expect(newReq.coldChain.coldChainStatus).toBe('OPTIMAL');
    expect(newReq.qrPayload).toBeDefined();

    const all = await labService.getRequisitions();
    expect(all.some((r) => r.requisitionId === newReq.requisitionId)).toBe(true);
  });

  it('logs transit temperature checkpoint and updates cold-chain compliance', async () => {
    const reqs = await labService.getRequisitions();
    const target = reqs[0];

    // Log normal temperature
    const updated1 = await labService.logTemperature(target.requisitionId, 5.0, 'Rahuri Toll');
    expect(updated1.transitTempC).toBe(5.0);
    expect(updated1.tempBreached).toBe(false);
    expect(updated1.coldChain.coldChainStatus).toBe('OPTIMAL');

    // Log breached temperature (> 12°C)
    const updated2 = await labService.logTemperature(target.requisitionId, 14.5, 'Hot Hub');
    expect(updated2.transitTempC).toBe(14.5);
    expect(updated2.tempBreached).toBe(true);
    expect(updated2.coldChain.coldChainStatus).toBe('BREACHED');
  });

  it('submits RT-PCR positive result and triggers LAB_CONFIRMED escalation', async () => {
    const reqs = await labService.getRequisitions();
    const target = reqs[0];

    const confirmed = await labService.submitLabResult(
      target.requisitionId,
      'RT-PCR',
      'POSITIVE',
      'PATH-DDL-102',
      'Strong FMDV VP1 amplification'
    );

    expect(confirmed.status).toBe('LAB_CONFIRMED');
    expect(confirmed.testType).toBe('RT-PCR');
    expect(confirmed.testResult).toBe('POSITIVE');
    expect(confirmed.confirmedAt).toBeDefined();
  });

  it('submits negative result and updates status to NEGATIVE', async () => {
    const reqs = await labService.getRequisitions();
    const target = reqs[0];

    const negative = await labService.submitLabResult(
      target.requisitionId,
      'Sandwich ELISA',
      'NEGATIVE',
      'PATH-DDL-102',
      'No viral antigen detected'
    );

    expect(negative.status).toBe('NEGATIVE');
    expect(negative.testType).toBe('Sandwich ELISA');
    expect(negative.testResult).toBe('NEGATIVE');
  });
});

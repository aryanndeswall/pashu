import { describe, it, expect } from 'vitest';
import { gisService, AHMEDNAGAR_EPI_DATA } from '../services/gisService';

describe('mobile gisService (GIS-01, GIS-02, GIS-03)', () => {
  it('retrieves 14-day rolling epi-curve with continuous daily dates and reproduction numbers', async () => {
    const epi = await gisService.getEpiCurve('Ahmednagar');

    expect(epi.districtName).toBe('Ahmednagar');
    expect(epi.points.length).toBe(14);
    expect(epi.totalSuspected).toBeGreaterThan(100);
    expect(epi.totalConfirmed).toBeGreaterThan(50);
    expect(epi.peakDay).toBe('2026-08-28');

    // Confirm that post-containment Rt drops below 1.0
    const initialPt = epi.points[0];
    const finalPt = epi.points[13];
    expect(initialPt.reproductionNumber).toBeGreaterThan(1.0);
    expect(finalPt.reproductionNumber).toBeLessThan(1.0);
  });

  it('generates official statutory PCICDA 2009 market closure order memo in bilingual format', () => {
    const memo = gisService.generateMarketClosureOrder({
      clusterId: 'CL-SYN_VESICULAR-558301',
      districtName: 'Ahmednagar',
      magistrateName: 'जिल्हा दंडाधिकारी, अहमदनगर',
      affectedVillages: ['Ashwi Budruk', 'Rahuri Rural'],
      closedHaats: ['राहुरी आठवडे पशु बाजार', 'संगमनेर बैल बाजार'],
      quarantineCheckpoints: ['SH-10 Checkpost', 'NH-160 Toll'],
    });

    expect(memo.memoReferenceNo).toMatch(/^ADM\/PCICDA\/AHM\/\d{4}\/ORD-4821$/);
    expect(memo.actCitation).toContain('Sections 6, 10 & 20');
    expect(memo.orderHeadlineMr).toContain('आठवडे पशु बाजार तात्काळ बंदी आदेश');
    expect(memo.fullMemoMarathi).toContain('नियंत्रित क्षेत्र (Controlled Zone)');
    expect(memo.fullMemoEnglish).toContain('CONTROLLED BIOSECURITY ZONE');
    expect(memo.closedHaats.length).toBe(2);
  });

  it('dispatches inter-agency IDSP syndromic alert for human fever contact tracing', async () => {
    const dispatch = await gisService.dispatchIdspAlert({
      clusterId: 'CL-SYN_VESICULAR-558301',
      disease: 'FMD',
      contacts: 14,
    });

    expect(dispatch.dispatchId).toMatch(/^IDSP-DSU-AHM-\d+$/);
    expect(dispatch.status).toBe('DISPATCHED_TO_NCDC_PORTAL');
  });
});

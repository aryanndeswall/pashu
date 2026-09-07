import { describe, it, expect, beforeEach, vi } from 'vitest';
import { caseService, ClinicalCase } from '../services/caseService';
import { dbService } from '../database/sqliteConnection';

describe('CaseService Unit Tests', () => {
  beforeEach(async () => {
    await dbService.initDatabase();
    // Clear mock tables if any
    await dbService.execute('DELETE FROM auth_session');
  });

  it('creates a new clinical case, saves to SQLite with phone masking and default doctor', async () => {
    const newCase = await caseService.createCase(
      {
        animal_tag: '1002-9384-7561',
        species: 'Gir Cow',
        syndrome_code: 'VSS',
        syndrome_name: 'FMD Suspected',
        urgency: 'HIGH',
      },
      '9822000412'
    );

    expect(newCase.id).toMatch(/^CASE-/);
    expect(newCase.farmer_phone_masked).toBe('+91 9822X-XX412');
    expect(newCase.doctor_name).toBe('Dr. Ananya Deshmukh');
    expect(newCase.status).toBe('AWAITING_DOCTOR');
    expect(newCase.interim_advice).toContain('विलगीकरणात');
  });

  it('retrieves active doctor cases from local database', async () => {
    await caseService.createCase(
      {
        animal_tag: '1002-9384-7562',
        doctor_id: 'usr_vet_02',
        syndrome_code: 'HSDS',
      },
      '9423000819'
    );

    const doctorCases = await caseService.getDoctorCases('usr_vet_02');
    expect(doctorCases.length).toBeGreaterThan(0);
    expect(doctorCases.some((c) => c.animal_tag === '1002-9384-7562')).toBe(true);
  });

  it('updates case status, prescription and visit ETA', async () => {
    const created = await caseService.createCase(
      {
        animal_tag: '1002-9384-7563',
        syndrome_code: 'VSS',
      },
      '9158000001'
    );

    const updated = await caseService.updateCase(created.id, {
      status: 'VISIT_SCHEDULED',
      prescription: 'Meloxicam bolus BID x 3 days',
      visit_eta: 'Today at 4:30 PM',
      doctor_notes: 'Oral lesions washed with KMnO4.',
    });

    expect(updated).not.toBeNull();
    expect(updated?.status).toBe('VISIT_SCHEDULED');
    expect(updated?.prescription).toContain('Meloxicam');
    expect(updated?.visit_eta).toBe('Today at 4:30 PM');
  });

  it('records a live tele-consultation session and transitions case status', async () => {
    const created = await caseService.createCase(
      {
        animal_tag: '1002-9384-7564',
        syndrome_code: 'BRDS',
      },
      '9822112233'
    );

    await caseService.recordConsultation(created.id, 'VIDEO', 'Live oral inspection complete; no deep ulceration.');

    const cases = await caseService.getDoctorCases('usr_vet_02');
    const target = cases.find((c) => c.id === created.id);
    expect(target).toBeDefined();
    expect(target?.status).toBe('IN_CONSULTATION');
    expect(target?.doctor_notes).toContain('[VIDEO Consult]');
  });
});

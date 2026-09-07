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
  village_name: string;
  block_name: string;
  district_name: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
}

class CaseService {
  private maskPhone(phone: string): string {
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 10) return '+91 98XXX-XXXXX';
    const last10 = clean.slice(-10);
    return `+91 ${last10.slice(0, 4)}X-XX${last10.slice(-3)}`;
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
      farmer_phone_masked: maskedPhone,
      doctor_id: caseData.doctor_id || 'usr_vet_02',
      doctor_name: caseData.doctor_name || 'Dr. Ananya Deshmukh',
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
      village_name: caseData.village_name || 'Ashwi Budruk',
      block_name: caseData.block_name || 'Rahuri',
      district_name: caseData.district_name || 'Ahmednagar',
      latitude: caseData.latitude || 19.3912,
      longitude: caseData.longitude || 74.6521,
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
        longitude, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          village_name: fullCase.village_name,
          block_name: fullCase.block_name,
          district_name: fullCase.district_name,
          latitude: fullCase.latitude,
          longitude: fullCase.longitude,
        }),
      });

      if (response.ok) {
        const serverCase = await response.json();
        return serverCase;
      }
    } catch (e) {
      console.warn('Network offline or backend unreachable; case stored in local SQLite:', e);
    }

    return fullCase;
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
              longitude, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              c.id, c.report_id, c.farmer_id, c.farmer_name, c.farmer_phone_masked,
              c.doctor_id, c.doctor_name, c.doctor_phone_masked, c.animal_tag, c.species,
              c.breed, c.syndrome_code, c.syndrome_name, c.symptoms, c.ai_differential,
              c.urgency, c.status, c.interim_advice, c.doctor_notes, c.prescription,
              c.visit_eta, c.village_name, c.block_name, c.district_name, c.latitude,
              c.longitude, c.created_at, c.updated_at
            ]
          );
        }
        return cases;
      }
    } catch (e) {
      console.warn('Could not fetch doctor cases from cloud API, reading local SQLite:', e);
    }

    // 2. Fallback to local SQLite
    const localRows = await dbService.query<ClinicalCase>(
      `SELECT * FROM clinical_cases ORDER BY created_at DESC`
    );
    return localRows || [];
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
              longitude, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              c.id, c.report_id, c.farmer_id, c.farmer_name, c.farmer_phone_masked,
              c.doctor_id, c.doctor_name, c.doctor_phone_masked, c.animal_tag, c.species,
              c.breed, c.syndrome_code, c.syndrome_name, c.symptoms, c.ai_differential,
              c.urgency, c.status, c.interim_advice, c.doctor_notes, c.prescription,
              c.visit_eta, c.village_name, c.block_name, c.district_name, c.latitude,
              c.longitude, c.created_at, c.updated_at
            ]
          );
        }
        return cases;
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
        return await response.json();
      }
    } catch (e) {
      console.warn('Network offline or backend unreachable; updated in local SQLite:', e);
    }

    const rows = await dbService.query<ClinicalCase>(
      `SELECT * FROM clinical_cases WHERE id = ?`,
      [caseId]
    );
    return rows[0] || null;
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

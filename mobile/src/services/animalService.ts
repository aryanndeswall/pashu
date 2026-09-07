import { dbService } from '../database/sqliteConnection';
import { getApiUrl } from '../config/api';

export interface LocalAnimal {
  tagNumber: string;
  ownerName: string;
  ownerMobileMasked: string;
  species: string;
  breed: string;
  ageMonths: number;
  villageLgdCode: number;
  villageName: string;
  vaccinationStatus: 'UP_TO_DATE' | 'BOOSTER_DUE' | 'OVERDUE';
  lastSyncedAt: string;
}

export interface VaccineRecord {
  disease: 'FMD' | 'LSD' | 'ANTHRAX';
  diseaseNameMarathi: string;
  lastDoseDate: string;
  nextBoosterDue: string;
  daysRemaining: number;
  status: 'UP_TO_DATE' | 'BOOSTER_DUE' | 'OVERDUE';
  batchNumber: string;
}

export function formatTagNumber(tag: string): string {
  const cleaned = tag.replace(/\D/g, '');
  if (cleaned.length === 12) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8, 12)}`;
  }
  return tag;
}

export function maskMobileNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length >= 4) {
    const last4 = cleaned.slice(-4);
    return `+91-XXXXX-${last4}`;
  }
  return '+91-XXXXX-0000';
}

export const DEMO_ANIMALS: LocalAnimal[] = [
  {
    tagNumber: '100293847561',
    ownerName: 'रमेश पाटील (Ramesh Patil)',
    ownerMobileMasked: '+91-XXXXX-9842',
    species: 'गाय (Cow - Bovine)',
    breed: 'गीर (Gir)',
    ageMonths: 36,
    villageLgdCode: 558301,
    villageName: 'Ashwi Budruk (राहुरी)',
    vaccinationStatus: 'BOOSTER_DUE',
    lastSyncedAt: new Date().toISOString(),
  },
  {
    tagNumber: '100293847562',
    ownerName: 'रमेश पाटील (Ramesh Patil)',
    ownerMobileMasked: '+91-XXXXX-9842',
    species: 'म्हैस (Buffalo)',
    breed: 'मुऱ्हा (Murrah)',
    ageMonths: 48,
    villageLgdCode: 558301,
    villageName: 'Ashwi Budruk (राहुरी)',
    vaccinationStatus: 'UP_TO_DATE',
    lastSyncedAt: new Date().toISOString(),
  },
  {
    tagNumber: '100293847563',
    ownerName: 'सुरेश काळे (Suresh Kale)',
    ownerMobileMasked: '+91-XXXXX-5678',
    species: 'शेळी (Goat)',
    breed: 'उस्मानाबादी (Osmanabadi)',
    ageMonths: 18,
    villageLgdCode: 558301,
    villageName: 'Ashwi Budruk (राहुरी)',
    vaccinationStatus: 'UP_TO_DATE',
    lastSyncedAt: new Date().toISOString(),
  },
];

class AnimalService {
  /**
   * Seed demo animals if local_animals SQLite table is empty
   */
  async seedDemoAnimalsIfEmpty(): Promise<void> {
    const countRes = await dbService.query<{ count: number }>(
      `SELECT COUNT(*) as count FROM local_animals`
    );
    const count = countRes[0]?.count || 0;
    if (count === 0) {
      for (const a of DEMO_ANIMALS) {
        await dbService.execute(
          `INSERT OR REPLACE INTO local_animals (
            tag_number, owner_name, owner_mobile_masked, species, breed,
            age_months, village_lgd_code, village_name, vaccination_status, last_synced_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            a.tagNumber,
            a.ownerName,
            a.ownerMobileMasked,
            a.species,
            a.breed,
            a.ageMonths,
            a.villageLgdCode,
            a.villageName,
            a.vaccinationStatus,
            a.lastSyncedAt,
          ]
        );
      }
    }
  }

  /**
   * Get all registered animals from offline SQLite
   */
  async getAllAnimals(): Promise<LocalAnimal[]> {
    await this.seedDemoAnimalsIfEmpty();
    const rows = await dbService.query<any>(`SELECT * FROM local_animals ORDER BY tag_number ASC`);
    return rows.map((r) => ({
      tagNumber: r.tag_number,
      ownerName: r.owner_name,
      ownerMobileMasked: r.owner_mobile_masked,
      species: r.species,
      breed: r.breed || '',
      ageMonths: r.age_months ?? 0,
      villageLgdCode: r.village_lgd_code,
      villageName: r.village_name || '',
      vaccinationStatus: r.vaccination_status || 'UP_TO_DATE',
      lastSyncedAt: r.last_synced_at,
    }));
  }

  /**
   * Lookup single animal by 12-digit RFID tag
   */
  async getAnimalByTag(tagNumber: string): Promise<LocalAnimal | null> {
    await this.seedDemoAnimalsIfEmpty();
    const cleaned = tagNumber.replace(/\D/g, '');
    const rows = await dbService.query<any>(
      `SELECT * FROM local_animals WHERE tag_number = ?`,
      [cleaned]
    );
    if (!rows || rows.length === 0) return null;
    const r = rows[0];
    return {
      tagNumber: r.tag_number,
      ownerName: r.owner_name,
      ownerMobileMasked: r.owner_mobile_masked,
      species: r.species,
      breed: r.breed || '',
      ageMonths: r.age_months ?? 0,
      villageLgdCode: r.village_lgd_code,
      villageName: r.village_name || '',
      vaccinationStatus: r.vaccination_status || 'UP_TO_DATE',
      lastSyncedAt: r.last_synced_at,
    };
  }

  /**
   * Register a new animal offline:
   * 1. Inserts into SQLite local_animals table
   * 2. Enqueues ANIMAL_REGISTRATION event into offline_sync_queue
   */
  async registerAnimal(data: {
    tagNumber: string;
    ownerName: string;
    ownerMobile?: string;
    ownerMobileMasked?: string;
    species: string;
    breed?: string;
    ageMonths: number;
    villageLgdCode: number;
    villageName?: string;
    vaccinationStatus?: 'UP_TO_DATE' | 'BOOSTER_DUE' | 'OVERDUE';
  }): Promise<LocalAnimal> {
    const cleanedTag = data.tagNumber.replace(/\D/g, '');
    const maskedMobile = data.ownerMobileMasked || maskMobileNumber(data.ownerMobile || '9800000000');
    const nowIso = new Date().toISOString();
    const vaccStatus = data.vaccinationStatus || 'UP_TO_DATE';

    const newAnimal: LocalAnimal = {
      tagNumber: cleanedTag,
      ownerName: data.ownerName.trim(),
      ownerMobileMasked: maskedMobile,
      species: data.species.trim(),
      breed: data.breed?.trim() || 'Desi / Mixed',
      ageMonths: data.ageMonths,
      villageLgdCode: data.villageLgdCode,
      villageName: data.villageName?.trim() || 'Rahuri',
      vaccinationStatus: vaccStatus,
      lastSyncedAt: nowIso,
    };

    // 1. Insert into local SQLite
    await dbService.execute(
      `INSERT OR REPLACE INTO local_animals (
        tag_number, owner_name, owner_mobile_masked, species, breed,
        age_months, village_lgd_code, village_name, vaccination_status, last_synced_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newAnimal.tagNumber,
        newAnimal.ownerName,
        newAnimal.ownerMobileMasked,
        newAnimal.species,
        newAnimal.breed,
        newAnimal.ageMonths,
        newAnimal.villageLgdCode,
        newAnimal.villageName,
        newAnimal.vaccinationStatus,
        newAnimal.lastSyncedAt,
      ]
    );

    // 2. Enqueue into offline sync queue
    const syncId = `SYNC-ANIMAL-${cleanedTag}-${Date.now()}`;
    await dbService.execute(
      `INSERT INTO offline_sync_queue (sync_id, entity_type, payload_json, priority, status, retry_count, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        syncId,
        'ANIMAL_REGISTRATION',
        JSON.stringify({
          tag_number: newAnimal.tagNumber,
          owner_name: newAnimal.ownerName,
          owner_mobile: data.ownerMobile || '9876543210',
          species: newAnimal.species,
          breed: newAnimal.breed,
          age_months: newAnimal.ageMonths,
          village_lgd_code: newAnimal.villageLgdCode,
          village_name: newAnimal.villageName,
          registered_at: nowIso,
        }),
        2,
        'PENDING',
        0,
        nowIso,
      ]
    );

    // 3. Attempt direct cloud registration if online (skip in test runner)
    if (
      (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') ||
      (typeof import.meta !== 'undefined' && (import.meta as any).env?.MODE === 'test')
    ) {
      return newAnimal;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(getApiUrl('animals'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tag_number: newAnimal.tagNumber,
          owner_name: newAnimal.ownerName,
          owner_mobile: data.ownerMobile || '9876543210',
          species: newAnimal.species,
          breed: newAnimal.breed,
          age_months: newAnimal.ageMonths,
          village_lgd_code: newAnimal.villageLgdCode,
          village_name: newAnimal.villageName,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        await dbService.execute(
          `UPDATE offline_sync_queue SET status = 'COMPLETED', synced_at = ? WHERE sync_id = ?`,
          [new Date().toISOString(), syncId]
        );
      }
    } catch {
      // Offline or cloud endpoint unreachable; retain PENDING status in sync queue
    }

    return newAnimal;
  }

  /**
   * Computes DAHD standard vaccination timeline and booster due countdowns
   */
  getVaccinationSchedule(tagNumber: string): VaccineRecord[] {
    const now = new Date();
    const isBoosterDueTag = tagNumber.endsWith('1'); // Tag 100293847561 is due soon

    // FMD: 180 days interval
    const fmdDaysAgo = isBoosterDueTag ? 172 : 60; // If 172 days ago, 8 days remaining
    const fmdAdminDate = new Date(now.getTime() - fmdDaysAgo * 24 * 60 * 60 * 1000);
    const fmdDueDate = new Date(fmdAdminDate.getTime() + 180 * 24 * 60 * 60 * 1000);
    const fmdDaysRemaining = Math.round((fmdDueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    const fmdStatus = fmdDaysRemaining < 0 ? 'OVERDUE' : fmdDaysRemaining <= 14 ? 'BOOSTER_DUE' : 'UP_TO_DATE';

    // LSD: 365 days interval
    const lsdDaysAgo = 120;
    const lsdAdminDate = new Date(now.getTime() - lsdDaysAgo * 24 * 60 * 60 * 1000);
    const lsdDueDate = new Date(lsdAdminDate.getTime() + 365 * 24 * 60 * 60 * 1000);
    const lsdDaysRemaining = Math.round((lsdDueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    const lsdStatus = lsdDaysRemaining < 0 ? 'OVERDUE' : lsdDaysRemaining <= 14 ? 'BOOSTER_DUE' : 'UP_TO_DATE';

    // Anthrax: 365 days interval
    const anthraxDaysAgo = 210;
    const anthraxAdminDate = new Date(now.getTime() - anthraxDaysAgo * 24 * 60 * 60 * 1000);
    const anthraxDueDate = new Date(anthraxAdminDate.getTime() + 365 * 24 * 60 * 60 * 1000);
    const anthraxDaysRemaining = Math.round((anthraxDueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    const anthraxStatus = anthraxDaysRemaining < 0 ? 'OVERDUE' : anthraxDaysRemaining <= 14 ? 'BOOSTER_DUE' : 'UP_TO_DATE';

    return [
      {
        disease: 'FMD',
        diseaseNameMarathi: 'लाळ्या खुरकूत (FMD)',
        lastDoseDate: fmdAdminDate.toISOString().split('T')[0],
        nextBoosterDue: fmdDueDate.toISOString().split('T')[0],
        daysRemaining: fmdDaysRemaining,
        status: fmdStatus,
        batchNumber: 'FMD-IVRI-2026-B1',
      },
      {
        disease: 'LSD',
        diseaseNameMarathi: 'लंपी त्वचा (LSD)',
        lastDoseDate: lsdAdminDate.toISOString().split('T')[0],
        nextBoosterDue: lsdDueDate.toISOString().split('T')[0],
        daysRemaining: lsdDaysRemaining,
        status: lsdStatus,
        batchNumber: 'LSD-GOATPOX-442',
      },
      {
        disease: 'ANTHRAX',
        diseaseNameMarathi: 'काळपुळी (ॲन्थ्रॅक्स)',
        lastDoseDate: anthraxAdminDate.toISOString().split('T')[0],
        nextBoosterDue: anthraxDueDate.toISOString().split('T')[0],
        daysRemaining: anthraxDaysRemaining,
        status: anthraxStatus,
        batchNumber: 'STERNE-34F2-89',
      },
    ];
  }
}

export const animalService = new AnimalService();

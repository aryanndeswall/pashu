import { describe, it, expect, beforeEach } from 'vitest';
import { dbService } from '../database/sqliteConnection';
import {
  animalService,
  formatTagNumber,
  maskMobileNumber,
} from '../services/animalService';

describe('AnimalService Offline Tests', () => {
  beforeEach(async () => {
    await dbService.initDatabase();
  });

  it('formats 12-digit tag numbers with hyphens', () => {
    expect(formatTagNumber('100293847561')).toBe('1002-9384-7561');
    expect(formatTagNumber('1002-9384-7561')).toBe('1002-9384-7561');
  });

  it('masks farmer phone numbers per DPDP Act', () => {
    expect(maskMobileNumber('9876549842')).toBe('+91-XXXXX-9842');
    expect(maskMobileNumber('+919876549842')).toBe('+91-XXXXX-9842');
  });

  it('seeds and retrieves demo animals from SQLite', async () => {
    await animalService.seedDemoAnimalsIfEmpty();
    const animals = await animalService.getAllAnimals();
    expect(animals.length).toBeGreaterThanOrEqual(3);

    const girCow = animals.find((a) => a.tagNumber === '100293847561');
    expect(girCow).toBeDefined();
    expect(girCow?.ownerName).toContain('Ramesh Patil');
    expect(girCow?.ownerMobileMasked).toBe('+91-XXXXX-9842');
    expect(girCow?.species).toContain('Cow');
    expect(girCow?.breed).toContain('Gir');
    expect(girCow?.vaccinationStatus).toBe('BOOSTER_DUE');
  });

  it('looks up animal by 12-digit tag number', async () => {
    const animal = await animalService.getAnimalByTag('100293847562');
    expect(animal).not.toBeNull();
    expect(animal?.breed).toContain('Murrah');
    expect(animal?.vaccinationStatus).toBe('UP_TO_DATE');

    const nonExistent = await animalService.getAnimalByTag('999999999999');
    expect(nonExistent).toBeNull();
  });

  it('registers a new animal offline and enqueues sync event', async () => {
    const newTag = '100293847599';
    const registered = await animalService.registerAnimal({
      tagNumber: newTag,
      ownerName: 'दत्तात्रय थोरात (Dattatraya Thorat)',
      ownerMobile: '9855512345',
      species: 'गाय (Cow)',
      breed: 'डांगी (Dangi)',
      ageMonths: 30,
      villageLgdCode: 558301,
      villageName: 'Ashwi Budruk',
    });

    expect(registered.tagNumber).toBe(newTag);
    expect(registered.ownerMobileMasked).toBe('+91-XXXXX-2345');

    // Verify stored in SQLite
    const fetched = await animalService.getAnimalByTag(newTag);
    expect(fetched).not.toBeNull();
    expect(fetched?.ownerName).toContain('Dattatraya Thorat');

    // Verify sync queue item
    const syncRows = await dbService.query<any>(
      `SELECT * FROM offline_sync_queue WHERE entity_type = 'ANIMAL_REGISTRATION'`
    );
    expect(syncRows.length).toBeGreaterThanOrEqual(1);
    const lastSync = syncRows[syncRows.length - 1];
    expect(lastSync.payload_json).toContain(newTag);
  });

  it('calculates DAHD vaccination booster schedules and alerts', () => {
    const scheduleDue = animalService.getVaccinationSchedule('100293847561');
    expect(scheduleDue).toHaveLength(3);

    const fmdDue = scheduleDue.find((v) => v.disease === 'FMD');
    expect(fmdDue).toBeDefined();
    expect(fmdDue?.diseaseNameMarathi).toBe('लाळ्या खुरकूत (FMD)');
    expect(fmdDue?.status).toBe('BOOSTER_DUE');
    expect(fmdDue?.daysRemaining).toBeLessThanOrEqual(14);

    const scheduleNormal = animalService.getVaccinationSchedule('100293847562');
    const fmdNormal = scheduleNormal.find((v) => v.disease === 'FMD');
    expect(fmdNormal?.status).toBe('UP_TO_DATE');
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { dbService } from '../database/sqliteConnection';
import { runMigrations, SCHEMA_STATEMENTS } from '../database/migrations';
import { seedLgdIfEmpty } from '../database/seedLgd';

describe('Offline SQLite Persistence & Migrations (APK-02)', () => {
  beforeEach(async () => {
    await dbService.initDatabase();
  });

  it('initializes the database service with correct parameters', () => {
    expect(dbService.isInitialized).toBe(true);
    expect(dbService.dbName).toBe('pashu_offline.db');
  });

  it('executes schema DDL migrations successfully', async () => {
    await expect(runMigrations(dbService)).resolves.not.toThrow();
  });

  it('seeds Maharashtra LGD village hierarchy from embedded JSON', async () => {
    await runMigrations(dbService);
    const count = await seedLgdIfEmpty(dbService);
    expect(count).toBeGreaterThanOrEqual(25);

    // Verify querying the seeded villages
    const villages = await dbService.query<any>('SELECT * FROM local_lgd_hierarchy');
    expect(villages.length).toBeGreaterThanOrEqual(25);

    // Verify specific high-risk sample districts
    const hasAhmednagar = villages.some((v) => v.district_name === 'Ahmednagar');
    const hasPune = villages.some((v) => v.district_name === 'Pune');
    const hasNashik = villages.some((v) => v.district_name === 'Nashik');

    expect(hasAhmednagar).toBe(true);
    expect(hasPune).toBe(true);
    expect(hasNashik).toBe(true);
  });

  it('inserts and queries syndromic events in offline_sync_queue without network', async () => {
    const syncId = `test_sync_${Date.now()}`;
    const testPayload = JSON.stringify({
      syndrome: 'VSS',
      species: 'Bovine',
      symptoms: ['oral_lesions', 'fever', 'salivation'],
    });

    const result = await dbService.execute(
      `INSERT INTO offline_sync_queue (sync_id, entity_type, payload_json, priority, status, retry_count, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [syncId, 'SYNDROMIC_INCIDENT', testPayload, 1, 'PENDING', 0, new Date().toISOString()]
    );

    expect(result).toBeDefined();

    const queueItems = await dbService.query<any>('SELECT * FROM offline_sync_queue');
    const insertedItem = queueItems.find((item) => item.sync_id === syncId);

    expect(insertedItem).toBeDefined();
    expect(insertedItem.entity_type).toBe('SYNDROMIC_INCIDENT');
    expect(insertedItem.status).toBe('PENDING');
  });
});

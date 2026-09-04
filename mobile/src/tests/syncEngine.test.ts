import { describe, it, expect, beforeEach } from 'vitest';
import { syncEngineService } from '../services/syncEngineService';
import { dbService } from '../database/sqliteConnection';

describe('syncEngineService - Two-Phase Delta Synchronization (SYNC-02, SYNC-03)', () => {
  beforeEach(async () => {
    await dbService.initDatabase();
    // Clear mock in-memory tables
    (dbService as any).memoryTables.set('offline_sync_queue', []);
    (dbService as any).memoryTables.set('media_sync_queue', []);
  });

  it('extractPhase1Payload strips heavy WebP and audio and keeps payload size <1.5 KB', () => {
    const rawRecord = {
      sync_id: 'SYNC-101',
      report_id: 'REP-101',
      syndrome_code: 'VSS',
      syndrome_name: 'तोंड आणि खुरांचे फोड',
      secondary_symptoms: ['oral_vesicles', 'hoof_lesions'],
      decision_tree_differential: 'Foot-and-Mouth Disease (FMD)',
      photo_webp: 'data:image/webp;base64,'.padEnd(50000, 'A'), // 50 KB fake base64
      photo_size_kb: 50,
      audio_base64: 'UklGRiQAAABXQVZF'.padEnd(20000, 'B'), // 20 KB fake audio
      audio_duration_sec: 15,
      latitude: 19.3912,
      longitude: 74.6521,
      lgd_code: 558301,
      village_name: 'Ashwi Budruk',
      district_name: 'Ahmednagar',
      pashu_aadhaar: '1234-5678-9012',
      priority: 2,
    };

    const phase1 = syncEngineService.extractPhase1Payload(rawRecord);

    expect((phase1 as any).photo_webp).toBeUndefined();
    expect((phase1 as any).audio_base64).toBeUndefined();
    expect(phase1.has_photo).toBe(true);
    expect(phase1.has_audio).toBe(true);

    const jsonString = JSON.stringify(phase1);
    expect(jsonString.length).toBeLessThan(1500); // Strictly < 1.5 KB!
  });

  it('enqueues report with relational split between telemetry and media tables', async () => {
    const syncId = 'SYNC-SPLIT-1';
    await syncEngineService.enqueueReportWithSplit(
      syncId,
      'SYNDROMIC_INCIDENT',
      {
        report_id: 'REP-SPLIT-1',
        syndrome_code: 'NSLS',
        photo_webp: 'data:image/webp;base64,ABC',
        photo_size_kb: 45,
        audio_base64: 'BASE64AUDIO',
        latitude: 19.39,
        longitude: 74.65,
        lgd_code: 558301,
      },
      2
    );

    const telemetryRows = await dbService.query('SELECT * FROM offline_sync_queue WHERE sync_id = ?', [syncId]);
    expect(telemetryRows.length).toBe(1);
    expect(telemetryRows[0].status).toBe('PENDING');

    const mediaRows = await dbService.query('SELECT * FROM media_sync_queue WHERE sync_id = ?', [syncId]);
    expect(mediaRows.length).toBe(2); // 1 photo, 1 audio
    expect(mediaRows[0].media_type).toBe('PHOTO_WEBP');
    expect(mediaRows[1].media_type).toBe('AUDIO_NOTE');
  });

  it('in 2G/EDGE network: syncs Phase 1 telemetry only, keeping media pending in SQLite', async () => {
    const syncId = 'SYNC-2G-TEST';
    await syncEngineService.enqueueReportWithSplit(
      syncId,
      'SYNDROMIC_INCIDENT',
      {
        report_id: 'REP-2G',
        syndrome_code: 'HSDS',
        photo_webp: 'data:image/webp;base64,XYZ',
        latitude: 19.39,
        longitude: 74.65,
      },
      3
    );

    const result = await syncEngineService.processSyncQueue('CELLULAR_2G_EDGE');
    expect(result.syncedPhase1).toBe(1);
    expect(result.syncedPhase2).toBe(0); // Binary media blocked on 2G

    // Telemetry status promoted to PHASE_1_SYNCED
    const telemetryRows = await dbService.query('SELECT * FROM offline_sync_queue WHERE sync_id = ?', [syncId]);
    expect(telemetryRows[0].status).toBe('PHASE_1_SYNCED');

    // Media status remains PENDING
    const mediaRows = await dbService.query('SELECT * FROM media_sync_queue WHERE sync_id = ?', [syncId]);
    expect(mediaRows[0].status).toBe('PENDING');
  });

  it('in WIFI network: flushes both Phase 1 and Phase 2 media to COMPLETED', async () => {
    const syncId = 'SYNC-WIFI-TEST';
    await syncEngineService.enqueueReportWithSplit(
      syncId,
      'SYNDROMIC_INCIDENT',
      {
        report_id: 'REP-WIFI',
        syndrome_code: 'VSS',
        photo_webp: 'data:image/webp;base64,PQR',
        latitude: 19.39,
        longitude: 74.65,
      },
      2
    );

    const result = await syncEngineService.processSyncQueue('WIFI');
    expect(result.syncedPhase1).toBe(1);
    expect(result.syncedPhase2).toBe(1);

    // Both completed
    const telemetryRows = await dbService.query('SELECT * FROM offline_sync_queue WHERE sync_id = ?', [syncId]);
    expect(telemetryRows[0].status).toBe('COMPLETED');
  });
});

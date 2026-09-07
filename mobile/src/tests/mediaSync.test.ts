import { describe, it, expect, beforeEach } from 'vitest';
import { dbService } from '../database/sqliteConnection';
import { syncEngineService } from '../services/syncEngineService';
import { mediaStorageClient } from '../services/mediaStorageClient';
import { MediaQueueItem, QueueItem } from '../types/sync';

describe('Phase 13: Firebase Cloud Storage & Resumable Media Sync Integration', () => {
  beforeEach(async () => {
    await dbService.initDatabase();
    if ((dbService as any).memoryTables) {
      (dbService as any).memoryTables.set('offline_sync_queue', []);
      (dbService as any).memoryTables.set('media_sync_queue', []);
    } else {
      await dbService.execute('DELETE FROM media_sync_queue');
      await dbService.execute('DELETE FROM offline_sync_queue');
    }
  });

  it('mediaStorageClient uploads media and returns canonical gs:// and HTTPS URIs', async () => {
    const mockItem: MediaQueueItem = {
      media_id: 'MED-TEST-PHOTO-01',
      sync_id: 'SYNC-REP-01',
      media_type: 'PHOTO_WEBP',
      media_data: 'data:image/webp;base64,UklGRmIAAABXRUJQVlA4WAoAAAAQAAA...',
      file_size_kb: 145,
      status: 'PENDING',
      created_at: new Date().toISOString(),
    };

    const result = await mediaStorageClient.uploadMedia(mockItem);
    expect(result.success).toBe(true);
    expect(result.media_id).toBe('MED-TEST-PHOTO-01');
    expect(result.sync_id).toBe('SYNC-REP-01');
    expect(result.gs_uri).toContain('gs://');
    expect(result.gs_uri).toContain('MED-TEST-PHOTO-01.webp');
    expect(result.https_url).toBeDefined();
  });

  it('enqueueReportWithSplit properly separates binary WebP photo and audio into media_sync_queue', async () => {
    const syncId = 'SYNC-SPLIT-999';
    const reportPayload = {
      report_id: 'REP-SPLIT-999',
      syndrome_code: 'NSLS',
      syndrome_name: 'Nodular Skin Lesion Syndrome',
      latitude: 19.39,
      longitude: 74.65,
      lgd_code: 558301,
      photo_webp: 'data:image/webp;base64,dGVzdF9pbWFnZQ==',
      photo_size_kb: 180,
      audio_base64: 'dGVzdF9hdWRpb19ub3Rl',
    };

    await syncEngineService.enqueueReportWithSplit(syncId, 'SYNDROMIC_INCIDENT', reportPayload, 2);

    // Verify offline_sync_queue contains lightweight JSON telemetry without huge base64 strings
    const telemetryRows = await dbService.query<QueueItem>(
      'SELECT * FROM offline_sync_queue WHERE sync_id = ?',
      [syncId]
    );
    expect(telemetryRows.length).toBe(1);
    expect(telemetryRows[0].status).toBe('PENDING');

    const parsedTelemetry = JSON.parse(telemetryRows[0].payload_json);
    expect(parsedTelemetry.has_photo).toBe(true);
    expect(parsedTelemetry.has_audio).toBe(true);
    expect(parsedTelemetry.photo_webp).toBeUndefined(); // base64 stripped from Phase 1

    // Verify media_sync_queue contains both media records
    const mediaRows = await dbService.query<MediaQueueItem>(
      'SELECT * FROM media_sync_queue WHERE sync_id = ?',
      [syncId]
    );
    expect(mediaRows.length).toBe(2);
    expect(mediaRows.some((m) => m.media_type === 'PHOTO_WEBP')).toBe(true);
    expect(mediaRows.some((m) => m.media_type === 'AUDIO_NOTE')).toBe(true);
  });

  it('processSyncQueue on 2G/EDGE holds media queue in PENDING and flushes telemetry only', async () => {
    const syncId = 'SYNC-2G-TEST';
    const payload = {
      report_id: 'REP-2G-01',
      syndrome_code: 'VSS',
      photo_webp: 'data:image/webp;base64,c2FtcGxl',
      photo_size_kb: 120,
    };

    await syncEngineService.enqueueReportWithSplit(syncId, 'SYNDROMIC_INCIDENT', payload, 2);

    // Process on 2G/EDGE tier
    const syncResult = await syncEngineService.processSyncQueue('CELLULAR_2G_EDGE');
    expect(syncResult.syncedPhase1).toBe(1);
    expect(syncResult.syncedPhase2).toBe(0); // Media held back on 2G

    // Telemetry is PHASE_1_SYNCED (waiting for Phase 2 media)
    const telemetryRows = await dbService.query<QueueItem>(
      'SELECT * FROM offline_sync_queue WHERE sync_id = ?',
      [syncId]
    );
    expect(telemetryRows[0].status).toBe('PHASE_1_SYNCED');

    // Media item remains PENDING
    const mediaRows = await dbService.query<MediaQueueItem>(
      'SELECT * FROM media_sync_queue WHERE sync_id = ?',
      [syncId]
    );
    expect(mediaRows[0].status).toBe('PENDING');
  });

  it('processSyncQueue on 4G/Wi-Fi flushes media queue and updates gs_uri and https_url in SQLite', async () => {
    const syncId = 'SYNC-4G-TEST';
    const payload = {
      report_id: 'REP-4G-01',
      syndrome_code: 'HSDS',
      photo_webp: 'data:image/webp;base64,c2FtcGxl',
      photo_size_kb: 140,
    };

    await syncEngineService.enqueueReportWithSplit(syncId, 'SYNDROMIC_INCIDENT', payload, 3);

    // Process on 4G
    const syncResult = await syncEngineService.processSyncQueue('CELLULAR_4G_5G');
    expect(syncResult.syncedPhase1).toBe(1);
    expect(syncResult.syncedPhase2).toBe(1);

    // Verify media_sync_queue was updated with COMPLETED and cloud URLs
    const mediaRows = await dbService.query<MediaQueueItem>(
      'SELECT * FROM media_sync_queue WHERE sync_id = ?',
      [syncId]
    );
    expect(mediaRows[0].status).toBe('COMPLETED');
    expect(mediaRows[0].gs_uri).toContain('gs://');
    expect(mediaRows[0].https_url).toBeDefined();

    // Verify parent telemetry queue is now COMPLETED
    const telemetryRows = await dbService.query<QueueItem>(
      'SELECT * FROM offline_sync_queue WHERE sync_id = ?',
      [syncId]
    );
    expect(telemetryRows[0].status).toBe('COMPLETED');
  });
});

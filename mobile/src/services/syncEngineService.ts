import { dbService } from '../database/sqliteConnection';
import {
  NetworkTier,
  Phase1TelemetryPayload,
  QueueItem,
  MediaQueueItem,
  SyncResult,
} from '../types/sync';

// ponytail: Two-Phase delta sync engine with relational split between telemetry and media
class SyncEngineService {
  /**
   * Separate heavy media from telemetry payload and enqueue into SQLite
   */
  async enqueueReportWithSplit(
    syncId: string,
    entityType: string,
    payload: any,
    priority: number = 2
  ): Promise<void> {
    const hasPhoto = Boolean(payload.photo_webp);
    const hasAudio = Boolean(payload.audio_base64);

    // 1. Enqueue Phase 2 binary media into media_sync_queue
    if (hasPhoto) {
      const mediaId = `MED-P-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await dbService.execute(
        `INSERT INTO media_sync_queue (media_id, sync_id, media_type, media_data, file_size_kb, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          mediaId,
          syncId,
          'PHOTO_WEBP',
          payload.photo_webp,
          payload.photo_size_kb || 150,
          'PENDING',
          new Date().toISOString(),
        ]
      );
    }

    if (hasAudio) {
      const mediaId = `MED-A-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await dbService.execute(
        `INSERT INTO media_sync_queue (media_id, sync_id, media_type, media_data, file_size_kb, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          mediaId,
          syncId,
          'AUDIO_NOTE',
          payload.audio_base64,
          Math.round((payload.audio_base64.length * 0.75) / 1024),
          'PENDING',
          new Date().toISOString(),
        ]
      );
    }

    // 2. Extract Phase 1 lightweight telemetry (<1.5 KB) and enqueue into offline_sync_queue
    const telemetryPayload = this.extractPhase1Payload({ ...payload, sync_id: syncId });
    await dbService.execute(
      `INSERT INTO offline_sync_queue (sync_id, entity_type, payload_json, priority, status, retry_count, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        syncId,
        entityType,
        JSON.stringify(telemetryPayload),
        priority,
        'PENDING',
        0,
        new Date().toISOString(),
      ]
    );
  }

  /**
   * Strips large base64 binaries to guarantee <1.5 KB Phase 1 telemetry payload
   */
  extractPhase1Payload(raw: any): Phase1TelemetryPayload {
    return {
      sync_id: raw.sync_id || raw.report_id || `SYNC-${Date.now()}`,
      report_id: raw.report_id || `REP-${Date.now()}`,
      syndrome_code: raw.syndrome_code || 'VSS',
      syndrome_name: raw.syndrome_name || '',
      secondary_symptoms: raw.secondary_symptoms || [],
      decision_tree_differential: raw.decision_tree_differential || null,
      latitude: raw.latitude ?? 19.3912,
      longitude: raw.longitude ?? 74.6521,
      lgd_code: raw.lgd_code || 558301,
      village_name: raw.village_name || 'Ashwi Budruk',
      district_name: raw.district_name || 'Ahmednagar',
      pashu_aadhaar: raw.pashu_aadhaar || 'UNTAGGED',
      reported_at: raw.reported_at || new Date().toISOString(),
      has_photo: Boolean(raw.photo_webp || raw.has_photo),
      has_audio: Boolean(raw.audio_base64 || raw.has_audio),
      priority: raw.priority ?? 2,
    };
  }

  /**
   * Process sync queue respecting network constraints
   * 2G/EDGE: Flushes Phase 1 JSON Telemetry only.
   * 4G/Wi-Fi: Flushes Phase 1 JSON Telemetry AND Phase 2 Binary Media.
   */
  async processSyncQueue(currentTier: NetworkTier): Promise<SyncResult> {
    if (currentTier === 'OFFLINE') {
      return { syncedPhase1: 0, syncedPhase2: 0, failed: 0 };
    }

    let syncedPhase1 = 0;
    let syncedPhase2 = 0;
    let failed = 0;

    try {
      // 1. Fetch pending telemetry records (Priority 3 first)
      const telemetryRows = await dbService.query<QueueItem>(
        `SELECT * FROM offline_sync_queue WHERE status != 'COMPLETED' ORDER BY priority DESC, created_at ASC`
      );

      for (const item of telemetryRows) {
        if (item.status === 'PENDING') {
          // Send Phase 1 telemetry (simulated HTTP API call for Phase 5)
          const success = await this.mockUploadEndpoint('/api/v1/sync/telemetry', item.payload_json);
          if (success) {
            syncedPhase1++;
            // Check if there is associated media
            const mediaRows = await dbService.query<MediaQueueItem>(
              `SELECT * FROM media_sync_queue WHERE sync_id = ?`,
              [item.sync_id]
            );

            if (mediaRows.length === 0) {
              await dbService.execute(
                `UPDATE offline_sync_queue SET status = ?, synced_at = ? WHERE sync_id = ?`,
                ['COMPLETED', new Date().toISOString(), item.sync_id]
              );
            } else {
              await dbService.execute(
                `UPDATE offline_sync_queue SET status = ? WHERE sync_id = ?`,
                ['PHASE_1_SYNCED', item.sync_id]
              );
            }
          } else {
            failed++;
            await dbService.execute(
              `UPDATE offline_sync_queue SET status = 'FAILED_RETRY', retry_count = retry_count + 1 WHERE sync_id = ?`,
              [item.sync_id]
            );
          }
        }
      }

      // 2. Fetch pending media records ONLY if network is 4G/5G or Wi-Fi
      if (currentTier === 'CELLULAR_4G_5G' || currentTier === 'WIFI') {
        const mediaRows = await dbService.query<MediaQueueItem>(
          `SELECT * FROM media_sync_queue WHERE status != 'COMPLETED'`
        );

        for (const media of mediaRows) {
          const success = await this.mockUploadEndpoint('/api/v1/sync/media', {
            media_id: media.media_id,
            sync_id: media.sync_id,
          });

          if (success) {
            syncedPhase2++;
            await dbService.execute(
              `UPDATE media_sync_queue SET status = ?, synced_at = ? WHERE sync_id = ?`,
              ['COMPLETED', new Date().toISOString(), media.sync_id]
            );

            // Check if all media for this sync_id are completed
            const remainingMedia = await dbService.query<MediaQueueItem>(
              `SELECT * FROM media_sync_queue WHERE sync_id = ? AND status != 'COMPLETED'`,
              [media.sync_id]
            );

            if (remainingMedia.length === 0) {
              await dbService.execute(
                `UPDATE offline_sync_queue SET status = ?, synced_at = ? WHERE sync_id = ?`,
                ['COMPLETED', new Date().toISOString(), media.sync_id]
              );
            }
          } else {
            failed++;
          }
        }
      }
    } catch (err) {
      console.error('Error processing sync queue:', err);
    }

    return { syncedPhase1, syncedPhase2, failed };
  }

  // ponytail: lean mock HTTP adapter for standalone mobile offline verification
  private async mockUploadEndpoint(_endpoint: string, _data: any): Promise<boolean> {
    return new Promise((resolve) => setTimeout(() => resolve(true), 25));
  }
}

export const syncEngineService = new SyncEngineService();

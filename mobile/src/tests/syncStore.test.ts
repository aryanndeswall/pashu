import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSyncStore } from '../store/syncStore';
import { dbService } from '../database/sqliteConnection';
import { networkService } from '../services/networkService';

describe('useSyncStore (SYNC-01, SYNC-02)', () => {
  beforeEach(async () => {
    await dbService.initDatabase();
    (dbService as any).memoryTables.set('offline_sync_queue', []);
    (dbService as any).memoryTables.set('media_sync_queue', []);
    vi.clearAllMocks();
  });

  it('initializes network tier and empty queue on initSyncStore', async () => {
    networkService.setSimulatedNetwork('WIFI');
    await useSyncStore.getState().initSyncStore();

    const state = useSyncStore.getState();
    expect(state.networkTier).toBe('WIFI');
    expect(state.pendingCount).toBe(0);
    expect(state.phase1SyncedCount).toBe(0);
    expect(state.completedCount).toBe(0);
  });

  it('refreshQueue calculates pending and phase1Synced counts accurately', async () => {
    await dbService.execute(
      `INSERT INTO offline_sync_queue (sync_id, entity_type, payload_json, priority, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['SYNC-1', 'SYNDROMIC_INCIDENT', JSON.stringify({ syndrome_code: 'VSS' }), 2, 'PENDING', new Date().toISOString()]
    );
    await dbService.execute(
      `INSERT INTO offline_sync_queue (sync_id, entity_type, payload_json, priority, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['SYNC-2', 'SYNDROMIC_INCIDENT', JSON.stringify({ syndrome_code: 'NSLS' }), 2, 'PHASE_1_SYNCED', new Date().toISOString()]
    );

    await useSyncStore.getState().refreshQueue();

    const state = useSyncStore.getState();
    expect(state.pendingCount).toBe(1);
    expect(state.phase1SyncedCount).toBe(1);
    expect(state.queueItems.length).toBe(2);
  });

  it('triggerSync flushes queue and updates lastSyncedAt', async () => {
    networkService.setSimulatedNetwork('WIFI');
    useSyncStore.setState({ networkTier: 'WIFI' });

    await dbService.execute(
      `INSERT INTO offline_sync_queue (sync_id, entity_type, payload_json, priority, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['SYNC-FLUSH', 'SYNDROMIC_INCIDENT', JSON.stringify({ syndrome_code: 'VSS' }), 2, 'PENDING', new Date().toISOString()]
    );

    await useSyncStore.getState().triggerSync();

    const state = useSyncStore.getState();
    expect(state.lastSyncedAt).toBeDefined();
    expect(state.pendingCount).toBe(0);
  });
});

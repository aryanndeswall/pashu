import { create } from 'zustand';
import { networkService } from '../services/networkService';
import { syncEngineService } from '../services/syncEngineService';
import { dbService } from '../database/sqliteConnection';
import { hapticsService } from '../services/hapticsService';
import { NetworkTier, QueueItem } from '../types/sync';

interface SyncStoreState {
  networkTier: NetworkTier;
  isSyncing: boolean;
  pendingCount: number;
  phase1SyncedCount: number;
  completedCount: number;
  queueItems: QueueItem[];
  lastSyncedAt: string | null;
  isDrawerOpen: boolean;

  initSyncStore: () => Promise<void>;
  refreshQueue: () => Promise<void>;
  triggerSync: () => Promise<void>;
  setDrawerOpen: (isOpen: boolean) => void;
  setSimulatedNetworkTier: (tier: NetworkTier | null) => void;
}

// ponytail: lean event-driven sync store with automatic reconnection triggers
export const useSyncStore = create<SyncStoreState>((set, get) => ({
  networkTier: 'OFFLINE',
  isSyncing: false,
  pendingCount: 0,
  phase1SyncedCount: 0,
  completedCount: 0,
  queueItems: [],
  lastSyncedAt: null,
  isDrawerOpen: false,

  initSyncStore: async () => {
    // 1. Initial network status
    const initialTier = await networkService.getNetworkState();
    set({ networkTier: initialTier });

    // 2. Initial queue refresh
    await get().refreshQueue();

    // 3. Listen to network changes
    networkService.onNetworkChange(async (newTier) => {
      const prevTier = get().networkTier;
      set({ networkTier: newTier });

      // Event-driven auto-sync: Reconnecting from offline to online triggers sync
      if (prevTier === 'OFFLINE' && newTier !== 'OFFLINE') {
        await get().triggerSync();
      }
    });
  },

  refreshQueue: async () => {
    try {
      const rows = await dbService.query<QueueItem>(
        `SELECT * FROM offline_sync_queue ORDER BY priority DESC, created_at DESC`
      );

      const pending = rows.filter((r) => r.status === 'PENDING').length;
      const phase1 = rows.filter((r) => r.status === 'PHASE_1_SYNCED').length;
      const completed = rows.filter((r) => r.status === 'COMPLETED').length;

      set({
        queueItems: rows,
        pendingCount: pending,
        phase1SyncedCount: phase1,
        completedCount: completed,
      });
    } catch (err) {
      console.error('Failed to refresh sync queue:', err);
    }
  },

  triggerSync: async () => {
    const { networkTier, isSyncing } = get();
    if (networkTier === 'OFFLINE' || isSyncing) return;

    set({ isSyncing: true });
    await hapticsService.hapticLight();

    try {
      await syncEngineService.processSyncQueue(networkTier);
      await get().refreshQueue();
      set({ lastSyncedAt: new Date().toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' }) });
      await hapticsService.hapticMedium();
    } catch (err) {
      console.error('Error during synchronization:', err);
    } finally {
      set({ isSyncing: false });
    }
  },

  setDrawerOpen: (isOpen: boolean) => set({ isDrawerOpen: isOpen }),

  setSimulatedNetworkTier: (tier: NetworkTier | null) => {
    networkService.setSimulatedNetwork(tier);
    if (tier) set({ networkTier: tier });
  },
}));

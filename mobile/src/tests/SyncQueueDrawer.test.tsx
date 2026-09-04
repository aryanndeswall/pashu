import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SyncQueueDrawer } from '../components/sync/SyncQueueDrawer';
import { useSyncStore } from '../store/syncStore';
import { smsFallbackService } from '../services/smsFallbackService';

// Mock hapticsService
vi.mock('../services/hapticsService', () => ({
  hapticsService: {
    hapticLight: vi.fn().mockResolvedValue(undefined),
    hapticMedium: vi.fn().mockResolvedValue(undefined),
    hapticError: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('SyncQueueDrawer Component (SYNC-01, SYNC-02, SYNC-03)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSyncStore.setState({
      networkTier: 'WIFI',
      isSyncing: false,
      pendingCount: 1,
      phase1SyncedCount: 0,
      completedCount: 0,
      queueItems: [
        {
          sync_id: 'SYNC-DRAWER-1',
          entity_type: 'SYNDROMIC_INCIDENT',
          payload_json: JSON.stringify({
            syndrome_code: 'VSS',
            syndrome_name: 'तोंड आणि खुरांचे फोड',
            village_name: 'Ashwi Budruk',
          }),
          priority: 2,
          status: 'PENDING',
          retry_count: 0,
          created_at: new Date().toISOString(),
        },
      ],
      lastSyncedAt: null,
      isDrawerOpen: true,
    });
  });

  it('renders drawer with network status, metric counters, and pending queue item', () => {
    render(<SyncQueueDrawer />);

    expect(screen.getByText(/ऑफलाइन सिंक रांग \(Sync Queue\)/i)).toBeInTheDocument();
    expect(screen.getByText(/वाय-फाय \(हाय-स्पीड\)/i)).toBeInTheDocument();
    expect(screen.getByText(/तोंड आणि खुरांचे फोड/i)).toBeInTheDocument();
    expect(screen.getByText(/गाव: Ashwi Budruk/i)).toBeInTheDocument();
    expect(screen.getByText(/Phase 1 प्रलंबित/i)).toBeInTheDocument();
  });

  it('triggers synchronization upon clicking Sync Now button', () => {
    const triggerSyncSpy = vi.spyOn(useSyncStore.getState(), 'triggerSync');

    render(<SyncQueueDrawer />);

    const syncBtn = screen.getByRole('button', { name: /आताच सर्व समक्रमित करा/i });
    fireEvent.click(syncBtn);

    expect(triggerSyncSpy).toHaveBeenCalled();
  });

  it('renders 1-tap SMS fallback button for Priority 3 Anthrax biohazard reports', () => {
    useSyncStore.setState({
      queueItems: [
        {
          sync_id: 'SYNC-BIO-1',
          entity_type: 'IDSP_ZOONOTIC_EMERGENCY',
          payload_json: JSON.stringify({
            syndrome_code: 'HSDS',
            syndrome_name: 'काळपुळी (ॲन्थ्रॅक्स)',
            village_name: 'Sakur',
            lgd_code: 558302,
            latitude: 19.45,
            longitude: 74.55,
          }),
          priority: 3,
          status: 'PENDING',
          retry_count: 0,
          created_at: new Date().toISOString(),
        },
      ],
    });

    const smsGenSpy = vi.spyOn(smsFallbackService, 'generateSmsEmergencyPayload');

    render(<SyncQueueDrawer />);

    expect(screen.getByText(/P3 Biohazard/i)).toBeInTheDocument();
    const smsBtn = screen.getByRole('button', { name: /१९६२ ला SMS पाठवा/i });
    expect(smsBtn).toBeInTheDocument();

    fireEvent.click(smsBtn);
    expect(smsGenSpy).toHaveBeenCalled();
  });
});

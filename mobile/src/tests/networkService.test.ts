import { describe, it, expect, vi, beforeEach } from 'vitest';
import { networkService } from '../services/networkService';
import { Network } from '@capacitor/network';

vi.mock('@capacitor/network', () => ({
  Network: {
    getStatus: vi.fn().mockResolvedValue({ connected: true, connectionType: 'wifi' }),
    addListener: vi.fn().mockReturnValue({ remove: vi.fn() }),
  },
}));

describe('networkService - 4-Tier Network Classification (SYNC-01)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    networkService.setSimulatedNetwork(null);
  });

  it('maps connectionType wifi to WIFI tier', async () => {
    vi.mocked(Network.getStatus).mockResolvedValueOnce({ connected: true, connectionType: 'wifi' });
    const tier = await networkService.getNetworkState();
    expect(tier).toBe('WIFI');
    expect(await networkService.isOnline()).toBe(true);
  });

  it('maps connected=false to OFFLINE tier', async () => {
    vi.mocked(Network.getStatus).mockResolvedValue({ connected: false, connectionType: 'none' });
    const tier = await networkService.getNetworkState();
    expect(tier).toBe('OFFLINE');
    expect(await networkService.isOnline()).toBe(false);
  });

  it('supports simulated network tier and notifies listeners', async () => {
    const listener = vi.fn();
    const unsubscribe = networkService.onNetworkChange(listener);

    networkService.setSimulatedNetwork('CELLULAR_2G_EDGE');
    expect(listener).toHaveBeenCalledWith('CELLULAR_2G_EDGE');

    const tier = await networkService.getNetworkState();
    expect(tier).toBe('CELLULAR_2G_EDGE');

    unsubscribe();
    networkService.setSimulatedNetwork(null);
  });
});

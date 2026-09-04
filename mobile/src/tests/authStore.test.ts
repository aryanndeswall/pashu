import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore, DEMO_PERSONAS } from '../store/authStore';
import { dbService } from '../database/sqliteConnection';

// Mock hapticsService
vi.mock('../services/hapticsService', () => ({
  hapticsService: {
    hapticLight: vi.fn().mockResolvedValue(undefined),
    hapticMedium: vi.fn().mockResolvedValue(undefined),
    hapticError: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('useAuthStore & SQLite Offline Session', () => {
  beforeEach(async () => {
    await dbService.initDatabase();
    useAuthStore.setState({
      activeRole: 'consumer',
      userProfile: DEMO_PERSONAS.consumer,
      isInitialized: false,
    });
    vi.clearAllMocks();
  });

  it('initializes with default consumer persona (Ramesh Patil)', () => {
    const state = useAuthStore.getState();
    expect(state.activeRole).toBe('consumer');
    expect(state.userProfile.nameMarathi).toBe('रमेश पाटील');
    expect(state.userProfile.block).toBe('Rahuri Khurd');
  });

  it('switches role to doctor and updates activeRole and profile', async () => {
    await useAuthStore.getState().switchRole('doctor');

    const state = useAuthStore.getState();
    expect(state.activeRole).toBe('doctor');
    expect(state.userProfile.nameMarathi).toBe('डॉ. अंजली देशमुख');
    expect(state.userProfile.licenseOrId).toBe('MH-VET-2024-8819');
  });

  it('switches role to admin and updates activeRole and profile', async () => {
    await useAuthStore.getState().switchRole('admin');

    const state = useAuthStore.getState();
    expect(state.activeRole).toBe('admin');
    expect(state.userProfile.nameMarathi).toBe('डॉ. एस. के. कुलकर्णी');
    expect(state.userProfile.licenseOrId).toBe('DVO-AHM-001');
  });

  it('persists session to SQLite and restores upon initSession', async () => {
    // Switch to admin
    await useAuthStore.getState().switchRole('admin');

    // Reset Zustand state to consumer simulating app reload
    useAuthStore.setState({
      activeRole: 'consumer',
      userProfile: DEMO_PERSONAS.consumer,
      isInitialized: false,
    });

    // Call initSession
    await useAuthStore.getState().initSession();

    // Verify it restored admin from SQLite
    const restored = useAuthStore.getState();
    expect(restored.activeRole).toBe('admin');
    expect(restored.userProfile.nameMarathi).toBe('डॉ. एस. के. कुलकर्णी');
    expect(restored.isInitialized).toBe(true);
  });
});

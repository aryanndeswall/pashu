import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { useNavigationStore } from '../store/navigationStore';
import { useAuthStore, DEMO_PERSONAS } from '../store/authStore';
import { BottomBar } from '../components/navigation/BottomBar';
import { SOSButton } from '../components/navigation/SOSButton';
import { hapticsService } from '../services/hapticsService';

// Mock hapticsService
vi.mock('../services/hapticsService', () => ({
  hapticsService: {
    hapticLight: vi.fn().mockResolvedValue(undefined),
    hapticMedium: vi.fn().mockResolvedValue(undefined),
    hapticError: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('Navigation Shell & Ergonomics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      activeRole: 'doctor',
      userProfile: DEMO_PERSONAS.doctor,
    });
    useNavigationStore.setState({
      activeTab: 'report',
      isEmergencyModalOpen: false,
      isDarkMode: false,
    });
  });

  it('initializes with Report as the default active tab in Sunlight mode', () => {
    const state = useNavigationStore.getState();
    expect(state.activeTab).toBe('report');
    expect(state.isDarkMode).toBe(false);
    expect(state.isEmergencyModalOpen).toBe(false);
  });

  it('renders all 4 tabs and the elevated center SOS button for doctor role', () => {
    render(<BottomBar />);

    expect(screen.getByText('८ लक्षणे')).toBeDefined();
    expect(screen.getByText('डॅशबोर्ड')).toBeDefined();
    expect(screen.getByText('पशु आधार')).toBeDefined();
    expect(screen.getByText('प्रयोगशाळा')).toBeDefined();

    const sosBtn = screen.getByLabelText(/Emergency Outbreak Alert/i);
    expect(sosBtn).toBeDefined();
  });

  it('switches tabs and triggers light haptic feedback upon click', async () => {
    render(<BottomBar />);

    const dashboardTab = screen.getByText('डॅशबोर्ड').closest('button');
    expect(dashboardTab).not.toBeNull();

    if (dashboardTab) {
      await fireEvent.click(dashboardTab);
    }

    expect(hapticsService.hapticLight).toHaveBeenCalledTimes(1);
    expect(useNavigationStore.getState().activeTab).toBe('dashboard');
  });

  it('clicking the SOS button triggers error haptic feedback and opens emergency modal', async () => {
    render(<SOSButton />);

    const sosButton = screen.getByRole('button', { name: /Emergency Outbreak Alert/i });
    await fireEvent.click(sosButton);

    expect(hapticsService.hapticError).toHaveBeenCalledTimes(1);
    expect(useNavigationStore.getState().isEmergencyModalOpen).toBe(true);
  });

  it('enforces 52px minimum touch target on interactive navigation buttons', () => {
    render(<BottomBar />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => {
      expect(btn.className).toContain('field-touch-target');
    });
  });
});

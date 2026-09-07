import { describe, it, expect, beforeEach, vi } from 'vitest';
import { liveAlertService, OutbreakAlert } from '../services/liveAlertService';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { RealtimeAlertBanner } from '../components/common/RealtimeAlertBanner';
import { useNavigationStore } from '../store/navigationStore';

vi.mock('../services/hapticsService', () => ({
  hapticsService: {
    hapticLight: vi.fn().mockResolvedValue(undefined),
    hapticMedium: vi.fn().mockResolvedValue(undefined),
    hapticWarning: vi.fn().mockResolvedValue(undefined),
    hapticError: vi.fn().mockResolvedValue(undefined),
    triggerSelection: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('Real-Time Biosecurity Outbreak Alert Stream Service (CLOUD-05)', () => {
  const sampleAlert: OutbreakAlert = {
    eventId: 'EVT-TEST-001',
    clusterId: 'CLS-TEST-FMD-01',
    syndromeCode: 'VSS',
    suspectedDisease: 'Foot & Mouth Disease (FMD) / लाळ्या खुरकूत',
    epicenterLat: 19.3912,
    epicenterLon: 74.6521,
    villageName: 'Ashwi Budruk',
    districtName: 'Ahmednagar',
    movementFreezeRadiusKm: 1.0,
    ringVaccinationRadiusKm: 5.0,
    surveillanceRadiusKm: 10.0,
    alertLevel: 'CRITICAL',
    containmentDirective: 'Automated 1 km biosecurity movement freeze initiated.',
    timestamp: new Date().toISOString(),
  };

  beforeEach(() => {
    liveAlertService.clearAll();
  });

  it('initially has no active alerts', () => {
    expect(liveAlertService.getActiveAlerts()).toEqual([]);
  });

  it('adds outbreak alert and notifies subscriber callbacks', () => {
    const listener = vi.fn();
    const unsubscribe = liveAlertService.subscribe(listener);

    // Initial subscribe call
    expect(listener).toHaveBeenCalledWith([]);

    liveAlertService.addAlert(sampleAlert);

    expect(liveAlertService.getActiveAlerts()).toHaveLength(1);
    expect(liveAlertService.getActiveAlerts()[0].clusterId).toBe('CLS-TEST-FMD-01');
    expect(listener).toHaveBeenCalledWith([sampleAlert]);

    unsubscribe();
  });

  it('prevents duplicate alerts with the same eventId or clusterId', () => {
    liveAlertService.addAlert(sampleAlert);
    liveAlertService.addAlert({ ...sampleAlert, eventId: 'EVT-DUPLICATE' }); // same clusterId

    expect(liveAlertService.getActiveAlerts()).toHaveLength(1);
  });

  it('dismisses specific alert by eventId', () => {
    liveAlertService.addAlert(sampleAlert);
    expect(liveAlertService.getActiveAlerts()).toHaveLength(1);

    liveAlertService.dismissAlert('EVT-TEST-001');
    expect(liveAlertService.getActiveAlerts()).toHaveLength(0);
  });

  it('clears all alerts upon reset', () => {
    liveAlertService.addAlert(sampleAlert);
    liveAlertService.clearAll();
    expect(liveAlertService.getActiveAlerts()).toEqual([]);
  });
});

describe('RealtimeAlertBanner Component', () => {
  beforeEach(() => {
    liveAlertService.clearAll();
  });

  it('renders nothing when there are no active outbreak alerts', () => {
    const { container } = render(<RealtimeAlertBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('renders critical hazard alert banner when outbreak alert is received', () => {
    act(() => {
      liveAlertService.addAlert({
        eventId: 'EVT-UI-01',
        clusterId: 'CLS-UI-ANTHRAX',
        syndromeCode: 'SARF',
        suspectedDisease: 'Anthrax / काळपुळी',
        epicenterLat: 19.45,
        epicenterLon: 74.70,
        villageName: 'Rahuri Khurd',
        districtName: 'Ahmednagar',
        movementFreezeRadiusKm: 1.0,
        ringVaccinationRadiusKm: 5.0,
        surveillanceRadiusKm: 10.0,
        alertLevel: 'CRITICAL',
        containmentDirective: 'Immediate Carcass Lockdown & Movement Freeze Citing PCICDA 2009',
        timestamp: new Date().toISOString(),
      });
    });

    render(<RealtimeAlertBanner />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/CRITICAL BIOSECURITY ORDER/i)).toBeInTheDocument();
    expect(screen.getByText(/Anthrax \/ काळपुळी/i)).toBeInTheDocument();
    expect(screen.getByText(/Rahuri Khurd/i)).toBeInTheDocument();
  });

  it('dismisses banner when close button is clicked', async () => {
    act(() => {
      liveAlertService.addAlert({
        eventId: 'EVT-DISMISS-01',
        clusterId: 'CLS-DISMISS-01',
        syndromeCode: 'NSLS',
        suspectedDisease: 'Lumpy Skin Disease (LSD)',
        epicenterLat: 19.45,
        epicenterLon: 74.70,
        villageName: 'Loni',
        districtName: 'Ahmednagar',
        movementFreezeRadiusKm: 1.0,
        ringVaccinationRadiusKm: 5.0,
        surveillanceRadiusKm: 10.0,
        alertLevel: 'CRITICAL',
        containmentDirective: 'Biosecurity freeze active',
        timestamp: new Date().toISOString(),
      });
    });

    render(<RealtimeAlertBanner />);

    const closeBtn = screen.getByRole('button', { name: /dismiss biosecurity alert/i });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  it('navigates to dashboard tab when Command Map action is clicked', async () => {
    const setActiveTab = vi.spyOn(useNavigationStore.getState(), 'setActiveTab');

    act(() => {
      liveAlertService.addAlert({
        eventId: 'EVT-MAP-01',
        clusterId: 'CLS-MAP-01',
        syndromeCode: 'VSS',
        suspectedDisease: 'FMD',
        epicenterLat: 19.45,
        epicenterLon: 74.70,
        villageName: 'Ashwi',
        districtName: 'Ahmednagar',
        movementFreezeRadiusKm: 1.0,
        ringVaccinationRadiusKm: 5.0,
        surveillanceRadiusKm: 10.0,
        alertLevel: 'WARNING',
        containmentDirective: 'Cluster notice',
        timestamp: new Date().toISOString(),
      });
    });

    render(<RealtimeAlertBanner />);

    const mapBtn = screen.getByRole('button', { name: /command map/i });
    fireEvent.click(mapBtn);

    await waitFor(() => {
      expect(setActiveTab).toHaveBeenCalledWith('dashboard');
    });
  });
});

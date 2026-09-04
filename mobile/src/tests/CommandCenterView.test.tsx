import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DashboardView } from '../views/DashboardView';
import { useAuthStore, DEMO_PERSONAS } from '../store/authStore';

// Mock hapticsService
vi.mock('../services/hapticsService', () => ({
  hapticsService: {
    triggerSelection: vi.fn().mockResolvedValue(undefined),
    triggerNotification: vi.fn().mockResolvedValue(undefined),
    triggerError: vi.fn().mockResolvedValue(undefined),
    hapticLight: vi.fn().mockResolvedValue(undefined),
    hapticMedium: vi.fn().mockResolvedValue(undefined),
    hapticError: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('Web-GIS Command Center & Outbreak War Room (DashboardView for Admin)', () => {
  beforeEach(() => {
    // Setup clipboard mock
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    useAuthStore.setState({
      activeRole: 'admin',
      userProfile: DEMO_PERSONAS.admin,
      isInitialized: true,
    });
    vi.clearAllMocks();
  });

  it('renders GIS Command War Room title and biosecurity metrics for Admin role', async () => {
    render(<DashboardView />);

    expect(screen.getByText(/जिल्हा नियंत्रण कक्ष \(GIS Command War Room\)/i)).toBeInTheDocument();
    expect(screen.getByText(/PCICDA biosecurity command/i)).toBeInTheDocument();
    expect(screen.getByText(/सक्रिय क्लस्टर/i)).toBeInTheDocument();
    expect(screen.getByText(/पाळत गावे \(LGD\)/i)).toBeInTheDocument();
    expect(screen.getByText(/रिंग लसीकरण लक्ष्य/i)).toBeInTheDocument();
  });

  it('renders CommandMapView with 1km, 5km, and 10km buffer toggles and village pins', () => {
    render(<DashboardView />);

    expect(screen.getByText(/स्थानिक वेब-जीआयएस नकाशा/i)).toBeInTheDocument();
    expect(screen.getByText('बफर')).toBeInTheDocument();
    expect(screen.getByText('गावे')).toBeInTheDocument();
    expect(screen.getByText('नाके')).toBeInTheDocument();

    // Check legend items
    expect(screen.getByText(/१ किमी हालचाल बंदी/i)).toBeInTheDocument();
    expect(screen.getByText(/५ किमी रिंग लस/i)).toBeInTheDocument();
    expect(screen.getByText(/१० किमी पाळत क्षेत्र/i)).toBeInTheDocument();

    // Check village details
    expect(screen.getByText(/आश्वी बुद्रुक \(केंद्र\)/i)).toBeInTheDocument();
    expect(screen.getByText(/LGD 558301/i)).toBeInTheDocument();
  });

  it('renders EpiCurveChart with 14-day syndromic time-series and Rt badge', async () => {
    render(<DashboardView />);

    // Wait for async epi-curve loading
    expect(await screen.findByText(/१४ दिवसांचा उद्रेक आलेख \(14-Day Epi-Curve\)/i)).toBeInTheDocument();
    expect(screen.getByText(/TimescaleDB syndromic time-series/i)).toBeInTheDocument();
    expect(screen.getByText(/रिंग लसीकरण \(Day 7\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Rt 0.65 \(नियंत्रित\)/i)).toBeInTheDocument();
  });

  it('opens MarketClosureModal, generates statutory memo citing Sections 6, 10, 20 of PCICDA 2009, and dispatches IDSP alert', async () => {
    render(<DashboardView />);

    const openMemoBtn = screen.getByRole('button', { name: /Issue Market Closure Order/i });
    fireEvent.click(openMemoBtn);

    // Modal is open
    expect(screen.getByText(/PCICDA कायदा २००९ आठवडे बाजार बंदी आदेश/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Sections 6, 10 & 20/i).length).toBeGreaterThan(0);

    // Click generate memo
    const generateBtn = screen.getByRole('button', { name: /अधिकृत आदेश तयार करा/i });
    fireEvent.click(generateBtn);

    // Verify statutory citations in generated preview
    await waitFor(() => {
      const refMatches = screen.getAllByText(/ADM\/PCICDA\/AHM/i);
      expect(refMatches.length).toBeGreaterThan(0);
      expect(screen.getByText(/कलम ६, १० व २०/i)).toBeInTheDocument();
    });

    // Test tab switch to English
    const englishTab = screen.getByRole('button', { name: /English Memo/i });
    fireEvent.click(englishTab);
    expect(screen.getByText(/Enforcement of 10 km Biosecurity Containment/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Sections 6, 10 & 20/i).length).toBeGreaterThan(0);

    // Test IDSP dispatch bridge button
    const idspBtn = screen.getByRole('button', { name: /IDSP सार्वजनिक आरोग्य अलर्ट पाठवा/i });
    fireEvent.click(idspBtn);

    await waitFor(() => {
      expect(screen.getByText(/IDSP \/ NCDC कडे अलर्ट पाठवला/i)).toBeInTheDocument();
    });
  });

  it('interacts with SIH Demo Simulator Card (reset to step 1 and step advancement)', async () => {
    render(<DashboardView />);

    expect(screen.getByText(/SIH २०२६ लाईव्ह सादरीकरण सिम्युलेटर/i)).toBeInTheDocument();

    // Click Reset to restart scenario at Step 1
    const resetBtn = screen.getByRole('button', { name: /Reset simulation/i });
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(screen.getByText(/शेतकरी अहवाल: आश्वी बुद्रुक/i)).toBeInTheDocument();
      expect(screen.getByText(/Field Syndromic Ingestion \(Ashwi Budruk\)/i)).toBeInTheDocument();
    });

    // Click Next Step
    const nextBtn = screen.getByRole('button', { name: /पुढील टप्पा/i });
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(screen.getByText(/गुगल जेमिनी ३\.७ फ्लॅश एआय ट्रायज/i)).toBeInTheDocument();
      expect(screen.getByText(/Google Gemini 3\.7 Flash Multimodal Triage/i)).toBeInTheDocument();
    });
  });
});

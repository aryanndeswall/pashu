import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ReportWizardView } from '../views/ReportWizardView';
import { dbService } from '../database/sqliteConnection';

// Mock hapticsService
vi.mock('../services/hapticsService', () => ({
  hapticsService: {
    hapticLight: vi.fn().mockResolvedValue(undefined),
    hapticMedium: vi.fn().mockResolvedValue(undefined),
    hapticError: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock alarmAudioService
vi.mock('../services/alarmAudioService', () => ({
  alarmAudioService: {
    playBiohazardSiren: vi.fn().mockReturnValue(vi.fn()),
    stopBiohazardSiren: vi.fn(),
    speakMarathiWarning: vi.fn(),
    stopSpeech: vi.fn(),
  },
}));

// Mock locationService
vi.mock('../services/locationService', () => ({
  locationService: {
    getCurrentLocation: vi.fn().mockResolvedValue({
      latitude: 19.3912,
      longitude: 74.6521,
      accuracy: 8,
      timestamp: new Date().toISOString(),
    }),
    snapToNearestLgdVillage: vi.fn().mockResolvedValue({
      lgd_code: 558301,
      village_name: 'Ashwi Budruk',
      block_name: 'Sangamner',
      district_name: 'Ahmednagar',
      distanceKm: 0.5,
      isAccurate: true,
    }),
    getAllLgdVillages: vi.fn().mockResolvedValue([
      {
        lgd_code: 558301,
        village_name: 'Ashwi Budruk',
        block_name: 'Sangamner',
        district_name: 'Ahmednagar',
        latitude: 19.6234,
        longitude: 74.3356,
      },
    ]),
  },
}));

describe('ReportWizardView Integration', () => {
  beforeEach(async () => {
    await dbService.initDatabase();
    vi.clearAllMocks();
  });

  it('renders Step 1 with syndrome selector and disabled Next button initially', () => {
    render(<ReportWizardView />);

    expect(screen.getByText(/टप्पा १\/३: लक्षण निवड/i)).toBeDefined();
    const nextBtn = screen.getByRole('button', { name: /पुढे जा: पुरावे जोडा/i });
    expect(nextBtn).toBeDisabled();
  });

  it('enables Next button upon selecting a syndrome and navigates to Step 2', async () => {
    render(<ReportWizardView />);

    // Select VSS syndrome card (तोंड आणि खुरांचे फोड)
    const vssCard = screen.getByText(/तोंड आणि खुरांचे फोड/i);
    fireEvent.click(vssCard);

    const nextBtn = screen.getByRole('button', { name: /पुढे जा: पुरावे जोडा/i });
    expect(nextBtn).not.toBeDisabled();

    // Advance to Step 2
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(screen.getByText('टप्पा २/३: पुरावे जोडणी (फोटो व आवाज)')).toBeDefined();
      expect(screen.getByText(/१\. जनावराचा फोटो/i)).toBeDefined();
      expect(screen.getByText(/२\. स्थानिक व्हॉइस नोट/i)).toBeDefined();
    });
  });

  it('triggers Anthrax Biohazard Lockout and modal when HSDS syndrome is selected', async () => {
    render(<ReportWizardView />);

    // Select HSDS card (अचानक मृत्यू / काळी माती)
    const hsdsCard = screen.getByText(/अचानक मृत्यू \/ काळी माती/i);
    fireEvent.click(hsdsCard);

    await waitFor(() => {
      // Biohazard modal should appear immediately
      expect(screen.getByText(/शव विच्छेदन करू नका! \(DO NOT CUT!\)/i)).toBeInTheDocument();
      expect(screen.getByText(/CRITICAL BIOHAZARD ALERT • RULE ZERO/i)).toBeInTheDocument();
    });

    // Verify lockout button in Step 1
    expect(screen.getByRole('button', { name: /ॲन्थ्रॅक्स लॉकआऊट प्रोटोकॉल उघडा/i })).toBeInTheDocument();
  });

  it('navigates to Step 3 and saves offline report draft to SQLite queue', async () => {
    const executeSpy = vi.spyOn(dbService, 'execute');

    render(<ReportWizardView />);

    // Step 1: Select syndrome
    fireEvent.click(screen.getByText(/तोंड आणि खुरांचे फोड/i));
    fireEvent.click(screen.getByRole('button', { name: /पुढे जा: पुरावे जोडा/i }));

    // Step 2: Media -> advance to Step 3
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Next: Location/i })).toBeDefined();
    });
    fireEvent.click(screen.getByRole('button', { name: /Next: Location/i }));

    // Step 3: Location & Tag
    await waitFor(() => {
      expect(screen.getByText('टप्पा ३/३: स्थान व पशू आधार')).toBeDefined();
      expect(screen.getByText(/स्थान व LGD गाव/i)).toBeDefined();
      expect(screen.getByText(/पशू आधार १२-अंकी टॅग/i)).toBeDefined();
    });

    // Enter Pashu Aadhaar number
    const aadhaarInput = screen.getByPlaceholderText('उदा. १२३४-५६७८-९०१२');
    fireEvent.change(aadhaarInput, { target: { value: '123456789012' } });
    expect(aadhaarInput).toHaveValue('1234-5678-9012');

    // Click Save Offline Report
    const saveBtn = screen.getByRole('button', { name: /अहवाल जतन करा/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(executeSpy).toHaveBeenCalled();
      expect(screen.getByText('अहवाल यशस्वीरित्या जतन झाला!')).toBeDefined();
    });
  });
});

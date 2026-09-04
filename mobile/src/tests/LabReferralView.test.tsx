import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LabReferralView } from '../views/LabReferralView';
import { labService } from '../services/labService';

vi.mock('../services/hapticsService', () => ({
  hapticsService: {
    triggerSelection: vi.fn().mockResolvedValue(undefined),
    triggerError: vi.fn().mockResolvedValue(undefined),
    triggerNotification: vi.fn().mockResolvedValue(undefined),
    hapticLight: vi.fn().mockResolvedValue(undefined),
    hapticMedium: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('LabReferralView Component (LAB-01, LAB-02, LAB-03)', () => {
  beforeEach(() => {
    labService.clearStore();
  });

  it('renders e-LRF tracker header and active pre-seeded requisition cards', async () => {
    render(<LabReferralView />);

    expect(screen.getByText(/इ-प्रयोगशाळा मागणीपत्र/i)).toBeInTheDocument();
    // Wait for async loadData to populate the list
    expect(await screen.findByText(/LRF-20260904-0941/i)).toBeInTheDocument();
    expect(screen.getAllByText(/४८ तास कोल्ड-चेन मर्यादा/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/मार्गावर \(In Transit\)/i)).toBeInTheDocument();
  });


  it('opens and displays the SVG QR code preview modal when QR button is clicked', async () => {
    render(<LabReferralView />);

    await screen.findByText(/LRF-20260904-0941/i);

    const qrButtons = screen.getAllByRole('button', { name: /QR लेबल/i });
    fireEvent.click(qrButtons[0]);

    await waitFor(() => {
      expect(
        screen.getByText(/हा QR कोड नमुना बाटलीवर \(Specimen Vial\) व कोल्ड-बॉक्सवर चिटकवून लॅबमध्ये पाठवावा/i)
      ).toBeInTheDocument();
    });
  });

  it('opens new e-LRF requisition modal and creates a new requisition', async () => {
    render(<LabReferralView />);

    await screen.findByText(/LRF-20260904-0941/i);

    const newBtn = screen.getByRole('button', { name: /New e-LRF/i });
    fireEvent.click(newBtn);

    expect(screen.getByText(/नवीन प्रयोगशाळा मागणीपत्र \(New e-LRF\)/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /मागणीपत्र तयार करा/i });
    fireEvent.click(submitBtn);

    // After creation, the QR code preview modal for the new e-LRF should open automatically
    await waitFor(() => {
      expect(
        screen.getByText(/हा QR कोड नमुना बाटलीवर/i)
      ).toBeInTheDocument();
    });
  });

  it('allows logging transit temperature checkpoint and updates cold-chain metrics', async () => {
    render(<LabReferralView />);

    await screen.findByText(/LRF-20260904-0941/i);

    const logTempBtns = screen.getAllByRole('button', { name: /Log/i });
    fireEvent.click(logTempBtns[0]);

    expect(screen.getByRole('heading', { name: /तापमान नोंदवा/i })).toBeInTheDocument();

    const tempInput = screen.getByDisplayValue('3.8');
    fireEvent.change(tempInput, { target: { value: '14.2' } });

    const saveBtn = screen.getByRole('button', { name: /तापमान जतन करा/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText(/14.2°C/i)).toBeInTheDocument();
      expect(screen.getByText(/कोल्ड-चेन मर्यादा ओलांडली/i)).toBeInTheDocument();
    });
  });

  it('records positive RT-PCR result and displays LAB_CONFIRMED badge', async () => {
    render(<LabReferralView />);

    await screen.findByText(/LRF-20260904-0941/i);

    const resultBtns = screen.getAllByRole('button', { name: /Result/i });
    fireEvent.click(resultBtns[0]);

    expect(screen.getByRole('heading', { name: /प्रयोगशाळा निकाल नोंदवा/i })).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /निकालाची पुष्टी करा/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByText(/निश्चित \(LAB_CONFIRMED\)/i)).toBeInTheDocument();
    });
  });
});

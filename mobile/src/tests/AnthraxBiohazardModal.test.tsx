import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AnthraxBiohazardModal } from '../components/modals/AnthraxBiohazardModal';
import { alarmAudioService } from '../services/alarmAudioService';
import { idspAlertService } from '../services/idspAlertService';
import { dbService } from '../database/sqliteConnection';

// Mock alarmAudioService
vi.mock('../services/alarmAudioService', () => ({
  alarmAudioService: {
    playBiohazardSiren: vi.fn().mockReturnValue(vi.fn()),
    stopBiohazardSiren: vi.fn(),
    speakMarathiWarning: vi.fn(),
    stopSpeech: vi.fn(),
  },
}));

// Mock hapticsService
vi.mock('../services/hapticsService', () => ({
  hapticsService: {
    hapticLight: vi.fn().mockResolvedValue(undefined),
    hapticMedium: vi.fn().mockResolvedValue(undefined),
    hapticError: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('AnthraxBiohazardModal Component (BIO-01, BIO-02, BIO-03)', () => {
  beforeEach(async () => {
    await dbService.initDatabase();
    vi.clearAllMocks();
  });

  it('renders full-screen emergency biohazard lockout modal with DO NOT CUT headline', () => {
    render(<AnthraxBiohazardModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText(/शव विच्छेदन करू नका! \(DO NOT CUT!\)/i)).toBeInTheDocument();
    expect(screen.getByText(/CRITICAL BIOHAZARD ALERT • RULE ZERO/i)).toBeInTheDocument();
    expect(screen.getByText(/काळपुळी \(ॲन्थ्रॅक्स\) संसर्गाचा गंभीर धोका/i)).toBeInTheDocument();

    // Verify audio siren and speech warning triggered on mount
    expect(alarmAudioService.playBiohazardSiren).toHaveBeenCalled();
    expect(alarmAudioService.speakMarathiWarning).toHaveBeenCalled();
  });

  it('renders all 5 mandatory biosecurity disposal protocols', () => {
    render(<AnthraxBiohazardModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText(/१\. मृत जनावराचे शव उघडणे, कापणे किंवा कातडी काढणे पूर्णपणे बंदी/i)).toBeInTheDocument();
    expect(screen.getByText(/२\. रक्ताचा नमुना फक्त कानाच्या टोकावरून काढावा/i)).toBeInTheDocument();
    expect(screen.getByText(/३\. शव ६ फूट खोल खड्ड्यात कळीच्या चुन्यासह पुरावे/i)).toBeInTheDocument();
    expect(screen.getByText(/४\. १ किमी परिसरातील सर्व जनावरांची हालचाल तत्काळ थांबवा/i)).toBeInTheDocument();
    expect(screen.getByText(/५\. जिल्हा मानवी आरोग्य विभागाकडे \(IDSP\) त्वरित संपर्क शोध सुरू करा/i)).toBeInTheDocument();
  });

  it('replays spoken Marathi voice warning when audio button is tapped', () => {
    render(<AnthraxBiohazardModal isOpen={true} onClose={vi.fn()} />);

    const replayBtn = screen.getByRole('button', { name: /Replay Marathi Voice Warning/i });
    fireEvent.click(replayBtn);

    expect(alarmAudioService.speakMarathiWarning).toHaveBeenCalledTimes(2);
  });

  it('contains emergency telephone link for toll-free 1962 helpline', () => {
    render(<AnthraxBiohazardModal isOpen={true} onClose={vi.fn()} />);

    const callLink = screen.getByRole('link', { name: /१९६२ आपत्कालीन कॉल/i });
    expect(callLink).toHaveAttribute('href', 'tel:1962');
  });

  it('queues a priority-3 IDSP alert into SQLite upon clicking IDSP notification button', async () => {
    const dispatchSpy = vi.spyOn(idspAlertService, 'dispatchIdspAlert');

    render(
      <AnthraxBiohazardModal
        isOpen={true}
        onClose={vi.fn()}
        lgdCode={558301}
        villageName="Ashwi Budruk"
        district="Ahmednagar"
        block="Sangamner"
        pashuAadhaar="1234-5678-9012"
      />
    );

    const idspBtn = screen.getByRole('button', { name: /IDSP राष्ट्रीय सूचना नोंदवा/i });
    fireEvent.click(idspBtn);

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          lgdCode: 558301,
          villageName: 'Ashwi Budruk',
          syndrome: 'HSDS',
          primaryDisease: 'Anthrax (Bacillus anthracis)',
        })
      );
      expect(screen.getByText(/IDSP राष्ट्रीय सूचना नोंदवली!/i)).toBeInTheDocument();
    });
  });
});

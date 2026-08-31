import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { SyndromeGrid } from '../components/syndromes/SyndromeGrid';
import { SYNDROME_TAXONOMY } from '../types/syndromes';
import { EmergencySOSModal } from '../components/modals/EmergencySOSModal';
import { useNavigationStore } from '../store/navigationStore';
import { hapticsService } from '../services/hapticsService';

vi.mock('../services/hapticsService', () => ({
  hapticsService: {
    hapticLight: vi.fn().mockResolvedValue(undefined),
    hapticMedium: vi.fn().mockResolvedValue(undefined),
    hapticError: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('8-Syndrome Visual Selector & Biohazard Pre-Warning', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useNavigationStore.setState({
      activeTab: 'report',
      isEmergencyModalOpen: false,
      isDarkMode: false,
    });
  });

  it('contains all 8 standardized syndromic categories in taxonomy', () => {
    expect(SYNDROME_TAXONOMY.length).toBe(8);
    const codes = SYNDROME_TAXONOMY.map((s) => s.code);
    expect(codes).toContain('VSS');
    expect(codes).toContain('NSLS');
    expect(codes).toContain('HSDS');
    expect(codes).toContain('AROS');
    expect(codes).toContain('CMSS');
    expect(codes).toContain('SARF');
    expect(codes).toContain('HES');
    expect(codes).toContain('NAS');
  });

  it('renders all 8 syndrome cards in SyndromeGrid', () => {
    const handleSelect = vi.fn();
    render(<SyndromeGrid onSelectSyndrome={handleSelect} />);

    SYNDROME_TAXONOMY.forEach((syndrome) => {
      expect(screen.getByText(syndrome.code)).toBeDefined();
      expect(screen.getByText(syndrome.nameMarathi)).toBeDefined();
    });
  });

  it('tapping standard syndrome triggers medium haptic feedback', async () => {
    const handleSelect = vi.fn();
    render(<SyndromeGrid onSelectSyndrome={handleSelect} />);

    const vssCard = screen.getByText('VSS').closest('button');
    expect(vssCard).not.toBeNull();

    if (vssCard) {
      await fireEvent.click(vssCard);
    }

    expect(hapticsService.hapticMedium).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'VSS' })
    );
  });

  it('tapping HSDS triggers error haptic feedback due to critical biohazard', async () => {
    const handleSelect = vi.fn();
    render(<SyndromeGrid onSelectSyndrome={handleSelect} />);

    const hsdsCard = screen.getByText('HSDS').closest('button');
    expect(hsdsCard).not.toBeNull();

    if (hsdsCard) {
      await fireEvent.click(hsdsCard);
    }

    expect(hapticsService.hapticError).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'HSDS', severity: 'CRITICAL_BIOHAZARD' })
    );
  });

  it('renders Anthrax emergency warning inside EmergencySOSModal when open', () => {
    useNavigationStore.setState({ isEmergencyModalOpen: true });
    render(<EmergencySOSModal />);

    expect(screen.getByText(/शव विच्छेदन करू नका!/i)).toBeDefined();
    expect(screen.getByText(/DO NOT CUT CARCASS/i)).toBeDefined();
    expect(screen.getByText(/काळपुळी \(Anthrax\) संशय/i)).toBeDefined();
  });
});

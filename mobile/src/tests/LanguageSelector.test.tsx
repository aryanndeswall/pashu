import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HeaderBar } from '../components/common/HeaderBar';
import { BottomBar } from '../components/navigation/BottomBar';
import { useLanguageStore } from '../store/languageStore';
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

describe('Language Selector Button & Dynamic Localization Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      activeRole: 'consumer',
      userProfile: DEMO_PERSONAS.consumer,
      isInitialized: true,
    });
    useLanguageStore.setState({
      currentLanguage: 'mr',
      isSelectorOpen: false,
    });
    vi.clearAllMocks();
  });

  it('renders language selector button in HeaderBar with initial MR badge', () => {
    render(<HeaderBar />);

    const langBtn = screen.getByRole('button', { name: /Open Language Selector/i });
    expect(langBtn).toBeInTheDocument();
    expect(langBtn).toHaveTextContent('MR');
  });

  it('opens LanguageSelectorModal when language button is clicked', async () => {
    render(<HeaderBar />);

    const langBtn = screen.getByRole('button', { name: /Open Language Selector/i });
    fireEvent.click(langBtn);

    // Modal is now open
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('भाषा निवडा (Select Language)')).toBeInTheDocument();
    expect(screen.getByText('मराठी')).toBeInTheDocument();
    expect(screen.getByText('हिंदी')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('switches to Hindi when Hindi card is selected, updating header badge and bottom tabs', async () => {
    render(
      <div>
        <HeaderBar />
        <BottomBar />
      </div>
    );

    // Initially tabs are Marathi
    expect(screen.getByText('लक्षणे नोंदवा')).toBeInTheDocument();
    expect(screen.getByText('स्थानिक स्थिती')).toBeInTheDocument();

    // Open language modal
    const langBtn = screen.getByRole('button', { name: /Open Language Selector/i });
    fireEvent.click(langBtn);

    // Wait for modal to appear
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    // Click Hindi
    const hindiOption = screen.getByRole('button', { name: /Select Hindi language/i });
    fireEvent.click(hindiOption);

    // Modal closes and language switches
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(useLanguageStore.getState().currentLanguage).toBe('hi');
    });

    // Header badge is now HI
    expect(langBtn).toHaveTextContent('HI');

    // BottomBar tabs updated to Hindi
    expect(screen.getByText('लक्षण दर्ज करें')).toBeInTheDocument();
    expect(screen.getByText('स्थानिक स्थिति')).toBeInTheDocument();
    expect(screen.getByText('मेरे पशु')).toBeInTheDocument();
  });

  it('switches to English when English card is selected', async () => {
    render(
      <div>
        <HeaderBar />
        <BottomBar />
      </div>
    );

    // Open language modal
    const langBtn = screen.getByRole('button', { name: /Open Language Selector/i });
    fireEvent.click(langBtn);

    // Wait for modal to appear
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    // Click English
    const englishOption = screen.getByRole('button', { name: /Select English language/i });
    fireEvent.click(englishOption);

    await waitFor(() => {
      expect(useLanguageStore.getState().currentLanguage).toBe('en');
    });

    // Header badge is now EN
    expect(langBtn).toHaveTextContent('EN');

    // BottomBar tabs updated to English primary labels
    expect(screen.getByText('Report')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('My Animals')).toBeInTheDocument();
  });
});

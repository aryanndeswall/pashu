import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NearbyDoctorsView } from '../views/NearbyDoctorsView';
import { useAuthStore, DEMO_PERSONAS } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';

// Mock hapticsService
vi.mock('../services/hapticsService', () => ({
  hapticsService: {
    hapticLight: vi.fn().mockResolvedValue(undefined),
    hapticMedium: vi.fn().mockResolvedValue(undefined),
    hapticSuccess: vi.fn().mockResolvedValue(undefined),
    triggerSelection: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('NearbyDoctorsView Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      activeRole: 'consumer',
      userProfile: DEMO_PERSONAS.consumer,
      isAuthenticated: true,
    });
    useLanguageStore.setState({
      currentLanguage: 'mr',
    });
  });

  it('renders nearby doctors list with government BVOs, mobile clinics, and Pashu Sakhis', () => {
    render(<NearbyDoctorsView />);

    // Header title
    expect(screen.getByText('जवळचे पशुवैद्यकीय अधिकारी व दवाखाने')).toBeInTheDocument();

    // Doctor entries
    expect(screen.getByText(/डॉ\. अनन्य देशपांडे \/ देशमुख/i)).toBeInTheDocument();
    expect(screen.getByText(/डॉ\. सुरेश पाटील/i)).toBeInTheDocument();
    expect(screen.getByText(/सुनीता ताई गायकवाड \(पशु सखी\)/i)).toBeInTheDocument();

    // Distance badges
    expect(screen.getByText('2.4 km')).toBeInTheDocument();
    expect(screen.getByText('4.8 km')).toBeInTheDocument();
    expect(screen.getByText('0.8 km')).toBeInTheDocument();
  });

  it('filters doctor list by category chip', async () => {
    render(<NearbyDoctorsView />);

    // Filter by Pashu Sakhi
    const pashuSakhiFilter = screen.getByRole('button', { name: 'पशु सखी' });
    fireEvent.click(pashuSakhiFilter);

    expect(screen.getByText(/सुनीता ताई गायकवाड \(पशु सखी\)/i)).toBeInTheDocument();
    expect(screen.queryByText(/डॉ\. सुरेश पाटील/i)).not.toBeInTheDocument();
  });

  it('allows transmitting and syncing case reports with nearby doctor', async () => {
    render(<NearbyDoctorsView />);

    // Click Sync Case Report button on first doctor
    const syncButtons = screen.getAllByRole('button', { name: /केस पाठवा/i });
    expect(syncButtons.length).toBeGreaterThan(0);
    fireEvent.click(syncButtons[0]);

    // Expect transmission feedback banner
    await waitFor(() => {
      expect(screen.getByText(/केस रिपोर्ट व लक्षणे.*यांना पाठवली आहेत/i)).toBeInTheDocument();
    });
  });

  it('opens video consultation modal when Video button is tapped', async () => {
    render(<NearbyDoctorsView />);

    const videoButtons = screen.getAllByRole('button', { name: /व्हिडिओ/i });
    expect(videoButtons.length).toBeGreaterThan(0);
    fireEvent.click(videoButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('LIVE')).toBeInTheDocument();
      expect(screen.getByText('+919422001842')).toBeInTheDocument();
    });
  });
});

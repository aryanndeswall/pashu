import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BottomBar } from '../components/navigation/BottomBar';
import { HeaderBar } from '../components/common/HeaderBar';
import { useAuthStore, DEMO_PERSONAS } from '../store/authStore';
import { useNavigationStore } from '../store/navigationStore';
import { dbService } from '../database/sqliteConnection';

// Mock hapticsService
vi.mock('../services/hapticsService', () => ({
  hapticsService: {
    hapticLight: vi.fn().mockResolvedValue(undefined),
    hapticMedium: vi.fn().mockResolvedValue(undefined),
    hapticError: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('Role-Filtered Navigation & Header Demo Switcher', () => {
  beforeEach(async () => {
    await dbService.initDatabase();
    useAuthStore.setState({
      activeRole: 'consumer',
      userProfile: DEMO_PERSONAS.consumer,
      isInitialized: true,
    });
    useNavigationStore.setState({
      activeTab: 'report',
      isEmergencyModalOpen: false,
    });
    vi.clearAllMocks();
  });

  it('hides Labs tab when activeRole is consumer (Farmer)', () => {
    render(<BottomBar />);

    expect(screen.getByRole('button', { name: /लक्षणे नोंदवा \(Report\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /स्थानिक स्थिती \(Status\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /माझे पशु \(My Animals\)/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /प्रयोगशाळा \(Labs\)/i })).not.toBeInTheDocument();
  });

  it('renders all 4 tabs including Labs when activeRole is doctor (Veterinarian)', async () => {
    useAuthStore.setState({
      activeRole: 'doctor',
      userProfile: DEMO_PERSONAS.doctor,
    });

    render(<BottomBar />);

    expect(screen.getByRole('button', { name: /८ लक्षणे \(Triage\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /डॅशबोर्ड \(Dashboard\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /पशु आधार \(Animals\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /प्रयोगशाळा \(Labs\)/i })).toBeInTheDocument();
  });

  it('automatically redirects activeTab from labs to report when switching from doctor to consumer', async () => {
    // Start as doctor on labs tab
    useAuthStore.setState({
      activeRole: 'doctor',
      userProfile: DEMO_PERSONAS.doctor,
    });
    useNavigationStore.setState({
      activeTab: 'labs',
    });
    expect(useNavigationStore.getState().activeTab).toBe('labs');

    // Switch role to consumer
    await useAuthStore.getState().switchRole('consumer');

    // Verification: activeTab redirected to report
    expect(useNavigationStore.getState().activeTab).toBe('report');
  });

  it('renders role pill in HeaderBar and opens demo switcher on tap', async () => {
    render(<HeaderBar />);

    // Shows consumer pill initially
    const rolePill = screen.getByRole('button', { name: /Open Demo Role Switcher/i });
    expect(rolePill).toHaveTextContent('👨‍🌾 पशुपालक');

    // Click to open FluidDrawer
    fireEvent.click(rolePill);

    await waitFor(() => {
      expect(screen.getByText('भूमिका बदला (SIH Demo Role Switcher)')).toBeInTheDocument();
      expect(screen.getByText(/सादरीकरणासाठी १-क्लिक मध्ये भूमिका बदला/i)).toBeInTheDocument();
    });

    // Tap switch to doctor in drawer
    const switchDoctorBtn = screen.getByRole('button', { name: /Switch to Field Veterinarian & Para-vet/i });
    fireEvent.click(switchDoctorBtn);

    expect(useAuthStore.getState().activeRole).toBe('doctor');
    expect(rolePill).toHaveTextContent('🩺 पशुवैद्य');
  });
});

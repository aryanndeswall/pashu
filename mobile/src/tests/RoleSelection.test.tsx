import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RoleSelectionView } from '../views/RoleSelectionView';
import { useAuthStore, DEMO_PERSONAS } from '../store/authStore';

// Mock hapticsService
vi.mock('../services/hapticsService', () => ({
  hapticsService: {
    hapticLight: vi.fn().mockResolvedValue(undefined),
    hapticMedium: vi.fn().mockResolvedValue(undefined),
    hapticError: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('RoleSelectionView Component', () => {
  beforeEach(() => {
    useAuthStore.setState({
      activeRole: 'consumer',
      userProfile: DEMO_PERSONAS.consumer,
      isInitialized: true,
    });
    vi.clearAllMocks();
  });

  it('renders all three persona options with Devanagari labels and profiles', () => {
    render(<RoleSelectionView />);

    expect(screen.getByText('पशु सुरक्षा — भूमिका निवडा')).toBeInTheDocument();
    expect(screen.getByText('पशुपालक')).toBeInTheDocument();
    expect(screen.getByText('पशुवैद्य / पशु सखी')).toBeInTheDocument();
    expect(screen.getByText('जिल्हा अधिकारी (DVO)')).toBeInTheDocument();

    expect(screen.getByText(/रमेश पाटील/i)).toBeInTheDocument();
    expect(screen.getByText(/डॉ. अंजली देशमुख/i)).toBeInTheDocument();
    expect(screen.getByText(/डॉ. एस. के. कुलकर्णी/i)).toBeInTheDocument();
  });

  it('highlights current active persona (consumer initially)', () => {
    render(<RoleSelectionView />);

    expect(screen.getByText(/सक्रिय भूमिका \(Active\)/i)).toBeInTheDocument();
  });

  it('switches to doctor role when doctor card button is clicked', async () => {
    const onSelectMock = vi.fn();
    render(<RoleSelectionView onRoleSelected={onSelectMock} />);

    const doctorBtn = screen.getByRole('button', { name: /Select Veterinarian & Para-vet/i });
    fireEvent.click(doctorBtn);

    await waitFor(() => {
      expect(useAuthStore.getState().activeRole).toBe('doctor');
      expect(onSelectMock).toHaveBeenCalledWith('doctor');
    });
  });

  it('switches to admin role when admin card is clicked', async () => {
    const onSelectMock = vi.fn();
    render(<RoleSelectionView onRoleSelected={onSelectMock} />);

    const adminBtn = screen.getByRole('button', { name: /Select District Animal Husbandry Officer/i });
    fireEvent.click(adminBtn);

    await waitFor(() => {
      expect(useAuthStore.getState().activeRole).toBe('admin');
      expect(onSelectMock).toHaveBeenCalledWith('admin');
    });
  });
});

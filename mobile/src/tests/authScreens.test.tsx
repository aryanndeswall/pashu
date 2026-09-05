import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAuthStore, DEMO_PERSONAS, maskPhoneNumber } from '../store/authStore';
import { dbService } from '../database/sqliteConnection';
import { RolePortalView } from '../views/RolePortalView';
import { LoginView } from '../views/LoginView';
import { OtpVerificationView } from '../views/OtpVerificationView';
import { OnboardingView } from '../views/OnboardingView';
import { OfflinePinView } from '../views/OfflinePinView';
import { UserProfileView } from '../views/UserProfileView';

// Mock hapticsService
vi.mock('../services/hapticsService', () => ({
  hapticsService: {
    hapticLight: vi.fn().mockResolvedValue(undefined),
    hapticMedium: vi.fn().mockResolvedValue(undefined),
    hapticError: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('Phase 11 Wave 1: Authentication State Machine & Views', () => {
  beforeEach(async () => {
    await dbService.initDatabase();
    useAuthStore.setState({
      activeRole: 'consumer',
      userProfile: DEMO_PERSONAS.consumer,
      isInitialized: true,
      isAuthenticated: false,
      isLocked: false,
      hasOfflinePin: false,
      loginStep: 'portal',
      pendingPhone: '',
      pendingSecondaryId: '',
      otpError: null,
      otpCountdown: 0,
      failedPinAttempts: 0,
      lockoutUntil: null,
    });
    vi.clearAllMocks();
  });

  describe('useAuthStore State Machine', () => {
    it('initializes in portal step with unauthenticated state', () => {
      const state = useAuthStore.getState();
      expect(state.loginStep).toBe('portal');
      expect(state.isAuthenticated).toBe(false);
    });

    it('selectRoleAndProceed transitions to login step with chosen role', () => {
      useAuthStore.getState().selectRoleAndProceed('doctor');
      const state = useAuthStore.getState();
      expect(state.activeRole).toBe('doctor');
      expect(state.loginStep).toBe('login');
    });

    it('requestOtp rejects invalid phone numbers and returns false', async () => {
      const result = await useAuthStore.getState().requestOtp('12345');
      expect(result).toBe(false);
      const state = useAuthStore.getState();
      expect(state.loginStep).toBe('portal');
    });

    it('requestOtp accepts valid 10-digit Indian phone and transitions to otp step', async () => {
      const result = await useAuthStore.getState().requestOtp('9822000412', 'MH-VET-8819');
      expect(result).toBe(true);
      const state = useAuthStore.getState();
      expect(state.loginStep).toBe('otp');
      expect(state.pendingPhone).toBe('9822000412');
      expect(state.pendingSecondaryId).toBe('MH-VET-8819');
      expect(state.otpCountdown).toBe(30);
    });

    it('verifyOtp rejects invalid code and sets error message', async () => {
      useAuthStore.setState({ loginStep: 'otp', pendingPhone: '9822000412' });
      const result = await useAuthStore.getState().verifyOtp('999999');
      expect(result).toBe(false);
      expect(useAuthStore.getState().otpError).toBeTruthy();
    });

    it('verifyOtp accepts 123456 and transitions new user to onboarding step', async () => {
      useAuthStore.setState({ loginStep: 'otp', pendingPhone: '9822000412' });
      const result = await useAuthStore.getState().verifyOtp('123456');
      expect(result).toBe(true);
      expect(useAuthStore.getState().loginStep).toBe('onboarding');
    });

    it('logout clears active session and resets state to portal', async () => {
      useAuthStore.setState({
        isAuthenticated: true,
        loginStep: 'authenticated',
        activeRole: 'doctor',
      });

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.loginStep).toBe('portal');
    });
  });

  describe('RolePortalView Component (AUTH-01)', () => {
    it('renders 3 persona selection cards with Devanagari labels and 52px targets', () => {
      render(<RolePortalView />);
      expect(screen.getByTestId('role-card-consumer')).toBeInTheDocument();
      expect(screen.getByTestId('role-card-doctor')).toBeInTheDocument();
      expect(screen.getByTestId('role-card-admin')).toBeInTheDocument();
      expect(screen.getAllByText(/पशुपालक/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/पशुवैद्य/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/जिल्हा अधिकारी/i).length).toBeGreaterThanOrEqual(1);
    });

    it('clicking doctor card advances to login step with doctor role', () => {
      render(<RolePortalView />);
      fireEvent.click(screen.getByTestId('role-card-doctor'));
      const state = useAuthStore.getState();
      expect(state.activeRole).toBe('doctor');
      expect(state.loginStep).toBe('login');
    });
  });

  describe('LoginView Component (AUTH-01)', () => {
    it('renders phone input and back button for consumer role', () => {
      useAuthStore.setState({ activeRole: 'consumer', loginStep: 'login' });
      render(<LoginView />);
      expect(screen.getByPlaceholderText('98XXXXXXXX')).toBeInTheDocument();
      expect(screen.getByText(/Send OTP/i)).toBeInTheDocument();
    });

    it('renders VCI registration input when activeRole is doctor', () => {
      useAuthStore.setState({ activeRole: 'doctor', loginStep: 'login' });
      render(<LoginView />);
      expect(screen.getByPlaceholderText(/MH-VET-2024-XXXX/i)).toBeInTheDocument();
    });

    it('renders administrative authorization passkey input when activeRole is admin', () => {
      useAuthStore.setState({ activeRole: 'admin', loginStep: 'login' });
      render(<LoginView />);
      expect(screen.getByPlaceholderText('DVO-AHM-001')).toBeInTheDocument();
    });

    it('validates phone and transitions to otp step upon valid submission', async () => {
      useAuthStore.setState({ activeRole: 'consumer', loginStep: 'login' });
      render(<LoginView />);

      const phoneInput = screen.getByPlaceholderText('98XXXXXXXX');
      fireEvent.change(phoneInput, { target: { value: '9822000412' } });

      const submitBtn = screen.getByRole('button', { name: /Send OTP/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(useAuthStore.getState().loginStep).toBe('otp');
        expect(useAuthStore.getState().pendingPhone).toBe('9822000412');
      });
    });
  });

  describe('OtpVerificationView Component (AUTH-02)', () => {
    it('renders 6 input boxes and auto-fill demo button', () => {
      useAuthStore.setState({
        loginStep: 'otp',
        pendingPhone: '9822000412',
      });
      render(<OtpVerificationView />);

      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBe(6);
      expect(screen.getByText(/⚡ SIH Demo: Auto-Fill OTP/i)).toBeInTheDocument();
    });

    it('auto-fill demo button fills 123456 into the 6 input boxes', () => {
      useAuthStore.setState({
        loginStep: 'otp',
        pendingPhone: '9822000412',
      });
      render(<OtpVerificationView />);

      const autoFillBtn = screen.getByText(/⚡ SIH Demo: Auto-Fill OTP/i);
      fireEvent.click(autoFillBtn);

      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
      expect(inputs.map((inp) => inp.value).join('')).toBe('123456');
    });

    it('submitting valid 123456 OTP triggers verifyOtp and advances to onboarding', async () => {
      useAuthStore.setState({
        loginStep: 'otp',
        pendingPhone: '9822000412',
      });
      render(<OtpVerificationView />);

      const autoFillBtn = screen.getByText(/⚡ SIH Demo: Auto-Fill OTP/i);
      fireEvent.click(autoFillBtn);

      const verifyBtn = screen.getByRole('button', { name: /Verify & Continue/i });
      fireEvent.click(verifyBtn);

      await waitFor(() => {
        expect(useAuthStore.getState().loginStep).toBe('onboarding');
      });
    });
  });

  describe('maskPhoneNumber Utility', () => {
    it('masks phone numbers conforming to DPDP Act 2023', () => {
      expect(maskPhoneNumber('9822000412')).toBe('+91 9822X-XX412');
      expect(maskPhoneNumber('+919822000412')).toBe('+91 9822X-XX412');
    });
  });

  describe('OnboardingView Component (AUTH-03)', () => {
    it('renders Step 1 with full name input and auto-fill button', () => {
      useAuthStore.setState({
        loginStep: 'onboarding',
        pendingPhone: '9822000412',
        activeRole: 'consumer',
      });
      render(<OnboardingView />);
      expect(screen.getByText(/पायरी १: वैयक्तिक माहिती/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/उदा. रमेश पाटील/i)).toBeInTheDocument();
      expect(screen.getByText(/⚡ SIH Demo: Auto-Fill Profile Details/i)).toBeInTheDocument();
    });

    it('advances from Step 1 to Step 2 and saves LGD jurisdiction to SQLite', async () => {
      useAuthStore.setState({
        loginStep: 'onboarding',
        pendingPhone: '9822000412',
        activeRole: 'consumer',
      });
      render(<OnboardingView />);

      // Click SIH demo auto fill
      const autoFillBtn = screen.getByText(/⚡ SIH Demo: Auto-Fill Profile Details/i);
      fireEvent.click(autoFillBtn);

      // Submit Step 1
      const nextBtn = screen.getByRole('button', { name: /Next/i });
      fireEvent.click(nextBtn);

      // Should now be on Step 2
      await waitFor(() => {
        expect(screen.getByText(/पायरी २: स्थानिक स्वराज्य संस्था/i)).toBeInTheDocument();
      });

      // Submit Step 2
      const submitBtn = screen.getByRole('button', { name: /सुरक्षा पिन सेट करा/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(useAuthStore.getState().loginStep).toBe('pin_setup');
      });
    });
  });

  describe('OfflinePinView Component (AUTH-04)', () => {
    it('renders 3x4 numeric keypad with buttons 0-9 and clear', () => {
      useAuthStore.setState({
        loginStep: 'pin_setup',
      });
      render(<OfflinePinView mode="setup" />);
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('9')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('instant demo unlock button unlocks session and transitions to authenticated', async () => {
      useAuthStore.setState({
        loginStep: 'pin_unlock',
        isLocked: true,
        isAuthenticated: false,
      });
      render(<OfflinePinView mode="unlock" />);

      const demoUnlockBtn = screen.getByText(/⚡ SIH Demo: Instant Unlock with PIN/i);
      fireEvent.click(demoUnlockBtn);

      await waitFor(() => {
        expect(useAuthStore.getState().isAuthenticated).toBe(true);
        expect(useAuthStore.getState().loginStep).toBe('authenticated');
      });
    });
  });

  describe('UserProfileView Component (AUTH-05)', () => {
    it('renders active user profile card with DPDP masked mobile number', () => {
      useAuthStore.setState({
        isAuthenticated: true,
        loginStep: 'authenticated',
        userProfile: DEMO_PERSONAS.consumer,
        activeRole: 'consumer',
      });
      render(<UserProfileView />);
      expect(screen.getByText('रमेश पाटील')).toBeInTheDocument();
      expect(screen.getByText('+91 9822X-XX412')).toBeInTheDocument();
      expect(screen.getByText(/DPDP Act 2023/i)).toBeInTheDocument();
    });

    it('allows 1-tap demo persona switching to doctor from profile', () => {
      useAuthStore.setState({
        isAuthenticated: true,
        loginStep: 'authenticated',
        userProfile: DEMO_PERSONAS.consumer,
        activeRole: 'consumer',
      });
      render(<UserProfileView />);

      const docBtn = screen.getByRole('button', { name: /🩺 पशुवैद्य/i });
      fireEvent.click(docBtn);

      expect(useAuthStore.getState().activeRole).toBe('doctor');
    });

    it('sign out button calls logout and resets step to portal', async () => {
      useAuthStore.setState({
        isAuthenticated: true,
        loginStep: 'authenticated',
      });
      render(<UserProfileView />);

      const logoutBtn = screen.getByRole('button', { name: /Sign Out/i });
      fireEvent.click(logoutBtn);

      await waitFor(() => {
        expect(useAuthStore.getState().isAuthenticated).toBe(false);
        expect(useAuthStore.getState().loginStep).toBe('portal');
      });
    });
  });
});

import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

/**
 * Robust Haptics service with graceful web fallback.
 * Prevents unhandled exceptions on desktop browsers or unsupported platforms.
 */
class HapticsService {
  private isNative: boolean;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  /**
   * Light tactile tap for navigation tab switches, card taps, and modal dismissals.
   */
  async hapticLight(): Promise<void> {
    try {
      if (this.isNative) {
        await Haptics.impact({ style: ImpactStyle.Light });
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(10);
      }
    } catch {
      // Graceful fallback: do nothing
    }
  }

  /**
   * Medium solid tactile feedback for saving offline reports, submitting selections, and button clicks.
   */
  async hapticMedium(): Promise<void> {
    try {
      if (this.isNative) {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([20]);
      }
    } catch {
      // Graceful fallback
    }
  }

  /**
   * Success tactile feedback for successful registrations and confirmations.
   */
  async hapticSuccess(): Promise<void> {
    try {
      if (this.isNative) {
        await Haptics.notification({ type: NotificationType.Success });
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([30, 30]);
      }
    } catch {
      // Graceful fallback
    }
  }

  /**
   * Warning tactile pulse for validation errors.
   */
  async hapticWarning(): Promise<void> {
    try {
      if (this.isNative) {
        await Haptics.notification({ type: NotificationType.Warning });
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([40, 20, 40]);
      }
    } catch {
      // Graceful fallback
    }
  }

  /**
   * Heavy pulsating tactile warning for Anthrax biohazard lockout and SOS emergency triggers.
   */
  async hapticError(): Promise<void> {
    try {
      if (this.isNative) {
        await Haptics.notification({ type: NotificationType.Error });
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([60, 40, 60]);
      }
    } catch {
      // Graceful fallback
    }
  }
}

export const hapticsService = new HapticsService();

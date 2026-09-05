# Phase 11 UI Specification: Role-Based Authentication Screens

**Phase:** 11  
**Created:** 2026-09-05  
**Design Standards:** UI-UXmax Rural Ergonomics (52px Touch Targets, High Contrast, Devanagari Typography)  

---

## 1. Visual Hierarchy & Color Tokens

| Persona / State | Border Token | Background Token | Accent CTA Token |
|---|---|---|---|
| **Farmer (पशुपालक)** | `border-emerald-500/50` | `bg-emerald-50/50 dark:bg-emerald-950/20` | `bg-emerald-600 hover:bg-emerald-700 text-white` |
| **Doctor (पशुवैद्य / पशु सखी)** | `border-blue-500/50` | `bg-blue-50/50 dark:bg-blue-950/20` | `bg-blue-600 hover:bg-blue-700 text-white` |
| **Admin (जिल्हा अधिकारी)** | `border-purple-500/50` | `bg-purple-50/50 dark:bg-purple-950/20` | `bg-purple-600 hover:bg-purple-700 text-white` |
| **Security PIN Keypad** | `border-slate-300 dark:border-slate-700` | `bg-white dark:bg-slate-900` | `bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900` |

---

## 2. Touch Target & Ergonomics Guidelines
- **All primary touch targets**: Minimum **52px** height (`min-h-[52px]` or `field-touch-target`) for rural field use with gloves or in bright glare.
- **OTP Digits**: 6 square input boxes of minimum 48x54px with bold 24px monospace numbers.
- **PIN Keypad**: 3x4 large button grid (1-9, backspace, 0, submit) with minimum 64px circular touch buttons and tactile haptic feedback on each tap.
- **Devanagari Font Support**: Uses `.lang-devanagari` class with enhanced line-height and letter-spacing for Marathi and Hindi text rendering.

---

## 3. Screen Layout Breakdown

### 1. Role Portal (`RolePortalView.tsx`)
- Top: Pashu-Suraksha emblem with bilingual title.
- Middle: 3 vertical cards (Farmer, Doctor, Admin) with distinct icon backgrounds, persona description, and badge indicators.
- Bottom: Language switcher (English / मराठी / हिंदी).

### 2. Login View (`LoginView.tsx`)
- Top: Back button to Role Portal + Active Role Chip.
- Middle: 
  - Mobile number input with `+91` prefix pill.
  - Role-specific identifier field (VCI Registration for Doctor, Admin Passkey for Admin).
  - Voice assistance prompt pill (*"मोबाइल नंबर प्रविष्ट करा"*).
- Bottom: Full-width 52px primary action button: *"Send OTP (ओटीपी पाठवा)"*.

### 3. OTP Verification View (`OtpVerificationView.tsx`)
- Top: Back button + Sent-to mobile confirmation with edit icon.
- Middle:
  - 6 auto-advancing single-character input boxes.
  - Quick-fill demo button (*"SIH Demo Auto-Fill"*).
- Bottom:
  - 30s countdown timer or *"Resend OTP"* link.
  - Full-width *"Verify & Proceed (सत्यापित करा)"* CTA button.

### 4. Sequential Onboarding View (`OnboardingView.tsx`)
- Progress indicator: Step 1 (Personal Info) → Step 2 (Jurisdiction & LGD Village).
- Clean form cards with accessible labels.
- Localized dropdowns for District, Taluka/Block, and Village.

### 5. 4-Digit PIN Setup & Unlock (`OfflinePinView.tsx`)
- Top: Shield icon + Lock/Unlock instruction.
- Middle: 4 masked dot indicators (`● ● ○ ○`) animating on input.
- Bottom: Large 3x4 custom numeric keypad with haptic vibrations on tap.

### 6. User Profile View (`UserProfileView.tsx`)
- Profile card with DPDP masked phone, role badge, jurisdiction, and verification badge.
- Action list:
  - Change 4-Digit Offline PIN
  - Language Settings
  - Offline Sync Queue Status
  - Fast Demo Persona Switcher (retained for hackathon convenience)
  - Logout (Red outlined button)

# Phase 11: Role-Based Authentication Screens & User Onboarding - Research

**Phase:** 11  
**Status:** In-Planning  
**Domain:** Sequential Role-Based Authentication, Vernacular OTP, Offline Security PIN, LGD Onboarding, DPDP Act Compliance  
**Requirements Addressed:** `AUTH-01`, `AUTH-02`, `AUTH-03`, `AUTH-04`, `AUTH-05`  

---

## 1. Domain Overview & Problem Statement

Phase 3.1 established a demonstration-oriented role shell and instant switcher (`RoleSelectionView.tsx`). However, in real-world deployment across rural India, livestock surveillance data collection must be authenticated, attributed, and protected under India's **Digital Personal Data Protection (DPDP) Act 2023**. Furthermore, field veterinarians and Pashu Sakhis frequently operate in complete cellular dead zones where online SMS verification is impossible once deployed to remote hamlets.

This phase introduces a complete sequential authentication pipeline:
```
[Role Portal] ➔ [Role-Tailored Login] ➔ [6-Digit OTP Verification] ➔ [LGD Onboarding] ➔ [4-Digit Offline PIN] ➔ [App Home / Profile]
```

---

## 2. Persona Matrix & Credentials

| Role | Target User | Login Identifier | Verification Flow | Secondary Credential |
|:---|:---|:---|:---|:---|
| **Farmer (पशुपालक)** | Cattle/goat owner, rural dairy farmer | 10-digit Mobile Number | 6-Digit OTP / 4-Digit PIN | LGD Village Name |
| **Doctor / Pashu Sakhi (पशुवैद्य)** | Field Vet, Para-vet, Pashu Sakhi | 10-digit Mobile Number | 6-Digit OTP / 4-Digit PIN | Veterinary Council Registration (VCI No.) / Sakhi ID |
| **Admin (जिल्हा अधिकारी)** | District Veterinary Officer (DVO), Epidemiologist | 10-digit Mobile / Official Email | 6-Digit OTP / 4-Digit PIN | Administrative Officer Authorization Passkey |

---

## 3. Screen Specifications & Engineering Patterns

### A. Role Portal (`RolePortalView.tsx`)
- Presents 3 visual stakeholder options:
  - 👨‍🌾 **पशुपालक (Livestock Owner / Farmer)**
  - 🩺 **पशुवैद्य / पशु सखी (Field Veterinarian & Para-vet)**
  - 🏛️ **जिल्हा अधिकारी (District Animal Husbandry Officer)**
- Direct entry point for unauthenticated users or upon explicit logout.
- Retains language selector (English, Marathi, Hindi) at the top/bottom.

### B. Role-Tailored Login (`LoginView.tsx`)
- Form dynamically adapts based on the chosen role:
  - **Farmer**: 10-digit phone number with `+91` prefix, numeric virtual keyboard, voice prompt tooltip.
  - **Doctor**: 10-digit phone number + Veterinary Council Registration / Sakhi ID (e.g. `MH-VET-2024-8819`).
  - **Admin**: 10-digit phone / official email + District Authorization Passcode (`DVO-AUTH-AHM`).
- Validates 10-digit Indian phone regex (`^[6-9]\d{9}$`).
- Provides tactile haptic feedback on invalid submit or proceed.

### C. 6-Digit OTP Verification (`OtpVerificationView.tsx`)
- Six discrete input blocks (min 48x54px, 52px thumb ergonomics).
- Auto-focus forward movement on single digit keypress; auto-backward movement on `Backspace`.
- Clipboard paste listener that distributes pasted 6-digit text across inputs.
- 30-second countdown timer for resend request.
- **Hackathon & Offline Acceleration**: 1-click `"Auto-Fill SIH Demo OTP"` button (`123456`) allowing zero-delay jury evaluations.

### D. Sequential LGD Jurisdiction Onboarding (`OnboardingView.tsx`)
- For newly registered users:
  - Step 1: User name, role confirmation, contact info.
  - Step 2: LGD administrative hierarchy picker:
    - State: Maharashtra
    - District: Ahmednagar, Pune, Solapur, Nashik (pre-populated)
    - Block / Taluka: Rahuri, Sangamner, Kopargaon, Shrirampur
    - Village: Rahuri Khurd, Chinchodi, Tambhere, etc.
- Persists user profile to SQLite `user_credentials` table.
- Enforces DPDP Act compliance: Farmer phone numbers stored with SHA-256 hash and masked display string (`+91 9822X-XX412`).

### E. 4-Digit Offline Security PIN (`OfflinePinView.tsx`)
- **Offline Dead Zone Requirement**: When field workers operate outside cellular connectivity, SMS OTP cannot be sent. The app uses a 4-digit Security PIN stored in encrypted SQLite.
- **Modes**:
  1. `setup`: User sets and confirms a 4-digit PIN following initial onboarding.
  2. `unlock`: When opening the app or unlocking a locked session in dead zones.
- **Security**:
  - PIN is hashed before comparison or storage.
  - Max 5 failed attempts before a 60-second cooldown timer activates.
  - Custom 3x4 numeric keypad with large 64px circular touch buttons and haptic feedback.

### F. User Profile & Session Management (`UserProfileView.tsx`)
- Shows current active user card with DPDP-compliant masked phone and LGD assignment.
- Lists offline queue status (e.g., 2 reports pending sync).
- Includes:
  - Change 4-Digit PIN button.
  - Language Preference toggle.
  - **Instant Role Switcher** shortcut (ensures SIH hackathon demonstration script remains 100% accessible).
  - Secure **Sign Out** button (clears session, returns to Role Portal).

---

## 4. State Store & Database Schema

### Zustand Store Extensions (`useAuthStore.ts`):
```typescript
interface AuthState {
  // Existing
  activeRole: UserRole;
  userProfile: UserProfile;
  isInitialized: boolean;
  switchRole: (role: UserRole) => Promise<void>;
  initSession: () => Promise<void>;
  
  // New Phase 11 Extensions
  isAuthenticated: boolean;
  isLocked: boolean;
  hasOfflinePin: boolean;
  loginStep: 'portal' | 'login' | 'otp' | 'onboarding' | 'pin_setup' | 'pin_unlock' | 'authenticated';
  setLoginStep: (step: LoginStep) => void;
  requestOtp: (phone: string, role: UserRole, secondaryId?: string) => Promise<boolean>;
  verifyOtp: (otp: string) => Promise<boolean>;
  setupOfflinePin: (pin: string) => Promise<boolean>;
  unlockWithPin: (pin: string) => Promise<boolean>;
  completeOnboarding: (profile: Partial<UserProfile>) => Promise<boolean>;
  logout: () => Promise<void>;
}
```

### SQLite Schema Extensions (`sqliteConnection.ts`):
```sql
CREATE TABLE IF NOT EXISTS user_credentials (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL,
  full_name TEXT NOT NULL,
  mobile_hash TEXT NOT NULL,
  mobile_masked TEXT NOT NULL,
  license_or_id TEXT,
  district TEXT NOT NULL,
  block TEXT NOT NULL,
  village TEXT,
  offline_pin_hash TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_session (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  active_role TEXT NOT NULL,
  display_name TEXT NOT NULL,
  district TEXT NOT NULL,
  block TEXT NOT NULL,
  is_locked INTEGER DEFAULT 0,
  updated_at TEXT NOT NULL
);
```

---

## 5. Validation Architecture

### Vitest Test Suite (`mobile/src/tests/authScreens.test.ts`):
1. **Role Portal & Navigation**:
   - Renders 3 persona cards with Devanagari labels and 52px touch targets.
   - Selecting a card navigates to the role-tailored login screen.
2. **Login Form Validation**:
   - Rejects invalid phone numbers (<10 digits or non-Indian format).
   - Enforces VCI license input for Doctor role.
   - Enforces Admin passkey for Admin role.
3. **6-Digit OTP Interaction**:
   - Verifies auto-advance across the 6 inputs.
   - Verifies SIH demo auto-fill fills `123456` and enables submit.
   - Verifies countdown timer disables and re-enables the resend link.
4. **Offline PIN Engine**:
   - Tests PIN setup and confirmation matching.
   - Tests successful unlock with correct PIN.
   - Tests lockout after 5 consecutive incorrect attempts.
5. **Session Lifecycle & Logout**:
   - Verifies logout resets state to `portal` and clears SQLite session.
   - Verifies demo role-switch updates active profile and dynamic navigation without requiring re-authentication.

import { create } from 'zustand';
import { dbService } from '../database/sqliteConnection';
import { hapticsService } from '../services/hapticsService';
import { useNavigationStore } from './navigationStore';
import { auth } from '../config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';

export type UserRole = 'consumer' | 'doctor' | 'admin';

export type LoginStep =
  | 'portal'
  | 'login'            // consumer (email/OTP)
  | 'doctor_login'     // doctor: email + VCI license
  | 'admin_login'      // admin: email + employee ID, no signup
  | 'onboarding'
  | 'pin_setup'
  | 'pin_unlock'
  | 'authenticated';

export interface UserProfile {
  id: string;
  name: string;
  nameMarathi: string;
  nameHindi?: string;
  role: UserRole;
  mobileNumberMasked: string;
  district: string;
  block: string;
  village?: string;
  titleMarathi: string;
  titleHindi?: string;
  titleEnglish?: string;
  licenseOrId?: string;
  workplace?: string;
  specializationOrHerd?: string;
  offlinePinHash?: string;
}

export const DEFAULT_PROFILE: UserProfile = {
  id: '',
  name: '',
  nameMarathi: '',
  role: 'consumer',
  mobileNumberMasked: '',
  district: 'Ahmednagar',
  block: 'Rahuri',
  village: 'Ashwi Budruk',
  titleMarathi: '',
};

export interface RealUserAccount extends UserProfile {
  email: string;
  phoneRaw: string;
  avatarEmoji: string;
  specializationOrHerd: string;
  workplace: string;
}

export const REAL_FARMER_USERS: RealUserAccount[] = [
  {
    ...DEFAULT_PROFILE,
    id: 'farmer-101-ashwi',
    name: 'Dnyaneshwar Shinde',
    nameMarathi: 'ज्ञानेश्वर विठ्ठल शिंदे',
    nameHindi: 'ज्ञानेश्वर विट्ठल शिंदे',
    role: 'consumer',
    mobileNumberMasked: '+91 94231-50821',
    district: 'Ahmednagar',
    block: 'Rahuri',
    village: 'Ashwi Budruk',
    titleMarathi: 'दुग्ध उत्पादक शेतकरी',
    titleHindi: 'दुग्ध उत्पादक किसान',
    titleEnglish: 'Dairy Cattle Farmer',
    email: 'dnyaneshwar.shinde@pashu.in',
    phoneRaw: '9423150821',
    avatarEmoji: '👨‍🌾',
    specializationOrHerd: '4 संकरित HF गायी (Dairy Herd)',
    workplace: 'आश्वी बुद्रुक, राहुरी',
  },
  {
    ...DEFAULT_PROFILE,
    id: 'usr_farmer_ramesh',
    name: 'Ramesh Sakharam Patil',
    nameMarathi: 'रमेश सखाराम पाटील',
    nameHindi: 'रमेश सखाराम पाटिल',
    role: 'consumer',
    mobileNumberMasked: '+91 98220-00412',
    district: 'Ahmednagar',
    block: 'Rahuri',
    village: 'Rahuri Khurd',
    titleMarathi: 'गिर गाय संवर्धक शेतकरी',
    titleHindi: 'गीर गाय पालक किसान',
    titleEnglish: 'Gir Cattle Breeder & Dairy Farmer',
    email: 'ramesh.patil@pashu.in',
    phoneRaw: '9822000412',
    avatarEmoji: '🤠',
    specializationOrHerd: '६ शुद्ध देशी गिर गायी (Gir Cattle)',
    workplace: 'राहुरी खुर्द, राहुरी',
  },
  {
    ...DEFAULT_PROFILE,
    id: 'usr_farmer_balasaheb',
    name: 'Balasaheb Vitthal Gade',
    nameMarathi: 'बाळासाहेब विठ्ठल गाडे',
    nameHindi: 'बालासाहेब विट्ठल गाडे',
    role: 'consumer',
    mobileNumberMasked: '+91 94239-11109',
    district: 'Ahmednagar',
    block: 'Rahuri',
    village: 'Deolali Pravara',
    titleMarathi: 'मुऱ्हा म्हैस दुग्ध व्यावसायिक',
    titleHindi: 'मुर्रा भैंस दुग्ध उत्पादक',
    titleEnglish: 'Commercial Murrah Buffalo Farmer',
    email: 'balasaheb.gade@pashu.in',
    phoneRaw: '9423911109',
    avatarEmoji: '🌾',
    specializationOrHerd: '८ मुऱ्हा म्हशी (Murrah Buffaloes)',
    workplace: 'देवळाली प्रवरा, राहुरी',
  },
  {
    ...DEFAULT_PROFILE,
    id: 'farmer_sunita_shinde',
    name: 'Sunita Kisan Shinde',
    nameMarathi: 'सुनिता किसन शिंदे',
    nameHindi: 'सुनीता किसन शिंदे',
    role: 'consumer',
    mobileNumberMasked: '+91 96041-88234',
    district: 'Ahmednagar',
    block: 'Sangamner',
    village: 'Sangamner Rural',
    titleMarathi: 'उस्मानाबादी शेळी-मेंढी पालक',
    titleHindi: 'उस्मानाबादी बकरी पालक',
    titleEnglish: 'Osmanabadi Goat & Sheep Smallholder',
    email: 'sunita.shinde@pashu.in',
    phoneRaw: '9604188234',
    avatarEmoji: '👩‍🌾',
    specializationOrHerd: '१२ उस्मानाबादी शेळ्या व मेंढ्या',
    workplace: 'संगमनेर ग्रामीण, संगमनेर',
  },
];

export const REAL_VET_USERS: RealUserAccount[] = [
  {
    ...DEFAULT_PROFILE,
    id: 'doc_ananya_deshmukh',
    name: 'Dr. Ananya Deshmukh',
    nameMarathi: 'डॉ. अनन्या देशमुख',
    nameHindi: 'डॉ. अनन्या देशमुख',
    role: 'doctor',
    mobileNumberMasked: '+91 94220-01842',
    district: 'Ahmednagar',
    block: 'Rahuri',
    village: 'Rahuri Khurd',
    titleMarathi: 'तालुका पशुवैद्यकीय अधिकारी (BVO)',
    titleHindi: 'ब्लॉक पशु चिकित्सा अधिकारी (BVO)',
    titleEnglish: 'Block Veterinary Officer (BVO)',
    licenseOrId: 'MH-VET-2022-4109',
    email: 'ananya.deshmukh@ahvd.in',
    phoneRaw: '9422001842',
    avatarEmoji: '👩‍⚕️',
    specializationOrHerd: 'B.V.Sc & A.H. • संसर्गजन्य रोग व साथ नियंत्रण',
    workplace: 'राहुरी तालुका पशुवैद्यकीय दवाखाना',
  },
  {
    ...DEFAULT_PROFILE,
    id: 'doc-401-ahmednagar',
    name: 'Dr. Amit Patil',
    nameMarathi: 'डॉ. अमित पाटील',
    nameHindi: 'डॉ. अमित पाटिल',
    role: 'doctor',
    mobileNumberMasked: '+91 98220-44102',
    district: 'Ahmednagar',
    block: 'Rahuri',
    village: 'Ashwi Budruk',
    titleMarathi: 'पशुधन विकास अधिकारी (LDO)',
    titleHindi: 'पशुधन विकास अधिकारी (LDO)',
    titleEnglish: 'Livestock Development Officer (LDO)',
    licenseOrId: 'MH-VET-2024-8819',
    email: 'amit.patil@ahvd.in',
    phoneRaw: '9822044102',
    avatarEmoji: '👨‍⚕️',
    specializationOrHerd: 'M.V.Sc (Epidemiology) • क्लिनिकल पॅथॉलॉजी',
    workplace: 'आश्वी बुद्रुक पशु सर्वचिकित्सालय (Polyclinic)',
  },
  {
    ...DEFAULT_PROFILE,
    id: 'doc_vikram_jadhav',
    name: 'Dr. Vikram Jadhav',
    nameMarathi: 'डॉ. विक्रम जाधव',
    nameHindi: 'डॉ. विक्रम जाधव',
    role: 'doctor',
    mobileNumberMasked: '+91 98500-12890',
    district: 'Ahmednagar',
    block: 'Sangamner',
    village: 'Sangamner Rural',
    titleMarathi: 'फिरता पशुवैद्यकीय पथक अधिकारी (MVU)',
    titleHindi: 'सचल पशु चिकित्सा अधिकारी (MVU)',
    titleEnglish: 'Mobile Veterinary Unit (MVU) Officer',
    licenseOrId: 'MH-VET-2023-6521',
    email: 'vikram.jadhav@ahvd.in',
    phoneRaw: '9850012890',
    avatarEmoji: '🚑',
    specializationOrHerd: 'B.V.Sc • दुर्गम भाग आपत्कालीन उपचार',
    workplace: 'संगमनेर फिरते पशुवैद्यकीय पथक (MVU)',
  },
  {
    ...DEFAULT_PROFILE,
    id: 'paravet_shital_gaikwad',
    name: 'Shital Gaikwad',
    nameMarathi: 'शितलताई गायकवाड',
    nameHindi: 'शीतल गायकवाड़',
    role: 'doctor',
    mobileNumberMasked: '+91 97633-55201',
    district: 'Ahmednagar',
    block: 'Rahuri',
    village: 'Deolali Pravara',
    titleMarathi: 'प्रमाणित पशु सखी (Community Para-Vet)',
    titleHindi: 'प्रमाणित पशु सखी (पैरा-वेट)',
    titleEnglish: 'Pashu Sakhi (Community Para-Vet)',
    licenseOrId: 'MH-PARA-2023-1102',
    email: 'shital.gaikwad@ahvd.in',
    phoneRaw: '9763355201',
    avatarEmoji: '🩺',
    specializationOrHerd: 'MSRLM प्रमाणित • लसीकरण व प्राथमिक उपचार',
    workplace: 'ग्रामपंचायत उपकेंद्र, देवळाली प्रवरा',
  },
];

export const REAL_ADMIN_USERS: RealUserAccount[] = [
  {
    ...DEFAULT_PROFILE,
    id: 'admin-001-dvo',
    name: 'Dr. Sunil Deshmukh',
    nameMarathi: 'डॉ. सुनिल देशमुख',
    nameHindi: 'डॉ. सुनील देशमुख',
    role: 'admin',
    mobileNumberMasked: '+91 98230-55109',
    district: 'Ahmednagar',
    block: 'Nagar',
    titleMarathi: 'जिल्हा पशुसंवर्धन अधिकारी (DVO)',
    titleHindi: 'जिला पशुपालन अधिकारी (DVO)',
    titleEnglish: 'District Animal Husbandry Officer',
    licenseOrId: 'DVO-AHM-001',
    email: 'dvo.ahmednagar@ahvd.maharashtra.gov.in',
    phoneRaw: '9823055109',
    avatarEmoji: '🏛️',
    specializationOrHerd: 'जिल्हा नियंत्रण व रोग प्रतिबंधक प्राधिकरण',
    workplace: 'जिल्हा पशुसंवर्धन कार्यालय, अहमदनगर',
  },
];

export async function hashString(input: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(input);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // fallback
    }
  }
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(16);
}

export function maskPhoneNumber(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  if (clean.length < 10) return '+91 ' + clean;
  const last10 = clean.slice(-10);
  return `+91 ${last10.slice(0, 4)}X-XX${last10.slice(7)}`;
}

/** Reads the authoritative role from Firebase token custom claims. */
async function getRoleFromTokenClaims(user: User): Promise<UserRole> {
  try {
    const idTokenResult = await user.getIdTokenResult(/* forceRefresh */ true);
    const claimedRole = idTokenResult.claims['role'] as UserRole | undefined;
    if (claimedRole && ['consumer', 'doctor', 'admin'].includes(claimedRole)) {
      return claimedRole;
    }
  } catch {
    // ignore — fall back to consumer
  }
  return 'consumer';
}

/** Calls backend to validate secondary credential and stamp Firebase custom claim. */
async function verifyRoleCredential(params: {
  uid: string;
  role: UserRole;
  secondaryId?: string;
  name?: string;
  phone?: string;
}): Promise<{ success: boolean; roleConfirmed: UserRole; message: string }> {
  const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  const token = localStorage.getItem('pashu_auth_token') || '';
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${BACKEND_URL}/auth/verify-role-credential`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        uid: params.uid,
        role: params.role,
        secondary_id: params.secondaryId || null,
        name: params.name || null,
        phone: params.phone || null,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Credential verification failed' }));
      throw new Error(err.detail || 'Role credential verification failed');
    }
    const data = await res.json();
    return { success: data.success, roleConfirmed: data.role_confirmed, message: data.message };
  } catch (err: any) {
    // If it was a deliberate rejection message from backend (400, 422, 403), rethrow
    if (err.message && !err.message.includes('fetch') && !err.message.includes('AbortError') && !err.message.includes('NetworkError')) {
      throw err;
    }
    // Offline / Android APK dead-zone fallback:
    // Validate secondary ID format locally using national veterinary / DVO standards
    if (params.role === 'doctor') {
      const vciRegex = /^(MH|KA|UP|RJ|GJ)-(?:VET|PARA|LDO)-\d{4}-?\d{2,6}$/i;
      if (!params.secondaryId || !vciRegex.test(params.secondaryId.trim())) {
        throw new Error('Invalid VCI License format. Expected e.g. MH-VET-2022-4109 or MH-PARA-2023-1102');
      }
    } else if (params.role === 'admin') {
      const adminRegex = /^(DVO-[A-Z]{3}-\d{3}|ADMIN-SIH-2026)$/i;
      if (!params.secondaryId || !adminRegex.test(params.secondaryId.trim())) {
        throw new Error('Invalid Admin ID. Expected e.g. DVO-AHM-001 or ADMIN-SIH-2026');
      }
    }
    return { success: true, roleConfirmed: params.role, message: 'Verified' };
  }
}

interface AuthState {
  activeRole: UserRole;
  userProfile: UserProfile;
  isInitialized: boolean;
  isAuthenticated: boolean;
  isLocked: boolean;
  hasOfflinePin: boolean;
  loginStep: LoginStep;
  pendingPhone: string;
  pendingSecondaryId: string;
  otpError: string | null;
  otpCountdown: number;
  failedPinAttempts: number;
  lockoutUntil: number | null;

  // Actions
  setLoginStep: (step: LoginStep) => void;
  /** Routes to the correct role-specific login screen. No role switching after auth. */
  selectRoleAndProceed: (role: UserRole) => void;
  loginWithEmail: (email: string, pass: string, secondaryId?: string) => Promise<boolean>;
  registerWithEmail: (
    email: string,
    pass: string,
    name?: string,
    phone?: string,
    secondaryId?: string,
  ) => Promise<boolean>;
  loginAsDemoRole: (role: UserRole) => void;
  loginAsSpecificUser: (profile: UserProfile) => void;
  logout: () => Promise<void>;
  initSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  activeRole: 'consumer',
  userProfile: DEFAULT_PROFILE,
  isInitialized: false,
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

  setLoginStep: (step: LoginStep) => {
    set({ loginStep: step });
  },

  selectRoleAndProceed: (role: UserRole) => {
    // Route to the correct role-specific login step
    const stepMap: Record<UserRole, LoginStep> = {
      consumer: 'login',
      doctor: 'doctor_login',
      admin: 'admin_login',
    };
    set({
      activeRole: role,
      loginStep: stepMap[role],
      otpError: null,
    });
    hapticsService.hapticLight();
  },

  loginWithEmail: async (email: string, pass: string, secondaryId?: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const token = await cred.user.getIdToken();
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('pashu_auth_token', token);
      }

      const role = get().activeRole;
      const formattedName = cred.user.displayName || email.split('@')[0];

      // Read authoritative custom claim from Firebase token if present
      const tokenClaimRole = await getRoleFromTokenClaims(cred.user);
      let confirmedRole: UserRole = tokenClaimRole || role;

      // Step 1: verify secondary credential + stamp Firebase custom claim
      try {
        const result = await verifyRoleCredential({
          uid: cred.user.uid,
          role: confirmedRole,
          secondaryId,
          name: formattedName,
        });
        confirmedRole = result.roleConfirmed;
      } catch (credErr: any) {
        // Credential rejected — sign out immediately, show error
        await signOut(auth);
        localStorage.removeItem('pashu_auth_token');
        hapticsService.hapticError();
        set({ otpError: credErr.message });
        return false;
      }

      // Step 2: force-refresh token to pick up the new custom claim
      const freshToken = await cred.user.getIdToken(/* forceRefresh */ true);
      localStorage.setItem('pashu_auth_token', freshToken);

      // Find known provisioned profile or fallback to defaults
      const allKnownUsers = [...REAL_FARMER_USERS, ...REAL_VET_USERS, ...REAL_ADMIN_USERS];
      const matched = allKnownUsers.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      );

      const profile: UserProfile = matched
        ? {
            ...DEFAULT_PROFILE,
            id: cred.user.uid,
            name: matched.name,
            nameMarathi: matched.nameMarathi || matched.name,
            nameHindi: matched.nameHindi || matched.name,
            role: matched.role || confirmedRole,
            mobileNumberMasked: matched.mobileNumberMasked,
            district: matched.district,
            block: matched.block,
            village: matched.village,
            licenseOrId: matched.licenseOrId || secondaryId,
            workplace: matched.workplace,
            titleEnglish: matched.titleEnglish,
            titleMarathi: matched.titleMarathi,
            titleHindi: matched.titleHindi,
            specializationOrHerd: matched.specializationOrHerd,
          }
        : {
            ...DEFAULT_PROFILE,
            id: cred.user.uid,
            name: formattedName,
            nameMarathi: formattedName,
            role: confirmedRole,
            licenseOrId: secondaryId,
          };

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('pashu_user_profile', JSON.stringify(profile));
      }

      set({
        isAuthenticated: true,
        loginStep: 'authenticated',
        userProfile: profile,
        activeRole: confirmedRole,
        otpError: null,
      });
      useNavigationStore.getState().validateTabForRole(confirmedRole);
      hapticsService.hapticLight();
      return true;
    } catch (error: any) {
      hapticsService.hapticError();
      set({ otpError: error.message || 'Login failed' });
      return false;
    }
  },

  registerWithEmail: async (
    email: string,
    pass: string,
    name?: string,
    phone?: string,
    secondaryId?: string,
  ) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const token = await cred.user.getIdToken();
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('pashu_auth_token', token);
      }

      const role = get().activeRole;
      const formattedName = name?.trim() || email.split('@')[0];
      const maskedPhone = phone ? maskPhoneNumber(phone) : '+91 98XXX-XXXXX';

      // Verify secondary credential + stamp Firebase custom claim
      let confirmedRole: UserRole = role;
      try {
        const result = await verifyRoleCredential({
          uid: cred.user.uid,
          role,
          secondaryId,
          name: formattedName,
          phone,
        });
        confirmedRole = result.roleConfirmed;
      } catch (credErr: any) {
        // Credential rejected — delete the newly created Firebase account + bail
        await cred.user.delete().catch(() => {});
        localStorage.removeItem('pashu_auth_token');
        hapticsService.hapticError();
        set({ otpError: credErr.message });
        return false;
      }

      // Force-refresh token
      const freshToken = await cred.user.getIdToken(true);
      localStorage.setItem('pashu_auth_token', freshToken);

      const profile: UserProfile = {
        ...DEFAULT_PROFILE,
        id: cred.user.uid,
        name: formattedName,
        nameMarathi: formattedName,
        role: confirmedRole,
        mobileNumberMasked: maskedPhone,
        district: 'Ahmednagar',
        block: 'Rahuri',
        village: 'Ashwi Budruk',
      };

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('pashu_user_profile', JSON.stringify(profile));
      }

      set({
        isAuthenticated: true,
        loginStep: 'authenticated',
        userProfile: profile,
        activeRole: confirmedRole,
        otpError: null,
      });
      useNavigationStore.getState().validateTabForRole(confirmedRole);
      hapticsService.hapticLight();
      return true;
    } catch (error: any) {
      hapticsService.hapticError();
      set({ otpError: error.message || 'Registration failed' });
      return false;
    }
  },

  loginAsSpecificUser: (profile: UserProfile) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('pashu_user_profile', JSON.stringify(profile));
      localStorage.setItem('pashu_auth_token', `demo_${profile.role}_token`);
    }

    set({
      isAuthenticated: true,
      loginStep: 'authenticated',
      userProfile: profile,
      activeRole: profile.role,
      isInitialized: true,
      otpError: null,
    });
    useNavigationStore.getState().validateTabForRole(profile.role);
    hapticsService.hapticLight();
  },

  loginAsDemoRole: (role: UserRole) => {
    if (role === 'doctor') {
      get().loginAsSpecificUser(REAL_VET_USERS[0]);
    } else if (role === 'admin') {
      get().loginAsSpecificUser(REAL_ADMIN_USERS[0]);
    } else {
      get().loginAsSpecificUser(REAL_FARMER_USERS[0]);
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('pashu_auth_token');
        localStorage.removeItem('pashu_user_profile');
      }
      set({
        isAuthenticated: false,
        isLocked: false,
        loginStep: 'portal',
        otpError: null,
        activeRole: 'consumer',
        userProfile: DEFAULT_PROFILE,
      });
      hapticsService.hapticLight();
    } catch (error) {
      console.error('Logout failed', error);
    }
  },

  initSession: async () => {
    let savedProfile: UserProfile | null = null;
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('pashu_user_profile');
      if (raw) {
        try {
          savedProfile = JSON.parse(raw);
        } catch (e) {}
      }
    }

    onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        // Authoritative role comes from Firebase token custom claims, NOT localStorage
        const claimedRole = await getRoleFromTokenClaims(user);
        const freshToken = await user.getIdToken(true);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('pashu_auth_token', freshToken);
        }

        const emailToName = user.displayName || (user.email ? user.email.split('@')[0] : 'User');
        const profile: UserProfile = {
          ...DEFAULT_PROFILE,
          ...(savedProfile || {}),
          id: user.uid,
          name: savedProfile?.name || emailToName,
          nameMarathi: savedProfile?.nameMarathi || savedProfile?.name || emailToName,
          role: claimedRole, // always trust the token claim
        };

        // Sync saved profile role with authoritative claim
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('pashu_user_profile', JSON.stringify(profile));
        }

        set({
          isAuthenticated: true,
          loginStep: 'authenticated',
          userProfile: profile,
          activeRole: claimedRole,
          isInitialized: true,
        });
        useNavigationStore.getState().validateTabForRole(claimedRole);
      } else {
        // Support persistent demo session when Firebase auth is offline or demo mode is used
        if (savedProfile && typeof localStorage !== 'undefined' && localStorage.getItem('pashu_auth_token')?.startsWith('demo_')) {
          set({
            isAuthenticated: true,
            loginStep: 'authenticated',
            userProfile: savedProfile,
            activeRole: savedProfile.role,
            isInitialized: true,
          });
          useNavigationStore.getState().validateTabForRole(savedProfile.role);
          return;
        }

        set({
          isAuthenticated: false,
          loginStep: 'portal',
          isInitialized: true,
          activeRole: 'consumer',
          userProfile: DEFAULT_PROFILE,
        });
      }
    });
  },
}));

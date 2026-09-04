import { create } from 'zustand';
import { dbService } from '../database/sqliteConnection';
import { hapticsService } from '../services/hapticsService';
import { useNavigationStore } from './navigationStore';

export type UserRole = 'consumer' | 'doctor' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  nameMarathi: string;
  role: UserRole;
  mobileNumberMasked: string;
  district: string;
  block: string;
  titleMarathi: string;
  licenseOrId?: string;
}

export const DEMO_PERSONAS: Record<UserRole, UserProfile> = {
  consumer: {
    id: 'usr_farmer_01',
    name: 'Ramesh Patil',
    nameMarathi: 'रमेश पाटील',
    role: 'consumer',
    titleMarathi: 'पशुपालक (दुग्ध उत्पादक)',
    mobileNumberMasked: '+91 9822X-XX412',
    district: 'Ahmednagar',
    block: 'Rahuri Khurd',
  },
  doctor: {
    id: 'usr_vet_02',
    name: 'Dr. Anjali Deshmukh',
    nameMarathi: 'डॉ. अंजली देशमुख',
    role: 'doctor',
    titleMarathi: 'पशुधन विकास अधिकारी (LDO)',
    mobileNumberMasked: '+91 9423X-XX819',
    district: 'Ahmednagar',
    block: 'Rahuri & Sangamner',
    licenseOrId: 'MH-VET-2024-8819',
  },
  admin: {
    id: 'usr_dvo_03',
    name: 'Dr. S. K. Kulkarni',
    nameMarathi: 'डॉ. एस. के. कुलकर्णी',
    role: 'admin',
    titleMarathi: 'जिल्हा पशुसंवर्धन अधिकारी (DVO)',
    mobileNumberMasked: '+91 9158X-XX001',
    district: 'Ahmednagar',
    block: 'District Headquarters',
    licenseOrId: 'DVO-AHM-001',
  },
};

interface AuthState {
  activeRole: UserRole;
  userProfile: UserProfile;
  isInitialized: boolean;
  switchRole: (role: UserRole) => Promise<void>;
  initSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  activeRole: 'consumer',
  userProfile: DEMO_PERSONAS.consumer,
  isInitialized: false,

  switchRole: async (role: UserRole) => {
    const profile = DEMO_PERSONAS[role] || DEMO_PERSONAS.consumer;
    set({ activeRole: role, userProfile: profile });
    useNavigationStore.getState().validateTabForRole(role);
    hapticsService.hapticLight();

    try {
      await dbService.execute(
        `INSERT OR REPLACE INTO auth_session (id, active_role, display_name, district, block, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['current_session', role, profile.nameMarathi, profile.district, profile.block, new Date().toISOString()]
      );
    } catch (err) {
      console.warn('Failed to persist auth session to SQLite:', err);
    }
  },

  initSession: async () => {
    try {
      await dbService.initDatabase();
      const rows = await dbService.query<{ active_role: string }>(
        `SELECT active_role FROM auth_session WHERE id = 'current_session' LIMIT 1`
      );
      if (rows && rows.length > 0 && rows[0].active_role) {
        const savedRole = rows[0].active_role as UserRole;
        if (DEMO_PERSONAS[savedRole]) {
          set({
            activeRole: savedRole,
            userProfile: DEMO_PERSONAS[savedRole],
            isInitialized: true,
          });
          return;
        }
      }
    } catch (err) {
      console.warn('Could not restore auth session from SQLite:', err);
    }
    set({ isInitialized: true });
  },
}));

import { create } from 'zustand';

export type TabType = 'report' | 'dashboard' | 'animals' | 'labs';

interface NavigationState {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  validateTabForRole: (role: 'consumer' | 'doctor' | 'admin') => void;
  isEmergencyModalOpen: boolean;
  setEmergencyModalOpen: (open: boolean) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  activeTab: 'report',
  setActiveTab: (tab) => set({ activeTab: tab }),
  validateTabForRole: (role) => {
    const current = get().activeTab;
    if (role === 'consumer' && current === 'labs') {
      set({ activeTab: 'report' });
    }
  },
  isEmergencyModalOpen: false,
  setEmergencyModalOpen: (open) => set({ isEmergencyModalOpen: open }),
  isDarkMode: false, // Outdoor sunlight mode is default per D-01
  toggleDarkMode: () =>
    set((state) => {
      const next = !state.isDarkMode;
      if (typeof document !== 'undefined') {
        if (next) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      return { isDarkMode: next };
    }),
}));

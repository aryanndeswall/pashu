import React from 'react';
import { FileText, Activity, Shield, FlaskConical } from 'lucide-react';
import { useNavigationStore, TabType } from '../../store/navigationStore';
import { useAuthStore, UserRole } from '../../store/authStore';
import { SOSButton } from './SOSButton';
import { hapticsService } from '../../services/hapticsService';

interface TabItemConfig {
  id: TabType;
  labelMarathi: string;
  labelEnglish: string;
  icon: React.FC<{ className?: string }>;
}

export const BottomBar: React.FC = () => {
  const activeTab = useNavigationStore((state) => state.activeTab);
  const setActiveTab = useNavigationStore((state) => state.setActiveTab);
  const activeRole = useAuthStore((state) => state.activeRole);

  const handleTabClick = async (tabId: TabType) => {
    if (tabId !== activeTab) {
      setActiveTab(tabId);
      await hapticsService.hapticLight();
    }
  };

  // Build role-specific tab configuration
  const getTabConfig = (role: UserRole): { left: TabItemConfig[]; right: TabItemConfig[] } => {
    switch (role) {
      case 'consumer':
        return {
          left: [
            {
              id: 'report',
              labelMarathi: 'लक्षणे नोंदवा',
              labelEnglish: 'Report',
              icon: FileText,
            },
          ],
          right: [
            {
              id: 'dashboard',
              labelMarathi: 'स्थानिक स्थिती',
              labelEnglish: 'Status',
              icon: Activity,
            },
            {
              id: 'animals',
              labelMarathi: 'माझे पशु',
              labelEnglish: 'My Animals',
              icon: Shield,
            },
          ],
        };
      case 'doctor':
        return {
          left: [
            {
              id: 'report',
              labelMarathi: '८ लक्षणे',
              labelEnglish: 'Triage',
              icon: FileText,
            },
            {
              id: 'dashboard',
              labelMarathi: 'डॅशबोर्ड',
              labelEnglish: 'Dashboard',
              icon: Activity,
            },
          ],
          right: [
            {
              id: 'animals',
              labelMarathi: 'पशु आधार',
              labelEnglish: 'Animals',
              icon: Shield,
            },
            {
              id: 'labs',
              labelMarathi: 'प्रयोगशाळा',
              labelEnglish: 'Labs',
              icon: FlaskConical,
            },
          ],
        };
      case 'admin':
        return {
          left: [
            {
              id: 'dashboard',
              labelMarathi: 'कमांड सेंटर',
              labelEnglish: 'Command',
              icon: Activity,
            },
            {
              id: 'report',
              labelMarathi: 'क्लिनिकल सारांश',
              labelEnglish: 'Reports',
              icon: FileText,
            },
          ],
          right: [
            {
              id: 'animals',
              labelMarathi: 'नोंदणी',
              labelEnglish: 'Registry',
              icon: Shield,
            },
            {
              id: 'labs',
              labelMarathi: 'लॅब पडताळणी',
              labelEnglish: 'Lab Audit',
              icon: FlaskConical,
            },
          ],
        };
    }
  };

  const { left, right } = getTabConfig(activeRole);

  const renderTab = (tab: TabItemConfig) => {
    const isActive = activeTab === tab.id;
    const IconComponent = tab.icon;

    return (
      <button
        key={tab.id}
        type="button"
        onClick={() => handleTabClick(tab.id)}
        aria-selected={isActive}
        aria-label={`${tab.labelMarathi} (${tab.labelEnglish})`}
        className={`field-touch-target flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
          isActive
            ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
        }`}
      >
        <IconComponent className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
        <span className="text-[11px] mt-0.5 tracking-tight lang-devanagari font-medium">
          {tab.labelMarathi}
        </span>
        <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider -mt-0.5">
          {tab.labelEnglish}
        </span>
      </button>
    );
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 safe-bottom shadow-lg backdrop-blur-sm"
    >
      <div className="max-w-md mx-auto flex items-center justify-between px-2">
        {/* Left Tabs */}
        <div className="flex flex-1 items-center justify-around">
          {left.map(renderTab)}
        </div>

        {/* Elevated Center SOS Button */}
        <div className="px-2">
          <SOSButton />
        </div>

        {/* Right Tabs */}
        <div className="flex flex-1 items-center justify-around">
          {right.map(renderTab)}
        </div>
      </div>
    </nav>
  );
};

import React from 'react';
import { FileText, Activity, Shield, FlaskConical } from 'lucide-react';
import { useNavigationStore, TabType } from '../../store/navigationStore';
import { SOSButton } from './SOSButton';
import { hapticsService } from '../../services/hapticsService';

interface TabItemConfig {
  id: TabType;
  labelMarathi: string;
  labelEnglish: string;
  icon: React.FC<{ className?: string }>;
}

const TABS_LEFT: TabItemConfig[] = [
  {
    id: 'report',
    labelMarathi: 'नोंदणी',
    labelEnglish: 'Report',
    icon: FileText,
  },
  {
    id: 'dashboard',
    labelMarathi: 'डॅशबोर्ड',
    labelEnglish: 'Dashboard',
    icon: Activity,
  },
];

const TABS_RIGHT: TabItemConfig[] = [
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
];

export const BottomBar: React.FC = () => {
  const activeTab = useNavigationStore((state) => state.activeTab);
  const setActiveTab = useNavigationStore((state) => state.setActiveTab);

  const handleTabClick = async (tabId: TabType) => {
    if (tabId !== activeTab) {
      setActiveTab(tabId);
      await hapticsService.hapticLight();
    }
  };

  const renderTab = (tab: TabItemConfig) => {
    const isActive = activeTab === tab.id;
    const IconComponent = tab.icon;

    return (
      <button
        key={tab.id}
        type="button"
        onClick={() => handleTabClick(tab.id)}
        aria-selected={isActive}
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
          {TABS_LEFT.map(renderTab)}
        </div>

        {/* Elevated Center SOS Button */}
        <div className="px-2">
          <SOSButton />
        </div>

        {/* Right Tabs */}
        <div className="flex flex-1 items-center justify-around">
          {TABS_RIGHT.map(renderTab)}
        </div>
      </div>
    </nav>
  );
};

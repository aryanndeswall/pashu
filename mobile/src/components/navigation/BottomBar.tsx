import React from 'react';
import { FileText, Activity, Shield, FlaskConical, Stethoscope, ClipboardList } from 'lucide-react';
import { useNavigationStore, TabType } from '../../store/navigationStore';
import { useAuthStore, UserRole } from '../../store/authStore';
import { useLanguageStore } from '../../store/languageStore';
import { SOSButton } from './SOSButton';
import { hapticsService } from '../../services/hapticsService';

interface TabItemConfig {
  id: TabType;
  labelMarathi: string;
  labelHindi: string;
  labelEnglish: string;
  icon: React.FC<{ className?: string }>;
}

export const BottomBar: React.FC = () => {
  const activeTab = useNavigationStore((state) => state.activeTab);
  const setActiveTab = useNavigationStore((state) => state.setActiveTab);
  const activeRole = useAuthStore((state) => state.activeRole);
  const currentLanguage = useLanguageStore((state) => state.currentLanguage);

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
              id: 'dashboard',
              labelMarathi: 'स्थानिक स्थिती',
              labelHindi: 'स्थानिक स्थिति',
              labelEnglish: 'Status',
              icon: Activity,
            },
            {
              id: 'report',
              labelMarathi: 'लक्षणे नोंदवा',
              labelHindi: 'लक्षण दर्ज करें',
              labelEnglish: 'Report',
              icon: FileText,
            },
          ],
          right: [
            {
              id: 'doctors',
              labelMarathi: 'पशुवैद्यक',
              labelHindi: 'पशु चिकित्सक',
              labelEnglish: 'Doctors',
              icon: Stethoscope,
            },
            {
              id: 'animals',
              labelMarathi: 'माझे पशु',
              labelHindi: 'मेरे पशु',
              labelEnglish: 'My Animals',
              icon: Shield,
            },
          ],
        };
      case 'doctor':
        return {
          left: [
            {
              id: 'triage',
              labelMarathi: 'रांग',
              labelHindi: 'क्यू',
              labelEnglish: 'Queue',
              icon: ClipboardList,
            },
            {
              id: 'dashboard',
              labelMarathi: 'डॅशबोर्ड',
              labelHindi: 'डैशबोर्ड',
              labelEnglish: 'Dashboard',
              icon: Activity,
            },
          ],
          right: [
            {
              id: 'animals',
              labelMarathi: 'पशु आधार',
              labelHindi: 'पशु आधार',
              labelEnglish: 'Animals',
              icon: Shield,
            },
            {
              id: 'labs',
              labelMarathi: 'प्रयोगशाळा',
              labelHindi: 'प्रयोगशाला',
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
              labelHindi: 'कमांड सेंटर',
              labelEnglish: 'Command',
              icon: Activity,
            },
            {
              id: 'report',
              labelMarathi: 'क्लिनिकल सारांश',
              labelHindi: 'क्लिनिकल सारांश',
              labelEnglish: 'Reports',
              icon: FileText,
            },
          ],
          right: [
            {
              id: 'animals',
              labelMarathi: 'नोंदणी',
              labelHindi: 'पंजीकरण',
              labelEnglish: 'Registry',
              icon: Shield,
            },
            {
              id: 'labs',
              labelMarathi: 'लॅब पडताळणी',
              labelHindi: 'लैब सत्यापन',
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

    const primaryLabel =
      currentLanguage === 'mr'
        ? tab.labelMarathi
        : currentLanguage === 'hi'
        ? tab.labelHindi
        : tab.labelEnglish;

    const ariaLabel =
      currentLanguage === 'mr'
        ? `${tab.labelMarathi} (${tab.labelEnglish})`
        : primaryLabel;

    return (
      <button
        key={tab.id}
        type="button"
        onClick={() => handleTabClick(tab.id)}
        aria-selected={isActive}
        aria-label={ariaLabel}
        className={`field-touch-target flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
          isActive
            ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
        }`}
      >
        <IconComponent className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
        <span className={`text-[11px] mt-0.5 tracking-tight font-medium ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
          {primaryLabel}
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

import React, { useEffect, useState } from 'react';
import { AlertOctagon, X, MapPin, Radio, ShieldAlert, ArrowRight } from 'lucide-react';
import { liveAlertService, OutbreakAlert } from '../../services/liveAlertService';
import { useLanguageStore } from '../../store/languageStore';
import { useNavigationStore } from '../../store/navigationStore';
import { hapticsService } from '../../services/hapticsService';

export const RealtimeAlertBanner: React.FC = () => {
  const [alerts, setAlerts] = useState<OutbreakAlert[]>([]);
  const { currentLanguage, t } = useLanguageStore();
  const setActiveTab = useNavigationStore((state) => state.setActiveTab);

  useEffect(() => {
    // Start listening to WebSocket/SSE cluster stream
    liveAlertService.connect();

    const unsubscribe = liveAlertService.subscribe((active) => {
      setAlerts(active);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (alerts.length === 0) {
    return null;
  }

  const activeAlert = alerts[0]; // Display top priority active outbreak alert

  const handleDismiss = async () => {
    await hapticsService.hapticLight();
    liveAlertService.dismissAlert(activeAlert.eventId);
  };

  const handleViewCommandMap = async () => {
    await hapticsService.triggerSelection();
    setActiveTab('dashboard');
  };

  const isCritical = activeAlert.alertLevel === 'CRITICAL';

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`relative border-b shadow-md transition-all duration-300 animate-in slide-in-from-top ${
        isCritical
          ? 'bg-rose-950/95 border-rose-600 text-rose-100'
          : 'bg-amber-950/95 border-amber-600 text-amber-100'
      }`}
    >
      <div className="max-w-md mx-auto px-4 py-2.5 flex items-start gap-3">
        {/* Animated Radar/Siren Icon */}
        <div
          className={`p-2 rounded-xl shrink-0 mt-0.5 animate-pulse ${
            isCritical ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
          }`}
        >
          <ShieldAlert className="w-5 h-5" />
        </div>

        {/* Alert Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isCritical ? 'bg-rose-500 text-white' : 'bg-amber-500 text-black'
              }`}
            >
              {isCritical ? 'CRITICAL BIOSECURITY ORDER' : 'OUTBREAK WARNING'}
            </span>
            <span className="text-[11px] font-mono opacity-80">
              {activeAlert.syndromeCode}
            </span>
          </div>

          <h4 className="text-xs font-bold mt-1 text-white truncate">
            {activeAlert.suspectedDisease}
          </h4>

          <p className="text-[11px] mt-0.5 leading-tight opacity-90 line-clamp-2">
            {activeAlert.containmentDirective}
          </p>

          <div className="flex items-center gap-3 mt-2 text-[10px]">
            <span className="flex items-center gap-1 text-white/80">
              <MapPin className="w-3 h-3 text-rose-400" />
              {activeAlert.villageName}
              {activeAlert.districtName ? `, ${activeAlert.districtName}` : ''} (
              {activeAlert.movementFreezeRadiusKm} km Freeze)
            </span>

            <button
              type="button"
              onClick={handleViewCommandMap}
              aria-label="Command Map"
              className="text-white font-bold underline flex items-center gap-0.5 hover:text-rose-200 transition-colors"
            >
              <span>{t('viewMap', 'Command Map')}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss biosecurity alert"
          className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

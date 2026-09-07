import React from 'react';
import { useSyncStore } from '../../store/syncStore';
import { useLanguageStore } from '../../store/languageStore';
import { smsFallbackService } from '../../services/smsFallbackService';
import { FluidDrawer } from '../animations/FluidDrawer';
import {
  Wifi,
  Smartphone,
  Radio,
  RefreshCw,
  Clock,
  Send,
  Database,
  CloudOff,
  CheckCircle,
} from 'lucide-react';

export const SyncQueueDrawer: React.FC = () => {
  const { currentLanguage } = useLanguageStore();
  const {
    networkTier,
    isSyncing,
    pendingCount,
    phase1SyncedCount,
    completedCount,
    queueItems,
    lastSyncedAt,
    isDrawerOpen,
    setDrawerOpen,
    triggerSync,
  } = useSyncStore();

  const handleSmsFallback = (item: any) => {
    try {
      const payload = JSON.parse(item.payload_json);
      const smsText = smsFallbackService.generateSmsEmergencyPayload({
        syndrome_code: payload.syndrome_code,
        lgd_code: payload.lgd_code,
        latitude: payload.latitude || payload.coordinates?.latitude || 19.39,
        longitude: payload.longitude || payload.coordinates?.longitude || 74.65,
        pashu_aadhaar: payload.pashu_aadhaar,
        priority: item.priority,
      });

      window.location.href = smsFallbackService.createSmsUrl(smsText, '1962');
    } catch (err) {
      console.error('Failed to generate SMS payload:', err);
    }
  };

  const getNetworkBadge = () => {
    switch (networkTier) {
      case 'WIFI':
        return {
          icon: <Wifi className="w-3.5 h-3.5 text-emerald-600" />,
          label:
            currentLanguage === 'en'
              ? 'Wi-Fi (High-Speed)'
              : currentLanguage === 'hi'
              ? 'वाई-फाई (हाई-स्पीड)'
              : 'वाय-फाय (हाय-स्पीड)',
          bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 text-emerald-800 dark:text-emerald-300',
        };
      case 'CELLULAR_4G_5G':
        return {
          icon: <Smartphone className="w-3.5 h-3.5 text-emerald-600" />,
          label:
            currentLanguage === 'en'
              ? '4G/5G Mobile Data'
              : currentLanguage === 'hi'
              ? '4G/5G मोबाइल डेटा'
              : '4G/5G मोबाइल डेटा',
          bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 text-emerald-800 dark:text-emerald-300',
        };
      case 'CELLULAR_2G_EDGE':
        return {
          icon: <Radio className="w-3.5 h-3.5 text-amber-600" />,
          label:
            currentLanguage === 'en'
              ? '2G/EDGE (Sync Only)'
              : currentLanguage === 'hi'
              ? '2G/EDGE (केवल डेटा सिंक)'
              : '2G/EDGE (केवळ डेटा सिंक)',
          bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 text-amber-800 dark:text-amber-300',
        };
      default:
        return {
          icon: <CloudOff className="w-3.5 h-3.5 text-red-600" />,
          label:
            currentLanguage === 'en'
              ? 'Offline (Saved On Device)'
              : currentLanguage === 'hi'
              ? 'ऑफ़लाइन (डिवाइस पर सुरक्षित)'
              : 'ऑफलाइन (डिव्हाइसवर सुरक्षित)',
          bg: 'bg-red-50 dark:bg-red-950/60 border-red-200 text-red-800 dark:text-red-300',
        };
    }
  };

  const netInfo = getNetworkBadge();

  return (
    <FluidDrawer
      isOpen={isDrawerOpen}
      onClose={() => setDrawerOpen(false)}
      title={
        currentLanguage === 'en'
          ? 'Offline Sync Queue'
          : currentLanguage === 'hi'
          ? 'ऑफ़लाइन सिंक कतार (Sync Queue)'
          : 'ऑफलाइन सिंक रांग (Sync Queue)'
      }
    >
      <div className="space-y-4 pb-4">
        {/* Network & Queue Overview Banner */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg border flex items-center gap-1.5 text-xs font-bold ${netInfo.bg}`}>
              {netInfo.icon}
              <span className="lang-devanagari">{netInfo.label}</span>
            </div>
          </div>
          {lastSyncedAt && (
            <span className="text-[10px] text-slate-500 font-mono">
              {currentLanguage === 'en' ? `Last sync: ${lastSyncedAt}` : `शेवटचा सिंक: ${lastSyncedAt}`}
            </span>
          )}
        </div>

        {/* Sync Metric Counters */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <div className="text-sm font-black text-amber-900 dark:text-amber-200 font-mono">
              {pendingCount}
            </div>
            <div className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">
              {currentLanguage === 'en' ? 'Pending' : currentLanguage === 'hi' ? 'प्रलंबित डेटा' : 'प्रलंबित डेटा'}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <div className="text-sm font-black text-blue-900 dark:text-blue-200 font-mono">
              {phase1SyncedCount}
            </div>
            <div className="text-[10px] text-blue-700 dark:text-blue-400 font-semibold">
              {currentLanguage === 'en' ? 'Phase 1 Synced' : 'Phase 1 सिंक'}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <div className="text-sm font-black text-emerald-900 dark:text-emerald-200 font-mono">
              {completedCount}
            </div>
            <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
              {currentLanguage === 'en' ? 'Full Synced' : 'पूर्ण सिंक'}
            </div>
          </div>
        </div>

        {/* Itemized Queue List */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>
              {currentLanguage === 'en'
                ? 'Local Offline Backlog:'
                : 'स्थानिक रांगेतील नोंदी (Local Offline Backlog):'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono font-normal">
              {queueItems.length} {currentLanguage === 'en' ? 'records' : 'नोंदी'}
            </span>
          </h4>

          {queueItems.length === 0 ? (
            <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 space-y-1">
              <Database className="w-6 h-6 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {currentLanguage === 'en' ? 'Sync queue is empty!' : 'सिंक रांग रिकामी आहे!'}
              </p>
              <p className="text-[10px] text-slate-500">
                {currentLanguage === 'en'
                  ? 'All reports are safely synchronized to the cloud server.'
                  : 'सर्व अहवाल यशस्वीरित्या सर्व्हरवर सुरक्षित झाले आहेत.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {queueItems.map((item) => {
                let payload: any = {};
                try {
                  payload = JSON.parse(item.payload_json);
                } catch {
                  payload = {};
                }

                const isBiohazard = item.priority === 3;

                return (
                  <div
                    key={item.sync_id}
                    className={`p-3 rounded-2xl border transition-all text-xs space-y-2 ${
                      isBiohazard
                        ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/60'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span className="font-mono">{payload.syndrome_code || 'INCIDENT'}</span>
                          {payload.syndrome_name && (
                            <span className="text-slate-600 dark:text-slate-400 font-normal">
                              • {payload.syndrome_name}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {currentLanguage === 'en' ? 'Village: ' : 'गाव: '}
                          {payload.village_name || (currentLanguage === 'en' ? 'Unknown Village' : 'अज्ञात गाव')} •{' '}
                          {new Date(item.created_at).toLocaleTimeString(
                            currentLanguage === 'en' ? 'en-IN' : 'mr-IN',
                            { hour: '2-digit', minute: '2-digit' }
                          )}
                        </div>
                      </div>

                      {isBiohazard && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-red-600 text-white animate-pulse">
                          P3 Biohazard
                        </span>
                      )}
                    </div>

                    {/* Phase 1 and Phase 2 Status Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {item.status === 'COMPLETED' ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>{currentLanguage === 'en' ? 'All Synced' : 'पूर्ण समक्रमित (All Synced)'}</span>
                        </span>
                      ) : (
                        <>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 ${
                              item.status === 'PHASE_1_SYNCED'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>
                              {item.status === 'PHASE_1_SYNCED'
                                ? currentLanguage === 'en'
                                  ? '✓ Phase 1 Data Synced'
                                  : '✓ Phase 1 डेटा सिंक'
                                : currentLanguage === 'en'
                                ? 'Phase 1 Pending'
                                : 'Phase 1 प्रलंबित'}
                            </span>
                          </span>

                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {currentLanguage === 'en'
                                ? 'Phase 2 Photos/Audio (4G/Wi-Fi)'
                                : 'Phase 2 फोटो/आवाज (4G/Wi-Fi)'}
                            </span>
                          </span>
                        </>
                      )}
                    </div>

                    {/* 1-Tap SMS Fallback CTA for Emergency Zoonoses */}
                    {isBiohazard && item.status !== 'COMPLETED' && (
                      <div className="pt-1.5 border-t border-red-100 dark:border-red-950 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-red-700 dark:text-red-400 font-semibold">
                          {currentLanguage === 'en' ? 'No data network? Use SMS fallback:' : 'डेटा नेटवर्क नसल्यास SMS वापरा:'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSmsFallback(item)}
                          className="field-touch-target px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-xs"
                        >
                          <Send className="w-3 h-3" />
                          <span>{currentLanguage === 'en' ? 'Send SMS to 1962' : '१९६२ ला SMS पाठवा'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Primary Sync Now CTA */}
        <div className="pt-2">
          <button
            type="button"
            disabled={networkTier === 'OFFLINE' || isSyncing}
            onClick={triggerSync}
            className={`field-touch-target w-full py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all ${
              networkTier === 'OFFLINE'
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white shadow-emerald-900/20'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>
              {isSyncing
                ? currentLanguage === 'en'
                  ? 'Syncing...'
                  : 'समक्रमित करत आहे... (Syncing)'
                : networkTier === 'OFFLINE'
                ? currentLanguage === 'en'
                  ? 'Offline: No Network'
                  : 'ऑफलाइन: नेटवर्क उपलब्ध नाही'
                : currentLanguage === 'en'
                ? 'Sync All Now'
                : 'आताच सर्व समक्रमित करा (Sync Now)'}
            </span>
          </button>
        </div>
      </div>
    </FluidDrawer>
  );
};

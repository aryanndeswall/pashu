import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, RefreshCw, AlertTriangle, CheckCircle2, ChevronDown, Search } from 'lucide-react';
import { locationService, LocationCoordinates, SnappedLgdResult } from '../../services/locationService';
import { LgdVillageRecord } from '../../database/seedLgd';
import { hapticsService } from '../../services/hapticsService';

export interface LocationPickerCardProps {
  coordinates: LocationCoordinates | null;
  snappedVillage: SnappedLgdResult | null;
  onLocationUpdate: (coords: LocationCoordinates, village: SnappedLgdResult) => void;
}

export const LocationPickerCard: React.FC<LocationPickerCardProps> = ({
  coordinates,
  snappedVillage,
  onLocationUpdate,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [allVillages, setAllVillages] = useState<LgdVillageRecord[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [villageSearch, setVillageSearch] = useState('');

  useEffect(() => {
    // Initial fetch of villages & auto GPS lock if coordinates not yet populated
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const villages = await locationService.getAllLgdVillages();
      setAllVillages(villages);

      if (!coordinates || !snappedVillage) {
        await refreshGps();
      }
    } catch (err) {
      console.warn('Failed to load initial location data:', err);
    }
  };

  const refreshGps = async () => {
    try {
      setIsLoading(true);
      await hapticsService.hapticLight();
      const coords = await locationService.getCurrentLocation();
      const village = await locationService.snapToNearestLgdVillage(coords.latitude, coords.longitude);
      onLocationUpdate(coords, village);
      await hapticsService.hapticMedium();
    } catch (err) {
      console.error('Error refreshing GPS coordinates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectManualVillage = async (village: LgdVillageRecord) => {
    await hapticsService.hapticLight();
    const manualCoords: LocationCoordinates = {
      latitude: village.latitude,
      longitude: village.longitude,
      accuracy: 10,
      timestamp: new Date().toISOString(),
    };

    const manualSnapped: SnappedLgdResult = {
      lgd_code: village.lgd_code,
      village_name: village.village_name,
      block_name: village.block_name,
      district_name: village.district_name,
      distanceKm: 0,
      isAccurate: true,
    };

    onLocationUpdate(manualCoords, manualSnapped);
    setIsDropdownOpen(false);
    setVillageSearch('');
  };

  const filteredVillages = allVillages.filter(
    (v) =>
      v.village_name.toLowerCase().includes(villageSearch.toLowerCase()) ||
      v.block_name.toLowerCase().includes(villageSearch.toLowerCase()) ||
      v.district_name.toLowerCase().includes(villageSearch.toLowerCase())
  );

  const isGpsAccurate = (coordinates?.accuracy ?? 100) <= 50;

  return (
    <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 lang-devanagari flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>स्थान व LGD गाव (Location & LGD Village)</span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            स्थानिक ग्रामपंचायत मॅपिंग
          </p>
        </div>

        <button
          type="button"
          disabled={isLoading}
          onClick={refreshGps}
          className="field-touch-target p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="GPS रीफ्रेश करा"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
        </button>
      </div>

      {/* GPS Status & Coordinates Pill */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Navigation className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 lang-devanagari">
              GPS अचूकता: ±{coordinates?.accuracy ? Math.round(coordinates.accuracy) : 10}m
            </span>
          </div>

          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
              isGpsAccurate
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
            }`}
          >
            {isGpsAccurate ? '✓ चांगला सिग्नल' : '⚠ कमजोर सिग्नल'}
          </span>
        </div>

        {coordinates && (
          <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            अक्षांश: {coordinates.latitude.toFixed(4)}°N, रेखांश: {coordinates.longitude.toFixed(4)}°E
          </p>
        )}
      </div>

      {/* Auto-snapped LGD Village Badge */}
      {snappedVillage && (
        <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 lang-devanagari">
                गाव: {snappedVillage.village_name}
              </p>
            </div>
            <p className="text-[11px] text-emerald-700/90 dark:text-emerald-300/80 pl-5.5 lang-devanagari">
              ता. {snappedVillage.block_name}, जि. {snappedVillage.district_name}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 pl-5.5 font-mono">
              LGD कोड: {snappedVillage.lgd_code} {snappedVillage.distanceKm > 0 ? `• अंतर: ${snappedVillage.distanceKm} km` : ''}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="field-touch-target px-2.5 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold flex items-center gap-1 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors lang-devanagari shrink-0"
          >
            <span>गाव बदला</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Manual Village Selector Dropdown */}
      {isDropdownOpen && (
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={villageSearch}
              onChange={(e) => setVillageSearch(e.target.value)}
              placeholder="गाव किंवा तालुका शोधा (Search village)..."
              className="w-full pl-8.5 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 lang-devanagari"
            />
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1 divide-y divide-slate-200/50 dark:divide-slate-700/50">
            {filteredVillages.map((village) => (
              <button
                key={village.lgd_code}
                type="button"
                onClick={() => handleSelectManualVillage(village)}
                className="w-full text-left p-2 rounded-lg hover:bg-white dark:hover:bg-slate-900 transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 lang-devanagari">
                    {village.village_name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 lang-devanagari">
                    ता. {village.block_name}, जि. {village.district_name}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  #{village.lgd_code}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Navigation,
  RefreshCw,
  CheckCircle2,
  ChevronDown,
  Search,
  Radio,
  Edit3,
  Globe2,
  X,
  Satellite,
  Compass,
} from 'lucide-react';
import {
  locationService,
  LocationCoordinates,
  SnappedLocationResult,
  LocationSearchResult,
} from '../../services/locationService';
import { hapticsService } from '../../services/hapticsService';
import { useLanguageStore } from '../../store/languageStore';

export interface LocationPickerCardProps {
  coordinates: LocationCoordinates | null;
  snappedVillage: SnappedLocationResult | null;
  onLocationUpdate: (coords: LocationCoordinates, village: SnappedLocationResult) => void;
}

export const LocationPickerCard: React.FC<LocationPickerCardProps> = ({
  coordinates,
  snappedVillage,
  onLocationUpdate,
}) => {
  const { currentLanguage, t } = useLanguageStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveWatching, setIsLiveWatching] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isManualEditOpen, setIsManualEditOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Manual custom fields
  const [customVillage, setCustomVillage] = useState('');
  const [customBlock, setCustomBlock] = useState('');
  const [customDistrict, setCustomDistrict] = useState('');
  const [customState, setCustomState] = useState('');

  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastGeocodedCoordsRef = useRef<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    let cleanupWatch: (() => void) | undefined;

    const initLocation = async () => {
      setIsLoading(true);
      try {
        // 1. Initial immediate fix
        const initialCoords = await locationService.getCurrentLocation();
        await resolveAndPropagate(initialCoords);

        // 2. Start continuous real-time GPS watch
        cleanupWatch = await locationService.startLocationWatch(
          async (liveCoords) => {
            // Check if we need to re-reverse-geocode (drift > 50 meters or first time)
            const last = lastGeocodedCoordsRef.current;
            if (!last) {
              await resolveAndPropagate(liveCoords);
            } else {
              const distance = locationService.calculateHaversineDistance(
                last.lat,
                last.lon,
                liveCoords.latitude,
                liveCoords.longitude
              );
              if (distance > 0.05) {
                // Moved more than 50 meters
                await resolveAndPropagate(liveCoords);
              } else {
                // Just update live coordinates and accuracy without re-querying geocoder
                if (snappedVillage) {
                  onLocationUpdate(liveCoords, snappedVillage);
                }
              }
            }
          },
          (err) => {
            console.warn('Real-time GPS stream warning:', err);
          }
        );
      } catch (err) {
        console.error('Location initialization failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initLocation();

    return () => {
      if (cleanupWatch) cleanupWatch();
      locationService.stopLocationWatch();
    };
  }, []);

  const resolveAndPropagate = async (coords: LocationCoordinates) => {
    try {
      lastGeocodedCoordsRef.current = { lat: coords.latitude, lon: coords.longitude };
      const resolved = await locationService.reverseGeocode(coords.latitude, coords.longitude);
      onLocationUpdate(coords, resolved);
    } catch (err) {
      console.warn('Error during reverse geocoding:', err);
    }
  };

  const handleForceRefresh = async () => {
    try {
      setIsLoading(true);
      await hapticsService.hapticLight();
      const coords = await locationService.getCurrentLocation();
      await resolveAndPropagate(coords);
      await hapticsService.hapticMedium();
    } catch (err) {
      console.error('Force GPS refresh failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search for any village or town in India
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (query.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const results = await locationService.searchNationwideLocations(query);
        setSearchResults(results);
      } catch (err) {
        console.warn('Search query error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  };

  const handleSelectSearchResult = async (result: LocationSearchResult) => {
    await hapticsService.hapticLight();
    const newCoords: LocationCoordinates = {
      latitude: result.latitude,
      longitude: result.longitude,
      accuracy: 8,
      timestamp: new Date().toISOString(),
    };

    const newResolved: SnappedLocationResult = {
      state_name: result.state_name,
      district_name: result.district_name,
      block_name: result.block_name,
      village_name: result.village_name,
      pincode: result.pincode,
      formatted_address: result.formatted_address,
      distanceKm: 0,
      isAccurate: true,
      source: 'nationwide_search',
    };

    lastGeocodedCoordsRef.current = { lat: result.latitude, lon: result.longitude };
    onLocationUpdate(newCoords, newResolved);
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSaveManualOverride = async () => {
    if (!customVillage.trim()) return;
    await hapticsService.hapticLight();

    const currentCoords = coordinates || {
      latitude: 28.8955,
      longitude: 76.6066,
      accuracy: 10,
      timestamp: new Date().toISOString(),
    };

    const manualResult: SnappedLocationResult = {
      state_name: customState.trim() || snappedVillage?.state_name || 'State',
      district_name: customDistrict.trim() || snappedVillage?.district_name || 'District',
      block_name: customBlock.trim() || snappedVillage?.block_name || 'Tehsil',
      village_name: customVillage.trim(),
      distanceKm: 0,
      isAccurate: true,
      source: 'manual_override',
      formatted_address: `${customVillage.trim()}, ${customBlock.trim() || ''}, ${customDistrict.trim() || ''}, ${customState.trim() || ''}`.replace(
        /, ,/g,
        ','
      ),
    };

    onLocationUpdate(currentCoords, manualResult);
    setIsManualEditOpen(false);
  };

  const accuracy = coordinates?.accuracy ? Math.round(coordinates.accuracy) : 10;
  const isHighAccuracy = accuracy <= 15;
  const isModerateAccuracy = accuracy <= 40;

  return (
    <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5">
      {/* Header with Title and GPS Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3
              className={`text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 ${
                currentLanguage !== 'en' ? 'lang-devanagari' : ''
              }`}
            >
              <div className="relative">
                <Navigation className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <span>{t('locationCardTitle', 'रिअल-टाइम GPS व स्थान शोध (Real-Time Location & Auto-Detect)')}</span>
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {t('locationCardSubtitle', 'समग्र भारत राज्य, जिल्हा व गाव अचूक स्वयंशोध')}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={isLoading}
            onClick={handleForceRefresh}
            className="field-touch-target p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs"
            title="Force GPS Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            <span className="text-[10px] font-semibold hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Real-time Telemetry Bar */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Satellite className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              {t('liveGpsStatus', 'थेट GPS ट्रॅकिंग')}:
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isHighAccuracy
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                  : isModerateAccuracy
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                  : 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300'
              }`}
            >
              {isHighAccuracy
                ? `±${accuracy}m ${t('highPrecision', 'अति अचूक (High Precision)')}`
                : `±${accuracy}m ${t('triangulated', 'अचूकता')}`}
            </span>
          </div>

          <span className="flex items-center gap-1 text-[10px] font-mono text-slate-500 dark:text-slate-400">
            <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
            <span>LIVE LOCK</span>
          </span>
        </div>

        {coordinates && (
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-0.5 border-t border-slate-200/60 dark:border-slate-700/60">
            <span className="flex items-center gap-1">
              <Compass className="w-3 h-3 text-slate-400" />
              <span>
                {coordinates.latitude.toFixed(5)}°N, {coordinates.longitude.toFixed(5)}°E
              </span>
            </span>
            <span className="text-[10px] text-slate-400">WGS-84 Geodetic</span>
          </div>
        )}
      </div>

      {/* Auto-detected Hierarchy Display Cards */}
      {snappedVillage ? (
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className={`text-xs font-bold text-emerald-900 dark:text-emerald-200 ${currentLanguage !== 'en' ? 'lang-devanagari' : ''}`}>
                {t('autoDetectedLocation', 'स्वयं-शोधित भौगोलिक माहिती (Auto-Detected)')}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen);
                  setIsManualEditOpen(false);
                }}
                className="px-2 py-1 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold flex items-center gap-1 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors"
              >
                <Search className="w-3 h-3" />
                <span>{t('searchAllIndia', 'शोध (Search)')}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsManualEditOpen(!isManualEditOpen);
                  setIsSearchOpen(false);
                  setCustomVillage(snappedVillage.village_name);
                  setCustomBlock(snappedVillage.block_name);
                  setCustomDistrict(snappedVillage.district_name);
                  setCustomState(snappedVillage.state_name);
                }}
                className="px-2 py-1 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold flex items-center gap-1 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors"
              >
                <Edit3 className="w-3 h-3" />
                <span>{t('editLocation', 'बदला')}</span>
              </button>
            </div>
          </div>

          {/* 4-Item Hierarchy Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-emerald-100 dark:border-emerald-900/60">
              <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                {t('stateLabel', 'राज्य (State)')}
              </p>
              <p className="font-bold text-slate-800 dark:text-slate-100 text-xs truncate">
                {snappedVillage.state_name || 'India'}
              </p>
            </div>

            <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-emerald-100 dark:border-emerald-900/60">
              <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                {t('districtLabel', 'जिल्हा (District)')}
              </p>
              <p className="font-bold text-slate-800 dark:text-slate-100 text-xs truncate">
                {snappedVillage.district_name || 'District'}
              </p>
            </div>

            <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-emerald-100 dark:border-emerald-900/60">
              <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                {t('blockLabel', 'तालुका / ब्लॉक (Tehsil)')}
              </p>
              <p className="font-bold text-slate-800 dark:text-slate-100 text-xs truncate">
                {snappedVillage.block_name || 'Tehsil'}
              </p>
            </div>

            <div className="p-2 bg-emerald-100/60 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800/80">
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-bold tracking-wider">
                {t('villageLabel', 'गाव (Village / Locality)')}
              </p>
              <p className="font-bold text-emerald-900 dark:text-emerald-200 text-xs truncate">
                {snappedVillage.village_name || 'Local Area'}
              </p>
            </div>
          </div>

          {snappedVillage.formatted_address && (
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate pt-1 border-t border-emerald-200/50 dark:border-emerald-800/40">
              📍 {snappedVillage.formatted_address}
            </p>
          )}
        </div>
      ) : (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2 text-slate-500">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
          <span className="text-xs font-semibold">
            {t('locatingGps', 'GPS उपग्रह संपर्क व स्थान शोध सुरू आहे (Locking GPS & Reverse Geocoding)...')}
          </span>
        </div>
      )}

      {/* Nationwide Village & City Search Dropdown */}
      {isSearchOpen && (
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/90 rounded-2xl border border-slate-300 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-blue-600" />
              <span>{t('searchAllIndiaTitle', 'समग्र भारत गाव / शहर शोधा (Search Any Indian Village)')}</span>
            </span>
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t('searchPlaceholder', 'उदा. Bhalout, Rohtak, Sangamner, Jaipur...')}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {isSearching && (
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
            )}
          </div>

          {/* Results List */}
          <div className="max-h-48 overflow-y-auto space-y-1 divide-y divide-slate-200/60 dark:divide-slate-700/60">
            {searchResults.length > 0 ? (
              searchResults.map((res, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSearchResult(res)}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-white dark:hover:bg-slate-900 transition-colors flex items-start gap-2 group"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      {res.village_name}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {res.block_name ? `${res.block_name}, ` : ''}
                      {res.district_name}, {res.state_name}
                    </p>
                  </div>
                </button>
              ))
            ) : searchQuery.length >= 2 && !isSearching ? (
              <p className="text-center text-xs text-slate-400 py-3">
                {t('noResults', 'कोणतेही गाव सापडले नाही (No villages found)')}
              </p>
            ) : (
              <p className="text-center text-[11px] text-slate-400 py-2">
                {t('typeToSearch', 'गावाचे किंवा तालुक्याचे नाव टाइप करा...')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Manual Edit Custom Location Modal */}
      {isManualEditOpen && (
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/90 rounded-2xl border border-slate-300 dark:border-slate-700 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('manualEditTitle', 'स्थान तपशील व्यक्तिचलित संपादित करा (Edit Custom Details)')}</span>
            </span>
            <button
              type="button"
              onClick={() => setIsManualEditOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                {t('stateLabel', 'राज्य (State)')}
              </label>
              <input
                type="text"
                value={customState}
                onChange={(e) => setCustomState(e.target.value)}
                placeholder="State"
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                {t('districtLabel', 'जिल्हा (District)')}
              </label>
              <input
                type="text"
                value={customDistrict}
                onChange={(e) => setCustomDistrict(e.target.value)}
                placeholder="District"
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                {t('blockLabel', 'तालुका / ब्लॉक (Tehsil)')}
              </label>
              <input
                type="text"
                value={customBlock}
                onChange={(e) => setCustomBlock(e.target.value)}
                placeholder="Tehsil/Block"
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                {t('villageLabel', 'गाव (Village)')} *
              </label>
              <input
                type="text"
                value={customVillage}
                onChange={(e) => setCustomVillage(e.target.value)}
                placeholder="Village Name"
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-emerald-400 dark:border-emerald-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsManualEditOpen(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              {t('cancel', 'रद्द करा')}
            </button>
            <button
              type="button"
              onClick={handleSaveManualOverride}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
            >
              {t('save', 'स्थान सेव्ह करा (Save)')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

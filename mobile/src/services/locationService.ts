import { Capacitor } from '@capacitor/core';
import { Geolocation, Position, CallbackID } from '@capacitor/geolocation';
import { dbService } from '../database/sqliteConnection';
import lgdSeedData from '../assets/data/seed_maharashtra_lgd.json';
import { LgdVillageRecord } from '../database/seedLgd';
import { getReverseGeocodeEndpoint, getSearchLocationsEndpoint } from '../config/api';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  heading?: number | null;
  speed?: number | null;
  altitude?: number | null;
}

export interface SnappedLocationResult {
  lgd_code?: number;
  state_name: string;
  district_name: string;
  block_name: string;
  village_name: string;
  pincode?: string;
  formatted_address?: string;
  distanceKm: number;
  isAccurate: boolean;
  source: string;
}

export type SnappedLgdResult = SnappedLocationResult;

export interface LocationSearchResult {
  latitude: number;
  longitude: number;
  state_name: string;
  district_name: string;
  block_name: string;
  village_name: string;
  pincode?: string;
  formatted_address: string;
}

const CACHE_KEY_PREFIX = 'pashu_loc_cache_';

export class LocationService {
  private isNative: boolean;
  private watchId: CallbackID | number | null = null;
  private lastCoords: LocationCoordinates | null = null;
  private cache: Map<string, SnappedLocationResult> = new Map();

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
    this.loadPersistentCache();
  }

  private loadPersistentCache() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(CACHE_KEY_PREFIX)) {
            const raw = localStorage.getItem(key);
            if (raw) {
              this.cache.set(key.replace(CACHE_KEY_PREFIX, ''), JSON.parse(raw));
            }
          }
        }
      }
    } catch (e) {
      console.warn('Could not load persistent location cache:', e);
    }
  }

  private saveToCache(cacheKey: string, result: SnappedLocationResult) {
    this.cache.set(cacheKey, result);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(CACHE_KEY_PREFIX + cacheKey, JSON.stringify(result));
      }
    } catch (e) {
      // Ignore quota exceeded
    }
  }

  private getCacheKey(lat: number, lon: number): string {
    // Group locations within ~110m (2 decimal places) for cache hits
    return `${lat.toFixed(2)}_${lon.toFixed(2)}`;
  }

  /**
   * Calculates Haversine distance in kilometers between two GPS coordinates
   */
  calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's mean radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;

    return Math.round(d * 100) / 100;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Subscribes to continuous real-time GPS hardware updates
   * Returns an unsubscribe function to stop watching
   */
  async startLocationWatch(
    onLocationUpdate: (coords: LocationCoordinates) => void,
    onError?: (err: any) => void
  ): Promise<() => void> {
    // Stop any existing watch
    await this.stopLocationWatch();

    const handlePosition = (pos: Position | GeolocationPosition) => {
      const coords: LocationCoordinates = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy || 10,
        altitude: pos.coords.altitude,
        heading: pos.coords.heading,
        speed: pos.coords.speed,
        timestamp: new Date(pos.timestamp).toISOString(),
      };
      this.lastCoords = coords;
      onLocationUpdate(coords);
    };

    if (this.isNative) {
      try {
        const id = await Geolocation.watchPosition(
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 1000,
          },
          (position, err) => {
            if (err) {
              console.warn('Native GPS watch error:', err);
              if (onError) onError(err);
              return;
            }
            if (position) handlePosition(position);
          }
        );
        this.watchId = id;
        return () => this.stopLocationWatch();
      } catch (err) {
        console.warn('Failed to start native GPS watch, falling back to web:', err);
      }
    }

    // Web browser Geolocation watch
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        (pos) => handlePosition(pos),
        (err) => {
          console.warn('Web GPS watch error:', err);
          if (onError) onError(err);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 1000 }
      );
      this.watchId = id;
      return () => this.stopLocationWatch();
    }

    return () => {};
  }

  /**
   * Stops the active real-time GPS watch
   */
  async stopLocationWatch(): Promise<void> {
    if (this.watchId !== null) {
      if (this.isNative && typeof this.watchId === 'string') {
        try {
          await Geolocation.clearWatch({ id: this.watchId });
        } catch (e) {
          console.warn('Error clearing native GPS watch:', e);
        }
      } else if (typeof this.watchId === 'number' && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(this.watchId);
      }
      this.watchId = null;
    }
  }

  /**
   * Acquires immediate high-accuracy GPS coordinates via native hardware or web browser API
   */
  async getCurrentLocation(): Promise<LocationCoordinates> {
    if (this.isNative) {
      try {
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 2000,
        });

        const coords: LocationCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy || 8,
          altitude: position.coords.altitude,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: new Date(position.timestamp).toISOString(),
        };
        this.lastCoords = coords;
        return coords;
      } catch (err) {
        console.warn('Native Geolocation failed, falling back to web:', err);
      }
    }

    // Web browser Geolocation
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const coords: LocationCoordinates = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy || 12,
              altitude: pos.coords.altitude,
              heading: pos.coords.heading,
              speed: pos.coords.speed,
              timestamp: new Date(pos.timestamp).toISOString(),
            };
            this.lastCoords = coords;
            resolve(coords);
          },
          (err) => {
            console.warn('Web geolocation error, using last known or safe default:', err);
            if (this.lastCoords) {
              resolve(this.lastCoords);
              return;
            }
            // If GPS permission denied, default to safe center
            resolve({
              latitude: 28.8955,
              longitude: 76.6066,
              accuracy: 50,
              timestamp: new Date().toISOString(),
            });
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 2000 }
        );
      });
    }

    return (
      this.lastCoords || {
        latitude: 28.8955,
        longitude: 76.6066,
        accuracy: 10,
        timestamp: new Date().toISOString(),
      }
    );
  }

  /**
   * Production-Level Multi-Tier Reverse Geocoding:
   * Auto-detects State, District, Subdistrict/Tehsil, and Village across ALL states in India.
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<SnappedLocationResult> {
    const cacheKey = this.getCacheKey(latitude, longitude);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Tier 1: Google Maps Geocoding API if key configured in client
    const googleApiKey = import.meta.env?.VITE_GOOGLE_MAPS_API_KEY;
    if (googleApiKey) {
      try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleApiKey}&language=en`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'OK' && data.results && data.results.length > 0) {
            const result = data.results[0];
            const comps = result.address_components || [];
            let state = '';
            let district = '';
            let block = '';
            let village = '';
            let pincode = '';

            for (const c of comps) {
              const types = c.types || [];
              if (types.includes('administrative_area_level_1')) state = c.long_name;
              else if (types.includes('administrative_area_level_2')) district = c.long_name;
              else if (types.includes('administrative_area_level_3') || types.includes('sublocality_level_1')) {
                if (!block) block = c.long_name;
              } else if (types.includes('sublocality_level_2') || types.includes('neighborhood') || types.includes('locality')) {
                if (!village) village = c.long_name;
              } else if (types.includes('postal_code')) pincode = c.long_name;
            }

            const parsed: SnappedLocationResult = {
              state_name: state || 'State',
              district_name: district || 'District',
              block_name: block || district || 'Tehsil',
              village_name: village || 'Village',
              pincode,
              formatted_address: result.formatted_address,
              distanceKm: 0,
              isAccurate: true,
              source: 'google_maps',
            };
            this.saveToCache(cacheKey, parsed);
            return parsed;
          }
        }
      } catch (err) {
        console.warn('Google Maps geocoding client error, falling to Tier 2:', err);
      }
    }

    // Tier 2: Backend Reverse Geocoding Gateway
    try {
      const endpoint = getReverseGeocodeEndpoint(latitude, longitude);
      const res = await fetch(endpoint, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        const parsed: SnappedLocationResult = {
          state_name: data.state_name || 'State',
          district_name: data.district_name || 'District',
          block_name: data.block_name || 'Tehsil',
          village_name: data.village_name || 'Village Area',
          pincode: data.pincode,
          formatted_address: data.formatted_address,
          distanceKm: 0,
          isAccurate: true,
          source: data.source || 'backend_gateway',
        };
        this.saveToCache(cacheKey, parsed);
        return parsed;
      }
    } catch (err) {
      console.warn('Backend reverse-geocoding gateway failed, falling to Tier 3:', err);
    }

    // Tier 3: BigDataCloud Direct Client Geocoding
    try {
      const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const data = await res.json();
        let state = data.principalSubdivision || '';
        let district = '';
        let block = '';
        let village = data.locality || data.city || '';

        const adminLevels = data.localityInfo?.administrative || [];
        for (const admin of adminLevels) {
          const lvl = admin.adminLevel;
          const desc = (admin.description || '').toLowerCase();
          const name = admin.name || '';
          if (lvl === 4 && !state) state = name;
          else if (lvl === 5 || desc.includes('district')) {
            if (!district) district = name.replace(/ district/i, '').trim();
          } else if (lvl === 6 || desc.includes('tehsil') || desc.includes('taluk') || desc.includes('block')) {
            if (!block) block = name.replace(/ tehsil/i, '').replace(/ taluk/i, '').trim();
          } else if ((lvl === 7 || lvl === 8) && !village) {
            village = name;
          }
        }

        const cleanVillage = village || data.locality || 'Local Village';
        const cleanBlock = block || district || 'Tehsil';
        const cleanDistrict = district || 'District';
        const cleanState = state || 'State';

        const parsed: SnappedLocationResult = {
          state_name: cleanState,
          district_name: cleanDistrict,
          block_name: cleanBlock,
          village_name: cleanVillage,
          pincode: data.postcode || undefined,
          formatted_address: `${cleanVillage}, ${cleanBlock}, ${cleanDistrict}, ${cleanState}`,
          distanceKm: 0,
          isAccurate: true,
          source: 'bigdatacloud',
        };
        this.saveToCache(cacheKey, parsed);
        return parsed;
      }
    } catch (err) {
      console.warn('BigDataCloud geocoding failed, falling to Tier 4:', err);
    }

    // Tier 4: OpenStreetMap Nominatim Direct
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'PashuSuraksha-Mobile/1.0' },
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const state = addr.state || 'State';
        const district = addr.state_district || addr.county || addr.district || 'District';
        const block = addr.taluk || addr.subdistrict || addr.tehsil || district;
        const village = addr.village || addr.hamlet || addr.suburb || addr.neighbourhood || addr.town || addr.city || 'Village Area';

        const parsed: SnappedLocationResult = {
          state_name: state,
          district_name: district,
          block_name: block,
          village_name: village,
          pincode: addr.postcode,
          formatted_address: data.display_name,
          distanceKm: 0,
          isAccurate: true,
          source: 'osm_nominatim',
        };
        this.saveToCache(cacheKey, parsed);
        return parsed;
      }
    } catch (err) {
      console.warn('OSM Nominatim direct failed:', err);
    }

    // Tier 5: Local Seed Nearest Match or Offline Geodetic Fallback
    try {
      const nearest = await this.snapToNearestLgdVillage(latitude, longitude);
      return {
        ...nearest,
        state_name: nearest.state_name || 'Maharashtra',
        source: 'local_sqlite_seed',
      };
    } catch (e) {
      // Safe fallback
      return {
        state_name: 'Auto-Detected Area',
        district_name: 'Local District',
        block_name: 'Tehsil',
        village_name: 'Village',
        distanceKm: 0,
        isAccurate: false,
        source: 'fallback',
      };
    }
  }

  /**
   * Nationwide search for any village, town, tehsil, or district across India
   */
  async searchNationwideLocations(query: string): Promise<LocationSearchResult[]> {
    const clean = query.trim();
    if (clean.length < 2) return [];

    // Try backend search
    try {
      const endpoint = getSearchLocationsEndpoint(clean, 8);
      const res = await fetch(endpoint, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          return data.results;
        }
      }
    } catch (err) {
      console.warn('Backend location search failed, falling to OSM Nominatim direct:', err);
    }

    // Direct OSM Nominatim search fallback
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(clean)}&countrycodes=in&format=jsonv2&addressdetails=1&limit=8`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'PashuSuraksha-Mobile/1.0' },
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const items = await res.json();
        return items.map((item: any) => {
          const addr = item.address || {};
          const state = addr.state || 'India';
          const district = addr.state_district || addr.county || addr.district || 'District';
          const block = addr.taluk || addr.subdistrict || addr.tehsil || district;
          const village = addr.village || addr.hamlet || addr.town || addr.suburb || addr.city || item.name || clean;

          return {
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            state_name: state,
            district_name: district,
            block_name: block,
            village_name: village,
            pincode: addr.postcode,
            formatted_address: item.display_name,
          };
        });
      }
    } catch (err) {
      console.warn('OSM Nominatim search direct failed:', err);
    }

    // Filter local seed villages if query matches
    const allVillages = await this.getAllLgdVillages();
    return allVillages
      .filter((v) => v.village_name.toLowerCase().includes(clean.toLowerCase()) || v.district_name.toLowerCase().includes(clean.toLowerCase()))
      .slice(0, 5)
      .map((v) => ({
        latitude: v.latitude,
        longitude: v.longitude,
        state_name: 'Maharashtra',
        district_name: v.district_name,
        block_name: v.block_name,
        village_name: v.village_name,
        formatted_address: `${v.village_name}, ${v.block_name}, ${v.district_name}, Maharashtra`,
      }));
  }

  /**
   * Snaps GPS coordinates to nearest Local Government Directory (LGD) village centroid
   */
  async snapToNearestLgdVillage(latitude: number, longitude: number): Promise<SnappedLocationResult> {
    const villages = await this.getAllLgdVillages();

    if (villages.length === 0) {
      return {
        state_name: 'Auto-Detected',
        district_name: 'District',
        block_name: 'Tehsil',
        village_name: 'Village',
        distanceKm: 0,
        isAccurate: false,
        source: 'empty_fallback',
      };
    }

    let minDistance = Infinity;
    let nearestVillage: LgdVillageRecord = villages[0];

    for (const village of villages) {
      const dist = this.calculateHaversineDistance(latitude, longitude, village.latitude, village.longitude);
      if (dist < minDistance) {
        minDistance = dist;
        nearestVillage = village;
      }
    }

    return {
      lgd_code: nearestVillage.lgd_code,
      state_name: 'Maharashtra',
      village_name: nearestVillage.village_name,
      block_name: nearestVillage.block_name,
      district_name: nearestVillage.district_name,
      formatted_address: `${nearestVillage.village_name}, ${nearestVillage.block_name}, ${nearestVillage.district_name}`,
      distanceKm: minDistance,
      isAccurate: minDistance <= 25,
      source: 'nearest_seed',
    };
  }

  /**
   * Retrieves all LGD village records from local SQLite or fallback JSON
   */
  async getAllLgdVillages(): Promise<LgdVillageRecord[]> {
    try {
      const rows = await dbService.query<LgdVillageRecord>('SELECT * FROM local_lgd_hierarchy');
      if (rows && rows.length > 0) {
        return rows;
      }
    } catch (err) {
      console.warn('Failed to query local_lgd_hierarchy table from SQLite, using seed JSON:', err);
    }

    return (lgdSeedData as LgdVillageRecord[]) || [];
  }
}

export const locationService = new LocationService();

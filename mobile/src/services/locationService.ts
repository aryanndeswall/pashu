import { Capacitor } from '@capacitor/core';
import { Geolocation, Position } from '@capacitor/geolocation';
import { dbService } from '../database/sqliteConnection';
import lgdSeedData from '../assets/data/seed_maharashtra_lgd.json';
import { LgdVillageRecord } from '../database/seedLgd';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

export interface SnappedLgdResult {
  lgd_code: number;
  village_name: string;
  block_name: string;
  district_name: string;
  distanceKm: number;
  isAccurate: boolean; // within 25 km threshold
}

export class LocationService {
  private isNative: boolean;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
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

    return Math.round(d * 100) / 100; // Round to 2 decimal places
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Acquires high-accuracy GPS coordinates via native hardware or web browser API
   */
  async getCurrentLocation(): Promise<LocationCoordinates> {
    if (this.isNative) {
      try {
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 3000,
        });

        return {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy || 10,
          timestamp: new Date(position.timestamp).toISOString(),
        };
      } catch (err) {
        console.warn('Native Geolocation failed, falling back to web/mock:', err);
      }
    }

    // Web browser Geolocation fallback
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy || 15,
              timestamp: new Date(pos.timestamp).toISOString(),
            });
          },
          (err) => {
            console.warn('Web geolocation error, using Ahmednagar centroid default:', err);
            // Default to Ahmednagar district centroid
            resolve({
              latitude: 19.0948,
              longitude: 74.7480,
              accuracy: 50,
              timestamp: new Date().toISOString(),
            });
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 }
        );
      });
    }

    // Mock environment fallback for tests
    return {
      latitude: 19.3912,
      longitude: 74.6521,
      accuracy: 8,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Snaps GPS coordinates to nearest Local Government Directory (LGD) village centroid
   */
  async snapToNearestLgdVillage(latitude: number, longitude: number): Promise<SnappedLgdResult> {
    const villages = await this.getAllLgdVillages();

    if (villages.length === 0) {
      throw new Error('No LGD village records found in local database');
    }

    let minDistance = Infinity;
    let nearestVillage: LgdVillageRecord = villages[0];

    for (const village of villages) {
      const dist = this.calculateHaversineDistance(
        latitude,
        longitude,
        village.latitude,
        village.longitude
      );

      if (dist < minDistance) {
        minDistance = dist;
        nearestVillage = village;
      }
    }

    return {
      lgd_code: nearestVillage.lgd_code,
      village_name: nearestVillage.village_name,
      block_name: nearestVillage.block_name,
      district_name: nearestVillage.district_name,
      distanceKm: minDistance,
      isAccurate: minDistance <= 25,
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

    // Fallback to static seed data
    return (lgdSeedData as LgdVillageRecord[]) || [];
  }
}

export const locationService = new LocationService();

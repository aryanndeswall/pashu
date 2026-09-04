import { describe, it, expect, beforeEach } from 'vitest';
import { LocationService } from '../services/locationService';

describe('LocationService', () => {
  let locationService: LocationService;

  beforeEach(() => {
    locationService = new LocationService();
  });

  describe('calculateHaversineDistance', () => {
    it('should calculate 0 distance between identical coordinates', () => {
      const distance = locationService.calculateHaversineDistance(19.3912, 74.6521, 19.3912, 74.6521);
      expect(distance).toBe(0);
    });

    it('should accurately calculate distance between Rahuri and Sangamner (~52 km)', () => {
      // Rahuri: 19.3912, 74.6521; Sangamner: 19.5761, 74.2122
      const distance = locationService.calculateHaversineDistance(19.3912, 74.6521, 19.5761, 74.2122);
      expect(distance).toBeGreaterThan(45);
      expect(distance).toBeLessThan(60);
    });
  });

  describe('snapToNearestLgdVillage', () => {
    it('should snap coordinates in Sangamner cluster to Ashwi Budruk (LGD 558301)', async () => {
      // Coordinates very close to Ashwi Budruk (19.6234, 74.3356)
      const snapped = await locationService.snapToNearestLgdVillage(19.6230, 74.3350);

      expect(snapped).toBeDefined();
      expect(snapped.village_name).toBe('Ashwi Budruk');
      expect(snapped.block_name).toBe('Sangamner');
      expect(snapped.district_name).toBe('Ahmednagar');
      expect(snapped.distanceKm).toBeLessThan(1.0);
      expect(snapped.isAccurate).toBe(true);
    });

    it('should mark accurate=false if nearest village is over 25km away', async () => {
      // Coordinates in the Arabian Sea or outside Maharashtra (e.g. Mumbai offshore 18.0, 71.0)
      const snapped = await locationService.snapToNearestLgdVillage(18.0, 71.0);

      expect(snapped).toBeDefined();
      expect(snapped.distanceKm).toBeGreaterThan(25);
      expect(snapped.isAccurate).toBe(false);
    });
  });

  describe('getAllLgdVillages', () => {
    it('should return seeded Maharashtra villages', async () => {
      const villages = await locationService.getAllLgdVillages();
      expect(villages.length).toBeGreaterThanOrEqual(10);
      expect(villages[0]).toHaveProperty('lgd_code');
      expect(villages[0]).toHaveProperty('village_name');
      expect(villages[0]).toHaveProperty('latitude');
      expect(villages[0]).toHaveProperty('longitude');
    });
  });
});

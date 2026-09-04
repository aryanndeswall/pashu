import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CameraService } from '../services/cameraService';

describe('CameraService', () => {
  let cameraService: CameraService;

  beforeEach(() => {
    cameraService = new CameraService();
  });

  describe('calculateTargetDimensions', () => {
    it('should maintain dimensions when image is within maxWidth and maxHeight', () => {
      const result = cameraService.calculateTargetDimensions(800, 600, 1280, 720);
      expect(result).toEqual({ width: 800, height: 600 });
    });

    it('should scale down 1080p 16:9 image proportionally to 720p', () => {
      const result = cameraService.calculateTargetDimensions(1920, 1080, 1280, 720);
      expect(result).toEqual({ width: 1280, height: 720 });
    });

    it('should scale down square image proportionally within bounds', () => {
      const result = cameraService.calculateTargetDimensions(2000, 2000, 1280, 720);
      expect(result.width).toBe(720);
      expect(result.height).toBe(720);
    });

    it('should scale down portrait image preserving aspect ratio', () => {
      const result = cameraService.calculateTargetDimensions(1080, 1920, 1280, 720);
      expect(result.height).toBe(720);
      expect(result.width).toBe(Math.round(1080 * (720 / 1920)));
    });
  });

  describe('compressToWebP', () => {
    it('should return a valid compressed photo result with format image/webp', async () => {
      const mockBase64 = 'data:image/jpeg;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      const result = await cameraService.compressToWebP(mockBase64);

      expect(result).toBeDefined();
      expect(result.format).toBe('image/webp');
      expect(result.sizeBytes).toBeGreaterThan(0);
      expect(result.timestamp).toBeDefined();
    });
  });
});

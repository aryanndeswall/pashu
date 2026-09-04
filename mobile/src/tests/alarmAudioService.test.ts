import { describe, it, expect, vi, beforeEach } from 'vitest';
import { alarmAudioService } from '../services/alarmAudioService';
import { idspAlertService } from '../services/idspAlertService';
import { dbService } from '../database/sqliteConnection';

describe('alarmAudioService & idspAlertService (BIO-02, BIO-03)', () => {
  beforeEach(async () => {
    await dbService.initDatabase();
    vi.clearAllMocks();
  });

  describe('alarmAudioService', () => {
    it('handles playBiohazardSiren and stopBiohazardSiren safely without throwing in test environment', () => {
      expect(() => {
        const stop = alarmAudioService.playBiohazardSiren();
        expect(typeof stop).toBe('function');
        alarmAudioService.stopBiohazardSiren();
      }).not.toThrow();
    });

    it('handles speakMarathiWarning without throwing when speech synthesis is called', () => {
      // Mock window.speechSynthesis
      const speakMock = vi.fn();
      const cancelMock = vi.fn();
      const getVoicesMock = vi.fn().mockReturnValue([
        { lang: 'mr-IN', name: 'Marathi India' },
        { lang: 'hi-IN', name: 'Hindi India' },
      ]);

      (window as any).speechSynthesis = {
        speak: speakMock,
        cancel: cancelMock,
        getVoices: getVoicesMock,
      };

      (window as any).SpeechSynthesisUtterance = vi.fn().mockImplementation((text) => ({
        text,
        rate: 1,
        pitch: 1,
      }));

      expect(() => {
        alarmAudioService.speakMarathiWarning();
      }).not.toThrow();

      expect(cancelMock).toHaveBeenCalled();
      expect(speakMock).toHaveBeenCalled();
    });
  });

  describe('idspAlertService', () => {
    it('queues a priority-3 IDSP zoonotic alert into SQLite offline_sync_queue', async () => {
      const executeSpy = vi.spyOn(dbService, 'execute');

      const syncId = await idspAlertService.dispatchIdspAlert({
        lgdCode: 558301,
        villageName: 'Ashwi Budruk',
        district: 'Ahmednagar',
        block: 'Sangamner',
        coordinates: { latitude: 19.6234, longitude: 74.3356 },
        syndrome: 'HSDS',
        primaryDisease: 'Anthrax (Bacillus anthracis)',
        pashuAadhaar: '1234-5678-9012',
        deadCount: 1,
      });

      expect(syncId).toContain('IDSP-');
      expect(executeSpy).toHaveBeenCalled();

      // Verify the queued payload in SQLite
      const queueItems = await dbService.query<any>('SELECT * FROM offline_sync_queue WHERE sync_id = ?', [syncId]);
      expect(queueItems.length).toBe(1);
      expect(queueItems[0].priority).toBe(3);
      expect(queueItems[0].entity_type).toBe('IDSP_ZOONOTIC_EMERGENCY');
      expect(queueItems[0].status).toBe('PENDING');

      const parsedPayload = JSON.parse(queueItems[0].payload_json);
      expect(parsedPayload.alert_type).toBe('CRITICAL_ANTHRAX_LOCK');
      expect(parsedPayload.disease.suspected_pathogen).toContain('Anthrax');
      expect(parsedPayload.quarantine_protocol.movement_freeze_radius_km).toBe(1.0);
    });
  });
});

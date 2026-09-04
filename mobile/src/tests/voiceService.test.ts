import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { VoiceService } from '../services/voiceService';

describe('VoiceService', () => {
  let voiceService: VoiceService;

  beforeEach(() => {
    vi.useFakeTimers();
    voiceService = new VoiceService();
  });

  afterEach(() => {
    voiceService.resetAudio();
    vi.useRealTimers();
  });

  it('should initialize with default idle state', () => {
    expect(voiceService.isRecording).toBe(false);
    expect(voiceService.durationSeconds).toBe(0);
    expect(voiceService.recordedAudio).toBeNull();
  });

  it('should start recording and track duration', async () => {
    const started = await voiceService.startRecording();
    expect(started).toBe(true);
    expect(voiceService.isRecording).toBe(true);

    // Advance 5 seconds
    vi.advanceTimersByTime(5000);
    expect(voiceService.durationSeconds).toBeGreaterThanOrEqual(4.9);

    const result = await voiceService.stopRecording();
    expect(result).toBeDefined();
    expect(result?.durationSeconds).toBeGreaterThanOrEqual(4.9);
    expect(result?.mimeType).toBeDefined();
    expect(result?.recordDataBase64).toBeDefined();
  });

  it('should auto-stop recording when reaching 30 seconds cap', async () => {
    await voiceService.startRecording();

    // Advance beyond 30 seconds
    vi.advanceTimersByTime(31000);

    expect(voiceService.isRecording).toBe(false);
    expect(voiceService.durationSeconds).toBeLessThanOrEqual(30);
  });

  it('should reset audio state cleanly', async () => {
    await voiceService.startRecording();
    vi.advanceTimersByTime(2000);
    await voiceService.stopRecording();

    expect(voiceService.recordedAudio).not.toBeNull();
    voiceService.resetAudio();
    expect(voiceService.recordedAudio).toBeNull();
    expect(voiceService.durationSeconds).toBe(0);
  });
});

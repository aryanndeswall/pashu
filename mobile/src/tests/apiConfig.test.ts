import { describe, it, expect } from 'vitest';
import { API_CONFIG, getApiUrl, getTriageEndpoint, getSyncTelemetryEndpoint, getSyncMediaEndpoint } from '../config/api';

describe('API Gateway Configuration (CLOUD-03)', () => {
  it('loads API_CONFIG with valid baseUrl and timeoutMs', () => {
    expect(API_CONFIG).toBeDefined();
    expect(typeof API_CONFIG.baseUrl).toBe('string');
    expect(API_CONFIG.baseUrl.length).toBeGreaterThan(0);
    expect(API_CONFIG.timeoutMs).toBeGreaterThanOrEqual(1000);
  });

  it('generates fully qualified URLs without duplicate slashes', () => {
    const url = getApiUrl('/triage/multimodal');
    expect(url).toBe(`${API_CONFIG.baseUrl}/triage/multimodal`);
    expect(url).not.toContain('//triage');
  });

  it('handles endpoints without leading slashes', () => {
    const url = getApiUrl('sync/telemetry');
    expect(url).toBe(`${API_CONFIG.baseUrl}/sync/telemetry`);
  });

  it('provides specialized helpers for core endpoints', () => {
    expect(getTriageEndpoint()).toBe(`${API_CONFIG.baseUrl}/triage/multimodal`);
    expect(getSyncTelemetryEndpoint()).toBe(`${API_CONFIG.baseUrl}/sync/telemetry`);
    expect(getSyncMediaEndpoint()).toBe(`${API_CONFIG.baseUrl}/sync/media`);
  });
});

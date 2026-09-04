import { describe, it, expect } from 'vitest';
import { smsFallbackService } from '../services/smsFallbackService';

describe('smsFallbackService - 140-Character Emergency SMS Fallback (SYNC-02)', () => {
  it('generates a compact SMS payload strictly under 140 characters', () => {
    const record = {
      syndrome_code: 'HSDS',
      lgd_code: 558301,
      latitude: 19.3912,
      longitude: 74.6521,
      pashu_aadhaar: '1234-5678-9012',
      priority: 3,
    };

    const sms = smsFallbackService.generateSmsEmergencyPayload(record);

    expect(sms.length).toBeLessThanOrEqual(140);
    expect(sms.length).toBeLessThan(70); // Usually ~45 characters
    expect(sms).toContain('PS*HSDS*558301*19.3912,74.6521*9012*P3*');
  });

  it('calculates consistent CRC-16 checksum and validates integrity', () => {
    const text = 'PS*VSS*558301*19.3912,74.6521*1234*P2';
    const checksum = smsFallbackService.calculateCrc16(text);

    expect(checksum).toHaveLength(4);
    expect(/^[0-9A-F]{4}$/.test(checksum)).toBe(true);

    const fullSms = `${text}*${checksum}`;
    expect(smsFallbackService.verifySmsPayload(fullSms)).toBe(true);

    // Tampered payload fails verification
    const tampered = `${text.replace('VSS', 'HSDS')}*${checksum}`;
    expect(smsFallbackService.verifySmsPayload(tampered)).toBe(false);
  });

  it('creates native SMS intent URL for emergency number 1962', () => {
    const smsText = 'PS*HSDS*558301*19.3912,74.6521*9012*P3*ABCD';
    const url = smsFallbackService.createSmsUrl(smsText, '1962');

    expect(url).toBe(`sms:1962?body=${encodeURIComponent(smsText)}`);
  });
});

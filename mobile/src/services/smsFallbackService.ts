// ponytail: lightweight 140-char SMS emergency fallback encoder with CRC-16 checksum
class SmsFallbackService {
  /**
   * Fast CRC-16 checksum calculation for SMS payload integrity
   */
  calculateCrc16(text: string): string {
    let crc = 0xffff;
    for (let i = 0; i < text.length; i++) {
      crc ^= text.charCodeAt(i);
      for (let j = 0; j < 8; j++) {
        if ((crc & 0x0001) !== 0) {
          crc = (crc >> 1) ^ 0xa001;
        } else {
          crc = crc >> 1;
        }
      }
    }
    return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0');
  }

  /**
   * Formats syndromic incident into standard 140-char GSM 7-bit SMS payload
   * Format: PS*<SYN_CODE>*<LGD_CODE>*<LAT,LNG>*<TAG>*P<PRIORITY>*<CRC>
   */
  generateSmsEmergencyPayload(record: {
    syndrome_code: string;
    lgd_code: number;
    latitude: number;
    longitude: number;
    pashu_aadhaar?: string;
    priority?: number;
  }): string {
    const syn = record.syndrome_code || 'VSS';
    const lgd = record.lgd_code || 558301;
    const lat = record.latitude.toFixed(4);
    const lng = record.longitude.toFixed(4);
    const tag = (record.pashu_aadhaar || 'UNTAGGED').replace(/\D/g, '').slice(-4) || 'XXXX';
    const prio = `P${record.priority ?? 2}`;

    const bodyPrefix = `PS*${syn}*${lgd}*${lat},${lng}*${tag}*${prio}`;
    const crc = this.calculateCrc16(bodyPrefix);
    const fullSms = `${bodyPrefix}*${crc}`;

    if (fullSms.length > 140) {
      return fullSms.slice(0, 140);
    }
    return fullSms;
  }

  createSmsUrl(smsText: string, recipient: string = '1962'): string {
    return `sms:${recipient}?body=${encodeURIComponent(smsText)}`;
  }

  verifySmsPayload(smsText: string): boolean {
    const parts = smsText.split('*');
    if (parts.length !== 7 || parts[0] !== 'PS') return false;
    const expectedCrc = parts[6];
    const body = parts.slice(0, 6).join('*');
    return this.calculateCrc16(body) === expectedCrc;
  }
}

export const smsFallbackService = new SmsFallbackService();

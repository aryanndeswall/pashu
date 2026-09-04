import { describe, it, expect } from 'vitest';
import { decisionTreeService, SECONDARY_SYMPTOMS_BY_SYNDROME } from '../services/decisionTreeService';

describe('decisionTreeService - 8-Syndrome Clinical Decision Tree (BIO-01)', () => {
  it('defines secondary symptoms for all 8 veterinary syndromes', () => {
    const codes = ['VSS', 'NSLS', 'HSDS', 'AROS', 'CMSS', 'SARF', 'HES', 'NAS'] as const;
    codes.forEach((code) => {
      const symptoms = SECONDARY_SYMPTOMS_BY_SYNDROME[code];
      expect(symptoms).toBeDefined();
      expect(symptoms.length).toBeGreaterThanOrEqual(3);
      symptoms.forEach((s) => {
        expect(s.id).toBeDefined();
        expect(s.nameMarathi).toBeDefined();
        expect(s.nameEnglish).toBeDefined();
      });
    });
  });

  describe('Rule Zero: Zero-Tolerance Anthrax Lockout', () => {
    it('triggers CRITICAL_ANTHRAX_LOCK when HSDS syndrome is selected', () => {
      const result = decisionTreeService.evaluateSyndrome('HSDS', []);

      expect(result.isAnthraxLockout).toBe(true);
      expect(result.urgencyLevel).toBe('CRITICAL_BIOHAZARD');
      expect(result.idspNotifiable).toBe(true);
      expect(result.primaryDifferential.diseaseName).toContain('Anthrax');
      expect(result.primaryDifferential.diseaseNameMarathi).toContain('काळपुळी');
      expect(result.primaryDifferential.confidence).toBe('CONFIRMED_ALERT');
      expect(result.primaryDifferential.isBiohazard).toBe(true);
      expect(result.farmerAdvisory).toContain('शव कापू नका');
    });

    it('triggers CRITICAL_ANTHRAX_LOCK when sudden death and unclotted dark blood symptoms are reported in any syndrome', () => {
      const result = decisionTreeService.evaluateSyndrome('AROS', ['sudden_death', 'unclotted_dark_blood']);

      expect(result.isAnthraxLockout).toBe(true);
      expect(result.urgencyLevel).toBe('CRITICAL_BIOHAZARD');
      expect(result.primaryDifferential.diseaseName).toContain('Anthrax');
      expect(result.idspNotifiable).toBe(true);
    });
  });

  describe('7 Standard Syndromes Evaluation & Dual Guidance', () => {
    it('evaluates VSS to Foot-and-Mouth Disease (FMD)', () => {
      const result = decisionTreeService.evaluateSyndrome('VSS', ['oral_vesicles', 'hoof_lesions']);

      expect(result.isAnthraxLockout).toBe(false);
      expect(result.urgencyLevel).toBe('HIGH_CONTAGION');
      expect(result.primaryDifferential.diseaseName).toContain('Foot-and-Mouth Disease');
      expect(result.primaryDifferential.diseaseNameMarathi).toContain('लाळ्या खुरकूत');
      expect(result.primaryDifferential.recommendedActionMarathi).toContain('पोटॅशियम परमँगनेट');
      expect(result.farmerAdvisory).toContain('गोठ्यात चुना');
    });

    it('evaluates NSLS to Lumpy Skin Disease (LSD)', () => {
      const result = decisionTreeService.evaluateSyndrome('NSLS', ['cutaneous_nodules']);

      expect(result.isAnthraxLockout).toBe(false);
      expect(result.urgencyLevel).toBe('HIGH_CONTAGION');
      expect(result.primaryDifferential.diseaseName).toContain('Lumpy Skin Disease');
      expect(result.primaryDifferential.confidence).toBe('HIGHLY_PROBABLE');
    });

    it('evaluates AROS to Haemorrhagic Septicaemia (HS)', () => {
      const result = decisionTreeService.evaluateSyndrome('AROS', ['swollen_throat_brisket']);

      expect(result.isAnthraxLockout).toBe(false);
      expect(result.primaryDifferential.diseaseName).toContain('Haemorrhagic Septicaemia');
      expect(result.primaryDifferential.diseaseNameMarathi).toContain('गळसुजी');
    });

    it('evaluates CMSS to Black Quarter (BQ)', () => {
      const result = decisionTreeService.evaluateSyndrome('CMSS', ['crepitant_swelling']);

      expect(result.isAnthraxLockout).toBe(false);
      expect(result.primaryDifferential.diseaseName).toContain('Black Quarter');
      expect(result.primaryDifferential.diseaseNameMarathi).toContain('फऱ्या');
    });

    it('evaluates SARF to Brucellosis and marks as IDSP notifiable zoonosis', () => {
      const result = decisionTreeService.evaluateSyndrome('SARF', ['late_term_abortion']);

      expect(result.isAnthraxLockout).toBe(false);
      expect(result.primaryDifferential.diseaseName).toContain('Brucellosis');
      expect(result.idspNotifiable).toBe(true);
    });

    it('evaluates HES to Enterotoxaemia', () => {
      const result = decisionTreeService.evaluateSyndrome('HES', ['bloody_diarrhea']);

      expect(result.isAnthraxLockout).toBe(false);
      expect(result.primaryDifferential.diseaseName).toContain('Enterotoxaemia');
      expect(result.primaryDifferential.diseaseNameMarathi).toContain('आंत्रविषार');
    });

    it('evaluates NAS to Rabies with CRITICAL_BIOHAZARD and IDSP notifiable flag', () => {
      const result = decisionTreeService.evaluateSyndrome('NAS', ['aggressive_behavior']);

      expect(result.isAnthraxLockout).toBe(false);
      expect(result.urgencyLevel).toBe('CRITICAL_BIOHAZARD');
      expect(result.primaryDifferential.diseaseName).toContain('Rabies');
      expect(result.primaryDifferential.isBiohazard).toBe(true);
      expect(result.idspNotifiable).toBe(true);
    });
  });
});

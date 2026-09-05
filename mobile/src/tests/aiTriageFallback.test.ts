import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { aiTriageService, TriageRequest, TriageResponse } from '../services/aiTriageService';
import { getTriageEndpoint } from '../config/api';

describe('AITriageService — Online/Offline Fallback & Timeout (CLOUD-01, CLOUD-03)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('immediately triggers Rule Zero Anthrax lockout without network fetch', async () => {
    const fetchSpy = vi.fn();
    global.fetch = fetchSpy;

    const request: TriageRequest = {
      species: 'Bovine',
      audio_transcript: 'अचानक मृत्यू झाला आणि नाकातून काळे रक्त वाहत आहे',
      secondary_symptoms: ['sudden death', 'unclotted blood'],
    };

    const result = await aiTriageService.runMultimodalTriage(request);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.syndrome_code).toBe('SARF');
    expect(result.biohazard_alert).toBe('CRITICAL_ANTHRAX_LOCK');
    expect(result.clinical_confidence).toBe(0.99);
    expect(result.immediate_advisory_marathi).toContain('DO NOT OPEN CARCASS');
    expect(result.immediate_advisory_hindi).toContain('पोस्टमार्टम न करें');
  });

  it('dispatches to dynamic API gateway and returns cloud response when online', async () => {
    const mockCloudResponse: TriageResponse = {
      syndrome_code: 'NSLS',
      syndrome_name_en: 'Nodular Skin Lesion Syndrome',
      syndrome_name_marathi: 'त्वचेवरील गाठींचे लक्षण (लंपी स्कीन डिसीज)',
      suspected_disease: 'Lumpy Skin Disease (LSD)',
      clinical_confidence: 0.95,
      biohazard_alert: 'WARNING',
      clinical_rationale: 'Multiple cutaneous nodules detected across neck and flank.',
      identified_symptoms: ['गाठी (Nodules)', 'ताप (Fever)'],
      immediate_advisory_marathi: 'बाधित जनावराला तात्काळ इतर जनावरांपासून वेगळे बांधा.',
      immediate_advisory_hindi: 'संक्रमित पशु को तुरंत अन्य पशुओं से अलग रखें।',
      recommended_containment_actions: ['विलगीकरण', 'गोचीड नियंत्रण', 'रिंग लसीकरण'],
      inference_time_ms: 220,
      model_used: 'Google-Gemini-gemini-2.5-flash',
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockCloudResponse,
    });

    const request: TriageRequest = {
      species: 'Bovine',
      audio_transcript: 'गायीच्या अंगावर मोठ्या गाठी आल्या आहेत',
      secondary_symptoms: ['गाठी', 'ताप'],
    };

    const result = await aiTriageService.runMultimodalTriage(request);

    expect(global.fetch).toHaveBeenCalledWith(
      getTriageEndpoint(),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );
    expect(result.syndrome_code).toBe('NSLS');
    expect(result.model_used).toBe('Google-Gemini-gemini-2.5-flash');
    expect(result.clinical_confidence).toBe(0.95);
  });

  it('gracefully falls back to on-device heuristic engine when HTTP returns 500', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const request: TriageRequest = {
      species: 'Bovine',
      audio_transcript: 'गाय तोंडात फोड आले आहेत आणि भरपूर लाळ गळत आहे',
      secondary_symptoms: ['Salivation', 'Blisters'],
    };

    const result = await aiTriageService.runMultimodalTriage(request);

    expect(result.syndrome_code).toBe('VSS');
    expect(result.clinical_confidence).toBeGreaterThanOrEqual(0.9);
    expect(result.suspected_disease).toContain('Foot & Mouth');
    expect(result.immediate_advisory_marathi).toContain('पोटॅशियम परमँगनेट');
  });

  it('gracefully falls back to on-device heuristic engine on network timeout or connection rejection', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network request failed: Dead Zone'));

    const request: TriageRequest = {
      species: 'Bovine',
      audio_transcript: 'जनावराचा घसा सुजला आहे आणि घरघर आवाज करत आहे',
      secondary_symptoms: ['घसा सूज', 'श्वास घेण्यास त्रास'],
    };

    const result = await aiTriageService.runMultimodalTriage(request);

    expect(result.syndrome_code).toBe('HSDS');
    expect(result.biohazard_alert).toBe('WARNING');
    expect(result.suspected_disease).toContain('Septicemia');
    expect(result.immediate_advisory_marathi).toContain('सल्फोनामाइड');
  });
});

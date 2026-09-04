import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TriageResultCard } from '../components/syndromes/TriageResultCard';
import { TriageResponse } from '../services/aiTriageService';
import { hapticsService } from '../services/hapticsService';

// Mock hapticsService
vi.mock('../services/hapticsService', () => ({
  hapticsService: {
    hapticLight: vi.fn().mockResolvedValue(undefined),
    hapticError: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('TriageResultCard Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockFmdResponse: TriageResponse = {
    syndrome_code: 'VSS',
    syndrome_name_en: 'Vesicular Stomatitis Syndrome',
    syndrome_name_marathi: 'लाळ्या खुरकूत संलक्षण',
    suspected_disease: 'लाळ्या खुरकूत (Foot & Mouth Disease - FMD)',
    clinical_confidence: 0.94,
    biohazard_alert: 'WARNING',
    clinical_rationale: 'तोंडातील फोड आणि लाळ गळणे हे FMD आजाराचे स्पष्ट संकेत आहेत.',
    identified_symptoms: ['तोंडात फोड', 'लाळ गळणे'],
    immediate_advisory_marathi: 'पोटॅशियम परमँगनेटच्या पाण्याने तोंड व पाय स्वच्छ धुवा.',
    immediate_advisory_hindi: 'पोटाश (लाल दवा) के हल्के घोल से मुंह और खुरों को धोएं।',
    recommended_containment_actions: ['१५ मीटर विलगीकरण', 'दूध विक्री थांबवा'],
    inference_time_ms: 120,
    model_used: 'Google-Gemini-3.7-Flash',
  };

  const mockAnthraxResponse: TriageResponse = {
    syndrome_code: 'SARF',
    syndrome_name_en: 'Sudden Death with Bleeding Syndrome',
    syndrome_name_marathi: 'काळपुळी (पटकी / ॲन्थ्रॅक्स)',
    suspected_disease: 'काळपुळी (Anthrax)',
    clinical_confidence: 0.99,
    biohazard_alert: 'CRITICAL_ANTHRAX_LOCK',
    clinical_rationale: 'अचानक मृत्यू व छिद्रांतून न गोठणारे रक्त हे ॲन्थ्रॅक्सचे लक्षण आहे.',
    identified_symptoms: ['अचानक मृत्यू', 'रक्तस्त्राव'],
    immediate_advisory_marathi: 'धोका! मृत जनावराचे शव कापू नका (DO NOT OPEN CARCASS).',
    immediate_advisory_hindi: 'खतरा! मृत पशु का पोस्टमार्टम न करें।',
    recommended_containment_actions: ['शवविच्छेदन तात्काळ थांबवा'],
    inference_time_ms: 85,
    model_used: 'EdgeRulesEvaluator-RuleZero',
  };

  it('renders FMD triage result with 94% confidence, rationale, and Marathi advice', () => {
    render(<TriageResultCard triage={mockFmdResponse} />);

    expect(screen.getByTestId('triage-result-card')).toBeDefined();
    expect(screen.getByText(/लाळ्या खुरकूत संलक्षण/i)).toBeDefined();
    expect(screen.getByTestId('confidence-badge').textContent).toContain('94%');
    expect(screen.getByText(/पोटॅशियम परमँगनेटच्या पाण्याने/i)).toBeDefined();
    expect(screen.queryByTestId('anthrax-biohazard-banner')).toBeNull();
    expect(hapticsService.hapticLight).toHaveBeenCalledTimes(1);
  });

  it('switches between Marathi and Hindi advisory tabs', () => {
    render(<TriageResultCard triage={mockFmdResponse} />);

    const hindiTab = screen.getByRole('button', { name: /हिंदी/i });
    fireEvent.click(hindiTab);

    expect(screen.getByText(/पोटाश \(लाल दवा\)/i)).toBeDefined();

    const marathiTab = screen.getByRole('button', { name: /मराठी/i });
    fireEvent.click(marathiTab);

    expect(screen.getByText(/पोटॅशियम परमँगनेटच्या पाण्याने/i)).toBeDefined();
  });

  it('renders critical Anthrax lockout banner and triggers haptic error alert', () => {
    render(<TriageResultCard triage={mockAnthraxResponse} />);

    expect(screen.getByTestId('anthrax-biohazard-banner')).toBeDefined();
    expect(screen.getByText(/DO NOT CUT OR OPEN CARCASS/i)).toBeDefined();
    expect(hapticsService.hapticError).toHaveBeenCalledTimes(1);
  });

  it('calls onAcknowledge callback when acknowledge button is clicked', () => {
    const handleAcknowledge = vi.fn();
    render(<TriageResultCard triage={mockFmdResponse} onAcknowledge={handleAcknowledge} />);

    const ackBtn = screen.getByTestId('btn-acknowledge-triage');
    fireEvent.click(ackBtn);

    expect(handleAcknowledge).toHaveBeenCalledTimes(1);
  });
});

import React, { useState, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  FastForward,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import {
  AHMEDNAGAR_SIMULATION_STEPS,
  SimulationStepState,
} from '../../services/gisService';
import { hapticsService } from '../../services/hapticsService';

export const SihDemoSimulatorCard: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(6); // Default show full completion
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoPlaying) {
      timer = setTimeout(() => {
        if (currentStepIndex < AHMEDNAGAR_SIMULATION_STEPS.length - 1) {
          setCurrentStepIndex((prev) => prev + 1);
          hapticsService.triggerSelection();
        } else {
          setIsAutoPlaying(false);
          hapticsService.triggerError();
        }
      }, 2500);
    }
    return () => clearTimeout(timer);
  }, [isAutoPlaying, currentStepIndex]);

  const handleNext = async () => {
    if (currentStepIndex < AHMEDNAGAR_SIMULATION_STEPS.length - 1) {
      await hapticsService.triggerSelection();
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleReset = async () => {
    await hapticsService.triggerNotification();
    setIsAutoPlaying(false);
    setCurrentStepIndex(0);
  };

  const currentStep = AHMEDNAGAR_SIMULATION_STEPS[currentStepIndex];

  return (
    <div className="bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-900 rounded-3xl p-5 text-white shadow-xl border border-purple-500/30 relative overflow-hidden space-y-4">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Title & Badge */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-xs font-black tracking-wide uppercase text-purple-200">
              SIH २०२६ लाईव्ह सादरीकरण सिम्युलेटर
            </h3>
            <p className="text-[10px] text-purple-300/80">
              End-to-End Outbreak Containment Lifecycle
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          टप्पा {currentStepIndex + 1} / 7
        </span>
      </div>

      {/* Stepper Progress Bar */}
      <div className="grid grid-cols-7 gap-1 relative z-10">
        {AHMEDNAGAR_SIMULATION_STEPS.map((step, idx) => (
          <div
            key={step.stepNumber}
            onClick={() => setCurrentStepIndex(idx)}
            className={`h-1.5 rounded-full cursor-pointer transition-all duration-300 ${
              idx <= currentStepIndex
                ? 'bg-purple-400 shadow-sm shadow-purple-400/50'
                : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      {/* Active Step Highlight Card */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 space-y-2 relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold text-purple-300 block">
              {currentStep.component}
            </span>
            <h4 className="text-sm font-bold text-white lang-devanagari mt-0.5">
              {currentStep.stepTitleMr}
            </h4>
            <p className="text-[11px] text-white/70">
              {currentStep.stepTitle}
            </p>
          </div>

          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-purple-500/30 text-purple-200 border border-purple-400/40">
            {currentStep.status}
          </span>
        </div>

        {/* Step Key Metrics */}
        <div className="bg-black/30 rounded-xl p-2 text-[11px] font-mono grid grid-cols-2 gap-2 text-purple-100 border border-white/5">
          {Object.entries(currentStep.metrics).map(([k, v]) => (
            <div key={k} className="truncate">
              <span className="text-purple-300/60 block text-[9px] uppercase">{k}</span>
              <span className="font-bold text-white">{String(v)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center gap-2 pt-1 relative z-10">
        <button
          type="button"
          onClick={handleReset}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-purple-200 text-xs font-bold transition-transform active:scale-95 flex items-center justify-center"
          title="Reset to Step 1"
          aria-label="Reset simulation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-transform active:scale-95 flex items-center justify-center gap-1.5 shadow ${
            isAutoPlaying
              ? 'bg-amber-500 text-slate-900 font-black'
              : 'bg-white/10 hover:bg-white/20 text-white'
          }`}
        >
          {isAutoPlaying ? <FastForward className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isAutoPlaying ? 'स्वयंचलित सुरू आहे...' : '⚡ ऑटो प्ले (Auto Run)'}</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={currentStepIndex >= AHMEDNAGAR_SIMULATION_STEPS.length - 1}
          className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-transform active:scale-95 flex items-center justify-center gap-1 disabled:opacity-40 shadow-md"
        >
          <span>पुढील टप्पा</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

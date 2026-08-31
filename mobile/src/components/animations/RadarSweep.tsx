import React from 'react';

interface RadarSweepProps {
  size?: number;
  className?: string;
}

export const RadarSweep: React.FC<RadarSweepProps> = ({ size = 220, className = '' }) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-full border border-emerald-500/30 bg-emerald-950/20 overflow-hidden flex items-center justify-center ${className}`}
      aria-hidden="true"
    >
      {/* 5 km scale inner circle */}
      <div className="absolute w-2/3 h-2/3 rounded-full border border-dashed border-emerald-500/40" />

      {/* 2.5 km scale center core circle */}
      <div className="absolute w-1/3 h-1/3 rounded-full border border-emerald-400/50" />

      {/* Crosshairs */}
      <div className="absolute w-full h-[1px] bg-emerald-500/20" />
      <div className="absolute h-full w-[1px] bg-emerald-500/20" />

      {/* Rotating Radar Conic Beam (60 FPS CSS GPU transform) */}
      <div
        className="absolute inset-0 rounded-full animate-radar-sweep pointer-events-none"
        style={{
          background:
            'conic-gradient(from 0deg, transparent 0deg, transparent 280deg, rgba(16, 185, 129, 0.4) 360deg)',
          willChange: 'transform',
        }}
      />

      {/* Center GPS pulse blip */}
      <div className="relative z-10 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-lg shadow-emerald-400/80 animate-ping" />
      <div className="absolute z-10 w-2.5 h-2.5 rounded-full bg-emerald-400" />
    </div>
  );
};

import React from 'react';

interface HazardBorderProps {
  children: React.ReactNode;
  isActive?: boolean;
  className?: string;
}

export const HazardBorder: React.FC<HazardBorderProps> = ({
  children,
  isActive = true,
  className = '',
}) => {
  if (!isActive) {
    return <>{children}</>;
  }

  return (
    <div
      className={`relative rounded-2xl p-[2px] overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Flashing crimson hazard background pulse */}
      <div className="absolute inset-0 rounded-2xl hazard-glow-pulse border-2 border-red-600 pointer-events-none z-10" />
      <div className="relative z-0 h-full w-full">{children}</div>
    </div>
  );
};

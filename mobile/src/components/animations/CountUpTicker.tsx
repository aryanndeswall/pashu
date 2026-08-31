import React, { useEffect, useState } from 'react';

interface CountUpTickerProps {
  end: number;
  durationMs?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export const CountUpTicker: React.FC<CountUpTickerProps> = ({
  end,
  durationMs = 800,
  className = '',
  prefix = '',
  suffix = '',
}) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animFrameId: number;

    const startValue = current;
    const change = end - startValue;

    if (change === 0) return;

    const animateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / durationMs, 1);

      // Ease-out cubic curve for natural decelerating roll-up
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const nextVal = Math.round(startValue + change * easeOut);

      setCurrent(nextVal);

      if (progress < 1) {
        animFrameId = requestAnimationFrame(animateCount);
      }
    };

    animFrameId = requestAnimationFrame(animateCount);

    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, [end, durationMs]);

  return (
    <span className={`tabular-nums font-semibold tracking-tight ${className}`}>
      {prefix}
      {current}
      {suffix}
    </span>
  );
};

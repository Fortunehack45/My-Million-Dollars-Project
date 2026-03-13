import React, { useEffect, useRef } from 'react';

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ 
  value, 
  decimals = 0, 
  prefix = "", 
  suffix = "",
  className = "" 
}) => {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const currentVal = useRef(value);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 500; // Smooth 500ms transition
    const startValue = currentVal.current;
    let animationFrame: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Cinematic ease-out (expo)
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      const nowValue = startValue + (value - startValue) * easeProgress;
      currentVal.current = nowValue;
      
      if (nodeRef.current) {
        nodeRef.current.textContent = `${prefix}${nowValue.toLocaleString(undefined, { 
          minimumFractionDigits: decimals, 
          maximumFractionDigits: decimals 
        })}${suffix}`;
      }

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    animationFrame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrame);
  }, [value, decimals, prefix, suffix]);

  // Initial render content
  return (
    <span ref={nodeRef} className={className}>
      {`${prefix}${currentVal.current.toLocaleString(undefined, { 
        minimumFractionDigits: decimals, 
        maximumFractionDigits: decimals 
      })}${suffix}`}
    </span>
  );
};

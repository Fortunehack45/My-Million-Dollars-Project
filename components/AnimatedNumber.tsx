import React, { useEffect, useRef } from 'react';
import { animate } from 'framer-motion';

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

  useEffect(() => {
    const node = nodeRef.current;
    if (node) {
      const controls = animate(0, value, {
        duration: 2,
        ease: [0.16, 1, 0.3, 1], // Custom cinematic ease-out
        onUpdate: (v) => {
          node.textContent = `${prefix}${v.toLocaleString(undefined, { 
            minimumFractionDigits: decimals, 
            maximumFractionDigits: decimals 
          })}${suffix}`;
        }
      });
      return () => controls.stop();
    }
  }, [value, decimals, prefix, suffix]);

  return <span ref={nodeRef} className={className} />;
};

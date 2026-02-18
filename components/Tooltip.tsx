
import React from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children, position = 'top' }) => {
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-3',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-3',
    left: 'right-full top-1/2 -translate-y-1/2 mr-3',
    right: 'left-full top-1/2 -translate-y-1/2 ml-3',
  };

  const arrowClasses = {
    top: 'top-full -translate-y-1/2 left-1/2 -translate-x-1/2 border-b border-r',
    bottom: 'bottom-full translate-y-1/2 left-1/2 -translate-x-1/2 border-t border-l',
    left: 'left-full -translate-x-1/2 top-1/2 -translate-y-1/2 border-t border-r',
    right: 'right-full translate-x-1/2 top-1/2 -translate-y-1/2 border-b border-l',
  };

  return (
    <div className="relative group inline-block">
      {children}
      <div className={`absolute z-[200] opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 origin-center pointer-events-none ${positionClasses[position]}`}>
        <div className="bg-zinc-950/90 border border-zinc-800 text-zinc-300 text-[9px] font-bold uppercase tracking-[0.15em] px-3 py-2 rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-md whitespace-nowrap">
          {text}
          <div className={`absolute w-1.5 h-1.5 bg-zinc-950 border-zinc-800 rotate-45 ${arrowClasses[position]}`}></div>
        </div>
      </div>
    </div>
  );
};

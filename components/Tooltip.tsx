
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
      <div className={`absolute z-[200] opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-out-expo delay-150 origin-bottom pointer-events-none ${positionClasses[position]}`}>
        <div className="liquid-glass border border-white/20 text-white text-[10px] font-mono font-black uppercase tracking-[0.2em] px-4 py-2.5 rounded-xl shadow-2xl whitespace-nowrap bg-zinc-950/95 backdrop-blur-2xl">
          <div className="relative z-10">{text}</div>
          <div className={`absolute w-2 h-2 bg-zinc-950 border-white/20 rotate-45 z-0 ${arrowClasses[position]}`}></div>
        </div>
      </div>
    </div>
  );
};

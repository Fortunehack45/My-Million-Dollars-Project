import React, { useEffect, useState } from 'react';

const CustomCursor: React.FC = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isPointer, setIsPointer] = useState(false);
    const [isHidden, setIsHidden] = useState(true);

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
            setIsHidden(false);
            
            const target = e.target as HTMLElement;
            const isClickable = window.getComputedStyle(target).cursor === 'pointer' || 
                              target.tagName === 'BUTTON' || 
                              target.tagName === 'A';
            setIsPointer(isClickable);
        };

        const onMouseLeave = () => setIsHidden(true);
        const onMouseEnter = () => setIsHidden(false);

        window.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseleave', onMouseLeave);
        document.addEventListener('mouseenter', onMouseEnter);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseleave', onMouseLeave);
            document.removeEventListener('mouseenter', onMouseEnter);
        };
    }, []);

    if (isHidden) return null;

    return (
        <div 
            className="fixed inset-0 pointer-events-none z-[9999] mix-blend-difference hidden md:block"
            style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
        >
            <div className={`
                absolute -translate-x-1/2 -translate-y-1/2
                w-4 h-4 rounded-full border border-white/40
                transition-all duration-500 ease-out
                ${isPointer ? 'scale-[1.8] bg-white opacity-10' : 'scale-100 bg-transparent'}
            `} />
            <div className={`
                absolute -translate-x-1/2 -translate-y-1/2
                w-1 h-1 bg-white rounded-full
                transition-transform duration-200
                ${isPointer ? 'scale-0' : 'scale-100'}
            `} />
        </div>
    );
};

export default CustomCursor;

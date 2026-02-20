
import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'rect' | 'circle' | 'text';
}

const Skeleton: React.FC<SkeletonProps> = ({ className = "", variant = 'rect' }) => {
    const baseClasses = "animate-pulse bg-zinc-900/50 relative overflow-hidden";

    const variantClasses = {
        rect: "rounded-xl",
        circle: "rounded-full",
        text: "rounded h-4 w-full"
    };

    return (
        <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
            {/* Shimmer effect overlay */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.03] to-transparent"></div>
        </div>
    );
};

export default Skeleton;

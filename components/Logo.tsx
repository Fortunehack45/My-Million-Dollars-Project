
import React from 'react';

/**
 * Robust Logo Component
 * 
 * Uses an SVG filter to programmatically isolate the white letter from the red background of `logo.png`.
 * - Maps Green channel intensity to Alpha channel.
 * - Red background (Low Green) -> Transparent.
 * - White letter (High Green) -> Opaque.
 * 
 * Usage: <Logo className="w-8 h-8 text-maroon" />
 */
export const Logo = ({ className = "w-8 h-8" }: { className?: string }) => {
    // Unique ID to prevent conflicts if multiple instances are mounted
    const id = React.useId().replace(/:/g, "");
    const filterId = `filter-${id}`;
    const maskId = `mask-${id}`;

    return (
        <svg
            viewBox="0 0 500 500"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Argus Protocol Logo"
        >
            <defs>
                <clipPath id="circle-clip">
                    <circle cx="250" cy="250" r="250" />
                </clipPath>
                <filter id={filterId}>
                    <feColorMatrix
                        in="SourceGraphic"
                        type="matrix"
                        values="
              0 0 0 0 1
              0 0 0 0 1
              0 0 0 0 1
              0 1 0 0 0"
                    />
                </filter>
                <mask id={maskId}>
                    <image
                        href="/logo.png"
                        width="100%"
                        height="100%"
                        filter={`url(#${filterId})`}
                        preserveAspectRatio="xMidYMid contain"
                    />
                </mask>
            </defs>
            <g clipPath="url(#circle-clip)">
                <rect width="100%" height="100%" fill="currentColor" mask={`url(#${maskId})`} />
            </g>
        </svg>
    );
};

export default Logo;

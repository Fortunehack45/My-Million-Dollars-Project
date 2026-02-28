
import React from 'react';

/**
 * Professional Ethereum Logo Component
 * Renders the standard ETH diamond using high-fidelity SVG paths.
 */
export const EthLogo = ({ className = "w-8 h-8" }: { className?: string }) => {
    return (
        <svg
            viewBox="0 0 784 1277"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Ethereum Logo"
        >
            <path d="M392.07 0 383.5 29.11V870.3l8.57 8.58 392.06-231.75z" fill="#343434" />
            <path d="M392.07 0 0 647.13l392.07 231.75V440.04z" fill="#8C8C8C" />
            <path d="M392.07 1276.64l-4.83-5.89V942.33l4.83 4.83 392.06-552.03z" fill="#3C3C3B" />
            <path d="M392.07 1276.64V947.16L0 725.1z" fill="#8C8C8C" />
            <path d="m392.07 870.3 392.06-231.75-392.06-177.5z" fill="#141414" />
            <path d="M0 647.13 392.07 870.3V461.05z" fill="#393939" />
        </svg>
    );
};

export default EthLogo;

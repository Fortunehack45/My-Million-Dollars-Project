import React from 'react';

const LiquidGlassFilters: React.FC = () => {
    return (
        <svg
            className="fixed inset-0 pointer-events-none opacity-0 invisible"
            aria-hidden="true"
            style={{ width: 0, height: 0, position: 'absolute' }}
        >
            <defs>
                {/* Effect 1: Liquid - subtle warp and refraction */}
                <filter id="filter">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.01 0.01"
                        numOctaves="2"
                        result="noise"
                    >
                        <animate attributeName="baseFrequency" values="0.01 0.01;0.012 0.012;0.01 0.01" dur="15s" repeatCount="indefinite" />
                    </feTurbulence>
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="noise"
                        scale="5"
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />
                </filter>

                {/* Effect 2: Warp - stronger geometric distortion */}
                <filter id="warp">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.04 0.04"
                        numOctaves="2"
                        result="noise"
                    >
                        <animate attributeName="seed" values="1;100;1" dur="20s" repeatCount="indefinite" />
                    </feTurbulence>
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="noise"
                        scale="15"
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />
                </filter>

                {/* Effect 3: RGB Split - chromatic aberration */}
                <filter id="rgb-split">
                    <feOffset in="SourceGraphic" dx="-1.5" dy="0" result="red">
                        <animate attributeName="dx" values="-1.5; -2.5; -1.5" dur="4s" repeatCount="indefinite" />
                    </feOffset>
                    <feOffset in="SourceGraphic" dx="1.5" dy="0" result="blue">
                        <animate attributeName="dx" values="1.5; 2.5; 1.5" dur="4s" repeatCount="indefinite" />
                    </feOffset>
                    <feColorMatrix in="red" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="redOnly" />
                    <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="greenOnly" />
                    <feColorMatrix in="blue" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blueOnly" />
                    <feBlend in="redOnly" in2="greenOnly" mode="screen" result="rg" />
                    <feBlend in="rg" in2="blueOnly" mode="screen" />
                </filter>
            </defs>
        </svg>
    );
};

export default LiquidGlassFilters;

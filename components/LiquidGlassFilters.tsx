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
                        numOctaves="3"
                        result="noise"
                    />
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="noise"
                        scale="4"
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />
                </filter>

                {/* Effect 2: Warp - stronger geometric distortion */}
                <filter id="warp">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.05 0.05"
                        numOctaves="2"
                        result="noise"
                    />
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="noise"
                        scale="10"
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />
                </filter>

                {/* Effect 3: RGB Split - chromatic aberration */}
                <filter id="rgb-split">
                    <feOffset in="SourceGraphic" dx="-2" dy="0" result="red" />
                    <feOffset in="SourceGraphic" dx="2" dy="0" result="blue" />
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

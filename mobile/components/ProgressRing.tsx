import React from 'react';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '../theme';

interface ProgressRingProps {
    progress: number;
    size?: number;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
    progress,
    size = 80
}) => {
    const r = (size - 8) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (progress / 100) * circ;

    return (
        <Svg width={size} height={size}>
            <Circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                stroke={Colors.zinc800}
                strokeWidth={4}
                fill="none"
            />
            <Circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                stroke={progress >= 100 ? Colors.white : Colors.maroon}
                strokeWidth={4}
                fill="none"
                strokeDasharray={`${circ} ${circ}`}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
        </Svg>
    );
};

export default ProgressRing;

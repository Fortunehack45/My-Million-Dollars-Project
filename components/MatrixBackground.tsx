
import React, { useEffect, useRef } from 'react';

interface MatrixBackgroundProps {
    color?: string;
    fontSize?: number;
    speed?: number;
    opacity?: number;
    chars?: string;
}

const MatrixBackground: React.FC<MatrixBackgroundProps> = ({
    color = 'rgba(128, 0, 0, 0.15)',
    fontSize = 14,
    speed = 1,
    opacity = 1,
    chars = '01'
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const charList = chars === '01' ? '01' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
        let columns = Math.floor(canvas.width / fontSize);
        let drops: number[] = new Array(columns).fill(1).map(() => Math.random() * (canvas.height / fontSize));
        let speeds: number[] = new Array(columns).fill(1).map(() => 0.5 + Math.random() * 1.5);

        let animationId: number;
        let lastTime = 0;
        const fps = 30; // Cap FPS for smoother perception and battery life
        const interval = 1000 / fps;

        const draw = (timestamp: number) => {
            animationId = requestAnimationFrame(draw);

            const delta = timestamp - lastTime;
            if (delta < interval) return;
            lastTime = timestamp - (delta % interval);

            // Progressive trail fading
            ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.font = `900 ${fontSize}px "JetBrains Mono", monospace`;

            for (let i = 0; i < drops.length; i++) {
                const char = charList[Math.floor(Math.random() * charList.length)];
                const x = i * fontSize;
                const y = drops[i] * fontSize;

                // Glossy look: Leading character is brighter
                const yPos = y / canvas.height;

                // Robust color handling
                const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                const r = match ? match[1] : '128';
                const g = match ? match[2] : '0';
                const b = match ? match[3] : '0';

                // Main trail
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.1 + (1 - yPos) * 0.3})`;
                ctx.fillText(char, x, y);

                // Re-spawn logic
                if (y > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                    speeds[i] = 0.5 + Math.random() * 1.5;
                }
                drops[i] += speed * speeds[i];
            }
        };

        animationId = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        };
    }, [color, fontSize, speed, chars]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-0"
            style={{ opacity }}
        />
    );
};

export default MatrixBackground;

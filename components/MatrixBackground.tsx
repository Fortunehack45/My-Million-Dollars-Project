
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

        let columns = Math.floor(canvas.width / fontSize);
        let drops: number[] = new Array(columns).fill(1).map(() => Math.random() * (canvas.height / fontSize));

        let animationId: number;

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

            for (let i = 0; i < drops.length; i++) {
                const char = chars[Math.floor(Math.random() * chars.length)];
                const x = i * fontSize;
                const y = drops[i] * fontSize;

                // Gradient effect based on vertical position
                const yPos = y / canvas.height;
                ctx.fillStyle = color.replace('0.15', (0.1 + (1 - yPos) * 0.2).toString());

                ctx.fillText(char, x, y);

                if (y > canvas.height && Math.random() > 0.98) {
                    drops[i] = 0;
                }
                drops[i] += speed * (0.5 + Math.random() * 0.5);
            }
            animationId = requestAnimationFrame(draw);
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
            className="fixed inset-0 pointer-events-none z-0"
            style={{ opacity }}
        />
    );
};

export default MatrixBackground;

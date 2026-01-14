'use client';

import { useEffect, useState } from 'react';

interface Confetti {
  id: number;
  emoji: string;
  x: number;
  delay: number;
  duration: number;
  rotation: number;
  size: number;
}

const EMOJIS = ['⭐', '✨', '🎉', '🌟', '💫', '🎊', '⭐', '✨'];

export default function SparklesAnimation() {
  const [confetti, setConfetti] = useState<Confetti[]>([]);

  useEffect(() => {
    // Generate 80 emoji confetti pieces immediately
    const newConfetti: Confetti[] = [];
    for (let i = 0; i < 80; i++) {
      newConfetti.push({
        id: i,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        x: Math.random() * 120 - 10, // Spread out more: -10% to 110% for wider distribution
        delay: Math.random() * 1.5, // Stagger start times (0-1.5s) for more spread
        duration: 3 + Math.random() * 2, // Fall duration (3-5s)
        rotation: Math.random() * 360, // Random starting rotation
        size: 24 + Math.random() * 16, // Size between 24-40px (smaller)
      });
    }
    setConfetti(newConfetti);
    console.log('Confetti generated:', newConfetti.length);

    // Clean up after animation completes (max 6 seconds)
    const timer = setTimeout(() => {
      setConfetti([]);
    }, 6000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    // Inject CSS keyframes
    const styleId = 'emoji-confetti-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes confetti-fall {
          0% {
            opacity: 1;
            transform: translateY(-20px) rotate(0deg) translateX(0);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.3;
            transform: translateY(calc(100vh + 150px)) rotate(1080deg) translateX(20px);
          }
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      const style = document.getElementById(styleId);
      if (style) {
        style.remove();
      }
    };
  }, []);

  return (
    <div 
      className="fixed pointer-events-none"
      style={{ 
        top: 0, 
        left: 0, 
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        pointerEvents: 'none',
        overflow: 'visible'
      }}
    >
        {confetti.map((piece) => (
          <div
            key={piece.id}
            className="absolute"
            style={{
              left: `${piece.x}%`,
              top: '-100px',
              fontSize: `${piece.size}px`,
              lineHeight: '1',
              animation: `confetti-fall ${piece.duration}s linear ${piece.delay}s both`,
              transform: `rotate(${piece.rotation}deg)`,
              willChange: 'transform, opacity',
              pointerEvents: 'none',
              userSelect: 'none',
              display: 'block',
              filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.5))',
              textShadow: '0 0 4px rgba(255,255,255,0.8)',
            }}
          >
            {piece.emoji}
          </div>
        ))}
    </div>
  );
}


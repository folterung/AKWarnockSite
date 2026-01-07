'use client';

import { useRef } from 'react';
import { useGameStore } from '@/store/games/axiomata/useGameStore';
import { track } from '@/lib/analytics';

interface ShareCardProps {
  onShareComplete?: () => void;
}

export default function ShareCard({ onShareComplete }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const timeToSolveMs = useGameStore((state) => state.timeToSolveMs);
  const currentStreak = useGameStore((state) => state.currentStreak);
  const bestStreak = useGameStore((state) => state.bestStreak);

  const handleShare = async () => {
    if (!cardRef.current) return;

    try {
      track('share_clicked', {
        timeToSolveMs,
        currentStreak,
      });

      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 2,
      });

      if (navigator.share && navigator.canShare) {
        const blob = await fetch(dataUrl).then((res) => res.blob());
        const file = new File([blob], 'axiomata-result.png', { type: 'image/png' });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Axiomata Puzzle Result',
            text: `I solved today's Axiomata puzzle in ${formatTime(timeToSolveMs)}! Streak: ${currentStreak} 🔥`,
          });
          onShareComplete?.();
          return;
        }
      }

      const link = document.createElement('a');
      link.download = 'axiomata-result.png';
      link.href = dataUrl;
      link.click();
      onShareComplete?.();
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const formatTime = (ms: number | null) => {
    if (ms === null) return '0:00';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div
        ref={cardRef}
        className="bg-white p-8 rounded-2xl shadow-lg max-w-md mx-auto border-2 border-gray-100"
        style={{ position: 'absolute', left: '-9999px' }}
      >
        <h1 className="text-4xl font-light italic mb-6 text-gray-900" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Axiomata
        </h1>
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-primary-50 to-blue-50 border-2 border-primary-200 rounded-xl p-4">
            <div className="text-sm text-primary-700 font-semibold mb-1 uppercase tracking-wide">Time</div>
            <div className="text-2xl font-bold text-primary-900 font-mono">{formatTime(timeToSolveMs)}</div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-4">
            <div className="text-sm text-amber-700 font-semibold mb-1 uppercase tracking-wide">Current Streak</div>
            <div className="text-2xl font-bold text-amber-900 flex items-center gap-2">
              {currentStreak}
              {currentStreak > 0 && <span>🔥</span>}
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-4">
            <div className="text-sm text-purple-700 font-semibold mb-1 uppercase tracking-wide">Best Streak</div>
            <div className="text-2xl font-bold text-purple-900 flex items-center gap-2">
              {bestStreak}
              {bestStreak > 0 && <span>⭐</span>}
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={handleShare}
        className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
      >
        Share Result
      </button>
    </>
  );
}


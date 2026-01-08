'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/games/axiomata/useGameStore';

export default function TopBar() {
  const currentStreak = useGameStore((state) => state.currentStreak);
  const bestStreak = useGameStore((state) => state.bestStreak);
  const startTime = useGameStore((state) => state.startTime);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!startTime) {
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 100);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-md mx-auto flex items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3 flex-1">
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200 rounded-xl px-4 py-3 flex-1 shadow-sm">
          <div className="text-xs text-primary-700 font-medium mb-1">Streak</div>
          <div className="text-2xl font-bold text-primary-900 flex items-center gap-1">
            {currentStreak}
            {currentStreak > 0 && <span className="text-lg">🔥</span>}
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-xl px-4 py-3 flex-1 shadow-sm">
          <div className="text-xs text-amber-700 font-medium mb-1">Best</div>
          <div className="text-2xl font-bold text-amber-900 flex items-center gap-1">
            {bestStreak}
            {bestStreak > 0 && <span className="text-lg">⭐</span>}
          </div>
        </div>
      </div>
      {startTime && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl px-4 py-3 shadow-sm">
          <div className="text-xs text-gray-600 font-medium mb-1">Time</div>
          <div className="text-xl font-mono font-bold text-gray-900">
            {formatTime(elapsedTime)}
          </div>
        </div>
      )}
    </div>
  );
}


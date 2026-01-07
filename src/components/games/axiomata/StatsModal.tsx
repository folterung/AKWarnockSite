'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/games/axiomata/useGameStore';
import { track } from '@/lib/analytics';
import { getDailyKey } from '@/lib/games/axiomata/seed';
import ShareCard from './ShareCard';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StatsModal({ isOpen, onClose }: StatsModalProps) {
  const modalContentRef = useRef<HTMLDivElement>(null);
  const timeToSolveMs = useGameStore((state) => state.timeToSolveMs);
  const currentStreak = useGameStore((state) => state.currentStreak);
  const bestStreak = useGameStore((state) => state.bestStreak);

  useEffect(() => {
    if (isOpen) {
      track('puzzle_completed', {
        timeToSolveMs,
        currentStreak,
        bestStreak,
      });

      const dailyKey = getDailyKey();
      const completionTimestamp = Date.now();
      localStorage.setItem(`axiomata-completed-${dailyKey}`, completionTimestamp.toString());
    }
  }, [isOpen, timeToSolveMs, currentStreak, bestStreak]);

  if (!isOpen) return null;

  const formatTime = (ms: number | null) => {
    if (ms === null) return '0:00';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border-2 border-gray-100">
        <div ref={modalContentRef}>
          <h2 className="text-3xl font-light italic text-center mb-6 text-gray-900" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Puzzle Complete! 🎉
          </h2>
          
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-primary-50 to-blue-50 border-2 border-primary-200 rounded-xl p-4 shadow-sm">
              <div className="text-sm text-primary-700 font-semibold mb-1 uppercase tracking-wide">Time</div>
              <div className="text-3xl font-bold text-primary-900 font-mono">{formatTime(timeToSolveMs)}</div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-4 shadow-sm">
              <div className="text-sm text-amber-700 font-semibold mb-1 uppercase tracking-wide">Current Streak</div>
              <div className="text-3xl font-bold text-amber-900 flex items-center gap-2">
                {currentStreak}
                {currentStreak > 0 && <span className="text-2xl">🔥</span>}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-4 shadow-sm">
              <div className="text-sm text-purple-700 font-semibold mb-1 uppercase tracking-wide">Best Streak</div>
              <div className="text-3xl font-bold text-purple-900 flex items-center gap-2">
                {bestStreak}
                {bestStreak > 0 && <span className="text-2xl">⭐</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <div className="w-full">
            <ShareCard onShareComplete={onClose} captureRef={modalContentRef} />
          </div>
        </div>
      </div>
    </div>
  );
}


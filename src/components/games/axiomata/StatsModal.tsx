'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/games/axiomata/useGameStore';
import { track } from '@/lib/analytics';
import { getDailyKey } from '@/lib/games/axiomata/seed';
import { getQuoteOfTheDay } from '@/lib/games/axiomata/quotes';
import ShareCard from './ShareCard';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StatsModal({ isOpen, onClose }: StatsModalProps) {
  const modalContentRef = useRef<HTMLDivElement>(null);
  const timeToSolveMs = useGameStore((state) => state.timeToSolveMs);

  useEffect(() => {
    if (isOpen) {
      track('puzzle_completed', {
        timeToSolveMs,
      });

      const dailyKey = getDailyKey();
      const completionTimestamp = Date.now();
      localStorage.setItem(`axiomata-completed-${dailyKey}`, completionTimestamp.toString());
    }
  }, [isOpen, timeToSolveMs]);

  if (!isOpen) return null;

  const dailyKey = getDailyKey();
  const quote = getQuoteOfTheDay(dailyKey);

  function formatTime(ms: number | null): string {
    if (ms === null) return '0:00';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border-2 border-gray-100 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div ref={modalContentRef} style={{ padding: '10px' }}>
          <h2 className="text-3xl font-light italic text-center mb-6 text-gray-900" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Puzzle Complete! 🎉
          </h2>
          
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-primary-50 to-blue-50 border-2 border-primary-200 rounded-xl p-4 shadow-sm">
              <div className="text-sm text-primary-700 font-semibold mb-1 uppercase tracking-wide text-center">Time</div>
              <div className="text-3xl font-bold text-primary-900 font-mono text-center">{formatTime(timeToSolveMs)}</div>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-green-50 border-2 border-teal-200 rounded-xl p-4 shadow-sm">
              <div className="text-base italic text-teal-900 mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                "{quote.text}"
              </div>
              <div className="text-sm text-teal-700 font-medium text-right">
                — {quote.author}
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


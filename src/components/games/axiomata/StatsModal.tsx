'use client';

import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/store/games/axiomata/useGameStore';
import { track } from '@/lib/analytics';
import { getDailyKey } from '@/lib/games/axiomata/seed';
import { getQuoteOfTheDay } from '@/lib/games/axiomata/quotes';
import { getCompletedDifficulties } from '@/store/games/axiomata/useGameStore';
import type { Difficulty } from '@/lib/games/axiomata/types';
import { TEST_SPARKLES_ANIMATION } from '@/lib/games/axiomata/testConfig';
import ShareCard from './ShareCard';
import SparklesAnimation from './SparklesAnimation';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTryAnotherDifficulty?: () => void;
}

export default function StatsModal({ isOpen, onClose, onTryAnotherDifficulty }: StatsModalProps) {
  const modalContentRef = useRef<HTMLDivElement>(null);
  const timeToSolveMs = useGameStore((state) => state.timeToSolveMs);
  const clearDifficulty = useGameStore((state) => state.clearDifficulty);
  const selectedDifficulty = useGameStore((state) => state.selectedDifficulty);
  const dailyKey = getDailyKey();
  const completedDifficulties = getCompletedDifficulties(dailyKey);
  const allDifficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];
  const hasMoreDifficulties = completedDifficulties.length < 4;
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    if (isOpen) {
      track('puzzle_completed', {
        timeToSolveMs,
      });
      
      // Check if all 4 difficulties are completed, or if test mode is enabled
      if (TEST_SPARKLES_ANIMATION || completedDifficulties.length === 4) {
        // Force show immediately
        setShowSparkles(true);
        // Hide sparkles after animation completes
        const timer = setTimeout(() => {
          setShowSparkles(false);
        }, 6000);
        return () => clearTimeout(timer);
      } else {
        setShowSparkles(false);
      }
    } else {
      setShowSparkles(false);
    }
  }, [isOpen, timeToSolveMs, completedDifficulties.length]);

  if (!isOpen) return null;

  const quote = getQuoteOfTheDay(dailyKey, selectedDifficulty || undefined);

  function formatTime(ms: number | null): string {
    if (ms === null) return '0:00';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      {showSparkles && <SparklesAnimation />}
      <div className="min-h-full flex items-center justify-center p-4 pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-4 overflow-y-auto">
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 border-2 border-gray-100 relative max-h-[calc(100vh-8rem)] sm:max-h-[calc(100vh-9rem)] md:max-h-[calc(100vh-10rem)] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              onClose();
              clearDifficulty();
              if (onTryAnotherDifficulty) {
                onTryAnotherDifficulty();
              }
            }}
            className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition-colors duration-200 bg-white rounded-full p-1 shadow-sm"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="overflow-y-auto flex-1 p-6 sm:p-7 md:p-8">
            <div ref={modalContentRef} style={{ padding: '10px' }}>
              {completedDifficulties.length === 4 ? (
                <>
                  <h2 className="text-3xl font-light italic text-center mb-2 text-gray-900" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    All Daily Puzzles Complete!
                  </h2>
                  <p className="text-base text-gray-600 text-center mb-6 italic">
                    Come back tomorrow for more
                  </p>
                </>
              ) : (
                <h2 className="text-3xl font-light italic text-center mb-6 text-gray-900" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Puzzle Complete! 🎉
                </h2>
              )}
              
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-primary-50 to-blue-50 border-2 border-primary-200 rounded-xl p-4 shadow-sm">
                  <div className="text-sm text-primary-700 font-semibold mb-1 uppercase tracking-wide text-center">Time</div>
                  <div className="text-3xl font-bold text-primary-900 font-mono text-center">{formatTime(timeToSolveMs)}</div>
                </div>
                <div className="bg-gradient-to-br from-teal-50 to-green-50 border-2 border-teal-200 rounded-xl p-4 shadow-sm">
                  <div className="text-base italic text-teal-900 mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    &ldquo;{quote.text}&rdquo;
                  </div>
                  <div className="text-sm text-teal-700 font-medium text-right">
                    — {quote.author}
                  </div>
                </div>
              </div>
            </div>

            {hasMoreDifficulties && onTryAnotherDifficulty && (
              <div className="mt-6">
                <button
                  onClick={() => {
                    onClose();
                    clearDifficulty();
                    if (onTryAnotherDifficulty) {
                      onTryAnotherDifficulty();
                    }
                  }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Try Another Difficulty
                </button>
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <div className="w-full">
                <ShareCard onShareComplete={onClose} captureRef={modalContentRef} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


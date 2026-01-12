'use client';

import { useEffect } from 'react';
import type { Difficulty } from '@/lib/games/axiomata/types';
import { getDifficultyConfig } from '@/lib/games/axiomata/difficulty';
import { useGameStore } from '@/store/games/axiomata/useGameStore';
import { getDailyKey } from '@/lib/games/axiomata/seed';
import { isDifficultyCompleted, getCompletedDifficulties, getDifficultyCompletionTime } from '@/store/games/axiomata/useGameStore';

interface DifficultySelectorProps {
  onSelect: (difficulty: Difficulty) => void;
  onViewCompleted?: (difficulty: Difficulty) => void;
}

export default function DifficultySelector({ onSelect, onViewCompleted }: DifficultySelectorProps) {
  const dailyKey = getDailyKey();
  const completedDifficulties = getCompletedDifficulties(dailyKey);

  function formatTime(ms: number | null): string {
    if (ms === null) return 'N/A';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  function getPieceEmojis(pieces: string[]): string {
    const emojiMap: Record<string, string> = {
      'SUN': '☀️',
      'MOON': '🌙',
      'STAR': '⭐',
      'PLANET': '🪐',
      'COMET': '☄️',
    };
    return pieces.map(p => emojiMap[p] || '').join(' ');
  }

  function getDifficultyInfo(difficulty: Difficulty) {
    const config = getDifficultyConfig(difficulty);
    return {
      name: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
      gridSize: config.gridSize,
      pieces: getPieceEmojis(config.availablePieces.filter(p => p !== 'EMPTY')),
      constraintCount: Object.values(config.constraintCounts).reduce((a, b) => a + b, 0),
      fillPercentage: Math.round(config.minFillPercentage * 100),
    };
  }

  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];
  const difficultyInfo = difficulties.map(d => ({ difficulty: d, ...getDifficultyInfo(d) }));

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
      <div className="min-h-full flex items-center justify-center p-4 pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 border-2 border-gray-100 max-h-[calc(100vh-8rem)] sm:max-h-[calc(100vh-9rem)] md:max-h-[calc(100vh-10rem)] flex flex-col overflow-hidden">
          <div className="overflow-y-auto flex-1 p-4 sm:p-6 md:p-8">
        <h2 
          className="text-4xl md:text-5xl font-semibold italic text-center mb-6 sm:mb-7 md:mb-8 text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-primary-600 to-gray-900 drop-shadow-sm" 
          style={{ fontFamily: "'Cormorant Garamond', serif", textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
        >
          Choose Difficulty
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5 mb-6">
          {difficultyInfo.map(({ difficulty, name, gridSize, pieces, constraintCount, fillPercentage }) => {
            const isCompleted = isDifficultyCompleted(dailyKey, difficulty);
            const completionTime = isCompleted ? getDifficultyCompletionTime(dailyKey, difficulty) : null;
            
            function handleClick() {
              if (isCompleted && onViewCompleted) {
                onViewCompleted(difficulty);
              } else {
                onSelect(difficulty);
              }
            }
            
            return (
              <button
                key={difficulty}
                onClick={handleClick}
                className={`px-4 py-3 sm:px-5 sm:py-4 md:px-6 md:py-5 rounded-xl border-2 transition-all duration-200 text-left group relative ${
                  isCompleted
                    ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-300 hover:border-green-400 hover:shadow-lg cursor-pointer'
                    : 'bg-gradient-to-br from-gray-50 to-white border-gray-300 hover:border-primary-400 hover:shadow-lg'
                }`}
              >
                {isCompleted && (
                  <div className="absolute bottom-2 right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold shadow-md">
                    ✓
                  </div>
                )}
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-2xl font-bold transition-colors ${
                    isCompleted 
                      ? 'text-green-700 group-hover:text-green-800' 
                      : 'text-gray-900 group-hover:text-primary-600'
                  }`}>
                    {name}
                  </h3>
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    isCompleted
                      ? 'text-green-700 bg-green-200'
                      : 'text-gray-600 bg-gray-100'
                  }`}>
                    {gridSize}×{gridSize}
                  </span>
                </div>
                <div className="mb-2 min-h-[28px] flex items-center gap-2 flex-wrap">
                  {isCompleted && (
                    <>
                      <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded">
                        Completed
                      </span>
                      {completionTime !== null && completionTime !== undefined && (
                        <span className="text-xs font-mono font-semibold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">
                          {formatTime(completionTime)}
                        </span>
                      )}
                    </>
                  )}
                </div>
                <div className={`space-y-1 text-sm ${
                  isCompleted ? 'text-green-700' : 'text-gray-600'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Pieces:</span>
                    <span className="text-lg">{pieces}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Rules:</span>
                    <span>{constraintCount}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Fill:</span>
                    <span>{fillPercentage}%</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        
            <p className="text-sm text-gray-500 text-center italic">
              You can try each difficulty once per day. Your progress is saved for each difficulty level.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

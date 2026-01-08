'use client';

import type { Difficulty } from '@/lib/games/axiomata/types';
import { getDifficultyConfig } from '@/lib/games/axiomata/difficulty';
import { useGameStore } from '@/store/games/axiomata/useGameStore';

interface DifficultySelectorProps {
  onSelect: (difficulty: Difficulty) => void;
}

export default function DifficultySelector({ onSelect }: DifficultySelectorProps) {
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
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 border-2 border-gray-100">
        <h2 
          className="text-4xl md:text-5xl font-semibold italic text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-primary-600 to-gray-900 drop-shadow-sm" 
          style={{ fontFamily: "'Cormorant Garamond', serif", textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
        >
          Choose Difficulty
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {difficultyInfo.map(({ difficulty, name, gridSize, pieces, constraintCount, fillPercentage }) => (
            <button
              key={difficulty}
              onClick={() => onSelect(difficulty)}
              className="px-6 py-5 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-300 rounded-xl hover:border-primary-400 hover:shadow-lg transition-all duration-200 text-left group"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {name}
                </h3>
                <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  {gridSize}×{gridSize}
                </span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
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
          ))}
        </div>
        
        <p className="text-sm text-gray-500 text-center italic">
          You must choose a difficulty each day. Your selection will persist for today's puzzle.
        </p>
      </div>
    </div>
  );
}

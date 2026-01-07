'use client';

import { useMemo } from 'react';
import ConstraintChip from './ConstraintChip';
import { useGameStore } from '@/store/games/axiomata/useGameStore';
import { validateAll } from '@/lib/games/axiomata/validator';
import { Squares2X2Icon, HashtagIcon, LinkIcon } from '@heroicons/react/24/outline';

export default function ConstraintsPanel() {
  const grid = useGameStore((state) => state.grid);
  const puzzle = useGameStore((state) => state.puzzle);

  const validation = useMemo(() => {
    if (!puzzle) {
      return { isValid: false, constraintStatus: new Map() };
    }
    return validateAll(puzzle.constraints, grid);
  }, [puzzle, grid]);

  if (!puzzle) {
    return null;
  }

  const adjacencyConstraints = puzzle.constraints.filter((c) => c.type === 'adjacency');
  const countConstraints = puzzle.constraints.filter((c) => c.type === 'count');
  const pairConstraints = puzzle.constraints.filter((c) => c.type === 'pair');
  const regionConstraints = puzzle.constraints.filter((c) => c.type === 'region');

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative mb-6">
        <h3 
          className="text-3xl md:text-4xl font-semibold italic text-center text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-primary-600 to-gray-900 drop-shadow-sm" 
          style={{ fontFamily: "'Cormorant Garamond', serif", textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
        >
          Must Satisfy All Rules
        </h3>
        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-400 to-transparent opacity-80"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      
      {adjacencyConstraints.length > 0 && (() => {
        const sunAdjacency = adjacencyConstraints.find(c => c.tileType === 'SUN');
        const moonAdjacency = adjacencyConstraints.find(c => c.tileType === 'MOON');
        const allAdjacencyValid = adjacencyConstraints.every(c => validation.constraintStatus.get(c) ?? false);
        
        const getAdjacencyText = () => {
          if (sunAdjacency && moonAdjacency) {
            return '☀️ and 🌙 tiles cannot be adjacent to tiles of the same type (up/down/left/right)';
          } else if (sunAdjacency) {
            return '☀️ tiles cannot be adjacent to other ☀️ tiles (up/down/left/right)';
          } else {
            return '🌙 tiles cannot be adjacent to other 🌙 tiles (up/down/left/right)';
          }
        };
        
        return (
          <div className="bg-gradient-to-br from-blue-50 to-primary-50 border-2 border-primary-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="bg-primary-100 p-2.5 rounded-lg shadow-sm">
                <Squares2X2Icon className="w-6 h-6 text-primary-700" />
              </div>
              <h4 className="text-lg md:text-xl font-semibold italic text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-primary-600 to-gray-900 drop-shadow-sm" style={{ fontFamily: "'Cormorant Garamond', serif", textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>Adjacency Rules</h4>
            </div>
            <div className="space-y-2.5">
              <div
                className={`
                  flex items-start gap-4 px-5 py-4 rounded-xl border-2 transition-all duration-300
                  ${allAdjacencyValid 
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 shadow-sm' 
                    : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-300 shadow-sm'
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={allAdjacencyValid}
                  readOnly
                  className="w-5 h-5 rounded border-2 flex-shrink-0 cursor-default accent-green-600 mt-0.5"
                  style={{ cursor: 'default' }}
                />
                <span className="text-sm md:text-base leading-relaxed flex-1 font-bold text-gray-900 font-sans text-center block" style={{ lineHeight: '1.7', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                  {getAdjacencyText()}
                </span>
              </div>
            </div>
          </div>
        );
      })()}

      {countConstraints.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-amber-100 p-2 rounded-lg">
              <HashtagIcon className="w-6 h-6 text-amber-700" />
            </div>
            <h4 className="text-lg md:text-xl font-semibold italic text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-primary-600 to-gray-900 drop-shadow-sm" style={{ fontFamily: "'Cormorant Garamond', serif", textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>Count Rules</h4>
          </div>
          <div className="space-y-2.5">
            {countConstraints.map((constraint, index) => (
              <ConstraintChip
                key={`count-${index}`}
                constraint={constraint}
                isValid={validation.constraintStatus.get(constraint) ?? false}
              />
            ))}
          </div>
        </div>
      )}

      {pairConstraints.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 md:col-span-2 md:max-w-md md:mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-purple-100 p-2 rounded-lg">
              <LinkIcon className="w-6 h-6 text-purple-700" />
            </div>
            <h4 className="text-lg md:text-xl font-semibold italic text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-primary-600 to-gray-900 drop-shadow-sm" style={{ fontFamily: "'Cormorant Garamond', serif", textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>Pair Rules</h4>
          </div>
          <div className="space-y-2.5">
            {pairConstraints.map((constraint, index) => (
              <ConstraintChip
                key={`pair-${index}`}
                constraint={constraint}
                isValid={validation.constraintStatus.get(constraint) ?? false}
                pairIndex={index}
              />
            ))}
          </div>
        </div>
      )}

      {regionConstraints.length > 0 && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Squares2X2Icon className="w-6 h-6 text-emerald-700" />
            </div>
            <h4 className="text-lg md:text-xl font-semibold italic text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-primary-600 to-gray-900 drop-shadow-sm" style={{ fontFamily: "'Cormorant Garamond', serif", textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>Region Rules</h4>
          </div>
          <div className="space-y-2.5">
            {regionConstraints.map((constraint, index) => (
              <ConstraintChip
                key={`region-${index}`}
                constraint={constraint}
                isValid={validation.constraintStatus.get(constraint) ?? false}
              />
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}


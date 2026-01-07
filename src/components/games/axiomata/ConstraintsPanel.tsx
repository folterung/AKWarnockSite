'use client';

import { useMemo } from 'react';
import ConstraintChip from './ConstraintChip';
import { useGameStore } from '@/store/games/axiomata/useGameStore';
import { validateAll } from '@/lib/games/axiomata/validator';

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

  function getAdjacencyText() {
    const sunAdjacency = adjacencyConstraints.find(c => c.tileType === 'SUN');
    const moonAdjacency = adjacencyConstraints.find(c => c.tileType === 'MOON');
    if (sunAdjacency && moonAdjacency) {
      return '☀️ and 🌙 tiles cannot be adjacent to tiles of the same type (up/down/left/right)';
    } else if (sunAdjacency) {
      return '☀️ tiles cannot be adjacent to other ☀️ tiles (up/down/left/right)';
    } else {
      return '🌙 tiles cannot be adjacent to other 🌙 tiles (up/down/left/right)';
    }
  }

  function renderAdjacencyRule() {
    if (adjacencyConstraints.length === 0) {
      return null;
    }
    const allAdjacencyValid = adjacencyConstraints.every(c => validation.constraintStatus.get(c) ?? false);
    return (
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
        <span className="text-sm md:text-base leading-relaxed flex-1 font-bold text-gray-900 font-sans text-left block" style={{ lineHeight: '1.7', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
          {getAdjacencyText()}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative mb-6">
        <h3 
          className="text-2xl md:text-3xl lg:text-xl font-semibold italic text-center text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-primary-600 to-gray-900 drop-shadow-sm" 
          style={{ fontFamily: "'Cormorant Garamond', serif", textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
        >
          Must Satisfy All Rules
        </h3>
        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-400 to-transparent opacity-80"></div>
      </div>
      
      <div className="space-y-2.5 max-h-[calc(100vh-400px)] lg:max-h-[600px] overflow-y-auto pr-2">
        {renderAdjacencyRule()}
        
        {countConstraints.map((constraint, index) => (
          <ConstraintChip
            key={`count-${index}`}
            constraint={constraint}
            isValid={validation.constraintStatus.get(constraint) ?? false}
          />
        ))}
        
        {pairConstraints.map((constraint, index) => (
          <ConstraintChip
            key={`pair-${index}`}
            constraint={constraint}
            isValid={validation.constraintStatus.get(constraint) ?? false}
            pairIndex={index}
          />
        ))}
        
        {regionConstraints.map((constraint, index) => (
          <ConstraintChip
            key={`region-${index}`}
            constraint={constraint}
            isValid={validation.constraintStatus.get(constraint) ?? false}
          />
        ))}
      </div>
    </div>
  );
}


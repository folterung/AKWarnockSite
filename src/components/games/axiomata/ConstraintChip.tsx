'use client';

import type { Constraint } from '@/lib/games/axiomata/types';

interface ConstraintChipProps {
  constraint: Constraint;
  isValid: boolean;
  pairIndex?: number;
  gridSize?: number;
}

export default function ConstraintChip({ constraint, isValid, pairIndex, gridSize = 5 }: ConstraintChipProps) {
  function getPieceEmoji(tileType: string): string {
    if (tileType === 'SUN') return '☀️';
    if (tileType === 'MOON') return '🌙';
    if (tileType === 'STAR') return '⭐';
    if (tileType === 'PLANET') return '🪐';
    if (tileType === 'COMET') return '☄️';
    return '';
  }

  function getCountsMap(counts: any): Map<string, number> {
    if (counts instanceof Map) {
      return counts;
    } else if (Array.isArray(counts)) {
      return new Map(counts);
    } else if (typeof counts === 'object' && counts !== null) {
      return new Map(Object.entries(counts).map(([k, v]) => [k, v as number]));
    }
    return new Map();
  }

  function getLabel() {
    switch (constraint.type) {
      case 'adjacency': {
        const tile = getPieceEmoji(constraint.tileType);
        return `${tile} cannot be next to ${tile} (up/down/left/right)`;
      }
      case 'count': {
        const dir = constraint.direction === 'row' ? 'Row' : 'Column';
        const parts: string[] = [];
        const counts = getCountsMap(constraint.counts);
        for (const [tileType, count] of counts.entries()) {
          if (count > 0 && tileType !== 'EMPTY') {
            parts.push(`${count} ${getPieceEmoji(tileType)}`);
          }
        }
        const totalCounted = Array.from(counts.values()).reduce((a, b) => a + b, 0);
        const rest = gridSize - totalCounted;
        if (rest > 0) parts.push(`${rest} empty`);
        return `${dir} ${constraint.index + 1} must have: ${parts.join(', ')}`;
      }
      case 'pair': {
        const r1 = constraint.cell1.row + 1;
        const c1 = constraint.cell1.col + 1;
        const r2 = constraint.cell2.row + 1;
        const c2 = constraint.cell2.col + 1;
        const pairNum = pairIndex !== undefined ? pairIndex + 1 : '?';
        return constraint.mustBeSame
          ? `[${pairNum}] Cells (${r1},${c1}) and (${r2},${c2}) must be the same`
          : `[${pairNum}] Cells (${r1},${c1}) and (${r2},${c2}) must be different`;
      }
      case 'region': {
        const parts: string[] = [];
        const counts = getCountsMap(constraint.counts);
        for (const [tileType, count] of counts.entries()) {
          if (count > 0 && tileType !== 'EMPTY') {
            parts.push(`${count} ${getPieceEmoji(tileType)}`);
          }
        }
        return `Region must have: ${parts.join(', ')}`;
      }
      case 'diagonalAdjacency': {
        const tile = getPieceEmoji(constraint.tileType);
        return `${tile} cannot be diagonally adjacent to ${tile}`;
      }
      case 'pattern': {
        if (constraint.direction === 'diagonal') {
          return `No more than ${constraint.maxInARow} of the same piece in a row (diagonal)`;
        }
        const dir = constraint.direction === 'row' ? 'Row' : 'Column';
        const index = constraint.index !== undefined ? constraint.index + 1 : '?';
        return `${dir} ${index}: No more than ${constraint.maxInARow} of the same piece in a row`;
      }
      case 'balance': {
        const dir = constraint.direction === 'row' ? 'Row' : 'Column';
        const pieces = constraint.tileTypes.map(t => getPieceEmoji(t)).filter(Boolean).join(' and ');
        return `${dir} ${constraint.index + 1}: ${pieces} must be equal`;
      }
      default:
        return '';
    }
  }

  const isPairRule = constraint.type === 'pair';

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-300
        ${isValid 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-sm' 
          : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300 shadow-sm'
        }
      `}
    >
      {isPairRule && pairIndex !== undefined ? (
        <span className="text-xs bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold shadow-md border-2 border-purple-800 flex-shrink-0">
          {pairIndex + 1}
        </span>
      ) : (
        <input
          type="checkbox"
          checked={isValid}
          readOnly
          className="w-5 h-5 rounded border-2 flex-shrink-0 cursor-default accent-green-600"
          style={{ cursor: 'default' }}
        />
      )}
      <span className="text-xs md:text-sm leading-normal flex-1 font-bold text-gray-900 font-sans text-left" style={{ lineHeight: '1.6', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>{getLabel()}</span>
    </div>
  );
}


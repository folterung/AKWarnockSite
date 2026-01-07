'use client';

import type { Constraint } from '@/lib/games/axiomata/types';

interface ConstraintChipProps {
  constraint: Constraint;
  isValid: boolean;
  pairIndex?: number;
}

export default function ConstraintChip({ constraint, isValid, pairIndex }: ConstraintChipProps) {

  const getLabel = () => {
    switch (constraint.type) {
      case 'adjacency': {
        const tile = constraint.tileType === 'SUN' ? '☀️' : '🌙';
        return `${tile} cannot be next to ${tile} (up/down/left/right)`;
      }
      case 'count': {
        const dir = constraint.direction === 'row' ? 'Row' : 'Column';
        const parts = [];
        if (constraint.sunCount > 0) parts.push(`${constraint.sunCount} ☀️`);
        if (constraint.moonCount > 0) parts.push(`${constraint.moonCount} 🌙`);
        const rest = 5 - constraint.sunCount - constraint.moonCount;
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
        const parts = [];
        if (constraint.sunCount > 0) parts.push(`${constraint.sunCount} ☀️`);
        if (constraint.moonCount > 0) parts.push(`${constraint.moonCount} 🌙`);
        return `Region must have: ${parts.join(', ')}`;
      }
      default:
        return '';
    }
  };

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
      <span className="text-sm md:text-base leading-normal flex-1 font-bold text-gray-900 font-sans text-center" style={{ lineHeight: '1.6', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>{getLabel()}</span>
    </div>
  );
}


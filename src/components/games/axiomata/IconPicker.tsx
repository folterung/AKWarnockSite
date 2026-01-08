'use client';

import type { TileState } from '@/lib/games/axiomata/types';

interface IconPickerProps {
  availablePieces: TileState[];
  onSelect: (tileState: TileState | null) => void;
  onClose: () => void;
}

export default function IconPicker({ availablePieces, onSelect, onClose }: IconPickerProps) {
  function getIconContent(state: TileState): string {
    if (state === 'SUN') return '☀️';
    if (state === 'MOON') return '🌙';
    if (state === 'STAR') return '⭐';
    if (state === 'PLANET') return '🪐';
    if (state === 'COMET') return '☄️';
    if (state === 'EMPTY') return '';
    return '';
  }

  function getIconStyles(state: TileState): string {
    if (state === 'SUN') {
      return 'bg-gradient-to-br from-yellow-50 via-yellow-100 to-amber-100 border-yellow-300 hover:border-yellow-400';
    }
    if (state === 'MOON') {
      return 'bg-gradient-to-br from-blue-50 via-blue-100 to-primary-100 border-blue-300 hover:border-blue-400';
    }
    if (state === 'STAR') {
      return 'bg-gradient-to-br from-purple-50 via-purple-100 to-violet-100 border-purple-300 hover:border-purple-400';
    }
    if (state === 'PLANET') {
      return 'bg-gradient-to-br from-green-50 via-green-100 to-emerald-100 border-green-300 hover:border-green-400';
    }
    if (state === 'COMET') {
      return 'bg-gradient-to-br from-orange-50 via-orange-100 to-amber-100 border-orange-300 hover:border-orange-400';
    }
    if (state === 'EMPTY') {
      return 'bg-gradient-to-br from-gray-50 to-white border-gray-300 hover:border-gray-400';
    }
    return 'bg-gray-50 border-gray-300';
  }

  const allOptions: (TileState | null)[] = [...availablePieces, 'EMPTY'];
  const radius = 80;
  const iconSize = 48;

  function handleIconClick(tileState: TileState | null, event: React.MouseEvent) {
    event.stopPropagation();
    onSelect(tileState);
    onClose();
  }

  const containerSize = radius * 2 + iconSize;
  const backdropSize = containerSize + 40;

  return (
    <>
      <div
        className="absolute z-40 rounded-full"
        style={{
          left: '50%',
          top: '50%',
          width: backdropSize,
          height: backdropSize,
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(107, 114, 128, 0.7)',
        }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="absolute z-50 pointer-events-none"
        style={{ 
          left: '50%',
          top: '50%',
          width: containerSize,
          height: containerSize,
          transform: 'translate(-50%, -50%)',
        }}
      >
        {allOptions.map((tileState, index) => {
          const angle = (index * 2 * Math.PI) / allOptions.length - Math.PI / 2;
          const x = Math.cos(angle) * radius + containerSize / 2;
          const y = Math.sin(angle) * radius + containerSize / 2;

          const isEmpty = tileState === 'EMPTY';
          const content = tileState ? getIconContent(tileState) : '';
          const styles = tileState ? getIconStyles(tileState) : '';

          return (
            <button
              key={tileState || 'null'}
              type="button"
              onClick={(e) => handleIconClick(tileState, e)}
              className={`
                absolute w-12 h-12 rounded-xl border-2
                flex items-center justify-center
                text-2xl md:text-3xl
                transition-all duration-200 ease-out
                shadow-lg hover:shadow-xl
                active:scale-90
                pointer-events-auto
                ${styles}
              `}
              style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: 'translate(-50%, -50%)',
                animationDelay: `${index * 50}ms`,
              }}
              title={isEmpty ? 'Empty' : tileState}
            >
              {content && (
                <span className="drop-shadow-sm">
                  {content}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}
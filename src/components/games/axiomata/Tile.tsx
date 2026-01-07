'use client';

import type { TileState } from '@/lib/games/axiomata/types';

interface TileProps {
  state: TileState | null;
  isLocked: boolean;
  onClick: () => void;
}

export default function Tile({ state, isLocked, onClick }: TileProps) {
  const getContent = () => {
    if (state === 'SUN') return '☀️';
    if (state === 'MOON') return '🌙';
    return '';
  };

  const getTileStyles = () => {
    if (isLocked) {
      return 'border-gray-400 bg-gradient-to-br from-gray-100 to-gray-200 cursor-not-allowed opacity-90 shadow-inner';
    }
    
    if (state === 'SUN') {
      return 'border-yellow-300 bg-gradient-to-br from-yellow-50 via-yellow-100 to-amber-100 hover:border-yellow-400 hover:shadow-lg cursor-pointer shadow-md';
    }
    
    if (state === 'MOON') {
      return 'border-blue-300 bg-gradient-to-br from-blue-50 via-blue-100 to-primary-100 hover:border-blue-400 hover:shadow-lg cursor-pointer shadow-md';
    }
    
    return 'border-gray-300 bg-gradient-to-br from-gray-50 to-white hover:border-gray-400 hover:bg-gray-100 hover:shadow-md cursor-pointer';
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLocked}
      className={`
        relative w-full aspect-square
        border-2 rounded-xl
        flex items-center justify-center
        text-3xl md:text-4xl
        transition-all duration-300 ease-out
        active:scale-95
        ${getTileStyles()}
      `}
    >
      {isLocked && (
        <span 
          className="absolute top-1.5 right-1.5 text-xs bg-gray-300 text-gray-700 rounded-full w-5 h-5 flex items-center justify-center shadow-sm border border-gray-400"
          title="Clue - cannot be changed"
        >
          🔒
        </span>
      )}
      <span className="drop-shadow-sm">{getContent()}</span>
    </button>
  );
}


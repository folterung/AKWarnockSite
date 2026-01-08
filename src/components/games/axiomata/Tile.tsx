'use client';

import type { TileState } from '@/lib/games/axiomata/types';
import IconPicker from './IconPicker';

interface TileProps {
  state: TileState | null;
  isLocked: boolean;
  onClick: () => void;
  isPickerOpen?: boolean;
  availablePieces?: TileState[];
  onIconSelect?: (tileState: TileState | null) => void;
  onClosePicker?: () => void;
}

export default function Tile({ 
  state, 
  isLocked, 
  onClick, 
  isPickerOpen = false,
  availablePieces = [],
  onIconSelect,
  onClosePicker
}: TileProps) {
  function getContent() {
    if (state === 'SUN') return '☀️';
    if (state === 'MOON') return '🌙';
    if (state === 'STAR') return '⭐';
    if (state === 'PLANET') return '🪐';
    if (state === 'COMET') return '☄️';
    if (state === 'EMPTY') return '';
    return '';
  }

  function getTileStyles() {
    if (isLocked) {
      return 'border-gray-400 bg-gradient-to-br from-gray-100 to-gray-200 cursor-not-allowed opacity-90 shadow-inner';
    }
    
    if (state === 'SUN') {
      return 'border-yellow-300 bg-gradient-to-br from-yellow-50 via-yellow-100 to-amber-100 hover:border-yellow-400 hover:shadow-lg cursor-pointer shadow-md';
    }
    
    if (state === 'MOON') {
      return 'border-blue-300 bg-gradient-to-br from-blue-50 via-blue-100 to-primary-100 hover:border-blue-400 hover:shadow-lg cursor-pointer shadow-md';
    }
    
    if (state === 'STAR') {
      return 'border-purple-300 bg-gradient-to-br from-purple-50 via-purple-100 to-violet-100 hover:border-purple-400 hover:shadow-lg cursor-pointer shadow-md';
    }
    
    if (state === 'PLANET') {
      return 'border-green-300 bg-gradient-to-br from-green-50 via-green-100 to-emerald-100 hover:border-green-400 hover:shadow-lg cursor-pointer shadow-md';
    }
    
    if (state === 'COMET') {
      return 'border-orange-300 bg-gradient-to-br from-orange-50 via-orange-100 to-amber-100 hover:border-orange-400 hover:shadow-lg cursor-pointer shadow-md';
    }
    
    if (state === 'EMPTY') {
      return 'border-gray-300 bg-gradient-to-br from-gray-50 to-white hover:border-gray-400 hover:bg-gray-100 hover:shadow-md cursor-pointer opacity-75';
    }
    
    return 'border-gray-300 bg-gradient-to-br from-gray-50 to-white hover:border-gray-400 hover:bg-gray-100 hover:shadow-md cursor-pointer';
  }

  return (
    <div className="relative w-full aspect-square">
      <button
        type="button"
        onClick={onClick}
        disabled={isLocked}
        className={`
          relative w-full h-full
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
            className="absolute -top-1 -right-1 text-xs bg-gray-300 text-gray-700 rounded-full w-5 h-5 flex items-center justify-center shadow-sm border border-gray-400 z-10"
            title="Clue - cannot be changed"
          >
            🔒
          </span>
        )}
        {getContent() && (
          <span className="drop-shadow-sm relative z-0">
            {getContent()}
          </span>
        )}
      </button>
      {isPickerOpen && !isLocked && availablePieces.length > 0 && onIconSelect && onClosePicker && (
        <IconPicker
          availablePieces={availablePieces}
          onSelect={onIconSelect}
          onClose={onClosePicker}
        />
      )}
    </div>
  );
}


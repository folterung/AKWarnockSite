'use client';

import { useState, useEffect, useRef } from 'react';
import type { TileState } from '@/lib/games/axiomata/types';

interface IconPickerProps {
  availablePieces: TileState[];
  onSelect: (tileState: TileState | null) => void;
  onClose: () => void;
}

const HEADER_HEIGHT = 64; // h-16 = 4rem = 64px

export default function IconPicker({ availablePieces, onSelect, onClose }: IconPickerProps) {
  const [radius, setRadius] = useState(60);
  const [iconSize, setIconSize] = useState(40);
  const [verticalOffset, setVerticalOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function updateSizes() {
      const width = window.innerWidth;
      if (width >= 768) {
        // md and above
        setRadius(80);
        setIconSize(48);
      } else if (width >= 640) {
        // sm
        setRadius(70);
        setIconSize(44);
      } else {
        // xs (mobile)
        setRadius(60);
        setIconSize(40);
      }
    }

    function updatePosition() {
      if (!containerRef.current) return;
      
      // Get the tile container (parent of the picker)
      const tileContainer = containerRef.current.closest('.tile-picker-container') as HTMLElement;
      if (!tileContainer) return;
      
      const tileRect = tileContainer.getBoundingClientRect();
      const pickerTop = tileRect.top + tileRect.height / 2 - radius - iconSize / 2;
      const minTop = HEADER_HEIGHT + 20; // Header height + some padding
      
      if (pickerTop < minTop) {
        // Push the picker down so it's below the header
        const offset = minTop - pickerTop;
        setVerticalOffset(offset);
      } else {
        setVerticalOffset(0);
      }
    }

    updateSizes();
    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(updatePosition, 0);
    
    const handleResize = () => {
      updateSizes();
      updatePosition();
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', updatePosition, true);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [radius, iconSize]);

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
        className="absolute z-[70] rounded-full"
        style={{
          left: '50%',
          top: '50%',
          width: backdropSize,
          height: backdropSize,
          transform: `translate(-50%, calc(-50% + ${verticalOffset}px))`,
          backgroundColor: 'rgba(107, 114, 128, 0.7)',
        }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={containerRef}
        className="absolute z-[70] pointer-events-none"
        style={{ 
          left: '50%',
          top: '50%',
          width: containerSize,
          height: containerSize,
          transform: `translate(-50%, calc(-50% + ${verticalOffset}px))`,
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
                absolute w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl border-2
                flex items-center justify-center
                text-xl sm:text-2xl md:text-3xl
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
              title={isEmpty ? 'Empty' : (tileState ?? undefined)}
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
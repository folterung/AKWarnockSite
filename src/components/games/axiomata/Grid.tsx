'use client';

import { useState, useEffect, useMemo } from 'react';
import Tile from './Tile';
import { useGameStore } from '@/store/games/axiomata/useGameStore';
import { getDifficultyConfig } from '@/lib/games/axiomata/difficulty';
import { findAdjacencyViolations } from '@/lib/games/axiomata/validator';
import type { TileState, AdjacencyConstraint } from '@/lib/games/axiomata/types';

export default function Grid() {
  const grid = useGameStore((state) => state.grid);
  const puzzle = useGameStore((state) => state.puzzle);
  const selectedDifficulty = useGameStore((state) => state.selectedDifficulty);
  const setTile = useGameStore((state) => state.setTile);
  const startTimer = useGameStore((state) => state.startTimer);
  const showAdjacencyHints = useGameStore((state) => state.showAdjacencyHints);
  const undo = useGameStore((state) => state.undo);
  const redo = useGameStore((state) => state.redo);

  const [pickerPosition, setPickerPosition] = useState<{ row: number; col: number } | null>(null);

  function handleTileClick(row: number, col: number) {
    if (!puzzle || !selectedDifficulty) return;
    
    const key = `${row},${col}`;
    if (puzzle.givens.has(key)) {
      return;
    }

    startTimer();

    if (pickerPosition) {
      setPickerPosition(null);
    } else {
      setPickerPosition({ row, col });
    }
  }

  function handleIconSelect(row: number, col: number, tileState: TileState | null) {
    setTile(row, col, tileState);
    setPickerPosition(null);
  }

  function handleClosePicker() {
    setPickerPosition(null);
  }

  function handleGridClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget && pickerPosition) {
      setPickerPosition(null);
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const gameBoard = target.closest('.game-board-container');
      const tilePicker = target.closest('.tile-picker-container');
      
      if (!gameBoard && !tilePicker) {
        setPickerPosition(null);
      }
    };

    if (pickerPosition) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [pickerPosition]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!puzzle || !selectedDifficulty) {
        return;
      }

      const target = event.target as HTMLElement;
      const isInputElement = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      
      if (isInputElement) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifierKey = isMac ? event.metaKey : event.ctrlKey;
      const keyLower = event.key.toLowerCase();
      
      if (modifierKey && keyLower === 'z' && !event.shiftKey) {
        event.preventDefault();
        event.stopPropagation();
        undo();
      } else if (modifierKey && event.shiftKey && keyLower === 'z') {
        event.preventDefault();
        event.stopPropagation();
        redo();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [puzzle, selectedDifficulty, undo, redo]);

  const gridSize = puzzle?.gridSize ?? 5;
  const config = selectedDifficulty ? getDifficultyConfig(selectedDifficulty) : null;
  const availablePieces = config?.availablePieces || [];

  const adjacencyViolations = useMemo(() => {
    if (!showAdjacencyHints || !puzzle) {
      return new Set<string>();
    }
    const adjacencyConstraints = puzzle.constraints.filter(
      (c): c is AdjacencyConstraint => c.type === 'adjacency'
    );
    if (adjacencyConstraints.length === 0) {
      return new Set<string>();
    }
    const violations = findAdjacencyViolations(adjacencyConstraints, grid, gridSize);
    return new Set(violations.map(v => `${v.row},${v.col}`));
  }, [showAdjacencyHints, puzzle, grid, gridSize]);

  if (!puzzle) {
    const defaultSize = 5;
    const totalTiles = defaultSize * defaultSize;
    return (
      <div 
        className="w-full max-w-md mx-auto aspect-square grid gap-1 sm:gap-1.5 p-2 sm:p-3 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 shadow-inner"
        style={{ gridTemplateColumns: `repeat(${defaultSize}, minmax(0, 1fr))` }}
      >
        {Array(totalTiles)
          .fill(null)
          .map((_, i) => (
            <div
              key={i}
              className="w-full aspect-square border-2 border-gray-300 rounded-xl bg-gray-50 flex items-center justify-center"
            >
              <span className="text-gray-400 text-xs">{i + 1}</span>
            </div>
          ))}
      </div>
    );
  }

  function getPairInfo(row: number, col: number) {
    const pairConstraints = puzzle!.constraints.filter((c) => c.type === 'pair');
    for (const constraint of pairConstraints) {
      const pos1 = constraint.cell1;
      const pos2 = constraint.cell2;
      if (
        (pos1.row === row && pos1.col === col) ||
        (pos2.row === row && pos2.col === col)
      ) {
        return {
          isPair: true,
          mustBeSame: constraint.mustBeSame,
          pairIndex: pairConstraints.indexOf(constraint),
        };
      }
    }
    return { isPair: false };
  }

  return (
    <div className="w-full mx-auto game-board-container">
      <div className="relative flex justify-center pt-16 sm:pt-20">
        {/* Game grid */}
        <div 
          className="grid gap-1 sm:gap-1.5 p-2 sm:p-3 relative bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 shadow-lg" 
          style={{ 
            minWidth: '320px', 
            maxWidth: '800px', 
            width: '100%',
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            aspectRatio: '1 / 1'
          }}
          onClick={handleGridClick}
        >
          {grid.map((row, rowIndex) =>
            row.map((tile, colIndex) => {
              const key = `${rowIndex},${colIndex}`;
              const isLocked = puzzle.givens.has(key);
              const pairInfo = getPairInfo(rowIndex, colIndex);
              const isPickerOpen = pickerPosition?.row === rowIndex && pickerPosition?.col === colIndex;
              const isAdjacencyViolation = adjacencyViolations.has(key);
              
              return (
                <div key={key} className="relative tile-picker-container">
                  <Tile
                    state={tile}
                    isLocked={isLocked}
                    onClick={() => handleTileClick(rowIndex, colIndex)}
                    isPickerOpen={isPickerOpen}
                    availablePieces={availablePieces}
                    onIconSelect={(tileState) => handleIconSelect(rowIndex, colIndex, tileState)}
                    onClosePicker={handleClosePicker}
                    isAdjacencyViolation={isAdjacencyViolation}
                  />
                  {pairInfo.isPair && (
                    <span
                      className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 text-xs sm:text-sm md:text-base bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-bold shadow-lg border border-purple-800 sm:border-2 z-10"
                      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                      title={pairInfo.mustBeSame ? 'Must be same' : 'Must be different'}
                    >
                      {(pairInfo.pairIndex ?? 0) + 1}
                    </span>
                  )}
                  {isAdjacencyViolation && (
                    <span
                      className="absolute top-0.5 left-0.5 sm:top-1 sm:left-1 text-[10px] sm:text-xs bg-gradient-to-br from-red-600 to-red-700 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-bold shadow-lg border border-red-800 sm:border-2 z-10"
                      title="Adjacency rule violation"
                    >
                      ⚠️
                    </span>
                  )}
                </div>
              );
            })
          )}

          {/* Columns label - above column numbers */}
          <div 
            className="absolute"
            style={{
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginBottom: '36px'
            }}
          >
            <div className="font-bold text-gray-500 whitespace-nowrap tracking-wide uppercase" style={{ fontSize: '1rem' }}>
              Columns
            </div>
          </div>

          {/* Column numbers - positioned above grid like x-axis */}
          <div 
            className="absolute grid gap-1 sm:gap-1.5"
            style={{ 
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              left: '8px',
              right: '8px',
              bottom: '100%',
              marginBottom: '4px',
              paddingLeft: '0px',
              paddingRight: '0px'
            }}
          >
            {Array.from({ length: gridSize }, (_, colIndex) => (
              <div
                key={`col-${colIndex}`}
                className="flex items-center justify-center"
              >
                <span className="text-xs sm:text-sm md:text-base text-gray-700" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>{colIndex + 1}</span>
              </div>
            ))}
          </div>

          {/* Rows label - vertically on the left side, to the left of row numbers */}
          <div 
            className="absolute"
            style={{
              right: '100%',
              top: '50%',
              transform: 'translateY(-50%)',
              marginRight: '36px'
            }}
          >
            <div 
              className="font-bold text-gray-500 tracking-wide uppercase"
              style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', fontSize: '1rem' }}
            >
              Rows
            </div>
          </div>

          {/* Row numbers - positioned to left of grid like y-axis */}
          <div 
            className="absolute grid gap-1 sm:gap-1.5"
            style={{ 
              gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
              top: '8px',
              bottom: '8px',
              right: '100%',
              marginRight: '4px',
              width: '28px',
              paddingTop: '0px',
              paddingBottom: '0px'
            }}
          >
            {Array.from({ length: gridSize }, (_, rowIndex) => (
              <div
                key={`row-label-${rowIndex}`}
                className="flex items-center justify-center"
              >
                <span className="text-xs sm:text-sm md:text-base text-gray-700" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>{rowIndex + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


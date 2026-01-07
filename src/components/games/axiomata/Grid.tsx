'use client';

import Tile from './Tile';
import { useGameStore } from '@/store/games/axiomata/useGameStore';

export default function Grid() {
  const grid = useGameStore((state) => state.grid);
  const puzzle = useGameStore((state) => state.puzzle);
  const toggleTile = useGameStore((state) => state.toggleTile);
  const startTimer = useGameStore((state) => state.startTimer);


  const handleTileClick = (row: number, col: number) => {
    startTimer();
    toggleTile(row, col);
  };

  if (!puzzle) {
    return (
      <div className="w-full max-w-md mx-auto aspect-square grid grid-cols-5 gap-2 p-3 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 shadow-inner">
        {Array(25)
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

  const getPairInfo = (row: number, col: number) => {
    const pairConstraints = puzzle.constraints.filter((c) => c.type === 'pair');
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
  };

  return (
    <div className="w-full mx-auto">
      <div className="aspect-square grid grid-cols-5 gap-2.5 p-3 relative bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 shadow-lg ml-auto mr-auto" style={{ minWidth: '320px', maxWidth: '600px', width: '100%' }}>
        {grid.map((row, rowIndex) =>
          row.map((tile, colIndex) => {
            const key = `${rowIndex},${colIndex}`;
            const isLocked = puzzle.givens.has(key);
            const pairInfo = getPairInfo(rowIndex, colIndex);
            return (
              <div key={key} className="relative">
                <Tile
                  state={tile}
                  isLocked={isLocked}
                  onClick={() => handleTileClick(rowIndex, colIndex)}
                />
                {pairInfo.isPair && (
                  <span
                    className="absolute -top-2 -left-2 text-xs bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold shadow-lg border-2 border-purple-800 z-10"
                    title={pairInfo.mustBeSame ? 'Must be same' : 'Must be different'}
                  >
                    {pairInfo.pairIndex + 1}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}


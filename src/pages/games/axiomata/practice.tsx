import { useEffect } from 'react';
import Head from 'next/head';
import Grid from '@/components/games/axiomata/Grid';
import ConstraintsPanel from '@/components/games/axiomata/ConstraintsPanel';
import TopBar from '@/components/games/axiomata/TopBar';
import { useGameStore } from '@/store/games/axiomata/useGameStore';
import { generatePuzzle } from '@/lib/games/axiomata/generator';
import { seedFromString, SeededRNG } from '@/lib/games/axiomata/seed';
import { track } from '@/lib/analytics';

export default function PracticePage() {
  const loadDailyPuzzle = useGameStore((state) => state.loadDailyPuzzle);

  useEffect(() => {
    track('practice_mode_loaded', { game: 'axiomata' });
    
    const randomSeed = Math.floor(Math.random() * 1000000);
    const rng = new SeededRNG(randomSeed);
    const practiceKey = `practice-${Date.now()}-${rng.nextInt(0, 999999)}`;
    const seed = seedFromString(practiceKey);
    
    const puzzle = generatePuzzle(practiceKey, 'medium');
    loadDailyPuzzle(puzzle);
  }, [loadDailyPuzzle]);

  return (
    <>
      <Head>
        <title>Axiomata - Practice | A.K. Warnock</title>
      </Head>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-2">Axiomata - Practice</h1>
          <p className="text-center text-gray-600 mb-6">Practice mode (no streak tracking)</p>
          
          <TopBar />
          
          <div className="mb-6">
            <Grid />
          </div>
          
          <ConstraintsPanel />
        </div>
      </div>
    </>
  );
}


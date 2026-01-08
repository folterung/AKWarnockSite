import { useEffect, useState } from 'react';
import Head from 'next/head';
import Header from '@/components/layout/Header';
import Grid from '@/components/games/axiomata/Grid';
import ConstraintsPanel from '@/components/games/axiomata/ConstraintsPanel';
import StatsModal from '@/components/games/axiomata/StatsModal';
import DifficultySelector from '@/components/games/axiomata/DifficultySelector';
import { useGameStore } from '@/store/games/axiomata/useGameStore';
import { generatePuzzle } from '@/lib/games/axiomata/generator';
import { getDailyKey } from '@/lib/games/axiomata/seed';
import { track } from '@/lib/analytics';
import type { Puzzle, Difficulty, Constraint, CountConstraint, RegionConstraint } from '@/lib/games/axiomata/types';

export default function AxiomataPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [hasSeenCompletion, setHasSeenCompletion] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const puzzle = useGameStore((state) => state.puzzle);
  const isComplete = useGameStore((state) => state.isComplete);
  const loadDailyPuzzle = useGameStore((state) => state.loadDailyPuzzle);
  const selectedDifficulty = useGameStore((state) => state.selectedDifficulty);
  const selectedDifficultyDate = useGameStore((state) => state.selectedDifficultyDate);
  const setDifficulty = useGameStore((state) => state.setDifficulty);
  const clearDifficulty = useGameStore((state) => state.clearDifficulty);

  const [dailyKey, setDailyKey] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const currentDailyKey = getDailyKey();
    setDailyKey(currentDailyKey);
    
    const savedDifficulty = localStorage.getItem(`axiomata-difficulty-${currentDailyKey}`);
    
    if (savedDifficulty) {
      setDifficulty(savedDifficulty as Difficulty);
    } else {
      // Explicitly clear difficulty if no saved difficulty found
      clearDifficulty();
    }
    
    setIsHydrated(true);
  }, [setDifficulty, clearDifficulty]);

  const needsDifficultySelection = isHydrated && dailyKey && (!selectedDifficulty || selectedDifficultyDate !== dailyKey);

  useEffect(() => {
    track('puzzle_loaded', { game: 'axiomata' });
  }, []);

  useEffect(() => {
    if (!isHydrated || !dailyKey || needsDifficultySelection) {
      return;
    }

    let isMounted = true;
    let isGenerating = false;
    
    function loadPuzzle() {
      if (!isMounted || isGenerating || !selectedDifficulty || !dailyKey) return;
      isGenerating = true;
      setIsLoading(true);
      setError(null);
      
      try {
        const CACHE_VERSION = '4';
        const cacheKey = `axiomata-puzzle-${dailyKey}-${selectedDifficulty}`;
        const versionKey = `axiomata-cache-version-${dailyKey}-${selectedDifficulty}`;
        
        console.log('Loading puzzle for:', dailyKey, 'difficulty:', selectedDifficulty);
        
        const cachedVersion = localStorage.getItem(versionKey);
        const cachedPuzzle = localStorage.getItem(cacheKey);
        
        if (cachedPuzzle && cachedVersion === CACHE_VERSION) {
          try {
            console.log('Found cached puzzle');
            const parsed = JSON.parse(cachedPuzzle);
            
            function normalizeConstraints(constraints: any[]): Constraint[] {
              return constraints.map((c: any) => {
                if (c.type === 'count') {
                  const countConstraint = c as any;
                  if (countConstraint.counts instanceof Map) {
                    return c;
                  } else if (Array.isArray(countConstraint.counts)) {
                    return {
                      ...c,
                      counts: new Map(countConstraint.counts),
                    };
                  } else if (typeof countConstraint.counts === 'object' && countConstraint.counts !== null) {
                    return {
                      ...c,
                      counts: new Map(Object.entries(countConstraint.counts).map(([k, v]) => [k, v])),
                    };
                  } else if (countConstraint.sunCount !== undefined || countConstraint.moonCount !== undefined) {
                    const counts = new Map();
                    if (countConstraint.sunCount) counts.set('SUN', countConstraint.sunCount);
                    if (countConstraint.moonCount) counts.set('MOON', countConstraint.moonCount);
                    return {
                      ...c,
                      counts,
                    };
                  }
                } else if (c.type === 'region') {
                  const regionConstraint = c as any;
                  if (regionConstraint.counts instanceof Map) {
                    return c;
                  } else if (Array.isArray(regionConstraint.counts)) {
                    return {
                      ...c,
                      counts: new Map(regionConstraint.counts),
                    };
                  } else if (typeof regionConstraint.counts === 'object' && regionConstraint.counts !== null) {
                    return {
                      ...c,
                      counts: new Map(Object.entries(regionConstraint.counts).map(([k, v]) => [k, v])),
                    };
                  } else if (regionConstraint.sunCount !== undefined || regionConstraint.moonCount !== undefined) {
                    const counts = new Map();
                    if (regionConstraint.sunCount) counts.set('SUN', regionConstraint.sunCount);
                    if (regionConstraint.moonCount) counts.set('MOON', regionConstraint.moonCount);
                    return {
                      ...c,
                      counts,
                    };
                  }
                }
                return c;
              });
            }
            
            const puzzle = {
              ...parsed,
              givens: new Map(parsed.givens),
              constraints: normalizeConstraints(parsed.constraints || []),
              gridSize: parsed.gridSize || 5,
            };
            
            console.log('Loading cached puzzle');
            if (!isMounted) return;
            loadDailyPuzzle(puzzle);
            console.log('Cached puzzle loaded');
            setIsLoading(false);
            isGenerating = false;
            return;
          } catch (error) {
            console.error('Failed to load cached puzzle:', error);
            localStorage.removeItem(cacheKey);
            localStorage.removeItem(versionKey);
          }
        } else if (cachedPuzzle) {
          console.log('Cache version mismatch, clearing old cache');
          localStorage.removeItem(cacheKey);
          localStorage.removeItem(versionKey);
        }

        console.log('Generating new puzzle...');
        const startTime = Date.now();
        
        (async () => {
          try {
            const timeoutPromise = new Promise<never>((_, reject) => {
              setTimeout(() => reject(new Error('Generation timeout after 30 seconds')), 30000);
            });
            
            const generatePromise = new Promise<Puzzle>((resolve, reject) => {
              // Use setTimeout to yield to the browser, but with minimal delay
              setTimeout(() => {
                try {
                  const puzzle = generatePuzzle(dailyKey, selectedDifficulty);
                  resolve(puzzle);
                } catch (error) {
                  reject(error);
                }
              }, 0);
            });
            
            const resolvedPuzzle = await Promise.race([generatePromise, timeoutPromise]);
            console.log('Puzzle generated in', Date.now() - startTime, 'ms');
            
            console.log('Puzzle details:', {
              constraints: resolvedPuzzle.constraints.length,
              givens: resolvedPuzzle.givens.size,
              hasSolution: !!resolvedPuzzle.solution,
              gridSize: resolvedPuzzle.gridSize,
            });
            
            console.log('Puzzle generated ✓');
            
            function serializeConstraints(constraints: Constraint[]): any[] {
              return constraints.map(c => {
                if (c.type === 'count' || c.type === 'region') {
                  const constraint = c as CountConstraint | RegionConstraint;
                  return {
                    ...c,
                    counts: Array.from(constraint.counts.entries()),
                  };
                }
                return c;
              });
            }
            
            const serializable = {
              ...resolvedPuzzle,
              givens: Array.from(resolvedPuzzle.givens.entries()),
              constraints: serializeConstraints(resolvedPuzzle.constraints),
            };
            
            try {
              localStorage.setItem(cacheKey, JSON.stringify(serializable));
              localStorage.setItem(versionKey, CACHE_VERSION);
              console.log('Puzzle saved to cache');
            } catch (storageError) {
              console.warn('Failed to save to cache:', storageError);
            }
            
            console.log('Calling loadDailyPuzzle...');
            if (!isMounted) {
              isGenerating = false;
              return;
            }
            loadDailyPuzzle(resolvedPuzzle);
            console.log('loadDailyPuzzle called');
            setIsLoading(false);
            isGenerating = false;
          } catch (err) {
            console.error('Failed to generate puzzle:', err);
            console.error('Error stack:', err instanceof Error ? err.stack : 'No stack');
            if (!isMounted) {
              isGenerating = false;
              return;
            }
            if (err instanceof Error && err.message.includes('timeout')) {
              setError('Puzzle generation is taking too long. Please refresh.');
            } else {
              setError(err instanceof Error ? err.message : 'Failed to load puzzle');
            }
            setIsLoading(false);
            isGenerating = false;
          }
        })();
      } catch (err) {
        console.error('Failed to generate puzzle:', err);
        console.error('Error stack:', err instanceof Error ? err.stack : 'No stack');
        if (!isMounted) {
          isGenerating = false;
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to load puzzle');
        setIsLoading(false);
        isGenerating = false;
      }
    }
    
    loadPuzzle();
    
    return () => {
      isMounted = false;
      isGenerating = false;
    };
  }, [selectedDifficulty, selectedDifficultyDate, dailyKey, needsDifficultySelection, isHydrated, loadDailyPuzzle]);

  useEffect(() => {
    if (puzzle && isLoading) {
      console.log('Puzzle loaded in store, setting loading to false');
      setIsLoading(false);
    }
  }, [puzzle, isLoading]);

  useEffect(() => {
    if (isComplete && !isModalOpen && !hasSeenCompletion) {
      setIsModalOpen(true);
      setHasSeenCompletion(true);
    }
  }, [isComplete, isModalOpen, hasSeenCompletion]);
  
  useEffect(() => {
    if (!isComplete) {
      setHasSeenCompletion(false);
    }
  }, [isComplete]);

  function handleDifficultySelect(difficulty: Difficulty) {
    setIsLoading(true);
    setDifficulty(difficulty);
  }

  if (!isHydrated) {
    return (
      <>
        <Head>
          <title>Axiomata | A.K. Warnock</title>
        </Head>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-20 py-4 md:pt-[4.5rem] px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <h1 className="text-4xl md:text-5xl font-light italic text-center mb-8 text-gray-900" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Axiomata
              </h1>
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
                <span className="ml-4 text-lg text-gray-600">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (needsDifficultySelection) {
    return (
      <>
        <Head>
          <title>Axiomata | A.K. Warnock</title>
        </Head>
        <Header />
        <DifficultySelector onSelect={handleDifficultySelect} />
      </>
    );
  }

  if (isLoading || !puzzle) {
    return (
      <>
        <Head>
          <title>Axiomata | A.K. Warnock</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <h1 className="text-4xl md:text-5xl font-light italic text-center mb-8 text-gray-900" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Axiomata
              </h1>
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
                <span className="ml-4 text-lg text-gray-600">Loading puzzle...</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Axiomata | A.K. Warnock</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <h1 className="text-4xl md:text-5xl font-light italic text-center mb-8 text-gray-900" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Axiomata
              </h1>
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
                <div className="text-red-800 font-semibold mb-2">Error</div>
                <div className="text-red-600">{error}</div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Axiomata | A.K. Warnock</title>
      </Head>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-20 py-4 md:pt-[4.5rem] px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start lg:items-start max-w-[946px] ml-auto mr-auto">
              <div className="w-full lg:flex-[3] lg:flex-shrink-0 mb-8 lg:mb-0">
                <div className="relative mb-4 lg:mb-0">
                  <div className="flex justify-center">
                    <div className="relative">
                      <h1 
                        className="text-5xl md:text-6xl font-semibold italic text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-primary-600 to-gray-900 drop-shadow-sm" 
                        style={{ fontFamily: "'Cormorant Garamond', serif", textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                      >
                        Axiomata
                      </h1>
                      <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-400 to-transparent opacity-80"></div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center lg:justify-start">
                  <Grid />
                </div>
              </div>
              
              <div className="w-full lg:flex-1 lg:min-w-[280px] lg:max-w-[350px] lg:sticky lg:top-4">
                <div className="mb-4">
                  <button
                    onClick={() => setIsHowToPlayOpen(true)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary-200 rounded-xl hover:from-primary-100 hover:to-blue-100 hover:border-primary-300 font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md italic"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-primary-600 to-gray-900">How to Play</span>
                  </button>
                </div>
                <ConstraintsPanel />
              </div>
            </div>

            <StatsModal
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
              }}
            />

            {isHowToPlayOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsHowToPlayOpen(false)}>
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border-2 border-gray-100" onClick={(e) => e.stopPropagation()}>
                  <h2 className="text-3xl font-semibold italic text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-primary-600 to-gray-900 drop-shadow-sm" style={{ fontFamily: "'Cormorant Garamond', serif", textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    How to Play
                  </h2>
                  
                  <div className="bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary-200 rounded-xl p-5 mb-6">
                    <ul className="text-sm text-primary-800 space-y-3 list-none">
                      <li className="flex items-start">
                        <span className="mr-2 text-primary-600 font-bold">•</span>
                        <span className="font-bold">Click any tile to cycle through available pieces</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-primary-600 font-bold">•</span>
                        <span className="font-bold">Locked tiles (🔒) are clues - you can&apos;t change them</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-primary-600 font-bold">•</span>
                        <span className="font-bold">Purple numbers show linked pairs - see rules below</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-primary-600 font-bold">•</span>
                        <span className="font-bold">Satisfy all rules to win!</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => setIsHowToPlayOpen(false)}
                    className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Got it!
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

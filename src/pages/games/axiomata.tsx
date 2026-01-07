import { useEffect, useState } from 'react';
import Head from 'next/head';
import Grid from '@/components/games/axiomata/Grid';
import ConstraintsPanel from '@/components/games/axiomata/ConstraintsPanel';
import TopBar from '@/components/games/axiomata/TopBar';
import StatsModal from '@/components/games/axiomata/StatsModal';
import { useGameStore } from '@/store/games/axiomata/useGameStore';
import { generatePuzzle } from '@/lib/games/axiomata/generator';
import { getDailyKey } from '@/lib/games/axiomata/seed';
import { track } from '@/lib/analytics';

export default function AxiomataPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [hasSeenCompletion, setHasSeenCompletion] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const puzzle = useGameStore((state) => state.puzzle);
  const isComplete = useGameStore((state) => state.isComplete);
  const loadDailyPuzzle = useGameStore((state) => state.loadDailyPuzzle);

  useEffect(() => {
    track('puzzle_loaded', { game: 'axiomata' });
  }, []);

  useEffect(() => {
    let isMounted = true;
    let isGenerating = false;
    
    const loadPuzzle = async () => {
      if (!isMounted || isGenerating) return;
      isGenerating = true;
      setIsLoading(true);
      setError(null);
      
      try {
        const dailyKey = getDailyKey();
        const CACHE_VERSION = '2'; // Increment to invalidate old caches
        console.log('Loading puzzle for:', dailyKey);
        
        const cachedVersion = localStorage.getItem(`axiomata-cache-version-${dailyKey}`);
        const cachedPuzzle = localStorage.getItem(`axiomata-puzzle-${dailyKey}`);
        
        if (cachedPuzzle && cachedVersion === CACHE_VERSION) {
          try {
            console.log('Found cached puzzle');
            const parsed = JSON.parse(cachedPuzzle);
            const puzzle = {
              ...parsed,
              givens: new Map(parsed.givens),
            };
            
            console.log('Loading cached puzzle');
            if (!isMounted) return;
            loadDailyPuzzle(puzzle);
            console.log('Cached puzzle loaded');
            setIsLoading(false);
            return;
          } catch (error) {
            console.error('Failed to load cached puzzle:', error);
            localStorage.removeItem(`axiomata-puzzle-${dailyKey}`);
            localStorage.removeItem(`axiomata-cache-version-${dailyKey}`);
          }
        } else if (cachedPuzzle) {
          console.log('Cache version mismatch, clearing old cache');
          localStorage.removeItem(`axiomata-puzzle-${dailyKey}`);
          localStorage.removeItem(`axiomata-cache-version-${dailyKey}`);
        }

        console.log('Generating new puzzle...');
        const startTime = Date.now();
        
        let newPuzzle;
        try {
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Generation timeout after 8 seconds')), 8000);
          });
          
          const generatePromise = new Promise<Puzzle>((resolve, reject) => {
            requestAnimationFrame(() => {
              setTimeout(() => {
                try {
                  const puzzle = generatePuzzle(dailyKey, 'medium');
                  resolve(puzzle);
                } catch (error) {
                  reject(error);
                }
              }, 0);
            });
          });
          
          newPuzzle = await Promise.race([generatePromise, timeoutPromise]);
          console.log('Puzzle generated in', Date.now() - startTime, 'ms');
        } catch (genError) {
          console.error('Generator error:', genError);
          if (!isMounted) return;
          if (genError instanceof Error && genError.message.includes('timeout')) {
            setError('Puzzle generation is taking too long. Please refresh.');
            setIsLoading(false);
            return;
          }
          throw genError;
        }
        
        console.log('Puzzle details:', {
          constraints: newPuzzle.constraints.length,
          givens: newPuzzle.givens.size,
          hasSolution: !!newPuzzle.solution,
        });
        
        console.log('Puzzle generated ✓');
        
        const serializable = {
          ...newPuzzle,
          givens: Array.from(newPuzzle.givens.entries()),
        };
        
        try {
          localStorage.setItem(`axiomata-puzzle-${dailyKey}`, JSON.stringify(serializable));
          localStorage.setItem(`axiomata-cache-version-${dailyKey}`, CACHE_VERSION);
          console.log('Puzzle saved to cache');
        } catch (storageError) {
          console.warn('Failed to save to cache:', storageError);
        }
        
        console.log('Calling loadDailyPuzzle...');
        if (!isMounted) {
          isGenerating = false;
          return;
        }
        loadDailyPuzzle(newPuzzle);
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
        setError(err instanceof Error ? err.message : 'Failed to load puzzle');
        setIsLoading(false);
        isGenerating = false;
      }
    };
    
    loadPuzzle();
    
    return () => {
      isMounted = false;
      isGenerating = false;
    };
  }, [loadDailyPuzzle]);

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

  if (isLoading) {
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8 md:py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10">
            <div className="relative mb-6">
              <div className="flex justify-center">
                <div className="relative">
                  <h1 
                    className="text-6xl md:text-7xl font-semibold italic text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-primary-600 to-gray-900 drop-shadow-sm" 
                    style={{ fontFamily: "'Cormorant Garamond', serif", textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                  >
                    Axiomata
                  </h1>
                  <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-400 to-transparent opacity-80"></div>
                </div>
              </div>
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setIsHowToPlayOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary-200 rounded-xl hover:from-primary-100 hover:to-blue-100 hover:border-primary-300 font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md italic"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-primary-600 to-gray-900">How to Play</span>
                </button>
              </div>
            </div>
            
            <TopBar />
            
            <div className="mb-8">
              <Grid />
            </div>
            
            <ConstraintsPanel />

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
                        <span className="font-bold">Click any tile to cycle: Empty → ☀️ → 🌙 → Empty</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-primary-600 font-bold">•</span>
                        <span className="font-bold">Locked tiles (🔒) are clues - you can't change them</span>
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


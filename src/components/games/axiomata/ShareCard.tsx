'use client';

import { useRef, useState, useEffect } from 'react';
import { useGameStore } from '@/store/games/axiomata/useGameStore';
import { track } from '@/lib/analytics';
import { getDailyKey } from '@/lib/games/axiomata/seed';

interface ShareCardProps {
  onShareComplete?: () => void;
  captureRef?: React.RefObject<HTMLDivElement>;
}

export default function ShareCard({ onShareComplete, captureRef }: ShareCardProps) {
  const timeToSolveMs = useGameStore((state) => state.timeToSolveMs);
  const currentStreak = useGameStore((state) => state.currentStreak);
  const bestStreak = useGameStore((state) => state.bestStreak);
  const [isGenerating, setIsGenerating] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    function checkShareAvailability() {
      const dailyKey = getDailyKey();
      const completedTimestamp = localStorage.getItem(`axiomata-completed-${dailyKey}`);
      
      if (completedTimestamp) {
        const timestamp = parseInt(completedTimestamp, 10);
        const completionDate = new Date(timestamp);
        const today = new Date();
        
        const isSameDay = 
          completionDate.getFullYear() === today.getFullYear() &&
          completionDate.getMonth() === today.getMonth() &&
          completionDate.getDate() === today.getDate();
        
        setCanShare(isSameDay);
      } else {
        setCanShare(false);
      }
    }

    checkShareAvailability();
  }, []);

  async function generateImage() {
    const element = captureRef?.current;
    if (!element) return null;

    await new Promise(resolve => setTimeout(resolve, 100));

    const { toPng } = await import('html-to-image');
    
    const dataUrl = await toPng(element, {
      quality: 1.0,
      pixelRatio: 1.5,
      backgroundColor: '#ffffff',
      cacheBust: true,
    });

    return dataUrl;
  }

  async function handleShare() {
    if (!captureRef?.current) return;

    try {
      setIsGenerating(true);
      track('share_clicked', { timeToSolveMs, currentStreak });

      const dataUrl = await generateImage();
      if (!dataUrl) return;

      if (navigator.share && navigator.canShare) {
        const blob = await fetch(dataUrl).then((res) => res.blob());
        const file = new File([blob], 'axiomata-result.png', { type: 'image/png' });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Axiomata Puzzle Result',
            text: `I solved today's Axiomata puzzle in ${formatTime(timeToSolveMs)}!`,
          });
          return;
        }
      }

      const link = document.createElement('a');
      link.download = 'axiomata-result.png';
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to share:', error);
    } finally {
      setIsGenerating(false);
    }
  }

  function formatTime(ms: number | null) {
    if (ms === null) return '0:00';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  return (
    <>
      <button
        onClick={handleShare}
        disabled={isGenerating || !canShare}
        className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? 'Generating...' : canShare ? 'Share Result' : 'Share Unavailable'}
      </button>
    </>
  );
}


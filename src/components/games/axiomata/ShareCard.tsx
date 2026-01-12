'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/games/axiomata/useGameStore';
import { track } from '@/lib/analytics';
import { getDailyKey } from '@/lib/games/axiomata/seed';
import { isDifficultyCompleted } from '@/store/games/axiomata/useGameStore';
import {
  generateShareImage,
  copyImageToClipboard,
  downloadImage,
} from '@/lib/games/axiomata/shareService';

interface ShareCardProps {
  onShareComplete?: () => void;
  captureRef?: React.RefObject<HTMLDivElement>;
}

interface ToastMessage {
  message: string;
  type: 'success' | 'error';
}

export default function ShareCard({ onShareComplete, captureRef }: ShareCardProps) {
  const timeToSolveMs = useGameStore((state) => state.timeToSolveMs);
  const selectedDifficulty = useGameStore((state) => state.selectedDifficulty);
  const isComplete = useGameStore((state) => state.isComplete);
  const [isGenerating, setIsGenerating] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    function checkShareAvailability() {
      if (!selectedDifficulty) {
        setCanShare(false);
        return;
      }

      const dailyKey = getDailyKey();
      const isCompleted = isDifficultyCompleted(dailyKey, selectedDifficulty);
      
      // Enable sharing if puzzle is complete OR difficulty is marked as completed
      // This handles both immediate completion and persisted completion state
      setCanShare(isComplete || isCompleted);
    }

    checkShareAvailability();
    
    // Re-check after a short delay to ensure localStorage write has completed
    const timeoutId = setTimeout(() => {
      checkShareAvailability();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [selectedDifficulty, isComplete]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type });
  }

  function formatTime(ms: number | null): string {
    if (ms === null) return '0:00';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  async function handleCopyImage() {
    if (!captureRef?.current) {
      showToast('Unable to copy image', 'error');
      return;
    }

    try {
      setIsGenerating(true);
      track('share_attempted', { platform: 'copy', timeToSolveMs });

      const dataUrl = await generateShareImage(captureRef.current);
      if (!dataUrl) {
        showToast('Failed to generate image', 'error');
        track('share_completed', { platform: 'copy', success: false, timeToSolveMs });
        return;
      }

      try {
        await copyImageToClipboard(dataUrl);
        showToast('Image copied! Paste it wherever you want to share.', 'success');
        track('share_completed', { platform: 'copy', success: true, timeToSolveMs });
        track('clipboard_copy', { success: true, timeToSolveMs });
      } catch (clipboardError) {
        // Fallback to download if clipboard fails
        downloadImage(dataUrl);
        showToast('Clipboard not available. Image downloaded instead.', 'success');
        track('share_completed', { platform: 'copy', success: true, timeToSolveMs });
        track('clipboard_copy', { success: false, timeToSolveMs });
      }
    } catch (error) {
      console.error('Failed to copy image:', error);
      showToast('Failed to copy image', 'error');
      track('share_completed', { platform: 'copy', success: false, timeToSolveMs });
      track('clipboard_copy', { success: false, timeToSolveMs });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleCopyImage}
        disabled={isGenerating || !canShare}
        className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? 'Generating...' : canShare ? 'Copy Image to Share' : 'Share Unavailable'}
      </button>

      {toast && (
        <div
          className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}


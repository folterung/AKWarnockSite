export function track(eventName: string, payload?: Record<string, unknown>): void {
  if (typeof window === 'undefined') {
    return;
  }

  console.log('[Analytics]', eventName, payload);

  // Event types tracked:
  // - puzzle_completed: { timeToSolveMs }
  // - share_attempted: { platform, timeToSolveMs }
  // - share_completed: { platform, success, timeToSolveMs, error? }
  // - clipboard_copy: { success, timeToSolveMs }

  // TODO: Integrate with analytics service (e.g., Google Analytics, Plausible, etc.)
  // Example:
  // if (window.gtag) {
  //   window.gtag('event', eventName, payload);
  // }
}


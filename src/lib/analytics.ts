export function track(eventName: string, payload?: Record<string, unknown>): void {
  if (typeof window === 'undefined') {
    return;
  }

  console.log('[Analytics]', eventName, payload);

  // TODO: Integrate with analytics service (e.g., Google Analytics, Plausible, etc.)
  // Example:
  // if (window.gtag) {
  //   window.gtag('event', eventName, payload);
  // }
}


import type { SectionBounds, SectionType } from '../types/world';

export interface ProgressState {
  currentSection: SectionType;
  currentLabel: string;
  sectionIndex: number;
  progress: number; // 0-1 within current section
  globalProgress: number; // 0-1 across entire world
}

export function computeProgress(
  playerX: number,
  sections: SectionBounds[],
  totalWidth: number
): ProgressState {
  const globalProgress = totalWidth > 0 ? Math.max(0, Math.min(1, playerX / totalWidth)) : 0;

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (playerX >= section.startX && playerX < section.endX) {
      const sectionWidth = section.endX - section.startX;
      const progress = sectionWidth > 0
        ? (playerX - section.startX) / sectionWidth
        : 0;
      return {
        currentSection: section.type,
        currentLabel: section.label,
        sectionIndex: i,
        progress,
        globalProgress,
      };
    }
  }

  // If past the last section, return last section at 100%
  if (sections.length > 0) {
    const last = sections[sections.length - 1];
    return {
      currentSection: last.type,
      currentLabel: last.label,
      sectionIndex: sections.length - 1,
      progress: 1,
      globalProgress: 1,
    };
  }

  return {
    currentSection: 'intro',
    currentLabel: '',
    sectionIndex: 0,
    progress: 0,
    globalProgress: 0,
  };
}

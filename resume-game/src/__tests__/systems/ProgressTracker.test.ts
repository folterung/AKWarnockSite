import { describe, it, expect } from 'vitest';
import { computeProgress } from '../../systems/ProgressTracker';
import type { SectionBounds } from '../../types/world';

const mockSections: SectionBounds[] = [
  { type: 'intro', label: 'Welcome', startX: 0, endX: 1000, themeColor: 0, decorationSet: 'office' },
  { type: 'career', label: 'Career', startX: 1000, endX: 3000, themeColor: 0, decorationSet: 'office' },
  { type: 'contact', label: 'Contact', startX: 3000, endX: 4000, themeColor: 0, decorationSet: 'park' },
];

const totalWidth = 4000;

describe('ProgressTracker', () => {
  it('identifies section at start of world', () => {
    const result = computeProgress(0, mockSections, totalWidth);
    expect(result.currentSection).toBe('intro');
    expect(result.sectionIndex).toBe(0);
    expect(result.progress).toBe(0);
  });

  it('identifies section in the middle', () => {
    const result = computeProgress(1500, mockSections, totalWidth);
    expect(result.currentSection).toBe('career');
    expect(result.sectionIndex).toBe(1);
    expect(result.progress).toBeCloseTo(0.25);
  });

  it('computes global progress correctly', () => {
    const result = computeProgress(2000, mockSections, totalWidth);
    expect(result.globalProgress).toBeCloseTo(0.5);
  });

  it('returns last section when past the end', () => {
    const result = computeProgress(5000, mockSections, totalWidth);
    expect(result.currentSection).toBe('contact');
    expect(result.progress).toBe(1);
  });

  it('handles section boundaries correctly', () => {
    const result = computeProgress(1000, mockSections, totalWidth);
    expect(result.currentSection).toBe('career');
    expect(result.sectionIndex).toBe(1);
  });

  it('returns correct label', () => {
    const result = computeProgress(3500, mockSections, totalWidth);
    expect(result.currentLabel).toBe('Contact');
  });
});

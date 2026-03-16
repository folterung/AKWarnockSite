import { describe, it, expect } from 'vitest';
import { resumeData } from '../../data/resumeContent';

describe('resumeContent', () => {
  it('has required top-level fields', () => {
    expect(resumeData.name).toBeTruthy();
    expect(resumeData.title).toBeTruthy();
    expect(resumeData.summary).toBeTruthy();
    expect(resumeData.tagline).toBeTruthy();
  });

  it('has 13 work experiences', () => {
    expect(resumeData.experience).toHaveLength(13);
  });

  it('all experiences have unique IDs', () => {
    const ids = resumeData.experience.map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all experiences have required fields', () => {
    for (const exp of resumeData.experience) {
      expect(exp.id).toBeTruthy();
      expect(exp.company).toBeTruthy();
      expect(exp.title).toBeTruthy();
      expect(exp.highlights.length).toBeGreaterThan(0);
      expect(exp.technologies.length).toBeGreaterThan(0);
    }
  });

  it('has at least 10 skills', () => {
    expect(resumeData.skills.length).toBeGreaterThanOrEqual(10);
  });

  it('all skills have unique IDs', () => {
    const ids = resumeData.skills.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has certifications', () => {
    expect(resumeData.certifications.length).toBeGreaterThanOrEqual(5);
  });

  it('has education entries', () => {
    expect(resumeData.education.length).toBeGreaterThanOrEqual(2);
  });

  it('has featured work', () => {
    expect(resumeData.featuredWork.length).toBeGreaterThan(0);
  });

  it('has contact links', () => {
    expect(resumeData.contact.length).toBeGreaterThanOrEqual(3);
    const types = resumeData.contact.map(c => c.type);
    expect(types).toContain('linkedin');
    expect(types).toContain('github');
    expect(types).toContain('email');
  });

  it('all IDs across all collections are globally unique', () => {
    const allIds = [
      ...resumeData.experience.map(e => e.id),
      ...resumeData.skills.map(s => s.id),
      ...resumeData.certifications.map(c => c.id),
      ...resumeData.education.map(e => e.id),
      ...resumeData.featuredWork.map(f => f.id),
      ...resumeData.contact.map(c => c.id),
    ];
    expect(new Set(allIds).size).toBe(allIds.length);
  });
});

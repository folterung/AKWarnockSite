import { describe, it, expect } from 'vitest';
import { resumeData } from '../../data/resumeContent';

describe('resumeContent', () => {
  it('has required top-level fields', () => {
    expect(resumeData.name).toBeTruthy();
    expect(resumeData.title).toBeTruthy();
    expect(resumeData.summary).toBeTruthy();
    expect(resumeData.tagline).toBeTruthy();
  });

  it('has 10 work experiences (excludes independent projects)', () => {
    expect(resumeData.experience).toHaveLength(10);
  });

  it('has 3 independent projects', () => {
    expect(resumeData.independentProjects).toHaveLength(3);
    const titles = resumeData.independentProjects.map(p => p.title);
    expect(titles).toContain('Game Developer');
    expect(titles).toContain('Author');
    expect(titles).toContain('Podcast Host');
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

  it('Authentic Digital Agency entry has correct title and company', () => {
    const authentic = resumeData.experience.find(e => e.id === 'exp-5');
    expect(authentic).toBeDefined();
    expect(authentic!.company).toBe('Authentic Digital Agency');
    expect(authentic!.title).toBe('Software Solutions Architect');
  });

  it('Apex Systems LLC entry has correct company name', () => {
    const apex = resumeData.experience.find(e => e.id === 'exp-7');
    expect(apex).toBeDefined();
    expect(apex!.company).toBe('Apex Systems LLC');
  });

  it('Major Rocket highlights match resume PDF', () => {
    const majorRocket = resumeData.experience.find(e => e.id === 'exp-3');
    expect(majorRocket).toBeDefined();
    expect(majorRocket!.highlights).toHaveLength(4);
  });

  it('education degrees match resume PDF', () => {
    const coastal = resumeData.education.find(e => e.id === 'edu-1');
    expect(coastal).toBeDefined();
    expect(coastal!.degree).toBe('Computer Science and Programming');

    const ati = resumeData.education.find(e => e.id === 'edu-2');
    expect(ati).toBeDefined();
    expect(ati!.degree).toBe('Associate of Applied Science: Occupational Science');
  });

  it('all IDs across all collections are globally unique', () => {
    const allIds = [
      ...resumeData.experience.map(e => e.id),
      ...resumeData.independentProjects.map(e => e.id),
      ...resumeData.skills.map(s => s.id),
      ...resumeData.certifications.map(c => c.id),
      ...resumeData.education.map(e => e.id),
      ...resumeData.featuredWork.map(f => f.id),
      ...resumeData.contact.map(c => c.id),
    ];
    expect(new Set(allIds).size).toBe(allIds.length);
  });
});

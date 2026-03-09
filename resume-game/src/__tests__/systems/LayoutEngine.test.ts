import { describe, it, expect } from 'vitest';
import { computeWorldLayout } from '../../systems/LayoutEngine';
import { resumeData } from '../../data/resumeContent';
import { sectionConfigs } from '../../data/sectionConfig';

describe('LayoutEngine', () => {
  const layout = computeWorldLayout(resumeData, sectionConfigs);

  it('produces contiguous sections with no gaps', () => {
    for (let i = 1; i < layout.sections.length; i++) {
      expect(layout.sections[i].startX).toBe(layout.sections[i - 1].endX);
    }
  });

  it('first section starts at 0', () => {
    expect(layout.sections[0].startX).toBe(0);
  });

  it('total width matches last section endX', () => {
    const last = layout.sections[layout.sections.length - 1];
    expect(layout.totalWidth).toBe(last.endX);
  });

  it('total width matches sum of section configs', () => {
    const expectedWidth = sectionConfigs.reduce((sum, c) => sum + c.widthPx, 0);
    expect(layout.totalWidth).toBe(expectedWidth);
  });

  it('has correct number of sections', () => {
    expect(layout.sections).toHaveLength(sectionConfigs.length);
  });

  it('intro section has 1 interactable', () => {
    const introItems = layout.interactables.filter(i => i.sectionType === 'intro');
    expect(introItems).toHaveLength(1);
  });

  it('career section has 8 interactables (one per experience)', () => {
    const careerItems = layout.interactables.filter(i => i.sectionType === 'career');
    expect(careerItems).toHaveLength(resumeData.experience.length);
  });

  it('skills section has 5 interactables (one per category)', () => {
    const skillItems = layout.interactables.filter(i => i.sectionType === 'skills');
    expect(skillItems).toHaveLength(5);
  });

  it('certifications section has correct count', () => {
    const certItems = layout.interactables.filter(i => i.sectionType === 'certifications');
    expect(certItems).toHaveLength(
      resumeData.certifications.length + resumeData.education.length
    );
  });

  it('contact section has 3 interactables', () => {
    const contactItems = layout.interactables.filter(i => i.sectionType === 'contact');
    expect(contactItems).toHaveLength(resumeData.contact.length);
  });

  it('all interactables are within their section bounds', () => {
    for (const item of layout.interactables) {
      const section = layout.sections.find(s => s.type === item.sectionType);
      expect(section).toBeDefined();
      expect(item.x).toBeGreaterThanOrEqual(section!.startX);
      expect(item.x).toBeLessThanOrEqual(section!.endX);
    }
  });

  it('all interactable IDs are unique', () => {
    const ids = layout.interactables.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('spawn position is within the world', () => {
    expect(layout.spawnX).toBeGreaterThan(0);
    expect(layout.spawnX).toBeLessThan(layout.totalWidth);
  });

  it('every interactable has modal content', () => {
    for (const item of layout.interactables) {
      expect(item.modalContent).toBeDefined();
      expect(item.modalContent.title).toBeTruthy();
      expect(item.modalContent.body).toBeTruthy();
    }
  });
});

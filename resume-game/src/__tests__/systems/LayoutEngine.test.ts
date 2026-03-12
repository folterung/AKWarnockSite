import { describe, it, expect } from 'vitest';
import { computeWorldLayout, getGroundYAtX } from '../../systems/LayoutEngine';
import { resumeData } from '../../data/resumeContent';
import { sectionConfigs } from '../../data/sectionConfig';
import { GROUND_Y, PLAYER_JUMP_VELOCITY, GRAVITY, TRANSITION_WIDTH } from '../../constants';
import type { SectionBounds } from '../../types/world';

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

  it('intro section has 2 interactables (welcome + credits)', () => {
    const introItems = layout.interactables.filter(i => i.sectionType === 'intro');
    expect(introItems).toHaveLength(2);
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

describe('LayoutEngine — Platforms', () => {
  const layout = computeWorldLayout(resumeData, sectionConfigs);

  it('generates platforms for skills, featuredWork, certifications, and contact', () => {
    const sectionTypes = new Set(layout.platforms.map(p => p.sectionType));
    expect(sectionTypes.has('skills')).toBe(true);
    expect(sectionTypes.has('featuredWork')).toBe(true);
    expect(sectionTypes.has('certifications')).toBe(true);
    expect(sectionTypes.has('contact')).toBe(true);
  });

  it('does NOT generate platforms for intro or career', () => {
    const introPlatforms = layout.platforms.filter(p => p.sectionType === 'intro');
    const careerPlatforms = layout.platforms.filter(p => p.sectionType === 'career');
    expect(introPlatforms).toHaveLength(0);
    expect(careerPlatforms).toHaveLength(0);
  });

  it('all platforms are within their section bounds', () => {
    for (const platform of layout.platforms) {
      const section = layout.sections.find(s => s.type === platform.sectionType);
      expect(section).toBeDefined();
      expect(platform.x).toBeGreaterThanOrEqual(section!.startX);
      expect(platform.x + platform.width).toBeLessThanOrEqual(section!.endX);
    }
  });

  it('all platforms are above their section ground', () => {
    for (const platform of layout.platforms) {
      const section = layout.sections.find(s => s.type === platform.sectionType);
      expect(section).toBeDefined();
      expect(platform.y).toBeLessThan(section!.groundY);
    }
  });

  it('all platforms are reachable by a single jump', () => {
    // Max jump height = v^2 / (2*g) from ground
    const maxJumpHeight = (PLAYER_JUMP_VELOCITY * PLAYER_JUMP_VELOCITY) / (2 * GRAVITY);
    for (const platform of layout.platforms) {
      const section = layout.sections.find(s => s.type === platform.sectionType);
      const sectionGroundY = section ? section.groundY : GROUND_Y;
      const heightAboveGround = sectionGroundY - platform.y;
      expect(heightAboveGround).toBeLessThanOrEqual(maxJumpHeight);
    }
  });

  it('all platform IDs are unique', () => {
    const ids = layout.platforms.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all sections have a biome field', () => {
    for (const section of layout.sections) {
      expect(section.biome).toBeDefined();
      expect(['city', 'circuit', 'gallery', 'campus', 'park']).toContain(section.biome);
    }
  });

  it('interactable Y matches its section groundY', () => {
    for (const item of layout.interactables) {
      const section = layout.sections.find(s => s.type === item.sectionType);
      expect(section).toBeDefined();
      expect(item.y).toBe(section!.groundY);
    }
  });
});

describe('getGroundYAtX', () => {
  const sections: SectionBounds[] = [
    { type: 'intro', label: 'Welcome', startX: 0, endX: 1000, themeColor: 0, decorationSet: 'office', biome: 'city', groundY: 520 },
    { type: 'skills', label: 'Skills', startX: 1000, endX: 2000, themeColor: 0, decorationSet: 'circuit', biome: 'circuit', groundY: 470 },
    { type: 'contact', label: 'Contact', startX: 2000, endX: 3000, themeColor: 0, decorationSet: 'park', biome: 'park', groundY: 550 },
  ];

  it('returns flat groundY in the middle of a section', () => {
    expect(getGroundYAtX(500, sections)).toBe(520);
    expect(getGroundYAtX(1500, sections)).toBe(470);
    expect(getGroundYAtX(2500, sections)).toBe(550);
  });

  it('interpolates at section boundary', () => {
    const halfTrans = TRANSITION_WIDTH / 2;
    // Midpoint of transition at boundary x=1000
    const midY = getGroundYAtX(1000, sections);
    // Should be halfway between 520 and 470
    expect(midY).toBeCloseTo(495, 0);
    // At start of transition
    expect(getGroundYAtX(1000 - halfTrans, sections)).toBeCloseTo(520, 0);
    // At end of transition
    expect(getGroundYAtX(1000 + halfTrans, sections)).toBeCloseTo(470, 0);
  });

  it('clamps at edges', () => {
    expect(getGroundYAtX(-100, sections)).toBe(520);
    expect(getGroundYAtX(5000, sections)).toBe(550);
  });

  it('returns GROUND_Y for empty sections', () => {
    expect(getGroundYAtX(500, [])).toBe(GROUND_Y);
  });
});

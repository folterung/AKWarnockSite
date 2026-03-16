import type { SectionConfig } from '../types/world';
import { COLORS, SECTION_GROUND_Y } from '../constants';

export const sectionConfigs: SectionConfig[] = [
  {
    type: 'intro',
    widthPx: 1200,
    themeColor: COLORS.introTheme,
    label: 'Welcome',
    decorationSet: 'office',
    groundY: SECTION_GROUND_Y.intro,
  },
  {
    type: 'career',
    widthPx: 7800,
    themeColor: COLORS.careerTheme,
    label: 'Career Timeline',
    decorationSet: 'office',
    groundY: SECTION_GROUND_Y.career,
  },
  {
    type: 'skills',
    widthPx: 2400,
    themeColor: COLORS.skillsTheme,
    label: 'Technical Strengths',
    decorationSet: 'circuit',
    groundY: SECTION_GROUND_Y.skills,
  },
  {
    type: 'featuredWork',
    widthPx: 4800,
    themeColor: COLORS.featuredTheme,
    label: 'Featured Work',
    decorationSet: 'gallery',
    groundY: SECTION_GROUND_Y.featuredWork,
  },
  {
    type: 'certifications',
    widthPx: 2000,
    themeColor: COLORS.certsTheme,
    label: 'Certifications & Education',
    decorationSet: 'campus',
    groundY: SECTION_GROUND_Y.certifications,
  },
  {
    type: 'contact',
    widthPx: 1200,
    themeColor: COLORS.contactTheme,
    label: 'Get In Touch',
    decorationSet: 'park',
    groundY: SECTION_GROUND_Y.contact,
  },
];

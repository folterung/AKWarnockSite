import type { SectionConfig } from '../types/world';
import { COLORS } from '../constants';

export const sectionConfigs: SectionConfig[] = [
  {
    type: 'intro',
    widthPx: 1200,
    themeColor: COLORS.introTheme,
    label: 'Welcome',
    decorationSet: 'office',
  },
  {
    type: 'career',
    widthPx: 4800,
    themeColor: COLORS.careerTheme,
    label: 'Career Timeline',
    decorationSet: 'office',
  },
  {
    type: 'skills',
    widthPx: 2400,
    themeColor: COLORS.skillsTheme,
    label: 'Technical Strengths',
    decorationSet: 'circuit',
  },
  {
    type: 'featuredWork',
    widthPx: 1800,
    themeColor: COLORS.featuredTheme,
    label: 'Featured Work',
    decorationSet: 'gallery',
  },
  {
    type: 'certifications',
    widthPx: 2000,
    themeColor: COLORS.certsTheme,
    label: 'Certifications & Education',
    decorationSet: 'campus',
  },
  {
    type: 'contact',
    widthPx: 1200,
    themeColor: COLORS.contactTheme,
    label: 'Get In Touch',
    decorationSet: 'park',
  },
];

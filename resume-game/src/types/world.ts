export type SectionType =
  | 'intro'
  | 'career'
  | 'independentProjects'
  | 'skills'
  | 'featuredWork'
  | 'certifications'
  | 'contact';

export type DecorationSet =
  | 'office'
  | 'circuit'
  | 'gallery'
  | 'campus'
  | 'park'
  | 'workshop';

export type BiomeType = 'city' | 'circuit' | 'gallery' | 'campus' | 'park' | 'workshop';

export interface WorldPlatform {
  id: string;
  x: number;       // left edge
  y: number;       // top surface (player lands here)
  width: number;
  height: number;  // visual thickness (24px)
  sectionType: SectionType;
  biome: BiomeType;
}

export interface SectionConfig {
  type: SectionType;
  widthPx: number;
  themeColor: number;
  label: string;
  decorationSet: DecorationSet;
  groundY?: number;
}

export interface SectionBounds {
  type: SectionType;
  label: string;
  startX: number;
  endX: number;
  themeColor: number;
  decorationSet: DecorationSet;
  biome: BiomeType;
  groundY: number;
}

export interface WorldInteractable {
  id: string;
  x: number;
  y: number;
  sectionType: SectionType;
  objectType: InteractableObjectType;
  label: string;
  modalContent: ModalContent;
}

export type InteractableObjectType =
  | 'welcome_sign'
  | 'desk'
  | 'terminal'
  | 'trophy'
  | 'diploma'
  | 'mailbox'
  | 'credits_podium';

export interface ModalContent {
  title: string;
  subtitle?: string;
  body: string;
  tags?: string[];
  links?: { label: string; url: string }[];
}

export interface WorldDecoration {
  x: number;
  y: number;
  type: string;
  sectionType: SectionType;
  scale?: number;
}

export interface WorldLayout {
  totalWidth: number;
  groundY: number;
  sections: SectionBounds[];
  interactables: WorldInteractable[];
  decorations: WorldDecoration[];
  platforms: WorldPlatform[];
  spawnX: number;
  spawnY: number;
}

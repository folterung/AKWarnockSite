export type SectionType =
  | 'intro'
  | 'career'
  | 'skills'
  | 'featuredWork'
  | 'certifications'
  | 'contact';

export type DecorationSet =
  | 'office'
  | 'circuit'
  | 'gallery'
  | 'campus'
  | 'park';

export interface SectionConfig {
  type: SectionType;
  widthPx: number;
  themeColor: number;
  label: string;
  decorationSet: DecorationSet;
}

export interface SectionBounds {
  type: SectionType;
  label: string;
  startX: number;
  endX: number;
  themeColor: number;
  decorationSet: DecorationSet;
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
  | 'mailbox';

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
  spawnX: number;
  spawnY: number;
}

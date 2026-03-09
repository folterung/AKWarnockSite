export interface WorkExperience {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  highlights: string[];
  technologies: string[];
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: 'expert' | 'advanced' | 'proficient';
}

export type SkillCategory =
  | 'languages'
  | 'frontend'
  | 'backend'
  | 'cloud'
  | 'practices';

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: number;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  year: number;
}

export interface FeaturedWork {
  id: string;
  title: string;
  description: string;
  impact: string;
  technologies: string[];
}

export interface ContactLink {
  id: string;
  type: 'linkedin' | 'github' | 'email';
  label: string;
  url: string;
}

export interface ResumeData {
  name: string;
  title: string;
  tagline: string;
  summary: string;
  experience: WorkExperience[];
  skills: Skill[];
  certifications: Certification[];
  education: Education[];
  featuredWork: FeaturedWork[];
  contact: ContactLink[];
}

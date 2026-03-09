import type { ResumeData, Skill, SkillCategory } from '../types/resume';
import type {
  SectionConfig,
  WorldLayout,
  SectionBounds,
  WorldInteractable,
  WorldDecoration,
  InteractableObjectType,
  ModalContent,
  SectionType,
} from '../types/world';
import { GROUND_Y } from '../constants';

export function computeWorldLayout(
  data: ResumeData,
  configs: SectionConfig[]
): WorldLayout {
  const sections = computeSectionBounds(configs);
  const interactables = computeInteractables(data, sections);
  const decorations = computeDecorations(sections);
  const totalWidth = sections.length > 0
    ? sections[sections.length - 1].endX
    : 0;

  return {
    totalWidth,
    groundY: GROUND_Y,
    sections,
    interactables,
    decorations,
    spawnX: 200,
    spawnY: GROUND_Y - 48,
  };
}

function computeSectionBounds(configs: SectionConfig[]): SectionBounds[] {
  let currentX = 0;
  return configs.map(config => {
    const bounds: SectionBounds = {
      type: config.type,
      label: config.label,
      startX: currentX,
      endX: currentX + config.widthPx,
      themeColor: config.themeColor,
      decorationSet: config.decorationSet,
    };
    currentX += config.widthPx;
    return bounds;
  });
}

function computeInteractables(
  data: ResumeData,
  sections: SectionBounds[]
): WorldInteractable[] {
  const interactables: WorldInteractable[] = [];

  for (const section of sections) {
    switch (section.type) {
      case 'intro':
        interactables.push(
          ...createIntroInteractables(data, section)
        );
        break;
      case 'career':
        interactables.push(
          ...createCareerInteractables(data.experience, section)
        );
        break;
      case 'skills':
        interactables.push(
          ...createSkillInteractables(data.skills, section)
        );
        break;
      case 'featuredWork':
        interactables.push(
          ...createFeaturedWorkInteractables(data.featuredWork, section)
        );
        break;
      case 'certifications':
        interactables.push(
          ...createCertEducationInteractables(
            data.certifications,
            data.education,
            section
          )
        );
        break;
      case 'contact':
        interactables.push(
          ...createContactInteractables(data.contact, section)
        );
        break;
    }
  }

  return interactables;
}

function distributePositions(
  count: number,
  section: SectionBounds,
  padding: number = 200
): number[] {
  if (count === 0) return [];
  if (count === 1) return [(section.startX + section.endX) / 2];

  const usableWidth = (section.endX - section.startX) - padding * 2;
  const spacing = usableWidth / (count - 1);
  return Array.from({ length: count }, (_, i) => section.startX + padding + i * spacing);
}

function createIntroInteractables(
  data: ResumeData,
  section: SectionBounds
): WorldInteractable[] {
  const x = (section.startX + section.endX) / 2;
  return [
    {
      id: 'intro-welcome',
      x,
      y: GROUND_Y,
      sectionType: 'intro',
      objectType: 'welcome_sign',
      label: 'Welcome',
      modalContent: {
        title: data.name,
        subtitle: data.title,
        body: `${data.summary}\n\n**Controls:** Arrow keys or WASD to move, Space to jump, E to interact.\n\nWalk right to explore my career journey!`,
      },
    },
  ];
}

function createCareerInteractables(
  experience: ResumeData['experience'],
  section: SectionBounds
): WorldInteractable[] {
  const positions = distributePositions(experience.length, section);
  return experience.map((exp, i) => ({
    id: exp.id,
    x: positions[i],
    y: GROUND_Y,
    sectionType: 'career' as SectionType,
    objectType: 'desk' as InteractableObjectType,
    label: exp.company,
    modalContent: buildExperienceModal(exp),
  }));
}

function buildExperienceModal(exp: ResumeData['experience'][0]): ModalContent {
  const highlights = exp.highlights.map(h => `- ${h}`).join('\n');
  return {
    title: exp.company,
    subtitle: `${exp.title} | ${exp.startDate} - ${exp.endDate}`,
    body: `**${exp.location}**\n\n${highlights}`,
    tags: exp.technologies,
  };
}

function createSkillInteractables(
  skills: ResumeData['skills'],
  section: SectionBounds
): WorldInteractable[] {
  const categories: SkillCategory[] = ['languages', 'frontend', 'backend', 'cloud', 'practices'];
  const grouped = new Map<SkillCategory, Skill[]>();
  for (const skill of skills) {
    if (!grouped.has(skill.category)) grouped.set(skill.category, []);
    grouped.get(skill.category)!.push(skill);
  }

  const activeCategories = categories.filter(c => grouped.has(c));
  const positions = distributePositions(activeCategories.length, section);

  return activeCategories.map((category, i) => {
    const categorySkills = grouped.get(category)!;
    const categoryLabels: Record<SkillCategory, string> = {
      languages: 'Programming Languages',
      frontend: 'Frontend',
      backend: 'Backend & Data',
      cloud: 'Cloud & Infrastructure',
      practices: 'Practices & Tools',
    };

    const body = categorySkills
      .map(s => `- **${s.name}** (${s.level})`)
      .join('\n');

    return {
      id: `skill-cat-${category}`,
      x: positions[i],
      y: GROUND_Y,
      sectionType: 'skills' as SectionType,
      objectType: 'terminal' as InteractableObjectType,
      label: categoryLabels[category],
      modalContent: {
        title: categoryLabels[category],
        body,
      },
    };
  });
}

function createFeaturedWorkInteractables(
  featuredWork: ResumeData['featuredWork'],
  section: SectionBounds
): WorldInteractable[] {
  const positions = distributePositions(featuredWork.length, section);
  return featuredWork.map((work, i) => ({
    id: work.id,
    x: positions[i],
    y: GROUND_Y,
    sectionType: 'featuredWork' as SectionType,
    objectType: 'trophy' as InteractableObjectType,
    label: work.title,
    modalContent: {
      title: work.title,
      body: `${work.description}\n\n**Impact:** ${work.impact}`,
      tags: work.technologies,
    },
  }));
}

function createCertEducationInteractables(
  certs: ResumeData['certifications'],
  education: ResumeData['education'],
  section: SectionBounds
): WorldInteractable[] {
  const totalCount = certs.length + education.length;
  const positions = distributePositions(totalCount, section);

  const certInteractables: WorldInteractable[] = certs.map((cert, i) => ({
    id: cert.id,
    x: positions[i],
    y: GROUND_Y,
    sectionType: 'certifications' as SectionType,
    objectType: 'diploma' as InteractableObjectType,
    label: cert.name,
    modalContent: {
      title: cert.name,
      subtitle: `${cert.issuer} | ${cert.year}`,
      body: `Professional certification from ${cert.issuer}, earned in ${cert.year}.`,
    },
  }));

  const eduInteractables: WorldInteractable[] = education.map((edu, i) => ({
    id: edu.id,
    x: positions[certs.length + i],
    y: GROUND_Y,
    sectionType: 'certifications' as SectionType,
    objectType: 'diploma' as InteractableObjectType,
    label: edu.institution,
    modalContent: {
      title: edu.institution,
      subtitle: `${edu.degree} in ${edu.field} | ${edu.year}`,
      body: `${edu.degree} in ${edu.field} from ${edu.institution}, graduated ${edu.year}.`,
    },
  }));

  return [...certInteractables, ...eduInteractables];
}

function computeDecorations(sections: SectionBounds[]): WorldDecoration[] {
  const decorations: WorldDecoration[] = [];
  const decorationTypes: Record<string, string[]> = {
    office: ['plant', 'lamp', 'bookshelf'],
    circuit: ['server', 'lamp'],
    gallery: ['plant', 'lamp'],
    campus: ['tree', 'lamp', 'bookshelf'],
    park: ['tree', 'plant'],
  };

  for (const section of sections) {
    const types = decorationTypes[section.decorationSet] || ['plant'];
    const sectionWidth = section.endX - section.startX;
    const count = Math.floor(sectionWidth / 300);

    for (let i = 0; i < count; i++) {
      const x = section.startX + 150 + (i * sectionWidth) / count;
      decorations.push({
        x,
        y: GROUND_Y,
        type: types[i % types.length],
        sectionType: section.type,
        scale: 0.8 + Math.random() * 0.4,
      });
    }
  }

  return decorations;
}

function createContactInteractables(
  contacts: ResumeData['contact'],
  section: SectionBounds
): WorldInteractable[] {
  const positions = distributePositions(contacts.length, section);
  return contacts.map((contact, i) => ({
    id: contact.id,
    x: positions[i],
    y: GROUND_Y,
    sectionType: 'contact' as SectionType,
    objectType: 'mailbox' as InteractableObjectType,
    label: contact.label,
    modalContent: {
      title: contact.label,
      body: `Connect with Kevin on ${contact.label}.`,
      links: [{ label: `Open ${contact.label}`, url: contact.url }],
    },
  }));
}

import type { ResumeData } from '../types/resume';

export const resumeData: ResumeData = {
  name: 'Kevin Warnock',
  title: 'Senior Software Engineer',
  tagline: 'Full-Stack Engineer | Cloud Architecture | Team Leadership',
  summary:
    'Senior Software Engineer with 10+ years of experience building scalable web applications, cloud infrastructure, and leading engineering teams. Passionate about clean architecture, developer experience, and delivering impactful products.',

  experience: [
    {
      id: 'exp-1',
      company: 'Capital One',
      title: 'Senior Software Engineer',
      location: 'McLean, VA',
      startDate: '2021',
      endDate: 'Present',
      highlights: [
        'Led development of customer-facing banking applications serving millions of users',
        'Architected microservices platform reducing deployment time by 60%',
        'Mentored team of 5 engineers, establishing code review and testing standards',
        'Implemented CI/CD pipelines and infrastructure-as-code with AWS CDK',
      ],
      technologies: ['React', 'TypeScript', 'Node.js', 'AWS', 'Java', 'Kubernetes'],
    },
    {
      id: 'exp-2',
      company: 'Booz Allen Hamilton',
      title: 'Senior Consultant / Lead Engineer',
      location: 'McLean, VA',
      startDate: '2019',
      endDate: '2021',
      highlights: [
        'Led full-stack development for federal agency modernization projects',
        'Designed cloud migration strategies for legacy systems',
        'Built real-time data visualization dashboards for mission-critical operations',
        'Managed Agile ceremonies and sprint planning for cross-functional teams',
      ],
      technologies: ['Angular', 'Python', 'AWS', 'Docker', 'PostgreSQL', 'Terraform'],
    },
    {
      id: 'exp-3',
      company: 'Deloitte',
      title: 'Software Engineer Consultant',
      location: 'Arlington, VA',
      startDate: '2017',
      endDate: '2019',
      highlights: [
        'Developed enterprise web applications for Fortune 500 clients',
        'Built RESTful APIs and microservices handling high-volume transactions',
        'Implemented automated testing frameworks increasing code coverage to 90%',
        'Collaborated with stakeholders to translate business requirements into technical solutions',
      ],
      technologies: ['Java', 'Spring Boot', 'React', 'Oracle DB', 'Jenkins', 'REST APIs'],
    },
    {
      id: 'exp-4',
      company: 'SAIC',
      title: 'Software Developer',
      location: 'Fairfax, VA',
      startDate: '2016',
      endDate: '2017',
      highlights: [
        'Developed secure web applications for defense and intelligence community',
        'Implemented data processing pipelines for large-scale analytics',
        'Created interactive dashboards using modern JavaScript frameworks',
        'Maintained compliance with security protocols and government standards',
      ],
      technologies: ['JavaScript', 'Java', 'Python', 'Elasticsearch', 'D3.js', 'Linux'],
    },
    {
      id: 'exp-5',
      company: 'Leidos',
      title: 'Associate Software Engineer',
      location: 'Reston, VA',
      startDate: '2015',
      endDate: '2016',
      highlights: [
        'Built web-based tools for intelligence analysis workflows',
        'Developed geospatial visualization components',
        'Contributed to Agile development process improvements',
        'Participated in code reviews and knowledge sharing sessions',
      ],
      technologies: ['JavaScript', 'Java', 'GIS', 'HTML/CSS', 'SQL', 'Git'],
    },
    {
      id: 'exp-6',
      company: 'General Dynamics IT',
      title: 'Junior Software Developer',
      location: 'Fairfax, VA',
      startDate: '2014',
      endDate: '2015',
      highlights: [
        'Supported development of enterprise content management systems',
        'Created automated reports and data migration scripts',
        'Assisted senior engineers with application maintenance and bug fixes',
        'Learned enterprise software development practices and methodologies',
      ],
      technologies: ['Java', 'SQL', 'JavaScript', 'HTML/CSS', 'Tomcat', 'SVN'],
    },
    {
      id: 'exp-7',
      company: 'Freelance / Personal Projects',
      title: 'Full-Stack Developer',
      location: 'Remote',
      startDate: '2013',
      endDate: '2014',
      highlights: [
        'Built custom web applications for small business clients',
        'Developed responsive websites and e-commerce platforms',
        'Managed full project lifecycle from requirements to deployment',
        'Gained hands-on experience across the full technology stack',
      ],
      technologies: ['PHP', 'MySQL', 'jQuery', 'WordPress', 'Bootstrap', 'cPanel'],
    },
    {
      id: 'exp-8',
      company: 'University IT Department',
      title: 'Student Developer / IT Intern',
      location: 'University',
      startDate: '2012',
      endDate: '2013',
      highlights: [
        'Developed internal tools for campus IT operations',
        'Provided technical support and system administration',
        'Created documentation for IT processes and procedures',
        'First professional software development experience',
      ],
      technologies: ['Python', 'Bash', 'HTML/CSS', 'Linux', 'Active Directory'],
    },
  ],

  skills: [
    { id: 'skill-1', name: 'TypeScript', category: 'languages', level: 'expert' },
    { id: 'skill-2', name: 'JavaScript', category: 'languages', level: 'expert' },
    { id: 'skill-3', name: 'Java', category: 'languages', level: 'advanced' },
    { id: 'skill-4', name: 'Python', category: 'languages', level: 'advanced' },
    { id: 'skill-5', name: 'React', category: 'frontend', level: 'expert' },
    { id: 'skill-6', name: 'Angular', category: 'frontend', level: 'advanced' },
    { id: 'skill-7', name: 'Next.js', category: 'frontend', level: 'advanced' },
    { id: 'skill-8', name: 'Node.js', category: 'backend', level: 'expert' },
    { id: 'skill-9', name: 'Spring Boot', category: 'backend', level: 'advanced' },
    { id: 'skill-10', name: 'PostgreSQL', category: 'backend', level: 'advanced' },
    { id: 'skill-11', name: 'AWS', category: 'cloud', level: 'expert' },
    { id: 'skill-12', name: 'Docker', category: 'cloud', level: 'advanced' },
    { id: 'skill-13', name: 'Kubernetes', category: 'cloud', level: 'proficient' },
    { id: 'skill-14', name: 'CI/CD & DevOps', category: 'practices', level: 'expert' },
  ],

  certifications: [
    { id: 'cert-1', name: 'AWS Solutions Architect Associate', issuer: 'Amazon Web Services', year: 2022 },
    { id: 'cert-2', name: 'AWS Developer Associate', issuer: 'Amazon Web Services', year: 2021 },
    { id: 'cert-3', name: 'Certified Kubernetes Administrator', issuer: 'CNCF', year: 2023 },
    { id: 'cert-4', name: 'Professional Scrum Master I', issuer: 'Scrum.org', year: 2020 },
    { id: 'cert-5', name: 'CompTIA Security+', issuer: 'CompTIA', year: 2019 },
  ],

  education: [
    {
      id: 'edu-1',
      institution: 'George Mason University',
      degree: 'Master of Science',
      field: 'Computer Science',
      year: 2016,
    },
    {
      id: 'edu-2',
      institution: 'Virginia Tech',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      year: 2013,
    },
  ],

  featuredWork: [
    {
      id: 'feat-1',
      title: 'Cloud Migration at Scale',
      description:
        'Led the migration of 20+ legacy applications to AWS, establishing patterns and automation that became the standard for the organization.',
      impact: 'Reduced infrastructure costs by 40% and improved deployment frequency from monthly to daily.',
      technologies: ['AWS CDK', 'Terraform', 'Docker', 'CI/CD'],
    },
    {
      id: 'feat-2',
      title: 'Real-Time Analytics Dashboard',
      description:
        'Built a real-time data visualization platform processing millions of events per day for mission-critical decision making.',
      impact: 'Enabled real-time operational awareness, reducing response time to critical events by 75%.',
      technologies: ['React', 'D3.js', 'WebSockets', 'Elasticsearch'],
    },
    {
      id: 'feat-3',
      title: 'Developer Experience Platform',
      description:
        'Created an internal developer platform with shared component libraries, project templates, and automated tooling.',
      impact: 'Reduced new project setup time from 2 weeks to 2 hours across 50+ developers.',
      technologies: ['TypeScript', 'React', 'Storybook', 'GitHub Actions'],
    },
  ],

  contact: [
    {
      id: 'contact-linkedin',
      type: 'linkedin',
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/in/kevin-warnock-44b78484/',
    },
    {
      id: 'contact-github',
      type: 'github',
      label: 'GitHub',
      url: 'https://github.com/folterung',
    },
    {
      id: 'contact-email',
      type: 'email',
      label: 'Email',
      url: 'mailto:contact@akwarnock.com',
    },
  ],
};

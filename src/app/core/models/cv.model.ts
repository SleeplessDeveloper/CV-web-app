export interface CVData {
  personalInfo: PersonalInfo;
  summary: string;
  yearsExperience: number;
  keySkills: string[];
  skills: SkillCategory[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
  certifications: string[];
}

export interface PersonalInfo {
  name: string;
  title: string;
  tagline: string;
  location: string;
  phone: string;
  email: string;
  linkedin: string;
  github: string;
  image: string;
}

/**
 * A named group of skills. Array order is presentation order — the skills
 * section renders `name` as its heading, so adding or renaming a category is a
 * data-only change.
 */
export interface SkillCategory {
  name: string;
  items: string[];
}

export interface Experience {
  title: string;
  company: string;
  period: string;
  responsibilities: Responsibility[];
}

export interface Responsibility {
  /** Omitted for ungrouped bullets. The template renders the heading only when present. */
  category?: string;
  items: string[];
}

export interface Education {
  degree: string;
  institution: string;
  date: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  highlights: string[];
}

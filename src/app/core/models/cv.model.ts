export interface CVData {
  personalInfo: PersonalInfo;
  summary: string;
  skills: Skills;
  experience: Experience[];
  education: Education[];
  projects: Project[];
  certifications: string[];
}

export interface PersonalInfo {
  name: string;
  title: string;
  location: string;
  phone: string;
  email: string;
  linkedin: string;
  github: string;
  image: string;
}

export interface Skills {
  languages: string[];
  webTech: string[];
  frameworks: string[];
  databases: string[];
  devOps: string[];
  methodologies: string[];
}

export interface Experience {
  title: string;
  company: string;
  period: string;
  responsibilities: Responsibility[];
}

export interface Responsibility {
  category: string;
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

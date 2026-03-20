import { Injectable } from '@angular/core';
import { CVData } from '../models/cv.model';

@Injectable({
  providedIn: 'root'
})
export class CvDataService {
  private cvData: CVData = {
    personalInfo: {
      name: 'Siphephelo Sibanyoni',
      title: 'Software Development Engineer',
      location: 'Centurion, Gauteng',
      phone: '+27 76 788 1556',
      email: 'siphefanasibanyoni@gmail.com',
      linkedin: 'https://www.linkedin.com/in/siphephelo-sibanyoni-b89a43298',
      github: 'https://github.com/SleeplessDeveloper',
      image: 'images/Me 2.jpg'
    },
    summary: 'Results-oriented Software Development Engineer with demonstrated expertise in full-stack development using Angular, C#, TypeScript, .NET Core, and PostgreSQL. Adept at rapidly acquiring new technologies and implementing agile methodologies to deliver scalable, high-quality software solutions.',
    skills: {
      languages: ['C#', 'TypeScript', 'JavaScript', 'Python', 'SQL'],
      webTech: ['HTML5', 'CSS', 'RESTful APIs', 'JSON'],
      frameworks: ['Angular 18', '.NET Core', 'Node.js', 'Entity Framework', 'Xunit', 'NUnit', 'Selenium'],
      databases: ['PostgreSQL', 'SQL Server', 'SQLite'],
      devOps: ['Git', 'Azure DevOps', 'CI/CD', 'Postman', 'Visual Studio', 'VS Code'],
      methodologies: ['Agile', 'Scrum', 'CQRS', 'Clean Architecture', 'TDD', 'DDD']
    },
    experience: [
      {
        title: 'Junior Developer',
        company: 'Adapt IT',
        period: 'July 2024 - Present',
        responsibilities: [
          {
            category: 'Angular Development',
            items: [
              'Implemented responsive UI components using Angular 18 and TypeScript',
              'Optimized frontend performance with lazy loading and state management',
              'Created reusable Angular components and services',
              'Integrated third-party libraries and APIs'
            ]
          },
          {
            category: 'Backend Development',
            items: [
              'Developed RESTful APIs using C# and .NET Core with clean architecture',
              'Implemented CQRS pattern for complex business logic',
              'Designed and optimized PostgreSQL database schemas',
              'Created automated CI/CD pipelines using Azure DevOps'
            ]
          },
          {
            category: 'Database Management',
            items: [
              'Engineered efficient PostgreSQL schemas and stored procedures',
              'Implemented data migration strategies',
              'Developed database backup and recovery procedures',
              'Optimized performance through indexing and query refactoring'
            ]
          }
        ]
      },
      {
        title: 'Graduate Developer',
        company: 'Adapt IT',
        period: 'July 2023 - June 2024',
        responsibilities: [
          {
            category: 'Design',
            items: [
              'Collaborated with UI/UX teams for design validation',
              'Implemented design-driven development using .NET and Angular 16',
              'Performed database analysis for entity relationships',
              'Participated in Design-Thinking-Workshops'
            ]
          },
          {
            category: 'Development',
            items: [
              'Developed RESTful APIs with CQRS and onion architecture',
              'Utilized version control for CI/CD',
              'Applied agile methodology for sprint completion',
              'Debugged and resolved software defects'
            ]
          },
          {
            category: 'Testing',
            items: [
              'Created unit tests using Xunit/NUnit',
              'Engineered autonomous test engine for overnight execution',
              'Improved uptime and reduced support queries'
            ]
          }
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor\'s Degree in Computer and Information Sciences',
        institution: 'Varsity College, Sandton',
        date: 'December 2021'
      },
      {
        degree: 'Diploma in Information Technology (Software Development)',
        institution: 'Varsity College, Pretoria',
        date: 'December 2019'
      }
    ],
    projects: [
      {
        name: 'Infinity - Applications Module',
        description: 'Applications analytics endpoint with comprehensive data visualization',
        technologies: ['Angular', 'C#', '.NET Core', 'PostgreSQL', 'Azure DevOps'],
        highlights: [
          'Developed analytics endpoint for campus and qualification metrics',
          'Implemented code refactoring and comprehensive unit tests',
          'Design-driven development for optimal UX',
          'Backend caching for faster API response times'
        ]
      },
      {
        name: 'Infinity - Registrations Module',
        description: 'Cross-system communication platform for student registrations',
        technologies: ['Angular', 'PostgreSQL', 'CQRS', 'Multi-threading'],
        highlights: [
          'Created table schemas in PostgreSQL',
          'Implemented dependency injection with CQRS pattern',
          'Multi-thread solutions for improved data processing',
          'State management with behaviour subjects'
        ]
      },
      {
        name: 'Task-Wyze',
        description: 'Full-stack enterprise task management application',
        technologies: ['Angular 16', 'C#', 'SQL', 'RESTful APIs'],
        highlights: [
          'Built complete task management system',
          'RESTful APIs for seamless communication',
          'Automated testing suite for reliability'
        ]
      }
    ],
    certifications: [
      'ASP.NET Core - Solid and Clean Architecture',
      'Azure DevOps Boards for Project Managers',
      'Git and Visual Studio with Azure DevOps',
      'OpenAPI: Beginner to Guru',
      'Selenium WebDriver with C#',
      'SQL & PostgreSQL for Beginners'
    ]
  };

  getCVData(): CVData {
    return this.cvData;
  }
}

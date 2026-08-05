import { Injectable } from '@angular/core';
import { CVData } from '../models/cv.model';

/**
 * Site CV content, transcribed from the reference CV.
 *
 * The reference document is the source of truth — see docs/cv-source.md for its
 * location and the refresh procedure. Do not edit content here without updating
 * that document, or the two will drift.
 */
@Injectable({
  providedIn: 'root'
})
export class CvDataService {
  private cvData: CVData = {
    personalInfo: {
      name: 'Siphephelo Sibanyoni',
      title: 'Software Developer',
      tagline: 'Full-Stack Developer | Angular & React | .NET & Java/Spring Boot | Agentic AI',
      location: 'Centurion, Gauteng',
      phone: '+27 76 788 1556',
      email: 'siphefanasibanyoni@gmail.com',
      linkedin: 'https://www.linkedin.com/in/siphephelo-sibanyoni-b89a43298',
      github: 'https://github.com/SleeplessDeveloper',
      image: 'images/Me 2.jpg'
    },
    summary: 'Full-stack Software Developer with 3 years of experience building production web applications across .NET 8/C# and Java 17/21 (Spring Boot), with Angular (12–21, NgRx) and React front ends, over PostgreSQL/Oracle data stores, RabbitMQ/Kafka microservices, and Azure DevOps CI/CD. Resolved production performance incidents through query refactoring and caching, and led SonarQube-driven code-quality initiatives across several codebases. Recently shipped agentic AI features — human-in-the-loop workflows on .NET 8/Angular 20 with Temporal orchestration and AWS Bedrock, plus a vendor-agnostic Ollama/OpenAI LLM integration — and is looking to bring full-stack and applied-AI engineering skills to a growing development team.',
    yearsExperience: 3,
    keySkills: [
      'Angular (12–21)', 'NgRx', 'RxJS', 'React 18', 'TypeScript', 'JavaScript', 'C#', '.NET 8',
      'ASP.NET Core', 'Java 17/21', 'Spring Boot 3', 'Spring WebFlux', 'PostgreSQL',
      'Oracle (PL/SQL)', 'SQL Server', 'REST APIs', 'CQRS/MediatR', 'Microservices', 'RabbitMQ',
      'Apache Kafka', 'Docker', 'Azure DevOps', 'CI/CD', 'JWT/OAuth2', 'BCrypt', 'AI/LLM Agents',
      'AWS Bedrock', 'Ollama', 'OpenAI', 'Temporal', 'SonarQube', 'Unit & Integration Testing',
      'Agile/Scrum', 'Clean Architecture', 'SOLID Principles'
    ],
    skills: [
      {
        name: 'Programming Languages',
        items: ['C#', 'Java', 'TypeScript', 'JavaScript', 'Python', 'SQL']
      },
      {
        name: 'Frontend Frameworks & Libraries',
        items: ['Angular 12–21', 'NgRx', 'RxJS', 'Angular Material', 'React 18 (Vite)', 'Angular SSR/PWA']
      },
      {
        name: 'Backend Frameworks & Libraries',
        items: [
          'ASP.NET Core (.NET 8)', 'Entity Framework Core', 'MediatR/CQRS', 'Dapper/Npgsql',
          'Spring Boot 3', 'Spring WebFlux', 'MapStruct'
        ]
      },
      {
        name: 'Databases',
        items: [
          'PostgreSQL', 'Oracle (PL/SQL)', 'SQL Server', 'SQLite', 'RavenDB', 'Liquibase',
          'EF Core Migrations'
        ]
      },
      {
        name: 'Messaging & Async',
        items: [
          'RabbitMQ', 'Apache Kafka', 'SignalR/WebSockets', 'Hangfire', 'Quartz',
          'Temporal (durable workflow orchestration)'
        ]
      },
      {
        name: 'AI / LLM Engineering',
        items: [
          'AWS Bedrock', 'Ollama (local LLM)', 'OpenAI', 'Prompt Engineering',
          'agentic workflows with human-in-the-loop approval gates',
          'AI provider factory/strategy abstraction',
          'OCR (Tesseract, Microblink, Azure OCR, OCR.Space)'
        ]
      },
      {
        name: 'Web Technologies',
        items: ['HTML5', 'CSS3', 'REST APIs', 'JSON', 'OpenAPI/Swagger']
      },
      {
        name: 'Security',
        items: [
          'JWT', 'OAuth2', 'BCrypt password/PIN hashing', 'PII masking',
          'Role-Based Access Control'
        ]
      },
      {
        name: 'Testing',
        items: [
          'xUnit', 'NUnit', 'Moq', 'Jest', 'Jasmine/Karma', 'Selenium',
          'integration testing (Postgres fixtures)', 'E2E testing'
        ]
      },
      {
        name: 'DevOps & Tools',
        items: [
          'Git', 'Azure DevOps (CI/CD, Repos, Boards)', 'Docker', 'SonarQube', 'Postman',
          'Visual Studio', 'Visual Studio Code', 'PgAdmin', 'SQL Server Management Studio',
          'Supabase', 'Kiro', 'Claude Code', 'AmazonQ'
        ]
      },
      {
        name: 'Software Engineering Practices',
        items: [
          'OOP', 'SOLID Principles', 'Clean Code', 'Clean Architecture', 'CQRS',
          'Design-Driven Development', 'AI-Driven Development', 'Debugging', 'Agile/Scrum'
        ]
      }
    ],
    experience: [
      {
        title: 'Software Developer',
        company: 'Adapt IT',
        period: 'July 2024 – Present',
        responsibilities: [
          {
            items: [
              'Build and maintain enterprise web applications for tertiary-education clients using Angular (12–21), TypeScript, C#/.NET 8, Java/Spring Boot, and PostgreSQL/Oracle across multiple microservices.',
              'Design and implement CQRS (MediatR) APIs and RabbitMQ/Kafka-based microservices following Clean Architecture principles.',
              'Resolve production performance incidents, including API gateway timeouts, through query refactoring and caching strategies; lead SonarQube-driven refactoring to reduce cognitive complexity across codebases.',
              'Build agentic AI features — human-in-the-loop workflows and LLM provider integrations (AWS Bedrock, Ollama, OpenAI) — across .NET, Java, Angular and React stacks.',
              'Own CI/CD release promotion across Azure DevOps GitFlow pipelines (Dev → UAT → institution TEST/PROD) for multiple tenant institutions.',
              'Author unit and integration tests (xUnit, Moq, Jest) to protect refactors and new features.',
              'Collaborate within Agile Scrum teams, conducting code reviews, debugging, and root-cause analysis.'
            ]
          }
        ]
      },
      {
        title: 'Graduate Software Developer',
        company: 'Adapt IT',
        period: 'July 2023 – June 2024',
        responsibilities: [
          {
            items: [
              'Developed RESTful APIs and business services using C#, Entity Framework, and PostgreSQL.',
              'Collaborated with UI/UX teams to implement design-driven frontend solutions using Angular.',
              'Authored automated unit tests using xUnit and NUnit to improve software quality.',
              'Participated in sprint planning, backlog refinement, estimation, and Agile ceremonies.',
              'Performed application monitoring, log analysis, troubleshooting, and bug fixing.',
              'Contributed to code reviews and refactoring initiatives to improve maintainability.'
            ]
          }
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Computer and Information Sciences in Application Development',
        institution: 'Varsity College, Sandton',
        date: '2021'
      },
      {
        degree: 'Diploma in Information Technology (Software Development)',
        institution: 'Varsity College, Pretoria',
        date: '2019'
      }
    ],
    projects: [
      {
        name: 'Education – Student Applications System',
        description: 'Next-generation student applications platform (ITS5) for South African tertiary institutions, covering the full applicant journey — registration, document upload, APS calculation, payments and inline submission into the ITS system of record — built with .NET 8 (Clean Architecture, CQRS/MediatR) and Angular 12, with RabbitMQ-based microservices.',
        technologies: [
          '.NET 8', 'Angular 12', 'Clean Architecture', 'CQRS/MediatR', 'RabbitMQ',
          'EF Core', 'xUnit', 'Azure DevOps'
        ],
        highlights: [
          'Designed and shipped application analytics/reporting endpoints (completion, missing-document and payment metrics) and resolved a production gateway-timeout incident by refactoring EF Core queries and introducing in-memory response caching, promoted across multi-tenant DEV→UAT→PROD environments.',
          'Led a SonarQube-driven refactoring effort, reducing cognitive complexity across dozens of queries and commands and splitting controllers via abstract base classes, backed by xUnit/Moq unit tests.',
          'Built an Angular local-storage caching layer for lists-of-values and owned CI/CD GitFlow release promotion across multiple institutional environments in Azure DevOps.'
        ]
      },
      {
        name: 'Education – Student Registrations System',
        description: 'Self-service student registration platform for tertiary institutions and the front end to AdaptIT’s ITS system — covering qualification/subject selection, credit transfers & exemptions, document upload and inline submission into ITS — built with Angular 18 (NgRx) and a .NET/MediatR CQRS API over PostgreSQL.',
        technologies: [
          'Angular 18', 'NgRx', '.NET', 'MediatR/CQRS', 'PostgreSQL', 'Angular Material',
          'SweetAlert2'
        ],
        highlights: [
          'Delivered the full-stack Credit Transfers & Exemptions feature end-to-end, submitting prior-study credits inline to the ITS system via typed HTTP clients.',
          'Built and refactored responsive Angular Material/Bootstrap UI with NgRx state, SweetAlert2 notifications, and form/date validation across desktop and mobile.',
          'Drove a SonarQube-backed testing initiative, authoring unit tests across personal-details, subjects, qualifications and relationships features.'
        ]
      },
      {
        name: 'Education – Alumni',
        description: 'Alumni engagement platform for tertiary institutions — content publishing, a moderated community feed, an alumni talent pool and employment messaging — built as a JHipster application (Angular 19 + Spring Boot 3/Java 17) over Oracle/PL/SQL.',
        technologies: [
          'JHipster', 'Angular 19', 'Spring Boot 3', 'Java 17', 'Oracle (PL/SQL)', 'WebSocket',
          'JWT/OAuth2'
        ],
        highlights: [
          'Top contributor across both repos (96 of 233 commits on the active development repo; initialized and drove the promoted production repo), delivering across the frontend and backend.',
          'Built the Content Hub blog subsystem end-to-end — CRUD REST controllers, a rich-text editor, scheduled publishing and category management — plus a moderated community feed and an alumni Talent Pool with filterable, paginated profiles.',
          'Implemented real-time employment-inbox messaging over WebSocket and an alumni terms-and-conditions/global-settings admin flow, secured with JWT OAuth2.'
        ]
      },
      {
        name: 'Education – TVET Student Success Tracker',
        description: 'AI-assisted student-success and Monitoring & Evaluation platform for TVET colleges, tracking pass/retention/progression/achievement rates and surfacing at-risk students, built with Angular 17 and Spring Boot 3/Java 21 over PostgreSQL.',
        technologies: ['Angular 17', 'Spring Boot 3', 'Java 21', 'PostgreSQL', 'OpenAI', 'Ollama'],
        highlights: [
          'One of the top two contributors overall and the largest contributor to the web app, delivering 20+ merged pull requests across frontend and backend.',
          'Designed and built the analytics/M&E dashboard suite (pass, retention, progression and achievement-rate views) with dynamic filters and CSV export.',
          'Introduced a vendor-agnostic LLM provider layer (interface + factory pattern) enabling the platform to run against OpenAI or a local Ollama model, and migrated the backend to Java 21.'
        ]
      },
      {
        name: 'Education – Student Success Agent',
        description: 'Agentic student early-warning platform: a rules-based risk-scoring agent (GPA + attendance) paired with an AI agent that proposes interventions through human-in-the-loop approval and escalation gates, with full provenance and an audit trail — built with .NET 8, Angular 20, Temporal durable workflow orchestration and AWS Bedrock.',
        technologies: ['.NET 8', 'Angular 20', 'Temporal', 'AWS Bedrock', 'xUnit', 'Docker'],
        highlights: [
          '#1 contributor on the project; built the Risk Queue digital-twin slide-over workspace, combining a risk-trajectory sparkline with a 4-driver provenance breakdown and a case workspace for agent proposals and human approval gates.',
          'Designed the Cases v4 UI, presenting each intervention as a closed-loop "story card" (agent reasoning, gates, action items, timeline, outcome).',
          'Built on a rules-based flow with an LLM-ready seam (interface-abstracted Bedrock composers), PII masking, and a full xUnit unit/integration/E2E test suite in a Dockerised one-command stack.'
        ]
      },
      {
        name: 'ITS Ignite',
        description: 'AI-powered idea and innovation-management platform for AdaptIT’s ITS product suite, with AI duplicate detection, idea grouping, scoring, chat and OCR document ingestion, built with a React 18 (Vite) frontend and a .NET 8 clean-architecture backend over PostgreSQL.',
        technologies: [
          'React 18 (Vite)', '.NET 8', 'Clean Architecture', 'CQRS/MediatR', 'PostgreSQL',
          'EF Core', 'JWT', 'OCR'
        ],
        highlights: [
          'Established the backend foundation — the layered API/Core/Context/Domain solution, CQRS/MediatR, EF Core + PostgreSQL and the initial migration pipeline.',
          'Implemented authentication and role-based access control (JWT), including the signup flow and role-driven UI gating for standard vs. admin users.',
          'Built the user profile module and real-time notifications feed integrated with the AI idea-grouping workflow, and owned release promotion from develop to main.'
        ]
      }
    ],
    certifications: [
      'ASP.NET Core – Solid and Clean Architecture',
      'Azure DevOps Boards for Project Managers, Analysts and Developers',
      'Git and Visual Studio with Azure DevOps Repos for Developers',
      'OpenAPI: Beginner to Guru',
      'Selenium WebDriver with C# from Scratch – NUnit Framework',
      'SQL & PostgreSQL for Beginners',
      'Understanding APIs and RESTful APIs'
    ]
  };

  getCVData(): CVData {
    return this.cvData;
  }
}

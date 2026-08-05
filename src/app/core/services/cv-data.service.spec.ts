import { CvDataService } from './cv-data.service';
import { CVData } from '../models/cv.model';
import { HomeComponent } from '../../features/home/home.component';
import { CV_PDF_PATH, CV_PDF_DOWNLOAD_NAME } from '../constants/cv-assets';

// Character-fidelity constants (Gate A ruling D-Q4: verbatim U+2013 EN DASH).
//
// These MUST stay built from codepoints, never written as raw literals. A raw
// literal here is byte-for-byte identical to the raw literal in
// cv-data.service.ts, so if both files were ever re-saved in a non-UTF-8
// encoding the dashes would become U+FFFD in *both* — and every assertion below
// would still pass while the site rendered "July 2024 <?> Present". Building
// them from codepoints makes the expectation independent of this file's own
// encoding. See the mojibake sweep at the bottom of this spec.
const EN_DASH = String.fromCharCode(0x2013);
const EM_DASH = String.fromCharCode(0x2014);
const RIGHT_SINGLE_QUOTE = String.fromCharCode(0x2019);
const RIGHT_ARROW = String.fromCharCode(0x2192);
const REPLACEMENT_CHAR = String.fromCharCode(0xfffd);

describe('CvDataService', () => {
  let service: CvDataService;
  let cvData: CVData;

  beforeEach(() => {
    service = new CvDataService();
    cvData = service.getCVData();
  });

  // ---------------------------------------------------------------------
  // US1 — Skills (AC-1, AC-2, AC-3, AC-7)
  // ---------------------------------------------------------------------

  describe('skills (US1)', () => {
    it('AC-1: getCVData().skills is an array of length exactly 11', () => {
      expect(Array.isArray(cvData.skills)).toBe(true);
      expect(cvData.skills.length).toBe(11);
    });

    it('AC-2: skills.map(c => c.name) deep-equals the ordered category list', () => {
      expect(cvData.skills.map(c => c.name)).toEqual([
        'Programming Languages',
        'Frontend Frameworks & Libraries',
        'Backend Frameworks & Libraries',
        'Databases',
        'Messaging & Async',
        'AI / LLM Engineering',
        'Web Technologies',
        'Security',
        'Testing',
        'DevOps & Tools',
        'Software Engineering Practices'
      ]);
    });

    it('AC-3: every category has items.length >= 1 (no empty category ships)', () => {
      for (const category of cvData.skills) {
        expect(category.items.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('INV-2: category names are unique', () => {
      // AC-2's toEqual catches a renamed category, but a duplicate introduced
      // together with the matching AC-2 edit would ship green without this.
      expect(new Set(cvData.skills.map(c => c.name)).size).toBe(11);
    });

    it('per-category item counts are exactly 6,6,7,7,6,7,5,5,8,13,9 in order (load-bearing: catches a naive comma-split regression)', () => {
      expect(cvData.skills.map(c => c.items.length)).toEqual([
        6, 6, 7, 7, 6, 7, 5, 5, 8, 13, 9
      ]);
    });

    it('"OCR (Tesseract, Microblink, Azure OCR, OCR.Space)" is a SINGLE item inside AI / LLM Engineering (naive comma-split would give 10 items instead of 7)', () => {
      const category = cvData.skills.find(c => c.name === 'AI / LLM Engineering');
      expect(category).toBeDefined();
      expect(category!.items).toContain(
        'OCR (Tesseract, Microblink, Azure OCR, OCR.Space)'
      );
      expect(category!.items.length).toBe(7);
    });

    it('"Azure DevOps (CI/CD, Repos, Boards)" is a SINGLE item inside DevOps & Tools (naive comma-split would give 15 items instead of 13)', () => {
      const category = cvData.skills.find(c => c.name === 'DevOps & Tools');
      expect(category).toBeDefined();
      expect(category!.items).toContain('Azure DevOps (CI/CD, Repos, Boards)');
      expect(category!.items.length).toBe(13);
    });

    it('AC-7: keySkills is a string[] of length 35 and includes the three anchor members', () => {
      expect(Array.isArray(cvData.keySkills)).toBe(true);
      expect(cvData.keySkills.length).toBe(35);
      expect(cvData.keySkills).toContain('AWS Bedrock');
      expect(cvData.keySkills).toContain('Temporal');
      expect(cvData.keySkills).toContain('Spring WebFlux');
    });
  });

  // ---------------------------------------------------------------------
  // US2 — About stats (AC-9)
  // ---------------------------------------------------------------------

  describe('yearsExperience (US2)', () => {
    it('AC-9: getCVData().yearsExperience === 3', () => {
      expect(cvData.yearsExperience).toBe(3);
    });
  });

  // ---------------------------------------------------------------------
  // US3 — Experience (AC-13, AC-14, AC-17)
  // ---------------------------------------------------------------------

  describe('experience (US3)', () => {
    it('AC-13: experience.length === 2; titles/company/periods match, periods use EN DASH U+2013', () => {
      expect(cvData.experience.length).toBe(2);

      expect(cvData.experience[0].title).toBe('Software Developer');
      expect(cvData.experience[0].company).toBe('Adapt IT');
      expect(cvData.experience[0].period).toBe(`July 2024 ${EN_DASH} Present`);

      expect(cvData.experience[1].title).toBe('Graduate Software Developer');
      expect(cvData.experience[1].company).toBe('Adapt IT');
      expect(cvData.experience[1].period).toBe(`July 2023 ${EN_DASH} June 2024`);
    });

    it('AC-13 (character fidelity): experience periods use the real EN DASH, not an ASCII hyphen', () => {
      expect(cvData.experience[0].period).not.toBe('July 2024 - Present');
      expect(cvData.experience[1].period).not.toBe('July 2023 - June 2024');
      expect(cvData.experience[0].period.includes('-')).toBe(false);
      expect(cvData.experience[1].period.includes('-')).toBe(false);
    });

    it('AC-14: each experience entry has exactly one ungrouped Responsibility (category undefined) with 7 and 6 items', () => {
      expect(cvData.experience[0].responsibilities.length).toBe(1);
      expect(cvData.experience[0].responsibilities[0].category).toBeUndefined();
      expect(cvData.experience[0].responsibilities[0].items.length).toBe(7);

      expect(cvData.experience[1].responsibilities.length).toBe(1);
      expect(cvData.experience[1].responsibilities[0].category).toBeUndefined();
      expect(cvData.experience[1].responsibilities[0].items.length).toBe(6);
    });

    it('AC-17 (negative): no experience title equals "Junior Developer" or "Graduate Developer"', () => {
      const titles = cvData.experience.map(e => e.title);
      expect(titles).not.toContain('Junior Developer');
      expect(titles).not.toContain('Graduate Developer');
    });
  });

  // ---------------------------------------------------------------------
  // US4 — Projects (AC-18, AC-19, AC-20)
  // ---------------------------------------------------------------------

  describe('projects (US4)', () => {
    it('AC-18: projects.length === 6 and names deep-equal the CV order (EN DASH fidelity)', () => {
      expect(cvData.projects.length).toBe(6);
      expect(cvData.projects.map(p => p.name)).toEqual([
        `Education ${EN_DASH} Student Applications System`,
        `Education ${EN_DASH} Student Registrations System`,
        `Education ${EN_DASH} Alumni`,
        `Education ${EN_DASH} TVET Student Success Tracker`,
        `Education ${EN_DASH} Student Success Agent`,
        'ITS Ignite'
      ]);
    });

    it('AC-18 (character fidelity): the five "Education – …" project names use the real EN DASH, not an ASCII hyphen', () => {
      const educationProjectNames = cvData.projects
        .map(p => p.name)
        .filter(name => name.startsWith('Education'));
      expect(educationProjectNames.length).toBe(5);
      for (const name of educationProjectNames) {
        expect(name).not.toContain('Education - ');
        expect(name).toContain(`Education ${EN_DASH} `);
      }
    });

    it('AC-19 (negative): no project name equals the superseded 2025-era names', () => {
      const names = cvData.projects.map(p => p.name);
      expect(names).not.toContain('Task-Wyze');
      expect(names).not.toContain('Infinity - Applications Module');
      expect(names).not.toContain('Infinity - Registrations Module');
    });

    it('AC-20: every project has technologies.length >= 1, highlights.length === 3, and a non-empty description', () => {
      for (const project of cvData.projects) {
        expect(project.technologies.length).toBeGreaterThanOrEqual(1);
        expect(project.highlights.length).toBe(3);
        expect(project.description.length).toBeGreaterThan(0);
      }
    });
  });

  // ---------------------------------------------------------------------
  // US5 — Certifications (AC-22, AC-23)
  // ---------------------------------------------------------------------

  describe('certifications (US5)', () => {
    it('AC-22: certifications deep-equals the seven CV entries, in order (EN DASH fidelity)', () => {
      expect(cvData.certifications).toEqual([
        `ASP.NET Core ${EN_DASH} Solid and Clean Architecture`,
        'Azure DevOps Boards for Project Managers, Analysts and Developers',
        'Git and Visual Studio with Azure DevOps Repos for Developers',
        'OpenAPI: Beginner to Guru',
        `Selenium WebDriver with C# from Scratch ${EN_DASH} NUnit Framework`,
        'SQL & PostgreSQL for Beginners',
        'Understanding APIs and RESTful APIs'
      ]);
      expect(cvData.certifications.length).toBe(7);
    });

    it('AC-22 (character fidelity): the two dashed certification titles use the real EN DASH, not an ASCII hyphen', () => {
      expect(cvData.certifications).not.toContain(
        'ASP.NET Core - Solid and Clean Architecture'
      );
      expect(cvData.certifications).not.toContain(
        'Selenium WebDriver with C# from Scratch - NUnit Framework'
      );
    });

    it('AC-23 (negative): the superseded, shorter titles are absent by EXACT equality (the new titles are supersets, so toContain would pass vacuously)', () => {
      expect(cvData.certifications).not.toContain(
        'Azure DevOps Boards for Project Managers'
      );
      expect(cvData.certifications).not.toContain(
        'Git and Visual Studio with Azure DevOps'
      );
      expect(cvData.certifications).not.toContain('Selenium WebDriver with C#');
    });
  });

  // ---------------------------------------------------------------------
  // US5A — Education (AC-39, AC-40)
  // ---------------------------------------------------------------------

  describe('education (US5A)', () => {
    it('AC-39: education.length === 2 and deep-equals the CV-verbatim entries with bare-year date strings', () => {
      expect(cvData.education.length).toBe(2);
      expect(cvData.education).toEqual([
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
      ]);
    });

    it('AC-39: date is the bare year STRING, not a number and not month-qualified', () => {
      expect(typeof cvData.education[0].date).toBe('string');
      expect(typeof cvData.education[1].date).toBe('string');
      expect(cvData.education[0].date).toBe('2021');
      expect(cvData.education[1].date).toBe('2019');
    });

    it('AC-40 (negative): no education date equals "December 2021" / "December 2019", and no degree equals the superseded wording', () => {
      const dates = cvData.education.map(e => e.date);
      expect(dates).not.toContain('December 2021');
      expect(dates).not.toContain('December 2019');

      const degrees = cvData.education.map(e => e.degree);
      expect(degrees).not.toContain(
        "Bachelor's Degree in Computer and Information Sciences"
      );
    });
  });

  // ---------------------------------------------------------------------
  // US6 — Title, tagline, outbound links, summary (AC-25, AC-26, AC-27, AC-28)
  // ---------------------------------------------------------------------

  describe('personalInfo / summary (US6)', () => {
    it('AC-25: personalInfo.title === "Software Developer"; negative: not "Software Development Engineer"', () => {
      expect(cvData.personalInfo.title).toBe('Software Developer');
      expect(cvData.personalInfo.title).not.toBe('Software Development Engineer');
    });

    it('AC-26: personalInfo.tagline is exactly the CV positioning string', () => {
      expect(cvData.personalInfo.tagline).toBe(
        'Full-Stack Developer | Angular & React | .NET & Java/Spring Boot | Agentic AI'
      );
    });

    it('AC-27: github/linkedin are exact matches; negative: the dead URLs are absent by EXACT equality (never substring)', () => {
      expect(cvData.personalInfo.github).toBe('https://github.com/SleeplessDeveloper');
      expect(cvData.personalInfo.linkedin).toBe(
        'https://www.linkedin.com/in/siphephelo-sibanyoni-b89a43298'
      );

      // CRITICAL: the dead LinkedIn URL is a PREFIX/SUBSTRING of the correct one.
      // toBe (exact equality) is required here — toContain would pass on the
      // broken value too.
      expect(cvData.personalInfo.github).not.toBe(
        'https://github.com/siphephelo-sibanyoni'
      );
      expect(cvData.personalInfo.linkedin).not.toBe(
        'https://linkedin.com/in/siphephelo-sibanyoni'
      );
    });

    it('AC-28: summary equals the CV PROFESSIONAL SUMMARY verbatim; negative: no stale marker phrases', () => {
      expect(cvData.summary).toBe(
        'Full-stack Software Developer with 3 years of experience building production web ' +
          'applications across .NET 8/C# and Java 17/21 (Spring Boot), with Angular (12–21, ' +
          'NgRx) and React front ends, over PostgreSQL/Oracle data stores, RabbitMQ/Kafka ' +
          'microservices, and Azure DevOps CI/CD. Resolved production performance incidents ' +
          'through query refactoring and caching, and led SonarQube-driven code-quality ' +
          'initiatives across several codebases. Recently shipped agentic AI features — ' +
          'human-in-the-loop workflows on .NET 8/Angular 20 with Temporal orchestration and AWS ' +
          'Bedrock, plus a vendor-agnostic Ollama/OpenAI LLM integration — and is looking to ' +
          'bring full-stack and applied-AI engineering skills to a growing development team.'
      );
      expect(cvData.summary).not.toContain('Software Development Engineer');
      expect(cvData.summary).not.toContain('Results-oriented');
    });
  });

  // ---------------------------------------------------------------------
  // US6 — HomeComponent.roles anti-drift invariant (AC-29, INV-8)
  // ---------------------------------------------------------------------

  describe('HomeComponent.roles anti-drift invariant (AC-29, INV-8)', () => {
    it('AC-29: roles is the approved hero copy, carrying the tagline themes in order', () => {
      // Plain field access — HomeComponent has no constructor-time side effects
      // beyond the injected service parameter, so it can be instantiated
      // directly without TestBed/a fixture (Testing Strategy item 20).
      const home = new HomeComponent(service);

      expect(home.roles).toEqual([
        'Full-Stack Developer',
        'Angular & React Developer',
        '.NET & Spring Boot Engineer',
        'Agentic AI Developer'
      ]);

      // Anti-drift, per AC-29 as amended at stage 5. Exact reconstruction of the
      // tagline was dropped because its middle segments are technology lists, not
      // job titles. What still must hold: the hero advertises the same four
      // positioning themes the CV does, in the same order. If the CV's tagline
      // changes theme, these assertions fail on both sides.
      const themes = ['Full-Stack', 'Angular', 'Spring Boot', 'Agentic AI'];
      themes.forEach((theme, i) => {
        expect(cvData.personalInfo.tagline).toContain(theme);
        expect(home.roles[i]).toContain(theme);
      });
    });

    it('AC-29 (negative, from the develop-stage task): roles contains no stale hardcoded role', () => {
      const home = new HomeComponent(service);
      expect(home.roles).not.toContain('Angular Specialist');
      expect(home.roles).not.toContain('Backend Engineer');
    });
  });

  // ---------------------------------------------------------------------
  // US7 — PDF asset constants (AC-31)
  // ---------------------------------------------------------------------

  describe('PDF asset constants (US7)', () => {
    it('AC-31: a single module exports CV_PDF_PATH and CV_PDF_DOWNLOAD_NAME with the expected values', () => {
      expect(CV_PDF_PATH).toBe('pdf/cv.pdf');
      expect(CV_PDF_DOWNLOAD_NAME).toBe('Siphephelo_Sibanyoni_CV.pdf');
    });
  });

  // ---------------------------------------------------------------------
  // Consolidated negative sweep — "no 2025-era value survives" (Testing
  // Strategy unit item 22)
  // ---------------------------------------------------------------------

  describe('consolidated negative sweep', () => {
    it('JSON.stringify(getCVData()) contains none of the superseded/stale values', () => {
      const serialized = JSON.stringify(cvData);

      const forbiddenNeedles = [
        'Junior Developer',
        'Graduate Developer',
        'Task-Wyze',
        'Software Development Engineer',
        'Infinity - Applications Module',
        'Infinity - Registrations Module',
        'github.com/siphephelo-sibanyoni',
        'December 2021',
        'December 2019',
        "Bachelor's Degree in Computer and Information Sciences",
        // The bare year, per the spec's own needle list. Deliberately NOT the old
        // PDF filename: AC-33 forbids that filename (and its extension-qualified
        // substring) anywhere under src/, so spelling it here — even as a forbidden
        // needle — would itself violate the criterion once this file is committed.
        // The bare year is also the stronger net: it catches any 2025-era string
        // re-entering through a field with no exact assertion, such as a highlight
        // or a skills item.
        '2025'
      ];

      for (const needle of forbiddenNeedles) {
        expect(serialized).not.toContain(needle);
      }
    });

    it('does not false-positive: "Graduate Software Developer" is present, but does not trip the "Graduate Developer" needle', () => {
      const serialized = JSON.stringify(cvData);
      expect(serialized).toContain('Graduate Software Developer');
      expect(serialized).not.toContain('Graduate Developer');
    });
  });

  // ---------------------------------------------------------------------
  // getCVData() stability
  // ---------------------------------------------------------------------

  describe('getCVData() stability', () => {
    // Deliberately asserts REFERENCE identity, not deep equality. The old
    // `expect(second).toEqual(first)` was a tautology — getCVData() returns
    // `this.cvData`, so it passed for any implementation, including one returning
    // an empty object. Reference identity is the real contract: ADR D1 forbids
    // introducing a per-call clone, an Observable, or an HTTP call, and each of
    // those would fail this.
    it('returns the same object reference on repeated calls (ADR D1: synchronous, no clone, no Observable)', () => {
      expect(service.getCVData()).toBe(service.getCVData());
    });
  });

  // ---------------------------------------------------------------------
  // Character fidelity — encoding-independent (D-Q4, spec risk R5)
  // ---------------------------------------------------------------------

  describe('character fidelity (encoding-independent)', () => {
    // The highest-value assertion in this file. Every other dash/apostrophe
    // expectation compares one literal against another; if the encoding breaks
    // symmetrically they agree on garbage. U+FFFD can only appear as the *result*
    // of a decoding failure, so this catches the case they cannot.
    it('no shipped string contains U+FFFD (a decoding failure would render as "<?>" on the site)', () => {
      expect(JSON.stringify(cvData)).not.toContain(REPLACEMENT_CHAR);
    });

    it('the non-ASCII characters the CV uses are all present in the expected quantities', () => {
      const serialized = JSON.stringify(cvData);
      const countOf = (ch: string) => serialized.split(ch).length - 1;

      // Guards against a bulk "fix" that ASCII-normalises the whole literal.
      expect(countOf(EN_DASH)).toBeGreaterThan(0);
      expect(countOf(EM_DASH)).toBeGreaterThan(0);
      // AdaptIT’s appears in exactly two project descriptions (Registrations, Ignite).
      expect(countOf(RIGHT_SINGLE_QUOTE)).toBe(2);
      expect(serialized).not.toContain("AdaptIT's");
      // Dev → UAT / DEV→UAT→PROD promotion arrows.
      expect(countOf(RIGHT_ARROW)).toBeGreaterThan(0);
    });

    it('the en dash survives inside skills and keySkills, not just in periods and project names', () => {
      expect(cvData.skills[1].items).toContain(`Angular 12${EN_DASH}21`);
      expect(cvData.keySkills).toContain(`Angular (12${EN_DASH}21)`);
      expect(cvData.skills[1].items).not.toContain('Angular 12-21');
      expect(cvData.keySkills).not.toContain('Angular (12-21)');
    });
  });
});

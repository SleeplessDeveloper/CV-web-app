# Spec: Refresh site CV data from the 2026 CV and replace the attached CV PDF

- **Ticket:** [#16](https://github.com/SleeplessDeveloper/CV-web-app/issues/16)
- **Driving decision record:** [ADR-0001](../adr/0001-refresh-cv-data-and-replace-attached-cv.md) — decisions D1–D8 and the migration mapping in §3 are settled input to this spec, not open questions.
- **Upstream content source:** `Siphephelo_Sibanyoni CV 2026.docx` (last modified 2026-07-16), OneDrive - Adapt IT/Documents/personal
- **Branch:** `develop` (baseline commit `2af34c4`)
- **Status:** **Approved at Gate A (2026-08-05).** All five questions raised at Gate A have been
  ruled on by the owner — see [Resolved Decisions](#resolved-decisions-gate-a).
  **No open questions remain.**

---

## Overview

The site holds its CV in two places that have drifted from each other and from reality: the
hardcoded `CVData` literal in `CvDataService` (2025-era content) and
`public/pdf/SIPHEPHELO SIBANYONI CV 2025.pdf`, referenced by a bare string literal in
`HomeComponent.downloadCV()`. This work refreshes both from the 2026 CV. It is not a
content-only edit: the 2026 CV has 11 skill categories where the model has 6 fixed fields,
lists ungrouped experience bullets where the model requires categorised ones, and the skills
template hardcodes all six category headings in markup. So the model is reshaped
(`Skills` → `SkillCategory[]`, `Responsibility.category` optional, `PersonalInfo.tagline` and
`CVData.yearsExperience` added), three templates are updated to render from data, `education` is
brought to the CV's exact wording, two pre-existing defects are fixed (About's "Years Experience"
counts job entries, and two dead outbound links), and the PDF asset is replaced at a stable
`public/pdf/cv.pdf` path behind exported constants. Producing the PDF itself is a manual Word
export — a human gate, not an automated step.

## Goals

- **G1** Every field rendered by the site reflects the 2026 CV, with no 2025-era value surviving.
- **G2** The skills section is data-driven: adding or renaming a category is a data-only change,
  no template edit.
- **G3** Experience supports flat, ungrouped bullets without fabricating category headings.
- **G4** About's three stat cards state facts the CV asserts (3 years) rather than array lengths
  that happen to be nearby.
- **G5** The two dead outbound links (GitHub, LinkedIn) resolve to live pages.
- **G6** The downloadable PDF is the 2026 CV, at a stable version-free path behind a single
  exported constant, so the next refresh is a file swap with no code change.
- **G7** Provenance is recorded in the repo (`docs/cv-source.md`) so a reader can tell which CV
  revision the site reflects.
- **G8** `ng build` is clean and the unit suite gains coverage with **no new failures** against the
  pinned baseline.

## Non-Goals

Explicitly out of scope. **Test agents must not write tests for these.**

- Routing, SCSS/styling, layout, responsive behaviour, animations.
- SSR configuration, `server.ts`, hydration behaviour.
- Dependency upgrades (Angular stays on 18.2.x; no new devDependencies, no new test runner).
- Build-time `.docx` parsing, JSON extraction, or any CMS (ADR §5, rejected).
- Any e2e/browser-automation suite. None is installed and none is being added.
- **Rendering the `keySkills` or `tagline` fields in the UI** — Gate A ruling **D-Q2**: data-only.
  Both exist on the model and are unit-tested, but neither appears on the page. Add no UI, no
  SCSS, and no criteria for rendering them.
  **Do not over-read this.** `HomeComponent.roles` (`home.component.ts:30`) **is in scope.** It is
  *existing* UI whose hardcoded content is stale, and ticket #16 carries an explicit AC for
  realigning it with the CV's positioning (AC-29). "No UI" means *do not render the `tagline`
  field in the hero*; it does **not** mean leave `roles[]` stale.
- **Fixing the 5 pre-existing failing specs** (`AppComponent` ×3, `FooterComponent`,
  `NavbarComponent`) — Gate A ruling **D-Q3**: these move to a **separate follow-up issue**. Do
  not change their TestBed `imports` to `declarations`, do not add router providers, and do not
  delete `app.component.spec.ts`'s scaffolded `<h1>` assertion, in this ticket.
- Fixing the CV content itself. The `.docx` is upstream; the site is a projection of it.
- Automated verification that `cv.pdf` *is* the 2026 CV — Gate A ruling **D-Q5**; human gate AC-35.
- Adding `+` back to, or restyling, the About stat cards beyond the D6 change.

---

## User Stories → Acceptance Criteria

Level tags: **[U]** unit (Jasmine, no DOM), **[I]** integration (TestBed → rendered DOM),
**[B]** build/repo-level check, **[H]** human-verified gate.

AC identifiers are **stable and append-only**. AC-39…AC-41 were added at Gate A (education came
into scope via ruling D-Q1); earlier IDs were deliberately *not* renumbered.

### US1 — As a recruiter, the Skills section shows the 11 skill categories from my current CV

- [ ] **AC-1** [U] `getCVData().skills` is an array of length exactly **11**.
- [ ] **AC-2** [U] `skills.map(c => c.name)` deep-equals, in this order:
      `['Programming Languages', 'Frontend Frameworks & Libraries', 'Backend Frameworks & Libraries', 'Databases', 'Messaging & Async', 'AI / LLM Engineering', 'Web Technologies', 'Security', 'Testing', 'DevOps & Tools', 'Software Engineering Practices']`
- [ ] **AC-3** [U] Every category has `items.length >= 1` (no empty category ships).
- [ ] **AC-4** [B] `cv.model.ts` no longer declares `export interface Skills`, and does declare
      `export interface SkillCategory { name: string; items: string[] }`. Verified by `ng build`
      type-checking plus a grep for `interface Skills`.
- [ ] **AC-5** [I] `SkillsComponent` bound to the real `CVData` renders exactly 11
      `.skill-category` blocks, and their `h3` text content equals the AC-2 list in the same order.
- [ ] **AC-6** [I] Headings come from data, not markup: bind a 2-category stub
      (`[{name:'Alpha',items:['a']},{name:'Beta',items:['b']}]`) and assert exactly two `h3`
      elements reading `Alpha` and `Beta`.
- [ ] **AC-7** [U] `getCVData().keySkills` is a `string[]` of length **35** and includes
      `'AWS Bedrock'`, `'Temporal'` and `'Spring WebFlux'`. (Data-only per D-Q2 — do **not** add a
      criterion asserting it renders.)
- [ ] **AC-8** [I] **Negative** — the rendered skills section contains no `h3` whose text is
      `'Languages'`, `'Frameworks & Libraries'` or `'Methodologies'`. These are the only three old
      hardcoded headings that no longer exist under any name (they became
      `'Programming Languages'`, the Frontend/Backend split, and
      `'Software Engineering Practices'` respectively).

      **Amended at stage 5 (2026-08-05).** This criterion originally also required
      `'Web Technologies'` to be absent. That was an error: `'Web Technologies'` is a **legitimate
      new category name** at position 7 of AC-2, exactly like the retained `'Databases'` and
      `'DevOps & Tools'`. Asserting its absence would have failed against a spec-compliant render
      — AC-8 contradicted AC-2. It must be asserted **present**, not absent.

### US2 — As a recruiter, the About stats state facts, not array lengths

- [ ] **AC-9** [U] `getCVData().yearsExperience === 3`.
- [ ] **AC-10** [I] The "Years Experience" stat renders `3` with **no `+`**, and is bound to
      `yearsExperience`, not `experience.length`. Prove the binding with a stub where
      `yearsExperience: 9` and `experience.length === 2`; the card must read `9`.
- [ ] **AC-11** [I] "Projects Completed" renders `6` with **no `+`**.
- [ ] **AC-12** [I] "Certifications" renders `7` with **no `+`**.

### US3 — As a recruiter, Experience shows my current titles and ungrouped bullets

- [ ] **AC-13** [U] `experience.length === 2`; `[0]` is
      `{title:'Software Developer', company:'Adapt IT', period:'July 2024 – Present'}` and `[1]` is
      `{title:'Graduate Software Developer', company:'Adapt IT', period:'July 2023 – June 2024'}`.
      (Both periods use EN DASH `–`, U+2013 — see Data Model §"Character fidelity".)
- [ ] **AC-14** [U] Each experience entry has exactly one `Responsibility`, with `category`
      `undefined`, and `items.length` of **7** (entry 0) and **6** (entry 1).
- [ ] **AC-15** [B] `Responsibility.category` is optional: the literal `{ items: [] }` type-checks.
      Verified by `ng build` succeeding on the new service literal.
- [ ] **AC-16** [I] With the real data, the rendered experience section emits **zero** `h4`
      elements. With a stub whose responsibility has `category: 'Backend'`, exactly one `h4`
      reading `Backend` is rendered.
- [ ] **AC-17** [U] **Negative** — no `experience[i].title` equals `'Junior Developer'` or
      `'Graduate Developer'`.

### US4 — As a recruiter, Projects shows the CV's six projects in CV order

- [ ] **AC-18** [U] `projects.length === 6` and `projects.map(p => p.name)` deep-equals:
      `['Education – Student Applications System', 'Education – Student Registrations System', 'Education – Alumni', 'Education – TVET Student Success Tracker', 'Education – Student Success Agent', 'ITS Ignite']`
- [ ] **AC-19** [U] **Negative** — no project name equals `'Task-Wyze'`,
      `'Infinity - Applications Module'`, or `'Infinity - Registrations Module'`.
- [ ] **AC-20** [U] Every project has `technologies.length >= 1`, `highlights.length === 3`, and a
      non-empty `description`.
- [ ] **AC-21** [I] The rendered projects section shows 6 `.project-card` elements whose `h3` text
      matches AC-18 in order.

### US5 — As a recruiter, Professional Development shows the CV's seven items

- [ ] **AC-22** [U] `certifications` deep-equals, in order:
      `['ASP.NET Core – Solid and Clean Architecture', 'Azure DevOps Boards for Project Managers, Analysts and Developers', 'Git and Visual Studio with Azure DevOps Repos for Developers', 'OpenAPI: Beginner to Guru', 'Selenium WebDriver with C# from Scratch – NUnit Framework', 'SQL & PostgreSQL for Beginners', 'Understanding APIs and RESTful APIs']`
      (length **7**; three EN DASHes.)
- [ ] **AC-23** [U] **Negative** — no certification equals the superseded titles
      `'Azure DevOps Boards for Project Managers'`, `'Git and Visual Studio with Azure DevOps'`,
      or `'Selenium WebDriver with C#'` (exact equality; the new titles are supersets of these
      strings, so a `contains` assertion here would be wrong and would pass vacuously).
- [ ] **AC-24** [I] The rendered certifications section shows 7 `.cert-card` elements.

### US5A — As a recruiter, Education reads exactly as the CV states it

Added at Gate A. Ruling **D-Q1** is **CV verbatim** — the CV's degree wording *and* its bare
years. The ADR's §3 mapping is silent on `education`; this ruling supersedes that silence and the
spec's earlier "keep `December …`" default.

- [ ] **AC-39** [U] `education.length === 2` and deep-equals, in order:
      `[{degree: 'Bachelor of Computer and Information Sciences in Application Development', institution: 'Varsity College, Sandton', date: '2021'}, {degree: 'Diploma in Information Technology (Software Development)', institution: 'Varsity College, Pretoria', date: '2019'}]`
      Note `date` is the bare year **string** `'2021'` / `'2019'` — not a number, not
      month-qualified.
- [ ] **AC-40** [U] **Negative** — no `education[i].date` equals `'December 2021'` or
      `'December 2019'`, and no `education[i].degree` equals
      `"Bachelor's Degree in Computer and Information Sciences"` (the superseded wording).
- [ ] **AC-41** [I] The rendered education section shows exactly 2 `.education-card` elements
      whose `h3` text equals the two degree titles of AC-39 in order, and whose `.date` text
      equals `2021` and `2019` respectively.

No code change is required in `education-history.component.html` — it already renders
`edu.degree` / `edu.institution` / `edu.date`. This is a data change with a newly asserted
rendering surface.

### US6 — As a recruiter, my title, positioning and outbound links are current and live

- [ ] **AC-25** [U] `personalInfo.title === 'Software Developer'`; **negative** — it does not
      equal `'Software Development Engineer'`.
- [ ] **AC-26** [U] `personalInfo.tagline === 'Full-Stack Developer | Angular & React | .NET & Java/Spring Boot | Agentic AI'`.
      (Data-only per D-Q2 — the field is **not** rendered in the hero.)
- [ ] **AC-27** [U] `personalInfo.github === 'https://github.com/SleeplessDeveloper'` and
      `personalInfo.linkedin === 'https://www.linkedin.com/in/siphephelo-sibanyoni-b89a43298'`.
      **Negative** — neither field **equals** `'https://github.com/siphephelo-sibanyoni'` or
      `'https://linkedin.com/in/siphephelo-sibanyoni'`. Use exact equality, **not** substring:
      the correct LinkedIn URL legitimately contains the substring `siphephelo-sibanyoni`.
- [ ] **AC-28** [U] `summary` equals the CV's PROFESSIONAL SUMMARY verbatim (see Data Model);
      **negative** — `summary` does not contain `'Software Development Engineer'` or
      `'Results-oriented'`.
- [ ] **AC-29** [U] `HomeComponent.roles` has 4 entries, equal to the approved hero copy:
      `['Full-Stack Developer', 'Angular & React Developer', '.NET & Spring Boot Engineer',
      'Agentic AI Developer']`, and each entry `i` contains the *i*-th tagline theme from
      `['Full-Stack', 'Angular', 'Spring Boot', 'Agentic AI']`, every one of which must also
      appear in `personalInfo.tagline`. **Negative** — `roles` contains neither
      `'Angular Specialist'` nor `'Backend Engineer'`.

      **Amended at stage 5 (2026-08-05).** This criterion originally required
      `roles.join(' | ') === personalInfo.tagline` exactly. That was written before the hero copy
      was chosen, and it is wrong: the tagline's middle segments (`'Angular & React'`,
      `'.NET & Java/Spring Boot'`) are *technology lists*, not job titles, so exact
      reconstruction would make the hero type phrases that do not read as roles. The owner
      approved the role-shaped wording above, and a copy decision outranks an invariant invented
      to police it. The replacement keeps the anti-drift purpose — if the CV's four positioning
      themes change, the theme assertions fail — without dictating the hero's phrasing.

      **In scope despite D-Q2.** `roles` is existing hero UI with stale hardcoded content and has
      its own ticket AC; only the *rendering of the `tagline` field* is out of scope. `roles`
      stays a literal array (it is not derived from `tagline` at runtime).
- [ ] **AC-30** [H] **Human gate** — a reviewer opens both links from the rendered hero and
      confirms each loads a live profile page (HTTP 200, not a 404 profile page).

### US7 — As a recruiter, "Download CV" gives me the 2026 CV

- [ ] **AC-31** [U] A single module exports `CV_PDF_PATH === 'pdf/cv.pdf'` and
      `CV_PDF_DOWNLOAD_NAME === 'Siphephelo_Sibanyoni_CV.pdf'`.
- [ ] **AC-32** [I] `downloadCV()` builds an anchor whose `download` attribute equals
      `CV_PDF_DOWNLOAD_NAME` and whose `href` ends with `CV_PDF_PATH`. Assert by spying on
      `document.createElement` and on the returned element's `click`, so no real navigation or
      download is triggered.
- [ ] **AC-33** [B] **Negative** — `git grep` over `src/`, `public/` and `angular.json` returns no
      match for `SIPHEPHELO SIBANYONI CV 2025.pdf`, `Siphephelo_Sibanyoni_CV_2025.pdf`, or the
      substring `2025.pdf`.
- [ ] **AC-34** [B] `public/pdf/cv.pdf` is tracked by git and non-zero length;
      `public/pdf/SIPHEPHELO SIBANYONI CV 2025.pdf` is deleted (absent from `git ls-files`).
      `public/pdf/` contains exactly one file.
- [ ] **AC-35** [H] **Human gate — cannot be automated on this machine** (Gate A ruling D-Q5,
      confirmed). A human exports the 2026 `.docx` to PDF via Microsoft Word (no
      `soffice`/`libreoffice`/`pandoc` available), commits it as `public/pdf/cv.pdf`, opens the
      served file and confirms it is the 2026 CV: header reads `SOFTWARE DEVELOPER`, the tagline
      line is present, six projects and seven professional-development items appear. **No
      automated test may claim to verify PDF content**; automation is limited to
      AC-31/32/33/34 (existence, path, references). Downstream agents must report this criterion
      as **"pending human export/verification"** and never as passing.

### US8 — As the maintainer, next year's refresh is a file swap plus a data edit

- [ ] **AC-36** [B] `docs/cv-source.md` exists and records: the upstream `.docx` path, its
      last-modified date (`2026-07-16`), and the three manual steps (transcribe the literal →
      export PDF via Word → replace `public/pdf/cv.pdf`).

### US9 — As the maintainer, the build is clean and the suite gains no new failures

- [ ] **AC-37** [B] `npx ng build` exits 0 with no TypeScript errors and no new budget warnings.
- [ ] **AC-38** [B] **No new test failures against the pinned baseline.**

      **Pinned baseline** — measured on `develop` @ `2af34c4`, before any change, and
      independently reproduced by the coordinator:

      ```
      npx ng test --watch=false --browsers=ChromeHeadless
      -> TOTAL: 5 FAILED, 8 SUCCESS
      Failing: app.component.spec.ts (x3), footer.component.spec.ts, navbar.component.spec.ts
      ```

      After the change, **all** of the following must hold:
      1. The **only** failures are those same 5, in those same 3 files.
      2. The failure count does not exceed **5** and includes **no new file**.
      3. Every spec this ticket touches or creates **passes**.
      4. The success count **rises** above 8 (new `cv-data.service.spec.ts` plus the seven updated
         component specs).

      Those 5 failures are pre-existing, unrelated to this ticket, and **out of scope** here by
      Gate A ruling D-Q3 — they belong to a separate follow-up issue. Do not fix them and do not
      delete the scaffolded assertion. **The baseline above must be quoted verbatim in the PR
      description**, or a reviewer will read "5 FAILED" as a regression this change caused.

**Total: 41 acceptance criteria** — 21 [U], 11 [I], 7 [B], 2 [H] (32 automated).

---

## API Design

**Not applicable as an HTTP surface — this app has no backend, no API and no CLI.** The only
public interfaces changed are in-process TypeScript, listed here because downstream consumers
bind to them:

| Interface | Before | After |
|---|---|---|
| `CvDataService.getCVData(): CVData` | synchronous, returns the literal | **unchanged signature**; returned shape changes (see Data Model) |
| `SkillsComponent` `@Input() cvData: CVData \| null` | unchanged | unchanged (template internals change) |
| `AboutComponent` / `ExperienceComponent` / `ProjectsComponent` / `CertificationsComponent` / `EducationHistoryComponent` / `ContactComponent` `@Input() cvData` | unchanged | unchanged |
| `HomeComponent.roles: string[]` | 4 hardcoded roles | 4 tagline segments (AC-29) |
| `HomeComponent.downloadCV(): void` | two bare string literals | reads `CV_PDF_PATH`, `CV_PDF_DOWNLOAD_NAME` |
| **new** `CV_PDF_PATH`, `CV_PDF_DOWNLOAD_NAME` | — | exported `const`s |

`getCVData()` stays synchronous and stays SSR-safe (ADR D1). Do not introduce an
Observable, a loading state, or an HTTP call.

**Location for the new constants:** `src/app/core/constants/cv-assets.ts` (new file), re-exported
nowhere else. **Approved at Gate A.** The ADR mandates "a single exported constant" but not the
file; this spec fixes the location so the plan and the tests agree.

---

## Data Model

### Final `src/app/core/models/cv.model.ts` (exact target)

```ts
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
```

`export interface Skills` is **deleted**. It is declared only at `cv.model.ts:22-29` and
referenced only at `cv.model.ts:4`; no other file imports it by name (verified by grep), so
deletion breaks only the model and the six template field accesses enumerated below.

`Education` is **structurally unchanged** — `date` stays a `string`; only its *values* change
(bare years, per D-Q1).

### Invariants

| ID | Invariant |
|---|---|
| INV-1 | `skills.length === 11`; array order **is** presentation order (never sorted at render time). |
| INV-2 | Every `SkillCategory.items` is non-empty; every `SkillCategory.name` is unique. |
| INV-3 | `keySkills` is an editorial highlight list, **not** a 12th category, and is never merged into `skills`. |
| INV-4 | `yearsExperience` is asserted by the CV and never derived from `experience.length`. |
| INV-5 | `experience[].responsibilities[].category` is omitted (not `''`, not `null`) when the CV lists flat bullets. Templates must render the heading only when present. |
| INV-6 | `Project.technologies` is non-empty and every entry is traceable to that project's own prose in the CV — curated, never invented from another project. |
| INV-7 | `projects` and `certifications` are **replacements** of the old sets, not unions. Task-Wyze is deliberately absent. |
| INV-8 | `HomeComponent.roles` has 4 entries carrying, in order, the four positioning themes present in `personalInfo.tagline` (`Full-Stack`, `Angular`, `Spring Boot`, `Agentic AI`) — phrased as job titles, not as the tagline's verbatim technology lists. *Amended at stage 5; see AC-29 for why exact reconstruction was dropped.* |
| INV-9 | Exactly one PDF lives in `public/pdf/`, named `cv.pdf`, referenced only via `CV_PDF_PATH`. |
| INV-10 | `Education.date` carries whatever the CV states, verbatim. The CV states bare years, so it is `'2021'` / `'2019'` — the site does not add precision (a month) the document does not assert. |
| INV-11 | `keySkills` and `personalInfo.tagline` are model-and-test-only fields; no template binds them (D-Q2). `HomeComponent.roles` is explicitly **not** covered by this — it is rendered, and it is in scope. |

### Character fidelity (transcription hazard — read before writing the literal or the tests)

The CV uses non-ASCII punctuation. Gate A ruling **D-Q4** is **verbatim U+2013** — transcribe as
written and have the tests assert the real character. Assertions must use the same code points,
and test authors must copy strings from this spec rather than retyping them.

| Character | U+ | Appears in |
|---|---|---|
| EN DASH `–` | U+2013 | `July 2024 – Present`, `July 2023 – June 2024`, `Angular 12–21`, all five `Education – …` project names, `ASP.NET Core – Solid and Clean Architecture`, `Selenium WebDriver with C# from Scratch – NUnit Framework`, `Oracle (PL/SQL)` context lines |
| EM DASH `—` | U+2014 | inside `summary` (`agentic AI features — human-in-the-loop`) and several project descriptions |
| RIGHT SINGLE QUOTE `’` | U+2019 | `AdaptIT’s ITS system` in two project descriptions |

Note the existing service uses ASCII `-` in `'ASP.NET Core - Solid and Clean Architecture'` and
`'July 2024 - Present'`. Those become EN DASH, because the CV is the source of truth. ASCII
normalisation was considered and **rejected** at Gate A.

Commas inside parentheses mean the CV's skill lines **cannot** be split naively on `,`. These
are single items: `Temporal (durable workflow orchestration)`,
`OCR (Tesseract, Microblink, Azure OCR, OCR.Space)`, `Azure DevOps (CI/CD, Repos, Boards)`,
`integration testing (Postgres fixtures)`, `React 18 (Vite)`, `Oracle (PL/SQL)`,
`Ollama (local LLM)`, `ASP.NET Core (.NET 8)`, `agentic workflows with human-in-the-loop approval gates`.
(Verified: a naive comma split yields 10 and 15 items for *AI / LLM Engineering* and
*DevOps & Tools*; the correct counts are **7** and **13**.)

### Content mapping (authoritative; source is the transcribed CV)

**`personalInfo`** — `name`, `location` (`Centurion, Gauteng`), `phone` (`+27 76 788 1556`),
`email` (`siphefanasibanyoni@gmail.com`), `image` (`images/Me 2.jpg`) unchanged.
`title` → `Software Developer`. `tagline` → new (AC-26).
`linkedin` → `https://www.linkedin.com/in/siphephelo-sibanyoni-b89a43298`.
`github` → `https://github.com/SleeplessDeveloper`.

**`summary`** — replaced verbatim with the CV's PROFESSIONAL SUMMARY paragraph
(begins `Full-stack Software Developer with 3 years of experience…`, ends
`…to a growing development team.`). **`yearsExperience: 3`.**

**`keySkills`** — the 35 `•`-separated terms of the KEY SKILLS line, in CV order, `•`
delimiters dropped and each term trimmed.

**`skills`** — 11 categories, in CV order, with item counts:

| # | `name` | items |
|---|---|---|
| 1 | Programming Languages | 6 |
| 2 | Frontend Frameworks & Libraries | 6 |
| 3 | Backend Frameworks & Libraries | 7 |
| 4 | Databases | 7 |
| 5 | Messaging & Async | 6 |
| 6 | AI / LLM Engineering | 7 |
| 7 | Web Technologies | 5 |
| 8 | Security | 5 |
| 9 | Testing | 8 |
| 10 | DevOps & Tools | 13 |
| 11 | Software Engineering Practices | 9 |

Item text is the CV's TECHNICAL SKILLS lines verbatim, comma-split with the
parenthetical exceptions above. Old→new bucket mapping is ADR §3.3.

**`experience`** — two entries per AC-13/AC-14; bullets verbatim from the CV, one ungrouped
`Responsibility` each.

**`education`** — **in scope.** Gate A ruling **D-Q1**: CV verbatim, both wording and dates.

| # | `degree` | `institution` | `date` |
|---|---|---|---|
| 1 | `Bachelor of Computer and Information Sciences in Application Development` | `Varsity College, Sandton` | `2021` |
| 2 | `Diploma in Information Technology (Software Development)` | `Varsity College, Pretoria` | `2019` |

Changes from the current literal: entry 1's `degree` was
`Bachelor's Degree in Computer and Information Sciences`; both `date` values were
`December 2021` / `December 2019`. The months are **dropped** — the CV does not state them
(INV-10). `institution` values are unchanged. Note entry 1's new degree wording contains no
apostrophe, which removes the `\'` escape the current literal needs.

**`projects`** — six entries per AC-18. `description` is the CV's lead paragraph for that
project verbatim; `highlights` are its three bullets verbatim. `technologies` is curated —
recommended sets (each traceable to that project's own prose; tests should assert INV-6 and one
or two anchor entries, not exact array equality):

| Project | Recommended `technologies` |
|---|---|
| Education – Student Applications System | `.NET 8`, `C#`, `Clean Architecture`, `CQRS/MediatR`, `Angular 12`, `RabbitMQ`, `EF Core`, `Azure DevOps` |
| Education – Student Registrations System | `Angular 18`, `NgRx`, `.NET`, `CQRS/MediatR`, `PostgreSQL`, `Angular Material`, `SonarQube` |
| Education – Alumni | `Angular 19`, `Spring Boot 3`, `Java 17`, `JHipster`, `Oracle (PL/SQL)`, `WebSocket`, `JWT/OAuth2` |
| Education – TVET Student Success Tracker | `Angular 17`, `Spring Boot 3`, `Java 21`, `PostgreSQL`, `OpenAI`, `Ollama` |
| Education – Student Success Agent | `.NET 8`, `Angular 20`, `Temporal`, `AWS Bedrock`, `xUnit`, `Docker` |
| ITS Ignite | `React 18 (Vite)`, `.NET 8`, `CQRS/MediatR`, `EF Core`, `PostgreSQL`, `JWT` |

**`certifications`** — the seven strings of AC-22, in CV order.

---

## Consumer inventory (complete — a miss here is a build break at develop stage)

### Consumers of the `Skills` interface

| File:line | Reference | Action |
|---|---|---|
| `src/app/core/models/cv.model.ts:4` | `skills: Skills;` | → `skills: SkillCategory[];` |
| `src/app/core/models/cv.model.ts:22-29` | `export interface Skills { … }` | **delete** |

No other file imports `Skills` by name. (`skills.component.scss:1`,
`home.component.html:45`, `navbar.component.html:16`, `skills.component.html:3` match the word
"Skills" only in comments, section titles and nav labels — no code dependency.)

### Consumers of `cvData.skills`

| File:line | Reference | Action |
|---|---|---|
| `src/app/core/services/cv-data.service.ts:20-27` | `skills: { languages, webTech, frameworks, databases, devOps, methodologies }` object literal | replace with 11-element array |
| `src/app/features/skills/skills.component.html:8` | `cvData?.skills?.languages` | replaced by outer `*ngFor` over `cvData?.skills` |
| `src/app/features/skills/skills.component.html:14` | `cvData?.skills?.frameworks` | removed (splits into 2 data categories) |
| `src/app/features/skills/skills.component.html:20` | `cvData?.skills?.databases` | removed |
| `src/app/features/skills/skills.component.html:26` | `cvData?.skills?.devOps` | removed |
| `src/app/features/skills/skills.component.html:32` | `cvData?.skills?.methodologies` | removed |
| `src/app/features/skills/skills.component.html:38` | `cvData?.skills?.webTech` | removed |
| `src/app/features/skills/skills.component.html:6,12,18,24,30,36` | six hardcoded `<h3>` headings | replaced by `{{ category.name }}` |
| `src/app/features/skills/skills.component.ts:13` | `@Input() cvData: CVData \| null` | no change (type flows through) |
| `src/app/features/home/home.component.html:46` | `<app-skills [cvData]="cvData">` | no change |
| `src/app/features/home/home.component.ts:28,36` | holds/assigns `CVData` | no change |

### Consumers affected by the other model / data changes

| File:line | Reference | Action |
|---|---|---|
| `src/app/features/about/about.component.html:8` | `{{ cvData?.experience?.length }}+` | → `{{ cvData?.yearsExperience }}` (drop `+`) — the years defect |
| `src/app/features/about/about.component.html:12` | `{{ cvData?.projects?.length }}+` | drop `+` |
| `src/app/features/about/about.component.html:16` | `{{ cvData?.certifications?.length }}+` | drop `+` |
| `src/app/features/experience/experience.component.html:15` | `<h4>{{ resp.category }}</h4>` | wrap in `*ngIf="resp.category"` |
| `src/app/features/home/home.component.ts:30` | `roles = [...]` | realign to the 4 tagline segments |
| `src/app/features/home/home.component.ts:75` | `link.href = 'pdf/SIPHEPHELO SIBANYONI CV 2025.pdf'` | → `CV_PDF_PATH` |
| `src/app/features/home/home.component.ts:76` | `link.download = 'Siphephelo_Sibanyoni_CV_2025.pdf'` | → `CV_PDF_DOWNLOAD_NAME` |
| `public/pdf/SIPHEPHELO SIBANYONI CV 2025.pdf` | the asset | delete; add `public/pdf/cv.pdf` |

**Data-only, newly asserted (D-Q1):**
`src/app/features/education-history/education-history.component.html:5,7,8,9` already renders
`edu.degree` / `edu.institution` / `edu.date` — **no template change**, but the values change and
AC-41 now asserts the render.

Consumers that read changed **content** but need **no code change** (regression surface only):
`projects.component.html:5,7,8,11,14`; `certifications.component.html:5,7`;
`contact.component.html:7,9,11,13,17`; `home.component.html:6,8,13,19,24,29`.
`angular.json:28-33` and `:88-93` already copy all of `public/**/*`, so no asset-config change is
needed for `cv.pdf`.

### Spec files requiring work

| Spec file | Why |
|---|---|
| `src/app/features/skills/skills.component.spec.ts` | **must change** — AC-5, AC-6, AC-8 |
| `src/app/features/about/about.component.spec.ts` | **must change** — AC-10, AC-11, AC-12 |
| `src/app/features/experience/experience.component.spec.ts` | **must change** — AC-16 |
| `src/app/features/projects/projects.component.spec.ts` | **must change** — AC-21 |
| `src/app/features/certifications/certifications.component.spec.ts` | **must change** — AC-24 |
| `src/app/features/home/home.component.spec.ts` | **must change** — AC-29, AC-32 |
| `src/app/features/education-history/education-history.component.spec.ts` | **must change** — AC-41. **Unconditional** as of Gate A ruling D-Q1 |
| `src/app/core/services/cv-data.service.spec.ts` | **does not exist — must be created.** Home of every [U] criterion (AC-1/2/3/7/9/13/14/17/18/19/20/22/23/25/26/27/28/29/31/39/40) |
| `src/app/features/contact/contact.component.spec.ts` | optional; `personalInfo` fields it renders are unchanged |
| `src/app/app.component.spec.ts` | **pre-existing red** (3 failures). **Out of scope** — D-Q3, follow-up issue. Do not touch. |
| `src/app/layout/footer/footer.component.spec.ts` | **pre-existing red**. **Out of scope** — D-Q3. Do not touch. |
| `src/app/layout/navbar/navbar.component.spec.ts` | **pre-existing red**. **Out of scope** — D-Q3. Do not touch. |

All 11 existing specs are CLI-scaffold `should create` smoke tests only; none currently asserts
any CV content, so none *fails* because of the reshape — but seven of them are the natural home
for the new [I] criteria and are listed as must-change for that reason.

---

## Testing Strategy

**Runner:** Karma + Jasmine (`ng test`), Angular 18.2, `jasmine-core ~5.2`,
`karma-chrome-launcher ~3.2`. There is **no** Jest, no Playwright/Cypress/WebdriverIO, no
`ng e2e` configuration, and **no CI at all** (`.github/` does not exist). Nothing is being added.

**Command.** `npm test` runs bare `ng test`, which defaults to watch mode and a **headed**
Chrome — unusable for a scripted verification run. Use:

```
npx ng test --watch=false --browsers=ChromeHeadless
```

Headless Chrome **is available and verified working on this machine** (Chrome at
`C:\Program Files\Google\Chrome\Application\chrome.exe`; `karma-chrome-launcher` resolved it with
`CHROME_BIN` unset; reported as `Chrome Headless 150.0.0.0`). **Fallback if a future environment
has no Chrome:** point `karma-chrome-launcher` at another Chromium binary via
`CHROME_BIN` — Edge is present at
`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe` and works as a drop-in. A
`--no-sandbox` container would additionally need a `karma.conf.js` with a
`ChromeHeadlessNoSandbox` custom launcher. Do **not** add a new launcher package.

### Baseline — pinned and authoritative

Measured on `develop` @ `2af34c4` before any change, and **independently reproduced by the
coordinator**:

```
npx ng test --watch=false --browsers=ChromeHeadless
-> TOTAL: 5 FAILED, 8 SUCCESS   (13 specs)
Failing: app.component.spec.ts (x3), footer.component.spec.ts, navbar.component.spec.ts
```

All 5 failures pre-date this ticket. `AppComponent`, `FooterComponent` and `NavbarComponent` are
**not** `standalone`, yet their scaffolded specs put them in TestBed `imports`, producing
`Unexpected directive 'X' imported by the module 'DynamicTestModule'. Please add an @NgModule
annotation.` Separately, `app.component.spec.ts:23-28` asserts an `<h1>` reading
`Hello, cv-web-app`, which `app.component.html` (a lone `<router-outlet>`) has never rendered.

**Gate A ruling D-Q3: all five are out of scope for this ticket and move to a separate follow-up
issue.** Do not fix them here; do not delete the scaffolded `<h1>` assertion here. AC-38 is
therefore a **no-new-failures** criterion against this baseline, not a "green suite" criterion.

### Unit — 21 criteria (22 specs; the last is a consolidated sweep), all in `src/app/core/services/cv-data.service.spec.ts` (new)

Plain Jasmine against `new CvDataService().getCVData()` (or `TestBed.inject(CvDataService)`);
no DOM, no fixture. This file carries the whole data contract.

1. AC-1 — `skills.length === 11`
2. AC-2 — category names deep-equal the ordered list
3. AC-3 — every category non-empty
4. AC-7 — `keySkills.length === 35` + three anchor members
5. AC-9 — `yearsExperience === 3`
6. AC-13 — 2 experience entries: titles, company, periods
7. AC-14 — one ungrouped `Responsibility` each; `category` undefined; 7 and 6 items
8. AC-17 — **negative:** no `Junior Developer` / `Graduate Developer`
9. AC-18 — 6 project names, in order
10. AC-19 — **negative:** no `Task-Wyze` / `Infinity - *`
11. AC-20 — per-project `technologies`/`highlights`/`description` invariants (INV-6)
12. AC-22 — 7 certifications, deep-equal in order
13. AC-23 — **negative:** three superseded titles absent, by exact equality
14. AC-39 — `education` deep-equals the two CV-verbatim entries; `date` is the bare year string
15. AC-40 — **negative:** no `December 2021` / `December 2019`; old degree wording absent
16. AC-25 — `title` correct; **negative:** not `Software Development Engineer`
17. AC-26 — `tagline` exact
18. AC-27 — GitHub/LinkedIn exact; **negative:** dead URLs absent by exact equality
19. AC-28 — `summary` verbatim; **negative:** no `Software Development Engineer`, no `Results-oriented`
20. AC-29 — `HomeComponent.roles.join(' | ') === tagline` (component field, no fixture needed)
21. AC-31 — the two exported constants
22. A single consolidated "no stale value survives" sweep: `JSON.stringify(getCVData())`
    contains none of `Junior Developer`, `Graduate Developer`, `Task-Wyze`,
    `Software Development Engineer`, `Infinity - Applications Module`,
    `Infinity - Registrations Module`, `github.com/siphephelo-sibanyoni`, `December 2021`,
    `December 2019`, `Bachelor's Degree in Computer and Information Sciences`, `2025`.
    **Note:** `linkedin.com/in/siphephelo-sibanyoni` must **not** be a needle in this sweep — it
    matches the *new* URL as a substring. The two URL fields are compared by exact equality in
    item 18 instead.

### Integration — 11 criteria (`TestBed` → component → rendered DOM)

The only meaningful integration seam in this app is **`CvDataService` → component `@Input` →
rendered DOM**. There is no HTTP layer, no store, no router-driven data load. Each of these
mounts the real component, binds either the real `getCVData()` result or a purpose-built stub,
calls `fixture.detectChanges()`, and queries the DOM with
`fixture.nativeElement.querySelectorAll(...)`.

| Spec file | Criteria |
|---|---|
| `skills.component.spec.ts` | AC-5 (11 `.skill-category`, `h3` text in order), AC-6 (2-category stub proves headings are data-driven), AC-8 (negative: removed headings absent) |
| `about.component.spec.ts` | AC-10 (stub `yearsExperience: 9` with 2 experience entries renders `9`, no `+`), AC-11 (`6`, no `+`), AC-12 (`7`, no `+`) |
| `experience.component.spec.ts` | AC-16 (zero `h4` with real data; one `h4` with a categorised stub) |
| `projects.component.spec.ts` | AC-21 (6 `.project-card`, names in order) |
| `certifications.component.spec.ts` | AC-24 (7 `.cert-card`) |
| `education-history.component.spec.ts` | AC-41 (2 `.education-card`, degree titles in order, `.date` reads `2021` / `2019`) |
| `home.component.spec.ts` | AC-32 (`downloadCV()` — spy `document.createElement`, assert `href`/`download`, stub `click` so nothing navigates) |

Guidance for the test author: assert on **counts, names, ordering, presence/absence of elements
and short exact values**. Do **not** assert on the full `summary` paragraph or a project
`description` inside a DOM test — those long prose strings belong to exactly one assertion
(AC-28) in the unit spec, sourced from a shared constant.

`home.component.spec.ts` mounts `HomeComponent`, which pulls in all seven child components and
starts `animateRole()`'s `setInterval`. Keep it as-is (it passes today), but do not add
timing-dependent assertions about the typing animation; AC-29 asserts the `roles` array
directly, not the animation.

### End-to-end — Not applicable

No e2e runner is installed and none is in scope (Non-Goals). `ng e2e` is unconfigured. **Do not
scaffold Playwright/Cypress for this ticket.** The two behaviours a real e2e suite would cover —
outbound links resolving, and the PDF actually downloading and being the right document — are
covered as human gates AC-30 and AC-35 instead. That is a deliberate honest gap, not an oversight.

### Manual / human gates — 2 criteria + 5 repo checks

Human, in `ng serve` and in the repo:

1. **AC-35 (blocking)** — export the 2026 `.docx` → PDF in Microsoft Word, commit as
   `public/pdf/cv.pdf`, open it and confirm it is the 2026 CV. Cannot be automated (no
   `soffice`/`libreoffice`/`pandoc` on this machine). Report as *pending human
   export/verification* until a human signs it off.
2. **AC-30 (blocking)** — click the hero GitHub and LinkedIn icons; both must load live profiles.
3. AC-33/AC-34 — `git grep 2025.pdf` returns nothing; `public/pdf/` contains exactly `cv.pdf`.
4. AC-37 — `npx ng build` exits 0.
5. AC-36 — `docs/cv-source.md` present and accurate.
6. Eyeball the Skills section: 11 category cards, correct headings, no empty card, no layout
   break from the 13-item DevOps row (styling is a Non-Goal, but a visibly broken grid should be
   reported, not silently accepted).

---

## Risks & Mitigations

| # | Risk | Impact | Mitigation |
|---|---|---|---|
| R1 | **Transcription drift.** ADR D1 accepts hand-copying from a `.docx` outside the repo. A typo, a dropped bullet, or a mangled dash silently misrepresents the CV, and the tests — written from the same transcription — would happily confirm the mistake. | Site states something the CV does not; tests give false confidence. | Transcribe from the plain-text extract, not by re-reading the `.docx`. Assert **counts** (11/35/6/7/3/2/7/6/3/2) as an independent arithmetic check on completeness. AC-36 records provenance. The reviewer should diff the literal against the CV once, by eye, at Gate C. |
| R2 | **Breaking model change orphans a consumer.** `Skills` is deleted and `skills` changes shape. A missed field access is a compile error at best, a silently empty section at worst (`cvData?.skills?.languages` on an array yields `undefined`, and `*ngFor` over `undefined` renders **nothing without erroring**). | A skills category vanishes from the page with a green build. | The Consumer Inventory above is exhaustive and grep-derived. AC-5 asserts the **count** of rendered `.skill-category` blocks, which is the assertion that catches a silently-empty render; a "component compiles" test would not. |
| R3 | **A template references a skills bucket not found by grep.** Dynamic access (`skills[key]`, a pipe, an `@if` in another feature) would evade `grep -rn "skills"`. | Runtime hole. | Grep was run across all of `src/` for both `skills` and `Skills` (results in Consumer Inventory) — the only field accesses are the six in `skills.component.html`, all static. Confirmed no index-signature or dynamic-key access exists. If the develop stage finds one, it must be added to the inventory and the spec amended, not patched silently. |
| R4 | **Brittle assertions on long prose.** Asserting the 700-character `summary` or a project `description` inline in several specs makes every future wording tweak a multi-file test failure, which trains people to weaken tests. | Test rot. | Assert prose **once** (AC-28), from a single shared exported constant or a fixture, and assert everywhere else on: array lengths, `name`/`title` values, ordering, element counts, and presence/absence of short marker strings. Never assert a `description` in a DOM test. |
| R5 | **Non-ASCII punctuation mismatch.** EN DASH (U+2013), EM DASH (U+2014) and `’` (U+2019) appear in project names, periods and certifications. A test author who retypes `Education - Alumni` with a hyphen gets a failure that looks like a data bug. | Wasted cycles; or worse, the literal "fixed" to ASCII to make the test pass, silently diverging from the CV. | D-Q4 settles this as verbatim U+2013. The Character Fidelity table lists every occurrence. Copy strings from this spec or from the source extract; never retype. |
| R6 | **PDF caching after a same-path replacement.** ADR D7 deliberately reuses `pdf/cv.pdf` forever. Browsers, CDNs and service workers may serve a previously cached `cv.pdf`, so a recruiter downloads last year's CV from a correct-looking site. Angular's `outputHashing: all` does **not** hash `public/` assets. | Silent staleness — the exact failure mode this ticket exists to fix. | Accepted per ADR D7 for a first release (the file has never existed at that path, so nothing can be cached yet). Human verification (AC-35) must be done in a **hard-reloaded / private window** to avoid a false pass. Flagged as the trade-off to revisit if a future refresh reports a stale download; note the mitigation would be a cache-busting query string, not a filename change. |
| R7 | **`+` removal reads as a downgrade.** "3 Years Experience" replaces "2+", and "6 Projects" replaces "3+". | Cosmetic; owner may object after the fact. | This is ADR D6, decided, and confirmed at Gate A. |
| R8 | **A "5 FAILED" run is easy to misread as a regression this change caused.** The suite is red before the change and stays red after it (D-Q3 defers the fix), so raw totals are ambiguous: "5 failed" afterwards is indistinguishable from "I broke one and fixed one" unless the failing *files* are compared. | A real regression ships, or a clean change is wrongly rejected. | **The pinned baseline must be quoted verbatim in the PR description** (`TOTAL: 5 FAILED, 8 SUCCESS` @ `2af34c4`, failing files named). AC-38 requires reporting the before/after **success count** and the **named** failing specs, not just totals — a rising success count with an unchanged, identically-named failure set is the proof. Fixing those 5 is a separate follow-up issue. |
| R9 | **`keySkills` and `tagline` are intentionally unrendered.** Both are added to the model and neither reaches a template (D-Q2). A reviewer or linter may read unused fields as an incomplete implementation — or, worse, "fix" it by rendering them. | Confusion; unrequested UI work. | INV-11 and the Non-Goals state the ruling explicitly. AC-7 and AC-26/AC-29 give both fields a tested purpose (`tagline` anchors the `roles` invariant), so neither is unreferenced. The converse error is also called out: `HomeComponent.roles` **is** rendered UI and **is** in scope. |
| R10 | **Task-Wyze removal looks like data loss.** A reviewer diffing the service sees a whole project deleted. | Change requested to restore it. | ADR D4/§3.5 and INV-7: the project set is a replacement, not a union, and Task-Wyze is absent from the 2026 CV. AC-19 asserts its absence deliberately. |
| R11 | **Dropping `December` from the education dates looks like a data regression.** The site currently shows more precision than the new values will, and the degree title change touches a field the ADR never mapped. | Reviewer reads it as accidental truncation and asks for a revert. | D-Q1 and INV-10: the CV states bare years, and the site does not assert precision the source document does not. AC-39/AC-40 make the change a deliberate, tested outcome rather than an accident, and D-Q1 is recorded in Resolved Decisions as the authority the ADR lacks. |

---

## Success Criteria / Metrics

Done when all of the following hold:

1. **41/41 acceptance criteria pass** at their stated level — 32 automated ([U]/[I]), 7 repo/build
   checks [B], 2 human gates [H].
2. `npx ng build` exits 0; no new TypeScript errors, no new budget warnings.
3. `npx ng test --watch=false --browsers=ChromeHeadless` satisfies AC-38: success count **rises
   above 8**, failures are **exactly** the pinned 5 in the pinned 3 files, and the before/after
   counts plus failing file names are reported explicitly and quoted in the PR description.
4. **Zero** occurrences in `src/`, `public/`, `angular.json` of: `Junior Developer`,
   `Graduate Developer`, `Task-Wyze`, `Software Development Engineer`,
   `Infinity - Applications Module`, `Infinity - Registrations Module`,
   `github.com/siphephelo-sibanyoni`, `2025.pdf`, `SIPHEPHELO SIBANYONI CV 2025.pdf`,
   `December 2021`, `December 2019`,
   `Bachelor's Degree in Computer and Information Sciences`.
5. `public/pdf/` contains exactly one file, `cv.pdf`, tracked by git and non-empty; a human has
   confirmed it is the 2026 CV.
6. About renders `3`, `6`, `7` with no `+`; Skills renders 11 data-driven headings; Experience
   renders 2 roles with no category headings; Projects renders 6 cards; Certifications renders 7;
   Education renders 2 cards with the CV's degree wording and the bare years `2021` / `2019`.
7. Both outbound social links load live pages (human-verified).
8. `docs/cv-source.md` exists and names the upstream `.docx` and its 2026-07-16 date.

---

## Resolved Decisions (Gate A)

All five questions raised at Gate A were ruled on by the owner on 2026-08-05. **There are no open
questions.** Recorded here so downstream stages inherit the reasoning, not just the outcome.

| # | Question | Ruling |
|---|---|---|
| **D-Q1** | Does `education` get refreshed, and how? | **CV verbatim — overrides the spec's earlier default.** Adopt the CV's degree wording *and* its bare years (`2021`, `2019`); do **not** keep `December 2021` / `December 2019`. Education is **in scope**: see Data Model §`education`, AC-39/40/41, INV-10, R11, and `education-history.component.spec.ts` as an unconditional must-change. |
| **D-Q2** | Should `keySkills` and `tagline` render? | **Data-only, no UI.** Confirmed as spec'd. Both are model-and-test-only (INV-11); no new UI or SCSS criteria. **Explicitly not covered by this:** `HomeComponent.roles` (`home.component.ts:30`) is existing UI with stale hardcoded content and has its own ticket AC — realigning it (AC-29) **remains in scope**. |
| **D-Q3** | How is "`npm test` green" defined, given the suite is already red? | **Separate follow-up issue — overrides the spec's recommendation (b).** Do **not** fix `AppComponent`/`FooterComponent`/`NavbarComponent` here; do **not** delete the scaffolded `<h1>` assertion. AC-38 is rewritten as a **no-new-failures** criterion against the baseline pinned at `develop` @ `2af34c4` (`TOTAL: 5 FAILED, 8 SUCCESS`). See R8 for the reporting obligation. |
| **D-Q4** | EN DASH or ASCII hyphen? | **Verbatim U+2013.** Confirmed as spec'd; tests assert the real character. ASCII normalisation rejected. |
| **D-Q5** | Is PDF content unverifiable by test? | **Confirmed unverifiable.** AC-35 stays a human gate. Downstream agents must report it as *"pending human export/verification"* and never as passing. |
| — | Location of the PDF constants | **Approved:** `src/app/core/constants/cv-assets.ts`. |

The baseline measurement quoted throughout this spec was taken by the spec stage and
**independently reproduced by the coordinator** (`5 FAILED, 8 SUCCESS`); it is authoritative.

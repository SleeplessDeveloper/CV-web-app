# ADR-0001: Refresh site CV data from the 2026 CV and replace the attached CV asset

- **Status:** Proposed
- **Date:** 2026-08-05
- **Deciders:** Siphephelo Sibanyoni (owner)
- **Supersedes:** —
- **Affects:** `src/app/core/models/cv.model.ts`, `src/app/core/services/cv-data.service.ts`,
  `src/app/features/skills/*`, `src/app/features/about/*`, `src/app/features/home/*`,
  `public/pdf/*`

---

## 1. Context

The site's CV content has two independent representations, and both are stale.

**(a) Structured data — rendered as HTML.**
`CvDataService` holds a single hardcoded `CVData` literal (`cv-data.service.ts:8-151`) and
returns it synchronously from `getCVData()`. Every feature component consumes it through
`HomeComponent.cvData`. Its content corresponds to a 2025-era CV.

**(b) The downloadable document.**
`public/pdf/SIPHEPHELO SIBANYONI CV 2025.pdf` (152 KB), reached via a hardcoded string pair
in `HomeComponent.downloadCV()` (`home.component.ts:75-76`). Nothing links (a) to (b) — they
can drift apart silently, and they have.

The authoritative CV is now:

```
OneDrive - Adapt IT/Documents/personal/Siphephelo_Sibanyoni CV 2026.docx   (2026-07-16)
```

This document — not the site — is the source of truth. It is already designated as such by
`.claude/skills/job-hunt/job-hunt-config.yml:12`, which names it the single reference CV that
search keywords, the candidate profile, and cover letters all derive from. Selecting it here
keeps the website consistent with the job-hunt pipeline rather than introducing a second,
competing "current CV".

### 1.1 Why this is not a content-only edit

The 2026 CV does not fit the existing model. Four structural mismatches force schema change:

| # | Mismatch | Evidence |
|---|---|---|
| 1 | **Skills outgrew the fixed buckets.** `Skills` has exactly six named fields. The new CV has **eleven** categories, and `frameworks` now splits in two. Four categories have no home at all: *Messaging & Async*, *AI / LLM Engineering*, *Security*, *Testing*. | `cv.model.ts:22-29` vs CV §TECHNICAL SKILLS |
| 2 | **Skill category names are hardcoded in the template.** `skills.component.html` spells out all six `<h3>` headings and binds each to a named field. New categories cannot appear without editing the template — the data model is not the only thing gating content. | `skills.component.html:6-51` |
| 3 | **Experience bullets are no longer grouped.** The model requires `Responsibility[]` (`{category, items}`). The 2026 CV lists flat bullets under each role, with no categories. Keeping the required grouping would mean inventing categories the CV does not assert. | `cv.model.ts:35,38-41` vs CV §PROFESSIONAL EXPERIENCE |
| 4 | **Projects no longer carry an explicit tech list.** `Project.technologies: string[]` is required, but the new CV embeds technologies in prose (e.g. "built with .NET 8 … and Angular 12, with RabbitMQ-based microservices"). The array must be *curated from* the prose, not copied. | `cv.model.ts:52` vs CV §SIGNIFICANT PROJECTS |

### 1.2 Two pre-existing defects this work exposes

Both are in scope, because the refresh makes them visibly wrong rather than merely wrong.

- **`about.component.html:8` renders the wrong field as "Years Experience":**
  `{{ cvData?.experience?.length }}+` counts *job entries* (2), not years. The 2026 CV states
  **3 years**. The same pattern makes "Projects Completed" a count of *listed* projects, which
  will jump 3 → 6 purely because the CV now lists more.
- **Two dead outbound links** in `personalInfo`: `github.com/siphephelo-sibanyoni` and
  `linkedin.com/in/siphephelo-sibanyoni` are both non-resolving. The 2026 CV carries the real
  handles (`github.com/SleeplessDeveloper`, and the full LinkedIn vanity path).

### 1.3 Constraint on producing the PDF

The reference CV is `.docx`; the site serves `.pdf`. On this machine `soffice`, `libreoffice`
and `pandoc` are all absent — the only available converter is **Microsoft Word**
(`WINWORD.EXE`, present). PDF generation is therefore a **manual, human-run export step**,
not something the build or an agent can perform. There is no `.pdf` sibling of the 2026 `.docx`
today, and the `CV Fana Sibanyoni 2026.pdf` files under `Downloads/` and `Desktop/` belong to a
*different* CV lineage (a COO application) and must not be used.

---

## 2. Decision

Refresh the structured data from the 2026 CV, reshape the model where the CV demands it,
and replace the attached PDF — treating the `.docx` as upstream and the site as a projection
of it.

### D1 — Keep CV data as a typed TypeScript literal in `CvDataService`

Do **not** move to JSON, a CMS, or a build-time `.docx` parser. Retain the hardcoded literal
and the synchronous `getCVData()` signature.

*Rationale:* the content changes a few times a year, by one person, by hand. A typed literal
gets compile-time checking and SSR-safety for free. Parsing `.docx` at build time would be the
only option that removes manual transcription, but it couples the build to Word's XML and to a
file in OneDrive outside the repo — unacceptable for a public, self-contained site. Manual
transcription is accepted as the cost; §D8 mitigates the drift it permits.

### D2 — Replace the six fixed skill buckets with an ordered list of categories

```ts
export interface SkillCategory {
  name: string;      // e.g. 'AI / LLM Engineering'
  items: string[];
}

export interface CVData {
  // ...
  keySkills: string[];            // the CV's curated KEY SKILLS highlight line
  skills: SkillCategory[];        // replaces the `Skills` interface
}
```

Delete the `Skills` interface. `skills.component.html` iterates categories and renders
`category.name` as the heading, so adding or renaming a category becomes data-only.
Category **order is presentation order** — the array is ordered deliberately, not sorted.

`keySkills` is added as a distinct field because the CV's KEY SKILLS line is an editorial
highlight reel, not a twelfth category; collapsing it into `skills` would duplicate ~30 terms.

*Alternative rejected:* adding four more named fields to `Skills`. It repeats the same
mistake — every future category costs a model change plus a template change.

### D3 — Make `Responsibility.category` optional and support flat bullets

```ts
export interface Experience {
  title: string;
  company: string;
  period: string;
  responsibilities: Responsibility[];
}

export interface Responsibility {
  category?: string;   // now optional — omit for ungrouped bullets
  items: string[];
}
```

The 2026 roles become a single `Responsibility` with `category` omitted. The experience
template must render the heading only when `category` is present.

*Rationale:* preserves the grouped shape for any future CV that groups, without fabricating
categories the current CV does not state. Inventing "Angular Development" / "Backend
Development" headings again would be the site asserting a structure the CV does not.

### D4 — Keep `Project.technologies`, populated by curation, and record the drop of Task-Wyze

`technologies` stays required and is hand-curated from each project's prose. The project list
becomes the CV's six, **in CV order**. **Task-Wyze is removed** — the 2026 CV does not list it.
This is a deliberate deletion, not an oversight: the refresh is a *replacement* of the project
set, not a union with the old one.

### D5 — Add explicit `PersonalInfo` fields rather than deriving display facts

```ts
export interface PersonalInfo {
  name: string;
  title: string;             // 'Software Developer'
  tagline: string;           // NEW — the CV's positioning line
  location: string;
  phone: string;
  email: string;
  linkedin: string;          // corrected, full vanity URL
  github: string;            // corrected -> SleeplessDeveloper
  image: string;
}

export interface CVData {
  // ...
  yearsExperience: number;   // NEW — 3, asserted by the CV; never derived
}
```

### D6 — Fix the stats cards to stop deriving facts from array lengths

`about.component.html` binds "Years Experience" to `cvData.yearsExperience` (D5). The
"Projects Completed" and "Certifications" cards keep using lengths — those *are* counts of
listed items — but the `+` suffix is dropped from Projects and Certifications, because
"6+" when exactly six are listed overstates. "Years Experience" keeps `+` only if the CV's
phrasing supports it; the CV says "3 years", so it renders as `3`.

### D7 — Replace the PDF with a stable, version-free filename

- Export `Siphephelo_Sibanyoni CV 2026.docx` → PDF **manually via Word** (the only converter
  available, §1.3).
- Commit it as **`public/pdf/cv.pdf`** — a stable path.
- **Delete** `public/pdf/SIPHEPHELO SIBANYONI CV 2025.pdf`. Git history retains it; keeping a
  superseded CV publicly downloadable serves no one.
- Introduce a single exported constant for the asset and the download name, so the path stops
  being a bare literal in a component:

  ```ts
  export const CV_PDF_PATH = 'pdf/cv.pdf';
  export const CV_PDF_DOWNLOAD_NAME = 'Siphephelo_Sibanyoni_CV.pdf';
  ```

*Rationale for dropping the year from the path:* the year in both the filename and the
download name is why a content update currently requires a **code** change. A stable path
makes future refreshes a file swap. The **downloaded** filename likewise omits the year, so a
recruiter's saved copy never looks stale.

*Alternative rejected:* keeping a year-stamped filename (`...CV 2026.pdf`) for cache-busting.
Angular's asset pipeline and normal HTTP caching handle a replaced file adequately for a CV
download, and the yearly code edit is a worse cost than a rare stale cache.

### D8 — Record provenance in the repo

Add a short `docs/cv-source.md` naming the upstream `.docx`, its last-modified date, and the
manual steps (transcribe data → export PDF → swap `cv.pdf`). D1 accepts manual transcription;
this makes the *next* refresh auditable — a reader can tell which CV revision the site reflects
without diffing prose.

---

## 3. Data migration mapping

Authoritative old → new mapping. Anything not listed is unchanged.

### 3.1 `personalInfo`

| Field | Old | New |
|---|---|---|
| `title` | `Software Development Engineer` | `Software Developer` |
| `tagline` | *(absent)* | `Full-Stack Developer \| Angular & React \| .NET & Java/Spring Boot \| Agentic AI` |
| `linkedin` | `https://linkedin.com/in/siphephelo-sibanyoni` *(dead)* | `https://www.linkedin.com/in/siphephelo-sibanyoni-b89a43298` |
| `github` | `https://github.com/siphephelo-sibanyoni` *(dead)* | `https://github.com/SleeplessDeveloper` |

`name`, `location`, `phone`, `email`, `image` unchanged.

### 3.2 `summary` and `yearsExperience`

Replaced verbatim with the CV's PROFESSIONAL SUMMARY. `yearsExperience: 3`.

### 3.3 `skills` — 6 buckets → 11 ordered categories

| Old field | New category |
|---|---|
| `languages` | Programming Languages |
| `frameworks` | **splits** → Frontend Frameworks & Libraries **+** Backend Frameworks & Libraries |
| `databases` | Databases |
| `webTech` | Web Technologies |
| `devOps` | DevOps & Tools |
| `methodologies` | Software Engineering Practices |
| *(none)* | **Messaging & Async** *(new)* |
| *(none)* | **AI / LLM Engineering** *(new)* |
| *(none)* | **Security** *(new)* |
| *(none)* | **Testing** *(new)* |

Plus `keySkills` from the KEY SKILLS line.

### 3.4 `experience` — titles change, grouping flattens

| Old | New |
|---|---|
| `Junior Developer` @ Adapt IT, July 2024 – Present | `Software Developer` @ Adapt IT, July 2024 – Present |
| `Graduate Developer` @ Adapt IT, July 2023 – June 2024 | `Graduate Software Developer` @ Adapt IT, July 2023 – June 2024 |

Both roles: categorised `Responsibility[]` → one ungrouped entry (7 bullets and 6 bullets
respectively), verbatim from the CV.

### 3.5 `projects` — 3 → 6, one removal

| Old | Disposition |
|---|---|
| Infinity – Applications Module | **Replaced by** *Education – Student Applications System* (rewritten, expanded) |
| Infinity – Registrations Module | **Replaced by** *Education – Student Registrations System* (rewritten, expanded) |
| Task-Wyze | **Removed** — absent from the 2026 CV |
| — | **Added:** Education – Alumni |
| — | **Added:** Education – TVET Student Success Tracker |
| — | **Added:** Education – Student Success Agent |
| — | **Added:** ITS Ignite |

### 3.6 `certifications` — 6 → 7, three renamed

| Old | New |
|---|---|
| `Azure DevOps Boards for Project Managers` | `… for Project Managers, Analysts and Developers` |
| `Git and Visual Studio with Azure DevOps` | `… with Azure DevOps Repos for Developers` |
| `Selenium WebDriver with C#` | `… with C# from Scratch – NUnit Framework` |
| *(none)* | **`Understanding APIs and RESTful APIs`** *(new)* |

Unchanged: *ASP.NET Core – Solid and Clean Architecture*, *OpenAPI: Beginner to Guru*,
*SQL & PostgreSQL for Beginners*.

### 3.7 Out-of-band content

`HomeComponent.roles` (`home.component.ts:30`) is a hardcoded typing-animation array that
duplicates positioning claims. Realign it with the CV's tagline (D5) so the hero does not
advertise a self-description the CV no longer makes.

---

## 4. Consequences

### Positive
- Site content matches the CV that is actually being sent to employers, and the same
  `.docx` now drives the site, the job-hunt profile, and cover letters.
- Two dead outbound links — on a public portfolio, the two links most likely to be clicked —
  are fixed.
- Adding or renaming a skill category becomes data-only (D2).
- A stable `cv.pdf` path (D7) removes the code edit from future refreshes.
- "Years Experience" stops being a miscount (D6).

### Negative / accepted costs
- **Breaking model change.** `Skills` is deleted and `skills` changes shape; every consumer
  and its spec must be updated. Contained (one service, one template), but not additive.
- **Manual transcription remains.** D1 accepts that the `.docx` and the literal can drift.
  Mitigated, not solved, by D8.
- **PDF export cannot be automated here** (§1.3) — a human must run the Word export. The
  workflow must therefore treat "PDF present and current" as a **human gate**, and must not
  claim the asset was regenerated when it was only swapped.
- **`.docx` in OneDrive is not version-controlled** alongside the code, so the repo cannot
  prove which revision it reflects beyond D8's recorded date.
- Existing `*.spec.ts` files for the skills, about, and home components will fail until updated
  — expected, and the signal that all consumers were found.

### Neutral
- No routing, styling, SSR, or dependency changes. `server.ts` and the SSR entry points are
  untouched.

---

## 5. Alternatives considered

| Option | Why rejected |
|---|---|
| **Content-only edit, keep the model** | Impossible without loss: four skill categories have nowhere to go, and experience bullets would need fabricated category headings (§1.1). |
| **Parse the `.docx` at build time** | Only option that eliminates transcription, but couples a public site's build to Word XML and to a OneDrive path outside the repo. Fragile and non-reproducible for anyone else cloning. |
| **Move CV data to `public/cv.json`, fetched at runtime** | Loses compile-time typing, adds an SSR fetch and a loading state, for content that changes ~yearly. |
| **Headless CMS** | Vastly disproportionate for one author editing one document a few times a year. |
| **Keep both old and new projects (union)** | Misrepresents the CV. Task-Wyze was deliberately dropped from it (§3.5). |
| **Keep the year-stamped PDF filename** | Guarantees a code change every refresh, which is the problem D7 exists to remove. |

---

## 6. Verification

The change is done when:

1. `npm run build` succeeds with no type errors.
2. `npm test` passes, with specs updated for the new `skills` shape.
3. Every field of the 2026 CV appears in `CvDataService`, and no 2025-only content remains —
   specifically: no `Junior Developer`, no `Task-Wyze`, no `Software Development Engineer`.
4. `public/pdf/cv.pdf` exists, opens, and is the 2026 CV; the 2025 PDF is deleted; no source
   file references the old filename.
5. "Download CV" serves the 2026 PDF as `Siphephelo_Sibanyoni_CV.pdf`.
6. The About stats read `3` Years Experience, `6` Projects, `7` Certifications.
7. The GitHub and LinkedIn links both resolve to live pages.
8. Skills renders 11 categories with headings taken from data, not markup.

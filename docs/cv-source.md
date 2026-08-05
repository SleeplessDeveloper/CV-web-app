# CV source and refresh procedure

The site does not generate its CV content — it **transcribes** it. This file records
where the authoritative document lives so a reader can tell which CV revision the site
reflects without diffing prose.

## Upstream source of truth

| | |
|---|---|
| **Document** | `Siphephelo_Sibanyoni CV 2026.docx` |
| **Location** | `OneDrive - Adapt IT/Documents/personal/` (not version-controlled with this repo) |
| **Revision reflected here** | last modified **2026-07-16** |
| **Also consumed by** | the job-hunt pipeline (`.claude/skills/job-hunt/job-hunt-config.yml`), which names this same file its single reference CV |

Because the same document drives the site, the job-hunt candidate profile and cover
letters, it must stay the only CV treated as current. In particular, do **not** source
content from the `CV Fana Sibanyoni 2026.*` files under `Downloads/` or `Desktop/` — those
belong to a different, role-specific CV lineage.

## What lives where

| Representation | Location |
|---|---|
| Structured data, rendered as HTML | `src/app/core/services/cv-data.service.ts` |
| Downloadable document | `public/pdf/cv.pdf` |
| Asset path + download filename | `src/app/core/constants/cv-assets.ts` |

The PDF path is deliberately version-free, so refreshing the CV is a file swap rather than
a code change.

## Refresh procedure

1. **Update the upstream `.docx`** — it is the source of truth, so change it first.
2. **Transcribe the structured data** into `cv-data.service.ts`. Rules that matter:
   - Preserve **en dashes** (U+2013) verbatim in periods, project names and certification
     titles. Do not normalise them to ASCII hyphens.
   - `skills` is an **ordered** `SkillCategory[]` — array order is presentation order.
   - Some skill items contain internal commas and are a **single** item, e.g.
     `OCR (Tesseract, Microblink, Azure OCR, OCR.Space)` and
     `Azure DevOps (CI/CD, Repos, Boards)`. Splitting the CV line on commas gives the
     wrong item counts.
   - `yearsExperience` is **asserted by the CV**, never derived from `experience.length` —
     that field counts job entries, not years.
   - Project `technologies` must be **curated from each project's prose**; the CV does not
     carry an explicit tech list per project.
3. **Export the `.docx` to PDF** and save it as `public/pdf/cv.pdf`, replacing the
   previous file. See the note below — this step is manual.
4. **Update the revision date** at the top of this file.
5. **Run the tests**, which assert the data contract:
   ```
   npx ng test --watch=false --browsers=ChromeHeadless
   ```
   Note `npm test` is bare `ng test` — watch mode against headed Chrome, unusable for
   scripted runs.

## The PDF export is manual, by necessity

There is no automated `.docx` → PDF path on this machine, and this was verified rather
than assumed:

- `soffice`, `libreoffice` and `pandoc` are all absent.
- Microsoft Word is installed, but driving it via COM automation fails here — it either
  returns `0x800706BE` (RPC failed) or starts a headless `WINWORD.EXE` that hangs
  indefinitely without producing output. Tested three times, including against a local
  copy to rule out OneDrive sync.

So the export must be done by a human, in Word: **Open the `.docx` → Save As → PDF**.

A consequence worth stating plainly: **no automated test can verify that `cv.pdf` is the
current CV.** Tests can assert the file exists and that the code references it through
`CV_PDF_PATH`, but its *contents* are a human-verified gate. Any tooling that reports on
this step must describe it as pending human verification rather than as passing.

## Known limitation

Transcription is manual, so `cv-data.service.ts` and the upstream `.docx` can drift. This
was an accepted trade-off — see ADR-0001 §D1 and §5 for why build-time `.docx` parsing was
rejected. This file is the mitigation, not a fix: keep the revision date above accurate.

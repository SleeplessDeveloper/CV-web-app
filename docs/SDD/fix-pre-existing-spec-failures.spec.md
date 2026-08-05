# Spec: Get `ng test` green on `develop` — repair the 5 pre-existing spec failures

- **Ticket:** [#17](https://github.com/SleeplessDeveloper/CV-web-app/issues/17) (split out of [#16](https://github.com/SleeplessDeveloper/CV-web-app/issues/16), which is scoped to *no new failures* against this baseline; #17 owns getting to green)
- **Branch:** `develop` (baseline commit `37bfc1c`)
- **Stack:** Angular 18.2.14 (`@angular/core`, `@angular/router` both 18.2.14), Karma 6.4 + Jasmine 5.2, `karma-chrome-launcher`, no `.github/` (no CI)
- **Status:** **Approved at Gate A (2026-08-06).** OQ-1 ruled (a) *keep* — AC-8 stands and AC-10's expected success count is **75**. No open questions remain; see Resolved Decisions.

---

## Overview

`ng test` is red on `develop` independently of any feature work. Re-measured on `develop` @ `37bfc1c`
(after the #18/#19/#20 merges), unchanged from the ticket's original measurement apart from the spec
count grown by #16:

```
npx ng test --watch=false --browsers=ChromeHeadless
-> TOTAL: 5 FAILED, 70 SUCCESS   (75 specs)
Failing: src/app/app.component.spec.ts (x3), src/app/layout/footer/footer.component.spec.ts,
         src/app/layout/navbar/navbar.component.spec.ts
```

All five fail identically: `Error: Unexpected directive 'X' imported by the module
'DynamicTestModule'. Please add an @NgModule annotation.` `AppComponent`, `FooterComponent` and
`NavbarComponent` carry no `standalone: true` (verified — the flag appears only on the 8 feature
components), and are declared in real NgModules: `NavbarComponent`/`FooterComponent`/`LayoutComponent`
via the `declarations` array exported from `src/app/layout/layout-routing.module.ts` and consumed by
`layout.module.ts`; `AppComponent` via `app.module.ts`. Their scaffolded specs put them in TestBed
`imports`, which Angular accepts only for standalone components and NgModules. Non-standalone
components belong in `declarations`.

One of the three app specs cannot pass by that fix alone: `should render title` asserts an `<h1>`
reading `Hello, cv-web-app`, but `app.component.html` is exactly `<router-outlet></router-outlet>`.
The `<h1>` did exist once — it was part of the 336-line `ng new` scaffold that commit `3e6c7c4`
deleted on 2026-01-29 when the real app was built (corrected at stage 5; the spec previously claimed
it had "never" existed). That strengthens the disposition rather than weakening it: the removal was a
deliberate, long-settled decision, so asserting the `<h1>` is absent pins a real choice instead of
enshrining a fresh deletion. The spec that asserted it was simply never updated, and never ran.
#17 proposed deleting the assertion;
this spec instead **rewrites** it to assert what `AppComponent` actually renders (a `router-outlet`),
which costs the same and keeps a real test rather than reducing coverage to reach green.

This ticket's deliverable is test code plus one `package.json` script. No component, template, style
or CV-data change — with the single possible exception under OQ-1.

## Goals

- `npx ng test --watch=false --browsers=ChromeHeadless` reports 0 failures on `develop`.
- The three non-standalone components are tested the way Angular 18 requires (`declarations`), with
  their genuine dependencies resolved, not suppressed.
- `AppComponent`'s scaffolded assertion is replaced by one that asserts real rendered output.
- A scriptable test command exists (`npm run test:ci`), since `npm test` is bare `ng test`.
- The repo gains two stated, checkable anti-regression rules (AC-12, AC-13) so this class of failure
  does not reappear.

## Non-Goals

- **No production/source behaviour change.** No component class, template, SCSS, route or service is
  modified. The only candidate exception is the dead `AppComponent.title` property under OQ-1; if the
  owner rules "keep", the change set is `*.spec.ts` + `package.json` only.
- **Do not touch the 8 standalone feature component specs** (`about`, `certifications`, `contact`,
  `education-history`, `experience`, `home`, `projects`, `skills`) or `cv-data.service.spec.ts`. They
  pass and correctly use `imports`, because those components *are* standalone.
- **No CV data, template or styling changes.** That is #16's territory.
- **No e2e runner** (no Playwright/Cypress/WebdriverIO) and **no CI workflow**. There is no `.github/`
  in this repo and this ticket does not create one. Adding the `test:ci` npm script (AC-11) is
  explicitly asked for by #17 and is not the same thing as adding CI.
- **No `karma.conf.js`, no new launcher package, no coverage thresholds.**
- Not making components standalone. Converting `AppComponent`/`FooterComponent`/`NavbarComponent` to
  standalone would also fix the error, but it is a production refactor with module-wiring fallout
  (`layout.module.ts`, `app.module.ts`) and is out of scope here.

## User Stories → Acceptance Criteria

Level tags: **[U]** unit (TestBed, component instance, no DOM assertion), **[I]** integration
(TestBed → rendered DOM), **[B]** build/repo-level check, **[H]** human-verified gate.

### US1 — As the maintainer, the layout component specs run instead of erroring

- [ ] **AC-1** [U] `footer.component.spec.ts` configures TestBed with `declarations: [FooterComponent]`
      and `FooterComponent` no longer appears in `imports`; `should create` passes.
- [ ] **AC-2** [U] `navbar.component.spec.ts` likewise; `should create` passes.
- [ ] **AC-3** [B] Neither spec adds any NgModule import, provider or schema — the TestBed config of
      both contains `declarations` only. This is sufficient because both templates use only core
      Angular syntax that needs no directive: `footer.component.html` uses interpolation
      (`{{ currentYear }}`); `navbar.component.html` uses property binding (`[src]`), class binding
      (`[class.scrolled]`, `[class.active]` — **not** `ngClass`) and event binding (`(click)`). Neither
      uses `*ngIf`, `*ngFor`, `ngClass`, `routerLink` or any `mat-*` element. If a plan step proposes
      adding `CommonModule` or `MaterialModule` here, it is wrong.
- [ ] **AC-4** [B] The navbar spec never calls `scrollToSection()`, so the `setTimeout(…, 100)` timer
      path is never entered and no timer outlives a spec. Checkable: the file contains no
      `scrollToSection` and no `window.scrollTo`. (Any future test of that path must use
      `fakeAsync`/`tick(100)`.)

      **Amended at stage 5 — the `scroll` event is now deliberately dispatched.** As originally
      written this criterion also forbade `dispatchEvent`, on the theory that the
      `@HostListener('window:scroll')` handler should never run. That was wrong in two ways:
      1. It is unenforceable as stated — calling `component.onWindowScroll()` directly runs the
         handler while matching none of the forbidden tokens, so the check passed while the guarantee
         was violated.
      2. It is undesirable. If the handler is only ever invoked directly, the
         `@HostListener('window:scroll')` decorator itself is untested — it could be deleted and every
         navbar spec would still pass while the live navbar never gained its `scrolled` state.
      The spec now drives it via `window.dispatchEvent(new Event('scroll'))` with
      `spyOnProperty(window, 'scrollY', 'get')`. This is deterministic — it depends on neither viewport
      height nor page height — and Jasmine restores the real property descriptor after each spec. The
      **timer** half of the original criterion still stands and is what actually matters for leakage.

### US2 — As the maintainer, the app component spec asserts what the app actually renders

- [ ] **AC-5** [U] `app.component.spec.ts` configures TestBed with `declarations: [AppComponent]`,
      `imports: [RouterOutlet]` (imported from `@angular/router`) and
      `providers: [provideRouter([])]`; `should create the app` passes. See
      [Router mechanism](#router-mechanism-decision) for why this exact combination.
- [ ] **AC-6** [I] The former `should render title` is **rewritten** (not deleted) to assert the real
      template: after `fixture.detectChanges()`,
      `fixture.debugElement.query(By.directive(RouterOutlet))` is truthy **and**
      `fixture.nativeElement.querySelector('router-outlet')` is truthy. The spec name is updated to
      describe that behaviour (e.g. `should render the router outlet`).

      **Strengthened at stage 5.** The `By.directive(RouterOutlet)` assertion is the load-bearing half
      and was added after review. `querySelector('router-outlet')` alone is truthy for an *unknown
      element* too, so on its own it passes even with `declarations: [AppComponent]` +
      `schemas: [CUSTOM_ELEMENTS_SCHEMA]` and no `RouterOutlet` — verified empirically. That means the
      tag-name assertion alone could not detect the exact failure mode this ticket exists to remove,
      and AC-9's ban on schemas would have been enforced only by a human running a grep. Querying for
      the directive fails under suppression, which gives AC-9 teeth in the suite itself.
- [ ] **AC-7** [B] **Negative** — the scaffolded assertion is not RE-ASSERTED anywhere: no `*.spec.ts`
      contains, in its **executable code** (comments stripped, as in AC-9), an expectation that an `h1`
      CONTAINS `Hello, cv-web-app`.

      **Amended at stage 5.** As originally written this criterion grepped the raw file text for
      `Hello, cv-web-app` and for `querySelector('h1')`, and BOTH now match the correct delivered code:
      the first in the comment explaining the rewrite, the second in the deliberate
      `expect(querySelector('h1')).toBeNull()` guard that AC-13 explicitly permits. A gate that reports
      a violation against correct code is worse than no gate — it teaches the reviewer to ignore it.
      Only a positive `toContain('Hello, cv-web-app')` assertion is forbidden.
- [ ] **AC-8** [U] `should have the 'cv-web-app' title` passes. **Contingent on OQ-1:** if the owner
      rules "remove the dead property", this AC is struck and AC-10's expected success count drops to
      74.
- [ ] **AC-9** [B] **Negative** — no spec in the repo resolves a template dependency by suppression or
      by a deprecated helper: no match for `NO_ERRORS_SCHEMA`, `CUSTOM_ELEMENTS_SCHEMA`, `schemas:` or
      `RouterTestingModule` in the **executable code** of any `src/**/*.spec.ts`.
      `RouterTestingModule` is `@deprecated` in the installed `@angular/router@18.2.14`
      (`node_modules/@angular/router/testing/index.d.ts:110` — "Use `provideRouter` or
      `RouterModule`/`RouterModule.forRoot` instead").

      **The check must exclude comments** (amended at stage 5). A bare `git grep` over the file text
      reports a false positive against a spec whose comment *explains why* the forbidden construct was
      rejected — which is exactly the comment a maintainer most wants to find there. Requiring the
      code to be silent about its own reasoning to satisfy a grep is the check dictating the code.
      Strip line and block comments first, e.g.:

      ```sh
      for f in $(find src -name '*.spec.ts'); do
        sed -E 's://.*::' "$f" | sed -E '/^\s*\*/d; /^\s*\/\*/d' \
          | grep -qE 'CUSTOM_ELEMENTS_SCHEMA|NO_ERRORS_SCHEMA|RouterTestingModule' \
          && echo "VIOLATION: $f"
      done
      ```

### US3 — As the maintainer, the suite is green and runnable from a script

- [ ] **AC-10** [B] **Exit criterion.** `npx ng test --watch=false --browsers=ChromeHeadless` prints
      **0 failures** — success count **>= 75** (70 currently passing + the 5 repaired), zero `FAILED`
      lines, exit code 0.

      **Actual delivered result: `TOTAL: 79 SUCCESS`, 0 failures.** The 4 above the 75 floor are new
      cases added during stage 5 in response to review — see the Testing Strategy note on added cases.
      Because Jasmine runs with `random: true` here and there is no `karma.conf.js` pinning the order,
      the suite was run **three consecutive times** with the same result, as a flake check.
- [ ] **AC-11** [B] `package.json` gains `"test:ci": "ng test --watch=false --browsers=ChromeHeadless"`;
      `npm run test:ci` reproduces AC-10 and exits 0. `"test": "ng test"` is left unchanged — it is
      watch mode against **headed** Chrome and cannot be used for scripted runs.
- [ ] **AC-12** [B] **Anti-regression: no non-standalone component in TestBed `imports`.** For each of
      the 12 `*.spec.ts` files under `src/`, every component type listed in a TestBed `imports` array
      declares `standalone: true`. Checkable by enumerating the two sets: `git grep -ln "standalone:
      true" -- src/app` must contain the component file behind every `imports` entry. After this change
      the standalone set is exactly the 8 feature components, and the 3 fixed specs use `declarations`.
      A violation reproduces the exact `Unexpected directive` error, so AC-10 also catches it.
- [ ] **AC-13** [B] **Anti-regression: no spec asserts DOM the component does not render.** For every
      `querySelector`/`querySelectorAll` selector used in a spec, that selector resolves to markup in
      the component's own `*.component.html` (an element, a class attribute, or an element rendered by
      a directive the TestBed provides). Checkable per spec by grepping the selector against the paired
      template; `app.component.spec.ts` is the case being fixed (`h1` → `router-outlet`).

      Two clarifications from applying this at stage 5:
      1. **Comments are excluded**, for the same reason as AC-9 — the rewritten spec necessarily names
         the old bad assertion in a comment in order to explain the change.
      2. **Asserting a selector is ABSENT is permitted and encouraged.** `app.component.spec.ts` now
         asserts `querySelector('h1')` is `null`. That is not "asserting DOM the component does not
         render" in the sense this criterion forbids — it pins the very mistake that was fixed, so a
         future edit reintroducing a scaffolded `<h1>` fails. The criterion targets *positive*
         assertions against markup that does not exist.
- [ ] **AC-14** [B] `git diff --stat develop` touches only `*.spec.ts` files and `package.json` (plus
      this spec doc). Per the Gate A ruling on OQ-1 (*keep*), `src/app/app.component.ts` is **not**
      in the permitted diff.
- [ ] **AC-15** [H] **Human gate** — the PR description quotes the before/after totals verbatim
      (`5 FAILED, 70 SUCCESS` → `0 FAILED, 79 SUCCESS`), so a reviewer can see the delta without
      re-running the suite, **and** states that the +4 above 75 are newly added cases rather than a
      miscount.

**Total: 15 acceptance criteria** — 4 [U], 1 [I], 9 [B], 1 [H] (14 automated).

---

## Router mechanism (decision)

`app.component.html` is a lone `<router-outlet>`, so `AppComponent` needs both the **directive**
(to compile the template) and the **router providers** (`RouterOutlet` injects `ChildrenOutletContexts`
and `ActivatedRoute`). Footer and Navbar need neither.

**Chosen:** `declarations: [AppComponent]`, `imports: [RouterOutlet]`, `providers: [provideRouter([])]`.

| Option | Verdict |
|---|---|
| `provideRouter([])` + `imports: [RouterOutlet]` | **Chosen.** `RouterOutlet` is a standalone directive in 18.2.14 (`ɵɵDirectiveDeclaration<RouterOutlet, "router-outlet", …, true, …>`), so it is legal in TestBed `imports` alongside `declarations`. `provideRouter` triggers initial navigation only through an `APP_BOOTSTRAP_LISTENER` — which never fires under TestBed — so there is no navigation, no async settling and no `fakeAsync` needed. It is also the replacement the deprecation notice names. **Correction (stage 5): `provideRouter([])` is not strictly required.** This table previously claimed `RouterOutlet` injects `ActivatedRoute`, which is false — in 18.2.14 it injects `ChildrenOutletContexts` (`providedIn: 'root'`), `ViewContainerRef`, `ChangeDetectorRef` and an optional `INPUT_BINDER` (`node_modules/@angular/router/fesm2022/router.mjs:2597-2624`). Verified: `declarations: [AppComponent], imports: [RouterOutlet]` with no providers passes with no `NullInjector` error. It is retained as cheap future-proofing — the moment a real route or an `ActivatedRoute` injection appears it becomes necessary — but it is **ceremony, not a dependency**, and the wrong rationale must not be copied into other specs. |
| `RouterTestingModule` | **Rejected — deprecated** in the installed version (see AC-9). Its purpose (fake `Location`/`LocationStrategy`) is obsolete: `MockPlatformLocation` is provided in `TestBed` by default. |
| `RouterModule.forRoot([])` | Rejected. Works, but pulls the whole root-router configuration into a unit test and is heavier than the dependency actually needs. |
| `CUSTOM_ELEMENTS_SCHEMA` / `NO_ERRORS_SCHEMA` | **Forbidden** (AC-9). These suppress the unknown-element error instead of resolving the dependency, and would let a genuinely broken template pass — the failure mode this ticket exists to remove. |

## API Design

**Not applicable as an HTTP/CLI surface** — this is a client-only Angular app with no backend. The only
interface added is one npm script: `npm run test:ci` → `ng test --watch=false --browsers=ChromeHeadless`
(AC-11). No TypeScript public API changes, unless OQ-1 is ruled "remove", which deletes the unused
public field `AppComponent.title: string`.

## Data Model

**Not applicable** — no entities, no persistence, no CV-data change. Invariants asserted by this
ticket are repo-level, not data-level:

- **INV-1** A component in a TestBed `imports` array is `standalone: true`; a component in
  `declarations` is not standalone. Exactly one of the two, per component.
- **INV-2** Every DOM selector asserted by a spec exists in the component's rendered output.
- **INV-3** Template dependencies are resolved by providing them, never by a schema.

## Testing Strategy

**This ticket's deliverable *is* test code.** There is no production change to write tests for, so the
"test strategy" is the change itself plus a full-suite regression run. No integration or e2e layer is
invented for it.

- **Unit / integration (the change):** 3 spec files edited —
  `src/app/app.component.spec.ts` (TestBed reconfigured per AC-5; scaffolded assertion rewritten per
  AC-6), `src/app/layout/footer/footer.component.spec.ts` and
  `src/app/layout/navbar/navbar.component.spec.ts` (`imports` → `declarations`). No new spec files.

  **Deviation, recorded not absorbed (stage 5): 4 new spec cases were added**, against this section's
  original "no new spec cases beyond the rewrite of an existing one". They exist because review showed
  the minimal fix left the repaired specs passing without proving much — `should create` on a
  component whose template never renders is thin. Added: footer renders its copyright line; navbar
  renders un-scrolled with the menu closed; navbar toggles the mobile menu; navbar gains the
  `scrolled` class from a real `scroll` event. The last one is the significant one — it is what pins
  the `@HostListener` decorator itself (see AC-4). All four assert through the DOM, which is also what
  substantiates AC-3's claim that `declarations` alone suffices.
- **Regression (the verification):** three consecutive full runs of
  `npx ng test --watch=false --browsers=ChromeHeadless`, delivered `0 FAILED, 79 SUCCESS` each time.
  Three runs rather than one because Jasmine is configured with `random: true` and no `karma.conf.js`
  fixes the seed, so a single green run does not rule out an order-dependent flake. The 70
  currently-passing specs must all still pass — an unchanged spec turning red means the fix reached
  beyond its blast radius. Run the suite **at least twice** (AC-4 / R-2: flake check on the navbar
  fixture).
- **Build check:** `npx ng build` exits 0. Cheap, and catches an accidental source edit.
- **Manual:** none required beyond AC-15 (reviewer reads the quoted before/after totals in the PR).
  No browser walk-through: nothing user-visible changes.
- **Environment note:** Karma resolves system Chrome with `CHROME_BIN` unset (reported as
  `Chrome Headless 150.0.0.0`). Do not add a launcher package or a `karma.conf.js`.

## Risks & Mitigations

- **R-1 — A spec goes green for the wrong reason.** Reaching for `NO_ERRORS_SCHEMA`/
  `CUSTOM_ELEMENTS_SCHEMA` (or `provideRouter` *without* the directive, then silencing the unknown
  element) makes the error disappear while leaving the template unverified.
  *Mitigation:* AC-9 greps for both schemas across `src/`; AC-6 asserts the outlet element is actually
  rendered, which fails if the directive was never resolved.
- **R-2 — Navbar fixture leaks or flakes.** `@HostListener('window:scroll')` binds a real window
  listener for the fixture's lifetime, and `scrollToSection` schedules a 100 ms `setTimeout` that would
  outlive a test if ever invoked. Karma runs all specs in one page, so a leaked listener or timer can
  affect later specs. *Mitigation:* AC-4 keeps the spec off both paths; Angular's default
  `destroyAfterEach` teardown removes the host element and its listeners between tests; the suite is
  run twice to catch order-dependent flake.
- **R-3 — Fixture cleanup / shared TestBed state.** Both layout specs create the fixture in
  `beforeEach` and call `detectChanges()`; `footer.component.html` reads
  `new Date().getFullYear()` at construction, so nothing time-frozen is asserted.
  *Mitigation:* rely on the CLI default teardown (do not add `destroyAfterEach: false`); do not
  introduce module-level shared fixtures.
- **R-4 — Fixing `declarations` surfaces a *new*, previously masked failure.** These three specs have
  never actually executed, so their assertions are unproven: `should create` for Footer/Navbar could
  fail on a constructor or first-render error that the module error was hiding. *Mitigation:* treat any
  such failure as in scope for this ticket (it is the same "make the suite green" goal) but fix it in
  the **spec**, not the component, unless it exposes a real product defect — in which case stop and
  raise it as a separate issue rather than editing production code under this ticket.
- **R-5 — Scope creep into a standalone refactor.** The tidiest-looking fix ("just make them
  standalone") is a production refactor touching `layout.module.ts` and `app.module.ts`.
  *Mitigation:* Non-Goals forbids it; AC-14 pins the diff to spec files and `package.json`.
- **R-6 — Spec count drifts under a concurrent #16 branch.** AC-10's `75` is measured at `37bfc1c`. If
  #16 merges first and adds specs, the expected success count rises. *Mitigation:* AC-10's binding part
  is **0 failures** and **success >= 75**; re-measure the exact total at implementation time and quote
  both numbers in the PR (AC-15).

## Success Criteria / Metrics

1. `npx ng test --watch=false --browsers=ChromeHeadless` → 0 failures, >= 75 successes, exit 0
   (measured twice).
2. `npm run test:ci` exists and reproduces (1).
3. `npx ng build` exits 0.
4. Diff limited to 3 spec files + `package.json` (+ this doc; + `app.component.ts` only under OQ-1
   "remove").
5. Zero hits for `NO_ERRORS_SCHEMA`, `CUSTOM_ELEMENTS_SCHEMA`, `RouterTestingModule`,
   `Hello, cv-web-app` under `src/`.
6. #16 can drop its "no new failures against a 5-failure baseline" carve-out and assert a green suite.

## Resolved Decisions (Gate A, 2026-08-06)

| Ref | Ruling |
|---|---|
| **OQ-1** | **RESOLVED — option (a): keep the property and its test unchanged.** Removal is raised as a separate housekeeping issue. AC-8 stands as written; AC-10's expected success count stays **75**; `src/app/app.component.ts` stays **out** of AC-14's permitted diff. No source file changes in this ticket. |
| **OQ-2** | **CONFIRMED — rewrite, not delete.** AC-6 stands. |

No open questions remain. The record of each question and its reasoning is retained below for
audit; the rulings above are what downstream stages follow.

---

## Open Questions (resolved — retained for the record)

- **OQ-1 (blocking the plan stage) — disposition of the dead `AppComponent.title`.**
  `app.component.html` contains no interpolation at all, so `title = 'cv-web-app'` is bound by nothing
  and `should have the 'cv-web-app' title` asserts a dead property (it is tautological, but it is not
  *false* — it will pass once the TestBed is fixed).
  **Recommendation: (a) keep the property and its test unchanged in this ticket, and raise removal as a
  separate housekeeping issue.** Rationale: #17 is "make the suite green" and explicitly proposes only
  test changes; deleting a public field is a production-source change, which every Non-Goal here
  forbids; the test passes for a correct reason; and keeping it preserves the 75-spec exit count in
  AC-10. Removing it is defensible but buys nothing this ticket is measured on.
  **If the owner instead rules (b) delete both property and test:** strike AC-8, change AC-10's
  expected success count to **74** (with 0 failures unchanged), and allow `src/app/app.component.ts`
  in AC-14's diff. Downstream stages must not choose this silently.
- **OQ-2 (non-blocking) — deviation from the ticket's stated fix.** #17 says the scaffolded `<h1>`
  assertion "should be deleted rather than repaired". This spec rewrites it instead (AC-6), per the
  orchestrator's recorded preference on the issue. Deletion is recorded as the rejected alternative:
  it reaches green by removing coverage, at the same cost as keeping a real assertion. Flagging it
  because it is a conscious departure from the ticket text, not an oversight.

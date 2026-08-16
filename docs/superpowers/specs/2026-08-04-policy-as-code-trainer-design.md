# Policy-as-Code Trainer — Design Spec

**Date:** 2026-08-04  
**Repo:** `grceng-policy-as-code-trainer`  
**Status:** Approved for implementation planning  

## Summary

A static GitHub Pages web app that helps GRC practitioners practice reading and understanding policy-as-code. Users browse frameworks and control categories, open a drill with a human-readable control statement beside annotated Rego, review evidence guidance, run a mock evaluator against canned scenarios, then take a short quiz. Progress persists in `localStorage`.

## Goals

- Teach what goes into policy-as-code (structure, inputs, decisions).
- Show how control statements map to Rego-style rules.
- Show where the policy decision happens (control plane vs data plane). See [policy flow](2026-08-15-policy-flow.md).
- Illustrate programmatic evidence gathering for a time period.
- Provide lightweight practice via mock evaluation and quizzes.
- Ship as a client-only app on GitHub Pages (no backend).

## Non-goals (v1)

- Live LLM generation
- Real cloud / IdP / SIEM evidence connectors
- Full OPA/Rego runtime in the browser
- User accounts or server-side progress sync
- Exhaustive control catalogs for every framework
- Shipping **Out** controls (documents, meetings, named roles) as drills

## Product decisions

| Topic | Decision |
| --- | --- |
| Content production | Client-side generation from structured JSON + templates |
| Control selection | Score candidates with the [PaC applicability rubric](2026-08-15-pac-applicability-rubric.md); catalog only **In** / **Stretch** |
| Teaching format | Human-readable control statement **and** Rego side by side |
| Practice loop | Study + quiz (plus mock evaluate) |
| Framework coverage | All listed frameworks, light sample depth |
| Rego interactivity | Mock evaluator over canned fixtures (not full OPA) |
| Progress | `localStorage` (recent drills, quiz scores, frameworks practiced) |
| IA | Catalog browse + drill (Approach 2) |
| Catalog layout | Sidebar: frameworks left, categories/controls right |
| Drill layout | Split statement + Rego; Flow / Evidence / Evaluate / Quiz below |
| Flow diagrams | Canned per template family (not live infra); see [policy flow](2026-08-15-policy-flow.md) |

## Frameworks in v1

Light coverage (~3–6 categories and a handful of controls each):

- NIST SP 800-53
- SCF (Secure Controls Framework)
- CIS Controls
- SOC 2
- SOX ITGC
- FedRAMP Rev 5
- FedRAMP 20x
- CMMC

Cross-framework labels may appear when a control maps to more than one framework.

### Coverage / content production

Sample depth means we do **not** add a control merely to fill a category button. Before adding or remapping controls, templates, or fixture families:

1. Score the candidate with the [policy-as-code applicability rubric](2026-08-15-pac-applicability-rubric.md) (**In** / **Stretch** / **Out**).
2. Build **In** by default; build **Stretch** only when the simplified drill still teaches something useful.
3. Never catalog **Out**.
4. Follow the [adding a control](../recipes/adding-a-control.md) recipe (control-faithful family, lock-in tests).

Each cataloged control records `pacApplicability` (`"in"` | `"stretch"`) and `pacRationale` so additions cannot skip the score.

## Architecture

```
Vite + React + TypeScript
  ├── shadcn/ui + Tailwind (dark theme, orange accents)
  ├── static JSON datasets (frameworks, categories, controls, templates, fixtures)
  ├── generator (filter → pick control → compose drill artifacts)
  ├── mock evaluator (fixture facts → pass/fail + explanation)
  ├── quiz engine (score + immediate feedback)
  └── localStorage progress store
```

Deploy: GitHub Actions builds `dist/` and publishes to GitHub Pages with repo `base` path `/grceng-policy-as-code-trainer/`.

## Information architecture

### Catalog (home)

- Brand-forward header: **Policy-as-Code Trainer**
- Left sidebar: multi-select frameworks
- Right pane: categories (and control summaries) filtered by selection
- Mode: **Random** (pick a random in-scope control) or **Select category** (user picks a category, then a control in that category)
- Primary action: open / start drill
- Compact recent drills + progress summary

### Drill

- Control identity: framework(s), control ID, category, title
- Split view:
  - Left: control statement (policy prose)
  - Right: Rego policy on a light code-block surface + section annotations
- Below the split: four secondary panels (accordion or segmented control — not top-level tabs that hide the split):
  - **Flow** — stepped control-plane / data-plane diagram for the template family ([policy flow](2026-08-15-policy-flow.md))
  - **Evidence** — what to collect, sample time-bounded query, example artifacts
  - **Evaluate** — choose canned scenario → pass/fail + which clause matched
  - **Quiz** — 3–5 questions, immediate feedback, score saved
- Default: Flow expanded first; Evidence, Evaluate, and Quiz remain reachable without leaving the statement/Rego view.

### Progress

- Frameworks practiced, drills completed, recent quiz scores
- Explicit **Clear progress** action

## Data model

### `frameworks[]`

- `id`, `name`, `versionLabel`, `description`

### `categories[]`

- `id`, `name`, `frameworkIds[]`

### `controls[]`

- `id`, `frameworkId`, `categoryId`, `title`, `objective`, `keywords[]`
- Optional `relatedFrameworkIds[]` for crosswalk display
- `templateId` — key into `templates[]` for statement/Rego/evidence/quiz composition
- `fixtureFamilyId` — key into `fixtures[]` for mock evaluation scenarios
- `pacApplicability` — `"in"` | `"stretch"` (Out is never stored; see [rubric](2026-08-15-pac-applicability-rubric.md))
- `pacRationale` — short explanation of the score

### `templates`

- Identified by `id` (control family), referenced by `controls[].templateId`
- Rego v1 skeletons (`import rego.v1`, `allow if`, `deny contains msg if`) parameterized by control family
- Statement phrasing patterns
- Evidence query patterns
- Quiz stems

### `fixtures`

- Identified by `familyId`, referenced by `controls[].fixtureFamilyId`
- Canned evaluation inputs and expected allow/deny per control family
- Short explanations for matched clauses

### `flows`

- Identified by `familyId`, matching `templates[].id` / `controls[].templateId`
- Canned control-plane / data-plane diagrams per template family (see [policy flow](2026-08-15-policy-flow.md))
- Topology class (`request-time` | `periodic-review` | `state-collector`), nodes, edges, and stepped captions

## Generator behavior

1. Filter controls by selected framework(s) and category (or pick a random category in scope).
2. Select one control.
3. Compose:
   - Control statement
   - Rego from template + control-specific parameters
   - Annotations mapped to Rego sections
   - Flow diagram from the family flow (`drill.flow`)
   - Evidence plan + sample time-window query
   - 2–3 mock test cases
   - 3–5 quiz items

## Mock evaluator

- Not OPA: a small rules layer over fixtures.
- Input: selected scenario facts.
- Output: pass/fail, expected decision, explanation of matching clause.
- Purpose: reinforce how policy inputs drive decisions.

## Visual design

- Background: near-black (`#0a0a0a`)
- Body text: white / near-white
- Headings and accents: orange (`#ff7a18`)
- Code blocks: light cream/off-white surface, dark text (theme exception)
- Distinctive display font for brand/headings; monospace for code
- Motion: sidebar selection transition, drill panel enter, quiz feedback pulse; Flow uses a stepped packet animation with a `prefers-reduced-motion` fallback (diagram + captions, no packet travel)
- Mobile: frameworks become a top selector; catalog stacks; drill stacks statement above Rego

## Edge cases

- No framework selected → disable start / show helper text
- Empty filter result → empty state with recovery suggestions (Random / change frameworks)
- Corrupt `localStorage` → reset safely
- Narrow viewports → stacked layouts as above

## Testing

- Unit tests: generator filtering/composition; mock evaluator decisions; every template family has a matching flow
- Component smoke tests: catalog selection; drill render (Flow present and default)
- Missing family flow fails tests
- Manual verification of GitHub Pages base path after deploy

## Success criteria

- User can select frameworks, browse categories, and open a drill in under a minute.
- Each drill shows statement + annotated Rego + Flow + evidence guidance.
- Flow is present on every drill; missing family flow fails tests.
- Mock evaluate returns an understandable pass/fail explanation.
- Quiz feedback is immediate; scores survive refresh via `localStorage`.
- App loads correctly from GitHub Pages on desktop and mobile.

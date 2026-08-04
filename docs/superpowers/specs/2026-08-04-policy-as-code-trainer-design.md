# Policy-as-Code Trainer — Design Spec

**Date:** 2026-08-04  
**Repo:** `grceng-policy-as-code-trainer`  
**Status:** Approved for implementation planning  

## Summary

A static GitHub Pages web app that helps GRC practitioners practice reading and understanding policy-as-code. Users browse frameworks and control categories, open a drill with a human-readable control statement beside annotated Rego, review evidence guidance, run a mock evaluator against canned scenarios, then take a short quiz. Progress persists in `localStorage`.

## Goals

- Teach what goes into policy-as-code (structure, inputs, decisions).
- Show how control statements map to Rego-style rules.
- Illustrate programmatic evidence gathering for a time period.
- Provide lightweight practice via mock evaluation and quizzes.
- Ship as a client-only app on GitHub Pages (no backend).

## Non-goals (v1)

- Live LLM generation
- Real cloud / IdP / SIEM evidence connectors
- Full OPA/Rego runtime in the browser
- User accounts or server-side progress sync
- Exhaustive control catalogs for every framework

## Product decisions

| Topic | Decision |
| --- | --- |
| Content production | Client-side generation from structured JSON + templates |
| Teaching format | Human-readable control statement **and** Rego side by side |
| Practice loop | Study + quiz (plus mock evaluate) |
| Framework coverage | All listed frameworks, light sample depth |
| Rego interactivity | Mock evaluator over canned fixtures (not full OPA) |
| Progress | `localStorage` (recent drills, quiz scores, frameworks practiced) |
| IA | Catalog browse + drill (Approach 2) |
| Catalog layout | Sidebar: frameworks left, categories/controls right |
| Drill layout | Split statement + Rego; Evidence / Evaluate / Quiz below |

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
- Below the split: three secondary panels (accordion or segmented control — not top-level tabs that hide the split):
  - **Evidence** — what to collect, sample time-bounded query, example artifacts
  - **Evaluate** — choose canned scenario → pass/fail + which clause matched
  - **Quiz** — 3–5 questions, immediate feedback, score saved
- Default: Evidence expanded first; Evaluate and Quiz remain reachable without leaving the statement/Rego view.

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

### `templates`

- Rego skeletons parameterized by control family
- Statement phrasing patterns
- Evidence query patterns
- Quiz stems

### `fixtures`

- Canned evaluation inputs and expected allow/deny per control family
- Short explanations for matched clauses

## Generator behavior

1. Filter controls by selected framework(s) and category (or pick a random category in scope).
2. Select one control.
3. Compose:
   - Control statement
   - Rego from template + control-specific parameters
   - Annotations mapped to Rego sections
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
- Motion: sidebar selection transition, drill panel enter, quiz feedback pulse
- Mobile: frameworks become a top selector; catalog stacks; drill stacks statement above Rego

## Edge cases

- No framework selected → disable start / show helper text
- Empty filter result → empty state with recovery suggestions (Random / change frameworks)
- Corrupt `localStorage` → reset safely
- Narrow viewports → stacked layouts as above

## Testing

- Unit tests: generator filtering/composition; mock evaluator decisions
- Component smoke tests: catalog selection; drill render
- Manual verification of GitHub Pages base path after deploy

## Success criteria

- User can select frameworks, browse categories, and open a drill in under a minute.
- Each drill shows statement + annotated Rego + evidence guidance.
- Mock evaluate returns an understandable pass/fail explanation.
- Quiz feedback is immediate; scores survive refresh via `localStorage`.
- App loads correctly from GitHub Pages on desktop and mobile.

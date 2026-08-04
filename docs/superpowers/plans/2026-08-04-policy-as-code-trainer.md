# Policy-as-Code Trainer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a GitHub Pages–hosted policy-as-code trainer where GRC practitioners browse frameworks, open drills (control statement + annotated Rego), review evidence, mock-evaluate scenarios, and take quizzes with localStorage progress.

**Architecture:** Client-only Vite + React + TypeScript SPA. Static JSON datasets feed a pure generator and mock evaluator. Catalog uses a framework sidebar + category browse; drills use a split statement/Rego view with Evidence, Evaluate, and Quiz panels below. Progress persists in `localStorage`. Deploy via GitHub Actions to GitHub Pages.

**Tech Stack:** Vite, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Vitest, React Testing Library, GitHub Actions / Pages

## Global Constraints

- Hosting: static GitHub Pages only — no backend, no secrets required at runtime
- Content production: client-side generation from structured JSON + templates (no LLM)
- Teaching format: human-readable control statement **and** Rego side by side
- Practice loop: study + mock evaluate + quiz
- Frameworks (light coverage): NIST SP 800-53, SCF, CIS Controls, SOC 2, SOX ITGC, FedRAMP Rev 5, FedRAMP 20x, CMMC
- Rego interactivity: mock evaluator over canned fixtures — not full OPA
- Progress: `localStorage` keys for recent drills, quiz scores, frameworks practiced
- Catalog layout: frameworks left sidebar, categories/controls right
- Drill layout: split statement + Rego; Evidence / Evaluate / Quiz as secondary panels below (Evidence expanded by default)
- Theme: background `#0a0a0a`, headings/accents `#ff7a18`, body text white/near-white; code blocks light cream/off-white with dark text
- Vite `base`: `/grceng-policy-as-code-trainer/`
- Spec reference: `docs/superpowers/specs/2026-08-04-policy-as-code-trainer-design.md`

## File Structure

```
package.json
vite.config.ts
tsconfig.json
tsconfig.app.json
tsconfig.node.json
index.html
components.json
.eslintrc.cjs (or eslint.config.js from Vite scaffold)
.github/workflows/deploy.yml
README.md
public/vite.svg (optional)
src/
  main.tsx
  App.tsx
  index.css
  vite-env.d.ts
  lib/
    utils.ts
  types/
    domain.ts
  data/
    frameworks.json
    categories.json
    controls.json
    templates.json
    fixtures.json
    index.ts
  lib/
    generator.ts
    mock-evaluator.ts
    progress.ts
  components/
    ui/                    # shadcn primitives
    catalog/
      FrameworkSidebar.tsx
      CategoryBrowse.tsx
      CatalogHeader.tsx
      ProgressStrip.tsx
    drill/
      DrillHeader.tsx
      StatementPanel.tsx
      RegoPanel.tsx
      EvidencePanel.tsx
      EvaluatePanel.tsx
      QuizPanel.tsx
      DrillView.tsx
  pages/
    CatalogPage.tsx
    DrillPage.tsx
  hooks/
    useProgress.ts
    useDrillSelection.ts
  test/
    setup.ts
```

---

### Task 1: Scaffold Vite app, Tailwind, shadcn, theme, and Vitest

**Files:**
- Create: project root via Vite (`package.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, configs)
- Create: `components.json`, `src/lib/utils.ts`, initial shadcn components
- Create: `src/test/setup.ts`
- Modify: `vite.config.ts` (base path, vitest, path alias)
- Modify: `README.md`
- Create: `.github/workflows/deploy.yml` (stub ok; finalize in Task 9)

**Interfaces:**
- Consumes: none
- Produces: runnable Vite app with `@/` alias, theme CSS variables matching Global Constraints, `npm test` via Vitest

- [ ] **Step 1: Scaffold Vite React TypeScript app in the repo root**

```bash
cd /workspace
npm create vite@latest . -- --template react-ts
npm install
```

If the directory is non-empty, scaffold into a temp dir and move files, or use Vite's force/overwrite flow. Keep existing `docs/`, `.gitignore`, `LICENSE`, `README.md`.

- [ ] **Step 2: Set Vite base path and path alias**

In `vite.config.ts`:

```ts
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/grceng-policy-as-code-trainer/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
  },
});
```

Install deps:

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/node
npm install @tailwindcss/vite tailwindcss
```

- [ ] **Step 3: Initialize shadcn and add base components**

```bash
npx shadcn@latest init --defaults
npx shadcn@latest add button badge checkbox separator tabs accordion toggle-group scroll-area alert empty sonner
```

If prompts appear, choose Vite + TypeScript defaults consistent with the project. Prefer radix base if asked.

- [ ] **Step 4: Apply dark orange theme tokens in `src/index.css`**

Define CSS variables (adapt to whatever structure shadcn init created — usually `@theme inline` for Tailwind v4):

```css
:root {
  --background: #0a0a0a;
  --foreground: #f5f5f5;
  --primary: #ff7a18;
  --primary-foreground: #111111;
  --muted: #1a1a1a;
  --muted-foreground: #a3a3a3;
  --border: #2a2a2a;
  --card: #111111;
  --card-foreground: #f5f5f5;
  --accent: #1f1f1f;
  --accent-foreground: #ff7a18;
  --code-bg: #f6f1e7;
  --code-fg: #1a1a1a;
  --font-display: "Space Grotesk", "Segoe UI", sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;
}
```

Import Google fonts (or equivalent) for Space Grotesk + IBM Plex Mono in `index.html`. Set `body` to `background: var(--background); color: var(--foreground);`. Style headings with orange and display font. Add a utility class:

```css
.code-surface {
  background: var(--code-bg);
  color: var(--code-fg);
  font-family: var(--font-mono);
}
```

- [ ] **Step 5: Create Vitest setup and a smoke test**

`src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

`src/App.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("renders the brand name", () => {
    render(<App />);
    expect(screen.getByText(/policy-as-code trainer/i)).toBeInTheDocument();
  });
});
```

Update `App.tsx` minimally:

```tsx
export default function App() {
  return (
    <main className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-primary font-[family-name:var(--font-display)] text-4xl font-bold">
        Policy-as-Code Trainer
      </h1>
    </main>
  );
}
```

Add script to `package.json`: `"test": "vitest run"`, `"test:watch": "vitest"`.

- [ ] **Step 6: Run tests and dev server sanity check**

```bash
npm test
npm run build
```

Expected: tests PASS; build succeeds with assets under `/grceng-policy-as-code-trainer/`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite React app with shadcn theme and Vitest"
```

---

### Task 2: Domain types and static datasets

**Files:**
- Create: `src/types/domain.ts`
- Create: `src/data/frameworks.json`, `categories.json`, `controls.json`, `templates.json`, `fixtures.json`, `index.ts`
- Test: `src/data/data.test.ts`

**Interfaces:**
- Consumes: none
- Produces:

```ts
export type FrameworkId =
  | "nist-800-53"
  | "scf"
  | "cis"
  | "soc2"
  | "sox-itgc"
  | "fedramp-rev5"
  | "fedramp-20x"
  | "cmmc";

export interface Framework {
  id: FrameworkId;
  name: string;
  versionLabel: string;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  frameworkIds: FrameworkId[];
}

export interface Control {
  id: string;
  frameworkId: FrameworkId;
  categoryId: string;
  title: string;
  objective: string;
  keywords: string[];
  relatedFrameworkIds?: FrameworkId[];
  templateId: string;
  fixtureFamilyId: string;
}

export interface PolicyTemplate {
  id: string;
  statementTemplate: string; // uses {{title}}, {{objective}}, {{controlId}}
  regoTemplate: string;      // uses {{packageName}}, {{controlId}}
  annotations: Array<{ label: string; detail: string }>;
  evidence: {
    artifacts: string[];
    queryTemplate: string; // uses {{start}}, {{end}}, {{controlId}}
  };
  quizSeeds: Array<{
    question: string;
    choices: string[];
    correctIndex: number;
    explanation: string;
  }>;
}

export interface EvalFixture {
  familyId: string;
  scenarios: Array<{
    id: string;
    name: string;
    facts: Record<string, unknown>;
    expected: "allow" | "deny";
    explanation: string;
    matchedClause: string;
  }>;
}

export interface Drill {
  control: Control;
  frameworks: Framework[];
  category: Category;
  statement: string;
  rego: string;
  annotations: Array<{ label: string; detail: string }>;
  evidence: {
    artifacts: string[];
    query: string;
    window: { start: string; end: string };
  };
  scenarios: EvalFixture["scenarios"];
  quiz: PolicyTemplate["quizSeeds"];
}
```

- [ ] **Step 1: Write failing dataset integrity test**

`src/data/data.test.ts`:

```ts
import { categories, controls, fixtures, frameworks, templates } from "./index";

describe("datasets", () => {
  it("includes all eight frameworks", () => {
    expect(frameworks.map((f) => f.id).sort()).toEqual(
      [
        "cmmc",
        "cis",
        "fedramp-20x",
        "fedramp-rev5",
        "nist-800-53",
        "scf",
        "soc2",
        "sox-itgc",
      ].sort(),
    );
  });

  it("references only known framework, category, template, and fixture ids", () => {
    const frameworkIds = new Set(frameworks.map((f) => f.id));
    const categoryIds = new Set(categories.map((c) => c.id));
    const templateIds = new Set(templates.map((t) => t.id));
    const fixtureIds = new Set(fixtures.map((f) => f.familyId));

    for (const control of controls) {
      expect(frameworkIds.has(control.frameworkId)).toBe(true);
      expect(categoryIds.has(control.categoryId)).toBe(true);
      expect(templateIds.has(control.templateId)).toBe(true);
      expect(fixtureIds.has(control.fixtureFamilyId)).toBe(true);
    }
  });

  it("provides light coverage: at least 3 categories and 8 controls total", () => {
    expect(categories.length).toBeGreaterThanOrEqual(3);
    expect(controls.length).toBeGreaterThanOrEqual(8);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- src/data/data.test.ts
```

Expected: FAIL — modules/files missing.

- [ ] **Step 3: Implement types and JSON data**

Create `src/types/domain.ts` with the interfaces above.

Create JSON files with light but real-ish content. Minimum content requirements:

- All 8 frameworks in `frameworks.json`
- At least these categories spanning multiple frameworks: `access-control`, `audit-accountability`, `configuration-management`, `identity-access` (names can vary; ids stable kebab-case)
- At least one control per framework (can share templates/fixture families across related controls)
- Templates for families: `account-management`, `logging`, `config-baseline` (minimum 3)
- Fixtures with ≥2 scenarios each (one allow, one deny)

Example control entry:

```json
{
  "id": "AC-2",
  "frameworkId": "nist-800-53",
  "categoryId": "access-control",
  "title": "Account Management",
  "objective": "Manage information system accounts across their lifecycle.",
  "keywords": ["accounts", "joiner", "leaver"],
  "relatedFrameworkIds": ["scf", "cmmc"],
  "templateId": "account-management",
  "fixtureFamilyId": "account-management"
}
```

Example Rego template string (JSON-escaped in file):

```
package {{packageName}}

default allow = false

allow {
  input.account.active
  input.account.owner
  input.account.last_review_days <= 90
}

deny[msg] {
  input.account.active
  not input.account.owner
  msg := "{{controlId}}: active account missing owner"
}
```

`src/data/index.ts`:

```ts
import type {
  Category,
  Control,
  EvalFixture,
  Framework,
  PolicyTemplate,
} from "@/types/domain";
import categoriesJson from "./categories.json";
import controlsJson from "./controls.json";
import fixturesJson from "./fixtures.json";
import frameworksJson from "./frameworks.json";
import templatesJson from "./templates.json";

export const frameworks = frameworksJson as Framework[];
export const categories = categoriesJson as Category[];
export const controls = controlsJson as Control[];
export const templates = templatesJson as PolicyTemplate[];
export const fixtures = fixturesJson as EvalFixture[];
```

Ensure `resolveJsonModule` is true in tsconfig.

- [ ] **Step 4: Run tests**

```bash
npm test -- src/data/data.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/types/domain.ts src/data
git commit -m "feat: add domain types and light framework control datasets"
```

---

### Task 3: Drill generator (TDD)

**Files:**
- Create: `src/lib/generator.ts`
- Test: `src/lib/generator.test.ts`

**Interfaces:**
- Consumes: datasets + domain types from Task 2
- Produces:

```ts
export interface GenerateDrillInput {
  frameworkIds: FrameworkId[];
  mode: "random" | "category";
  categoryId?: string;
  now?: Date; // injectable for evidence window
  random?: () => number; // injectable RNG in [0, 1)
}

export function listCategoriesForFrameworks(
  frameworkIds: FrameworkId[],
): Category[];

export function listControlsForSelection(
  frameworkIds: FrameworkId[],
  categoryId?: string,
): Control[];

export function generateDrill(input: GenerateDrillInput): Drill;
```

- [ ] **Step 1: Write failing generator tests**

`src/lib/generator.test.ts`:

```ts
import { generateDrill, listCategoriesForFrameworks, listControlsForSelection } from "./generator";

describe("generator", () => {
  it("lists categories that intersect selected frameworks", () => {
    const cats = listCategoriesForFrameworks(["nist-800-53"]);
    expect(cats.length).toBeGreaterThan(0);
    expect(cats.every((c) => c.frameworkIds.includes("nist-800-53"))).toBe(true);
  });

  it("throws when no frameworks selected", () => {
    expect(() =>
      generateDrill({ frameworkIds: [], mode: "random", random: () => 0 }),
    ).toThrow(/framework/i);
  });

  it("generates a drill for a specific category", () => {
    const cats = listCategoriesForFrameworks(["nist-800-53"]);
    const drill = generateDrill({
      frameworkIds: ["nist-800-53"],
      mode: "category",
      categoryId: cats[0].id,
      now: new Date("2026-08-04T12:00:00Z"),
      random: () => 0,
    });
    expect(drill.control.categoryId).toBe(cats[0].id);
    expect(drill.statement.length).toBeGreaterThan(20);
    expect(drill.rego).toContain("package");
    expect(drill.evidence.query).toMatch(/2026/);
    expect(drill.scenarios.length).toBeGreaterThanOrEqual(2);
    expect(drill.quiz.length).toBeGreaterThanOrEqual(3);
  });

  it("returns empty control list for impossible filters", () => {
    expect(listControlsForSelection(["nist-800-53"], "__none__")).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test -- src/lib/generator.test.ts
```

- [ ] **Step 3: Implement `src/lib/generator.ts`**

```ts
import {
  categories,
  controls,
  fixtures,
  frameworks,
  templates,
} from "@/data";
import type {
  Category,
  Control,
  Drill,
  FrameworkId,
} from "@/types/domain";

export interface GenerateDrillInput {
  frameworkIds: FrameworkId[];
  mode: "random" | "category";
  categoryId?: string;
  now?: Date;
  random?: () => number;
}

function pick<T>(items: T[], random: () => number): T {
  if (items.length === 0) {
    throw new Error("No items available to pick");
  }
  const index = Math.min(
    items.length - 1,
    Math.floor(random() * items.length),
  );
  return items[index];
}

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? "");
}

export function listCategoriesForFrameworks(
  frameworkIds: FrameworkId[],
): Category[] {
  if (frameworkIds.length === 0) return [];
  const selected = new Set(frameworkIds);
  return categories.filter((c) =>
    c.frameworkIds.some((id) => selected.has(id)),
  );
}

export function listControlsForSelection(
  frameworkIds: FrameworkId[],
  categoryId?: string,
): Control[] {
  const selected = new Set(frameworkIds);
  return controls.filter((control) => {
    const frameworkMatch =
      selected.has(control.frameworkId) ||
      (control.relatedFrameworkIds ?? []).some((id) => selected.has(id));
    const categoryMatch = categoryId ? control.categoryId === categoryId : true;
    return frameworkMatch && categoryMatch;
  });
}

export function generateDrill(input: GenerateDrillInput): Drill {
  const random = input.random ?? Math.random;
  const now = input.now ?? new Date();

  if (input.frameworkIds.length === 0) {
    throw new Error("Select at least one framework");
  }

  let categoryId = input.categoryId;
  if (input.mode === "random" || !categoryId) {
    const cats = listCategoriesForFrameworks(input.frameworkIds);
    if (cats.length === 0) {
      throw new Error("No categories for selected frameworks");
    }
    categoryId = pick(cats, random).id;
  }

  const pool = listControlsForSelection(input.frameworkIds, categoryId);
  if (pool.length === 0) {
    throw new Error("No controls in this combination");
  }

  const control = pick(pool, random);
  const template = templates.find((t) => t.id === control.templateId);
  const fixture = fixtures.find((f) => f.familyId === control.fixtureFamilyId);
  const category = categories.find((c) => c.id === control.categoryId);
  if (!template || !fixture || !category) {
    throw new Error("Dataset integrity error for control " + control.id);
  }

  const relatedIds = new Set<FrameworkId>([
    control.frameworkId,
    ...(control.relatedFrameworkIds ?? []),
  ]);
  const drillFrameworks = frameworks.filter((f) => relatedIds.has(f.id));

  const end = now.toISOString().slice(0, 10);
  const startDate = new Date(now);
  startDate.setUTCDate(startDate.getUTCDate() - 30);
  const start = startDate.toISOString().slice(0, 10);

  const packageName = control.id.toLowerCase().replace(/[^a-z0-9]/g, "_");
  const vars = {
    title: control.title,
    objective: control.objective,
    controlId: control.id,
    packageName,
    start,
    end,
  };

  return {
    control,
    frameworks: drillFrameworks,
    category,
    statement: fill(template.statementTemplate, vars),
    rego: fill(template.regoTemplate, vars),
    annotations: template.annotations,
    evidence: {
      artifacts: template.evidence.artifacts,
      query: fill(template.evidence.queryTemplate, vars),
      window: { start, end },
    },
    scenarios: fixture.scenarios,
    quiz: template.quizSeeds.slice(0, 5),
  };
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test -- src/lib/generator.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/generator.ts src/lib/generator.test.ts
git commit -m "feat: add client-side drill generator"
```

---

### Task 4: Mock evaluator and progress store (TDD)

**Files:**
- Create: `src/lib/mock-evaluator.ts`, `src/lib/progress.ts`
- Test: `src/lib/mock-evaluator.test.ts`, `src/lib/progress.test.ts`

**Interfaces:**
- Consumes: `EvalFixture` scenarios / `Drill`
- Produces:

```ts
export interface EvaluationResult {
  scenarioId: string;
  passed: boolean;
  expected: "allow" | "deny";
  explanation: string;
  matchedClause: string;
}

export function evaluateScenario(
  scenarios: EvalFixture["scenarios"],
  scenarioId: string,
  userChoice: "allow" | "deny",
): EvaluationResult;

export interface ProgressState {
  recentDrills: Array<{
    controlId: string;
    title: string;
    frameworkIds: FrameworkId[];
    score?: number;
    at: string;
  }>;
  quizScores: Array<{
    controlId: string;
    score: number;
    total: number;
    at: string;
  }>;
  frameworksPracticed: FrameworkId[];
}

export function loadProgress(storage?: Storage): ProgressState;
export function saveDrillProgress(
  entry: ProgressState["recentDrills"][number],
  storage?: Storage,
): ProgressState;
export function saveQuizScore(
  entry: ProgressState["quizScores"][number],
  storage?: Storage,
): ProgressState;
export function clearProgress(storage?: Storage): ProgressState;
```

Storage key: `pac-trainer-progress-v1`.

- [ ] **Step 1: Write failing tests**

`src/lib/mock-evaluator.test.ts`:

```ts
import { evaluateScenario } from "./mock-evaluator";

const scenarios = [
  {
    id: "missing-owner",
    name: "Active account, no owner",
    facts: { account: { active: true, owner: null } },
    expected: "deny" as const,
    explanation: "Active accounts require an owner.",
    matchedClause: "deny[msg] when active and not owner",
  },
];

describe("evaluateScenario", () => {
  it("marks correct user choice as passed", () => {
    const result = evaluateScenario(scenarios, "missing-owner", "deny");
    expect(result.passed).toBe(true);
    expect(result.matchedClause).toMatch(/owner/i);
  });

  it("marks incorrect choice as failed", () => {
    const result = evaluateScenario(scenarios, "missing-owner", "allow");
    expect(result.passed).toBe(false);
  });

  it("throws for unknown scenario", () => {
    expect(() => evaluateScenario(scenarios, "nope", "allow")).toThrow(/scenario/i);
  });
});
```

`src/lib/progress.test.ts`:

```ts
import { clearProgress, loadProgress, saveDrillProgress, saveQuizScore } from "./progress";

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k) => (map.has(k) ? map.get(k)! : null),
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
    key: (i) => [...map.keys()][i] ?? null,
  };
}

describe("progress", () => {
  it("returns empty state for corrupt JSON", () => {
    const storage = memoryStorage();
    storage.setItem("pac-trainer-progress-v1", "{not-json");
    expect(loadProgress(storage).recentDrills).toEqual([]);
  });

  it("saves drills and quiz scores and tracks frameworks", () => {
    const storage = memoryStorage();
    saveDrillProgress(
      {
        controlId: "AC-2",
        title: "Account Management",
        frameworkIds: ["nist-800-53"],
        at: "2026-08-04T00:00:00.000Z",
      },
      storage,
    );
    const next = saveQuizScore(
      {
        controlId: "AC-2",
        score: 4,
        total: 5,
        at: "2026-08-04T00:01:00.000Z",
      },
      storage,
    );
    expect(next.recentDrills[0].controlId).toBe("AC-2");
    expect(next.quizScores[0].score).toBe(4);
    expect(next.frameworksPracticed).toContain("nist-800-53");
    clearProgress(storage);
    expect(loadProgress(storage).quizScores).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test -- src/lib/mock-evaluator.test.ts src/lib/progress.test.ts
```

- [ ] **Step 3: Implement modules**

`src/lib/mock-evaluator.ts`:

```ts
import type { EvalFixture } from "@/types/domain";

export interface EvaluationResult {
  scenarioId: string;
  passed: boolean;
  expected: "allow" | "deny";
  explanation: string;
  matchedClause: string;
}

export function evaluateScenario(
  scenarios: EvalFixture["scenarios"],
  scenarioId: string,
  userChoice: "allow" | "deny",
): EvaluationResult {
  const scenario = scenarios.find((s) => s.id === scenarioId);
  if (!scenario) {
    throw new Error(`Unknown scenario: ${scenarioId}`);
  }
  return {
    scenarioId,
    passed: userChoice === scenario.expected,
    expected: scenario.expected,
    explanation: scenario.explanation,
    matchedClause: scenario.matchedClause,
  };
}
```

`src/lib/progress.ts` — implement `loadProgress` with try/catch JSON parse → empty state; cap `recentDrills` at 10 newest-first; merge `frameworksPracticed` uniquely; `clearProgress` removes the key and returns empty state.

Empty state constant:

```ts
const EMPTY: ProgressState = {
  recentDrills: [],
  quizScores: [],
  frameworksPracticed: [],
};
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test -- src/lib/mock-evaluator.test.ts src/lib/progress.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/mock-evaluator.ts src/lib/mock-evaluator.test.ts src/lib/progress.ts src/lib/progress.test.ts
git commit -m "feat: add mock evaluator and localStorage progress store"
```

---

### Task 5: Catalog page UI

**Files:**
- Create: `src/components/catalog/FrameworkSidebar.tsx`
- Create: `src/components/catalog/CategoryBrowse.tsx`
- Create: `src/components/catalog/CatalogHeader.tsx`
- Create: `src/components/catalog/ProgressStrip.tsx`
- Create: `src/pages/CatalogPage.tsx`
- Create: `src/hooks/useProgress.ts`
- Create: `src/hooks/useDrillSelection.ts`
- Modify: `src/App.tsx`
- Test: `src/pages/CatalogPage.test.tsx`

**Interfaces:**
- Consumes: `listCategoriesForFrameworks`, `listControlsForSelection`, `generateDrill`, `loadProgress`
- Produces: Catalog UI that sets selection state and navigates to drill via in-app state (no react-router required for v1 — `App` holds `view: "catalog" | "drill"` and optional `Drill`)

```ts
// useDrillSelection
export interface DrillSelection {
  frameworkIds: FrameworkId[];
  mode: "random" | "category";
  categoryId?: string;
  toggleFramework(id: FrameworkId): void;
  setMode(mode: "random" | "category"): void;
  setCategoryId(id: string | undefined): void;
}
```

- [ ] **Step 1: Write Catalog smoke test**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CatalogPage } from "./CatalogPage";

describe("CatalogPage", () => {
  it("requires a framework before starting a drill", async () => {
    const onStart = vi.fn();
    render(<CatalogPage onStartDrill={onStart} />);
    expect(screen.getByRole("button", { name: /start drill/i })).toBeDisabled();
    await userEvent.click(screen.getByRole("checkbox", { name: /nist/i }));
    expect(screen.getByRole("button", { name: /start drill/i })).toBeEnabled();
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm test -- src/pages/CatalogPage.test.tsx
```

- [ ] **Step 3: Implement catalog components**

Layout rules:
- `CatalogHeader`: brand-level “Policy-as-Code Trainer” (orange display font) + one short supporting sentence
- `FrameworkSidebar`: checkbox list of all frameworks; selected state uses orange accent
- `CategoryBrowse`: shows categories for selected frameworks; empty state via shadcn `Empty` when none selected or no matches; mode toggle Random vs Select category (`ToggleGroup`); when Select category, highlight chosen category
- `ProgressStrip`: recent drills + quiz scores + Clear progress button
- `CatalogPage`: composes the above in a sidebar layout (`flex`); Start drill calls `generateDrill` and `onStartDrill(drill)`; on generator error show `Alert`

Mobile: below `md`, stack sidebar above browse (`flex-col`).

Use `gap-*` (not `space-y-*`). Prefer shadcn `Button`, `Checkbox`, `ToggleGroup`, `Badge`, `Separator`, `Empty`, `Alert`.

- [ ] **Step 4: Wire `App.tsx` view state**

```tsx
const [view, setView] = useState<"catalog" | "drill">("catalog");
const [drill, setDrill] = useState<Drill | null>(null);
```

Catalog `onStartDrill` saves progress entry (without score yet), sets drill, switches view.

- [ ] **Step 5: Run tests — expect PASS**

```bash
npm test -- src/pages/CatalogPage.test.tsx
```

- [ ] **Step 6: Commit**

```bash
git add src/components/catalog src/pages/CatalogPage.tsx src/pages/CatalogPage.test.tsx src/hooks src/App.tsx
git commit -m "feat: add catalog browse UI with framework sidebar"
```

---

### Task 6: Drill view — statement, Rego, evidence, evaluate, quiz

**Files:**
- Create: `src/components/drill/DrillHeader.tsx`
- Create: `src/components/drill/StatementPanel.tsx`
- Create: `src/components/drill/RegoPanel.tsx`
- Create: `src/components/drill/EvidencePanel.tsx`
- Create: `src/components/drill/EvaluatePanel.tsx`
- Create: `src/components/drill/QuizPanel.tsx`
- Create: `src/components/drill/DrillView.tsx`
- Create: `src/pages/DrillPage.tsx`
- Test: `src/pages/DrillPage.test.tsx`

**Interfaces:**
- Consumes: `Drill`, `evaluateScenario`, `saveQuizScore`
- Produces: full drill experience; `onBack()` to catalog

- [ ] **Step 1: Write DrillPage tests**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { generateDrill } from "@/lib/generator";
import { DrillPage } from "./DrillPage";

const drill = generateDrill({
  frameworkIds: ["nist-800-53"],
  mode: "random",
  random: () => 0,
  now: new Date("2026-08-04T12:00:00Z"),
});

describe("DrillPage", () => {
  it("shows statement and rego side by side", () => {
    render(<DrillPage drill={drill} onBack={() => {}} />);
    expect(screen.getByText(drill.control.title)).toBeInTheDocument();
    expect(screen.getByText(/package/i)).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /control statement/i })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /policy as code/i })).toBeInTheDocument();
  });

  it("evaluates a scenario choice", async () => {
    render(<DrillPage drill={drill} onBack={() => {}} />);
    await userEvent.click(screen.getByRole("tab", { name: /evaluate/i }));
    const scenarioButton = screen.getByRole("button", {
      name: new RegExp(drill.scenarios[0].name, "i"),
    });
    await userEvent.click(scenarioButton);
    await userEvent.click(screen.getByRole("button", { name: /^deny$/i }));
    expect(screen.getByText(/matched clause/i)).toBeInTheDocument();
  });
});
```

Adjust selectors to match implemented accessible names if needed — keep roles/labels explicit in components.

- [ ] **Step 2: Run — expect FAIL**

```bash
npm test -- src/pages/DrillPage.test.tsx
```

- [ ] **Step 3: Implement drill components**

`DrillView` structure:
- Header with control id/title, framework badges, category, Back to catalog
- Grid `md:grid-cols-2` for Statement + Rego
- `RegoPanel` uses `code-surface` class; show annotations as a list under the code
- Below: shadcn `Accordion` or `Tabs` for Evidence / Evaluate / Quiz — default value `evidence`
- Keep split visible while switching secondary panels

`EvaluatePanel`:
- List scenarios
- User picks Allow or Deny
- Call `evaluateScenario` and show passed/failed, explanation, matched clause

`QuizPanel`:
- Show questions one-at-a-time or as a short list
- On submit/finish: compute score, call `saveQuizScore`, toast via `sonner`
- Immediate per-question feedback (correct/incorrect + explanation)

Motion (CSS):
- `transition-colors` on sidebar/framework selection (catalog)
- `animate-in fade-in` or short `@keyframes` for drill enter
- Quiz feedback: brief scale/opacity pulse class

- [ ] **Step 4: Wire DrillPage into App**

When `view === "drill" && drill`, render `DrillPage`.

- [ ] **Step 5: Run full test suite**

```bash
npm test
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/drill src/pages/DrillPage.tsx src/pages/DrillPage.test.tsx src/App.tsx
git commit -m "feat: add split drill view with evidence, evaluate, and quiz"
```

---

### Task 7: Polish empty/error states, README, and GitHub Pages deploy

**Files:**
- Modify: `README.md`
- Create/Modify: `.github/workflows/deploy.yml`
- Modify: edge-case copy in catalog/drill as needed
- Test: manual build path check script or assert in existing tests

**Interfaces:**
- Consumes: completed app
- Produces: documented install/dev/deploy; CI deploy workflow

- [ ] **Step 1: Add GitHub Pages workflow**

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Update README**

Include:
- What the app is
- Local dev: `npm install`, `npm run dev`, `npm test`, `npm run build`
- GitHub Pages setup: enable Pages from GitHub Actions; site at `https://<user>.github.io/grceng-policy-as-code-trainer/`
- Theme note and frameworks covered
- Link to design spec

- [ ] **Step 3: Verify edge cases in UI**

- No frameworks selected → Start disabled + helper text
- Impossible category → Empty state suggesting Random or other frameworks
- Clear progress works
- `npm run build` output references `/grceng-policy-as-code-trainer/`

```bash
npm run build
grep -R "grceng-policy-as-code-trainer" dist/index.html
```

Expected: base path present in built `index.html`.

- [ ] **Step 4: Full verification**

```bash
npm test
npm run build
```

Expected: all tests pass; build succeeds.

- [ ] **Step 5: Commit**

```bash
git add README.md .github/workflows/deploy.yml src
git commit -m "chore: add Pages deploy workflow and project README"
```

---

## Spec coverage checklist

| Spec requirement | Task |
| --- | --- |
| Vite/React/shadcn + black/orange/white theme + light code blocks | Task 1, 6 |
| Catalog sidebar browse | Task 5 |
| Random or select category | Task 3, 5 |
| Split statement + Rego | Task 6 |
| Evidence / Evaluate / Quiz secondary panels | Task 6 |
| Client-side generator from JSON templates | Task 2, 3 |
| Mock evaluator (not OPA) | Task 4, 6 |
| Quiz + localStorage progress | Task 4, 5, 6 |
| All listed frameworks, light coverage | Task 2 |
| Mobile stacking | Task 5, 6 |
| GitHub Pages base path + Actions deploy | Task 1, 7 |
| Unit tests for generator + evaluator | Task 3, 4 |
| Component smoke tests | Task 5, 6 |
| Clear progress / corrupt storage safety | Task 4, 5 |

## Plan self-review notes

- No TBD/TODO placeholders remain in tasks.
- Interface names are consistent: `generateDrill`, `evaluateScenario`, `loadProgress`, `Drill`, `FrameworkId`.
- Evidence window uses injectable `now` for deterministic tests.
- v1 intentionally omits react-router; App view state is enough for Pages hosting.

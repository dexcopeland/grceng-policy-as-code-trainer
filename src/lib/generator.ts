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

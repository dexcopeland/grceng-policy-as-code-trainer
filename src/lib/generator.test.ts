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

  it("generates a random drill when category metadata has control gaps", () => {
    const drill = generateDrill({
      frameworkIds: ["scf"],
      mode: "random",
      now: new Date("2026-08-04T12:00:00Z"),
      random: () => 0.5,
    });

    expect(drill.control.id).toBe("IAC-01");
    expect(drill.category.id).toBe(drill.control.categoryId);
    expect(
      drill.control.frameworkId === "scf" ||
        drill.control.relatedFrameworkIds?.includes("scf"),
    ).toBe(true);
  });

  it("throws when category mode is missing a category", () => {
    expect(() =>
      generateDrill({
        frameworkIds: ["nist-800-53"],
        mode: "category",
        random: () => 0,
      }),
    ).toThrow(/category/i);
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
    expect(drill.rego).toContain("import rego.v1");
    expect(drill.rego).toMatch(/allow if \{/);
    expect(drill.rego).toMatch(/deny contains msg if \{/);
    expect(drill.evidence.query).toMatch(/2026/);
    expect(drill.scenarios.length).toBeGreaterThanOrEqual(2);
    expect(drill.quiz.length).toBeGreaterThanOrEqual(3);
  });

  it("returns empty control list for impossible filters", () => {
    expect(listControlsForSelection(["nist-800-53"], "__none__")).toEqual([]);
  });
});

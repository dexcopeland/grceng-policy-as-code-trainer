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

    expect(drill.category.id).toBe(drill.control.categoryId);
    expect(
      drill.control.frameworkId === "scf" ||
        drill.control.relatedFrameworkIds?.includes("scf"),
    ).toBe(true);
    expect(drill.statement.length).toBeGreaterThan(20);
    expect(drill.rego).toContain("import rego.v1");
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

  it("generates NIST drills for configuration management and system integrity", () => {
    for (const categoryId of ["configuration-management", "system-integrity"]) {
      const drill = generateDrill({
        frameworkIds: ["nist-800-53"],
        mode: "category",
        categoryId,
        now: new Date("2026-08-04T12:00:00Z"),
        random: () => 0,
      });
      expect(drill.control.frameworkId).toBe("nist-800-53");
      expect(drill.control.categoryId).toBe(categoryId);
      expect(drill.rego).toContain("import rego.v1");
      expect(drill.scenarios.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("lists multiple primary NIST controls for access control", () => {
    const pool = listControlsForSelection(["nist-800-53"], "access-control");
    const primary = pool.filter((c) => c.frameworkId === "nist-800-53");
    expect(primary.map((c) => c.id).sort()).toEqual(
      expect.arrayContaining(["AC-2", "AC-3"]),
    );
  });

  it("generates drills for previously empty thin-framework category cells", () => {
    const cases: Array<{
      frameworkId: "scf" | "cis" | "fedramp-rev5" | "fedramp-20x" | "cmmc";
      categoryId: string;
      controlId: string;
    }> = [
      {
        frameworkId: "scf",
        categoryId: "configuration-management",
        controlId: "CFG-01",
      },
      {
        frameworkId: "scf",
        categoryId: "audit-accountability",
        controlId: "MON-01",
      },
      { frameworkId: "cis", categoryId: "identity-access", controlId: "CIS-5.1" },
      {
        frameworkId: "fedramp-rev5",
        categoryId: "access-control",
        controlId: "AC-6",
      },
      {
        frameworkId: "fedramp-20x",
        categoryId: "identity-access",
        controlId: "FR20X-IA-01",
      },
      {
        frameworkId: "cmmc",
        categoryId: "identity-access",
        controlId: "IA.L2-3.5.1",
      },
    ];

    for (const testCase of cases) {
      const pool = listControlsForSelection(
        [testCase.frameworkId],
        testCase.categoryId,
      );
      expect(pool.map((c) => c.id)).toEqual(
        expect.arrayContaining([testCase.controlId]),
      );

      const drill = generateDrill({
        frameworkIds: [testCase.frameworkId],
        mode: "category",
        categoryId: testCase.categoryId,
        now: new Date("2026-08-04T12:00:00Z"),
        random: () => 0,
      });
      expect(drill.control.categoryId).toBe(testCase.categoryId);
      expect(drill.rego).toContain("import rego.v1");
      expect(drill.scenarios.length).toBeGreaterThanOrEqual(2);
    }
  });
});

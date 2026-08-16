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
    expect(drill.flow.familyId).toBe(drill.control.templateId);
    expect(drill.flow.steps.length).toBeGreaterThanOrEqual(4);
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

  it("generates a CMMC IA.L2-3.5.1 drill about subjects, not access reviews", () => {
    const drill = generateDrill({
      frameworkIds: ["cmmc"],
      mode: "category",
      categoryId: "identity-access",
      now: new Date("2026-08-04T12:00:00Z"),
      random: () => 0,
    });

    expect(drill.control.id).toBe("IA.L2-3.5.1");
    expect(drill.rego).toMatch(/users_identified|processes_identified|devices_identified/);
    expect(drill.rego).not.toMatch(/last_review_days/);
    expect(drill.statement.toLowerCase()).toMatch(/users|processes|devices/);
  });

  it("attaches the family flow for access-enforcement and account-management", () => {
    const access = generateDrill({
      frameworkIds: ["fedramp-rev5"],
      mode: "category",
      categoryId: "access-control",
      now: new Date("2026-08-04T12:00:00Z"),
      random: () => 0,
    });
    expect(access.control.templateId).toBe("access-enforcement");
    expect(access.flow.topology).toBe("request-time");
    expect(access.flow.nodes.some((n) => n.id === "pep")).toBe(true);
    expect(access.flow.edges.some((e) => e.kind === "decision")).toBe(true);

    const account = generateDrill({
      frameworkIds: ["cis"],
      mode: "category",
      categoryId: "identity-access",
      now: new Date("2026-08-04T12:00:00Z"),
      random: () => 0,
    });
    expect(account.control.templateId).toBe("account-management");
    expect(account.flow.topology).toBe("periodic-review");
    expect(account.flow.nodes.some((n) => n.id === "pep")).toBe(false);
    expect(account.flow.nodes.some((n) => n.id === "review-job")).toBe(true);
  });
});

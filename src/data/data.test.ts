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

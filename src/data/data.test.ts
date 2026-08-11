import { categories, controls, fixtures, frameworks, templates } from "./index";
import type { FrameworkId } from "@/types/domain";

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

  it("uses unique control ids", () => {
    const ids = controls.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("provides light coverage: at least 3 categories and 8 controls total", () => {
    expect(categories.length).toBeGreaterThanOrEqual(3);
    expect(controls.length).toBeGreaterThanOrEqual(8);
  });

  it("covers NIST SP 800-53 with primary controls across core families", () => {
    const nistPrimary = controls.filter((c) => c.frameworkId === "nist-800-53");
    const nistIds = nistPrimary.map((c) => c.id).sort();

    expect(nistPrimary.length).toBeGreaterThanOrEqual(6);
    expect(nistIds).toEqual(
      expect.arrayContaining(["AC-2", "AC-3", "AU-12", "CM-2", "IA-2", "SC-7", "SI-2"]),
    );

    const families = new Set(nistPrimary.map((c) => c.id.split("-")[0]));
    for (const family of ["AC", "AU", "CM", "IA", "SC", "SI"]) {
      expect(families.has(family)).toBe(true);
    }
  });

  it("maps AU-12 to an audit-record-generation template, not generic logging", () => {
    const au12 = controls.find((c) => c.id === "AU-12");
    expect(au12?.templateId).toBe("audit-record-generation");
    expect(au12?.fixtureFamilyId).toBe("audit-record-generation");

    const template = templates.find((t) => t.id === "audit-record-generation");
    expect(template).toBeDefined();
    expect(template?.regoTemplate).toMatch(/records_generated|content_complete|events_defined/);
    expect(template?.regoTemplate).not.toMatch(/retention_days/);
    expect(template?.statementTemplate.toLowerCase()).toMatch(/record/);
  });

  it("allows critical findings that remain within the remediation SLA", () => {
    const template = templates.find((t) => t.id === "flaw-remediation");
    expect(template).toBeDefined();

    const withinSlaAllow =
      /allow if \{\s*input\.finding\.tracked\s*input\.finding\.severity == "critical"\s*input\.finding\.age_days <= 15\s*\}/;
    expect(template?.regoTemplate.replace(/\n/g, " ")).toMatch(withinSlaAllow);
    expect(template?.regoTemplate).not.toMatch(
      /severity == "critical"\s*\n\s*input\.finding\.age_days <= 15\s*\n\s*input\.finding\.remediated/,
    );

    const fixture = fixtures.find((f) => f.familyId === "flaw-remediation");
    const openWithinSla = fixture?.scenarios.find(
      (s) =>
        (s.facts.finding as { age_days?: number; remediated?: boolean })
          ?.age_days === 7 &&
        (s.facts.finding as { remediated?: boolean })?.remediated === false,
    );
    expect(openWithinSla?.expected).toBe("allow");
  });

  it("gives every NIST-tagged category at least one matching control", () => {
    const frameworkId: FrameworkId = "nist-800-53";
    const nistCategories = categories.filter((c) =>
      c.frameworkIds.includes(frameworkId),
    );

    expect(nistCategories.length).toBeGreaterThanOrEqual(5);

    for (const category of nistCategories) {
      const match = controls.some(
        (control) =>
          control.categoryId === category.id &&
          (control.frameworkId === frameworkId ||
            (control.relatedFrameworkIds ?? []).includes(frameworkId)),
      );
      expect(match, `expected a NIST-visible control in ${category.id}`).toBe(
        true,
      );
    }
  });

  it("pairs every template with a fixture family and quiz seeds", () => {
    const fixtureIds = new Set(fixtures.map((f) => f.familyId));
    for (const template of templates) {
      expect(fixtureIds.has(template.id)).toBe(true);
      expect(template.quizSeeds.length).toBeGreaterThanOrEqual(3);
      expect(template.regoTemplate).toContain("import rego.v1");
    }
    for (const fixture of fixtures) {
      expect(fixture.scenarios.length).toBeGreaterThanOrEqual(2);
      expect(fixture.scenarios.some((s) => s.expected === "allow")).toBe(true);
      expect(fixture.scenarios.some((s) => s.expected === "deny")).toBe(true);
    }
  });
});

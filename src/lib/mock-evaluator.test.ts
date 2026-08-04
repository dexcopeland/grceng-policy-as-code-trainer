import { evaluateScenario } from "./mock-evaluator";

const scenarios = [
  {
    id: "missing-owner",
    name: "Active account, no owner",
    facts: { account: { active: true, owner: null } },
    expected: "deny" as const,
    explanation: "Active accounts require an owner.",
    matchedClause: "deny contains msg if active and not owner",
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

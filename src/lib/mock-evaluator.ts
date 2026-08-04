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

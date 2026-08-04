import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  evaluateScenario,
  type EvaluationResult,
} from "@/lib/mock-evaluator";
import type { Drill } from "@/types/domain";

interface EvaluatePanelProps {
  drill: Drill;
}

type EvaluationChoice = "allow" | "deny";

export function EvaluatePanel({ drill }: EvaluatePanelProps) {
  const [selectedScenarioId, setSelectedScenarioId] = useState(
    drill.scenarios[0]?.id ?? "",
  );
  const [result, setResult] = useState<EvaluationResult | null>(null);

  const selectedScenario = useMemo(
    () =>
      drill.scenarios.find((scenario) => scenario.id === selectedScenarioId) ??
      drill.scenarios[0],
    [drill.scenarios, selectedScenarioId],
  );

  function handleSelectScenario(scenarioId: string) {
    setSelectedScenarioId(scenarioId);
    setResult(null);
  }

  function handleEvaluate(choice: EvaluationChoice) {
    if (!selectedScenario) return;
    setResult(evaluateScenario(drill.scenarios, selectedScenario.id, choice));
  }

  return (
    <section aria-label="Evaluate scenarios" className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-primary">Evaluate</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Pick a scenario, decide whether the facts should allow or deny, then
          compare your answer to the mock evaluator.
        </p>
      </div>
      <Separator />
      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]">
        <div
          className="flex min-w-0 flex-col gap-3"
          aria-label="Scenario choices"
        >
          {drill.scenarios.map((scenario) => {
            const selected = scenario.id === selectedScenario?.id;
            return (
              <Button
                key={scenario.id}
                type="button"
                variant="outline"
                aria-pressed={selected}
                onClick={() => handleSelectScenario(scenario.id)}
                className="h-auto w-full min-w-0 shrink justify-start overflow-hidden rounded-xl border-border bg-background/40 p-4 text-left whitespace-normal hover:border-primary/70 hover:bg-primary/5 aria-pressed:border-primary aria-pressed:bg-primary/10"
              >
                <span className="flex min-w-0 flex-col gap-2">
                  <span className="break-words font-semibold text-foreground">
                    {scenario.name}
                  </span>
                  <span className="text-xs leading-5 text-muted-foreground uppercase tracking-[0.16em]">
                    Expected output hidden until you answer
                  </span>
                </span>
              </Button>
            );
          })}
        </div>

        {selectedScenario ? (
          <div className="flex min-w-0 flex-col gap-4 overflow-hidden rounded-xl border border-border bg-background/40 p-4">
            <div className="flex min-w-0 flex-col gap-2">
              <h3 className="break-words text-lg font-semibold text-primary">
                {selectedScenario.name}
              </h3>
              <div className="code-surface min-w-0 overflow-x-auto rounded-lg border border-primary/30">
                <pre className="m-0 w-max min-w-full p-3 text-xs leading-6">
                  <code>
                    {JSON.stringify(selectedScenario.facts, null, 2)}
                  </code>
                </pre>
              </div>
            </div>
            <div className="flex flex-wrap gap-3" aria-label="Evaluation answer">
              <Button
                type="button"
                onClick={() => handleEvaluate("allow")}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Allow
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleEvaluate("deny")}
                className="border-primary/50 text-primary hover:bg-primary/10 hover:text-primary"
              >
                Deny
              </Button>
            </div>

            {result ? (
              <div className="animate-in fade-in zoom-in-95 flex flex-col gap-3 rounded-xl border border-primary/40 bg-card/80 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    className={
                      result.passed
                        ? "bg-primary text-primary-foreground"
                        : "bg-destructive/20 text-destructive"
                    }
                  >
                    {result.passed ? "Passed" : "Needs review"}
                  </Badge>
                  <Badge variant="outline">
                    Expected {result.expected.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm leading-6 text-foreground">
                  {result.explanation}
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  <span className="font-semibold text-primary">
                    Matched clause:
                  </span>{" "}
                  {result.matchedClause}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
